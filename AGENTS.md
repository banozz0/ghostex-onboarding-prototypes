# ghostex-onboarding-prototypes

**Public repo** (github.com/banozz0/ghostex-onboarding-prototypes). Everything here is visible to anyone; it is also a portfolio piece, so README.md is written for a recruiter.

Interactive prototypes of the Ghostex first-run onboarding. Glossary: `CONTEXT.md` (say *onboarding*, *panel*, *view*; never "landing page", that is the marketing site).

## Layout
- `src/<version>/` — one React app per version (A, B, B2, B3, B4); `mockups/` beside a version are the design sources it was built from. `src/c-clean-blue.html` is hand-written, copied as is.
- `src/hub.html` — the page listing every version; `src/thumbs/` its images.
- `scripts/build.ts` — bundles each version into one self-contained `dist/<version>.html` and lays out the site: `dist/index.html` is B4 (`CURRENT`), `dist/hub.html` the hub.
- `.github/*.jpg` — README screenshots (`node scripts/shot.mjs b4-extensions <panel> out.png`).

## Commands
- `bun install`, then `bun run build`, `bun run dev` (localhost:5178, live reload).
- `node src/<version>/check.mjs` — headless Playwright claims against `dist/`; must stay ALL PASS. Needs `bunx playwright install chromium-headless-shell` once.
- `bun run deploy` — builds and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves. `main` holds only source; never commit `dist/`.

## Adding a version
Add it to `VERSIONS` in `scripts/build.ts` and `serve.ts`, a card and thumb in `src/hub.html`, a row in README.md. Move `CURRENT` only when Sven says the new one is the main prototype.
