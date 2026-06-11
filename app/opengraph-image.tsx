import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { site } from "@/content/site";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = `${site.name} — ${site.role}`;

export default function OgImage() {
  return renderOgImage("whoami", site.thesis);
}
