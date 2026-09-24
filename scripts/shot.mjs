// PROTOTYPE check: headless screenshot of a built version at a given step.
//   node scripts/shot.mjs <version> <step> <out.png> [--eval "js"] [--wait ms]
// Viewport is 1672x941 so the stage renders at scale 1 and compares 1:1 with the mockup PNGs.
// Apps open at ?step=N (1-based). Headless only; never draws on Sven's screen.
import { chromium } from "playwright";
import { resolve } from "node:path";

const [version, step = "1", out = "shot.png", ...rest] = process.argv.slice(2);
const opt = (k) => {
  const i = rest.indexOf(k);
  return i >= 0 ? rest[i + 1] : undefined;
};
const file = resolve(import.meta.dirname, `../dist/${version}.html`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(`file://${file}?step=${step}`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(Number(opt("--wait") ?? 600));
if (opt("--eval")) {
  await page.evaluate(opt("--eval"));
  await page.waitForTimeout(400);
}
await page.screenshot({ path: out });
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no console errors", "->", out);
