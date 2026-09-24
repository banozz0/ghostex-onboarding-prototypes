# Ghostex onboarding

The first-run flow a new [Ghostex](https://github.com/maddada/Ghostex) user walks through before the app opens. I designed it and built the clickable prototypes; the onboarding Ghostex ships today was built from them.

**▶ [Try it live](https://banozz0.github.io/ghostex-onboarding-prototypes/)**. Click through it the way a new user would.

![Panel 1: Your coding agents. One serious workspace.](.github/welcome.jpg)

## What it does

Five panels, from welcome to the first project:

1. **Welcome.** What Ghostex is, shown as short live demos instead of paragraphs.
2. **Agents.** Finds the agent CLIs you already have and connects them.
3. **Workspace.** Pick what sits next to your agents: Browser, Docs, Code, Kanban, Automate.
4. **Mobile.** Pair your phone and pick up a session anywhere.
5. **First project.** Open a folder and start with the agent you chose.

![Panel 3: choose what lives next to your agents.](.github/workspace.jpg)

## How it got here

Three versions, from idea to the one that shipped. All three are still clickable on the [hub](https://banozz0.github.io/ghostex-onboarding-prototypes/hub.html).

| Version | The idea |
| :-- | :-- |
| **B4 · Final** | Five panels, one sentence per row, a live preview beside each panel. **What Ghostex ships.** |
| B · First build | Eight panels rebuilt in React from the mockups: animated nebula, node diagrams, everything at once. B4 is this, cut down. |
| C · Concept | The original idea in plain HTML: vertical slides, blue grid glow. |

## Built with

React 19 and Bun. Each version is bundled into one self-contained HTML file: fonts and images are inlined, so it opens with a double-click and needs no server. The animated backgrounds are hand-written WebGL shaders. Both React versions have a Playwright check that clicks through them and asserts what should happen: 58 checks in all.

```sh
bun install
bun run dev                        # http://localhost:5178, rebuilds and reloads on save
bun run build                      # dist/
bunx playwright install chromium-headless-shell   # once, for the checks
node src/b4-extensions/check.mjs   # prints PASS/FAIL per check
```

Source lives in `src/`, one folder per version; the original mockups sit next to the version built from them.
