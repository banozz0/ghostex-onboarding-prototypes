// PROTOTYPE B2 · headless interaction check. Prints PASS/FAIL per claim, then console errors.
//   node src/b2-focused/check.mjs
import { chromium } from "playwright";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "../../dist/b2-focused.html");

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
const open = async (step, settle = 700) => {
  await page.goto(`file://${file}?step=${step}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(settle);
};
const SCAN_DONE = 3400; // the entry scan runs 8 lines at 360ms
const wait = (ms) => page.waitForTimeout(ms);
const visible = (text) => page.getByText(text).first().isVisible();
const button = (name) => page.getByRole("button", { name }).first();
const sw = (name) => page.getByRole("switch", { name, exact: true });
const cls = async (sel) => (await page.locator(sel).first().getAttribute("class")) ?? "";

/* ─────────────── panel 1 */
await open(1);
await claim("the counter reads 05", async () => (await page.locator(".counter").innerText()).includes("/ 05"));
await claim("ArrowRight goes to panel 02", async () => {
  await page.keyboard.press("ArrowRight");
  await wait(500);
  return visible(/use the agents you already have/i);
});

await open(1);
await claim("panel 1 has three tabs, opens on Agents that work together, and its left side names no agent", async () => {
  const n = await page.getByRole("tab").count();
  const sel = await page.getByRole("tab", { name: /Agents that work together/ }).getAttribute("aria-selected");
  const left = await page.evaluate(() =>
    [...document.querySelectorAll(".scene > *")]
      .filter((e) => e.getBoundingClientRect().right < 760)
      .map((e) => e.innerText)
      .join(" "),
  );
  return n === 3 && sel === "true" && !/Claude|Codex|Cursor/.test(left);
});
await claim("panel 1's right side is the demo alone: Claude and Codex cards, no mock window or tab cards", async () => {
  const junk = await page.locator(".gxwin, .node, .tab-caption").count();
  return junk === 0 && (await page.locator(".dcard").count()) === 2 && (await visible("Lead agent"));
});
await claim("picking Chat + terminal swaps in the terminal and chat view side by side", async () => {
  await page.getByRole("tab", { name: /Chat \+ terminal/ }).click();
  await wait(400);
  return (await page.locator(".dpane").count()) === 2 && (await visible("Chat view")) && (await page.locator(".dcard").count()) === 0;
});
await claim("picking Desktop + mobile shows a computer and a phone joined by a live link", async () => {
  await page.getByRole("tab", { name: /Desktop \+ mobile/ }).click();
  await wait(400);
  return (await page.locator(".dmon").isVisible()) && (await page.locator(".dphone").isVisible()) && (await page.locator(".dlink").count()) === 1;
});

/* ─────────────── panel 2 */
await open(2, SCAN_DONE);
await claim("after the scan the tracker stands on Found, with Connected still to come", async () =>
  (await cls('[data-phase="search"]')).includes("done") &&
  (await cls('[data-phase="found"]')).includes("here") &&
  (await cls('[data-phase="connected"]')).includes("idle"),
);
await claim("picking Codex lights its Found line and logs it as the default", async () => {
  await page.getByRole("radio", { name: /Codex/ }).click();
  await wait(300);
  return (await page.locator(".tl.hot").innerText()).includes("Found Codex") && (await visible("Codex set as your default"));
});
await claim("Connect & continue flips every pill to Connected and lights Connected", async () => {
  await button(/Connect & continue/).click();
  await wait(1500);
  return (await page.locator(".detpill.on").count()) === 3 && (await cls('[data-phase="connected"]')).includes("here") && (await visible("Connected 3 more agents"));
});

await open(2, SCAN_DONE);
await claim("with the integration off the CTA reads Continue and the tracker stops at Found", async () => {
  await sw("Ghostex integration").click();
  await wait(300);
  return (
    (await button(/^Continue/).isVisible()) &&
    (await page.getByRole("button", { name: /Connect & continue/ }).count()) === 0 &&
    (await cls('[data-phase="found"]')).includes("here") &&
    (await cls('[data-phase="connected"]')).includes("idle")
  );
});

await open(2);
await claim("How it works opens the integration explainer", async () => {
  await page.locator(".hiw-btn").first().click();
  await wait(250);
  return page.getByRole("tooltip", { name: /Ghostex integration/ }).isVisible();
});

await open(2);
await claim("Install guide opens a dialog", async () => {
  await page.getByText("Install guide").first().click();
  await wait(300);
  return page.getByRole("dialog").isVisible();
});

await open(2, SCAN_DONE);
await claim("Computer Use sits on panel 2 and cannot turn on without the confirmation", async () => {
  const cu = sw("Computer Use");
  await cu.click();
  await wait(300);
  const asked = await page.getByRole("dialog").isVisible();
  const stillOff = (await cu.getAttribute("aria-checked")) === "false";
  await button("Keep it off").click();
  await wait(250);
  return asked && stillOff && (await cu.getAttribute("aria-checked")) === "false";
});
await claim("Allow turns Computer Use on, shows the permission pill and logs it in the console", async () => {
  await sw("Computer Use").click();
  await wait(250);
  await button("Allow").click();
  await wait(350);
  return (
    (await sw("Computer Use").getAttribute("aria-checked")) === "true" &&
    (await visible("Needs OS permission")) &&
    (await visible("Computer Use: waiting for your permission"))
  );
});

/* ─────────────── panel 3 */
await open(3);
await claim("turning Browser off disables the browser skill toggle", async () => {
  const skill = sw("Give agents the browser skill");
  if (await skill.isDisabled()) return false;
  await sw("Browser").click();
  await wait(300);
  return skill.isDisabled();
});

await open(3);
const wtabs = () => page.locator('[aria-label="Workspace views"] [role="tab"]');
await claim("only views that are on get a titlebar tab; ticking Code adds its tab and shows it", async () => {
  const before = await wtabs().count();
  await sw("Code").click();
  await wait(400);
  const code = page.locator('[aria-label="Workspace views"] [role="tab"]', { hasText: "Code" });
  return before === 3 && (await wtabs().count()) === 4 && (await code.getAttribute("aria-selected")) === "true" && (await page.locator(".wview-code").isVisible());
});
await claim("switching every view off leaves just the Agents tab and the agent's session", async () => {
  for (const v of ["Browser", "Docs", "Code"]) {
    await sw(v).click();
    await wait(150);
  }
  await wait(300);
  return (await wtabs().count()) === 1 && (await page.locator(".wview-agents").isVisible());
});
await claim("Computer Use is no longer on panel 3", async () => (await sw("Computer Use").count()) === 0);

/* ─────────────── panel 4 */
await open(4, 300);
await claim("the pairing demo plays through to the paired phone and offers a replay", async () => {
  await wait(9000);
  return (await page.locator(".mstep.done").count()) === 3 && (await visible("Resume session")) && (await button("Replay").isVisible());
});
await open(4, 300);
await claim("clicking step 2 jumps the demo to Easy Connect and the QR code", async () => {
  await page.locator(".mstep").nth(1).click();
  await wait(2800);
  return (await page.locator(".pc .qr-svg").isVisible()) && (await page.locator(".mstep.on").innerText()).includes("Pair this computer");
});

/* ─────────────── panel 5 and after onboarding */
await open(5);
await claim("panel 5 has no right side", async () => {
  const m = await page.evaluate(() => ({
    divider: document.querySelectorAll(".divider").length,
    furniture: document.querySelectorAll(".wires, .node, .dcard, .dpane, .phone, .term, .wswin, .pc").length,
    cardRight: document.querySelector(".pcard").getBoundingClientRect().right,
  }));
  return m.divider === 0 && m.furniture === 0 && m.cardRight < 1200;
});
await claim("Open Ghostex shows the finish summary, and with nothing saved no popup opens", async () => {
  await button("Open Ghostex").click();
  await wait(1500);
  return (await visible("Restart onboarding")) && (await page.getByRole("dialog").count()) === 0;
});
await claim("Restart returns to panel 01", async () => {
  await button("Restart onboarding").click();
  await wait(700);
  return visible(/welcome to ghostex/i);
});

await open(4);
await claim("Connect my phone saves setup for later, and after onboarding a popup offers it", async () => {
  await button("Connect my phone").click();
  await wait(700);
  await button("Open Ghostex").click();
  await wait(1600);
  return page.getByRole("dialog", { name: "Connect your phone now?" }).isVisible();
});
await claim("Connect now opens Settings → Remote, where the pretend password leads to Paired", async () => {
  await button("Connect now").click();
  await wait(300);
  await sw("Easy Connect").click();
  await wait(300);
  await button("Allow").click();
  await wait(3300);
  return page.locator(".rset-wait.ok").isVisible();
});
await claim("Done closes Settings and the summary says the phone is paired", async () => {
  await button("Done").click();
  await wait(400);
  return (await page.getByRole("dialog").count()) === 0 && (await page.locator(".sum-row", { hasText: "Paired with your phone" }).isVisible());
});

await open(2, SCAN_DONE);
await claim("saving both opens a chooser, and closing one offers the other", async () => {
  await page.locator(".arow3.other").click();
  await wait(300);
  await button("Open after onboarding").click();
  await wait(300);
  await button("Panel 4").click();
  await wait(700);
  await button("Connect my phone").click();
  await wait(700);
  await button("Open Ghostex").click();
  await wait(1600);
  // Scope clicks to the dialog: the finish summary behind it has its own "Install guide" row.
  const chooser = page.getByRole("dialog", { name: "Two things are waiting" });
  if (!(await chooser.isVisible())) return false;
  await chooser.getByRole("button", { name: /Install guide/ }).click();
  await wait(300);
  const guide = page.getByRole("dialog", { name: "Install another agent" });
  if (!(await guide.isVisible())) return false;
  await guide.getByRole("button", { name: "Done" }).click();
  await wait(300);
  return page.getByRole("dialog", { name: "Connect your phone now?" }).isVisible();
});

await browser.close();
console.log(errors.length ? `console errors:\n${errors.join("\n")}` : "no console errors");
console.log(fails || errors.length ? `${fails} FAILED` : "ALL PASS");
process.exit(fails || errors.length ? 1 : 0);
