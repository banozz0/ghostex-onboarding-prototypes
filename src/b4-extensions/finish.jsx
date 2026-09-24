// PROTOTYPE B4 — what "Open Ghostex" lands on: a summary of every choice, and the opened workspace.
import { useEffect, useRef, useState } from "react";
import { AGENTS, AgentIcon, GLogo, Icon, at, RM } from "./ui.jsx";
import { Cta, Eyebrow, Headline, Sub } from "./steps-1-3.jsx";
import { base } from "./steps-4-5.jsx";
import { AfterOnboarding } from "./after.jsx";

const VIEW_NAMES = { browser: "Browser", docs: "Docs", code: "Code", kanban: "Kanban", automate: "Automate" };

const SCRIPT = {
  claude: [
    ["me", "Get familiar with this repo and suggest a first task."],
    ["bot", "Read package.json, src/ and tests/. 42 files, one flaky test in tests/auth."],
    ["bot", "Suggestion: fix the flaky refresh test first; it blocks CI. Want me to start?"],
  ],
  codex: [
    ["me", "Get familiar with this repo and suggest a first task."],
    ["bot", "Scanned the repo: TypeScript, Bun, 42 files, 17 tests."],
    ["bot", "The legacy test harness has 12 call sites. Porting those is a good first task."],
  ],
  cursor: [
    ["me", "Get familiar with this repo and suggest a first task."],
    ["bot", "42 files, 48 design tokens still hard-coded in SCSS."],
    ["bot", "Moving those tokens to CSS variables is a clean first task. Want me to start?"],
  ],
  terminal: [
    ["cmd", "$ ls"],
    ["out", "README.md  package.json  src  tests"],
    ["cmd", "$ git status"],
    ["out", "On branch main · nothing to commit, working tree clean"],
  ],
};

