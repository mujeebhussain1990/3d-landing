import { cacheLife, cacheTag } from "next/cache";

const API = "https://hashoneglobal.com/wp-json/wp/v2";
const BLOG_CATEGORY = 59;

export type Topic = { stage: number; label: string };

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  topic: Topic;
  minutes: number;
  image: { src: string; width: number; height: number; alt: string } | null;
};

export type Post = PostSummary & { html: string };

type WPPost = {
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url?: string;
      alt_text?: string;
      media_details?: { width?: number; height?: number };
    }[];
  };
};

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};

function decode(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

const strip = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** Which assembly form a post's subject maps onto */
function topicOf(title: string): Topic {
  const t = title.toLowerCase();
  if (/gulf|gcc|middle east|dubai|saudi|smart cit/.test(t)) return { stage: 5, label: "Gulf & global" };
  if (/cloud|erp/.test(t)) return { stage: 4, label: "Cloud" };
  if (/\bai\b|mlops|chatbot|generative|machine learning/.test(t)) return { stage: 3, label: "AI" };
  if (/web/.test(t)) return { stage: 2, label: "Web" };
  if (/mobile|\bapps?\b/.test(t)) return { stage: 1, label: "Mobile" };
  return { stage: 0, label: "Insight" };
}

/** Keep the editorial markup, drop anything executable or layout-specific */
function clean(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed|form)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(style|class|id)\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/<\/?div[^>]*>/gi, "")
    .replace(/<a\s+href="(https?:\/\/(?!hashoneglobal\.com)[^"]+)"/gi, '<a href="$1" target="_blank" rel="noopener noreferrer"')
    .replace(/<p>\s*(&nbsp;)?\s*<\/p>/gi, "")
    .trim();
}

function toSummary(p: WPPost): PostSummary {
  const title = decode(p.title.rendered);
  const media = p._embedded?.["wp:featuredmedia"]?.[0];
  const words = strip(p.content.rendered).split(" ").length;
  return {
    slug: decodeURIComponent(p.slug),
    title,
    excerpt: strip(p.excerpt.rendered).replace(/\s*\[…\]\s*$|\s*…\s*$/, "…"),
    date: p.date,
    topic: topicOf(title),
    minutes: Math.max(1, Math.round(words / 220)),
    image:
      media?.source_url && media.media_details?.width && media.media_details?.height
        ? {
            src: media.source_url,
            width: media.media_details.width,
            height: media.media_details.height,
            alt: media.alt_text || "",
          }
        : null,
  };
}

async function wp(path: string): Promise<WPPost[]> {
  const res = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`WordPress API ${res.status} for ${path}`);
  return res.json();
}

export async function getPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog");
  const posts = await wp(
    `/posts?categories=${BLOG_CATEGORY}&per_page=100&_embed=wp:featuredmedia&_fields=slug,date,title,excerpt,content,_links,_embedded`,
  );
  return posts.map(toSummary);
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog", `post:${slug}`);
  const [p] = await wp(
    `/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia&_fields=slug,date,title,excerpt,content,_links,_embedded`,
  );
  if (!p) return null;
  return { ...toSummary(p), html: clean(p.content.rendered) };
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
