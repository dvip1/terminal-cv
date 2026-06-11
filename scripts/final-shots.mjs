// Final visual pass: focus retention, escape, rm -rf glitch, matrix, theme.
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

await page.keyboard.press("`");
await page.waitForSelector('[data-terminal][data-open="true"]');
await page.waitForTimeout(500);
await page.screenshot({ path: "scripts/shots/09-terminal-fixed.png", clip: { x: 0, y: 0, width: 1280, height: 200 } });

// keyboard-only flow: type two commands in a row WITHOUT clicking/filling —
// proves focus survives the busy unmount/remount.
await page.keyboard.type("whoami");
await page.keyboard.press("Enter");
await page.waitForTimeout(600);
await page.keyboard.type("whoami");
await page.keyboard.press("Enter");
await page.waitForTimeout(600);
const t1 = await page.locator("[data-terminal]").innerText();
console.log("KEYBOARD-ONLY 2x whoami (philosophical 2nd): " + t1.includes("refuses to crash"));

// rm -rf / sequence
await page.keyboard.type("rm -rf /");
await page.keyboard.press("Enter");
await page.waitForTimeout(2800);
const after = await page.locator("[data-terminal]").innerText();
console.log("RM SEQUENCE ENDED WITH NICE TRY: " + after.includes("nice try."));
await page.screenshot({ path: "scripts/shots/10-after-rm.png", clip: { x: 0, y: 0, width: 1280, height: 250 } });

// matrix + any-key exit, then keep typing
await page.keyboard.type("matrix");
await page.keyboard.press("Enter");
await page.waitForTimeout(1200);
const canvasOn = await page.locator("[data-terminal] canvas").count();
await page.screenshot({ path: "scripts/shots/11-matrix.png", clip: { x: 0, y: 0, width: 1280, height: 480 } });
await page.keyboard.press("x");
await page.waitForTimeout(500);
const canvasOff = await page.locator("[data-terminal] canvas").count();
console.log("MATRIX ON->OFF: " + (canvasOn === 1 && canvasOff === 0));

// pacman egg from the data file — typed, not filled
await page.keyboard.type("pacman -S job");
await page.keyboard.press("Enter");
await page.waitForTimeout(1400);
console.log("PACMAN EGG: " + (await page.locator("[data-terminal]").innerText()).includes("signature is unknown trust"));

// Escape closes (global handler, regardless of focus)
await page.locator("body").click({ position: { x: 640, y: 700 } });
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
console.log("ESC CLOSES EVEN UNFOCUSED: " + ((await page.locator('[data-terminal][data-open="false"]').count()) === 1));

// dark theme toggle + persistence
await page.locator('button[aria-label*="dark theme"]').click();
await page.waitForTimeout(300);
console.log("THEME ATTR: " + (await page.evaluate(() => document.documentElement.dataset.theme)));
await page.screenshot({ path: "scripts/shots/12-dark-home.png" });
await page.reload({ waitUntil: "networkidle" });
console.log("THEME AFTER RELOAD: " + (await page.evaluate(() => document.documentElement.dataset.theme)));

await browser.close();
console.log("DONE");
