import type { Slot } from './slot';

export type NewBooking = Slot & { name: string; email: string; phone: string | null };

// No database yet: the app always runs in demo mode with data kept in server memory.
export function isDemoMode(): boolean {
  return true;
}

// Taken every day in demo mode.
const DEMO_DAILY_TAKEN = [
  { court: 1, time: '18:00' },
  { court: 2, time: '19:00' },
  { court: 3, time: '08:00' },
];

// Kept on globalThis so every route shares it and it survives dev reloads.
const demoStore = globalThis as typeof globalThis & { kurtikDemoBookings?: Slot[] };

function demoBookings(): Slot[] {
  demoStore.kurtikDemoBookings ??= [];
  return demoStore.kurtikDemoBookings;
}

export async function getTakenSlots(date: string): Promise<Slot[]> {
  const daily = DEMO_DAILY_TAKEN.map((slot) => ({ ...slot, date }));
  const booked = demoBookings().filter((slot) => slot.date === date);
  return [...daily, ...booked];
}

export async function createBooking(booking: NewBooking): Promise<void> {
  demoBookings().push({ court: booking.court, date: booking.date, time: booking.time });
}
