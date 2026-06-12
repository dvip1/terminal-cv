import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

/* Accent + coordinated neutrals per variant. Empty css = current site. */
const VARIANTS = [
  { name: "1-arch-blue (current)", slug: "blue", css: "" },
  {
    name: "2-amber-phosphor",
    slug: "amber",
    css: `
      :root {
        --background: #fdfcf8; --foreground: #211e18; --muted: #6d6353;
        --border: #e9e3d6; --accent: #b45309;
        --term-bg: rgba(17, 13, 9, 0.97); --term-accent: #e8a33d;
      }
      [data-theme="dark"] {
        --background: #13110c; --foreground: #e2dcd0; --muted: #998f7e;
        --border: #2a261d; --accent: #e8a33d;
      }`,
  },
  {
    name: "3-terracotta",
    slug: "terra",
    css: `
      :root {
        --background: #fdfbf8; --foreground: #221c19; --muted: #71625b;
        --border: #eae2da; --accent: #a83c20;
        --term-bg: rgba(16, 11, 10, 0.97); --term-accent: #e8825f;
      }
      [data-theme="dark"] {
        --background: #131010; --foreground: #e0d9d5; --muted: #9b8d86;
        --border: #2b2421; --accent: #e8825f;
      }`,
  },
  {
    name: "4-phosphor-green",
    slug: "green",
    css: `
      :root {
        --background: #fcfdfc; --foreground: #1a211c; --muted: #5f6a62;
        --border: #e0e4e0; --accent: #15803d;
        --term-bg: rgba(8, 14, 10, 0.97); --term-accent: #4fc97e;
      }
      [data-theme="dark"] {
        --background: #0e1410; --foreground: #d6ded8; --muted: #88958c;
        --border: #222b25; --accent: #4fc97e;
      }`,
  },
];

const browser = await chromium.launch();

async function shot(variant, { theme, terminal }) {
  const ctx = await browser.newContext({
    viewport: { width: 760, height: 880 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto(`http://localhost:3199${terminal ? "/terminal" : "/"}`, {
    waitUntil: "networkidle",
  });
  if (variant.css) await page.addStyleTag({ content: variant.css });
  if (terminal) {
    await page.waitForTimeout(400);
    await page.keyboard.type("neofetch");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
  } else {
    // hover the first project so the accent hover state is visible
    await page.hover("ul li:first-child a span");
    await page.waitForTimeout(300);
  }
  const buf = await page.screenshot();
  await ctx.close();
  return buf;
}

for (const v of VARIANTS) {
  const light = await shot(v, { theme: "light" });
  const dark = await shot(v, { theme: "dark" });
  const term = await shot(v, { theme: "dark", terminal: true });
  writeFileSync(`scripts/t-${v.slug}-light.png`, light);
  writeFileSync(`scripts/t-${v.slug}-dark.png`, dark);
  writeFileSync(`scripts/t-${v.slug}-term.png`, term);

  // stitch: light | dark | terminal into one labeled composite
  const html = `<!doctype html><body style="margin:0;background:#202225;font-family:monospace">
    <div style="color:#eee;padding:10px 14px;font-size:20px">${v.name}</div>
    <div style="display:flex;gap:8px;padding:0 8px 8px">
      ${["light", "dark", "term"]
        .map(
          (k) =>
            `<img src="${resolve(`scripts/t-${v.slug}-${k}.png`).replace(/\\/g, "/")}" style="width:760px">`
        )
        .join("")}
    </div></body>`;
  writeFileSync(`scripts/t-${v.slug}.html`, html);
  const ctx = await browser.newContext({ viewport: { width: 2312, height: 940 } });
  const page = await ctx.newPage();
  await page.goto(`file://${resolve(`scripts/t-${v.slug}.html`).replace(/\\/g, "/")}`);
  await page.screenshot({ path: `scripts/variant-${v.slug}.png`, fullPage: true });
  await ctx.close();
  console.log(`composite: scripts/variant-${v.slug}.png`);
}

await browser.close();
console.log("done");
