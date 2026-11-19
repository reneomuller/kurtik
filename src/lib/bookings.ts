import type { Slot } from './slot';
import { getSupabase } from './supabase';

export type NewBooking = Slot & { name: string; email: string; phone: string | null };

// Without Supabase keys the app runs in demo mode with data kept in server memory.
export function isDemoMode(): boolean {
  return getSupabase() === null;
}

// Row shape returned by rpc('kurtik_taken_slots'); start_time comes back as '18:00:00'.
type TakenSlotRow = { court: number; slot_date: string; start_time: string };

export async function getTakenSlots(date: string): Promise<Slot[]> {
  const supabase = getSupabase();
  if (!supabase) return getDemoTakenSlots(date);

  const { data, error } = await supabase.rpc('kurtik_taken_slots').eq('slot_date', date);
  if (error) {
    console.error('Loading taken slots failed, code:', error.code || 'unknown');
    throw new Error('Loading taken slots failed');
  }
  return ((data ?? []) as TakenSlotRow[]).map((row) => ({
    court: row.court,
    date: row.slot_date,
    time: row.start_time.slice(0, 5),
  }));
}

// Returns false when the booking could not be saved.
export async function createBooking(booking: NewBooking): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    demoBookings().push({ court: booking.court, date: booking.date, time: booking.time });
    return true;
  }

  // No .select() after insert: the public role may insert but not read bookings.
  const { error } = await supabase.from('kurtik_bookings').insert({
    court: booking.court,
    slot_date: booking.date,
    start_time: booking.time,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
  });
  if (error) {
    console.error('Saving booking failed, code:', error.code || 'unknown');
    return false;
  }
  return true;
}

// Demo data: taken every day in demo mode.
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

function getDemoTakenSlots(date: string): Slot[] {
  const daily = DEMO_DAILY_TAKEN.map((slot) => ({ ...slot, date }));
  const booked = demoBookings().filter((slot) => slot.date === date);
  return [...daily, ...booked];
}
