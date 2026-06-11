import { easterEggs, type EasterEgg, type EggLine } from "@/content/easter-eggs";
import type { Post } from "@/content/writing";
import { commands, findCommand } from "./commands";
import type {
  CommandContext,
  CommandResult,
  EngineOptions,
  TermLine,
  TermState,
} from "./types";
import { buildVfs, getNode, resolvePath, type VNode } from "./vfs";

/**
 * The terminal's brain: parses input, dispatches to easter eggs (data-driven,
 * see content/easter-eggs.ts), then commands, then the onUnknown hook —
 * which is where an LLM answerer can plug in later (see EngineOptions).
 */
export class TerminalEngine {
  readonly state: TermState = { cwd: "/", whoamiCount: 0, mode: "shell" };
  private readonly posts: Post[];
  private readonly vfs: VNode;
  private readonly opts: EngineOptions;

  constructor(opts: EngineOptions) {
    this.opts = opts;
    this.posts = opts.posts;
    this.vfs = buildVfs(opts.posts);
  }

  private ctx(raw: string): CommandContext {
    return { state: this.state, posts: this.posts, raw };
  }

  async run(rawInput: string): Promise<CommandResult> {
    const input = rawInput.trim().replace(/\s+/g, " ");
    if (!input) return {};

    if (this.state.mode === "vim") return this.runVim(input);

    const egg = matchEgg(input);
    if (egg) return eggToResult(egg);

    // `sudo X` — strip the sudo and run X like a real lax sysadmin.
    if (/^sudo\s/i.test(input)) {
      const rest = input.replace(/^sudo\s+/i, "");
      const restEgg = matchEgg(rest);
      if (restEgg) return eggToResult(restEgg);
      const [name, ...args] = rest.split(" ");
      const cmd = findCommand(name);
      if (cmd) return cmd.run(args, this.ctx(rest));
      return {
        lines: [
          {
            text: `${name}: command not found. Also: you are not in the sudoers file. This incident will be reported.`,
            kind: "error",
          },
        ],
      };
    }

    const [name, ...args] = input.split(" ");
    const cmd = findCommand(name);
    if (cmd) return cmd.run(args, this.ctx(input));

    // FUTURE LLM HOOK: free-form questions land here. Wire an async
    // answerer via EngineOptions.onUnknown (e.g. POST to /api/ask).
    if (this.opts.onUnknown) {
      const answered = await this.opts.onUnknown(input, this.ctx(input));
      if (answered) return answered;
    }

    return {
      lines: [{ text: `command not found: ${name} — try 'help'`, kind: "error" }],
    };
  }

  private runVim(input: string): CommandResult {
    if (input === ":q!") {
      this.state.mode = "shell";
      return {
        lines: [
          { text: "escaped.", kind: "accent" },
          { text: "welcome back to the shell.", kind: "dim" },
        ],
      };
    }
    if (/^:/.test(input)) {
      return {
        lines: [
          { text: `E492: Not an editor command: ${input.slice(1)}`, kind: "error" },
          { text: "(hint: the only way out is :q!)", kind: "dim" },
        ],
      };
    }
    if (/^(q|quit|exit|\^c|ctrl\+?c|esc|help)$/i.test(input)) {
      return {
        lines: [
          { text: "Nope. This is vim. Normal rules do not apply.", kind: "error" },
          { text: "(:q! — that's the incantation)", kind: "dim" },
        ],
      };
    }
    return { lines: [{ text: "-- INSERT -- (you wish)", kind: "dim" }] };
  }

  /**
   * Tab completion. Returns the new input when unambiguous, or the list of
   * candidates when multiple match.
   */
  complete(input: string): { completed?: string; candidates?: string[] } {
    const endsWithSpace = /\s$/.test(input);
    const tokens = input.trimStart().split(/\s+/).filter(Boolean);

    // First token → command names.
    if (tokens.length === 0 || (tokens.length === 1 && !endsWithSpace)) {
      const prefix = (tokens[0] ?? "").toLowerCase();
      const names = commands.filter((c) => !c.hidden).map((c) => c.name);
      const matches = names.filter((n) => n.startsWith(prefix));
      if (matches.length === 1) return { completed: matches[0] + " " };
      if (matches.length > 1) return { candidates: matches };
      return {};
    }

    // Path argument for filesystem-ish commands.
    const cmdName = tokens[0].toLowerCase();
    if (!["ls", "cd", "cat", "open"].includes(cmdName)) return {};
    const partial = endsWithSpace ? "" : tokens[tokens.length - 1];
    const lastSlash = partial.lastIndexOf("/");
    const dirPart = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : "";
    const fragment = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial;
    const dirPath = dirPart
      ? resolvePath(this.state.cwd, dirPart)
      : this.state.cwd;
    const dirNode = getNode(this.vfs, dirPath);
    if (!dirNode || dirNode.type !== "dir") return {};
    let children = (dirNode.children ?? []).filter((c) => !c.hidden);
    if (cmdName === "cd") children = children.filter((c) => c.type === "dir");
    const matches = children.filter((c) => c.name.startsWith(fragment));
    if (matches.length === 1) {
      const m = matches[0];
      const completedArg = dirPart + m.name + (m.type === "dir" ? "/" : " ");
      const head = endsWithSpace
        ? input
        : input.slice(0, input.length - partial.length);
      return { completed: head + completedArg };
    }
    if (matches.length > 1) {
      return {
        candidates: matches.map((c) => (c.type === "dir" ? `${c.name}/` : c.name)),
      };
    }
    return {};
  }

  promptCwd(): string {
    return this.state.cwd === "/" ? "~" : "~" + this.state.cwd;
  }

  isVim(): boolean {
    return this.state.mode === "vim";
  }
}

/* ── easter-egg matching (data file → results) ───────────────────────── */

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function matchEgg(input: string): EasterEgg | undefined {
  const n = normalize(input);
  return easterEggs.find(
    (egg) =>
      normalize(egg.input) === n ||
      egg.aliases?.some((a) => normalize(a) === n)
  );
}

function eggLineToTermLine(line: EggLine): TermLine {
  if (typeof line === "string") return { text: line };
  return { text: line.text, kind: line.kind };
}

function eggToResult(egg: EasterEgg): CommandResult {
  const result: CommandResult = { lines: egg.output.map(eggLineToTermLine) };
  if (egg.navigate) result.action = { type: "navigate", to: egg.navigate };
  else if (egg.download) result.action = { type: "download", href: egg.download };
  return result;
}
