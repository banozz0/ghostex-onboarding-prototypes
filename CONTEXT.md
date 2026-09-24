# Ghostex onboarding prototypes

The first-run onboarding a new Ghostex user walks through before the app opens, prototyped as interactive click-throughs: C (concept), B (first build) and B4 (final).

## Language

**Onboarding**:
The first-run flow inside the Ghostex app, from welcome to opening the first project.
_Avoid_: Landing page (that is the marketing site), setup wizard, tour

**Panel**:
One screen of the onboarding, reached with Back/Next or the step dots.
_Avoid_: Page, step, slide, screen

**Tab**:
One row on the first panel's list; picking it lights its connected card on the right and switches the mock window to match. One sentence, never a paragraph.
_Avoid_: Feature card, why-card

**Session**:
One running agent (or shell) in Ghostex; always on, so it outlives the app window and can be picked up from desktop or phone.
_Avoid_: Terminal, zmx session (never user-facing)

**Connected agent**:
A detected agent CLI with the Ghostex integration installed, so Ghostex sees its live status and can resume it.
_Avoid_: Hooked agent, integrated agent

**View**:
A built-in workspace surface next to the agents: Browser, Docs, Code, Kanban, Automate.
_Avoid_: Extension (a separate thing installed from the Store), webview, surface
