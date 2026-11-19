import { connection, type NextRequest } from "next/server";
import { CLUB_NAME, getCourt } from "@/lib/config";
import { parseSlot } from "@/lib/slot";
import { getSlotEnd } from "@/lib/time";

// RFC 5545 asks for the time zone definition whenever TZID is used.
const PRAGUE_TIME_ZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Prague",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** '2026-11-19', '18:00' → '20261119T180000' (Prague local time) */
function toLocalDateTime(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

// Backslashes, semicolons and commas are special in iCalendar text values.
function escapeText(value: string): string {
  return value.replace(/[\\;,]/g, (char) => `\\${char}`);
}

export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;
  const slot = parseSlot(params.get("kurt"), params.get("den"), params.get("cas"));
  const court = slot ? getCourt(slot.court) : undefined;
  if (!slot || !court) {
    return new Response("Odkaz na termín není platný.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // DTSTAMP is the only value iCalendar wants in UTC ('20261118T201530Z').
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TK Mickovice//Kurtik//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...PRAGUE_TIME_ZONE,
    "BEGIN:VEVENT",
    `UID:${toLocalDateTime(slot.date, slot.time)}-kurt-${slot.court}@kurtik.tk-mickovice`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Prague:${toLocalDateTime(slot.date, slot.time)}`,
    `DTEND;TZID=Europe/Prague:${toLocalDateTime(slot.date, getSlotEnd(slot.time))}`,
    `SUMMARY:${escapeText(`Tenis: ${CLUB_NAME}, ${court.name}`)}`,
    `LOCATION:${escapeText(CLUB_NAME)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kurt-tk-mickovice.ics"',
    },
  });
}
