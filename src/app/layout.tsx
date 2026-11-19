import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { DemoBanner } from "@/components/demo-banner";
import { TennisBall } from "@/components/tennis-ball";
import { isDemoMode } from "@/lib/bookings";
import { CLOSING_HOUR, CLUB_NAME, DAYS_AHEAD, OPENING_HOUR } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: `Rezervace kurtů · ${CLUB_NAME}`,
  description: `Volné kurty ${CLUB_NAME} na dnes a dalších ${DAYS_AHEAD} dní. Rezervace bez telefonování.`,
};

export const viewport: Viewport = {
  themeColor: "#1f5c43",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-dvh bg-paper font-sans text-base text-ink">
        {isDemoMode() && <DemoBanner />}
        <header className="relative overflow-hidden bg-green text-white">
          <div className="mx-auto flex w-full max-w-[1040px] items-center px-4 py-3.5 sm:px-6 sm:py-4">
            <Link
              href="/"
              className="-m-1 flex min-h-11 items-center gap-3 rounded-xl p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball"
            >
              <TennisBall />
              <span>
                <span className="block text-lg leading-tight font-bold tracking-tight">{CLUB_NAME}</span>
                <span className="block text-sm text-on-green">
                  Rezervace kurtů · denně {OPENING_HOUR}–{CLOSING_HOUR} h
                </span>
              </span>
            </Link>
          </div>
          <div aria-hidden="true" className="court-line absolute inset-x-0 bottom-0 h-[3px]" />
        </header>
        <main className="mx-auto w-full max-w-[1040px] px-4 pt-5 pb-12 sm:px-6 sm:pt-8">{children}</main>
        <footer className="mx-auto w-full max-w-[1040px] px-4 pb-8 text-sm text-muted sm:px-6">
          <p>Kurtík · výuková ukázka · {CLUB_NAME}</p>
        </footer>
      </body>
    </html>
  );
}
