// Drives the running site at localhost:3000 with system Edge via Playwright.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const shots = "scripts/shots";
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const log = (m) => console.log(m);

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
log("TITLE: " + (await page.title()));
log("H1: " + (await page.locator("h1").first().innerText()));
await page.screenshot({ path: `${shots}/01-home.png` });

// open terminal with backtick
await page.keyboard.press("`");
await page.waitForSelector('[data-terminal][data-open="true"]', { timeout: 5000 });
await page.waitForTimeout(500);
log("TERMINAL OPEN: yes");
await page.screenshot({ path: `${shots}/02-terminal-open.png` });

const term = page.locator("[data-terminal]");

async function run(cmd, settle = 900) {
  await page.locator("#terminal-input").fill(cmd);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(settle);
}

// help
await run("help");
const helpText = await term.innerText();
log("HELP HAS ls/cat/open/neofetch: " + ["ls", "cat", "open", "neofetch", "git log --career"].every((c) => helpText.includes(c)));

// ls
await run("ls");
const lsText = await term.innerText();
log("LS OUTPUT OK: " + ["writing/", "projects/", "about", "contact", "resume.pdf"].every((s) => lsText.includes(s)));
await page.screenshot({ path: `${shots}/03-help-ls.png` });

// tab completion probe
await page.locator("#terminal-input").fill("cat pro");
await page.keyboard.press("Tab");
log("TAB COMPLETE 'cat pro' -> " + (await page.locator("#terminal-input").inputValue()));

// neofetch
await run("neofetch", 1200);
await page.screenshot({ path: `${shots}/04-neofetch.png` });

// unknown command
await run("frobnicate");
const unk = await term.innerText();
log("UNKNOWN CMD MSG: " + unk.includes("command not found: frobnicate"));

// vim trap probe
await run("vim");
await run("q");
await run(":q!");
const vimText = await term.innerText();
log("VIM TRAP: " + (vimText.includes("stuck in vim") && vimText.includes("escaped.")));

// history probe: ArrowUp should recall ':q!'
await page.locator("#terminal-input").click();
await page.keyboard.press("ArrowUp");
log("HISTORY UP -> " + (await page.locator("#terminal-input").inputValue()));
await page.locator("#terminal-input").fill("");

// navigate via open
await run("open projects/cts-logger", 1500);
await page.waitForURL("**/projects/cts-logger", { timeout: 5000 });
const closed = await page.locator('[data-terminal][data-open="false"]').count();
log("NAVIGATED: " + page.url());
log("TERMINAL CLOSED AFTER NAV: " + (closed === 1));
await page.screenshot({ path: `${shots}/05-case-study.png` });

// Esc / backtick toggle probe on the case-study page
await page.keyboard.press("`");
await page.waitForTimeout(400);
const reopened = await page.locator('[data-terminal][data-open="true"]').count();
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
const closedAgain = await page.locator('[data-terminal][data-open="false"]').count();
log("REOPEN ` THEN ESC CLOSES: " + (reopened === 1 && closedAgain === 1));

// state preserved: reopen, check previous output still there (cwd/history survive)
await page.keyboard.press("`");
await page.waitForTimeout(400);
const persisted = (await term.innerText()).includes("stuck in vim");
log("SESSION PERSISTED ACROSS CLOSE: " + persisted);

// sudo hire-me easter egg (data-driven file)
await run("sudo hire-me", 1200);
await page.waitForURL("**/contact", { timeout: 5000 }).catch(() => {});
log("SUDO HIRE-ME -> " + page.url());
await page.screenshot({ path: `${shots}/06-contact-after-hireme.png` });

// mobile chips probe
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto("http://localhost:3000/terminal", { waitUntil: "networkidle" });
await mob.waitForTimeout(800);
const chips = await mob.locator("[data-terminal] button", { hasText: "neofetch" }).count();
log("MOBILE /terminal AUTO-OPEN + CHIPS: " + ((await mob.locator('[data-terminal][data-open="true"]').count()) === 1 && chips >= 1));
await mob.screenshot({ path: `${shots}/07-mobile-terminal.png` });

await browser.close();
log("DONE");
