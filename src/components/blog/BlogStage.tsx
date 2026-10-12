"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { story, morphTo, playIntro, prefersReducedMotion } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hands the particle form to a blog page: morphs it to the page's topic,
 * places it, and (for articles) lets it fade back while the visitor reads.
 */
export default function BlogStage({
  stage,
  offset = 0.5,
  dimWhenReading,
}: {
  stage: number;
  offset?: number;
  /** selector of the element that, once reached, dims the form behind the text */
  dimWhenReading?: string;
}) {
  useGSAP(() => {
    story.reducedMotion = prefersReducedMotion();
    story.offsetX = offset;
    story.dim = 1;
    story.scale = 1;
    playIntro();
    morphTo(stage);

    if (dimWhenReading) {
      ScrollTrigger.create({
        trigger: dimWhenReading,
        start: "top 55%",
        end: "top 5%",
        scrub: true,
        onUpdate: (self) => (story.dim = 1 - self.progress * 0.75),
      });
    }

    return () => {
      story.dim = 1;
    };
  }, [stage, offset, dimWhenReading]);

  return null;
}
