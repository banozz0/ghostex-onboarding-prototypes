// PROTOTYPE B3 · headless interaction check. Prints PASS/FAIL per claim, then console errors.
//   node src/b3-preview/check.mjs
import { chromium } from "playwright";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "../../dist/b3-preview.html");

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
// Extension tiles carry no switch: a tile opens its preview popup, and the switch lives there.
const tile = (name) => page.locator(".xtile").filter({ has: page.locator(".nm", { hasText: new RegExp(`^${name}$`) }) });
const state = async (name) => (await tile(name).locator(".xpill").innerText()).trim();
const preview = async (name) => {
  await tile(name).click();
  await wait(350);
};
const done = async () => {
  await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
  await wait(300);
};
const flipView = async (name) => {
  await preview(name);
  await sw(`${name} tab`).click();
  await wait(150);
  await done();
};
const VIEWS = ["Browser", "Docs", "Code", "Kanban", "Automate"];
const states = () => Promise.all(VIEWS.map(state));

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
await claim("panel 2's extension tiles carry no switch: each shows On or Off and opens a preview", async () =>
  (await page.getByRole("switch").count()) === 0 && (await state("Ghostex integration")) === "On" && (await state("Computer Use")) === "Off",
);
await claim("the integration popup sets the sessions without and with it side by side, names the files it writes, and holds the switch", async () => {
  await preview("Ghostex integration");
  const d = page.getByRole("dialog", { name: "Ghostex integration" });
  return (
    (await d.locator(".pv-col").count()) === 2 &&
    (await d.getByText("~/.claude/settings.json").isVisible()) &&
    (await sw("Ghostex integration").getAttribute("aria-checked")) === "true"
  );
});
await claim("flipping the integration switch moves the lit side from With to Without", async () => {
  const lit = () => page.locator(".pv-col.lit .pv-col-h b").innerText();
  const before = await lit();
  await sw("Ghostex integration").click();
  await wait(300);
  return before === "With the integration" && (await lit()) === "Without it";
});
await claim("with the integration switched off the tile reads Off, the CTA reads Continue and the tracker stops at Found", async () => {
  await done();
  return (
    (await state("Ghostex integration")) === "Off" &&
    (await button(/^Continue/).isVisible()) &&
    (await page.getByRole("button", { name: /Connect & continue/ }).count()) === 0 &&
    (await cls('[data-phase="found"]')).includes("here") &&
    (await cls('[data-phase="connected"]')).includes("idle")
  );
});

await open(2);
await claim("Install guide opens a dialog", async () => {
  await page.getByText("Install guide").first().click();
  await wait(300);
  return page.getByRole("dialog").isVisible();
});

await open(2, SCAN_DONE);
await claim("Computer Use's popup plays an agent working another app and lists what the computer asks for, switch off", async () => {
  await preview("Computer Use");
  const d = page.getByRole("dialog", { name: "Computer Use" });
  return (
    (await d.locator(".pv-app").isVisible()) &&
    (await d.getByText("Screen Recording").first().isVisible()) &&
    (await sw("Allow Computer Use").getAttribute("aria-checked")) === "false"
  );
});
await claim("switching Computer Use on in its popup shows the permission pill and logs it in the console", async () => {
  await sw("Allow Computer Use").click();
  await wait(300);
  await done();
  return (await state("Computer Use")) === "On" && (await visible("Needs OS permission")) && (await visible("Computer Use: waiting for your permission"));
});

/* ─────────────── panel 3 */
await open(3);
await claim("panel 3's view tiles carry no switch; Browser and Docs start On, the rest Off", async () =>
  (await page.getByRole("switch").count()) === 0 && (await states()).join() === "On,On,Off,Off,Off",
);
await claim("a view's popup previews it before it is on: Kanban shows its board and the tab it would add", async () => {
  await preview("Kanban");
  const d = page.getByRole("dialog", { name: "Kanban" });
  return (
    (await d.locator(".pv-body.wview-kanban").isVisible()) &&
    (await d.locator(".wtab.ghost").isVisible()) &&
    (await sw("Kanban tab").getAttribute("aria-checked")) === "false"
  );
});

await open(3);
await claim("in Browser's popup the skill switch drives the preview's agent cursor, and Browser off disables it", async () => {
  await preview("Browser");
  const cursor = () => page.locator(".pv-body .agent-cursor").count();
  const skill = sw("Give agents the browser skill");
  const had = await cursor();
  await skill.click();
  await wait(250);
  const gone = (await cursor()) === 0;
  await sw("Browser tab").click();
  await wait(250);
  return had === 1 && gone && (await skill.isDisabled());
});

await open(3);
const wtabs = () => page.locator('[aria-label="Workspace views"] [role="tab"]');
await claim("only views that are on get a titlebar tab; switching Code on in its popup adds its tab and shows it", async () => {
  const before = await wtabs().count();
  await flipView("Code");
  const code = page.locator('[aria-label="Workspace views"] [role="tab"]', { hasText: "Code" });
  return (
    before === 3 &&
    (await wtabs().count()) === 4 &&
    (await code.getAttribute("aria-selected")) === "true" &&
    (await page.locator(".wview-code").isVisible()) &&
    (await state("Code")) === "On"
  );
});
await claim("switching every view off leaves just the Agents tab and the agent's session", async () => {
  for (const v of ["Browser", "Docs", "Code"]) await flipView(v);
  await wait(300);
  return (await wtabs().count()) === 1 && (await page.locator(".wview-agents").isVisible());
});
await claim("Recommended adds Browser + Docs and keeps the views already on", async () => {
  await flipView("Code");
  await flipView("Kanban");
  await page.locator(".rec-chip").click();
  await wait(300);
  return (await states()).join() === "On,On,On,On,Off" && (await wtabs().count()) === 5 && (await cls(".rec-chip")).includes("on");
});
await claim("with every view on, Recommended leaves them all on", async () => {
  await flipView("Automate");
  await page.locator(".rec-chip").click();
  await wait(300);
  return (await states()).every((x) => x === "On") && (await wtabs().count()) === 6;
});
await claim("Computer Use is no longer on panel 3", async () => (await page.getByText("Computer Use").count()) === 0);

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
await claim("panel 5 has no right side, and the DarkVeil is clipped away", async () => {
  const m = await page.evaluate(() => ({
    divider: document.querySelectorAll(".divider").length,
    furniture: document.querySelectorAll(".wires, .node, .dcard, .dpane, .phone, .term, .wswin, .pc").length,
    cardRight: document.querySelector(".pcard").getBoundingClientRect().right,
    veil: document.querySelector(".veil").style.clipPath,
  }));
  return m.divider === 0 && m.furniture === 0 && m.cardRight < 1200 && /\b945px\)$/.test(m.veil);
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
