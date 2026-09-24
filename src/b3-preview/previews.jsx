// PROTOTYPE B3 — extension previews. A tile shows only its state; clicking it opens a popup that plays the thing
// live, says plainly what switching it on does, and holds the switch. Nothing turns on without being seen first.
import { AgentIcon, Icon, Modal, Toggle } from "./ui.jsx";
import { Pill, useLoop } from "./demos.jsx";
import { META, TAB_ORDER, ViewPane } from "./workspace.jsx";

/** The right end of a tile: its state, and the way into its preview. */
export function TileState({ on, extra }) {
  return (
    <span className="xstate">
      {extra}
      <span className={"xpill" + (on ? " on" : "")}>{on ? "On" : "Off"}</span>
      <span className="xgo">
        Preview
        <Icon n="chevR" size={14} />
      </span>
    </span>
  );
}

/** Tile props: a row that opens its preview, by mouse or keyboard. */
export const opens = (fn) => ({
  role: "button",
  tabIndex: 0,
  "aria-haspopup": "dialog",
  onClick: fn,
  onKeyDown: (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    fn();
  },
});

/** The popup: the live preview on the left; on the right, what switching it on does, then its switches. */
export function PreviewModal({ title, lead, terms, switches, onClose, children }) {
  return (
    <Modal title={title} onClose={onClose} width={1000}>
      <div className="pv">
        <div className="pv-stage">{children}</div>
        <div className="pv-side">
          <p className="pv-lead">{lead}</p>
          <div className="pv-terms">
            {terms.map(([k, v]) => (
              <div key={k} className="pv-row">
                <em>{k}</em>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <div className="pv-switches">
            {switches.map((w) => (
              <div key={w.label} className={"pv-sw" + (w.on ? " on" : "") + (w.disabled ? " off" : "")}>
                <span>
                  <b>{w.label}</b>
                  <em>{w.note}</em>
                </span>
                <Toggle on={w.on} disabled={w.disabled} onClick={w.onChange} label={w.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="cta filled sm" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}

/* ─────────────── panel 3: a view */
/** The view as it will look, in a mini window whose titlebar shows the tab that switching it on adds. */
export function ViewPreview({ id, views, drive, toast }) {
  const tabs = ["agents", ...TAB_ORDER.filter((t) => views[t] || t === id)];
  return (
    <div className="pv-win">
      <div className="pv-bar">
        <span className="lights sm">
          <i />
          <i />
          <i />
        </span>
        {tabs.map((t) => (
          <span key={t} className={"wtab" + (t === id ? (views[id] ? " on" : " ghost") : "")}>
            <Icon n={META[t][0]} size={13} />
            {META[t][1]}
          </span>
        ))}
        {!views[id] && <span className="pv-adds">← adds this tab</span>}
      </div>
      <div className={"wview wview-" + id + " pv-body"}>
        <ViewPane id={id} drive={drive} toast={toast} />
      </div>
    </div>
  );
}

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
