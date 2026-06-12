import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { riseDelay } from "@/lib/motion";

// Static import map: each case-study body is MDX compiled at build time.
const caseStudies: Record<string, () => Promise<{ default: ComponentType }>> = {
  "cts-logger": () => import("@/content/case-studies/cts-logger.mdx"),
  "vision-pipeline": () => import("@/content/case-studies/vision-pipeline.mdx"),
  "andon-monitoring": () => import("@/content/case-studies/andon-monitoring.mdx"),
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  const loader = caseStudies[slug];
  if (!project || !loader) notFound();

  const { default: Body } = await loader();

  return (
    <article className="py-8">
      <p className="rise font-mono text-xs text-muted" style={riseDelay(0)}>
        <Link href="/projects" className="hover:text-accent transition-colors">
          projects
        </Link>{" "}
        / {project.slug}
      </p>
      <h1
        className="rise mt-4 font-serif text-3xl sm:text-4xl font-semibold tracking-tight"
        style={riseDelay(1)}
      >
        {project.title}
      </h1>
      <p className="rise mt-4 text-lg text-muted leading-relaxed max-w-prose" style={riseDelay(2)}>
        {project.oneliner}
      </p>
      <p className="rise mt-4 font-mono text-xs text-muted" style={riseDelay(3)}>
        {project.stack.join(" · ")} — {project.year}
      </p>
      <div
        className="rise case-study mt-10 border-t border-border pt-2 max-w-prose"
        style={riseDelay(4)}
      >
        <Body />
      </div>
    </article>
  );
}
