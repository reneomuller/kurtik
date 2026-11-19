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
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="text-lg font-semibold">{getCourt(slot.court)?.name}</h2>
      <dl className="mt-2 space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3">
            <dt className="w-12 shrink-0 text-muted">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
