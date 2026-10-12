import type { Metadata } from "next";
import MonolithStage, { type Chapter } from "@/components/v2/monolith/MonolithStage";
import Words from "@/components/v2/Words";
import OfficeClocks from "@/components/OfficeClocks";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import { SERVICES, MORE, PARTNERS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ideas into Impact (Variant B)",
};

const pad = "px-4 sm:px-8 lg:px-12";
/** title-card heading: wide-tracked caps, modest size, the scene is the hero */
const card = "font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold uppercase leading-[1.08] tracking-[0.03em] text-ink [text-wrap:balance]";
const lead = "max-w-[54ch] text-[15px] leading-relaxed text-ink-soft";
const STAT = "tabular font-semibold text-ink";
/** chamfered button, cut like the frame around the page */
const chamfer =
  "inline-flex items-center gap-2.5 bg-white/[0.06] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink backdrop-blur-sm transition-colors hover:bg-accent hover:text-on-accent [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]";

const CHAPTER_LIST: Chapter[] = [
  {
    id: "v2-top",
    label: "Idea",
    content: (
      <>
        <h1 className={card}>
          Ideas into <span className="text-accent">Impact.</span>
        </h1>
        <p className={lead}>
          HashOne Global builds high-performing web, mobile, AI and cloud products, taking a first idea all the way to launch.
        </p>
        <a href="#v2-contact" className={chamfer}>
          <span aria-hidden className="h-1.5 w-1.5 bg-current" />
          Start a project
        </a>
      </>
    ),
  },
  ...SERVICES.map<Chapter>((s) => ({
    id: `v2-${s.id}`,
    label: s.title,
    content: (
      <>
        <h2 className={card}>{s.title}</h2>
        <p className={lead}>{s.lead}</p>
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {s.rows.map((r) => (
            <li key={r} className="flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 bg-accent" />
              {r}
            </li>
          ))}
        </ul>
      </>
    ),
  })),
  {
    id: "v2-offices",
    label: "Global",
    content: (
      <>
        <h2 className={card}>Five offices. One build.</h2>
        <p className={lead}>
          For <span className={STAT}>10+</span> years, <span className={STAT}>200+</span> people have shipped{" "}
          <span className={STAT}>100+</span> projects for clients in <span className={STAT}>50+</span> countries, and hold a{" "}
          <span className={STAT}>5.0</span> rating on Clutch.
        </p>
        <div className="w-full min-w-0 overflow-hidden text-left">
          <OfficeClocks compact />
        </div>
      </>
    ),
  },
];

export default function VariantB() {
  return (
    <>
      <main className="relative z-10">
        <MonolithStage chapters={CHAPTER_LIST} />

        {/* The rest of the build: columns, not rows */}
        <section aria-labelledby="v2-more-h" className="on-field field-blue relative bg-field py-24 text-on-field sm:py-32">
          <div className={`mx-auto max-w-[1440px] ${pad}`}>
            <h2 id="v2-more-h" data-rise className="display ml-auto max-w-[12ch] text-right text-[clamp(2.75rem,6.5vw,5.5rem)]">
              <Words text="And the rest of the build" />
            </h2>
            <ul data-columns className="mt-16 grid gap-3 sm:mt-24 sm:grid-cols-2 lg:grid-cols-4">
              {MORE.map((m) => (
                <li
                  key={m.name}
                  data-column
                  className="flex min-h-[18rem] flex-col justify-between gap-10 rounded-[18px] bg-on-field/[0.08] p-6 lg:min-h-[26rem]"
                >
                  <p className="max-w-[30ch] text-lg leading-snug text-on-field-soft">{m.text}</p>
                  <h3 className="display text-[clamp(1.9rem,2.8vw,2.6rem)]">{m.name}</h3>
                </li>
              ))}
            </ul>
            <ul aria-label="Partnerships" className="mt-14 flex flex-wrap justify-center gap-3 text-sm font-semibold">
              {PARTNERS.map((p) => (
                <li key={p} className="rounded-full border border-on-field/30 px-4 py-2">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact: one centred column */}
        <section id="v2-contact" aria-labelledby="v2-contact-h" className="on-field field-cyan relative bg-field py-24 text-on-field sm:py-32">
          <div className={`mx-auto max-w-3xl ${pad} text-center`}>
            <h2 id="v2-contact-h" data-rise className="display text-[clamp(2.9rem,7vw,5.5rem)]">
              <Words text="Got an idea? Let’s build it." />
            </h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] font-medium text-on-field-soft">
              <li>Reply within 24 hours</li>
              <li aria-hidden>·</li>
              <li>100% confidential, NDA ready</li>
              <li aria-hidden>·</li>
              <li>Rated 5.0 on Clutch</li>
            </ul>
            <a
              href="mailto:info@hashoneglobal.com"
              className="mt-8 inline-block text-xl font-semibold underline decoration-on-field/40 decoration-2 underline-offset-[0.25em] hover:decoration-on-field sm:text-2xl"
            >
              info@hashoneglobal.com
            </a>
          </div>
          <div className={`mx-auto mt-16 max-w-2xl ${pad}`}>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
