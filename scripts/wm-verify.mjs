/* Temporary verification script for WM mode — drives the prod build. */
import { chromium } from "playwright";

const BASE = "http://localhost:3100";
const shots = "scripts/wm-shots";
const fails = [];
const ok = (cond, msg) => (cond ? console.log("  ok:", msg) : fails.push(msg));

const browser = await chromium.launch();

/* ── desktop ───────────────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/1-editorial-home.png` });

  // editorial: no WM chrome visible, wm-show hidden
  ok(!(await page.locator(".wm-titlebar").isVisible()), "editorial: titlebar hidden");
  ok(!(await page.getByText("dvip@arch").first().isVisible()), "editorial: identity is the serif name");
  await page.keyboard.press("2");
  await page.waitForTimeout(300);
  ok(new URL(page.url()).pathname === "/", "editorial: number hotkeys inactive");

  // toggle WM mode from the header button
  await page.locator(".wm-toggle").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/2-wm-home.png` });
  ok(await page.locator(".wm-titlebar").isVisible(), "wm: titlebar visible");
  ok((await page.locator(".wm-title").textContent()) === "~", "wm: home title is ~");
  ok(await page.getByText("dvip@arch").first().isVisible(), "wm: waybar identity shown");
  ok((await page.locator("nav a").count()) === 4, "wm: four workspaces, no home dupe");
  ok(
    (await page.locator('nav a[data-ws="1"]').getAttribute("href")) === "/writing",
    "wm: workspaces renumbered from 1"
  );

  // navigate: titlebar path + active workspace follow
  await page.locator('nav a[href="/projects"]').click();
  await page.waitForURL("**/projects");
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${shots}/3-wm-projects.png` });
  ok((await page.locator(".wm-title").textContent()) === "~/projects", "wm: projects title");
  ok(
    (await page.locator('nav a[data-active]').getAttribute("href")) === "/projects",
    "wm: active workspace follows route"
  );

  // [x] on a page → home
  await page.locator(".wm-close").click();
  await page.waitForURL(BASE + "/");
  ok(true, "wm: [x] routes home");

  // persistence across reload
  await page.reload({ waitUntil: "networkidle" });
  ok(await page.locator(".wm-titlebar").isVisible(), "wm: survives reload");

  // hotkeys: numbers jump to workspaces, t opens the terminal
  await page.keyboard.press("2");
  await page.waitForURL("**/projects");
  ok(true, "hotkey: 2 navigates to /projects");
  await page.keyboard.press("t");
  const termInput = page.locator("[data-terminal] input");
  await termInput.waitFor({ state: "visible", timeout: 10000 });
  ok(true, "hotkey: t opens the terminal");
  await page.waitForTimeout(500); // let the tiling tween settle
  const termBox = await page.locator(".terminal-overlay").boundingBox();
  ok(termBox && termBox.x > 600, `terminal tiles right half (x=${termBox?.x})`);
  const mainBox = await page.locator("main").boundingBox();
  ok(mainBox && mainBox.x + mainBox.width < 660, "page window tiles left half");
  ok(
    await page.locator(".terminal-backdrop").isHidden(),
    "no dimming backdrop in wm mode"
  );
  await page.screenshot({ path: `${shots}/3b-wm-tiled-terminal.png` });

  // digits typed inside the terminal must not navigate
  await termInput.click();
  await termInput.pressSequentially("3");
  await page.waitForTimeout(250);
  ok(page.url().endsWith("/projects"), "hotkey: digits typed in terminal don't navigate");
  await termInput.press("Backspace");

  // terminal `wm` command toggles it off
  await termInput.pressSequentially("wm");
  await termInput.press("Enter");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shots}/4-terminal-wm-cmd.png` });
  ok(
    (await page.evaluate(() => document.documentElement.dataset.wm)) === undefined,
    "terminal: `wm` disables the mode"
  );
  await termInput.pressSequentially("hyprctl");
  await termInput.press("Enter");
  await page.waitForTimeout(600);
  ok(
    (await page.evaluate(() => document.documentElement.dataset.wm)) === "on",
    "terminal: hyprctl alias re-enables"
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // [x]: routes home from /projects, then exits the mode on home
  await page.locator(".wm-close").click();
  await page.waitForURL(BASE + "/");
  await page.waitForTimeout(400);
  await page.locator(".wm-close").click();
  await page.waitForTimeout(400);
  ok(!(await page.locator(".wm-titlebar").isVisible()), "wm: [x] on home exits mode");
  await page.screenshot({ path: `${shots}/5-back-to-editorial.png` });

  ok(errors.length === 0, `no console errors (got: ${errors.join(" | ")})`);
  await page.close();
}

/* ── mobile: WM never applies even with localStorage on ────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => localStorage.setItem("wm", "on"));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/6-mobile.png` });
  ok(!(await page.locator(".wm-titlebar").isVisible()), "mobile: no titlebar despite wm=on");
  ok(!(await page.locator(".wm-toggle").isVisible()), "mobile: toggle hidden");
  ok(!(await page.getByText("dvip@arch").first().isVisible()), "mobile: editorial identity");
  await page.close();
}

/* ── reduced motion: functional, no animations ─────────────────────── */
{
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  await page.addInitScript(() => localStorage.setItem("wm", "on"));
  await page.goto(BASE, { waitUntil: "networkidle" });
  const anim = await page
    .locator(".wm-window")
    .evaluate((el) => getComputedStyle(el).animationName);
  ok(anim === "none", `reduced motion: window animation off (${anim})`);
  ok(await page.locator(".wm-titlebar").isVisible(), "reduced motion: chrome still renders");
  await page.close();
}

await browser.close();
if (fails.length) {
  console.error("\nFAILURES:");
  for (const f of fails) console.error("  ✗", f);
  process.exit(1);
}
console.log("\nall checks passed");
