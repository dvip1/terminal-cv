"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Post } from "@/content/writing";
import { TerminalEngine } from "./engine";
import { MatrixRain } from "./MatrixRain";
import { applyTermTheme, restoreTermTheme } from "./themes";
import type { CommandResult, TermLine } from "./types";

type Entry = {
  id: number;
  /** Echo of the typed command, rendered as a prompt line. */
  prompt?: { label: string; input: string };
  lines: TermLine[];
};

const CHIPS: { label: string; command: string }[] = [
  { label: "whoami", command: "whoami" },
  { label: "projects", command: "ls projects" },
  { label: "blog", command: "cat blog/latest" },
  { label: "contact", command: "cat contact" },
  { label: "neofetch", command: "neofetch" },
];

const WELCOME: TermLine[] = [
  { text: "dvipOS 1.0 — terminal layer over dvippatel.in", kind: "accent" },
  { text: "type 'help' for commands. 'open <path>' navigates the real site.", kind: "dim" },
];

let nextId = 1;

export function Terminal({
  isOpen,
  onClose,
  posts = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  posts?: Post[];
}) {
  const router = useRouter();
  const engine = useMemo(() => new TerminalEngine({ posts }), [posts]);

  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: nextId++, lines: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [busy, setBusy] = useState(false);
  const [matrixOn, setMatrixOn] = useState(false);
  const [glitching, setGlitching] = useState(false);

  // Typewriter: the entry currently animating and how many lines are shown.
  const [animId, setAnimId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(0);

  const historyRef = useRef<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const draftRef = useRef("");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useReducedMotion();

  // Re-apply the visitor's persisted color scheme (see themes.ts).
  useEffect(() => {
    restoreTermTheme();
  }, []);

  /* ── output helpers ─────────────────────────────────────────────── */

  const pushEntry = useCallback(
    (entry: Omit<Entry, "id">, animate = false) => {
      const id = nextId++;
      setEntries((prev) => [...prev, { ...entry, id }]);
      if (animate && !reducedMotion && entry.lines.length > 1) {
        setAnimId(id);
        setRevealed(0);
      }
      return id;
    },
    [reducedMotion]
  );

  // Rewrite an existing entry's lines in place (used for progress bars).
  const updateEntry = useCallback((id: number, lines: TermLine[]) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, lines } : e)));
  }, []);

  const finishReveal = useCallback(() => {
    setAnimId(null);
    setRevealed(Infinity);
  }, []);

  // Typewriter tick — fast line-by-line reveal. Once revealed passes the
  // line count the effect simply stops scheduling; a fully-revealed animId
  // renders identically to a non-animated entry.
  useEffect(() => {
    if (animId === null) return;
    const entry = entries.find((e) => e.id === animId);
    if (!entry || revealed >= entry.lines.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 26);
    return () => clearTimeout(t);
  }, [animId, revealed, entries]);

  // Keep scrolled to the bottom as output appears.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, revealed]);

  // Focus the prompt whenever the terminal opens, and re-focus after the
  // input remounts (it unmounts while busy / during matrix).
  useEffect(() => {
    if (isOpen && !busy && !matrixOn) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen, busy, matrixOn]);

  /* ── rm -rf / sequence ──────────────────────────────────────────── */

  const selfDestruct = useCallback(async () => {
    setBusy(true);
    const victims = [
      "/usr", "/etc", "/var", "/boot", "/opt",
      "/home/dvip/projects", "/home/dvip/.config", "/home/dvip",
    ];
    if (reducedMotion) {
      pushEntry({
        lines: [
          ...victims.map((v) => ({ text: `removed '${v}'`, kind: "dim" as const })),
          { text: "...", kind: "dim" },
          { text: "dvipOS 1.0 — recovery mode", kind: "accent" },
          { text: "fsck: all data intact.", kind: "green" },
          { text: "nice try.", kind: "accent" },
        ],
      });
      setBusy(false);
      return;
    }
    for (const v of victims) {
      pushEntry({ lines: [{ text: `removed '${v}'`, kind: "dim" }] });
      await sleep(90);
    }
    setGlitching(true);
    await sleep(900);
    setGlitching(false);
    setEntries([]);
    pushEntry({ lines: [{ text: "dvipOS 1.0 — recovery mode", kind: "accent" }] });
    await sleep(300);
    pushEntry({ lines: [{ text: "fsck: checking /dev/portfolio ... all data intact.", kind: "green" }] });
    await sleep(400);
    pushEntry({ lines: [{ text: "nice try.", kind: "accent" }] });
    setBusy(false);
  }, [pushEntry, reducedMotion]);

  /* ── pacman install/upgrade sequence ────────────────────────────── */

  const runPacman = useCallback(
    async (op: "install" | "upgrade", packages: string[]) => {
      setBusy(true);
      try {
        if (op === "upgrade") {
          const dbs = ["core", "extra", "multilib"];
          if (reducedMotion) {
            pushEntry({
              lines: [
                { text: ":: Synchronizing package databases...", kind: "dim" },
                ...dbs.map((d) => ({
                  text: ` ${d.padEnd(10)} ${pacbar(100)}`,
                  kind: "green" as const,
                })),
                { text: ":: Starting full system upgrade...", kind: "dim" },
                { text: "resolving dependencies..." },
                { text: "" },
                { text: "there is nothing to do — dvip is already running the latest version.", kind: "accent" },
              ],
            });
            return;
          }
          pushEntry({ lines: [{ text: ":: Synchronizing package databases...", kind: "dim" }] });
          for (const db of dbs) {
            const id = pushEntry({ lines: [{ text: ` ${db.padEnd(10)} ${pacbar(0)}` }] });
            for (const pct of PAC_STEPS) {
              await sleep(70);
              updateEntry(id, [
                { text: ` ${db.padEnd(10)} ${pacbar(pct)}`, kind: pct === 100 ? "green" : undefined },
              ]);
            }
          }
          pushEntry({ lines: [{ text: ":: Starting full system upgrade...", kind: "dim" }] });
          await sleep(350);
          pushEntry({ lines: [{ text: "resolving dependencies..." }] });
          await sleep(350);
          pushEntry({
            lines: [
              { text: "" },
              { text: "there is nothing to do — dvip is already running the latest version.", kind: "accent" },
            ],
          });
          return;
        }

        const n = packages.length;
        const header: TermLine[] = [
          { text: "resolving dependencies..." },
          { text: "looking for conflicting packages..." },
          { text: "" },
          { text: `Packages (${n})  ${packages.join("  ")}` },
          { text: "" },
          { text: ":: Proceed with installation? [Y/n] y", kind: "dim" },
        ];
        const footer: TermLine[] = [
          { text: "" },
          { text: "optional dependencies detected:", kind: "dim" },
          { text: "    dvip: full-stack engineer — resolve with 'hire-me'", kind: "accent" },
        ];
        if (reducedMotion) {
          pushEntry({
            lines: [
              ...header,
              ...packages.map((p, i) => ({
                text: `(${i + 1}/${n}) installing ${p} ${pacbar(100)}`,
                kind: "green" as const,
              })),
              ...footer,
            ],
          });
          return;
        }
        pushEntry({ lines: header }, true);
        await sleep(450);
        for (let i = 0; i < n; i++) {
          const label = `(${i + 1}/${n}) installing ${packages[i]}`;
          const id = pushEntry({ lines: [{ text: `${label} ${pacbar(0)}` }] });
          for (const pct of PAC_STEPS) {
            await sleep(80);
            updateEntry(id, [
              { text: `${label} ${pacbar(pct)}`, kind: pct === 100 ? "green" : undefined },
            ]);
          }
        }
        pushEntry({ lines: footer });
      } finally {
        setBusy(false);
      }
    },
    [pushEntry, reducedMotion, updateEntry]
  );

  /* ── command execution ──────────────────────────────────────────── */

  const applyResult = useCallback(
    (res: CommandResult) => {
      if (res.action?.type === "clear") {
        setEntries([]);
        return;
      }
      if (res.lines?.length) pushEntry({ lines: res.lines }, true);
      switch (res.action?.type) {
        case "navigate": {
          const to = res.action.to;
          setTimeout(() => {
            onClose();
            router.push(to);
          }, 400);
          break;
        }
        case "open-external": {
          const url = res.action.url;
          setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 200);
          break;
        }
        case "download": {
          const a = document.createElement("a");
          a.href = res.action.href;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          a.remove();
          break;
        }
        case "matrix": {
          if (reducedMotion) {
            pushEntry({
              lines: [{ text: "matrix needs motion — your system prefers reduced motion, and I respect that.", kind: "dim" }],
            });
          } else {
            setMatrixOn(true);
          }
          break;
        }
        case "selfdestruct":
          void selfDestruct();
          break;
        case "theme":
          applyTermTheme(res.action.theme);
          break;
        case "pacman":
          void runPacman(res.action.op, res.action.packages);
          break;
        case "exit":
          onClose();
          break;
      }
    },
    [onClose, pushEntry, reducedMotion, router, runPacman, selfDestruct]
  );

  const runCommand = useCallback(
    async (raw: string) => {
      if (busy) return;
      const label = engine.isVim() ? "vim" : `dvip@arch ${engine.promptCwd()} $`;
      finishReveal();
      pushEntry({ prompt: { label, input: raw }, lines: [] });
      if (raw.trim()) {
        historyRef.current.push(raw);
      }
      setHistIdx(null);
      setInput("");
      setCaret(0);
      setBusy(true);
      let res: CommandResult;
      try {
        res = await engine.run(raw);
      } finally {
        setBusy(false);
      }
      // selfdestruct/matrix manage their own busy/input state from here.
      applyResult(res);
    },
    [applyResult, busy, engine, finishReveal, pushEntry]
  );

  /* ── input handling ─────────────────────────────────────────────── */

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (animId !== null) finishReveal();

    if (e.key === "Enter") {
      e.preventDefault();
      void runCommand(input);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length === 0) return;
      const idx = histIdx === null ? h.length - 1 : Math.max(0, histIdx - 1);
      if (histIdx === null) draftRef.current = input;
      setHistIdx(idx);
      setInput(h[idx]);
      setCaret(h[idx].length);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = historyRef.current;
      if (histIdx === null) return;
      if (histIdx >= h.length - 1) {
        setHistIdx(null);
        setInput(draftRef.current);
        setCaret(draftRef.current.length);
      } else {
        setHistIdx(histIdx + 1);
        setInput(h[histIdx + 1]);
        setCaret(h[histIdx + 1].length);
      }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { completed, candidates } = engine.complete(input);
      if (completed) {
        setInput(completed);
        setCaret(completed.length);
      } else if (candidates?.length) {
        pushEntry({ lines: [{ text: candidates.join("  "), kind: "dim" }] });
      }
      return;
    }
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  /* ── render ─────────────────────────────────────────────────────── */

  const promptLabel = engine.isVim() ? "vim" : `dvip@arch ${engine.promptCwd()} $`;

  return (
    <>
      {/* backdrop dims the page underneath; click closes */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        data-terminal
        role="dialog"
        aria-modal="false"
        aria-label="Terminal"
        aria-hidden={!isOpen}
        data-open={isOpen}
        className={`terminal-overlay fixed inset-x-0 top-0 z-50 h-[68vh] md:h-[60vh] flex flex-col bg-term-bg text-term-fg font-mono text-[13px] leading-relaxed shadow-2xl border-b border-term-dim/30 ${
          glitching ? "glitching" : ""
        } ${isOpen ? "" : "pointer-events-none"}`}
        onClick={() => {
          if (window.getSelection()?.isCollapsed) inputRef.current?.focus();
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-term-dim/20 text-term-dim text-xs select-none">
          <span>dvip@arch — dvipsh</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal"
            className="hover:text-term-fg transition-colors px-2"
          >
            ✕ esc
          </button>
        </div>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-3">
          {matrixOn && (
            <MatrixRain
              onDone={() => {
                setMatrixOn(false);
                setBusy(false);
                inputRef.current?.focus();
              }}
            />
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="whitespace-pre-wrap break-words">
              {entry.prompt && (
                <div>
                  <span className="text-term-accent">{entry.prompt.label}</span>{" "}
                  <span>{entry.prompt.input}</span>
                </div>
              )}
              {(entry.id === animId
                ? entry.lines.slice(0, revealed)
                : entry.lines
              ).map((line, i) => (
                <Line key={i} line={line} />
              ))}
            </div>
          ))}

          {/* prompt */}
          {!matrixOn && !busy && (
            <div className="flex items-baseline">
              <label htmlFor="terminal-input" className="sr-only">
                Terminal command
              </label>
              <span className="text-term-accent shrink-0">{promptLabel}</span>
              <span className="relative flex-1 ml-[0.6ch]">
                <input
                  ref={inputRef}
                  id="terminal-input"
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setCaret(e.target.selectionStart ?? e.target.value.length);
                  }}
                  onSelect={(e) =>
                    setCaret(
                      (e.target as HTMLInputElement).selectionStart ?? input.length
                    )
                  }
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  className="w-full bg-transparent outline-none caret-transparent"
                />
                {/* block cursor */}
                <span
                  aria-hidden="true"
                  className="absolute top-0 pointer-events-none"
                  style={{ left: `${caret}ch` }}
                >
                  <span className="term-cursor" />
                </span>
              </span>
            </div>
          )}
        </div>

        {/* mobile command chips */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-2.5 border-t border-term-dim/20">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => void runCommand(chip.command)}
              className="shrink-0 border border-term-dim/40 rounded-full px-3 py-1 text-xs text-term-fg hover:border-term-accent hover:text-term-accent transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Line({ line }: { line: TermLine }) {
  const kindClass = {
    plain: "",
    accent: "text-term-accent",
    error: "text-term-error",
    dim: "text-term-dim",
    green: "text-term-green",
  }[line.kind ?? "plain"];

  if (line.spans) {
    return (
      <div>
        {line.spans.map((s, i) => (
          <span
            key={i}
            className={
              {
                plain: "",
                accent: "text-term-accent",
                error: "text-term-error",
                dim: "text-term-dim",
                green: "text-term-green",
              }[s.kind ?? "plain"]
            }
          >
            {s.text}
          </span>
        ))}
      </div>
    );
  }
  if (line.href) {
    const external = line.href.startsWith("http") || line.href.startsWith("mailto:");
    return (
      <div>
        <a
          href={line.href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`underline underline-offset-2 hover:text-term-accent ${kindClass}`}
        >
          {line.text}
        </a>
      </div>
    );
  }
  // preserve empty lines
  return <div className={kindClass}>{line.text || " "}</div>;
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* pacman-style progress bar: [########------------]  40% */
const PAC_STEPS = [9, 23, 41, 58, 76, 100];

function pacbar(pct: number): string {
  const width = 20;
  const filled = Math.round((pct / 100) * width);
  return `[${"#".repeat(filled)}${"-".repeat(width - filled)}] ${String(pct).padStart(3)}%`;
}
