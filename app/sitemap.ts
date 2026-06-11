import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/projects", "/about", "/writing", "/contact"].map(
    (path) => ({
      url: `${site.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );
  const caseStudies = projects.map((p) => ({
    url: `${site.url}/projects/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...caseStudies];
}
