# SPEC: Kurtík pro TK Míčkovice, první verze

> TK Míčkovice je smyšlený klub pro výuku. Tahle stránka drží všechna rozhodnutí o první verzi. Co v ní není, si AI nemá domýšlet; má se zeptat.

## Pro koho
Rekreační hráč tenisu, hraje jednou až dvakrát týdně s kamarádem. Rezervuje z mobilu, často večer na zítřek nebo cestou z práce. Dnes klubu volá nebo píše na WhatsApp a čeká, jestli mu správce odpoví.

## Úkol
„Chci během minuty vědět, kdy je volný kurt, a mít ho jistý. Bez telefonování.“

## Hlavní tok (jediný)
1. Otevřu odkaz v mobilu a vidím dnešní volné a obsazené časy na třech kurtech.
2. Můžu přepnout na jiný den (dnes a dalších 6 dní).
3. Klepnu na volný termín a uvidím shrnutí (kurt, den, čas, cena) a krátký formulář.
4. Vyplním jméno a e-mail, případně telefon, a klepnu na Rezervovat.
5. Vidím potvrzení. Termín je od té chvíle pro ostatní obsazený.

## Data
Jedna tabulka `kurtik_bookings` v Supabase: kurt (1–3), datum, čas začátku, jméno, e-mail, telefon (nepovinný) a čas vytvoření. Nic dalšího nesbíráme. Veřejně je vidět jen to, že je termín obsazený, ne kým. Přesný tvar tabulky je v `supabase/schema.sql`.

## Rozhodnuto
| Téma | Rozhodnutí |
|---|---|
| Klub | TK Míčkovice, 3 antukové kurty: Kurt 1, Kurt 2, Kurt 3 |
| Provoz | každý den 7:00–22:00 |
| Délka termínu | 60 minut; začátky 7:00, 8:00 … 21:00, tedy 15 termínů denně |
| Jak daleko dopředu | dnes a dalších 6 dní |
| Dnešní časy, které už začaly | nezobrazují se; když dnes nic nezbývá, ukáže se „Dnes už není volný žádný termín. Vyberte jiný den.“ |
| Cena | začátky 7:00–16:00 za 300 Kč, začátky 17:00–21:00 za 400 Kč; cena se jen zobrazuje, platí se na místě |
| Povinné údaje | jméno nebo přezdívka (2–80 znaků) a e-mail; stačí i vymyšlený ve tvaru prezdivka@example.com, nic na něj neposíláme; telefon je nepovinný |
| Časové pásmo | vždy Europe/Prague, i když server běží jinde |
| Adresy stránek | `/` výběr termínu (`/?den=2026-11-20` jiný den), `/rezervace?kurt=2&den=2026-11-19&cas=18:00` formulář, `/rezervace/hotovo?kurt=2&den=2026-11-19&cas=18:00` potvrzení; jméno ani e-mail nikdy v adrese |
| Zařízení | hlavní je mobil na výšku; na počítači stejné rozložení uprostřed, šířka nejvýš 640 px |
| Bez klíčů k databázi | ukázkový režim: předem obsazené termíny každý den Kurt 1 v 18:00, Kurt 2 v 19:00 a Kurt 3 v 8:00; nové rezervace drží jen paměť serveru (po restartu zmizí), takže zarezervovaný termín je pak obsazený; nahoře lišta „Ukázkový režim: rezervace se neukládají.“ |
| Dvě rezervace na stejný termín | platí rezervace, která přišla první; druhý hráč uvidí „Tento termín si právě zarezervoval někdo jiný. Vyberte si prosím jiný.“ a tlačítko „Zpět na výběr termínů“ (rozhodla třída v kroku P3) |

## Kritéria přijetí
- [ ] Na mobilu (šířka 390 px) je mřížka časů × 3 kurty pro vybraný den bez vodorovného posouvání.
- [ ] Jde přepnout na každý ze 7 dní.
- [ ] Obsazený termín nejde vybrat; po rezervaci je obsazený i pro ostatní (po obnovení stránky).
- [ ] Formulář nepustí prázdné jméno ani neplatný e-mail a česky řekne proč.
- [ ] Rezervace se uloží do tabulky `kurtik_bookings` v Supabase.
- [ ] Bez klíčů k Supabase aplikace běží v ukázkovém režimu a nespadne.
- [ ] Data, časy a ceny jsou v českém formátu a v pražském čase, i na serveru v UTC.
- [ ] `npm run build` projde bez chyb.

## Mimo rozsah (teď ne)
Platby (později třeba platební odkaz Stripe), přihlášení a účty, rušení a změny rezervací, správa pro klub (přijde jako samostatný krok), posílání e-mailů a SMS, víc klubů, opakované rezervace, členské ceny.

## Jazyk a formáty
- Česky, s diakritikou, vykáme. Přátelský klubový tón, bez vykřičníků a bez anglických slov.
- Formáty: 19. 11. 2026 · čtvrtek 19. 11. · 8:00 a 18:00–19:00 (bez nuly na začátku) · 400 Kč · 1 200 Kč.
- Nad mřížkou stojí jen den a datum („středa 18. 11.“), bez předložky. Spojení typu „na středa“ jsou chyba.
- Názvy dní ve výběru: „Dnes“, „Zítra“, dál zkratka a datum („so 21. 11.“).
- Klíčové texty: nadpis „Rezervujte si kurt“, volný termín „Volno“, obsazený „Obsazeno“, tlačítko „Rezervovat“, potvrzení „Hotovo, kurt je váš“, pod ním „Platíte na místě: 400 Kč“ a odkaz „Rezervovat další termín“.
- Nikdy nepsat, že jsme poslali e-mail nebo SMS. Neposíláme je.

## Technika
Next.js + Tailwind, Supabase (region EU), Vercel. Klíče jen v proměnných prostředí. Bez klíčů k databázi běží aplikace s ukázkovými daty. Podrobná pravidla jsou v `CLAUDE.md`.
