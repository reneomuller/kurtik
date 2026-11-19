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
    <>
      <p className="rounded-xl border border-clay bg-white p-3 text-sm">
        Ukázkové zabezpečení jen pro výuku. Ostrá aplikace potřebuje skutečné přihlášení.
      </p>
      <p className="mt-5 text-sm font-medium text-clay">{CLUB_NAME}</p>
      <Suspense fallback={<p className="mt-6 text-muted">Načítám správu…</p>}>
        <AdminContent />
      </Suspense>
    </>
  );
}

async function AdminContent() {
  await connection();
  const mode = getAdminMode();

  if (mode === "unconfigured") {
    return (
      <>
        <h1 className="mt-1 text-2xl font-bold">Správa klubu</h1>
        <p className="mt-6 rounded-xl border border-line bg-white p-4">Správa není nastavená.</p>
      </>
    );
  }

  if (!(await hasAdminSession())) {
    return (
      <>
        <h1 className="mt-1 text-2xl font-bold">Správa klubu</h1>
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
      <h1 className="mt-1 text-2xl font-bold">Dnešní rezervace</h1>
      <p className="mt-1 text-lg">{formatDayWithYear(today)}</p>
      <p className="mt-1 text-muted">
        {taken.length > 0 ? formatBookingCount(taken.length) : "Zatím žádná rezervace."}
      </p>
      <p className="mt-3 text-sm">Jména vidí jen správce v Supabase.</p>
      <table className="mt-3 w-full table-fixed border-separate border-spacing-1.5">
        <caption className="sr-only">Obsazenost kurtů dnes</caption>
        <thead>
          <tr>
            <th scope="col" className="w-14">
              <span className="sr-only">Čas</span>
            </th>
            {COURTS.map((court) => (
              <th key={court.id} scope="col" className="pb-1 text-sm font-semibold">
                {court.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getSlotTimes().map((time) => (
            <tr key={time}>
              <th scope="row" className="text-left font-medium tabular-nums">
                {formatTime(time)}
              </th>
              {COURTS.map((court) =>
                takenKeys.has(`${court.id} ${time}`) ? (
                  <td key={court.id}>
                    <div className="flex min-h-11 items-center justify-center rounded-xl bg-clay text-sm font-semibold text-white">
                      Obsazeno
                    </div>
                  </td>
                ) : (
                  <td key={court.id}>
                    <div className="flex min-h-11 items-center justify-center rounded-xl border border-line bg-white text-sm text-muted">
                      Volno
                    </div>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
