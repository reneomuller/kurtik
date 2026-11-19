"use client";

import { useActionState } from "react";
import { logIn, type PinFormState } from "./actions";

const initialState: PinFormState = { error: null };

export function PinForm() {
  const [state, formAction, pending] = useActionState(logIn, initialState);

  return (
    <form action={formAction} noValidate className="mt-6 space-y-4">
      <div>
        <label htmlFor="pin" className="block font-medium">
          PIN správce
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "pin-error" : undefined}
          className={`mt-1 block min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-base text-ink ${
            state.error ? "border-clay" : "border-line"
          }`}
        />
        {state.error && (
          <p id="pin-error" role="alert" className="mt-1 text-sm font-medium text-clay">
            {state.error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-clay px-4 font-semibold text-white hover:bg-clay/90 disabled:opacity-60"
      >
        Přihlásit se
      </button>
    </form>
  );
}
