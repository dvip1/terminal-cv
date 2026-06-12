import type { CSSProperties } from "react";

/**
 * Stagger step for the `.rise` entrance animation (see globals.css).
 * Pair with the class: `className="rise" style={riseDelay(2)}`.
 * Steps are capped so long lists (writing index) don't trail forever.
 */
export function riseDelay(step: number): CSSProperties {
  return { "--rise": Math.min(step, 9) } as CSSProperties;
}
