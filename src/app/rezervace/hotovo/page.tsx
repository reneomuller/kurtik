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
    <div className="mx-auto max-w-[560px]">
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-full bg-ball text-ball-ink shadow-card"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="mt-4 mb-5 text-2xl font-bold tracking-tight sm:text-3xl">Hotovo, kurt je váš</h1>
      </div>
      <SlotSummary slot={slot} />
      <p className="mt-4 rounded-2xl border border-green-line bg-green-soft p-4 text-lg">
        Platíte na místě: <strong>{formatPrice(getPrice(slot.time))}</strong>
      </p>
      {/* Plain <a>: the route returns an .ics file, not a page. */}
      <a
        href={`/rezervace/kalendar?${slotQuery(slot)}`}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-green bg-white px-4 font-bold text-green hover:bg-green-soft"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Přidat do kalendáře
      </a>
      <Link
        href="/"
        className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-green px-4 font-bold text-white hover:bg-green-dark"
      >
        Rezervovat další termín
      </Link>
    </div>
  );
}
