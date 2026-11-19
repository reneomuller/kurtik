-- Hodina 19. 11. 2026: tabulka i funkce už ve sdíleném projektu Supabase jsou
-- (kurtik_bookings, kurtik_taken_slots, včetně unikátního omezení). Soubor je popis, znovu ho nespouštějte.
-- Kurtík · TK Míčkovice · krok P3: jeden termín = jedna rezervace
-- Spustit jednou v Supabase → SQL Editor na databázi vytvořené podle schema.sql (stav PŘED P3).
-- Rozhodnutí třídy: platí rezervace, která přišla první.
-- Skript jde spustit i opakovaně; buď proběhne celý, nebo vůbec.

begin;

-- Během úprav nikdo nevloží novou rezervaci, takže mezi smazáním a omezením nevznikne duplicita.
lock table public.kurtik_bookings in share row exclusive mode;

-- 1) Smazat duplicity: ze stejného court + slot_date + start_time
--    zůstane jen rezervace s nejmenším id (ta, která přišla první).
delete from public.kurtik_bookings as newer
using public.kurtik_bookings as older
where older.court = newer.court
  and older.slot_date = newer.slot_date
  and older.start_time = newer.start_time
  and older.id < newer.id;

-- 2) Unikátní omezení: druhý insert na stejný termín skončí chybou 23505.
alter table public.kurtik_bookings
  drop constraint if exists kurtik_bookings_one_per_slot;
alter table public.kurtik_bookings
  add constraint kurtik_bookings_one_per_slot unique (court, slot_date, start_time);

commit;
