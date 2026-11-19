import { CLOSING_HOUR, DAYS_AHEAD, OPENING_HOUR, SLOT_MINUTES } from './config';

// Dates are 'YYYY-MM-DD' and times 'HH:MM', always in Europe/Prague.
export type PragueNow = { date: string; time: string };

const pragueParts = new Intl.DateTimeFormat('cs-CZ', {
  timeZone: 'Europe/Prague',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function pad(value: number | string): string {
  return String(value).padStart(2, '0');
}

export function getPragueNow(): PragueNow {
  const parts: Record<string, string> = {};
  for (const part of pragueParts.formatToParts(new Date())) {
    parts[part.type] = part.value;
  }
  return {
    date: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
  };
}

// Calendar arithmetic only; UTC is used so no time zone shifts the day.
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`;
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && addDays(value, 0) === value;
}

export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function getSlotEnd(startTime: string): string {
  return addMinutes(startTime, SLOT_MINUTES);
}

export function getBookableDays(today: string): string[] {
  return Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => addDays(today, i));
}

export function getSlotTimes(): string[] {
  const times: string[] = [];
  for (
    let start = OPENING_HOUR * 60;
    start + SLOT_MINUTES <= CLOSING_HOUR * 60;
    start += SLOT_MINUTES
  ) {
    times.push(`${pad(Math.floor(start / 60))}:${pad(start % 60)}`);
  }
  return times;
}

// Today's slots that have already started are left out.
export function getTimesForDay(date: string, now: PragueNow): string[] {
  const times = getSlotTimes();
  return date === now.date ? times.filter((time) => time > now.time) : times;
}

export function isBookableSlot(date: string, time: string, now: PragueNow): boolean {
  return (
    getBookableDays(now.date).includes(date) && getTimesForDay(date, now).includes(time)
  );
}
