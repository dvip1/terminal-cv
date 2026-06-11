import { bio, education, experience, site, skills } from "@/content/site";
import { getProject } from "@/content/projects";
import type { Command, CommandContext, CommandResult, TermLine } from "./types";
import { DEFAULT_THEME_NAME, findTheme, savedThemeName, termThemes } from "./themes";
import { buildVfs, getNode, postSlug, resolvePath } from "./vfs";

const err = (text: string): TermLine => ({ text, kind: "error" });
const dim = (text: string): TermLine => ({ text, kind: "dim" });
const accent = (text: string): TermLine => ({ text, kind: "accent" });

function vfsFor(ctx: CommandContext) {
  return buildVfs(ctx.posts);
}

/* ── cat: file contents keyed by resolved absolute path ─────────────── */

function catFile(path: string, ctx: CommandContext): CommandResult {
  if (path === "/about") {
    return { lines: bio.long.flatMap((p, i) => (i === 0 ? [{ text: p }] : [{ text: "" }, { text: p }])) };
  }
  if (path === "/contact") {
    return {
      lines: [
        { text: `email     ${site.email}`, href: `mailto:${site.email}` },
        { text: `github    github.com/${site.githubHandle}`, href: site.github },
        { text: `linkedin  dvip-patel`, href: site.linkedin },
        { text: `blog      ${site.blogHost}`, href: site.blog },
        dim(`resume    cat resume.pdf`),
      ],
    };
  }
  if (path === "/resume.pdf") {
    return {
      lines: [
        dim("rendering binary... just kidding."),
        accent("downloading resume.pdf"),
      ],
      action: { type: "download", href: site.resumePath },
    };
  }
  if (path === "/blog/latest") {
    const latest = ctx.posts[0];
    if (!latest) return { lines: [err("cat: blog/latest: feed unavailable")] };
    return {
      lines: [
        accent(latest.title),
        { text: latest.url, href: latest.url, kind: "dim" },
        dim(`open writing/${postSlug(latest)} to read it`),
      ],
    };
  }
  const projMatch = path.match(/^\/projects\/(.+)$/);
  if (projMatch) {
    const p = getProject(projMatch[1]);
    if (!p) return { lines: [err(`cat: ${path}: No such file`)] };
    return {
      lines: [
        accent(`${p.title} (${p.year})`),
        { text: "" },
        { text: p.summary },
        { text: "" },
        ...p.highlights.map((h) => ({ text: `  • ${h}` })),
        { text: "" },
        dim(`stack: ${p.stack.join(", ")}`),
        dim(`open projects/${p.slug} for the full case study`),
      ],
    };
  }
  const postMatch = path.match(/^\/writing\/(.+)$/);
  if (postMatch) {
    const post = ctx.posts.find((p) => postSlug(p) === postMatch[1]);
    if (!post) return { lines: [err(`cat: ${path}: No such file`)] };
    return {
      lines: [
        accent(post.title),
        { text: post.url, href: post.url, kind: "dim" },
        dim(`open writing/${postMatch[1]} to read it`),
      ],
    };
  }
  return { lines: [err(`cat: ${path}: No such file`)] };
}

/* ── open: route mapping ─────────────────────────────────────────────── */

function openPath(path: string, ctx: CommandContext): CommandResult {
  const internal: Record<string, string> = {
    "/": "/",
    "/projects": "/projects",
    "/writing": "/writing",
    "/about": "/about",
    "/contact": "/contact",
  };
  if (internal[path]) {
    return {
      lines: [dim(`opening ${path === "/" ? "home" : path} ...`)],
      action: { type: "navigate", to: internal[path] },
    };
  }
  if (path.match(/^\/projects\/.+/)) {
    const slug = path.split("/")[2];
    if (!getProject(slug)) return { lines: [err(`open: ${path}: No such page`)] };
    return {
      lines: [dim(`opening ${path} ...`)],
      action: { type: "navigate", to: path },
    };
  }
  const postMatch = path.match(/^\/writing\/(.+)$/);
  if (postMatch) {
    const post = ctx.posts.find((p) => postSlug(p) === postMatch[1]);
    if (!post) return { lines: [err(`open: ${path}: No such post`)] };
    return {
      lines: [dim(`opening ${post.url} in a new tab ...`)],
      action: { type: "open-external", url: post.url },
    };
  }
  if (path === "/resume.pdf") {
    return catFile("/resume.pdf", ctx);
  }
  if (path === "/blog/latest") {
    const latest = ctx.posts[0];
    if (latest) {
      return {
        lines: [dim(`opening ${latest.url} ...`)],
        action: { type: "open-external", url: latest.url },
      };
    }
  }
  return { lines: [err(`open: ${path}: No such page`)] };
}

