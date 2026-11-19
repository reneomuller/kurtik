const LOCALE = 'cs-CZ';
const TIME_ZONE = 'Europe/Prague';

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});
const dayMonthFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'numeric',
});
const weekdayLongFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: 'long',
});
const weekdayShortFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: 'short',
});
const priceFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'CZK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Noon UTC falls on the same calendar day in Prague, summer or winter.
function toDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/** '2026-11-19' → '19. 11. 2026' */
export function formatDate(date: string): string {
  return dateFormat.format(toDate(date));
}

/** '2026-11-19' → 'čtvrtek 19. 11.' */
export function formatDayLong(date: string): string {
  const value = toDate(date);
  return `${weekdayLongFormat.format(value)} ${dayMonthFormat.format(value)}`;
}

/** '2026-11-21' → 'so 21. 11.' */
export function formatDayShort(date: string): string {
  const value = toDate(date);
  return `${weekdayShortFormat.format(value)} ${dayMonthFormat.format(value)}`;
}

/** '08:00' → '8:00' */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${Number(hours)}:${minutes}`;
}

/** '18:00', '19:00' → '18:00–19:00' */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

/** 1200 → '1 200 Kč' */
export function formatPrice(amount: number): string {
  return priceFormat.format(amount);
}

/** '2026-11-21' → 'so' */
export function formatWeekdayShort(date: string): string {
  return weekdayShortFormat.format(toDate(date));
}

/** '2026-11-21' → '21. 11.' */
export function formatDayMonth(date: string): string {
  return dayMonthFormat.format(toDate(date));
}

const pluralRules = new Intl.PluralRules(LOCALE);

/** 1 → '1 volný', 3 → '3 volné', 0 or 5+ → '5 volných' */
export function formatFreeCount(count: number): string {
  const category = pluralRules.select(count);
  const word = category === 'one' ? 'volný' : category === 'few' ? 'volné' : 'volných';
  return `${count} ${word}`;
}

const numberFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/** 300, 400 → '300–400 Kč' */
export function formatPriceRange(from: number, to: number): string {
  return `${numberFormat.format(from)}–${formatPrice(to)}`;
}
