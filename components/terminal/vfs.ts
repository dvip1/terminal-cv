import { projects } from "@/content/projects";
import type { Post } from "@/content/writing";

/**
 * Virtual filesystem mirroring the site's information architecture.
 * Directories map to index pages, files map to pages or content blobs.
 */

export type VNode = {
  name: string;
  type: "dir" | "file";
  /** Excluded from `ls` and tab completion, still resolvable. */
  hidden?: boolean;
  children?: VNode[];
};

export function postSlug(post: Post): string {
  try {
    const path = new URL(post.url).pathname.replace(/\/+$/, "");
    const last = path.split("/").filter(Boolean).pop();
    if (last) return last;
  } catch {}
  return post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildVfs(posts: Post[]): VNode {
  return {
    name: "/",
    type: "dir",
    children: [
      {
        name: "writing",
        type: "dir",
        children: posts.map((p) => ({ name: postSlug(p), type: "file" as const })),
      },
      {
        name: "projects",
        type: "dir",
        children: projects.map((p) => ({ name: p.slug, type: "file" as const })),
      },
      { name: "about", type: "file" },
      { name: "contact", type: "file" },
      { name: "resume.pdf", type: "file" },
      {
        name: "blog",
        type: "dir",
        hidden: true,
        children: [{ name: "latest", type: "file" }],
      },
    ],
  };
}

/** Resolve a path argument against cwd into a normalized absolute path. */
export function resolvePath(cwd: string, arg: string): string {
  const base = arg.startsWith("/") || arg.startsWith("~") ? [] : segments(cwd);
  const parts = arg.replace(/^~\/?/, "").split("/");
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return "/" + base.join("/");
}

export function segments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function getNode(root: VNode, path: string): VNode | null {
  let node: VNode = root;
  for (const seg of segments(path)) {
    const child = node.children?.find((c) => c.name === seg);
    if (!child) return null;
    node = child;
  }
  return node;
}

export function displayCwd(cwd: string): string {
  return cwd === "/" ? "~" : "~" + cwd;
}