/* ── neofetch ────────────────────────────────────────────────────────── */

const archLogo = [
  "       /\\       ",
  "      /  \\      ",
  "     /\\   \\     ",
  "    /  __  \\    ",
  "   /  (  )  \\   ",
  "  / __|  |__ \\  ",
  " /.`        `.\\ ",
];

function neofetch(): CommandResult {
  const uptime = new Date().getFullYear() - site.careerStart;
  const info: [string, string][] = [
    ["OS", "Arch Linux (btw)"],
    ["Host", "dvippatel.in"],
    ["Kernel", "full-stack-6.1.0"],
    ["Uptime", `${uptime} years (since ${site.careerStart})`],
    ["Shell", "dvipsh 1.0"],
    ["Role", `${site.role} @ KVAR Technologies`],
    ["Location", site.location],
    ["Stack", "RS485 → Node → React → AI"],
    ["Contact", site.email],
  ];
  const blank = " ".repeat(archLogo[0].length);
  const rows = Math.max(archLogo.length, info.length + 2);
  const lines: TermLine[] = [];
  for (let i = 0; i < rows; i++) {
    const logo = archLogo[i] ?? blank;
    let right = "";
    let rightKind: TermLine["kind"] = "plain";
    if (i === 0) {
      right = "dvip@arch";
      rightKind = "accent";
    } else if (i === 1) {
      right = "---------";
      rightKind = "dim";
    } else if (info[i - 2]) {
      const [k, v] = info[i - 2];
      right = `${k.padEnd(9)} ${v}`;
    }
    lines.push({
      text: `${logo}  ${right}`,
      spans: [
        { text: logo, kind: "accent" },
        { text: `  ${right}`, kind: rightKind },
      ],
    });
  }
  return { lines };
}

/* ── command registry ───────────────────────────────────────────────── */

