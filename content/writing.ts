/**
 * Writing section. Posts live on blogs.dvippatel.in — this is the curated
 * fallback list used when the RSS feed can't be fetched at build time
 * (see lib/blog.ts, which prefers the live feed and revalidates daily).
 */

export type Post = {
  title: string;
  url: string;
  date?: string; // ISO date when known
};

// Hugo section feed — posts only. The site-wide /index.xml also lists
// regular pages (privacy policy etc.), so don't use that one.
export const rssUrl = "https://blogs.dvippatel.in/posts/index.xml";

export const fallbackPosts: Post[] = [
  {
    title: "Read my writing on blogs.dvippatel.in",
    url: "https://blogs.dvippatel.in",
  },
];
