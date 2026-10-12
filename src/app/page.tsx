import StoryScroll from "@/components/StoryScroll";
import AssemblyRail from "@/components/AssemblyRail";
import OfficeClocks from "@/components/OfficeClocks";
import ContactForm from "@/components/ContactForm";
import { Arrow, ArrowDown } from "@/components/ui";
import Footer from "@/components/Footer";
import { SERVICES, MORE, PARTNERS } from "@/lib/content";

const wrap = "mx-auto w-full max-w-[1440px] px-4 sm:px-8 xl:pl-44";

export default function Home() {
  return (
    <>
      <StoryScroll />
      <AssemblyRail />

      <main className="relative z-10">
        {/* Idea */}
        <section
          id="top"
          data-stage="0"
          data-offset="0.28"
          className="relative flex min-h-[100svh] flex-col justify-end pb-8 pt-24 sm:pb-10"
        >
          <div className={`${wrap} grid items-end gap-10 lg:grid-cols-12`}>
            <h1 className="display text-[clamp(3.6rem,10.5vw,6rem)] lg:col-span-7">
              {["Ideas", "into", "Impact."].map((w, i) => (
                <span key={w} className="block overflow-hidden pb-[0.08em]">
                  <span data-hero-line className={`block ${i === 2 ? "text-accent" : ""}`}>
                    {w}
                  </span>
                </span>
              ))}
            </h1>
            <div className="flex flex-col gap-7 lg:col-span-5 lg:max-w-md lg:justify-self-end">
              <p data-hero-fade className="text-lg leading-relaxed text-ink-soft sm:text-xl">
                HashOne Global builds high-performing web, mobile, AI and cloud products, taking a first idea all the way to launch.
              </p>
              <div data-hero-fade className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-3 bg-accent px-6 py-4 text-sm rounded-full font-bold text-on-field transition-colors hover:bg-[#8fe3fa]"
                >
                  Start a project
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a href="#mobile" className="text-sm font-semibold text-ink underline decoration-field/60 hover:decoration-field">
                  See what we build
                </a>
              </div>
            </div>
          </div>

          <div className={`${wrap} mt-12 flex items-center justify-between gap-6 border-t border-rule pt-5 text-xs text-ink-faint`}>
            <span data-hero-fade className="inline-flex items-center gap-2 uppercase tracking-[0.14em]">
              <ArrowDown className="text-accent" /> Scroll to assemble
            </span>
            <span data-hero-fade className="hidden sm:inline">
              Florida · Toronto · Dubai · Riyadh · Karachi
            </span>
          </div>
        </section>

        {/* Mobile → Web → AI → Cloud */}
        {SERVICES.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            data-stage={i + 1}
            data-offset="0.45"
            aria-labelledby={`${s.id}-h`}
            className="relative flex min-h-[135svh] items-end lg:items-center"
          >
            <div className={`${wrap} pb-16 pt-[62svh] lg:py-32`}>
              <div
                data-reveal
                className="relative -mx-4 bg-linear-to-t from-ground from-55% to-transparent px-4 pt-20 sm:-mx-8 sm:px-8 lg:mx-0 lg:max-w-[min(46%,40rem)] lg:bg-none lg:px-0 lg:pt-0"
              >
                <h2 id={`${s.id}-h`} className="display text-[clamp(3.5rem,9vw,6rem)]">
                  {s.title}
                </h2>
                <p className="mt-7 max-w-[34ch] text-xl leading-snug text-ink sm:text-2xl">{s.lead}</p>
                <ul className="mt-10 border-t border-rule">
                  {s.rows.map((r) => (
                    <li key={r} className="flex items-center justify-between border-b border-rule py-3.5 text-[15px] text-ink-soft">
                      {r}
                      <span aria-hidden className="h-1 w-1 bg-accent" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* The rest of the build — accent field */}
        <section aria-labelledby="more-h" className="on-field field-blue relative bg-field py-24 text-on-field sm:py-32">
          <div className={wrap}>
            <h2 id="more-h" data-wipe className="display max-w-[14ch] text-[clamp(2.75rem,7.5vw,6rem)]">
              And the rest of the build
            </h2>
            <ul data-reveal className="mt-16 border-t-2 border-on-field sm:mt-24">
              {MORE.map((m) => (
                <li key={m.name} className="grid gap-3 border-b border-on-field/25 py-8 md:grid-cols-12 md:items-baseline md:gap-8 md:py-10">
                  <h3 className="display text-[clamp(1.9rem,4vw,3.25rem)] md:col-span-7">{m.name}</h3>
                  <p className="max-w-[44ch] text-lg leading-snug text-on-field-soft md:col-span-5">{m.text}</p>
                </li>
              ))}
            </ul>
            <ul aria-label="Partnerships" className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
              {PARTNERS.map((p) => (
                <li key={p} className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 bg-on-field" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Global */}
        <section
          id="offices"
          data-stage="5"
          data-offset="0.5"
          aria-labelledby="offices-h"
          className="relative flex min-h-[140svh] items-end lg:items-center"
        >
          <div className={`${wrap} pb-24 pt-[70svh] lg:py-36`}>
            <div
              data-reveal
              className="-mx-4 bg-linear-to-t from-ground from-70% to-transparent px-4 pt-24 sm:-mx-8 sm:px-8 lg:mx-0 lg:max-w-[min(46%,40rem)] lg:bg-none lg:px-0 lg:pt-0"
            >
              <h2 id="offices-h" className="display text-[clamp(2.9rem,7vw,5.25rem)]">
                Five offices. One build.
              </h2>
              <p className="mt-7 max-w-[38ch] text-xl leading-snug text-ink-soft sm:text-2xl">
                For <span className="tabular font-semibold text-ink">10+</span> years,{" "}
                <span className="tabular font-semibold text-ink">200+</span> people have shipped{" "}
                <span className="tabular font-semibold text-ink">100+</span> projects for clients in{" "}
                <span className="tabular font-semibold text-ink">50+</span> countries, and hold a{" "}
                <span className="tabular font-semibold text-ink">5.0</span> rating on Clutch.
              </p>
              <div className="mt-12">
                <OfficeClocks />
              </div>
            </div>
          </div>
        </section>

        {/* Contact — accent field */}
        <section id="contact" aria-labelledby="contact-h" className="on-field field-cyan relative bg-field py-24 text-on-field sm:py-32">
          <div className={`${wrap} grid gap-16 lg:grid-cols-12 lg:gap-12`}>
            <div className="lg:col-span-5">
              <h2 id="contact-h" data-wipe className="display text-[clamp(2.9rem,7vw,5.5rem)]">
                Got an idea? Let’s build it.
              </h2>
              <a
                href="mailto:info@hashoneglobal.com"
                className="mt-10 inline-block break-all text-xl font-semibold underline decoration-on-field/40 decoration-2 underline-offset-[0.25em] hover:decoration-on-field sm:text-2xl"
              >
                info@hashoneglobal.com
              </a>
              <ul className="mt-10 grid gap-3 border-t border-on-field/25 pt-6 text-[15px] font-medium text-on-field-soft">
                <li>Reply within 24 hours</li>
                <li>100% confidential, NDA ready</li>
                <li>Rated 5.0 on Clutch</li>
              </ul>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
