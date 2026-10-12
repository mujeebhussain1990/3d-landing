"use client";

import { useEffect, useState } from "react";
import { STAGES, onStage } from "@/lib/story";
import { scrollToTarget } from "./SmoothScroll";

const TARGETS = ["#top", "#mobile", "#web", "#ai", "#cloud", "#offices"];

export default function AssemblyRail() {
  const [stage, setStage] = useState(0);
  const [onField, setOnField] = useState<string | null>(null);
  useEffect(() => onStage(setStage), []);

  // Re-ink the rail while a accent field sits behind it
  useEffect(() => {
    const fields = document.querySelectorAll(".on-field");
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        const field = [...seen][0];
        setOnField(field ? (field.classList.contains("field-blue") ? "field-blue" : "field-cyan") : null);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    fields.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Assembly stages"
      data-on-field={onField ? true : undefined}
      className={`${onField ?? ""} group/rail fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block`}
    >
      <ol className="relative flex flex-col gap-4 border-l border-rule py-1 pl-4 transition-colors group-data-[on-field]/rail:border-on-field/25">
        <span
          aria-hidden
          className="absolute -left-px top-0 w-px bg-accent transition-[height] duration-700 ease-[var(--ease-out)] group-data-[on-field]/rail:bg-on-field"
          style={{ height: `${(stage / (STAGES.length - 1)) * 100}%` }}
        />
        {STAGES.map((name, i) => {
          const active = i === stage;
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => scrollToTarget(TARGETS[i])}
                aria-current={active ? "step" : undefined}
                className={`group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                  onField
                    ? active
                      ? "text-on-field"
                      : "text-on-field-soft hover:text-on-field"
                    : active
                      ? "text-accent"
                      : i < stage
                        ? "text-ink-soft"
                        : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 transition-transform duration-500 ${active ? "scale-150 bg-current" : "bg-current"}`}
                />
                {name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
