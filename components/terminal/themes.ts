/**
 * Terminal color schemes, selectable via the `theme` command. A theme is
 * just new values for the six --term-* tokens defined in globals.css —
 * applied as inline custom properties on <html> so every term color in
 * the overlay (and the matrix rain) follows. The choice persists per
 * visitor in localStorage; "arch" is the house default from globals.css.
 */

export type TermTheme = {
  name: string;
  /** One-liner shown by `theme list`. */
  blurb: string;
  colors: {
    bg: string;
    fg: string;
    accent: string;
    dim: string;
    error: string;
    green: string;
  };
};

export const DEFAULT_THEME_NAME = "arch";
const STORAGE_KEY = "term-theme";

export const termThemes: TermTheme[] = [
  {
    name: "arch",
    blurb: "house default — Arch blue on near-black",
    colors: {
      bg: "rgba(9, 13, 17, 0.97)",
      fg: "#ccd6e0",
      accent: "#58b7e8",
      dim: "#6b7785",
      error: "#e8705f",
      green: "#57c97a",
    },
  },
  {
    name: "dracula",
    blurb: "purple on dark slate",
    colors: {
      bg: "rgba(40, 42, 54, 0.97)",
      fg: "#f8f8f2",
      accent: "#bd93f9",
      dim: "#6272a4",
      error: "#ff5555",
      green: "#50fa7b",
    },
  },
  {
    name: "gruvbox",
    blurb: "warm retro hardcopy",
    colors: {
      bg: "rgba(40, 40, 40, 0.97)",
      fg: "#ebdbb2",
      accent: "#fabd2f",
      dim: "#928374",
      error: "#fb4934",
      green: "#b8bb26",
    },
  },
  {
    name: "nord",
    blurb: "arctic frost blues",
    colors: {
      bg: "rgba(46, 52, 64, 0.97)",
      fg: "#d8dee9",
      accent: "#88c0d0",
      dim: "#616e88",
      error: "#bf616a",
      green: "#a3be8c",
    },
  },
  {
    name: "solarized",
    blurb: "the 2011 classic, dark variant",
    colors: {
      bg: "rgba(0, 43, 54, 0.97)",
      fg: "#93a1a1",
      accent: "#268bd2",
      dim: "#586e75",
      error: "#dc322f",
      green: "#859900",
    },
  },
  {
    name: "catppuccin",
    blurb: "soothing mocha pastels",
    colors: {
      bg: "rgba(30, 30, 46, 0.97)",
      fg: "#cdd6f4",
      accent: "#cba6f7",
      dim: "#6c7086",
      error: "#f38ba8",
      green: "#a6e3a1",
    },
  },
  {
    name: "tokyo-night",
    blurb: "neon over a midnight city",
    colors: {
      bg: "rgba(26, 27, 38, 0.97)",
      fg: "#c0caf5",
      accent: "#7aa2f7",
      dim: "#565f89",
      error: "#f7768e",
      green: "#9ece6a",
    },
  },
  {
    name: "monokai",
    blurb: "the TextMate/Sublime classic",
    colors: {
      bg: "rgba(39, 40, 34, 0.97)",
      fg: "#f8f8f2",
      accent: "#66d9ef",
      dim: "#75715e",
      error: "#f92672",
      green: "#a6e22e",
    },
  },
];

export function findTheme(name: string): TermTheme | undefined {
  const n = name.toLowerCase();
  return termThemes.find((t) => t.name === n);
}

/** Apply a theme's tokens and remember the choice. */
export function applyTermTheme(theme: TermTheme): void {
  const style = document.documentElement.style;
  for (const [key, value] of Object.entries(theme.colors)) {
    style.setProperty(`--term-${key}`, value);
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme.name);
  } catch {
    // private mode — theme still applies for this page load
  }
}

export function savedThemeName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_NAME;
  } catch {
    return DEFAULT_THEME_NAME;
  }
}

/** Re-apply the persisted choice on mount. No-op for the default. */
export function restoreTermTheme(): void {
  const name = savedThemeName();
  if (name === DEFAULT_THEME_NAME) return;
  const theme = findTheme(name);
  if (theme) applyTermTheme(theme);
}
