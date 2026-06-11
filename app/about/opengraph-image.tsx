import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { bio } from "@/content/site";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "About — Dvip Patel";

export default function OgImage() {
  return renderOgImage("cat about", bio.short);
}
