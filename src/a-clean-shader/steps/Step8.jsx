// 08 · First project — folder picker, start-with / default-view choices, a window that starts real sessions.
import { useEffect, useRef, useState } from "react";
import { S, Pill, Lights, Tabs, AGENTS, press, useNow, since, fmtDur, useReveal, IS_MAC, Arrow } from "../ui.jsx";

export const FOLDERS = ["~/code/orbit-api", "~/code/orbit-web", "~/Projects/my-app"];
const START = [
  { id: "claude", t: "Claude Code", b: "Opens the first session." },
  { id: "codex", t: "Codex", b: "Start on tests instead." },
  { id: "terminal", t: "Terminal", b: "No agent yet." },
];
const VIEW = [
  { id: "chat", t: "Chat", b: "Readable agent conversation." },
  { id: "terminal", t: "Terminal", b: "The raw CLI, nothing between." },
  { id: "last", t: "Remember last", b: "Whichever you used." },
];
const VIEW_TABS = [
  ["code", "Code"],
  ["browser", "Browser"],
  ["docs", "Docs"],
  ["kanban", "Kanban"],
  ["automate", "Automate"],
];
export const base = (f) => f.split("/").pop();
export const whoName = (w) => (w === "terminal" ? "Terminal" : AGENTS[w].name);

export function makeSession(n, startWith, view) {
  return { id: `session-${n}`, who: startWith, view: startWith === "terminal" ? "terminal" : view === "terminal" ? "terminal" : "chat", at: Date.now() };
}

