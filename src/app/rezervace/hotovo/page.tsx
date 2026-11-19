import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SlotSummary } from "@/components/slot-summary";
import { getPrice } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { parseSlot, slotQuery } from "@/lib/slot";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function ConfirmationPage({ searchParams }: PageProps<"/rezervace/hotovo">) {
  return (
    <Suspense fallback={<p className="text-muted">Načítáme potvrzení…</p>}>
      <Confirmation searchParams={searchParams} />
    </Suspense>
  );
}

async function Confirmation({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { kurt, den, cas } = await searchParams;
  const slot = parseSlot(kurt, den, cas);
  if (!slot) notFound();

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Hotovo, kurt je váš</h1>
      <SlotSummary slot={slot} />
      <p className="mt-4 text-lg">
        Platíte na místě: <strong>{formatPrice(getPrice(slot.time))}</strong>
      </p>
      {/* Plain <a>: the route returns an .ics file, not a page. */}
      <a
        href={`/rezervace/kalendar?${slotQuery(slot)}`}
        className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl border border-clay bg-white px-4 font-semibold text-clay hover:bg-clay/5"
      >
        Přidat do kalendáře
      </a>
      <Link
        href="/"
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-clay px-4 font-semibold text-white hover:bg-clay/90"
      >
        Rezervovat další termín
      </Link>
    </>
  );
}
