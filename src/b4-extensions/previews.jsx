// PROTOTYPE B4 — the extension previews panel 2 shows on its right side. Each extension is drawn live, the way
// panel 3 draws a view in its workspace window: pick its tab (or flip its switch) and the preview follows the
// switch, so nothing turns on unseen and no popup interrupts.
import { AgentIcon, Icon } from "./ui.jsx";
import { Pill, useLoop } from "./demos.jsx";

/* ─────────────── panel 2: the Ghostex integration */
const INT_ROWS = [
  ["claude", "claude", "refactor-auth"],
  ["codex", "codex", "port-tests"],
  ["cursor", "cursor-agent", "css-tokens"],
];
// The real files, from provider_hook_paths in server/src/agent_hooks/resolution.rs.
const INT_FILES = [
  ["claude", "~/.claude/settings.json"],
  ["codex", "~/.codex/hooks.json"],
  ["cursor", "~/.cursor/hooks.json"],
];

/** The same three sessions without the integration and with it; the side that matches the switch is lit. */
export function IntegrationPreview({ on }) {
  const f = useLoop(4, 1300);
  const status = {
    claude: f >= 2 ? ["done", "Done"] : ["run", "Working"],
    codex: f === 1 || f === 2 ? ["need", "Needs you"] : ["run", "Working"],
    cursor: ["run", "Working"],
  };
  return (
    <div className="pv-int">
      {[false, true].map((withIt) => (
        <div key={withIt ? "with" : "without"} className={"pv-col" + (withIt === on ? " lit" : "")}>
          <div className="pv-col-h">
            <b>{withIt ? "With the integration" : "Without it"}</b>
            {withIt === on && <span className="pv-now">Your choice</span>}
          </div>
          <div className="pv-slot">
            {!withIt && <div className="pv-alert none">No alerts: you only find out when you look.</div>}
            {withIt && (f === 1 || f === 2) && (
              <div className="pv-alert">
                <AgentIcon id="codex" size={14} />
                <span>
                  <b>Codex needs you</b>
                  Keep the global fixtures, or inline them?
                </span>
              </div>
            )}
          </div>
          {INT_ROWS.map(([id, bin, name]) => (
            <div key={id} className="pv-srow">
              {withIt ? <AgentIcon id={id} size={16} /> : <Icon n="terminal" size={16} />}
              <span className="mono">{withIt ? name : bin}</span>
              {withIt ? <Pill kind={status[id][0]}>{status[id][1]}</Pill> : <Pill kind="idle">No status</Pill>}
            </div>
          ))}
          <p className="pv-cap">{withIt ? "Named after the task, live, and it tells you when an agent is waiting." : "Plain terminals. You check each one yourself."}</p>
        </div>
      ))}
      <div className="pv-files">
        <div className="label">Where the helper goes</div>
        {INT_FILES.map(([id, path]) => (
          <div key={id} className="pv-file">
            <AgentIcon id={id} size={14} />
            {path}
          </div>
        ))}
        <div className="pv-file dim">…and the matching settings file of each other agent you connect.</div>
      </div>
    </div>
  );
}

/* ─────────────── panel 2: Computer Use */
// Where the agent cursor is on each beat, in the app window's coordinates: in, title field, typing, Save, click, out.
const CU_AT = [
  [500, 230],
  [70, 76],
  [70, 76],
  [46, 190],
  [46, 190],
  [500, 230],
];
const DAYS = [
  ["WED", ["Design sync"]],
  ["THU", ["Standup"]],
  ["FRI", []],
];

/** An agent working another app (it fills in and saves an event), then the two things your computer will ask for. */
export function ComputerUsePreview({ on }) {
  const f = useLoop(CU_AT.length, 1100, 2);
  const [x, y] = CU_AT[f];
  return (
    <div className="pv-cu">
      <span className="pv-cu-who">
        <AgentIcon id="claude" size={14} />
        {on ? "Claude Code is using Calendar" : "What Claude Code could do in Calendar"}
      </span>
      <div className="pv-app">
        <div className="pv-app-bar">
          <span className="lights sm">
            <i />
            <i />
            <i />
          </span>
          Calendar
        </div>
        <span className="pv-lbl" style={{ left: 20, top: 48 }}>
          Title
        </span>
        <span className={"pv-field" + (f === 1 || f === 2 ? " focus" : "")} style={{ top: 64 }}>
          {f >= 2 && <span className="pv-typed">Release review</span>}
        </span>
        <span className="pv-lbl" style={{ left: 20, top: 112 }}>
          When
        </span>
        <span className="pv-field" style={{ top: 128 }}>
          Friday · 15:00
        </span>
        <span className={"pv-save" + (f === 4 ? " tap" : "")}>Save</span>
        <div className="pv-cal">
          {DAYS.map(([d, evs]) => (
            <div key={d} className="pv-day">
              <b>{d}</b>
              {evs.map((e) => (
                <span key={e} className="pv-ev">
                  {e}
                </span>
              ))}
              {d === "FRI" && f >= 4 && <span className="pv-ev new">Release review · 15:00</span>}
            </div>
          ))}
        </div>
        <span className={"pv-cursor" + (f === 1 || f === 4 ? " click" : "")} style={{ transform: `translate(${x}px,${y}px)` }} />
      </div>
      <div className="pv-perms">
        <div className="label">Your computer asks once for</div>
        <div className="pv-perm">
          <Icon n="shield" size={16} />
          <b>Accessibility</b>
          <em>so agents can click and type</em>
        </div>
        <div className="pv-perm">
          <Icon n="monitor" size={16} />
          <b>Screen Recording</b>
          <em>so agents can see the screen</em>
        </div>
      </div>
    </div>
  );
}
