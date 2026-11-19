-- Hodina 19. 11. 2026: tabulka i funkce už ve sdíleném projektu Supabase jsou
-- (kurtik_bookings, kurtik_taken_slots, včetně unikátního omezení). Soubor je popis, znovu ho nespouštějte.
-- Kurtík · TK Míčkovice · databáze (stav PŘED krokem P3)
-- Spuštěno v Supabase → SQL Editor. Popis a bezpečnostní model: viz komentáře níže.
-- Tabulka kurtik_bookings: court 1–3, slot_date 'YYYY-MM-DD', start_time 'HH:MM' (pražský čas),
-- name, email, phone (nepovinný), created_at.
-- Anonymní návštěvník smí jen INSERT; obsazené termíny čte přes rpc kurtik_taken_slots().
-- Unikátní omezení na (court, slot_date, start_time) zatím NENÍ – přijde v kroku P3.

-- =====================================================================
-- ČÁST 1 · před hodinou
-- =====================================================================

create table if not exists public.kurtik_bookings (
  id          bigint generated always as identity primary key,
  court       smallint    not null check (court between 1 and 3),
  slot_date   date        not null,
  -- začátek termínu v pražském čase; 7:00 až 21:00, celé nebo půl hodiny
  -- (půlhodiny jen pro případ, že třída zvolí 90minutové termíny)
  start_time  time(0)     not null check (
                start_time between time '07:00' and time '21:00'
                and extract(minute from start_time) in (0, 30)
              ),
  name        text        not null check (char_length(btrim(name)) between 2 and 80),
  email       text        not null check (
                char_length(email) <= 254
                and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
              ),
  phone       text        check (phone is null or char_length(phone) <= 30),
  created_at  timestamptz not null default now()
);

comment on table public.kurtik_bookings is
  'Rezervace kurtů TK Míčkovice (výuková ukázka Kurtík). Jedna řádka = jeden hráč na jeden termín.';

-- Row Level Security: bez politiky nesmí role anon/authenticated nic.
alter table public.kurtik_bookings enable row level security;

-- Práva na úrovni tabulky (RLS je druhá, jemnější vrstva).
revoke all on table public.kurtik_bookings from anon, authenticated;
grant insert on table public.kurtik_bookings to anon, authenticated;            -- jen vkládat
grant select, insert, update, delete on table public.kurtik_bookings to service_role;  -- server se secret key (správa)

-- Jediná politika pro veřejnost: vložit rezervaci na dnešek až +6 dní,
-- a dnes jen na termín, který ještě nezačal. Čas počítáme v Praze.
drop policy if exists "Veřejnost může rezervovat na 7 dní dopředu" on public.kurtik_bookings;
create policy "Veřejnost může rezervovat na 7 dní dopředu"
  on public.kurtik_bookings
  for insert
  to anon, authenticated
  with check (
    slot_date between (now() at time zone 'Europe/Prague')::date
                  and (now() at time zone 'Europe/Prague')::date + 6
    and (
      slot_date > (now() at time zone 'Europe/Prague')::date
      or start_time > (now() at time zone 'Europe/Prague')::time
    )
  );
-- Pozn.: SELECT/UPDATE/DELETE politika pro anon záměrně NENÍ.
-- Proto aplikace po insertu nesmí volat .select() (vrácení řádku = čtení).

-- Obsazené termíny bez osobních údajů.
-- SECURITY DEFINER = funkce běží s právy vlastníka, takže vidí tabulku,
-- ale ven pustí jen court + slot_date + start_time od dneška dál.
-- Supabase Security Advisor u ní ukáže varování 0028/0029
-- ("SECURITY DEFINER function executable by anon"). Je to ZÁMĚR:
-- je to veřejný endpoint, který vrací jen neosobní údaje.
create or replace function public.kurtik_taken_slots()
returns table (court smallint, slot_date date, start_time time)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct b.court, b.slot_date, b.start_time
  from public.kurtik_bookings as b
  where b.slot_date >= (now() at time zone 'Europe/Prague')::date
  order by b.slot_date, b.start_time, b.court;
$$;

comment on function public.kurtik_taken_slots() is
  'Veřejný seznam obsazených termínů (jen kurt, datum, čas). Žádná jména ani e-maily.';

revoke execute on function public.kurtik_taken_slots() from public;
grant execute on function public.kurtik_taken_slots() to anon, authenticated, service_role;
