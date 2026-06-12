import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";
import { riseDelay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Case studies: industrial data logging, real-time vision pipelines, and factory-floor monitoring with AI analytics.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="py-8">
      <h1 className="rise font-serif text-3xl font-semibold tracking-tight" style={riseDelay(0)}>
        Projects
      </h1>
      <p className="rise mt-4 text-muted max-w-prose leading-relaxed" style={riseDelay(1)}>
        Case studies of systems built to survive production — hardware
        integration, real-time constraints, and AI under guardrails.
      </p>
      <ul className="mt-12 space-y-12">
        {projects.map((p, i) => (
          <li
            key={p.slug}
            className="rise hairline-row border-t border-border pt-8"
            style={riseDelay(2 + i)}
          >
            <Link href={`/projects/${p.slug}`} className="group block">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-2xl font-medium group-hover:text-accent transition-colors">
                  {p.title}
                </h2>
                <span className="font-mono text-xs text-muted shrink-0">
                  {p.year}
                </span>
              </div>
              <p className="mt-3 leading-relaxed text-muted max-w-prose">
                {p.summary}
              </p>
              <p className="mt-3 font-mono text-xs text-muted">
                {p.stack.join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