export function Finish({ s, set, go, toast, restart }) {
  const agent = s.startWith;
  const [shown, setShown] = useState(RM ? SCRIPT[agent].length : 1);
  const [extra, setExtra] = useState([]);
  const [draft, setDraft] = useState("");
  const scroller = useRef(null);
  useEffect(() => {
    if (shown >= SCRIPT[agent].length) return;
    const id = setTimeout(() => setShown((n) => n + 1), 1100);
    return () => clearTimeout(id);
  }, [shown]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 1e5, behavior: "smooth" });
  }, [shown, extra]);

  const views = Object.keys(VIEW_NAMES).filter((k) => s.views[k]);
  const viewText = views.length
    ? views.map((v) => (v === "browser" && s.browserUse ? "Browser (browser skill on)" : VIEW_NAMES[v])).join(", ")
    : "None, agents only";
  const mobileText =
    (s.phonePaired ? "Paired with your phone" : s.phoneQueued ? "Phone setup opens next" : "Not now") + (s.notify ? " · agent alerts on" : "");
  const rows = [
    ["Default agent", AGENTS[s.defaultAgent].short, 2],
    ["Ghostex integration", !s.integration ? "Off" : s.connected ? "Every detected agent connected" : "Skipped for now", 2],
    ["Computer Use", s.computerUse === "on" ? "On · your computer will ask for permission" : "Off", 2],
    ["Workspace views", viewText, 3],
    ["Mobile", mobileText, 4],
    ["Project", s.folder, 5],
    ["First session", agent === "terminal" ? "Terminal, no agent" : AGENTS[agent].short, 5],
    ["Session view", { chat: "Chat", terminal: "Terminal", remember: "Remember last" }[s.view], 5],
  ];
  if (s.installQueued) rows.push(["Install guide", "Opens after this screen", 2]);

  const lines = [...SCRIPT[agent].slice(0, shown), ...extra];
  const asTerminal = agent === "terminal" || s.view === "terminal";
  const send = (e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    if (agent === "terminal") {
      setExtra((x) => [...x, ["cmd", "$ " + t], ["out", `zsh: ${t.split(" ")[0]}: this is a prototype shell`]]);
      return;
    }
    setExtra((x) => [...x, ["me", t]]);
    setTimeout(() => setExtra((x) => [...x, ["bot", "On it. I'll keep going even if you close this window."]]), 900);
  };
  const tabs = ["Agents", ...views.map((v) => VIEW_NAMES[v])];

  return (
    <>
      <Eyebrow x={44} y={118}>You're set</Eyebrow>
      <Headline x={44} y={145} w={720} size={52} l1="Ghostex is open." l2={`${base(s.folder)} is ready.`} />
      <Sub x={44} y={264} w={680} size={16}>
        Here is everything you chose. Click a row to change it; all of it stays changeable in Settings.
      </Sub>
      <div className="glass sum" style={at(44, 320, 699, rows.length * 44 + 18)}>
        {rows.map(([k, v, step]) => (
          <button type="button" key={k} className="sum-row" onClick={() => go(step)}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
            <span className="edit">Edit</span>
          </button>
        ))}
      </div>
      <div className="actions" style={{ position: "absolute", left: 44, top: 340 + rows.length * 44 + 30 }}>
        <Cta filled arrow={false} style={{ height: 48, padding: "0 22px" }} onClick={restart}>
          <Icon n="refresh" size={17} />
          Restart onboarding
        </Cta>
        <button type="button" className="ghost" style={{ marginLeft: 22 }} onClick={() => set({ finished: false })}>
          Back to setup
        </button>
      </div>

      <div className="glass-n fwin" style={at(812, 92, 812, 704)}>
        <div className="fwin-bar">
          <span className="lights">
            <i />
            <i />
            <i />
          </span>
          <GLogo size={26} />
          <span className="fwin-t">{base(s.folder)}</span>
          <div className="fwin-tabs">
            {tabs.map((t, i) => (
              <span key={t} className={i === 0 ? "on" : ""}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="fwin-body">
          <aside className="fwin-side">
            <div className="label">Projects</div>
            <div className="fs-item on mono">{base(s.folder)}</div>
            <div className="label" style={{ marginTop: 18 }}>
              Sessions
            </div>
            <div className="fs-sess">
              <span className="dot run" />
              <span className="mono">first-session</span>
              <em>{agent === "terminal" ? "shell" : agent} · live</em>
            </div>
            {s.connected && s.integration && <div className="fs-note">Connected: status and titles come from the agent.</div>}
          </aside>
          <div className="fwin-main">
            <div className="fm-head">
              <AgentIcon id={agent} size={18} />
              <span className="mono">first-session</span>
              <span className="ph-pill run">
                <i />
                running
              </span>
              <span className="mono dim" style={{ marginLeft: "auto" }}>
                {s.folder}
              </span>
            </div>
            <div className={"fm-log" + (asTerminal ? " term" : "")} ref={scroller}>
              {lines.map(([who, t], i) =>
                asTerminal ? (
                  <div key={i} className={"fl mono " + who}>
                    {who === "me" ? <span className="acc">&gt; </span> : null}
                    {t}
                  </div>
                ) : (
                  <div key={i} className={"fb " + who}>
                    {who === "bot" && <span className="fb-who">{AGENTS[agent]?.short}</span>}
                    {t}
                  </div>
                ),
              )}
              {shown < SCRIPT[agent].length && (
                <span className="typing">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
            <form className="fm-input" onSubmit={send}>
              <input
                id="finish-composer"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={agent === "terminal" ? "Type a command…" : `Message ${AGENTS[agent].short}`}
              />
              <span className="kbd">⌃G</span>
            </form>
          </div>
        </div>
      </div>
      <div className="node glass-n ready on" style={at(1008, 814, 420, 70)}>
        <span className="rt">
          <span className="okg on">
            <Icon n="check" size={15} sw={2.6} />
          </span>
          Project ready
        </span>
        <span className="rs">The session keeps running if you close this window.</span>
      </div>
      <AfterOnboarding s={s} set={set} toast={toast} />
    </>
  );
}
