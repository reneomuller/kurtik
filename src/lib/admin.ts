import { createHash, createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getTakenSlots, isDemoMode } from './bookings';
import type { Slot } from './slot';

// Teaching-grade protection only: one shared PIN, no user accounts.
// This app has no Supabase secret key (the Supabase project is shared), so the admin page
// shows only which of today's slots are taken: the same data as the public grid, no names.
// Names and e-mails are visible only to the club admin in the Supabase dashboard.

// 'demo': the whole app runs without public Supabase keys, so the admin page uses sample data.
// 'unconfigured': public keys are set, but ADMIN_PIN is missing.
export type AdminMode = 'demo' | 'ready' | 'unconfigured';

export const DEMO_PIN = '1234';

export function getAdminMode(): AdminMode {
  if (isDemoMode()) return 'demo';
  return process.env.ADMIN_PIN ? 'ready' : 'unconfigured';
}

function getPin(): string | null {
  const mode = getAdminMode();
  if (mode === 'demo') return DEMO_PIN;
  return mode === 'ready' ? (process.env.ADMIN_PIN ?? null) : null;
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

// Hashing first gives equal lengths, so the comparison time doesn't reveal the PIN.
export function isCorrectPin(pin: string): boolean {
  const expected = getPin();
  return expected !== null && timingSafeEqual(sha256(pin), sha256(expected));
}

// Cookies are signed with a key derived from the PIN by scrypt, which is slow on purpose:
// a signed cookie can't be used to guess the PIN offline. Changing ADMIN_PIN logs everyone out.
let signingKey: { pin: string; key: Buffer } | undefined;

function getSigningKey(): Buffer | null {
  const pin = getPin();
  if (pin === null) return null;
  if (signingKey?.pin !== pin) {
    const key = scryptSync(pin, 'kurtik-admin-cookie', 32, {
      N: 2 ** 15,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });
    signingKey = { pin, key };
  }
  return signingKey.key;
}

function sign(value: string, key: Buffer): string {
  return createHmac('sha256', key).update(value).digest('base64url');
}

// Session cookie: '<expiry ms>.<HMAC>'.
const SESSION_COOKIE = 'kurtik_admin';
const SESSION_SECONDS = 8 * 60 * 60;

// Call only from a Server Action, after isCorrectPin().
export async function startAdminSession(): Promise<void> {
  const key = getSigningKey();
  if (!key) return;
  const expiresAt = String(Date.now() + SESSION_SECONDS * 1000);
  (await cookies()).set(SESSION_COOKIE, `${expiresAt}.${sign(expiresAt, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/sprava',
    maxAge: SESSION_SECONDS,
  });
}

export async function hasAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const key = token ? getSigningKey() : null;
  if (!key || !token) return false;

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !(Number(expiresAt) > Date.now())) return false;
  const expected = Buffer.from(sign(expiresAt, key));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Cookie-based lockout against PIN guessing: '<fails>.<lockedUntil ms>.<HMAC>'.
// No account/IP tracking (teaching-grade), but it stops a plain guessing script.
const ATTEMPTS_COOKIE = 'kurtik_admin_attempts';
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

type PinAttemptState = { fails: number; lockedUntil: number };

async function readPinAttemptState(): Promise<PinAttemptState> {
  const token = (await cookies()).get(ATTEMPTS_COOKIE)?.value;
  const key = token ? getSigningKey() : null;
  if (!key || !token) return { fails: 0, lockedUntil: 0 };

  const [fails, lockedUntil, signature] = token.split('.');
  if (!fails || !lockedUntil || !signature) return { fails: 0, lockedUntil: 0 };
  const expected = Buffer.from(sign(`${fails}.${lockedUntil}`, key));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { fails: 0, lockedUntil: 0 };
  }
  return { fails: Number(fails) || 0, lockedUntil: Number(lockedUntil) || 0 };
}

async function writePinAttemptState(state: PinAttemptState): Promise<void> {
  const key = getSigningKey();
  if (!key) return;
  const value = `${state.fails}.${state.lockedUntil}`;
  (await cookies()).set(ATTEMPTS_COOKIE, `${value}.${sign(value, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/sprava',
    maxAge: LOCKOUT_MINUTES * 60,
  });
}

// 0 when PIN entry is allowed; otherwise the whole minutes left to wait.
export async function getPinLockMinutesLeft(): Promise<number> {
  const { lockedUntil } = await readPinAttemptState();
  return lockedUntil > Date.now() ? Math.ceil((lockedUntil - Date.now()) / 60_000) : 0;
}

// Call after a wrong PIN. Locks out for LOCKOUT_MINUTES once MAX_PIN_ATTEMPTS is reached.
export async function recordFailedPinAttempt(): Promise<void> {
  const state = await readPinAttemptState();
  const fails = state.fails + 1;
  if (fails >= MAX_PIN_ATTEMPTS) {
    await writePinAttemptState({ fails: 0, lockedUntil: Date.now() + LOCKOUT_MINUTES * 60_000 });
  } else {
    await writePinAttemptState({ fails, lockedUntil: 0 });
  }
}

// Call after a correct PIN so a later mistake starts counting from zero again.
export async function clearPinAttempts(): Promise<void> {
  (await cookies()).delete({ name: ATTEMPTS_COOKIE, path: '/sprava' });
}

// Today's taken slots for the admin grid. Never names or e-mails: see the note at the top.
export async function getTakenSlotsForAdmin(date: string): Promise<Slot[]> {
  if (!(await hasAdminSession())) throw new Error('Admin session required');
  return getTakenSlots(date);
}
