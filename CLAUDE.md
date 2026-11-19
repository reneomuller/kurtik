# Kurtík: pravidla projektu

Rezervace tenisových kurtů pro smyšlený klub TK Míčkovice. **Co stavíme a všechna rozhodnutí jsou v `SPEC.md`. Přečti ho před každým krokem.** Tvar databáze je v `supabase/schema.sql`.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. Žádné další UI knihovny (ani shadcn/ui), dokud o ně výslovně nepožádám.
- Databáze: Supabase přes `@supabase/supabase-js`, volaná **jen na serveru** (Server Components, Server Actions, Route Handlers). Bez `@supabase/ssr`, nemáme přihlašování.
- Projekt má zapnuté Cache Components (`cacheComponents: true` v `next.config.ts`). Cokoli, co čte aktuální čas, `searchParams` nebo databázi, patří do async komponenty obalené `<Suspense>`; v ní nejdřív `await connection()` z `next/server`. Nepoužívej `'use cache'` ani `export const dynamic`.
- Co z Next.js 16 tu potřebuješ, je popsané výše. Do `node_modules/next/dist/docs` se dívej, jen když build selže nebo potřebuješ API, které tu popsané není.

## Složky
- `src/app/`: stránky (složka = adresa v prohlížeči)
- `src/components/`: části UI
- `src/lib/config.ts`: klub, kurty, provozní doba, délka termínu, ceny (jediné místo s těmito čísly)
- `src/lib/time.ts`: dnešní datum a čas v Praze, seznam dní a časů
- `src/lib/format.ts`: české formáty data, času a ceny
- `src/lib/bookings.ts`: jediné místo, které mluví s databází nebo s ukázkovými daty
- `supabase/`: SQL pro databázi

## Jazyk a formáty
- Celé UI česky, s diakritikou, vykáme („Vyberte“, „Rezervujte“). Žádná angličtina v UI, ani v chybách, `title`, `alt` a `aria-label`.
- Kód, názvy souborů a proměnných anglicky.
- Datum `19. 11. 2026`, den `čtvrtek 19. 11.`, čas `8:00` a `18:00` (24 h, bez úvodní nuly), cena `1 200 Kč`. Dny v týdnu neskloňuj přes šablonu („na středa“ je chyba); piš je samostatně. Formátuj přes `Intl` s `'cs-CZ'` a `timeZone: 'Europe/Prague'`.
- **Časové pásmo je vždy Europe/Prague**, i na serveru (Vercel běží v UTC a `TZ` tam nastavit nejde). Datum drž jako text `'YYYY-MM-DD'`, čas jako `'HH:MM'`. Dnešek a aktuální čas zjišťuj přes `Intl.DateTimeFormat` s `timeZone: 'Europe/Prague'`, nikdy přes `getHours()` nebo `toISOString()`.
- `<html lang="cs">`; font přes `next/font` se subsety `latin` a `latin-ext` (kvůli ř, ě, ů).

## Design
- Mobil první: obsah uprostřed, `max-w-[640px]`, okraje 16 px, žádné vodorovné posouvání.
- Barvy: pozadí `#F6F4EE`, text `#1E2420`, hlavní barva (antuka) `#B4532A`, volný termín bílý s rámečkem `#D9D3C7`, obsazený `#E6E2D9` s šedým textem.
- Dotykové plochy aspoň 44 px vysoké, zaoblení `rounded-xl`, čitelné písmo (základ 16 px).

## Data a klíče
- Proměnné prostředí:
  - `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` jsou veřejné a smí do prohlížeče.
  - `ADMIN_PIN` je tajný, jen pro server, nikdy s předponou `NEXT_PUBLIC_`.
  - Secret key Supabase aplikace nemá: projekt Supabase je sdílený s jinými aplikacemi. Sahej jen na tabulku `kurtik_bookings` a funkci `kurtik_taken_slots()`, nic jiného v databázi neměň.
- **Ukázkový režim:** když chybí `NEXT_PUBLIC_SUPABASE_URL` nebo `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `bookings.ts` použije ukázková data v paměti a stránka ukáže lištu „Ukázkový režim: rezervace se neukládají.“ Build ani stránka kvůli chybějícím klíčům nesmí spadnout.
- Anonymní návštěvník smí do `kurtik_bookings` jen vkládat. Obsazené termíny čti přes `supabase.rpc('kurtik_taken_slots')`. Po `insert` nevolej `.select()`, tabulku číst nesmí. Databáze vrací čas jako `'18:00:00'`, porovnávej prvních 5 znaků.
- Klíče nikdy do kódu, do gitu, do logů ani do odpovědí. `.env.local` je v `.gitignore`. Vzor proměnných je v `.env.example` (bez hodnot).

## Pracovní pravidla
- Dělej jen to, co zadává aktuální krok. Nic z „Mimo rozsah“ a žádné funkce navíc.
- Malé kroky. Když chybí rozhodnutí, které není ve SPEC.md ani v zadání, zeptej se jednou otázkou a počkej. Nehádej.
- Než řekneš „hotovo“, spusť `npm run build` a oprav všechny chyby. Tím ověřování končí: dev server běží v jiném okně a v prohlížeči to zkontroluju já (nespouštěj ho, nezkoušej stránky přes curl).
- Necommituj a nepushuj. Commit dělá člověk, až změnu zkontroluje.
- Zastavuj jen procesy, které jsi sám spustil, a to podle PID. Nikdy `pkill` ani `killall`.
- Na konci krátce česky shrň, co se změnilo a co mám vyzkoušet.
