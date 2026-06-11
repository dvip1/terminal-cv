import type { Metadata } from "next";
import { site } from "@/content/site";
import { getLatestPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Writing",
  description: `Technical writing by ${site.name} on ${site.blogHost} — AI systems, software engineering, and build notes.`,
  alternates: { canonical: "/writing" },
};

export default async function WritingPage() {
  const posts = await getLatestPosts(20);

  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Writing
      </h1>
      <p className="mt-4 text-muted max-w-prose leading-relaxed">
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
        {posts.map((post) => (
          <li key={post.url}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 border-t border-border py-4"
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
