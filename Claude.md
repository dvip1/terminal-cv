# Portfolio spec — editorial site with a terminal layer

Build spec for Claude Code. This is an already-initialized Next.js project (App Router). Read this whole file before writing code.

## Owner

Dvip Patel — full-stack engineer working the entire stack: Linux systems and networking up to production AI pipelines. Builds resilient real-time monitoring software with hardware integration (RS485/COM, WiFi IoT) and real-time vision pipelines.

- Email: dvipatwork@outlook.com
- GitHub: github.com/dvip1
- LinkedIn: linkedin.com/in/dvip-patel-23320a230
- Blog: blogs.dvippatel.in
- Daily driver: Arch Linux (this matters for the terminal's personality)

## Core concept

One site, two personalities:

1. **Editorial mode (default).** A clean, typography-led, writing-first portfolio. This is what recruiters, hiring managers, and search engines see. 100% server-rendered, fast, indexable.
2. **Terminal mode (the layer).** A Quake-style drop-down terminal overlay for developers. It does not replace the site — it sits on top of it as an alternate way to navigate the same content.

The key architectural rule: **the terminal is a view, not a second site.** Both modes read from one content source. No content exists only inside the terminal (except jokes/easter eggs).

## How the two modes combine

This is the heart of the design. Implement all of the following:

### 1. Quake-style drop-down terminal
- Pressing `` ` `` (backtick) or `~` anywhere on the site slides a terminal down from the top of the viewport (like the console in Quake/Half-Life). Pressing it again, or `Esc`, slides it away.
- The page underneath stays visible and dimmed — the terminal is an overlay at ~60% viewport height, not a route change. State (scroll position, current page) is preserved underneath.
- A small `>_` button in the site header opens the same terminal for people who click instead of type.

### 2. Terminal commands mirror site navigation
- The filesystem metaphor maps to the site's information architecture: `ls` shows top-level sections (`writing/`, `projects/`, `about`, `contact`), `cd writing && ls` lists posts, `cat <post>` either prints a summary + link or offers `open <post>` to navigate the real page.
- Navigation commands actually drive the Next.js router. `open projects/cts-logger` closes the terminal and routes to that case-study page. The terminal is a power-user command palette wearing a shell costume.

### 3. Single source of truth for content
- All content (bio, projects, blog post index, contact links) lives in typed content files — MDX for case studies/posts, a TypeScript data module for structured stuff (projects list, skills, links).
- Editorial pages render this content server-side. The terminal imports the same modules client-side. Updating a project updates both modes automatically.
- Blog: the writing section links out to blogs.dvippatel.in. If feasible, fetch the latest post titles from its RSS feed at build time (revalidate daily); otherwise keep a manually curated list in the data module.

### 4. Discovery — how devs find the terminal
- A quiet one-line hint in the footer: `psst — press ` ` ``
- A `console.log` ASCII banner with the same hint (devs open devtools; reward them).
- The `>_` header button for everyone else.
- A direct route `/terminal` that opens the site with the terminal already dropped down — shareable on Twitter/HN. Mark it `noindex`; canonical content lives on the editorial pages.

### 5. Mobile behavior
- Typing in a fake shell on a phone keyboard is miserable. On viewports < 768px, the terminal opens with a row of tappable command chips (`whoami`, `projects`, `blog`, `contact`, `neofetch`) above the prompt. Free typing still works, but chips are primary.

### 6. Shared visual DNA
- The two modes must feel like one brand. Pick ONE accent color and use it as: link/hover color in editorial mode, and the prompt color (`dvip@arch ~ $`) in terminal mode.
- Terminal background is near-black regardless of site theme; editorial mode supports light + dark via `prefers-color-scheme` with a manual toggle (persist choice in localStorage).

## Pages (editorial mode)

- `/` — Hero: name, one-sentence thesis ("I build resilient real-time systems — from RS485 wires to production AI pipelines"), then a short "selected work" list and latest writing. No carousels, no cards-with-gradients. Typography does the work.
- `/projects` — index of case studies.
- `/projects/[slug]` — case-study pages (MDX). Initial three:
  - **CTS Logger** — dual-transport Electron/Node app, RS485/COM + WiFi/HTTP, 70+ concurrent devices, command queue with auto-deduplication, 6 months production uptime with zero data loss.
  - **Real-time vision pipeline** — YOLOv8n conveyor-belt detection, 2 concurrent streams via MediaMTX + FastAPI WebSockets, 97% accuracy, custom StreamProfiler keeping <50ms frame budget at 20 FPS.
  - **Andon monitoring & AI analytics** — React/Node monitoring for Mahindra Aeronautics, multi-level RBAC, Gemma-powered text-to-SQL chatbot secured with prompt design + regex filtering + read-only scoped DB role, dynamic JSON→charts rendering engine.
- `/about` — longer bio, skills grouped by layer (systems → backend → frontend → AI), education (B.E. Electronics & Computer Science, Shree L.R. Tiwari College of Engineering, 2021–2025), experience (KVAR Technologies, Asynk Automating Technologies).
- `/writing` — list linking to blogs.dvippatel.in posts.
- `/contact` — email, GitHub, LinkedIn, resume download.

## Terminal feature set

### Core UX (build first)
- Blinking block cursor; output renders with a fast typewriter effect (skippable — any keypress instantly completes it; respect `prefers-reduced-motion` by disabling it entirely).
- Command history with up/down arrows.
- Tab completion for commands and paths.
- `help` lists the public commands. `clear` works. Unknown commands get `command not found: X — try 'help'`.

### Real commands (content, disguised as fun)
- `whoami` — one-liner bio. Running it a second time returns a more philosophical answer.
- `neofetch` — ASCII logo + stats card: OS "Arch (btw)", role, stack, location (Mumbai), uptime = years since 2021.
- `ls`, `cd`, `cat`, `open` — the navigation layer described above.
- `git log --career` — career milestones formatted as commits (KVAR 2025–present, Asynk internship 2023–24, B.E. 2021–2025).
- `htop` — "running processes": current role, side projects, currently learning.
- `ping dvip` — replies with latency + email and LinkedIn.
- `cat blog/latest` — newest post title + link.
- `cat resume.pdf` — "rendering binary…" joke, then triggers actual resume download.

### Easter eggs (curated — do not add more than these)
- `hire-me` — "Permission granted." → routes to /contact. Any `sudo` command is denied ("you don't have enough permissions — root access is granted exclusively through hiring me"); sudo never executes anything.
- `rm -rf /` — fake panic: lines of the page "delete", brief glitch, then a mock reboot back to the prompt with "nice try."
- `vim` — traps the user: "You are now stuck in vim." Only `:q!` escapes.
- `pacman -S job` — "resolving dependencies: motivation, caffeine, low-latency websockets…"
- A hidden `matrix` command — green falling characters over the terminal until any key is pressed.

Restraint rule: easter eggs are seasoning. The terminal's default surface (help, ls, whoami) must point at real work first.

## Design direction (editorial mode)

- Typography-led. Pick a characterful serif or semi-serif display face for headings and a clean sans/neutral body face — deliberately chosen, not Inter-on-white default. A monospace face appears only in code/terminal contexts and small metadata labels (dates, tags), tying the two modes together.
- Generous whitespace, hairline dividers, no cards-with-shadows, no gradients.
- The signature element of the whole site is the drop-down terminal itself — keep everything else quiet so that moment lands.
- Quality floor: responsive to 360px, visible keyboard focus states, `prefers-reduced-motion` respected everywhere, semantic HTML, Lighthouse a11y ≥ 95.

## SEO requirements (the reason for Next.js)

- All editorial pages server-rendered (static where possible) with per-page `metadata`: title, description, OpenGraph + Twitter cards, canonical URLs.
- Generated `sitemap.xml` and `robots.txt`. `/terminal` is noindex.
- JSON-LD `Person` schema on the homepage (name, jobTitle, sameAs: GitHub/LinkedIn/blog).
- OG images per page (Next.js `ImageResponse` — a simple terminal-prompt-styled card with the page title is on-brand).
- The terminal is a client component loaded lazily (dynamic import) so it adds zero weight to first paint and nothing to the crawled HTML.

## Build order

1. Content layer: data module + MDX setup, with the three case studies and bio populated from this spec.
2. Editorial pages + design system (do this fully before any terminal work).
3. SEO plumbing: metadata, sitemap, JSON-LD, OG images.
4. Terminal core: overlay, prompt, history, tab completion, navigation commands.
5. Fun layer: neofetch, git log, htop, then easter eggs.
6. Polish: mobile chips, reduced-motion paths, Lighthouse pass.

Ship after step 3 if needed — the site must stand on its own without the terminal.