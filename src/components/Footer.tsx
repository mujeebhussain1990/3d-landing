import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-ground py-14">
      <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-8 xl:pl-44 grid gap-10 md:grid-cols-12`}>
        <div className="md:col-span-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hashone-logo.svg" alt="HashOne Global" width={131} height={25} className="h-[25px] w-auto" />
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-ink-faint">
            We build high-performing digital solutions that turn ideas into impact.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-ink-soft sm:grid-cols-3 md:col-span-5">
          <li>Florida, US</li>
          <li>Toronto, Canada</li>
          <li>Dubai, UAE</li>
          <li>Riyadh, KSA</li>
          <li>Karachi, Pakistan</li>
        </ul>
        <div className="flex gap-6 text-sm md:col-span-2 md:flex-col md:items-end md:gap-2">
          <Link href="/blog" className="text-ink hover:text-accent">
            Blog
          </Link>
          <a href="mailto:info@hashoneglobal.com" className="text-ink hover:text-accent">
            Email us
          </a>
        </div>
        <p className="border-t border-rule pt-6 text-xs text-ink-faint md:col-span-12">© 2026 HashOne Global</p>
      </div>
    </footer>
  );
}
