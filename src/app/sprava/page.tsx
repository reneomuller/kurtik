import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DEMO_PIN, getAdminMode, getTakenSlotsForAdmin, hasAdminSession } from "@/lib/admin";
import { CLUB_NAME, COURTS } from "@/lib/config";
import { formatTime } from "@/lib/format";
import { getPragueNow, getSlotTimes } from "@/lib/time";
import { PinForm } from "./pin-form";

export const metadata: Metadata = {
  title: `Správa · ${CLUB_NAME}`,
  robots: { index: false, follow: false },
};

const dayWithYearFormat = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: "Europe/Prague",
  weekday: "long",
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

/** '2026-11-19' → 'čtvrtek 19. 11. 2026'; noon UTC is the same day in Prague. */
function formatDayWithYear(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dayWithYearFormat.format(new Date(Date.UTC(year, month - 1, day, 12)));
}

const pluralRules = new Intl.PluralRules("cs-CZ");

/** 1 rezervace, 3 rezervace, 5 rezervací */
function formatBookingCount(count: number): string {
  const category = pluralRules.select(count);
  return `${count} ${category === "one" || category === "few" ? "rezervace" : "rezervací"}`;
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[640px]">
      <p className="flex gap-2.5 rounded-2xl border border-ball-dark/60 bg-[#f7fbdc] p-3.5 text-sm text-ball-ink">
        <span aria-hidden="true" className="font-bold">
          !
        </span>
        Ukázkové zabezpečení jen pro výuku. Ostrá aplikace potřebuje skutečné přihlášení.
      </p>
      <p className="mt-6 text-sm font-semibold text-green-mid">{CLUB_NAME}</p>
      <Suspense fallback={<p className="mt-6 text-muted">Načítám správu…</p>}>
        <AdminContent />
      </Suspense>
    </div>
  );
}

async function AdminContent() {
  await connection();
  const mode = getAdminMode();

  if (mode === "unconfigured") {
    return (
      <>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Správa klubu</h1>
        <p className="mt-6 rounded-2xl border border-line bg-card p-4 shadow-card">Správa není nastavená.</p>
      </>
    );
  }

  if (!(await hasAdminSession())) {
    return (
      <>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Správa klubu</h1>
        <PinForm />
        {mode === "demo" && (
          <p className="mt-4 text-sm text-muted">V ukázkovém režimu je PIN {DEMO_PIN}.</p>
        )}
      </>
    );
  }

  const today = getPragueNow().date;
  const taken = await getTakenSlotsForAdmin(today);
  const takenKeys = new Set(taken.map((slot) => `${slot.court} ${slot.time}`));

  return (
    <>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Dnešní rezervace</h1>
      <p className="mt-1 text-lg">{formatDayWithYear(today)}</p>
      <p className="mt-1 text-muted">
        {taken.length > 0 ? formatBookingCount(taken.length) : "Zatím žádná rezervace."}
      </p>
      <p className="mt-3 text-sm">Jména vidí jen správce v Supabase.</p>
      <div className="mt-4 rounded-2xl border border-line bg-card p-3 shadow-card sm:p-5">
        <table className="w-full table-fixed border-separate border-spacing-1.5">
          <caption className="sr-only">Obsazenost kurtů dnes</caption>
          <thead>
            <tr>
              <th scope="col" className="w-12">
                <span className="sr-only">Čas</span>
              </th>
              {COURTS.map((court) => (
                <th key={court.id} scope="col" className="pb-1">
                  <div className="rounded-xl border border-line bg-paper px-1 py-2 text-sm font-bold">
                    {court.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getSlotTimes().map((time) => (
              <tr key={time}>
                <th
                  scope="row"
                  className="pr-1 text-right text-sm font-semibold tabular-nums"
                >
                  {formatTime(time)}
                </th>
                {COURTS.map((court) =>
                  takenKeys.has(`${court.id} ${time}`) ? (
                    <td key={court.id}>
                      <div className="flex min-h-11 items-center justify-center rounded-xl bg-green text-sm font-bold text-white">
                        Obsazeno
                      </div>
                    </td>
                  ) : (
                    <td key={court.id}>
                      <div className="flex min-h-11 items-center justify-center rounded-xl border border-line bg-paper text-sm text-muted">
                        Volno
                      </div>
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
