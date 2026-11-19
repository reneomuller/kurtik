"use server";

import { redirect } from "next/navigation";
import { createBooking } from "@/lib/bookings";
import { parseSlot, slotQuery } from "@/lib/slot";
import { getPragueNow, isBookableSlot } from "@/lib/time";

// Same limits as the kurtik_bookings table in supabase/schema.sql.
const NAME_MIN = 2;
const NAME_MAX = 80;
const EMAIL_MAX = 254;
const PHONE_MAX = 30;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type BookingFormState = {
  errors: { slot?: string; name?: string; email?: string; phone?: string };
  values: { name: string; email: string; phone: string };
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function bookSlot(
  _previous: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const slot = parseSlot(formData.get("kurt"), formData.get("den"), formData.get("cas"));
  const values = {
    name: readText(formData, "name"),
    email: readText(formData, "email"),
    phone: readText(formData, "phone"),
  };
  const errors: BookingFormState["errors"] = {};

  if (!slot || !isBookableSlot(slot.date, slot.time, getPragueNow())) {
    errors.slot = "Tento termín už nejde rezervovat. Vyberte prosím jiný.";
  }

  const nameLength = Array.from(values.name).length;
  if (nameLength === 0) {
    errors.name = "Vyplňte prosím jméno nebo přezdívku.";
  } else if (nameLength < NAME_MIN) {
    errors.name = `Jméno musí mít aspoň ${NAME_MIN} znaky.`;
  } else if (nameLength > NAME_MAX) {
    errors.name = `Jméno může mít nejvýš ${NAME_MAX} znaků.`;
  }

  if (values.email === "") {
    errors.email = "Vyplňte prosím e-mail.";
  } else if (values.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(values.email)) {
    errors.email = "Zkontrolujte e-mail, má vypadat třeba jako jana@example.com.";
  }

  if (values.phone.length > PHONE_MAX) {
    errors.phone = `Telefon může mít nejvýš ${PHONE_MAX} znaků.`;
  }

  if (!slot || Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await createBooking({
    ...slot,
    name: values.name,
    email: values.email,
    phone: values.phone || null,
  });
  redirect(`/rezervace/hotovo?${slotQuery(slot)}`);
}
