# dvippatel.in — editorial site with a terminal layer

One site, two personalities: a typography-led editorial portfolio (server-rendered,
SEO-friendly), with a Quake-style drop-down terminal overlay on top (press `` ` ``
anywhere). Both modes read from the same content source — the terminal is a view,
not a second site. Full spec in `Claude.md`.

```bash
pnpm dev     # develop
pnpm build   # production build (fetches blog RSS, revalidates daily)
pnpm start   # serve the build
pnpm lint
```

## Where things live

| What | Where |
|---|---|
| Bio, skills, experience, links, nav | `content/site.ts` |
| Projects index (drives pages AND terminal) | `content/projects.ts` |
| Case-study bodies | `content/case-studies/*.mdx` |
| Blog feed URL + fallback posts | `content/writing.ts` (fetch logic in `lib/blog.ts`) |
| **Easter eggs — add yours here** | `content/easter-eggs.ts` |
| Terminal UI (overlay, prompt, typewriter) | `components/terminal/Terminal.tsx` |
| Terminal commands (help, ls, neofetch, vim…) | `components/terminal/commands.ts` |
| Command dispatch + tab completion | `components/terminal/engine.ts` |
| Virtual filesystem (mirrors site IA) | `components/terminal/vfs.ts` |
| OG image template | `lib/og.tsx` |

## Adding an easter egg

Append a plain object to `content/easter-eggs.ts` — no other code changes:

```ts
{
  input: "make coffee",
  output: ["☕ brewing...", { text: "418 I'm a teapot", kind: "error" }],
  // optional: navigate: "/contact", download: "/file.pdf", aliases: [...]
},
```

Eggs that need real *behavior* (like the vim trap or `rm -rf /`) are commands in
`components/terminal/commands.ts` instead.

## Plugging in an LLM later

The engine has a built-in fallthrough for unmatched input: `EngineOptions.onUnknown`
in `components/terminal/types.ts`. Pass an async handler when the engine is created
in `Terminal.tsx` (e.g. POST the input to an API route, return the answer as lines).
Everything downstream is already async.

## To do before going live

- Replace `public/resume.pdf` (currently a generated placeholder —
  `scripts/make-placeholder-resume.mjs`).
- Domain is assumed to be `https://dvippatel.in` (`content/site.ts` → `site.url`);
  update if deploying elsewhere.

## Verification

`scripts/verify-terminal.mjs` and `scripts/final-shots.mjs` drive the running site
with Playwright (uses system Edge, no browser download): terminal open/close,
commands, navigation, easter eggs, theme persistence. Run `pnpm start`, then
`node scripts/verify-terminal.mjs`.
