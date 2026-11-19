"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Horizontal row of day chips; keeps the selected chip in view on narrow screens.
export function DayScroller({ selected, children }: { selected: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = ref.current;
    const chip = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !chip) return;
    const chipStart = chip.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
    const chipEnd = chipStart + chip.offsetWidth;
    if (chipStart < row.scrollLeft || chipEnd > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = chipStart - (row.clientWidth - chip.offsetWidth) / 2;
    }
  }, [selected]);

  return (
    <div
      ref={ref}
      className="no-scrollbar relative -mx-4 snap-x snap-proximity scroll-px-4 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0"
    >
      {children}
    </div>
  );
}
