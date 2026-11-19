import { getCourt } from './config';
import { getSlotTimes, isValidDate } from './time';

export type Slot = { court: number; date: string; time: string };

// Reads kurt/den/cas from a URL or form; null when they don't describe a real slot.
export function parseSlot(court: unknown, date: unknown, time: unknown): Slot | null {
  if (typeof court !== 'string' || typeof date !== 'string' || typeof time !== 'string') {
    return null;
  }
  const courtId = Number(court);
  if (!getCourt(courtId) || !isValidDate(date) || !getSlotTimes().includes(time)) {
    return null;
  }
  return { court: courtId, date, time };
}

/** Query string in the shape used by /rezervace: 'kurt=2&den=2026-11-19&cas=18:00' */
export function slotQuery(slot: Slot): string {
  return `kurt=${slot.court}&den=${slot.date}&cas=${slot.time}`;
}
