import Link from "next/link";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { getLatestPosts } from "@/lib/blog";
import { riseDelay } from "@/lib/motion";

export async function HomeContent() {
  const posts = (await getLatestPosts(3)).slice(0, 3);

  return (
    <div className="py-8">
      <section>
        <h1
          className="rise font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight"
          style={riseDelay(0)}
        >
          {site.name}
        </h1>
        <p className="rise mt-6 text-lg leading-relaxed max-w-prose" style={riseDelay(1)}>
          {site.thesis}
        </p>
        <p className="rise mt-3 text-muted leading-relaxed max-w-prose" style={riseDelay(2)}>
          Full-stack engineer at KVAR Technologies — Linux systems, hardware
          integration, and real-time vision pipelines.
        </p>
      </section>

      <section className="mt-16">
        <h2
          className="rise font-mono text-xs uppercase tracking-widest text-muted"
          style={riseDelay(3)}
        >
          Selected work
        </h2>
        <ul className="mt-5 space-y-7">
          {projects.map((p, i) => (
            <li key={p.slug} className="rise" style={riseDelay(4 + i)}>
              <Link
                href={`/projects/${p.slug}`}
                className="group block"
              >
                <span className="font-serif text-xl font-medium group-hover:text-accent transition-colors">
                  {p.title}
                </span>
                <span className="block mt-1 text-muted leading-relaxed">
                  {p.oneliner}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rise mt-16" style={riseDelay(7)}>
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Latest writing
        </h2>
        <ul className="mt-5 space-y-4">
          {posts.map((post) => (
            <li key={post.url} className="flex items-baseline justify-between gap-4">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors leading-relaxed"
              >
                {post.title}
              </a>
              {post.date && (
                <span className="font-mono text-xs text-muted shrink-0">
                  {post.date}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">
          More on{" "}
          <a
            href={site.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link"
          >
            {site.blogHost}
          </a>
        </p>
      </section>
    </div>
  );
}
