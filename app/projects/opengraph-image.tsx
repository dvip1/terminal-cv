import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Projects — Dvip Patel";

export default function OgImage() {
  return renderOgImage("ls projects/", "Case studies of systems built to survive production.");
}
