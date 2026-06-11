import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Contact — Dvip Patel";

export default function OgImage() {
  return renderOgImage("ping dvip", "Email, GitHub, LinkedIn, resume.");
}