function SessionBody({ s, folder }) {
  const agent = s.who === "terminal" ? null : AGENTS[s.who];
  const lines =
    s.view === "chat"
      ? [`${agent.name} is ready in ${folder}.`, "Tell it what to work on. Ghostex keeps it running if you close this window."]
      : s.who === "terminal"
        ? [`Last login on mini-01`, `${folder} %`]
        : [`${agent.short === "cursor" ? "cursor-agent" : agent.short} · ${folder}`, `${agent.name} ready. Type a task, or /help.`];
  const n = useReveal(lines.length, 420, s.id);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState([]);
  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSent((x) => [...x, draft.trim()]);
    setDraft("");
  };
  if (s.view === "chat") {
    return (
      <div className="fade" style={S("flex:1;display:flex;flex-direction:column;padding:18px 22px;min-width:0")}>
        <div style={S("display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--line)")}>
          <span className="mono" style={S("color:var(--text)")}>
            {s.id}
          </span>
          <Pill kind="run">running</Pill>
          <span className="micro" style={S("margin-left:auto")}>
            Chat view
          </span>
        </div>
        <div style={S("flex:1;display:flex;flex-direction:column;gap:12px;padding-top:16px")}>
          {n > 0 && (
            <div className="fade">
              <div className="micro" style={S("margin-bottom:5px")}>
                {agent.name}
              </div>
              <div className="cbody" style={S("color:var(--text);font-size:14px")}>
                {lines[0]}
              </div>
              {n > 1 && (
                <div className="cbody fade" style={S("font-size:13px;margin-top:4px")}>
                  {lines[1]}
                </div>
              )}
            </div>
          )}
          {sent.map((t, i) => (
            <div key={i} className="fade" style={S("align-self:flex-end;max-width:80%;background:var(--surface-2);border:1px solid var(--line);border-radius:12px;padding:9px 12px")}>
              <div className="cbody" style={S("color:var(--text);font-size:13px")}>
                {t}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="composer" style={S("border:1px solid var(--line);border-radius:8px;padding:11px 13px;display:flex;align-items:center;gap:10px")}>
          <input className="mono" style={{ flex: 1, color: "var(--text)" }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${agent.name}`} />
          <span className="kbd">⌃G</span>
        </form>
      </div>
    );
  }
  return (
    <div className="fade mono" style={S("flex:1;background:#0C0D0F;padding:18px 22px;color:var(--muted);display:flex;flex-direction:column;gap:6px")}>
      {lines.slice(0, n).map((l, i) => (
        <div key={i} className="fade" style={i === 1 && s.who !== "terminal" ? { color: "var(--text)" } : undefined}>
          {l}
        </div>
      ))}
      {sent.map((t, i) => (
        <div key={i} style={{ color: "var(--text)" }}>
          {s.who === "terminal" ? "% " : "> "}
          {t}
        </div>
      ))}
      <form onSubmit={submit} style={S("display:flex;align-items:center;gap:6px;color:var(--text)")}>
        <span>{s.who === "terminal" ? "%" : ">"}</span>
        <input className="mono" style={{ flex: 1, color: "var(--text)" }} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus aria-label="Terminal input" />
      </form>
    </div>
  );
}

export function WorkspaceWindow({ state, sessions, sel, onSelect, onStart, height = 602 }) {
  const now = useNow();
  const [tab, setTab] = useState("Agents");
  const name = base(state.folder);
  const tabs = ["Agents", ...VIEW_TABS.filter(([k]) => state.views[k]).map(([, t]) => t)];
  const cur = sessions.find((s) => s.id === sel);
  return (
    <div className="win" style={{ height }}>
      <div className="bar">
        <Lights />
        <Tabs tabs={tabs} active={tab} onTab={setTab} />
        <span className="mono" style={S("margin-left:auto;color:var(--muted);font-size:12px")}>
          {name}
        </span>
      </div>
      <div style={{ display: "flex", height: height - 41 }}>
        <div style={S("width:230px;border-right:1px solid var(--line);padding:14px 12px;background:#0F1113;flex:none")}>
          <div className="label" style={S("padding:0 6px 10px")}>
            Projects
          </div>
          <div key={name} className="mono fade" style={S("padding:6px 8px;border-radius:8px;background:var(--surface-2);color:var(--text)")}>
            {name}
          </div>
          <div className="label" style={S("padding:16px 6px 10px")}>
            Sessions
          </div>
          {sessions.length ? (
            <div style={S("display:flex;flex-direction:column;gap:2px")}>
              {sessions.map((s) => (
                <button key={s.id} type="button" className={`row click fade ${sel === s.id ? "on" : ""}`} onClick={() => onSelect(s.id)} style={{ display: "block", padding: "7px 8px", textAlign: "left" }}>
                  <div style={S("display:flex;align-items:center;gap:8px")}>
                    <i className="dot" style={{ background: "var(--run)" }} />
                    <span className="mono" style={{ color: sel === s.id ? "var(--text)" : "var(--muted)" }}>
                      {s.id}
                    </span>
                  </div>
                  <div className="micro" style={S("margin-left:14px;margin-top:2px")}>
                    {s.who === "terminal" ? "zsh" : AGENTS[s.who].short} · running {fmtDur(since(now, 0, s.at))}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="cbody" style={S("padding:0 8px;font-size:13px")}>
              Nothing here yet.
            </div>
          )}
          <div style={S("margin-top:14px;padding:0 8px")}>
            <button type="button" className="pill" style={S("height:30px;color:var(--text)")} onClick={onStart}>
              New session
            </button>
          </div>
        </div>
        {tab === "Agents" ? (
          cur ? (
            <SessionBody key={cur.id} s={cur} folder={state.folder} />
          ) : (
            <div style={S("flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 60px;text-align:center")}>
              <span className="gx-logo" style={S("width:52px;height:52px;border-radius:12px")} />
              <div key={name} className="fade" style={S("font-family:var(--display);font-weight:600;font-size:22px;margin-top:16px")}>
                {name} is open
              </div>
              <div className="cbody" style={S("margin-top:8px;max-width:44ch")}>
                No agent is running yet. Start one and it will appear in the sidebar and keep running whether or not this window is.
              </div>
              <div style={S("margin-top:20px")}>
                <button type="button" className="cta" style={S("height:38px;padding:0 18px;font-size:14px")} onClick={onStart}>
                  Start a session
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="fade" style={S("flex:1;display:flex;align-items:center;justify-content:center;background:#0C0D0F")}>
            <div style={S("text-align:center")}>
              <div style={S("font-family:var(--display);font-weight:600;font-size:18px")}>{tab}</div>
              <div className="cbody" style={S("margin-top:6px;font-size:13px;max-width:40ch")}>
                {tab === "Browser" ? "Opens localhost as soon as an agent starts a dev server." : tab === "Code" ? `${state.folder} in the editor. It loads on demand and sleeps when unused.` : `${tab} for ${name}, one tab over from your agents.`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const KEYS = [
  ["t", "⌘T", "new session"],
  ["d", "⌘D", "split the pane"],
  ["g", "⌃G", "prompt editor"],
  ["f1", "F1", "every command"],
];

export default function Step8({ state, set, finish }) {
  const [picker, setPicker] = useState(false);
  const [sel, setSel] = useState(state.projectSessions.at(-1)?.id ?? null);
  const [flash, setFlash] = useState(null);
  const [split, setSplit] = useState(false);
  const flashT = useRef(0);
  const sessions = state.projectSessions;

  const start = () => {
    const s = makeSession(sessions.length + 1, state.startWith, state.defaultView);
    set((st) => ({ projectSessions: [...st.projectSessions, s] }));
    setSel(s.id);
  };
  const hit = (k) => {
    setFlash(k);
    clearTimeout(flashT.current);
    flashT.current = setTimeout(() => setFlash(null), 350);
    if (k === "t") start();
    if (k === "d") setSplit((x) => !x);
  };
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const mod = IS_MAC ? e.metaKey : e.ctrlKey;
      let key = null;
      if (mod && k === "t") key = "t";
      else if (mod && k === "d") key = "d";
      else if (e.ctrlKey && k === "g") key = "g";
      else if (e.key === "F1") key = "f1";
      if (key) {
        e.preventDefault();
        hit(key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>08</b>
          <span>First project</span>
        </div>
        <h1>Open your first project.</h1>
        <p className="sub">One folder and one default view. Everything else you can change from inside the app.</p>

        <div className="card raised" style={S("margin-top:24px;padding:18px 20px")}>
          <div className="label" style={S("margin-bottom:10px")}>
            Project folder
          </div>
          <div style={S("position:relative")}>
            <div style={S("display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:var(--surface-2)")}>
              <span key={state.folder} className="mono fade" style={S("flex:1;color:var(--text);font-size:14px")}>
                {state.folder}
              </span>
              <button type="button" className="cbody linkbtn" style={S("font-size:13px")} onClick={() => setPicker((p) => !p)}>
                Choose folder
              </button>
            </div>
            {picker && (
              <div className="pop" style={S("right:0;top:calc(100% + 6px);width:300px")}>
                <div className="micro" style={S("padding:4px 10px 6px")}>
                  Recent folders on mini-01
                </div>
                {FOLDERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="mono"
                    style={{ fontSize: 13, color: f === state.folder ? "var(--accent)" : "var(--text)" }}
                    onClick={() => {
                      set({ folder: f, projectSessions: [] });
                      setSel(null);
                      setPicker(false);
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="label" style={S("margin:18px 0 9px")}>
            Start with
          </div>
          <div role="radiogroup" style={S("display:flex;gap:10px")}>
            {START.map((o) => (
              <div key={o.id} className={`card hover opt ${state.startWith === o.id ? "sel" : ""}`} aria-checked={state.startWith === o.id} style={{ flex: 1, padding: "12px 14px", background: state.startWith === o.id ? "var(--surface-2)" : undefined }} {...press(() => set({ startWith: o.id }), "radio")}>
                <div className="ctitle" style={S("font-size:15px")}>
                  {o.t}
                </div>
                <div className="cbody" style={S("margin-top:2px")}>
                  {o.b}
                </div>
              </div>
            ))}
          </div>
          <p className="micro" style={S("margin-top:9px")}>
            This project only. Your default agent from step 03 doesn't change.
          </p>

          <div className="label" style={S("margin:18px 0 9px")}>
            Default session view
          </div>
          <div role="radiogroup" style={S("display:flex;gap:10px")}>
            {VIEW.map((o) => (
              <div key={o.id} className={`card hover opt ${state.defaultView === o.id ? "sel" : ""}`} aria-checked={state.defaultView === o.id} style={{ flex: 1, padding: "12px 14px", background: state.defaultView === o.id ? "var(--surface-2)" : undefined }} {...press(() => set({ defaultView: o.id }), "radio")}>
                <div className="ctitle" style={S("font-size:15px")}>
                  {o.t}
                </div>
                <div className="cbody" style={S("margin-top:2px")}>
                  {o.b}
                </div>
              </div>
            ))}
          </div>
          <p className="micro" style={S("margin-top:9px")}>
            You can switch view per session at any time.
          </p>
        </div>

        <div className="actions" style={S("margin-top:24px")}>
          <button type="button" className="cta" onClick={finish}>
            Open Ghostex
            <Arrow />
          </button>
          <button type="button" className="ghost" onClick={finish}>
            Advanced settings later
          </button>
        </div>
      </div>

      <div className="right">
        <div style={{ position: "relative" }}>
          <WorkspaceWindow state={state} sessions={sessions} sel={sel} onSelect={setSel} onStart={start} />
          {split && (
            <div className="fade" style={S("position:absolute;right:1px;top:41px;bottom:1px;width:44%;border-left:1px solid var(--line);background:#0C0D0F;border-radius:0 0 20px 0;display:flex;align-items:center;justify-content:center")}>
              <span className="cbody" style={S("font-size:13px")}>
                Split pane · ⌘D again to close
              </span>
            </div>
          )}
        </div>

        <div className="card" style={S("margin-top:18px;padding:16px 20px")}>
          <div className="label" style={S("margin-bottom:12px")}>
            Worth learning on day one
          </div>
          <div style={S("display:flex;gap:26px")}>
            {KEYS.map(([k, label, what]) => (
              <div key={k} style={S("display:flex;align-items:center;gap:9px")}>
                <button type="button" className={`kbd ${flash === k ? "flash" : ""}`} onClick={() => hit(k)}>
                  {label}
                </button>
                <span className="cbody" style={S("font-size:13px")}>
                  {what}
                </span>
              </div>
            ))}
          </div>
          <p className="micro" style={S("margin-top:12px")}>
            Cmd maps to Ctrl on Windows and Linux.
          </p>
        </div>
      </div>
    </>
  );
}
