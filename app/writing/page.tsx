import type { Metadata } from "next";
import { site } from "@/content/site";
import { getLatestPosts } from "@/lib/blog";
import { riseDelay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Writing",
  description: `Technical writing by ${site.name} on ${site.blogHost} — AI systems, software engineering, and build notes.`,
  alternates: { canonical: "/writing" },
};

export default async function WritingPage() {
  const posts = await getLatestPosts(20);

  return (
    <div className="py-8">
      <h1 className="rise font-serif text-3xl font-semibold tracking-tight" style={riseDelay(0)}>
        Writing
      </h1>
      <p className="rise mt-4 text-muted max-w-prose leading-relaxed" style={riseDelay(1)}>
        Posts live on{" "}
        <a
          href={site.blog}
          target="_blank"
          rel="noopener noreferrer"
          className="prose-link"
        >
          {site.blogHost}
        </a>
        . Latest first.
      </p>
      <ul className="mt-10 space-y-1">
        {posts.map((post, i) => (
          <li key={post.url} className="rise" style={riseDelay(2 + i)}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hairline-row flex items-baseline justify-between gap-4 border-t border-border py-4"
            >
              <span className="leading-relaxed group-hover:text-accent transition-colors">
                {post.title}
              </span>
              {post.date && (
                <span className="font-mono text-xs text-muted shrink-0">
                  {post.date}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
