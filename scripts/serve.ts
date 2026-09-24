#!/usr/bin/env bun
// PROTOTYPE dev server: serves every version, rebuilds on source change, live-reloads the open page.
//   bun scripts/serve.ts        # http://localhost:5178
//   PORT=5190 bun scripts/serve.ts
import { watch } from "node:fs";
import { resolve } from "node:path";

const src = resolve(import.meta.dir, "../src");
const dist = resolve(import.meta.dir, "../dist");
const port = Number(process.env.PORT ?? 5178);
const VERSIONS = ["a-clean-shader", "b-tone-down", "b2-focused", "b3-preview", "b4-extensions"];
const RELOAD = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;
const clients = new Set<ReadableStreamDefaultController>();

async function build(...only: string[]) {
  const p = Bun.spawn(["bun", `${import.meta.dir}/build.ts`, ...only], { stdout: "inherit", stderr: "inherit" });
  if ((await p.exited) === 0) for (const c of clients) c.enqueue("data: reload\n\n");
}

let timer: Timer | undefined;
const pending = new Set<string>();
const queue = (v: string) => {
  pending.add(v);
  clearTimeout(timer);
  timer = setTimeout(() => {
    const only = [...pending];
    pending.clear();
    build(...only);
  }, 150);
};
for (const v of VERSIONS)
  watch(`${src}/${v}`, { recursive: true }, (_e, f) => f && !f.startsWith("mockups") && queue(v));
watch(`${src}/shared`, { recursive: true }, () => VERSIONS.forEach(queue));

await build();
Bun.serve({
  port,
  hostname: "127.0.0.1",
  async fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    if (path === "/__reload")
      return new Response(
        new ReadableStream({ start: (c) => void clients.add(c), cancel: (c) => void clients.delete(c) }),
        { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } },
      );
    const file = Bun.file(`${dist}${path === "/" ? "/index.html" : path}`);
    if (path.includes("..") || !(await file.exists())) return new Response("not found", { status: 404 });
    if (path.endsWith(".html") || path === "/") {
      const html = await file.text();
      const body = html.includes("</body>") ? html.replace("</body>", `${RELOAD}</body>`) : html + RELOAD;
      return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response(file);
  },
});
console.log(`serving http://localhost:${port}/  (B4, the current version; every version at /hub.html)`);
