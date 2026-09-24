// Finish — the opened workspace on the right, every choice summarised on the left.
import { useEffect, useState } from "react";
import { S, AGENTS, press } from "../ui.jsx";
import { WorkspaceWindow, makeSession, whoName } from "./Step8.jsx";

const VIEW_NAMES = { browser: "Browser", code: "Code", docs: "Docs", kanban: "Kanban", automate: "Automate" };
const CAP_NAMES = { browserUse: "Browser Use", control: "Control Ghostex", notifications: "Notifications" };
const list = (xs) => (xs.length ? xs.join(", ") : "none");

export default function Finish({ state, set, go, restart }) {
  const [sel, setSel] = useState(state.projectSessions.at(-1)?.id ?? null);
  useEffect(() => {
    if (!state.projectSessions.length) {
      const s = makeSession(1, state.startWith, state.defaultView);
      set({ projectSessions: [s] });
      setSel(s.id);
    }
  }, []);

  const rows = [
    ["Default agent", AGENTS[state.agent].name, 3],
    ["Workspace views", list(Object.keys(VIEW_NAMES).filter((k) => state.views[k]).map((k) => VIEW_NAMES[k])), 4],
    ["Capabilities", list(Object.keys(CAP_NAMES).filter((k) => state.caps[k]).map((k) => CAP_NAMES[k])), 5],
    ["Computer Use", state.caps.computerUse ? (state.osGranted ? "on, granted in the OS" : "on, waiting on the OS") : "off", 5],
    ["Integration", state.hooks === "skipped" ? "skipped for now" : "hooks installed for Claude Code and Codex CLI", 6],
    ["Remote", state.easyConnect ? "Easy Connect on" : "Easy Connect off", 7],
    ["Project", state.folder, 8],
    ["First session", `${whoName(state.startWith)} in ${state.startWith === "terminal" ? "Terminal" : state.defaultView === "terminal" ? "Terminal" : "Chat"}`, 8],
  ];

  const newSession = () => {
    const s = makeSession(state.projectSessions.length + 1, state.startWith, state.defaultView);
    set((st) => ({ projectSessions: [...st.projectSessions, s] }));
    setSel(s.id);
  };

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>✓</b>
          <span>Set up</span>
        </div>
        <h1>Ghostex is ready.</h1>
        <p className="sub">Here is what you chose. Every line can be changed from Settings; click one to revisit that step.</p>

        <div className="card raised" style={S("margin-top:24px;padding:8px 8px")}>
          {rows.map(([k, v, step]) => (
            <div key={k} className="row click" style={S("padding:10px 12px;gap:16px")} {...press(() => go(step))}>
              <span className="label" style={S("width:140px;flex:none;font-size:13px")}>
                {k}
              </span>
              <span className="mono" style={S("flex:1;color:var(--text)")}>
                {v}
              </span>
              <span className="mono" style={S("font-size:11px;color:var(--muted)")}>
                {String(step).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        <div className="actions" style={S("margin-top:24px")}>
          <button type="button" className="cta" onClick={restart}>
            Restart onboarding
          </button>
          <button type="button" className="ghost" onClick={() => go(8)}>
            Back to first project
          </button>
        </div>
      </div>

      <div className="right">
        <div className="label" style={S("margin-bottom:12px")}>
          Your workspace, as it opens
        </div>
        <WorkspaceWindow state={state} sessions={state.projectSessions} sel={sel} onSelect={setSel} onStart={newSession} height={660} />
        <p className="cbody" style={S("margin-top:16px")}>
          Close this window and the session keeps running on mini-01. It is still attached when you come back.
        </p>
      </div>
    </>
  );
}
