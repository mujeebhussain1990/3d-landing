import type { Metadata } from "next";
import { getPosts } from "@/lib/blog";
import BlogStage from "@/components/blog/BlogStage";
import BlogList from "@/components/blog/BlogList";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from the HashOne Global team on AI, cloud, ERP and the web.",
};

const wrap = "mx-auto w-full max-w-[1440px] px-4 sm:px-8 xl:pl-44";

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <>
      <BlogStage stage={posts[0]?.topic.stage ?? 0} offset={0.55} />
      <main className="relative z-10">
        <header className="flex min-h-[78svh] items-end pb-16 pt-32 sm:pb-20">
          <div className={wrap}>
            <div className="lg:max-w-[min(58%,46rem)]">
              <h1 className="display text-[clamp(3.2rem,8.5vw,6rem)]">Notes from the build</h1>
              <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
                Writing from the HashOne Global team on AI, cloud, ERP and the web, for people deciding what to build next.
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Articles" className="pb-32">
          <div className={wrap}>
            <div className="-mx-4 bg-ground/80 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:max-w-[min(58%,46rem)] lg:bg-transparent lg:px-0">
              <BlogList posts={posts} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
