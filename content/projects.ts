/**
 * Project index — drives /projects, the homepage "selected work" list,
 * and the terminal's `ls projects` / `cat projects/<slug>`.
 * The full case-study body for each slug lives in content/case-studies/<slug>.mdx.
 */

export type Project = {
  slug: string;
  title: string;
  oneliner: string;
  /** Short paragraph used in indexes, terminal `cat`, and meta descriptions. */
  summary: string;
  stack: string[];
  highlights: string[];
  year: string;
};

export const projects: Project[] = [
  {
    slug: "cts-logger",
    title: "CTS Logger",
    oneliner:
      "Dual-transport industrial data logger: 70+ devices, zero data loss.",
    summary:
      "An Electron/Node application that logs data from 70+ concurrent industrial devices over two transports at once — RS485/COM serial and WiFi/HTTP — with a command queue that auto-deduplicates requests. Six months in production with zero data loss.",
    stack: ["Electron", "Node.js", "RS485/COM", "WiFi/HTTP", "SQLite"],
    highlights: [
      "70+ concurrent devices across two transports",
      "Command queue with automatic deduplication",
      "6 months production uptime, zero data loss",
    ],
    year: "2025",
  },
  {
    slug: "vision-pipeline",
    title: "Real-time vision pipeline",
    oneliner:
      "YOLOv8n conveyor-belt detection holding a <50ms frame budget at 20 FPS.",
    summary:
      "A real-time object-detection pipeline for conveyor-belt monitoring: YOLOv8n inference over two concurrent video streams via MediaMTX and FastAPI WebSockets, hitting 97% accuracy while a custom StreamProfiler keeps every frame under a 50ms budget at 20 FPS.",
    stack: ["YOLOv8n", "FastAPI", "WebSockets", "MediaMTX", "Python"],
    highlights: [
      "2 concurrent streams, 97% detection accuracy",
      "Custom StreamProfiler enforcing <50ms frame budget",
      "Stable 20 FPS end-to-end in production",
    ],
    year: "2025",
  },
  {
    slug: "andon-monitoring",
    title: "Andon monitoring & AI analytics",
    oneliner:
      "Factory-floor monitoring for Mahindra Aeronautics with an LLM analytics chatbot.",
    summary:
      "A React/Node Andon monitoring platform for Mahindra Aeronautics with multi-level RBAC and a Gemma-powered text-to-SQL analytics chatbot — secured through prompt design, regex output filtering, and a read-only scoped database role — plus a dynamic JSON→charts rendering engine.",
    stack: ["React", "Node.js", "PostgreSQL", "Gemma", "RBAC"],
    highlights: [
      "Multi-level RBAC for factory-floor roles",
      "Text-to-SQL chatbot hardened with prompt design + regex filtering + read-only DB role",
      "Dynamic JSON→charts rendering engine",
    ],
    year: "2025",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
