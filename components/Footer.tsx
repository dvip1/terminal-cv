import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="w-full max-w-2xl mx-auto px-6 pt-16 pb-8 text-sm text-muted">
      <div className="border-t border-border pt-6 flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex gap-4">
          <a href={`mailto:${site.email}`} className="link-grow hover:text-accent">
            email
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="link-grow hover:text-accent"
          >
            github
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="link-grow hover:text-accent"
          >
            linkedin
          </a>
          <a
            href={site.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="link-grow hover:text-accent"
          >
            blog
          </a>
        </div>
        <p className="font-mono text-xs" aria-hidden="true">
          psst — press <kbd className="border border-border rounded px-1">`</kbd>
        </p>
      </div>
    </footer>
  );
}
