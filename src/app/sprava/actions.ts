"use server";

import { getAdminMode, isCorrectPin, startAdminSession } from "@/lib/admin";

export type PinFormState = { error: string | null };

// Setting the cookie makes Next.js re-render /sprava, which then shows the bookings.
export async function logIn(_previous: PinFormState, formData: FormData): Promise<PinFormState> {
  if (getAdminMode() === "unconfigured") {
    return { error: "Správa není nastavená." };
  }
  const pin = formData.get("pin");
  if (typeof pin !== "string" || !isCorrectPin(pin.trim())) {
    return { error: "Nesprávný PIN." };
  }
  await startAdminSession();
  return { error: null };
}
