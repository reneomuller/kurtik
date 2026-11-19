"use client";

import Link from "next/link";
import { useActionState, type HTMLInputTypeAttribute } from "react";
import { bookSlot, type BookingFormState } from "@/app/rezervace/actions";
import type { Slot } from "@/lib/slot";

const initialState: BookingFormState = {
  errors: {},
  values: { name: "", email: "", phone: "" },
};

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
      <label htmlFor={name} className="block font-medium">
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
        className={`mt-1 block min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-base text-ink ${
          error ? "border-clay" : "border-line"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingForm({ slot }: { slot: Slot }) {
  const [state, formAction, pending] = useActionState(bookSlot, initialState);

  return (
    <form action={formAction} noValidate className="mt-6 space-y-4">
      <input type="hidden" name="kurt" value={slot.court} />
      <input type="hidden" name="den" value={slot.date} />
      <input type="hidden" name="cas" value={slot.time} />

      {state.errors.slot && (
        <p role="alert" className="rounded-xl border border-clay bg-white p-4 font-medium text-clay">
          {state.errors.slot}{" "}
          <Link href="/" className="underline">
            Vybrat jiný termín
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
        <p role="alert" className="rounded-xl border border-clay bg-white p-4 font-medium text-clay">
          {state.errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-clay px-4 font-semibold text-white hover:bg-clay/90 disabled:opacity-60"
      >
        Rezervovat
      </button>
    </form>
  );
}
