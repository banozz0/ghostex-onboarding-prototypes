// PROTOTYPE A · headless interaction check. Prints PASS/FAIL per claim, then console errors.
//   node src/a-clean-shader/check.mjs [--dpr2]
import { chromium } from "playwright";
import { resolve } from "node:path";

const file = `file://${resolve(import.meta.dirname, "../../dist/a-clean-shader.html")}`;
const dpr2 = process.argv.includes("--dpr2");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: dpr2 ? 2 : 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

let fails = 0;
const ok = (name, cond) => {
  if (!cond) fails++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
};
const open = async (n) => {
  await page.goto(`${file}?step=${n}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
};
const has = (t) => page.getByText(t, { exact: false }).first().isVisible().catch(() => false);
const wait = (ms) => page.waitForTimeout(ms);

if (dpr2) {
  for (const n of [2, 5]) {
    await open(n);
    await wait(900);
    await page.screenshot({ path: resolve(import.meta.dirname, `../.shots/a-${n}-dpr2.png`) });
  }
  console.log("dpr2 shots written");
  await browser.close();
  process.exit(0);
}

// chrome + keyboard
await open(1);
ok("logo renders (non-empty background)", await page.evaluate(() => getComputedStyle(document.querySelector(".lockup .gx-logo")).backgroundImage.startsWith('url("data:image/png')));
await page.keyboard.press("ArrowRight");
await wait(300);
ok("ArrowRight goes to step 02", (await page.locator(".counter b").textContent()) === "02");
await page.locator(".dots button").nth(6).click();
await wait(300);
ok("dot 7 jumps to step 07", (await page.locator(".counter b").textContent()) === "07");

// step 1
await open(1);
await page.locator(".agent", { hasText: "Codex CLI" }).click();
await wait(1500);
ok("agent row switches the session", await has("The legacy harness sets up global fixtures"));
await page.locator('input[placeholder="Message Codex CLI"]').fill("keep the global fixtures");
await page.keyboard.press("Enter");
await wait(1800);
ok("composer sends and the agent replies", await has("Carrying on with the port"));
await page.locator(".tabs button", { hasText: "Code" }).click();
ok("Code tab shows the diff", await has("Review comment from you"));
await page.getByText("I already know Ghostex").click().catch(async () => {
  await page.locator(".tabs button", { hasText: "Agents" }).click();
});
await open(1);
await page.getByText("I already know Ghostex").click();
await wait(300);
ok("'I already know Ghostex' jumps to 08", (await page.locator(".counter b").textContent()) === "08");

// step 2
await open(2);
await page.locator(".seg button", { hasText: "Terminal" }).click();
await wait(300);
ok("Terminal/Chat switch shows the terminal lens", await page.locator(".caret").first().isVisible());
await page.locator(".feat", { hasText: "Ghostty terminals" }).hover();
ok("feature card highlights a region", (await page.locator(".rg.hl").count()) > 0);

// step 3
await open(3);
await page.locator(".card", { hasText: "Codex CLI" }).first().click();
ok("CTA follows the default agent", await has("Continue with Codex CLI"));
await page.getByRole("button", { name: "Rescan" }).click();
await wait(400);
ok("Rescan clears and replays", await has("Scanning…"));
await wait(3600);
ok("scan finishes", (await has("3 of 6 known agent CLIs available")) && (await has("3 detected · 2 with hooks")));

// step 4
await open(4);
await page.locator(".card", { hasText: "Markdown, HTML prototypes" }).click();
await wait(400);
ok("Docs toggle adds a Docs tab + pane", (await page.locator(".tabs button", { hasText: "Docs" }).count()) === 1 && (await has("Token refresh plan")));
await page.locator(".card", { hasText: "beads-backed board" }).click();
await wait(300);
ok("Kanban shows the bd note", await has("brew install beads"));
await page.getByRole("button", { name: "Recommended · Browser + Code" }).click();
await wait(300);
ok("Recommended resets to Browser + Code", (await page.locator(".tabs button").count()) === 3);
await page.getByRole("button", { name: "New session" }).click();
await wait(300);
ok("New session adds a row", await has("new-session-1"));

// step 5
await open(5);
const hold = page.locator(".hold");
const box = await hold.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await wait(400);
await page.mouse.up();
await wait(200);
ok("short press does not enable Computer Use", (await page.getByRole("switch", { name: "Computer Use" }).getAttribute("aria-checked")) === "false");
await page.mouse.down();
await wait(1400);
await page.mouse.up();
ok("1.2s hold enables Computer Use", (await page.getByRole("switch", { name: "Computer Use" }).getAttribute("aria-checked")) === "true");
ok("settings card waits on the OS", await has("waiting on the OS"));
await page.getByRole("button", { name: "Open system settings" }).click();
await page.locator('.focusring [role="switch"]').first().click();
await wait(300);
ok("granting in System Settings activates it", (await has("active")) && (await page.getByText("granted", { exact: true }).count()) === 2);

// step 6
await open(6);
await wait(3800);
await page.locator("button", { hasText: "needs a decision" }).click();
await page.getByRole("button", { name: "Inline them" }).click();
await wait(1500);
ok("answering the sub-agent resumes it", (await has("inlining fixtures into each spec")) && (await page.locator(".micro", { hasText: /^needs a decision$/ }).count()) === 0);

// step 7
await open(7);
await page.getByRole("switch", { name: "Easy Connect" }).click();
await wait(300);
ok("Easy Connect off disconnects the phone", await has("not connected"));
await page.getByRole("switch", { name: "Easy Connect" }).click();
await page.locator(".qr").click();
await wait(1300);
ok("QR scan pairs the phone", await has("Paired with Pixel 8"));
await page.getByRole("button", { name: "Set up Easy Connect" }).click();
await wait(2300);
ok("Set up walks the checklist", await has("Easy Connect is on · Continue"));

// step 8 + finish
await open(8);
await page.getByRole("button", { name: "Choose folder" }).click();
await page.getByRole("button", { name: "~/Projects/my-app" }).click();
ok("folder picker updates the window", await has("my-app is open"));
await page.getByRole("radio", { name: /Start on tests instead/ }).click();
await page.getByRole("button", { name: "Start a session" }).click();
await wait(1200);
ok("Start a session opens Codex in chat", await has("Codex CLI is ready in ~/Projects/my-app"));
await page.getByRole("button", { name: "⌘D" }).click();
ok("⌘D kbd splits the pane", await has("Split pane"));
await page.getByRole("button", { name: "Open Ghostex" }).click();
await wait(500);
ok("Open Ghostex shows the finish summary", (await has("Ghostex is ready.")) && (await has("~/Projects/my-app")));
await page.getByRole("button", { name: "Restart onboarding" }).click();
await wait(400);
ok("Restart returns to step 01", (await page.locator(".counter b").textContent()) === "01");

console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join("\n")}` : "no console errors");
console.log(fails ? `${fails} FAILED` : "ALL PASS");
await browser.close();
