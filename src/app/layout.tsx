import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DemoBanner } from "@/components/demo-banner";
import { isDemoMode } from "@/lib/bookings";
import { CLUB_NAME, DAYS_AHEAD } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: `Rezervace kurtů · ${CLUB_NAME}`,
  description: `Volné kurty ${CLUB_NAME} na dnes a dalších ${DAYS_AHEAD} dní. Rezervace bez telefonování.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-dvh bg-paper font-sans text-base text-ink">
        {isDemoMode() && <DemoBanner />}
        <main className="mx-auto w-full max-w-[640px] px-4 pt-6 pb-12">{children}</main>
        <footer className="mx-auto w-full max-w-[640px] px-4 pb-8 text-sm text-muted">
          <p>Kurtík · výuková ukázka · {CLUB_NAME}</p>
        </footer>
      </body>
    </html>
  );
}
