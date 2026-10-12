"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Arrow } from "./ui";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const pathname = usePathname();
  const inBlog = pathname.startsWith("/blog");

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500 ${
        solid ? "border-b border-rule bg-ground" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:h-[72px]">
        <Link href="/" aria-label="HashOne Global home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hashone-logo.svg" alt="HashOne Global" width={131} height={25} className="h-[22px] w-auto lg:h-[25px]" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          <Link href="/#mobile" className="transition-colors hover:text-ink">Services</Link>
          <Link href="/#offices" className="transition-colors hover:text-ink">Offices</Link>
          <Link
            href="/blog"
            aria-current={inBlog ? "page" : undefined}
            className={`transition-colors hover:text-ink ${inBlog ? "text-accent" : ""}`}
          >
            Blog
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-ink">Contact</Link>
        </nav>

        <div className="flex items-center gap-5">
          <span className="hidden text-xs text-ink-faint lg:inline">Reply within 24 hours</span>
          <Link
            href="/#contact"
            className="group inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-[13px] rounded-full font-bold text-on-field transition-colors hover:bg-[#8fe3fa]"
          >
            Start a project
            <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
