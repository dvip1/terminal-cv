import { fallbackPosts, rssUrl, type Post } from "@/content/writing";

/**
 * Fetch latest post titles from the blog's RSS feed (Hugo, /index.xml).
 * Statically rendered with daily revalidation; falls back to the curated
 * list in content/writing.ts if the feed is unreachable or unparsable.
 */
export async function getLatestPosts(limit = 10): Promise<Post[]> {
  try {
    const res = await fetch(rssUrl, { next: { revalidate: 86400 } });
    if (!res.ok) return fallbackPosts;
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map((m) => m[1])
      .map((item) => {
        const title = decodeEntities(
          item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] ?? ""
        ).trim();
        const url = (item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "").trim();
        const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
        const date = pubDate ? toISODate(pubDate) : undefined;
        return { title, url, date };
      })
      // posts only — guards against a feed that also lists regular pages
      .filter((p) => p.title && p.url.includes("/posts/"))
      .slice(0, limit);
    return items.length > 0 ? items : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

function toISODate(pubDate: string): string | undefined {
  const t = Date.parse(pubDate);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
