import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate } from "@/lib/blog";
import BlogStage from "@/components/blog/BlogStage";
import ReadingProgress from "@/components/blog/ReadingProgress";
import Footer from "@/components/Footer";
import { Arrow } from "@/components/ui";

const wrap = "mx-auto w-full max-w-[1440px] px-4 sm:px-8 xl:pl-44";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.image ? { images: [{ url: post.image.src, width: post.image.width, height: post.image.height }] } : undefined,
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  const others = all.filter((p) => p.slug !== post.slug);
  const next = [
    ...others.filter((p) => p.topic.stage === post.topic.stage),
    ...others.filter((p) => p.topic.stage !== post.topic.stage),
  ].slice(0, 3);

  return (
    <>
      <BlogStage stage={post.topic.stage} offset={0.55} dimWhenReading="#article-body" />
      <ReadingProgress target="#article-body" />

      <main className="relative z-10">
        <article>
          <header className="flex min-h-[82svh] items-end pb-14 pt-32">
            <div className={wrap}>
              <div className="lg:max-w-[min(58%,48rem)]">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  <Arrow className="rotate-180 text-field transition-transform duration-300 group-hover:-translate-x-1" />
                  All articles
                </Link>
                <p className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-faint">
                  <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-field">
                    <span aria-hidden className="h-1.5 w-1.5 bg-accent" />
                    {post.topic.label}
                  </span>
                  <time dateTime={post.date} className="tabular">{formatDate(post.date)}</time>
                  <span>{post.minutes} min read</span>
                </p>
                <h1 className="headline mt-5 text-[clamp(2.2rem,4.6vw,4rem)] text-ink">{post.title}</h1>
              </div>
            </div>
          </header>

          <div id="article-body" className={`${wrap} pb-28`}>
            <div className="-mx-4 bg-ground/85 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:max-w-[46rem] lg:bg-transparent lg:px-0">
              {post.image && (
                <figure className="mb-14">
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    width={post.image.width}
                    height={post.image.height}
                    sizes="(min-width: 1024px) 46rem, 100vw"
                    priority
                    className="h-auto w-full"
                  />
                </figure>
              )}
              <div className="article" dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
          </div>
        </article>

        <aside aria-labelledby="cta-h" className="on-field field-blue bg-field py-20 text-on-field sm:py-24">
          <div className={`${wrap} flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end`}>
            <h2 id="cta-h" className="display max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.5rem)]">
              Got an idea? Let’s build it.
            </h2>
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-3 bg-on-field px-7 py-4 text-sm rounded-full font-bold text-field transition-colors hover:bg-on-field/85"
            >
              Start a project
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </aside>

        <section aria-labelledby="next-h" className="bg-ground py-20 sm:py-24">
          <div className={wrap}>
            <h2 id="next-h" className="display text-[clamp(2rem,4vw,3rem)]">Keep reading</h2>
            <ul className="mt-10 grid gap-px border-y border-rule bg-rule md:grid-cols-3">
              {next.map((p) => (
                <li key={p.slug} className="bg-ground">
                  <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col gap-4 py-7 md:px-6 md:first:pl-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      {p.topic.label} · <time dateTime={p.date}>{formatDate(p.date)}</time>
                    </span>
                    <span className="headline text-xl text-ink-soft transition-colors group-hover:text-ink">{p.title}</span>
                    <Arrow className="mt-auto text-field transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
