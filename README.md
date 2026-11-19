# Kurtík · rezervace kurtů pro TK Míčkovice

Výuková aplikace z Bloku 4 (MUP, čtvrtek 19. 11. 2026). TK Míčkovice je smyšlený klub. Hráč v mobilu vidí volné kurty na dnes a dalších 6 dní, klepne na termín, vyplní přezdívku a e-mail (stačí vymyšlený) a rezervace se uloží do Supabase.

Co stavíme a proč, je v `SPEC.md`. Pravidla pro Claude Code jsou v `CLAUDE.md`. Nasazení na Vercel popisuje `DEPLOY-NOTES.md`.

## Historie po krocích
Každý krok živé stavby je jeden commit. Historie je sama o sobě výklad:

```bash
git log --oneline --graph
```

| Tag | Stav po kroku |
|---|---|
| `p0` | kostra Next.js, SPEC.md, CLAUDE.md, schéma databáze |
| `p1` | výběr termínu, formulář a potvrzení na ukázkových datech (lišta „Ukázkový režim“) |
| `p2` | rezervace se ukládají do Supabase |
| `p3` | jeden termín = jedna rezervace (rozhodnutí třídy A: platí ta, která přišla první) |
| `streams` | po merge proudů B (správa pod PINem) a C (přidat do kalendáře, texty v jednom tónu) |
| `final` | po opravě nálezu z recenze (limit pokusů na PIN), patička a poznámky k nasazení |

## Databáze
Projekt Supabase je sdílený s jinými aplikacemi, proto má Kurtík vlastní jména:
- tabulka `public.kurtik_bookings` (kurt 1–3, datum, čas začátku, jméno, e-mail, telefon, čas vytvoření; jeden termín smí mít jen jednu rezervaci),
- funkce `public.kurtik_taken_slots()`, která vrací jen obsazené termíny (kurt, datum, čas), žádná jména.

Návštěvník smí rezervace jen vkládat (dnes až +6 dní, ne do minulosti) a číst je nesmí. Aplikace nemá secret key, proto stránka `/sprava` ukazuje jen dnešní obsazenost kurtů. **Jména a e-maily vidí jen správce přímo v Supabase.**

Popis tabulky je v `supabase/schema.sql`. V projektu pro hodinu už všechno je, soubor znovu nespouštějte.

## Spuštění na vlastním počítači

```bash
npm ci
cp .env.example .env.local   # doplňte URL a publishable key ze Supabase a vlastní ADMIN_PIN
npm run dev                   # http://localhost:3000
```

Bez `.env.local` běží aplikace v ukázkovém režimu: nahoře lišta „Ukázkový režim: rezervace se neukládají.“, předem obsazené Kurt 1 v 18:00, Kurt 2 v 19:00 a Kurt 3 v 8:00 a `/sprava` přijme PIN `1234`.

Proměnné `NEXT_PUBLIC_…` se do aplikace vkládají při buildu. Po jejich změně je potřeba nový build (na Vercelu Redeploy).

## Testovací rezervace z noci
Při přípravě vznikla **jedna** skutečná rezervace, aby se ověřilo ukládání a hláška při dvojí rezervaci:

| Kurt | Den | Čas | Jméno | E-mail |
|---|---|---|---|---|
| Kurt 3 | středa 25. 11. 2026 | 21:00 | Test před hodinou | test@example.com |

Ten termín je proto v aplikaci „Obsazeno“. Můžete ho nechat (studentům nevadí), nebo smazat: Supabase → Table Editor → `kurtik_bookings` → zaškrtnout řádek → Delete.

## Pro projektor a po hodině
Na plátno jen dotaz bez e-mailů (SQL Editor, uložený dotaz):

```sql
select court, slot_date, start_time, name
from public.kurtik_bookings
order by created_at desc;
```

Po hodině smažte data studentů (jen tuhle tabulku, projekt je sdílený):

```sql
delete from public.kurtik_bookings;
```

`ADMIN_PIN` je jen v `.env.local` a v nastavení Vercelu, nikdy v gitu ani na plátně. Ukázkové zabezpečení pro výuku; ostrá správa by potřebovala skutečné přihlášení (Supabase Auth).
