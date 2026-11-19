"use client";

import Link from "next/link";
import { useActionState, type HTMLInputTypeAttribute } from "react";
import { bookSlot, type BookingFormState } from "@/app/rezervace/actions";
import type { Slot } from "@/lib/slot";

const initialState: BookingFormState = {
  errors: {},
  values: { name: "", email: "", phone: "" },
};

const primaryButton =
  "flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60";

type FieldProps = {
  name: "name" | "email" | "phone";
  label: string;
  type: HTMLInputTypeAttribute;
  autoComplete: string;
  placeholder?: string;
  state: BookingFormState;
};

function Field({ name, label, type, autoComplete, placeholder, state }: FieldProps) {
  const error = state.errors[name];
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="block font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={state.values[name]}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 block min-h-12 w-full rounded-xl border bg-white px-3 py-2 text-base text-ink placeholder:text-[15px] placeholder:text-muted focus:outline-none focus-visible:ring-4 ${
          error
            ? "border-danger focus-visible:ring-danger/20"
            : "border-line focus-visible:border-green focus-visible:ring-green/20"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingForm({ slot }: { slot: Slot }) {
  const [state, formAction, pending] = useActionState(bookSlot, initialState);

  // Someone else got the slot first; the form can no longer succeed.
  if (state.errors.taken) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger-soft p-4 sm:p-6">
        <p role="alert" className="font-semibold text-danger">
          {state.errors.taken}
        </p>
        <Link href={`/?den=${slot.date}`} className={`mt-4 ${primaryButton}`}>
          Zpět na výběr termínů
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-4 rounded-2xl border border-line bg-card p-3.5 shadow-card sm:p-6"
    >
      <h2 className="text-lg font-bold">Vaše údaje</h2>
      <input type="hidden" name="kurt" value={slot.court} />
      <input type="hidden" name="den" value={slot.date} />
      <input type="hidden" name="cas" value={slot.time} />

      {state.errors.slot && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-4 font-semibold text-danger">
          {state.errors.slot}{" "}
          <Link href={`/?den=${slot.date}`} className="underline">
            Zpět na výběr termínů
          </Link>
        </p>
      )}

      <Field
        name="name"
        label="Jméno nebo přezdívka"
        type="text"
        autoComplete="nickname"
        placeholder="Stačí přezdívka"
        state={state}
      />
      <Field
        name="email"
        label="E-mail"
        type="email"
        autoComplete="off"
        placeholder="Stačí vymyšlený: prezdivka@example.com"
        state={state}
      />
      <Field name="phone" label="Telefon (nepovinný)" type="tel" autoComplete="tel" state={state} />

      {state.errors.form && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-4 font-semibold text-danger">
          {state.errors.form}
        </p>
      )}

      <button type="submit" disabled={pending} className={`mt-2 ${primaryButton}`}>
        Rezervovat
      </button>
    </form>
  );
}
