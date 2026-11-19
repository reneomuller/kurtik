import { Suspense } from "react";
import { connection } from "next/server";
import { DayPicker } from "@/components/day-picker";
import { SlotGrid, type GridTime } from "@/components/slot-grid";
import { getTakenSlotsForDays } from "@/lib/bookings";
import {
  CLOSING_HOUR,
  CLUB_NAME,
  COURTS,
  DAYS_AHEAD,
  EVENING_FROM,
  OPENING_HOUR,
  PRICE_DAY,
  PRICE_EVENING,
  getPrice,
} from "@/lib/config";
import {
  formatDayLong,
  formatDayShort,
  formatPrice,
  formatPriceRange,
  formatTime,
  formatTimeRange,
} from "@/lib/format";
import type { Slot } from "@/lib/slot";
import { getBookableDays, getPragueNow, getSlotEnd, getTimesForDay, type PragueNow } from "@/lib/time";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Rezervujte si kurt</h1>
      <p className="mt-1 text-muted">Vyberte den, pak volný čas na jednom ze tří kurtů.</p>
      <Suspense fallback={<p className="mt-6 text-muted">Načítáme termíny…</p>}>
        <SlotPicker searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// Slots still open on a day: the day's bookable times on every court, minus taken ones.
function countFree(day: string, now: PragueNow, taken: Slot[]): number {
  const times = getTimesForDay(day, now);
  const takenKeys = new Set(
    taken.filter((slot) => slot.date === day).map((slot) => `${slot.court} ${slot.time}`),
  );
  let free = 0;
  for (const time of times) {
    for (const court of COURTS) {
      if (!takenKeys.has(`${court.id} ${time}`)) free += 1;
    }
  }
  return free;
}

async function SlotPicker({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { den } = await searchParams;
  const now = getPragueNow();
  const days = getBookableDays(now.date);
  const selected = typeof den === "string" && days.includes(den) ? den : now.date;
  const selectedIndex = days.indexOf(selected);

  // One RPC call for the whole week: the grid needs the selected day, the day chips need counts.
  const takenThisWeek = await getTakenSlotsForDays(days);
  const taken = takenThisWeek.filter((slot) => slot.date === selected);
  const freeCounts = days.map((day) => countFree(day, now, takenThisWeek));

  const times = getTimesForDay(selected, now);
  const hasFreeSlot = times.some((time) =>
    COURTS.some((court) => !taken.some((slot) => slot.court === court.id && slot.time === time)),
  );
  const noneLeftToday = selected === now.date && !hasFreeSlot;

  const dayPicker = <DayPicker days={days} selected={selected} freeCounts={freeCounts} />;

  if (noneLeftToday) {
    return (
      <div className="mt-5 max-w-[640px]">
        {dayPicker}
        <p className="mt-4 rounded-2xl border border-line bg-card p-4 shadow-card">
          Dnes už není volný žádný termín. Vyberte jiný den.
        </p>
      </div>
    );
  }

  const gridTimes: GridTime[] = times.map((time) => ({
    time,
    label: formatTime(time),
    range: formatTimeRange(time, getSlotEnd(time)),
    price: formatPrice(getPrice(time)),
    evening: getPrice(time) > PRICE_DAY,
  }));

  return (
    <div className="mt-5">
      <SlotGrid
        key={selected}
        date={selected}
        dayLong={formatDayLong(selected)}
        dayShort={formatDayShort(selected)}
        dayBadge={selectedIndex === 0 ? "dnes" : selectedIndex === 1 ? "zítra" : null}
        freeCount={freeCounts[selectedIndex]}
        times={gridTimes}
        courts={COURTS.map((court) => ({ id: court.id, name: court.name }))}
        takenKeys={taken.map((slot) => `${slot.court} ${slot.time}`)}
        courtInfo={{
          surface: "Antuka",
          price: formatPriceRange(PRICE_DAY, PRICE_EVENING),
        }}
        eveningPrice={{ price: formatPrice(PRICE_EVENING), from: formatTime(EVENING_FROM) }}
        dayPicker={dayPicker}
        info={<ClubInfo />}
      />
    </div>
  );
}

function ClubInfo() {
  return (
    <section className="mt-4 rounded-2xl border border-line bg-card p-5 text-sm shadow-card">
      <h2 className="font-bold">{CLUB_NAME}</h2>
      <ul className="mt-2 space-y-1.5 text-muted">
        <li>Tři antukové kurty</li>
        <li>
          Denně {OPENING_HOUR}:00–{CLOSING_HOUR}:00
        </li>
        <li>
          {formatPrice(PRICE_DAY)}, od {formatTime(EVENING_FROM)} {formatPrice(PRICE_EVENING)}
        </li>
        <li>Platíte na místě</li>
        <li>Rezervace na dnes a dalších {DAYS_AHEAD} dní</li>
      </ul>
    </section>
  );
}
