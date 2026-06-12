import type { Metadata } from "next";
import { site } from "@/content/site";
import { riseDelay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — email, GitHub, LinkedIn, resume.`,
  alternates: { canonical: "/contact" },
};

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "GitHub", value: `github.com/${site.githubHandle}`, href: site.github },
  {
    label: "LinkedIn",
    value: "dvip-patel",
    href: site.linkedin,
  },
  { label: "Resume", value: "resume.pdf", href: site.resumePath },
];

export default function ContactPage() {
  return (
    <div className="py-8">
      <h1 className="rise font-serif text-3xl font-semibold tracking-tight" style={riseDelay(0)}>
        Contact
      </h1>
      <p className="rise mt-4 text-muted max-w-prose leading-relaxed" style={riseDelay(1)}>
        The fastest way to reach me is email. I read everything.
      </p>
      <ul className="mt-10">
        {channels.map((c, i) => (
          <li key={c.label} className="rise" style={riseDelay(2 + i)}>
            <a
              href={c.href}
              {...(c.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              {...(c.label === "Resume" ? { download: true } : {})}
              className="group hairline-row flex items-baseline justify-between gap-4 border-t border-border py-4"
            >
              <span className="font-serif text-lg font-medium group-hover:text-accent transition-colors">
                {c.label}
              </span>
              <span className="font-mono text-xs text-muted">{c.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
