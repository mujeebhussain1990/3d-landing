"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { morphTo } from "@/lib/story";
import type { PostSummary } from "@/lib/blog";
import { Arrow } from "../ui";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function BlogList({ posts }: { posts: PostSummary[] }) {
  const topics = useMemo(() => {
    const seen = new Map<string, number>();
    posts.forEach((p) => seen.set(p.topic.label, p.topic.stage));
    return [...seen].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const [filter, setFilter] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(posts[0]?.slug ?? null);
  const list = filter ? posts.filter((p) => p.topic.label === filter) : posts;
  const listRef = useRef<HTMLOListElement>(null);
  const hovering = useRef(false);

  const activate = (p: PostSummary) => {
    setActive(p.slug);
    morphTo(p.topic.stage);
  };

  // While scrolling (and on touch screens) the row crossing the middle drives the form
  useEffect(() => {
    const rows = listRef.current?.querySelectorAll<HTMLElement>("[data-slug]");
    if (!rows) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (hovering.current) return;
        const hit = entries.find((e) => e.isIntersecting);
        if (!hit) return;
        const p = posts.find((x) => x.slug === (hit.target as HTMLElement).dataset.slug);
        if (p) activate(p);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, [posts, filter]);

  return (
    <div>
      <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
        {[["All", -1] as const, ...topics].map(([label, stage]) => {
          const on = label === "All" ? filter === null : filter === label;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setFilter(label === "All" ? null : label);
                morphTo(stage === -1 ? 0 : stage);
              }}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 ${
                on ? "border-accent bg-accent text-on-field" : "border-rule text-ink-soft hover:border-accent/60 hover:text-ink"
              }`}
            >
              {label}
              <span className={`tabular ml-2 ${on ? "text-on-field-soft" : "text-ink-faint"}`}>
                {label === "All" ? posts.length : posts.filter((p) => p.topic.label === label).length}
              </span>
            </button>
          );
        })}
      </div>

      <ol
        ref={listRef}
        className="mt-10 border-t border-rule"
        onPointerEnter={() => (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
      >
        {list.map((p, i) => {
          const on = active === p.slug;
          const lead = i === 0 && !filter;
          return (
            <li key={p.slug} data-slug={p.slug} className="border-b border-rule">
              <Link
                href={`/blog/${p.slug}`}
                onPointerEnter={() => activate(p)}
                onFocus={() => activate(p)}
                className="group grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 py-7 sm:grid-cols-[7.5rem_1fr_auto] sm:py-8"
              >
                <div className="col-start-1 row-start-1 flex items-center gap-3 text-xs text-ink-faint sm:block sm:pt-1.5">
                  <time dateTime={p.date} className="tabular block">{fmt.format(new Date(p.date))}</time>
                  <span className="text-ink-faint sm:mt-1.5 sm:block">{p.minutes} min read</span>
                </div>

                <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">
                  <span
                    className={`mb-2.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      on ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    <span aria-hidden className={`h-1.5 w-1.5 transition-colors ${on ? "bg-accent" : "bg-ink-faint"}`} />
                    {p.topic.label}
                  </span>
                  <h2
                    className={`headline transition-colors duration-300 ${
                      lead ? "text-[clamp(1.75rem,3.2vw,2.6rem)]" : "text-[clamp(1.3rem,2.1vw,1.7rem)]"
                    } ${on ? "text-ink" : "text-ink-soft"}`}
                  >
                    {p.title}
                  </h2>
                  {lead && <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-ink-faint">{p.excerpt}</p>}
                </div>

                <span
                  aria-hidden
                  className={`col-start-2 row-start-1 self-start pt-1 transition-[color,transform] duration-300 group-hover:translate-x-1 sm:col-start-3 ${
                    on ? "text-accent" : "text-ink-faint"
                  }`}
                >
                  <Arrow />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
