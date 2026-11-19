export const CLUB_NAME = 'TK Míčkovice';

export const COURTS = [
  { id: 1, name: 'Kurt 1' },
  { id: 2, name: 'Kurt 2' },
  { id: 3, name: 'Kurt 3' },
] as const;

export type Court = (typeof COURTS)[number];

// Opening hours, every day (Europe/Prague).
export const OPENING_HOUR = 7;
export const CLOSING_HOUR = 22;

export const SLOT_MINUTES = 60;

// Bookable days: today plus this many days ahead.
export const DAYS_AHEAD = 6;

// Prices in CZK by slot start time.
export const PRICE_DAY = 300;
export const PRICE_EVENING = 400;
export const EVENING_FROM = '17:00';

export function getCourt(id: number): Court | undefined {
  return COURTS.find((court) => court.id === id);
}

export function getPrice(startTime: string): number {
  return startTime >= EVENING_FROM ? PRICE_EVENING : PRICE_DAY;
}
