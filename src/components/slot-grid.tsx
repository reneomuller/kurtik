"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { slotQuery } from "@/lib/slot";

// All labels are formatted on the server, so server and browser render the same text.
export type GridTime = {
  time: string; // '18:00'
  label: string; // '18:00'
  range: string; // '18:00–19:00'
  price: string; // '400 Kč'
  evening: boolean;
};

export type GridCourt = { id: number; name: string };

type SlotGridProps = {
  date: string;
  dayLong: string; // 'čtvrtek 19. 11.'
  dayShort: string; // 'čt 19. 11.'
  dayBadge: string | null; // 'dnes', 'zítra'
  freeCount: number;
  times: GridTime[];
  courts: GridCourt[];
  takenKeys: string[]; // '<court> <time>'
  courtInfo: { surface: string; price: string };
  eveningPrice: { price: string; from: string }; // '400 Kč' from '17:00'
  dayPicker: ReactNode;
  info: ReactNode;
};

type Selection = { court: number; time: string };

export function SlotGrid({
  date,
  dayLong,
  dayShort,
  dayBadge,
  freeCount,
  times,
  courts,
  takenKeys,
  courtInfo,
  eveningPrice,
  dayPicker,
  info,
}: SlotGridProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const taken = new Set(takenKeys);

  const selectedCourt = selection ? courts.find((court) => court.id === selection.court) : undefined;
  const selectedTime = selection ? times.find((time) => time.time === selection.time) : undefined;
  const chosen =
    selection && selectedCourt && selectedTime
      ? {
          court: selectedCourt,
          time: selectedTime,
          href: `/rezervace?${slotQuery({ court: selection.court, date, time: selection.time })}`,
        }
      : null;

  function toggle(court: number, time: string) {
    setSelection((current) =>
      current?.court === court && current.time === time ? null : { court, time },
    );
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
        <div className="min-w-0">
          {dayPicker}

          <section
            aria-labelledby="board-title"
            className="mt-4 rounded-2xl border border-line bg-card p-3 shadow-card sm:p-5"
          >
            <div className="px-1 sm:px-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 id="board-title" className="text-xl font-bold tracking-tight">
                  {dayLong}
                </h2>
                {dayBadge && (
                  <span className="rounded-full bg-green-soft px-2.5 py-0.5 text-xs font-semibold text-green-mid">
                    {dayBadge}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted">
                Volné termíny: <strong className="font-semibold text-ink">{freeCount}</strong> · klepněte
                na volný čas
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted" aria-label="Legenda">
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-3.5 rounded border border-green-line bg-green-soft" />
                  Volno
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-3.5 rounded border border-ball-dark bg-ball" />
                  Vybráno
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="slot-taken size-3.5 rounded" />
                  Obsazeno
                </li>
                <li>
                  <span className="font-semibold text-clay">{eveningPrice.price}</span> od {eveningPrice.from}
                </li>
              </ul>
            </div>

            <table className="mt-3 w-full table-fixed border-separate border-spacing-1.5">
              <caption className="sr-only">Volné a obsazené termíny, {dayLong}</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky top-0 z-10 w-12 bg-card">
                    <span className="sr-only">Čas</span>
                  </th>
                  {courts.map((court) => (
                    <th key={court.id} scope="col" className="sticky top-0 z-10 bg-card pb-1 font-normal">
                      <div className="rounded-xl border border-line bg-paper px-1 py-2 text-center">
                        <span className="block text-sm font-bold text-ink">{court.name}</span>
                        <span className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted">
                          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-clay" />
                          {courtInfo.surface}
                        </span>
                        <span className="block text-xs whitespace-nowrap text-muted tabular-nums">{courtInfo.price}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => (
                  <tr key={time.time}>
                    <th
                      scope="row"
                      className="pr-1 text-right align-middle text-sm font-semibold text-ink tabular-nums"
                    >
                      {time.label}
                    </th>
                    {courts.map((court) => {
                      if (taken.has(`${court.id} ${time.time}`)) {
                        return (
                          <td key={court.id}>
                            <div className="slot-taken flex min-h-[52px] items-center justify-center rounded-xl px-1 text-sm font-medium text-taken-ink">
                              Obsazeno
                            </div>
                          </td>
                        );
                      }
                      const isSelected = selection?.court === court.id && selection.time === time.time;
                      return (
                        <td key={court.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            aria-label={`${court.name}, ${time.label}, volno, ${time.price}`}
                            onClick={() => toggle(court.id, time.time)}
                            className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl border px-1 leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
                              isSelected
                                ? "border-ball-dark bg-ball text-ball-ink"
                                : "border-green-line bg-green-soft text-green-mid hover:border-green-mid hover:bg-[#dff0e5]"
                            }`}
                          >
                            <span className="text-sm font-bold">{isSelected ? "✓ Vybráno" : "Volno"}</span>
                            <span
                              className={`mt-0.5 text-xs font-medium tabular-nums ${
                                !isSelected && time.evening ? "text-clay" : ""
                              }`}
                            >
                              {time.price}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Váš výběr">
          <section className="rounded-2xl border border-line bg-card p-5 shadow-card">
            <h2 className="text-xs font-bold tracking-wide text-muted uppercase">Váš výběr</h2>
            {chosen ? (
              <>
                <p className="mt-2 text-2xl font-bold tracking-tight">{chosen.court.name}</p>
                <dl className="mt-2 space-y-1">
                  <div className="flex gap-3">
                    <dt className="w-12 shrink-0 text-muted">Den</dt>
                    <dd>{dayLong}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-12 shrink-0 text-muted">Čas</dt>
                    <dd className="tabular-nums">{chosen.time.range}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-12 shrink-0 text-muted">Cena</dt>
                    <dd>{chosen.time.price}, platíte na místě</dd>
                  </div>
                </dl>
                <Link
                  href={chosen.href}
                  className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Rezervovat
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-muted">Vyberte v mřížce volný čas a kurt.</p>
                <p
                  aria-hidden="true"
                  className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-taken px-4 font-bold text-taken-ink"
                >
                  Rezervovat
                </p>
              </>
            )}
          </section>
          {info}
        </aside>
      </div>

      <p aria-live="polite" className="sr-only">
        {chosen ? `Vybráno: ${chosen.court.name}, ${dayLong}, ${chosen.time.range}, ${chosen.time.price}` : ""}
      </p>

      {chosen && (
        <>
          {/* Room for the fixed bar, so it never covers the last row or the footer. */}
          <div aria-hidden="true" className="h-24 lg:hidden" />
          <div className="bar-in fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-bar backdrop-blur lg:hidden">
            <div className="mx-auto flex w-full max-w-[1040px] items-center gap-3 px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-muted">
                  {chosen.court.name} · {dayShort}
                </p>
                <p className="truncate text-lg leading-snug font-bold tabular-nums">
                  {chosen.time.range} · {chosen.time.price}
                </p>
              </div>
              <Link
                href={chosen.href}
                className="flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-green px-6 font-bold text-white hover:bg-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Rezervovat
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
