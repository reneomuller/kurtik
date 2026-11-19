import Link from "next/link";
import { COURTS } from "@/lib/config";
import { formatDayLong, formatTime } from "@/lib/format";
import { slotQuery, type Slot } from "@/lib/slot";

type SlotGridProps = {
  date: string;
  times: string[];
  taken: Slot[];
};

export function SlotGrid({ date, times, taken }: SlotGridProps) {
  const takenKeys = new Set(taken.map((slot) => `${slot.court} ${slot.time}`));

  return (
    <table className="w-full table-fixed border-separate border-spacing-1.5">
      <caption className="sr-only">Volné a obsazené termíny, {formatDayLong(date)}</caption>
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
        {times.map((time) => (
          <tr key={time}>
            <th scope="row" className="text-left font-medium tabular-nums">
              {formatTime(time)}
            </th>
            {COURTS.map((court) => (
              <td key={court.id}>
                {takenKeys.has(`${court.id} ${time}`) ? (
                  <div className="flex min-h-11 items-center justify-center rounded-xl bg-taken text-sm text-muted">
                    Obsazeno
                  </div>
                ) : (
                  <Link
                    href={`/rezervace?${slotQuery({ court: court.id, date, time })}`}
                    aria-label={`${court.name}, ${formatTime(time)}, volno`}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-clay hover:border-clay"
                  >
                    Volno
                  </Link>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
