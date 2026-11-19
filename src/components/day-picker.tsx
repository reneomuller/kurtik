import Link from "next/link";
import { formatDayShort } from "@/lib/format";

type DayPickerProps = {
  days: string[]; // first item is today
  selected: string;
};

function dayLabel(day: string, index: number): string {
  if (index === 0) return "Dnes";
  if (index === 1) return "Zítra";
  return formatDayShort(day);
}

export function DayPicker({ days, selected }: DayPickerProps) {
  return (
    <nav aria-label="Výběr dne">
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((day, index) => {
          const isSelected = day === selected;
          return (
            <li key={day}>
              <Link
                href={index === 0 ? "/" : `/?den=${day}`}
                aria-current={isSelected ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-xl border px-1 text-center text-sm font-medium ${
                  isSelected
                    ? "border-clay bg-clay text-white"
                    : "border-line bg-white text-ink hover:border-clay"
                }`}
              >
                {dayLabel(day, index)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
