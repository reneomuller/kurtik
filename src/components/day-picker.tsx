import Link from "next/link";
import { DayScroller } from "@/components/day-scroller";
import { formatDayMonth, formatFreeCount, formatWeekdayShort } from "@/lib/format";

type DayPickerProps = {
  days: string[]; // first item is today
  selected: string;
  freeCounts: number[]; // free slots per day, same order as days
};

function dayLabel(day: string, index: number): string {
  if (index === 0) return "Dnes";
  if (index === 1) return "Zítra";
  return formatWeekdayShort(day);
}

function isWeekend(day: string): boolean {
  const [year, month, date] = day.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, date)).getUTCDay();
  return weekday === 0 || weekday === 6;
}

export function DayPicker({ days, selected, freeCounts }: DayPickerProps) {
  return (
    <nav aria-label="Výběr dne">
      <DayScroller selected={selected}>
        <ul className="flex gap-2 sm:grid sm:grid-cols-7">
          {days.map((day, index) => {
            const isSelected = day === selected;
            const free = freeCounts[index] ?? 0;
            return (
              <li key={day} className="w-[76px] shrink-0 snap-start sm:w-auto">
                <Link
                  href={index === 0 ? "/" : `/?den=${day}`}
                  aria-current={isSelected ? "page" : undefined}
                  className={`relative flex min-h-11 flex-col items-center rounded-2xl border px-1 pt-2 pb-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${
                    isSelected
                      ? "border-green bg-green text-white shadow-card"
                      : "border-line bg-card text-ink hover:border-green-mid"
                  }`}
                >
                  <span
                    className={`text-xs font-bold tracking-wide uppercase ${
                      isSelected ? "text-on-green" : isWeekend(day) && index > 1 ? "text-clay" : "text-muted"
                    }`}
                  >
                    {dayLabel(day, index)}
                  </span>
                  <span className="sr-only">, </span>
                  <span className="mt-0.5 text-[17px] leading-tight font-extrabold whitespace-nowrap tabular-nums">
                    {formatDayMonth(day)}
                  </span>
                  <span className="sr-only">, </span>
                  <span
                    className={`mt-1 text-xs font-semibold whitespace-nowrap ${
                      isSelected ? "text-ball" : free > 0 ? "text-green-mid" : "text-muted"
                    }`}
                  >
                    {free > 0 ? formatFreeCount(free) : "plno"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </DayScroller>
    </nav>
  );
}
