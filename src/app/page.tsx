import { Suspense } from "react";
import { connection } from "next/server";
import { DayPicker } from "@/components/day-picker";
import { SlotGrid } from "@/components/slot-grid";
import { getTakenSlots } from "@/lib/bookings";
import { CLUB_NAME, COURTS } from "@/lib/config";
import { formatDayLong } from "@/lib/format";
import { getBookableDays, getPragueNow, getTimesForDay } from "@/lib/time";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <p className="text-sm font-medium text-clay">{CLUB_NAME}</p>
      <h1 className="mt-1 text-2xl font-bold">Rezervujte si kurt</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Načítáme termíny…</p>}>
        <SlotPicker searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SlotPicker({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { den } = await searchParams;
  const now = getPragueNow();
  const days = getBookableDays(now.date);
  const selected = typeof den === "string" && days.includes(den) ? den : now.date;

  const times = getTimesForDay(selected, now);
  const taken = await getTakenSlots(selected);
  const hasFreeSlot = times.some((time) =>
    COURTS.some((court) => !taken.some((slot) => slot.court === court.id && slot.time === time)),
  );
  const noneLeftToday = selected === now.date && !hasFreeSlot;

  return (
    <div className="mt-5">
      <DayPicker days={days} selected={selected} />
      <h2 className="mt-6 text-lg font-semibold">{formatDayLong(selected)}</h2>
      {noneLeftToday ? (
        <p className="mt-3 rounded-xl border border-line bg-white p-4">
          Dnes už není volný žádný termín. Vyberte jiný den.
        </p>
      ) : (
        <div className="mt-2">
          <SlotGrid date={selected} times={times} taken={taken} />
        </div>
      )}
    </div>
  );
}
