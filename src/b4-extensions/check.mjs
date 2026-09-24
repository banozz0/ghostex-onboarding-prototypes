// PROTOTYPE B4 · headless interaction check. Prints PASS/FAIL per claim, then console errors.
//   node src/b4-extensions/check.mjs
import { chromium } from "playwright";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "../../dist/b4-extensions.html");

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
const DEMO_DONE = 9000; // panel 4's pairing demo runs 8.4s
const wait = (ms) => page.waitForTimeout(ms);
const visible = (text) => page.getByText(text).first().isVisible();
const button = (name) => page.getByRole("button", { name }).first();
const sw = (name) => page.getByRole("switch", { name, exact: true });
const on = async (name) => (await sw(name).getAttribute("aria-checked")) === "true";
const cls = async (sel) => (await page.locator(sel).first().getAttribute("class")) ?? "";
const dialogs = () => page.getByRole("dialog").count();
// Popups and demo stages land on their own timers, so wait for the element rather than guess a delay.
const appears = (loc, ms = 6000) => loc.waitFor({ state: "visible", timeout: ms }).then(() => true, () => false);
// Every extension keeps its switch on its own row, the way B2 drew them.
const row = (name) => page.locator(".vrow, .curow, .vsub").filter({ hasText: name }).first();
// Panel 2's right column: one tab per extension, plus the entry scan.
const rtab = (name) => page.locator('[aria-label="Right side"] [role="tab"]', { hasText: name });
const wtab = (name) => page.locator('[aria-label="Workspace views"] [role="tab"]', { hasText: name });
const wtabs = () => page.locator('[aria-label="Workspace views"] [role="tab"]');
const VIEWS = ["Browser", "Docs", "Code", "Kanban", "Automate"];
const states = async () => (await Promise.all(VIEWS.map(on))).map((x) => (x ? "On" : "Off"));

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
await claim("the logo is the shipped Ghostex app icon everywhere, and the drawn G is gone", async () => {
  const m = await page.evaluate(() => ({
    img: [...document.querySelectorAll("img.glogo")].map((i) => i.naturalWidth),
    svg: document.querySelectorAll("svg.glogo").length,
  }));
  return m.img.length > 0 && m.img.every((w) => w === 256) && m.svg === 0;
});
await claim("DarkVeil paints the right column: a live WebGL canvas clipped at the split", async () => {
  const m = await page.evaluate(() => {
    const veil = document.querySelector(".veil");
    const c = veil?.querySelector("canvas");
    return { clip: veil?.style.clipPath ?? "", gl: !!c?.getContext("webgl"), w: c?.width ?? 0, left: veil?.offsetLeft };
  });
  return m.gl && m.w >= 945 && m.left === 727 && /\b32px\)$/.test(m.clip);
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
await claim("panel 2's extensions carry their own switch: the integration starts on, Computer Use off", async () =>
  (await page.getByRole("switch").count()) === 2 && (await on("Ghostex integration")) && !(await on("Computer Use")),
);
// No extension opens a popup, and a row click never moves its switch (Sven, 2026-09-10): only the switch flips.
await claim("clicking either extension row on panel 2, or its switch, opens no dialog, and only the switch flips", async () => {
  for (const name of ["Ghostex integration", "Computer Use"]) {
    const before = await on(name);
    await row(name).click();
    await wait(250);
    if ((await dialogs()) !== 0 || (await on(name)) !== before) return false;
    await sw(name).click();
    await wait(250);
    if ((await dialogs()) !== 0 || (await on(name)) === before) return false;
  }
  return true;
});

// The right column is the preview surface, and Scan brings the console back.
await open(2, SCAN_DONE);
await claim("the integration row switches the right side to its preview, leaves its switch on, and Scan brings the console back", async () => {
  const consoleFirst = await page.locator(".term").isVisible();
  await row("Ghostex integration").click();
  await wait(350);
  const shown =
    (await page.locator(".xpanel .pv-int").isVisible()) &&
    (await page.locator(".term").count()) === 0 &&
    (await rtab("Ghostex integration").getAttribute("aria-selected")) === "true" &&
    (await page.getByText("~/.claude/settings.json").isVisible()) &&
    (await on("Ghostex integration"));
  await rtab("Scan").click();
  await wait(300);
  return consoleFirst && shown && (await page.locator(".term").isVisible()) && (await page.locator(".xpanel").count()) === 0;
});
await claim("the Computer Use row switches the right side to its preview, leaves it off: the agent working another app, and the permissions", async () => {
  await row("Computer Use").click();
  await wait(350);
  return (
    (await page.locator(".xpanel .pv-cu").isVisible()) &&
    (await page.locator(".pv-app").isVisible()) &&
    (await page.getByText("Screen Recording").first().isVisible()) &&
    (await rtab("Computer Use").getAttribute("aria-selected")) === "true" &&
    !(await on("Computer Use"))
  );
});

// NEW (2026-09-10): the row is a preview, and reads its switch's state without changing it, in both states.
const checked = (name) => sw(name).getAttribute("aria-checked");
await open(2, SCAN_DONE);
await claim("on panel 2, clicking the integration row shows its preview and leaves its switch exactly as it was; the same for Computer Use", async () => {
  const lit = () => page.locator(".pv-col.lit .pv-col-h b").innerText();
  const results = [];
  // The integration starts on: the row shows it, with "With the integration" lit, and it stays on.
  let before = await checked("Ghostex integration");
  await row("Ghostex integration").click();
  await wait(300);
  results.push((await checked("Ghostex integration")) === before && before === "true" && (await lit()) === "With the integration");
  // Off by its switch, back to Scan, then the row again: it shows Without, and stays off.
  await sw("Ghostex integration").click();
  await rtab("Scan").click();
  await wait(250);
  before = await checked("Ghostex integration");
  await row("Ghostex integration").click();
  await wait(300);
  results.push(before === "false" && (await checked("Ghostex integration")) === "false" && (await page.locator(".pv-int").isVisible()) && (await lit()) === "Without it");
  // Computer Use starts off: the row shows what it could do, and it stays off.
  before = await checked("Computer Use");
  await row("Computer Use").click();
  await wait(300);
  results.push(before === "false" && (await checked("Computer Use")) === "false" && (await visible("What Claude Code could do in Calendar")) && (await page.locator(".perm-pill").count()) === 0);
  // On by its switch, back to Scan, then the row again: it shows the agent using Calendar, and stays on.
  await sw("Computer Use").click();
  await rtab("Scan").click();
  await wait(250);
  await row("Computer Use").click();
  await wait(300);
  results.push((await checked("Computer Use")) === "true" && (await visible("Claude Code is using Calendar")));
  return results.every(Boolean);
});
await open(2, SCAN_DONE);
await claim("on panel 2, pressing a switch both flips it and shows its preview", async () => {
  await sw("Ghostex integration").click();
  await wait(300);
  const integ =
    (await checked("Ghostex integration")) === "false" &&
    (await rtab("Ghostex integration").getAttribute("aria-selected")) === "true" &&
    (await page.locator(".pv-int").isVisible());
  await rtab("Scan").click();
  await wait(250);
  await sw("Computer Use").click();
  await wait(300);
  const cuOn = (await checked("Computer Use")) === "true" && (await rtab("Computer Use").getAttribute("aria-selected")) === "true" && (await page.locator(".pv-cu").isVisible());
  return integ && cuOn && (await dialogs()) === 0;
});
await open(2, SCAN_DONE);
await claim("on panel 2, Enter or Space on a focused row previews it without flipping, while Space on the switch still flips", async () => {
  await row("Computer Use").focus();
  await page.keyboard.press("Enter");
  await wait(250);
  const enter = (await rtab("Computer Use").getAttribute("aria-selected")) === "true" && (await checked("Computer Use")) === "false";
  await row("Ghostex integration").focus();
  await page.keyboard.press(" ");
  await wait(250);
  const space = (await rtab("Ghostex integration").getAttribute("aria-selected")) === "true" && (await checked("Ghostex integration")) === "true";
  await sw("Computer Use").focus();
  await page.keyboard.press(" ");
  await wait(250);
  return enter && space && (await checked("Computer Use")) === "true" && (await rtab("Computer Use").getAttribute("aria-selected")) === "true";
});

// NEW: the preview follows the switch, live.
await open(2, SCAN_DONE);
await claim("the integration preview's lit side follows the switch, With → Without", async () => {
  await rtab("Ghostex integration").click();
  await wait(300);
  const lit = () => page.locator(".pv-col.lit .pv-col-h b").innerText();
  const before = await lit();
  await sw("Ghostex integration").click();
  await wait(300);
  return before === "With the integration" && (await lit()) === "Without it" && !(await on("Ghostex integration"));
});
// B2's claim, driven straight from the switch again.
await claim("with the integration off the CTA reads Continue and the tracker stops at Found", async () =>
  (await button(/^Continue/).isVisible()) &&
  (await page.getByRole("button", { name: /Connect & continue/ }).count()) === 0 &&
  (await cls('[data-phase="found"]')).includes("here") &&
  (await cls('[data-phase="connected"]')).includes("idle"),
);

// NEW: Computer Use turns on straight from its switch, with no confirmation in the way.
await open(2, SCAN_DONE);
await claim("Computer Use turns on straight from its switch: pill, preview and console line, no dialog", async () => {
  await sw("Computer Use").click();
  await wait(350);
  const straight = (await dialogs()) === 0 && (await on("Computer Use")) && (await visible("Needs OS permission")) && (await page.locator(".pv-cu").isVisible());
  await rtab("Scan").click();
  await wait(300);
  return straight && (await visible("Computer Use: waiting for your permission"));
});

await open(2);
await claim("Install guide still opens its dialog", async () => {
  await page.getByText("Install guide").first().click();
  await wait(300);
  return page.getByRole("dialog", { name: "Install another agent" }).isVisible();
});

/* ─────────────── panel 3 */
await open(3);
await claim("panel 3's views carry their own switch; Browser and Docs start On, the rest Off", async () => (await states()).join() === "On,On,Off,Off,Off");
// A view row previews its view and never moves a switch; the switches still flip, and nothing opens a dialog.
await claim("clicking a view row or switch on panel 3 opens no dialog; each row click previews its view and moves no switch", async () => {
  for (const v of VIEWS) {
    const before = (await states()).join();
    await row(v).click();
    await wait(150);
    if ((await dialogs()) !== 0 || (await states()).join() !== before) return false;
    if (!(await page.locator(`.wview-${v.toLowerCase()}`).isVisible())) return false;
  }
  // The nested browser-skill row previews Browser (Automate was last) and leaves the skill switch alone.
  const skill = await sw("Give agents the browser skill").getAttribute("aria-checked");
  await row("Give agents the browser skill").click();
  await wait(150);
  if ((await sw("Give agents the browser skill").getAttribute("aria-checked")) !== skill || !(await page.locator(".wview-browser").isVisible())) return false;
  for (const v of VIEWS) {
    await sw(v).click();
    await wait(120);
    if ((await dialogs()) !== 0) return false;
  }
  return (await states()).join() === "Off,Off,On,On,On";
});

// NEW (2026-09-10): previewing a view that is off shows it under a dashed tab, without switching it on.
await open(3);
await claim("on panel 3, clicking a view row that is off previews it in the workspace window with a ghost tab, and the view stays off", async () => {
  const before = await on("Kanban");
  await row("Kanban").click();
  await wait(350);
  return (
    !before &&
    !(await on("Kanban")) &&
    (await page.locator(".wview-kanban").isVisible()) &&
    (await wtab("Kanban").getAttribute("aria-selected")) === "true" &&
    (await wtab("Kanban").getAttribute("class")).includes("ghost") &&
    /adds this tab/i.test(await page.locator(".wtab-adds").innerText()) &&
    (await wtabs().count()) === 4
  );
});
await claim("on panel 3, clicking a view row that is on previews it and leaves it on", async () => {
  await row("Docs").click();
  await wait(350);
  return (
    (await on("Docs")) &&
    (await page.locator(".wview-docs").isVisible()) &&
    (await wtab("Docs").getAttribute("aria-selected")) === "true" &&
    !(await wtab("Docs").getAttribute("class")).includes("ghost") &&
    (await page.locator(".wtab.ghost, .wtab-adds").count()) === 0 &&
    (await wtabs().count()) === 3
  );
});
await open(3);
await claim("switching the previewed view on turns its ghost tab real in place, and off returns it to a ghost", async () => {
  await row("Code").click();
  await wait(350);
  await page.evaluate(() => (document.querySelector(".wview").dataset.mark = "kept"));
  await sw("Code").click();
  await wait(350);
  const real =
    (await on("Code")) &&
    (await wtab("Code").getAttribute("class")).includes(" on") &&
    (await page.locator(".wtab.ghost, .wtab-adds").count()) === 0 &&
    (await page.locator('.wview-code[data-mark="kept"]').isVisible());
  await sw("Code").click();
  await wait(350);
  return real && !(await on("Code")) && (await wtab("Code").getAttribute("class")).includes("ghost") && (await page.locator('.wview-code[data-mark="kept"]').isVisible());
});

await open(3);
await claim("turning Browser off disables the browser skill switch", async () => {
  const skill = sw("Give agents the browser skill");
  if (await skill.isDisabled()) return false;
  await sw("Browser").click();
  await wait(300);
  return skill.isDisabled();
});

// NEW: the skill is only visible in the Browser tab, so flipping it goes there.
await open(3);
await claim("the browser-skill switch shows the window the Browser tab, and the agent cursor follows it", async () => {
  await wtab("Docs").click();
  await wait(300);
  if ((await wtab("Docs").getAttribute("aria-selected")) !== "true") return false;
  await sw("Give agents the browser skill").click();
  await wait(400);
  const wentBack = (await wtab("Browser").getAttribute("aria-selected")) === "true" && (await page.locator(".wview .agent-cursor").count()) === 0;
  const off = await page.locator(".wv-foot.skill", { hasText: "The browser skill is off" }).isVisible();
  await sw("Give agents the browser skill").click();
  await wait(400);
  return wentBack && off && (await page.locator(".wview .agent-cursor").count()) === 1 && (await page.locator(".wtab-badge").isVisible());
});

await open(3);
await claim("only views that are on get a titlebar tab; ticking Code adds its tab and shows it", async () => {
  const before = await wtabs().count();
  await sw("Code").click();
  await wait(400);
  return before === 3 && (await wtabs().count()) === 4 && (await wtab("Code").getAttribute("aria-selected")) === "true" && (await page.locator(".wview-code").isVisible());
});
await claim("switching every view off leaves just the Agents tab and the agent's session", async () => {
  for (const v of ["Browser", "Docs", "Code"]) {
    await sw(v).click();
    await wait(150);
  }
  await wait(300);
  return (await wtabs().count()) === 1 && (await page.locator(".wview-agents").isVisible());
});
await claim("Recommended adds Browser + Docs and keeps the views already on", async () => {
  await sw("Code").click();
  await wait(150);
  await sw("Kanban").click();
  await wait(150);
  await page.locator(".rec-chip").click();
  await wait(300);
  return (await states()).join() === "On,On,On,On,Off" && (await wtabs().count()) === 5 && (await cls(".rec-chip")).includes("on");
});
await claim("with every view on, Recommended leaves them all on", async () => {
  await sw("Automate").click();
  await wait(150);
  await page.locator(".rec-chip").click();
  await wait(300);
  return (await states()).every((x) => x === "On") && (await wtabs().count()) === 6;
});
await claim("Computer Use is no longer on panel 3", async () => (await page.getByText("Computer Use").count()) === 0);

/* ─────────────── panel 4 */
await open(4, 300);
await claim("the pairing demo plays through to the paired phone and offers a replay", async () => {
  await wait(DEMO_DONE);
  return (await page.locator(".mstep.done").count()) === 3 && (await visible("Resume session")) && (await button("Replay").isVisible());
});
// NEW (2026-09-10): "Ping me" is previewed on this computer and on the phone, not in a popup.
const PING = "Ping me when an agent needs me";
await claim("with notifications on, the alert shows on the computer AND on the phone; with them off, neither, and both carry a quiet line", async () => {
  const both =
    (await page.locator(".pc-notif", { hasText: "Codex needs you" }).isVisible()) &&
    (await page.locator(".phone .ph-banner", { hasText: "Codex needs you" }).isVisible()) &&
    (await page.locator(".pc-quiet, .ph-quiet").count()) === 0;
  await sw(PING).click();
  await wait(400);
  return (
    both &&
    (await dialogs()) === 0 &&
    (await page.locator(".pc-notif, .ph-banner").count()) === 0 &&
    /notifications off/i.test(await page.locator(".pc .pc-quiet").innerText()) &&
    /notifications off/i.test(await page.locator(".phone .ph-quiet").innerText())
  );
});
// Panel 4's row opens no popup either, and clicking it leaves the setting alone: only the switch brings the alert back.
await claim("clicking the Ping me row on panel 4 opens no dialog and leaves it off; its switch brings the alert back on both", async () => {
  await row(PING).click();
  await wait(400);
  const stayed =
    (await dialogs()) === 0 &&
    (await sw(PING).getAttribute("aria-checked")) === "false" &&
    (await page.locator(".pc-notif, .ph-banner").count()) === 0 &&
    (await page.locator(".pc-quiet").isVisible()) &&
    (await page.locator(".ph-quiet").isVisible());
  await sw(PING).click();
  await wait(400);
  return stayed && (await on(PING)) && (await page.locator(".pc-notif").isVisible()) && (await page.locator(".ph-banner").isVisible());
});
await open(4, 300);
await claim("on panel 4, clicking the Ping me row shows the notification preview and leaves the switch as it was", async () => {
  const playing = await page.locator(".pd").isVisible();
  const before = await sw(PING).getAttribute("aria-checked");
  await row(PING).click();
  await wait(600);
  return (
    playing &&
    before === "true" &&
    (await sw(PING).getAttribute("aria-checked")) === before &&
    (await page.locator(".pd").count()) === 0 &&
    (await page.locator(".pc-notif").isVisible()) &&
    (await page.locator(".ph-banner").isVisible())
  );
});
await claim("the notify row's copy names this computer as well as the phone, on and off", async () => {
  const copy = () => row(PING).locator(".ss").innerText();
  const onCopy = await copy();
  await sw(PING).click();
  await wait(300);
  const offCopy = await copy();
  const names = (t) => /this computer/i.test(t) && /phone/i.test(t);
  return names(onCopy) && names(offCopy) && onCopy !== offCopy && !/the phone wakes you/i.test(onCopy + offCopy);
});

await open(4, 300);
await claim("flipping Ping me mid-demo runs the pairing out to the paired phone, so the change is visible", async () => {
  const playing = await page.locator(".pd").isVisible();
  await sw("Ping me when an agent needs me").click();
  await wait(600);
  return playing && (await page.locator(".pd").count()) === 0 && (await page.locator(".ph-quiet").isVisible());
});
await open(4, 300);
await claim("clicking step 2 jumps the demo to Easy Connect and the QR code", async () => {
  await page.locator(".mstep").nth(1).click();
  await wait(2800);
  return (await page.locator(".pc .qr-svg").isVisible()) && (await page.locator(".mstep.on").innerText()).includes("Pair this computer");
});

/* ─────────────── panel 5 and after onboarding */
await open(5);
await claim("panel 5 has no right side, and the DarkVeil is clipped away", async () => {
  const m = await page.evaluate(() => ({
    divider: document.querySelectorAll(".divider").length,
    furniture: document.querySelectorAll(".wires, .node, .dcard, .dpane, .phone, .term, .wswin, .pc, .xpanel").length,
    cardRight: document.querySelector(".pcard").getBoundingClientRect().right,
    veil: document.querySelector(".veil").style.clipPath,
  }));
  return m.divider === 0 && m.furniture === 0 && m.cardRight < 1200 && /\b945px\)$/.test(m.veil);
});
await claim("Open Ghostex shows the finish summary, and with nothing saved no popup opens", async () => {
  await button("Open Ghostex").click();
  await wait(1500);
  return (await visible("Restart onboarding")) && (await dialogs()) === 0;
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
  return appears(page.getByRole("dialog", { name: "Connect your phone now?" }));
});
await claim("Connect now opens Settings → Remote, where the pretend password leads to Paired", async () => {
  await button("Connect now").click();
  await wait(300);
  await sw("Easy Connect").click();
  await wait(300);
  await button("Allow").click();
  return appears(page.locator(".rset-wait.ok"));
});
await claim("Done closes Settings and the summary says the phone is paired", async () => {
  await button("Done").click();
  await wait(400);
  return (await dialogs()) === 0 && (await page.locator(".sum-row", { hasText: "Paired with your phone" }).isVisible());
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
  // Scope clicks to the dialog: the finish summary behind it has its own "Install guide" row.
  const chooser = page.getByRole("dialog", { name: "Two things are waiting" });
  if (!(await appears(chooser))) return false;
  await chooser.getByRole("button", { name: /Install guide/ }).click();
  const guide = page.getByRole("dialog", { name: "Install another agent" });
  if (!(await appears(guide))) return false;
  await guide.getByRole("button", { name: "Done" }).click();
  return appears(page.getByRole("dialog", { name: "Connect your phone now?" }));
});

await browser.close();
console.log(errors.length ? `console errors:\n${errors.join("\n")}` : "no console errors");
console.log(fails || errors.length ? `${fails} FAILED` : "ALL PASS");
process.exit(fails || errors.length ? 1 : 0);
