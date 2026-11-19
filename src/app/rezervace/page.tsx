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
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-2xl font-bold tracking-tight">Tento termín už nejde rezervovat</h1>
        <p className="mt-3">
          Rezervovat můžete na dnes a dalších {DAYS_AHEAD} dní. Termíny, které už začaly, v nabídce
          nejsou.
        </p>
        <Link
          href="/"
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark"
        >
          Vybrat jiný termín
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] lg:max-w-none">
      <Link
        href={`/?den=${slot.date}`}
        className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 font-semibold text-green-mid hover:text-green-dark hover:underline"
      >
        <span aria-hidden="true">←</span> Zpět na výběr termínů
      </Link>
      <h1 className="mt-1 mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Dokončete rezervaci</h1>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
        <div className="lg:sticky lg:top-6 lg:order-2">
          <SlotSummary slot={slot} withPrice />
        </div>
        <div className="lg:order-1">
          <BookingForm slot={slot} />
        </div>
      </div>
    </div>
  );
}
