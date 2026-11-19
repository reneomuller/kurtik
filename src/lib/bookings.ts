import type { Slot } from './slot';
import { getSupabase } from './supabase';

export type NewBooking = Slot & { name: string; email: string; phone: string | null };

// Without Supabase keys the app runs in demo mode with data kept in server memory.
export function isDemoMode(): boolean {
  return getSupabase() === null;
}

// Row shape returned by rpc('kurtik_taken_slots'); start_time comes back as '18:00:00'.
type TakenSlotRow = { court: number; slot_date: string; start_time: string };

export async function getTakenSlots(date: string): Promise<Slot[]> {
  const supabase = getSupabase();
  if (!supabase) return getDemoTakenSlots(date);

  const { data, error } = await supabase.rpc('kurtik_taken_slots').eq('slot_date', date);
  if (error) {
    console.error('Loading taken slots failed, code:', error.code || 'unknown');
    throw new Error('Loading taken slots failed');
  }
  return ((data ?? []) as TakenSlotRow[]).map((row) => ({
    court: row.court,
    date: row.slot_date,
    time: row.start_time.slice(0, 5),
  }));
}

// Taken slots for several consecutive days in one RPC call (the day picker shows free counts).
export async function getTakenSlotsForDays(days: string[]): Promise<Slot[]> {
  if (days.length === 0) return [];
  const supabase = getSupabase();
  if (!supabase) return days.flatMap(getDemoTakenSlots);

  const { data, error } = await supabase
    .rpc('kurtik_taken_slots')
    .gte('slot_date', days[0])
    .lte('slot_date', days[days.length - 1]);
  if (error) {
    console.error('Loading taken slots failed, code:', error.code || 'unknown');
    throw new Error('Loading taken slots failed');
  }
  return ((data ?? []) as TakenSlotRow[])
    .map((row) => ({
      court: row.court,
      date: row.slot_date,
      time: row.start_time.slice(0, 5),
    }))
    .filter((slot) => days.includes(slot.date));
}

// 'taken': someone else booked the slot first (one booking per slot, first one wins).
export type CreateBookingResult = 'saved' | 'taken' | 'failed';

// Postgres unique_violation, raised by the bookings_one_per_slot constraint.
const UNIQUE_VIOLATION = '23505';

export async function createBooking(booking: NewBooking): Promise<CreateBookingResult> {
  const supabase = getSupabase();
  if (!supabase) {
    const isTaken = getDemoTakenSlots(booking.date).some(
      (slot) => slot.court === booking.court && slot.time === booking.time,
    );
    if (isTaken) return 'taken';
    demoBookings().push({ court: booking.court, date: booking.date, time: booking.time });
    return 'saved';
  }

  // No .select() after insert: the public role may insert but not read bookings.
  const { error } = await supabase.from('kurtik_bookings').insert({
    court: booking.court,
    slot_date: booking.date,
    start_time: booking.time,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
  });
  if (error?.code === UNIQUE_VIOLATION) return 'taken';
  if (error) {
    console.error('Saving booking failed, code:', error.code || 'unknown');
    return 'failed';
  }
  return 'saved';
}

// Demo data: taken every day in demo mode.
const DEMO_DAILY_TAKEN = [
  { court: 1, time: '18:00' },
  { court: 2, time: '19:00' },
  { court: 3, time: '08:00' },
];

// Kept on globalThis so every route shares it and it survives dev reloads.
const demoStore = globalThis as typeof globalThis & { kurtikDemoBookings?: Slot[] };

function demoBookings(): Slot[] {
  demoStore.kurtikDemoBookings ??= [];
  return demoStore.kurtikDemoBookings;
}

function getDemoTakenSlots(date: string): Slot[] {
  const daily = DEMO_DAILY_TAKEN.map((slot) => ({ ...slot, date }));
  const booked = demoBookings().filter((slot) => slot.date === date);
  return [...daily, ...booked];
}
