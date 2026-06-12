import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  // Dev-only: lets phones on the LAN load /_next assets (hydration JS)
  // when browsing the dev server by IP — Next 16 blocks this by default.
  allowedDevOrigins: ["192.168.0.*", "192.168.56.*", "100.64.193.103"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
