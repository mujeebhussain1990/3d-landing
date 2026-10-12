"use client";

import { useEffect, useState } from "react";

const OFFICES = [
  { city: "Toronto", country: "Canada", tz: "America/Toronto" },
  { city: "Florida", country: "United States", tz: "America/New_York" },
  { city: "Dubai", country: "UAE", tz: "Asia/Dubai" },
  { city: "Riyadh", country: "Saudi Arabia", tz: "Asia/Riyadh" },
  { city: "Karachi", country: "Pakistan", tz: "Asia/Karachi" },
];

function timeIn(tz: string, now: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(now);
}

function isWorkingHours(tz: string, now: Date) {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(now));
  const day = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(now);
  const weekend = tz === "Asia/Riyadh" ? day === "Fri" || day === "Sat" : day === "Sat" || day === "Sun";
  return !weekend && h >= 9 && h < 18;
}

export default function OfficeClocks({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  if (compact) {
    return (
      <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {OFFICES.map((o) => {
          const open = now ? isWorkingHours(o.tz, now) : false;
          return (
            <li key={o.city} className="min-w-[9.5rem] shrink-0 snap-start rounded-2xl border border-rule bg-ground-2/80 px-4 py-3 text-left sm:min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-base font-bold text-ink">{o.city}</span>
                <time className="tabular text-sm font-semibold text-ink" suppressHydrationWarning>
                  {now ? timeIn(o.tz, now) : "--:--"}
                </time>
              </div>
              <span className={`mt-1 inline-flex items-center gap-1.5 text-xs ${open ? "text-accent" : "text-ink-faint"}`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${open ? "bg-accent" : "bg-ink-faint"}`} />
                {now ? (open ? "In office now" : "After hours") : "\u00a0"}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="border-t border-rule">
      {OFFICES.map((o) => {
        const open = now ? isWorkingHours(o.tz, now) : false;
        return (
          <li key={o.city} className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-rule py-4 sm:py-5">
            <div className="min-w-0">
              <span className="display block text-[clamp(1.5rem,3vw,2.25rem)] leading-none">{o.city}</span>
              <span className="mt-1.5 block text-sm text-ink-faint">{o.country}</span>
            </div>
            <div className="text-right">
              <time className="tabular block text-[clamp(1.25rem,2.4vw,1.75rem)] font-semibold text-ink" suppressHydrationWarning>
                {now ? timeIn(o.tz, now) : "--:--"}
              </time>
              <span className={`mt-1 inline-flex items-center gap-1.5 text-xs ${open ? "text-accent" : "text-ink-faint"}`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${open ? "bg-accent" : "bg-ink-faint"}`} />
                {now ? (open ? "In office now" : "After hours") : " "}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