export const commands: Command[] = [
  {
    name: "help",
    description: "list available commands",
    run: () => {
      const visible = commands.filter((c) => !c.hidden);
      const width = Math.max(...visible.map((c) => (c.usage ?? c.name).length)) + 2;
      return {
        lines: [
          dim("available commands:"),
          ...visible.map((c) => ({
            text: `  ${(c.usage ?? c.name).padEnd(width)} ${c.description}`,
          })),
          { text: "" },
          dim("pro tip: tab completes, up/down recalls history, ` or esc closes."),
        ],
      };
    },
  },
  {
    name: "ls",
    description: "list sections / contents",
    usage: "ls [path]",
    run: (args, ctx) => {
      const flags = args.filter((a) => a.startsWith("-"));
      const target = args.find((a) => !a.startsWith("-"));
      const showHidden = flags.some((f) => f.includes("a"));
      const path = target ? resolvePath(ctx.state.cwd, target) : ctx.state.cwd;
      const node = getNode(vfsFor(ctx), path);
      if (!node) return { lines: [err(`ls: ${target}: No such file or directory`)] };
      if (node.type === "file") return { lines: [{ text: node.name }] };
      const children = (node.children ?? []).filter((c) => showHidden || !c.hidden);
      if (children.length === 0) return { lines: [dim("(empty)")] };
      return {
        lines: [
          {
            text: children
              .map((c) => (c.type === "dir" ? `${c.name}/` : c.name))
              .join("  "),
          },
        ],
      };
    },
  },
  {
    name: "cd",
    description: "change directory",
    usage: "cd <dir>",
    run: (args, ctx) => {
      const target = args[0];
      if (!target || target === "~") {
        ctx.state.cwd = "/";
        return {};
      }
      const path = resolvePath(ctx.state.cwd, target);
      const node = getNode(vfsFor(ctx), path);
      if (!node) return { lines: [err(`cd: ${target}: No such file or directory`)] };
      if (node.type !== "dir") return { lines: [err(`cd: ${target}: Not a directory`)] };
      ctx.state.cwd = path;
      return {};
    },
  },
  {
    name: "cat",
    description: "print a file (summary + link)",
    usage: "cat <file>",
    run: (args, ctx) => {
      const target = args.find((a) => !a.startsWith("-"));
      if (!target) return { lines: [err("usage: cat <file> — try 'ls' first")] };
      const path = resolvePath(ctx.state.cwd, target);
      const node = getNode(vfsFor(ctx), path);
      if (node?.type === "dir") {
        return { lines: [err(`cat: ${target}: Is a directory — try 'ls ${target}'`)] };
      }
      return catFile(path, ctx);
    },
  },
  {
    name: "open",
    description: "navigate to a page",
    usage: "open <path>",
    run: (args, ctx) => {
      const target = args[0];
      if (!target) return { lines: [err("usage: open <path> — e.g. open projects/cts-logger")] };
      return openPath(resolvePath(ctx.state.cwd, target), ctx);
    },
  },
  {
    name: "whoami",
    description: "who is dvip?",
    run: (_args, ctx) => {
      ctx.state.whoamiCount += 1;
      if (ctx.state.whoamiCount === 1) {
        return { lines: [{ text: bio.short }] };
      }
      return { lines: [{ text: bio.philosophical }] };
    },
  },
  {
    name: "neofetch",
    description: "system info",
    run: () => neofetch(),
  },
  {
    name: "git",
    description: "career milestones as commits",
    usage: "git log --career",
    run: (args) => {
      if (args[0] !== "log") {
        return { lines: [err("fatal: not a git repository (and yet, a career) — try 'git log --career'")] };
      }
      const commits: { hash: string; date: string; msg: string }[] = [
        {
          hash: "f7a2c91",
          date: experience[0].period,
          msg: `feat(career): join ${experience[0].company} — ${experience[0].role}`,
        },
        {
          hash: "8d3e470",
          date: "2025",
          msg: `chore(education): graduate ${education.degree}`,
        },
        {
          hash: "b19c5e2",
          date: experience[1].period,
          msg: `feat(career): internship @ ${experience[1].company}`,
        },
        {
          hash: "a004d11",
          date: "2021",
          msg: `init: enroll @ ${education.school}`,
        },
      ];
      return {
        lines: commits.flatMap((c, i) => [
          accent(`commit ${c.hash}${i === 0 ? " (HEAD -> main, origin/career)" : ""}`),
          dim(`Date:   ${c.date}`),
          { text: `    ${c.msg}` },
          { text: "" },
        ]),
      };
    },
  },
  {
    name: "htop",
    description: "running processes",
    run: () => ({
      lines: [
        dim("  PID USER   PRI  CPU%  MEM%  COMMAND"),
        { text: "    1 dvip    20  62.0  38.2  kvar-technologies --role=full-stack" },
        { text: "   42 dvip    19  21.4  14.6  side-projects --active" },
        { text: "  137 dvip    15  11.8   9.1  learning --topic=llm-inference" },
        { text: "  998 dvip    10   4.2   2.0  blogging --host=blogs.dvippatel.in" },
        { text: "  999 dvip     5   0.6   1.1  arch-maintenance --btw" },
      ],
    }),
  },
  {
    name: "ping",
    description: "reach dvip",
    usage: "ping dvip",
    run: () => ({
      lines: [
        { text: "PING dvip (mumbai.local): 56 data bytes" },
        { text: "64 bytes from dvip: icmp_seq=0 ttl=64 time=0.042 ms" },
        { text: "64 bytes from dvip: icmp_seq=1 ttl=64 time=0.038 ms" },
        { text: "--- dvip ping statistics ---" },
        { text: "2 packets transmitted, 2 packets received, 0.0% packet loss" },
        { text: "" },
        { text: `reply-to: ${site.email}`, href: `mailto:${site.email}`, kind: "accent" },
        { text: "lower latency: linkedin.com/in/dvip-patel-23320a230", href: site.linkedin, kind: "dim" },
      ],
    }),
  },
  {
    name: "skills",
    description: "skills, grouped by layer",
    run: () => ({
      lines: skills.flatMap((g) => [accent(g.layer), { text: `  ${g.items.join(" · ")}` }, { text: "" }]),
    }),
  },
  {
    name: "pacman",
    description: "package manager (arch, btw)",
    usage: "pacman -S <pkg>",
    run: (args) => {
      if (args.length === 0) {
        return { lines: [err("error: no operation specified (use -h for help)")] };
      }
      const op = args.find((a) => a.startsWith("-")) ?? "";
      const targets = args.filter((a) => !a.startsWith("-"));
      if (op === "-h" || op === "--help") {
        return {
          lines: [
            { text: "usage:  pacman <operation> [...]" },
            { text: "operations:" },
            { text: "  pacman -S <package>   install something (try: pacman -S job)" },
            { text: "  pacman -Syu           full system upgrade" },
            { text: "  pacman -Q             list installed packages" },
            { text: "  pacman -R <package>   good luck" },
          ],
        };
      }
      if (/^-Q/.test(op)) {
        return {
          lines: [
            { text: "linux-tinkering 6.1.0-arch1" },
            { text: "typescript 5.9.2" },
            { text: "rs485-whispering 2.4.1" },
            { text: "yolo-v8n 97.0-accuracy" },
            { text: "websockets-low-latency 0.0.1" },
            { text: "caffeine 9.9.9-lts" },
            dim("6 packages installed — this system runs lean."),
          ],
        };
      }
      if (/^-R/.test(op)) {
        return {
          lines: [
            err(`error: target not found: ${targets[0] ?? "<nothing>"}`),
            dim("nothing on this system is removable. it all ships."),
          ],
        };
      }
      if (/^-S/.test(op)) {
        if (targets.length > 0) {
          return { action: { type: "pacman", op: "install", packages: targets } };
        }
        // -Sy / -Su / -Syu with no targets → system upgrade
        if (op.length > 2) {
          return { action: { type: "pacman", op: "upgrade", packages: [] } };
        }
        return { lines: [err("error: no targets specified (use -h for help)")] };
      }
      return { lines: [err(`error: invalid option '${op}'`)] };
    },
  },
  {
    name: "theme",
    description: "switch terminal colors",
    usage: "theme <name>",
    run: (args) => {
      const arg = args.find((a) => !a.startsWith("-"))?.toLowerCase();
      if (!arg || arg === "list" || arg === "ls") {
        const current = savedThemeName();
        const width = Math.max(...termThemes.map((t) => t.name.length)) + 2;
        return {
          lines: [
            dim("terminal themes:"),
            ...termThemes.map(
              (t): TermLine => ({
                text: `  ${t.name.padEnd(width)} ${t.blurb}`,
                spans: [
                  { text: "  " },
                  { text: t.name.padEnd(width), kind: t.name === current ? "accent" : undefined },
                  { text: t.blurb, kind: "dim" },
                  ...(t.name === current ? [{ text: "  ← current", kind: "green" as const }] : []),
                ],
              })
            ),
            { text: "" },
            dim("theme <name> to switch — your pick is remembered."),
          ],
        };
      }
      const theme = findTheme(arg === "default" || arg === "reset" ? DEFAULT_THEME_NAME : arg);
      if (!theme) return { lines: [err(`theme: ${arg}: not found — try 'theme list'`)] };
      return {
        lines: [
          {
            text: `theme set to ${theme.name}`,
            spans: [{ text: "theme set to " }, { text: theme.name, kind: "accent" }],
          },
          {
            text: "  accent · dim · error · green",
            spans: [
              { text: "  " },
              { text: "accent", kind: "accent" },
              { text: " · " },
              { text: "dim", kind: "dim" },
              { text: " · " },
              { text: "error", kind: "error" },
              { text: " · " },
              { text: "green", kind: "green" },
            ],
          },
        ],
        action: { type: "theme", theme },
      };
    },
  },
  {
    name: "pwd",
    description: "print working directory",
    hidden: true,
    run: (_args, ctx) => ({
      lines: [{ text: `/home/dvip${ctx.state.cwd === "/" ? "" : ctx.state.cwd}` }],
    }),
  },
  {
    name: "clear",
    description: "clear the screen",
    run: () => ({ action: { type: "clear" } }),
  },
  {
    name: "exit",
    description: "close the terminal",
    hidden: true,
    run: () => ({ action: { type: "exit" } }),
  },
  /* ── interactive easter eggs (behavior, not just text — the simple
        input→output ones live in content/easter-eggs.ts) ─────────────── */
  {
    name: "vim",
    description: "you know what happens",
    hidden: true,
    run: (_args, ctx) => {
      ctx.state.mode = "vim";
      return {
        lines: [
          { text: "You are now stuck in vim." },
          dim('(type something. anything. see if it helps.)'),
        ],
      };
    },
  },
  {
    name: "rm",
    description: "remove files",
    hidden: true,
    run: (args) => {
      const joined = args.join(" ");
      if (/-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r/.test(joined) && /\/|\*/.test(joined)) {
        return { action: { type: "selfdestruct" } };
      }
      return { lines: [err("rm: refusing to remove anything — this is a portfolio, not a filesystem")] };
    },
  },
  {
    name: "matrix",
    description: "follow the white rabbit",
    hidden: true,
    run: () => ({ action: { type: "matrix" } }),
  },
];

export function findCommand(name: string): Command | undefined {
  const n = name.toLowerCase();
  // vi/nvim/emacs all lead to the same place.
  if (n === "vi" || n === "nvim") return commands.find((c) => c.name === "vim");
  if (n === "themes") return commands.find((c) => c.name === "theme");
  return commands.find((c) => c.name === n);
}
