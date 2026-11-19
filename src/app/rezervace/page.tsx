import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking-form";
import { SlotSummary } from "@/components/slot-summary";
import { DAYS_AHEAD } from "@/lib/config";
import { parseSlot } from "@/lib/slot";
import { getPragueNow, isBookableSlot } from "@/lib/time";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function BookingPage({ searchParams }: PageProps<"/rezervace">) {
  return (
    <Suspense fallback={<p className="text-muted">Načítáme termín…</p>}>
      <BookingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BookingContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { kurt, den, cas } = await searchParams;
  const slot = parseSlot(kurt, den, cas);
  if (!slot) notFound();

  if (!isBookableSlot(slot.date, slot.time, getPragueNow())) {
    return (
      <>
        <h1 className="text-2xl font-bold">Tento termín už nejde rezervovat</h1>
        <p className="mt-3">
          Rezervovat můžete na dnes a dalších {DAYS_AHEAD} dní. Termíny, které už začaly, v nabídce
          nejsou.
        </p>
        <Link
          href="/"
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-clay px-4 font-semibold text-white hover:bg-clay/90"
        >
          Vybrat jiný termín
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href={`/?den=${slot.date}`} className="inline-flex min-h-11 items-center text-clay underline">
        ← Zpět na výběr termínů
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold">Dokončete rezervaci</h1>
      <SlotSummary slot={slot} withPrice />
      <BookingForm slot={slot} />
    </>
  );
}
