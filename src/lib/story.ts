import gsap from "gsap";

// Shared, mutable scroll/pointer state. GSAP writes it, the render loop reads it,
// so nothing here ever triggers a React render.
export const STAGES = ["Idea", "Mobile", "Web", "AI", "Cloud", "Global"] as const;

export const story = {
  /** 0 = idea swarm … 5 = globe; fractional values are mid-morph (home page scroll) */
  progress: 0,
  /** when true the form is driven by from/to/mix instead of scroll progress */
  direct: false,
  from: 0,
  to: 0,
  mix: 1,
  /** horizontal placement of the particle form, as a fraction of half the viewport */
  offsetX: 0,
  /** size multiplier for the whole form (layouts that frame it smaller) */
  scale: 1,
  /** 0 → 1 overall brightness, lowered behind long-form reading */
  dim: 1,
  /** 0 → 1 intro burst from a single point */
  intro: 0,
  /** pointer in NDC (-1..1) */
  mouse: { x: 0, y: 0, active: 0 },
  reducedMotion: false,
};

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Morph the particle form straight to a stage, from wherever it is now */
export function morphTo(stage: number, duration = 1.7) {
  if (!story.direct) {
    story.direct = true;
    story.from = story.to = Math.min(5, Math.round(story.progress));
    story.mix = 1;
  }
  if (stage === story.to && story.mix > 0) return;
  gsap.killTweensOf(story, "mix");
  story.from = story.mix > 0.5 ? story.to : story.from;
  story.to = stage;
  story.mix = 0;
  if (prefersReducedMotion()) {
    story.mix = 1;
    return;
  }
  gsap.to(story, { mix: 1, duration, ease: "power2.inOut" });
}

/** Hand control back to the home page's scroll-driven assembly */
export function releaseToScroll() {
  gsap.killTweensOf(story, "mix");
  story.direct = false;
  story.dim = 1;
}

export function playIntro() {
  if (story.intro > 0) return;
  if (prefersReducedMotion()) {
    story.intro = 1;
    return;
  }
  gsap.fromTo(story, { intro: 0 }, { intro: 1, duration: 2.8, delay: 0.35, ease: "power2.inOut" });
}

type StageListener = (stage: number) => void;
const listeners = new Set<StageListener>();
let currentStage = 0;

export function onStage(cb: StageListener) {
  listeners.add(cb);
  cb(currentStage);
  return () => void listeners.delete(cb);
}

export function setStage(stage: number) {
  if (stage === currentStage) return;
  currentStage = stage;
  listeners.forEach((cb) => cb(stage));
}
