"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function scrollToTarget(target: string | HTMLElement | number) {
  if (typeof target === "number") {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Routes that deliberately keep the browser's own scroll (Variant B snaps instead of gliding) */
const NATIVE_SCROLL = ["/v2"];

export default function SmoothScroll() {
  const pathname = usePathname();
  const native = NATIVE_SCROLL.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (prefersReducedMotion() || native) return;

    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Same-page anchors travel through Lenis so the morph scrubs instead of jumping
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      e.preventDefault();
      e.stopPropagation();
      scrollToTarget(url.hash);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, [native]);

  // A new route starts at its own top (or its hash), not where Lenis last was
  useEffect(() => {
    if (!lenis) {
      if (!location.hash) window.scrollTo(0, 0);
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }
    const hash = location.hash;
    lenis.scrollTo(hash && document.querySelector(hash) ? hash : 0, { immediate: true, force: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return null;
}
