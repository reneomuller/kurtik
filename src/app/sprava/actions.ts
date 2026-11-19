"use server";

import {
  clearPinAttempts,
  getAdminMode,
  getPinLockMinutesLeft,
  isCorrectPin,
  recordFailedPinAttempt,
  startAdminSession,
} from "@/lib/admin";

export type PinFormState = { error: string | null };

const minutesWord = new Intl.PluralRules("cs-CZ");

/** 1 → 'minutu', 2–4 → 'minuty', 5+ → 'minut' */
function formatMinutes(minutes: number): string {
  const category = minutesWord.select(minutes);
  const word = category === "one" ? "minutu" : category === "few" ? "minuty" : "minut";
  return `${minutes} ${word}`;
}

// Setting the cookie makes Next.js re-render /sprava, which then shows the bookings.
export async function logIn(_previous: PinFormState, formData: FormData): Promise<PinFormState> {
  if (getAdminMode() === "unconfigured") {
    return { error: "Správa není nastavená." };
  }

  const lockedMinutes = await getPinLockMinutesLeft();
  if (lockedMinutes > 0) {
    return { error: `Příliš mnoho pokusů. Zkuste to znovu za ${formatMinutes(lockedMinutes)}.` };
  }

  const pin = formData.get("pin");
  if (typeof pin !== "string" || !isCorrectPin(pin.trim())) {
    await recordFailedPinAttempt();
    return { error: "Nesprávný PIN." };
  }
  await clearPinAttempts();
  await startAdminSession();
  return { error: null };
}
