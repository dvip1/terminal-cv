import type { Metadata } from "next";
import { bio, education, experience, site, skills } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: bio.short,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">About</h1>

      <section className="mt-6 space-y-5 max-w-prose leading-relaxed">
        {bio.long.map((para) => (
          <p key={para.slice(0, 32)}>{para}</p>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Skills, by layer
        </h2>
        <dl className="mt-5 space-y-6">
          {skills.map((group) => (
            <div key={group.layer} className="border-t border-border pt-4">
              <dt className="font-serif text-lg font-medium">{group.layer}</dt>
              <dd className="mt-1.5 text-muted leading-relaxed">
                {group.items.join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Experience
        </h2>
        <ul className="mt-5 space-y-6">
          {experience.map((job) => (
            <li key={job.company} className="border-t border-border pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-lg font-medium">{job.company}</h3>
                <span className="font-mono text-xs text-muted shrink-0">
                  {job.period}
                </span>
              </div>
              <p className="mt-1 text-sm">{job.role}</p>
              <p className="mt-1.5 text-muted leading-relaxed max-w-prose">
                {job.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
          Education
        </h2>
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-lg font-medium">{education.degree}</h3>
            <span className="font-mono text-xs text-muted shrink-0">
              {education.period}
            </span>
          </div>
          <p className="mt-1.5 text-muted">{education.school}</p>
        </div>
      </section>

      <p className="mt-14 text-sm text-muted">
        Based in {site.location}. Daily driver: {site.os}.
      </p>
    </div>
  );
}
