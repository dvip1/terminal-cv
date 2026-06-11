import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { getProject, projects } from "@/content/projects";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Case study — Dvip Patel";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  return renderOgImage(
    `open projects/${slug}`,
    project?.oneliner ?? "Case study"
  );
}
