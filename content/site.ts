/**
 * Single source of truth for everything about the site owner.
 * Both the editorial pages (server) and the terminal (client) import from here.
 */

export const site = {
  name: "Dvip Patel",
  header_name: "દ્વીપ પટેલ",
  role: "Full-stack engineer",
  thesis:
    "I build resilient real-time systems — from RS485 wires to production AI pipelines.",
  location: "Mumbai, India",
  email: "dvipatwork@gmail.com",
  github: "https://github.com/dvip1",
  githubHandle: "dvip1",
  linkedin: "https://www.linkedin.com/in/dvip-patel-23320a230",
  blog: "https://blogs.dvippatel.in",
  blogHost: "blogs.dvippatel.in",
  url: "https://dvippatel.in",
  os: "Arch Linux",
  careerStart: 2021,
  resumePath: "/resume.pdf",
} as const;

export const bio = {
  short:
    "Full-stack engineer working the entire stack: Linux systems and networking up to production AI pipelines.",
  // Returned by `whoami` the second time it runs.
  philosophical:
    "A process that refuses to crash. I move bytes between wires and weights — RS485 frames in, model inferences out — and try to leave every system more resilient than I found it.",
  long: [
    "I'm Dvip Patel, a full-stack engineer who works the entire stack in the literal sense: from Linux systems and serial wires at the bottom to production AI pipelines at the top.",
    "Most of my work lives where software meets hardware and where downtime isn't an option — resilient real-time monitoring systems that talk to factory devices over RS485/COM and WiFi IoT, and real-time computer-vision pipelines that have to hold a frame budget, not just a benchmark score.",
    "I run Arch Linux as my daily driver (btw), which is less a personality trait and more a commitment to understanding every layer I depend on.",
  ],
} as const;

export type SkillGroup = { layer: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    layer: "Systems",
    items: [
      "Linux (Arch, daily driver)",
      "Networking",
      "RS485 / COM serial protocols",
      "WiFi IoT integration",
      "Electron",
    ],
  },
  {
    layer: "Backend",
    items: [
      "Node.js",
      "FastAPI / Python",
      "WebSockets",
      "PostgreSQL / SQL",
      "Command queues & dedup strategies",
      "RBAC & auth design",
    ],
  },
  {
    layer: "Frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "Dynamic data-driven UI (JSON→charts)",
    ],
  },
  {
    layer: "AI",
    items: [
      "YOLOv8 / real-time vision",
      "MediaMTX streaming",
      "LLM integration (Gemma text-to-SQL)",
      "Prompt security & output filtering",
    ],
  },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
};

export const experience: Experience[] = [
  {
    company: "KVAR Technologies",
    role: "Full-stack engineer",
    period: "2025 — present",
    summary:
      "Building resilient real-time monitoring software with hardware integration and AI analytics for industrial clients.",
  },
  {
    company: "Asynk Automating Technologies",
    role: "Software engineering intern",
    period: "2023 — 2024",
    summary:
      "Automation tooling and full-stack development internship.",
  },
];

export const education = {
  degree: "B.E. Electronics & Computer Science",
  school: "Shree L.R. Tiwari College of Engineering",
  period: "2021 — 2025",
} as const;

export const nav = [
  { label: "writing", href: "/writing" },
  { label: "projects", href: "/projects" },
  { label: "about", href: "/about" },
  { label: "contact", href: "/contact" },
] as const;
