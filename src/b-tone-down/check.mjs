// PROTOTYPE B · headless interaction check. Prints PASS/FAIL per claim, then console errors.
//   node src/b-tone-down/check.mjs
import { chromium } from "playwright";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "../../dist/b-tone-down.html");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let fails = 0;
const claim = async (name, fn) => {
  let ok = false;
  try {
    ok = await fn();
  } catch (e) {
    name += ` (${e.message.split("\n")[0]})`;
  }
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};
const open = async (step) => {
  await page.goto(`file://${file}?step=${step}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
};
const visible = (text) => page.getByText(text).first().isVisible();

await open(1);
await claim("ArrowRight goes to step 02", async () => {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  return visible(/why ghostex\?/i);
});

await open(3);
await claim("radio sets the default and the CTA follows", async () => {
  // Rows only accept a pick once the entry scan has detected that agent.
  const codex = page.getByRole("radio").filter({ hasText: "Codex CLI" });
  await codex.getByText("Detected").waitFor({ timeout: 8000 });
  await codex.click();
  await page.waitForTimeout(250);
  return visible("Continue with Codex CLI");
});
await claim("Install guide opens a dialog", async () => {
  await page.getByText("Install guide").first().click();
  await page.waitForTimeout(300);
  return page.getByRole("dialog").isVisible();
});

await open(4);
await claim("Code view toggles on", async () => {
  const row = page.getByRole("switch").filter({ hasText: "VS Code-style editor" });
  const before = await row.getAttribute("aria-checked");
  await row.click();
  await page.waitForTimeout(250);
  return before === "false" && (await row.getAttribute("aria-checked")) === "true";
});

await open(5);
await claim("Computer Use asks for confirmation", async () => {
  const row = page.locator(".glass").filter({ hasText: "Allow supported agents to interact" }).first();
  await row.getByRole("switch").click();
  await page.waitForTimeout(300);
  return (await page.getByRole("dialog").isVisible()) && visible(/hands over the whole machine/);
});

await open(6);
await claim("agent card excludes on click", async () => {
  const card = page.getByRole("checkbox").filter({ hasText: "Codex CLI" });
  await card.click();
  await page.waitForTimeout(250);
  return (await card.getAttribute("aria-checked")) === "false";
});

await open(7);
await claim("left step marks done", async () => {
  const step = page.getByRole("checkbox").filter({ hasText: "Install Ghostex Mobile" });
  await step.click();
  await page.waitForTimeout(250);
  return (await step.getAttribute("aria-checked")) === "true";
});
await claim("phone 'View all agents' responds", async () => {
  const before = await page.locator("body").innerText();
  await page.getByText("View all agents").first().click();
  await page.waitForTimeout(400);
  return (await page.locator("body").innerText()) !== before;
});

await open(8);
await claim("Open Ghostex shows the finish summary", async () => {
  await page.getByText("Open Ghostex").first().click();
  await page.waitForTimeout(900);
  return visible("Restart onboarding");
});
await claim("Restart returns to step 01", async () => {
  await page.getByText("Restart onboarding").first().click();
  await page.waitForTimeout(700);
  return visible(/welcome to ghostex/i);
});

await browser.close();
console.log(errors.length ? `console errors:\n${errors.join("\n")}` : "no console errors");
console.log(fails || errors.length ? `${fails} FAILED` : "ALL PASS");
process.exit(fails || errors.length ? 1 : 0);
