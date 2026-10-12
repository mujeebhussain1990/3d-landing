"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { story, setStage, prefersReducedMotion, releaseToScroll, playIntro } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Drives the particle assembly from scroll. Every element with `data-stage="n"`
 * morphs the form from stage n-1 to n as its top travels from 85% to 25% of the
 * viewport; `data-offset` places the form horizontally (fraction of half-width).
 */
export default function StoryScroll() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const reduced = prefersReducedMotion();
    story.reducedMotion = reduced;
    releaseToScroll();
    story.scale = 1;
    const firstVisit = story.intro === 0;
    playIntro();

    const hero = document.querySelector<HTMLElement>("[data-stage='0']");
    const stages = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"))
      .filter((el) => el.dataset.stage !== "0")
      .sort((a, b) => Number(a.dataset.stage) - Number(b.dataset.stage));
    const baseOffset = Number(hero?.dataset.offset ?? 0);

    let anchors: { start: number; end: number; offset: number }[] = [];
    const measure = () => {
      const vh = window.innerHeight;
      anchors = stages.map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { start: top - vh * 0.85, end: top - vh * 0.25, offset: Number(el.dataset.offset ?? 0) };
      });
    };

    const update = () => {
      const y = window.scrollY;
      let progress = 0;
      let offset = baseOffset;
      for (const a of anchors) {
        const w = gsap.utils.clamp(0, 1, (y - a.start) / (a.end - a.start));
        progress += w;
        offset += (a.offset - offset) * w;
      }
      story.progress = progress;
      story.offsetX = offset;
      setStage(Math.round(progress));
    };

    measure();
    update();
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: update,
      onRefresh: () => {
        measure();
        update();
      },
    });

    if (reduced) return;

    // Intro: a single point of light, then the burst, then the words
    const lead = firstVisit ? 1.25 : 0.2;
    gsap.from("[data-hero-line]", {
      yPercent: 105,
      duration: 1.4,
      delay: lead,
      stagger: 0.09,
      ease: "expo.out",
    });
    gsap.from("[data-hero-fade]", {
      opacity: 0,
      y: 18,
      filter: "blur(8px)",
      duration: 1.2,
      delay: lead + 0.45,
      stagger: 0.08,
      ease: "expo.out",
    });

    // Section copy resolves out of a blur as it arrives
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.from(el.querySelectorAll(":scope > *"), {
        opacity: 0,
        y: 28,
        filter: "blur(10px)",
        duration: 1.1,
        stagger: 0.07,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
    });

    // Display headings wipe in along the line of reading
    gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((el) => {
      gsap.from(el, {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
  });

  return <span ref={ref} hidden />;
}
