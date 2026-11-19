"use client";

import { useActionState } from "react";
import { logIn, type PinFormState } from "./actions";

const initialState: PinFormState = { error: null };

export function PinForm() {
  const [state, formAction, pending] = useActionState(logIn, initialState);

  return (
    <form
      action={formAction}
      noValidate
      className="mt-5 space-y-4 rounded-2xl border border-line bg-card p-4 shadow-card sm:p-6"
    >
      <div>
        <label htmlFor="pin" className="block font-semibold">
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
          className={`mt-1.5 block min-h-12 w-full rounded-xl border bg-white px-3.5 py-2 text-base text-ink focus:outline-none focus-visible:ring-4 ${
            state.error
              ? "border-danger focus-visible:ring-danger/20"
              : "border-line focus-visible:border-green focus-visible:ring-green/20"
          }`}
        />
        {state.error && (
          <p id="pin-error" role="alert" className="mt-1.5 text-sm font-semibold text-danger">
            {state.error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark disabled:opacity-60"
      >
        Přihlásit se
      </button>
    </form>
  );
}
