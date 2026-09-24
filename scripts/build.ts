#!/usr/bin/env bun
// PROTOTYPE build: bundles each version's React app into one self-contained HTML file, then lays out the site.
//   bun scripts/build.ts            # every version
//   bun scripts/build.ts b-tone-down
// Output: dist/<version>.html (double-click to open), plus the site GitHub Pages serves:
// dist/index.html (B4, the current version), dist/hub.html (every version), C and the thumbnails.
import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const src = resolve(import.meta.dir, "../src");
const dist = resolve(import.meta.dir, "../dist");
const CURRENT = "b4-extensions";
const VERSIONS: Record<string, string> = {
  "b-tone-down": "Ghostex Tone-Down Onboarding",
  "b4-extensions": "Ghostex Extensions Onboarding",
};
const MIME: Record<string, string> = { ttf: "font/ttf", png: "image/png", svg: "image/svg+xml", jpg: "image/jpeg" };

async function dataUri(path: string) {
  const ext = path.split(".").pop()!;
  const buf = Buffer.from(await Bun.file(path).arrayBuffer());
  return `data:${MIME[ext]};base64,${buf.toString("base64")}`;
}

// Replace every relative url(...) in a stylesheet with a data URI, resolved against that stylesheet's folder.
async function inlineCss(path: string) {
  let css = await Bun.file(path).text();
  for (const m of [...css.matchAll(/url\((['"]?)(\.{1,2}\/[^'")]+)\1\)/g)]) {
    css = css.replace(m[0], `url('${await dataUri(resolve(dirname(path), m[2]))}')`);
  }
  return css;
}

const wanted = process.argv.slice(2);
for (const [dir, title] of Object.entries(VERSIONS)) {
  if (wanted.length && !wanted.includes(dir)) continue;
  const out = await Bun.build({
    entrypoints: [`${src}/${dir}/main.jsx`],
    target: "browser",
    minify: true,
    loader: { ".svg": "text" },
    define: { "process.env.NODE_ENV": '"production"' },
    // Bun 1.4's "dataurl"/"base64" loaders bundle images to "" — inline them ourselves.
    plugins: [
      {
        name: "inline-images",
        setup(b) {
          b.onLoad({ filter: /\.(png|jpg)$/ }, async (args) => ({
            contents: `export default ${JSON.stringify(await dataUri(args.path))};`,
            loader: "js",
          }));
        },
      },
    ],
  });
  if (!out.success) {
    for (const log of out.logs) console.error(log);
    process.exit(1);
  }
  const js = (await out.outputs[0].text()).replace(/<\/script/gi, "<\\/script");
  const css = (await inlineCss(`${src}/shared/fonts.css`)) + "\n" + (await inlineCss(`${src}/${dir}/styles.css`));
  const body = `<title>${title}</title>\n<style>${css}</style>\n<div id="root"></div>\n<script>${js}</script>\n`;
  await Bun.write(
    `${dist}/${dir}.html`,
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n${body}</head></html>\n`,
  );
  const kb = Math.round(Bun.file(`${dist}/${dir}.html`).size / 1024);
  console.log(`built ${dir}.html (${kb} KB)`);
}

await mkdir(dist, { recursive: true });
if (await Bun.file(`${dist}/${CURRENT}.html`).exists()) await cp(`${dist}/${CURRENT}.html`, `${dist}/index.html`);
await cp(`${src}/hub.html`, `${dist}/hub.html`);
await cp(`${src}/c-clean-blue.html`, `${dist}/c-clean-blue.html`);
await cp(`${src}/thumbs`, `${dist}/thumbs`, { recursive: true });
await Bun.write(`${dist}/.nojekyll`, "");
