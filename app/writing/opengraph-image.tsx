import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { site } from "@/content/site";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Writing — Dvip Patel";

export default function OgImage() {
  return renderOgImage("ls writing/", `Technical writing on ${site.blogHost}`);
}
