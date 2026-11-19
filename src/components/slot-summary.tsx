import { TennisBall } from "@/components/tennis-ball";
import { getCourt, getPrice } from "@/lib/config";
import { formatDayLong, formatPrice, formatTimeRange } from "@/lib/format";
import type { Slot } from "@/lib/slot";
import { getSlotEnd } from "@/lib/time";

type SlotSummaryProps = {
  slot: Slot;
  withPrice?: boolean;
};

export function SlotSummary({ slot, withPrice = false }: SlotSummaryProps) {
  const rows = [
    { label: "Den", value: formatDayLong(slot.date) },
    { label: "Čas", value: formatTimeRange(slot.time, getSlotEnd(slot.time)) },
  ];
  if (withPrice) {
    rows.push({ label: "Cena", value: `${formatPrice(getPrice(slot.time))}, platíte na místě` });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <div className="flex items-center gap-3 bg-green px-4 py-3 text-white">
        <TennisBall size={30} />
        <div>
          <h2 className="text-lg leading-tight font-bold">{getCourt(slot.court)?.name}</h2>
          <p className="text-sm text-on-green">Antuka</p>
        </div>
      </div>
      <dl className="divide-y divide-line px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 py-3">
            <dt className="w-12 shrink-0 text-muted">{row.label}</dt>
            <dd className="font-semibold tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
