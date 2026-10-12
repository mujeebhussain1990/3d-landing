"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { prefersReducedMotion, releaseToScroll } from "@/lib/story";
import { scrollToTarget } from "../../SmoothScroll";
import { journey, CHAPTERS } from "./journey";
import { soundOn, soundOff, chime } from "./sound";

const MonolithCanvas = dynamic(() => import("./MonolithCanvas"), { ssr: false });

export type Chapter = { id: string; label: string; content: ReactNode };

/* ───────────── loader ───────────── */

function Loader({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"loading" | "ready" | "gone">("loading");
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const total = reduced ? 300 : 2200;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / total);
      setN(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase("ready");
        setTimeout(() => {
          setPhase("gone");
          done.current();
        }, reduced ? 100 : 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cells = 14;
  const lit = Math.round((n / 100) * cells);
  return (
    <div
      aria-hidden={phase === "gone"}
      role="status"
      className={`fixed inset-0 z-[60] grid place-items-center bg-[#03050c] transition-[opacity,visibility] duration-1000 ${
        phase === "gone" ? "invisible opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-3">
          {Array.from({ length: cells }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 transition-colors duration-200 ${i < lit ? "bg-accent shadow-[0_0_10px_#5fd4f4]" : "bg-ink-faint/30"}`}
            />
          ))}
        </div>
        <p className="tabular text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          {phase === "loading" ? `Loading the build · ${n}%` : "Ready to explore"}
        </p>
      </div>
    </div>
  );
}

/* ───────────── HUD frame ───────────── */

/** Hairline frame with chamfered corners, measured in pixels so corners never stretch */
function Frame() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = box;
  const c = 22;
  const d = `M${c} .5 H${w - c} L${w - 0.5} ${c} V${h - c} L${w - c} ${h - 0.5} H${c} L.5 ${h - c} V${c} Z`;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-3 z-10 sm:inset-5">
      {w > 0 && (
        <svg width={w} height={h} className="absolute inset-0">
          <path d={d} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}

/* ───────────── stage ───────────── */

export default function MonolithStage({ chapters }: { chapters: Chapter[] }) {
  const section = useRef<HTMLElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    releaseToScroll();
    const reduced = prefersReducedMotion();
    const el = section.current;
    if (!el) return;

    let target = 0;
    const read = () => {
      const r = el.getBoundingClientRect();
      const travel = el.offsetHeight - innerHeight;
      const raw = Math.min(1, Math.max(0, -r.top / Math.max(1, travel))) * (CHAPTERS - 1);
      // linger in each place, then travel
      const i = Math.min(Math.floor(raw), CHAPTERS - 2);
      const f = raw - i;
      const t = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
      target = i + t * t * (3 - 2 * t);
      if (bar.current) bar.current.style.transform = `scaleX(${raw / (CHAPTERS - 1)})`;
    };
    read();
    journey.progress = target;

    let raf = 0;
    let last = -1;
    let prev = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      // same glide at any frame rate: about 60% of the way each quarter second
      journey.progress = reduced ? Math.round(target) : journey.progress + (target - journey.progress) * (1 - Math.exp(-dt * 3.6));
      const key = Math.round(journey.progress * 1000);
      if (key === last) return;
      last = key;
      for (let s = 0; s < CHAPTERS; s++) {
        const d = journey.progress - s;
        const a = Math.max(0, 1 - Math.abs(d) / 0.3);
        const panel = panels.current[s];
        if (!panel) continue;
        panel.style.opacity = String(a);
        panel.style.transform = `translate3d(0, ${-d * 40}px, 0)`;
        panel.style.filter = a < 0.99 ? `blur(${(1 - a) * 10}px)` : "";
        panel.style.visibility = a > 0.001 ? "visible" : "hidden";
        panel.style.pointerEvents = a > 0.8 ? "auto" : "none";
      }
      const here = Math.round(journey.progress);
      if (here !== activeRef.current) {
        activeRef.current = here;
        setActive(here);
        chime(here);
      }
    };
    raf = requestAnimationFrame(loop);

    addEventListener("scroll", read, { passive: true });
    addEventListener("resize", read);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", read);
      removeEventListener("resize", read);
      soundOff();
    };
  }, []);

  const jump = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    scrollToTarget(top + ((el.offsetHeight - innerHeight) * i) / (CHAPTERS - 1));
  };

  const toggleSound = () => {
    if (sound) soundOff();
    else soundOn();
    setSound(!sound);
  };

  return (
    <section ref={section} aria-label="What we build" className="relative" style={{ height: `${CHAPTERS * 120}svh` }}>
      <Loader onDone={() => setReady(true)} />
      <div className="sticky top-0 h-svh overflow-hidden bg-[#03050c]">
        <MonolithCanvas />

        {/* instrument frame */}
        <Frame />

        {/* chapter index */}
        <nav aria-label="Chapters" className="absolute left-8 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
          <ol className="flex flex-col gap-3">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={active === i ? "step" : undefined}
                  className={`flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
                    active === i ? "text-ink" : "text-ink-faint/70 hover:text-ink-soft"
                  }`}
                >
                  <span aria-hidden className={`h-1.5 w-1.5 transition-all duration-300 ${active === i ? "bg-ink" : "bg-transparent"}`} />
                  {c.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* a pool of shadow under the copy so light behind it never fights the words */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[52%]"
          style={{ background: "radial-gradient(60% 75% at 50% 100%, rgb(3 5 12 / 0.88), rgb(3 5 12 / 0.55) 45%, transparent 75%)" }}
        />

        {/* chapter copy, centred low like a title card */}
        {chapters.map((c, i) => (
          <div
            key={c.id}
            id={c.id}
            ref={(n) => void (panels.current[i] = n)}
            className={`absolute inset-x-0 bottom-24 z-20 flex justify-center px-6 transition-opacity duration-700 sm:bottom-28 ${ready ? "" : "!opacity-0"}`}
            style={{ visibility: i === 0 ? "visible" : "hidden", opacity: i === 0 ? 1 : 0 }}
          >
            <div className="flex w-full min-w-0 max-w-2xl flex-col items-center gap-5 text-center">{c.content}</div>
          </div>
        ))}

        {/* bottom instrument bar */}
        <div className="absolute inset-x-3 bottom-3 z-20 flex h-12 items-stretch border-t border-white/10 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft sm:inset-x-5 sm:bottom-5">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="flex items-center gap-2.5 border-r border-white/10 px-5 transition-colors hover:text-ink"
          >
            <SoundIcon on={sound} />
            Sound {sound ? "on" : "off"}
          </button>
          <div className="relative flex-1 overflow-hidden">
            <div ref={bar} className="absolute inset-y-0 left-0 w-full origin-left bg-white/[0.04]" style={{ transform: "scaleX(0)" }} />
            <div className="absolute inset-0 flex items-center px-5">
              <span className="tabular whitespace-nowrap text-ink-faint">
                {String(active + 1).padStart(2, "0")} / {String(CHAPTERS).padStart(2, "0")}
              </span>
            </div>
          </div>
          <a href="#v2-contact" className="hidden items-center gap-2.5 border-l border-white/10 px-5 transition-colors hover:text-accent sm:flex">
            Start a project
          </a>
        </div>
      </div>
    </section>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" stroke="none" />
      {on ? <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.6a6 6 0 0 1 0 8.8" /> : <path d="M11 6l4 4M15 6l-4 4" />}
    </svg>
  );
}
