import { WindowFrame } from "@/components/wm/WindowFrame";

/* template.tsx remounts its subtree on every navigation — that fresh
   mount is what replays the WM window pop-in (and the editorial .rise
   cascade) on client-side route changes. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <WindowFrame>{children}</WindowFrame>;
}
