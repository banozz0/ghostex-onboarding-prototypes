// 04 · Workspace — view toggles drive the window's tabs and panes live.
import { useEffect, useRef, useState } from "react";
import { S, Pill, Tog, Lights, Tabs, AGENTS, press } from "../ui.jsx";
import { ORBIT_ROWS, TRANSCRIPTS } from "../data.js";
import { OrbitPage, DiffPane, UrlBar, Line } from "../panes.jsx";

export const VIEWS = [
  { id: "browser", tab: "Browser", t: "Browser", b: "Embedded Chromium with DevTools and profiles. Preview the app your agent is building." },
  { id: "code", tab: "Code", t: "Code", b: "A VS Code based editor for source, diffs and PR review. Loads on demand and sleeps when unused." },
  { id: "docs", tab: "Docs", t: "Docs", b: "Markdown, HTML prototypes and Excalidraw diagrams, with annotations you can send straight back to the agent." },
  { id: "kanban", tab: "Kanban", t: "Kanban", b: null },
  { id: "automate", tab: "Automate", t: "Automate", b: "Schedule one-time or recurring agent work." },
];
const TAB_ORDER = ["code", "browser", "docs", "kanban", "automate"];
const RECOMMENDED = { browser: true, code: true, docs: false, kanban: false, automate: false };
const tabOf = (id) => VIEWS.find((v) => v.id === id).tab;

function caption(views) {
  const on = TAB_ORDER.filter((v) => views[v]).map(tabOf);
  if (!on.length) return "No extra views on. Your agents get the whole window, and every view stays available in Settings.";
  if (views.browser && views.code) {
    const rest = on.filter((x) => x !== "Browser" && x !== "Code");
    return `Browser and Code shown side by side${rest.length ? `, ${rest.join(" and ")} one tab over` : ""}, matching the views you switched on. Panes split, tab and sleep when you stop using them.`;
  }
  return `${on.join(on.length > 1 ? ", " : "")} ${on.length > 1 ? "shown as tabs" : "shown next to your agents"}, matching the views you switched on. Panes split, tab and sleep when you stop using them.`;
}

function DocsPane() {
  const [sent, setSent] = useState(false);
  return (
    <div className="fade" style={S("flex:1;padding:24px 28px;background:#0C0D0F;overflow:auto")}>
      <div className="micro">notes/token-refresh.md</div>
      <div style={S("font-family:var(--display);font-weight:600;font-size:22px;margin-top:10px")}>Token refresh plan</div>
      <p className="cbody" style={S("margin-top:10px;max-width:56ch")}>
        Two tabs waking at once both call /auth/refresh. The second call <span style={{ background: "rgba(251,191,36,.16)", color: "var(--text)", borderRadius: 3, padding: "0 2px" }}>invalidates the first token</span>, so tab one signs out.
      </p>
      <ol className="cbody" style={S("margin:12px 0 0 18px;display:flex;flex-direction:column;gap:4px")}>
        <li>Single-flight the refresh per session id.</li>
        <li>Regression test that wakes two tabs in one tick.</li>
        <li>Migration note for the token store.</li>
      </ol>
      <div style={S("margin-top:18px;border-left:2px solid var(--wait);padding:2px 0 2px 12px;max-width:52ch")}>
        <div className="micro" style={S("color:var(--wait);margin-bottom:3px")}>
          Annotation from you
        </div>
        <div className="cbody" style={S("font-size:13px")}>
          Link the incident from Tuesday here so reviewers see why.
        </div>
      </div>
      <button type="button" className="pill" style={S("margin-top:14px;height:26px")} disabled={sent} onClick={() => setSent(true)}>
        {sent ? "Sent to Claude Code" : "Send annotation to Claude Code"}
      </button>
    </div>
  );
}

function KanbanPane() {
  const [cards, setCards] = useState([
    { id: "orb-12", t: "Migrate the token store", col: 0, who: "unassigned" },
    { id: "orb-15", t: "Rate-limit /auth/refresh", col: 0, who: "unassigned" },
    { id: "orb-14", t: "Port legacy auth tests", col: 1, who: "codex" },
    { id: "orb-9", t: "Tokens to CSS variables", col: 2, who: "cursor" },
  ]);
  const move = (id) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: (c.col + 1) % 3, who: c.col === 0 ? "claude" : c.who } : c)));
  return (
    <div className="fade" style={S("flex:1;padding:18px;background:#0C0D0F;display:flex;flex-direction:column;gap:12px")}>
      <div className="micro">orbit-api board · beads · click a card to move it along</div>
      <div style={S("display:flex;gap:12px;flex:1")}>
        {["To do", "In progress", "Done"].map((col, ci) => (
          <div key={col} style={S("flex:1;border:1px solid var(--line);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px")}>
            <div className="label">
              {col} · {cards.filter((c) => c.col === ci).length}
            </div>
            {cards
              .filter((c) => c.col === ci)
              .map((c) => (
                <button key={c.id} type="button" className="card hover fade" onClick={() => move(c.id)} style={S("padding:9px 10px;text-align:left")}>
                  <div className="mono" style={S("font-size:10px;color:var(--muted)")}>
                    {c.id}
                  </div>
                  <div className="cbody" style={S("font-size:13px;color:var(--text);line-height:18px;margin-top:2px")}>
                    {c.t}
                  </div>
                  <div className="micro" style={S("margin-top:4px")}>
                    {c.who}
                  </div>
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomatePane() {
  const [jobs, setJobs] = useState([
    { t: "Run the auth suite", w: "Codex CLI · every night at 02:00", on: true },
    { t: "Bump dependencies and open a PR", w: "Claude Code · Mondays at 09:00", on: false },
    { t: "Summarise yesterday's sessions", w: "Claude Code · once, tomorrow 08:30", on: true },
  ]);
  return (
    <div className="fade" style={S("flex:1;padding:22px 24px;background:#0C0D0F")}>
      <div style={S("font-family:var(--display);font-weight:600;font-size:20px")}>Scheduled work</div>
      <div className="cbody" style={S("margin-top:4px;font-size:13px")}>
        Jobs start a normal session at their time. Results land in your sidebar.
      </div>
      <div style={S("margin-top:16px;display:flex;flex-direction:column;gap:8px")}>
        {jobs.map((j, i) => (
          <div key={j.t} className="card hover" style={S("padding:11px 14px;display:flex;align-items:center;gap:12px")} {...press(() => setJobs((js) => js.map((x, k) => (k === i ? { ...x, on: !x.on } : x))), "switch")} aria-checked={j.on}>
            <div style={{ flex: 1 }}>
              <div className="cbody" style={S("color:var(--text);font-size:14px")}>
                {j.t}
              </div>
              <div className="mono" style={S("font-size:11px;color:var(--muted)")}>
                {j.w}
              </div>
            </div>
            <Tog on={j.on} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsPane() {
  return (
    <div className="fade" style={S("flex:1;padding:18px 22px;display:flex;flex-direction:column")}>
      <div style={S("display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--line)")}>
        <span className="mono" style={S("color:var(--text)")}>
          fix-token-refresh-race
        </span>
        <Pill kind="run">running</Pill>
      </div>
      <div className="mono" style={S("padding-top:14px;color:var(--muted);display:flex;flex-direction:column;gap:6px")}>
        {TRANSCRIPTS["fix-token-refresh-race"].slice(0, 15).map((l, i) => (
          <Line key={i} l={l} />
        ))}
      </div>
    </div>
  );
}

export default function Step4({ state, set, next }) {
  const views = state.views;
  const [tab, setTab] = useState("Browser");
  const [fresh, setFresh] = useState([]);
  const [rows, setRows] = useState(ORBIT_ROWS);
  const [review, setReview] = useState(null);
  const [spin, setSpin] = useState(0);
  const prev = useRef(views);

  const tabs = ["Agents", ...TAB_ORDER.filter((v) => views[v]).map(tabOf)];
  useEffect(() => {
    const added = TAB_ORDER.filter((v) => views[v] && !prev.current[v]).map(tabOf);
    prev.current = views;
    if (added.length) {
      setFresh(added);
      setTab(added[0]);
    }
    if (!tabs.includes(tab)) setTab(tabs[1] ?? "Agents");
  }, [views]);

  const toggle = (id) => set((s) => ({ views: { ...s.views, [id]: !s.views[id] } }));
  const isRec = TAB_ORDER.every((v) => views[v] === RECOMMENDED[v]);
  const split = views.browser && views.code && (tab === "Browser" || tab === "Code");
  const agentName = AGENTS[state.agent].name;

  const newSession = () =>
    setRows((r) => {
      if (r.length >= 6) return r;
      const id = `new-session-${r.length - 3}`;
      setTimeout(() => setRows((rr) => rr.map((x) => (x.id === id ? { ...x, state: "running" } : x))), 1400);
      return [...r, { id, agent: AGENTS[state.agent].short, state: "starting", fresh: true }];
    });

  const browser = (w) => (
    <div style={{ width: w, borderRight: w ? "1px solid var(--line)" : "none", display: "flex", flexDirection: "column", flex: w ? "none" : 1 }}>
      <UrlBar onReload={() => setSpin((n) => n + 1)} spin={spin} />
      <OrbitPage key={spin} rows={rows} onNew={newSession} />
    </div>
  );
  const code = <DiffPane agentName={agentName} sent={review} onSend={() => (setReview("sending"), setTimeout(() => setReview("done"), 1500))} />;

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>04</b>
          <span>Workspace</span>
        </div>
        <h1>Choose what lives next to your agents.</h1>
        <p className="sub">These are views, not permissions. Anything you leave off stays available in Settings.</p>

        <div style={S("display:flex;align-items:center;gap:12px;margin-top:14px")}>
          <button type="button" className={`pill ${isRec ? "sel" : ""}`} style={S("height:28px;padding:0 12px;color:var(--text)")} onClick={() => set({ views: RECOMMENDED })}>
            Recommended · Browser + Code
          </button>
          <span className="micro">{isRec ? "You can turn the rest on later." : "Click to go back to the recommended pair."}</span>
        </div>

        <div style={S("display:flex;flex-direction:column;gap:7px;margin-top:10px")}>
          {VIEWS.map((v) => (
            <div
              key={v.id}
              className={`card hover ${views[v.id] ? "raised" : ""}`}
              style={{ padding: "11px 16px", display: "flex", alignItems: v.id === "automate" ? "center" : "flex-start", gap: 14 }}
              aria-checked={views[v.id]}
              {...press(() => toggle(v.id), "switch")}
            >
              <div style={{ flex: 1 }}>
                <div className="ctitle" style={S("font-size:15px;line-height:21px")}>
                  {v.t}
                </div>
                <div className="cbody" style={{ marginTop: v.id === "automate" ? 2 : 3 }}>
                  {v.b ?? (
                    <>
                      Hand tasks to an orchestrator agent on a beads-backed board. Needs the{" "}
                      <span className="mono" style={S("color:var(--text)")}>
                        bd
                      </span>{" "}
                      CLI installed; Ghostex doesn't bundle it.
                    </>
                  )}
                </div>
                {v.id === "kanban" && views.kanban && (
                  <div className="micro fade" style={S("margin-top:6px;color:var(--wait)")}>
                    bd isn't on this machine's PATH yet. The board opens once it is: brew install beads.
                  </div>
                )}
              </div>
              <Tog on={views[v.id]} style={v.id === "automate" ? undefined : S("margin-top:3px")} />
            </div>
          ))}
        </div>

        <div className="actions" style={S("margin-top:12px")}>
          <button type="button" className="cta" onClick={next}>
            Continue
          </button>
        </div>
      </div>

      <div className="right">
        <div className="win" style={S("height:718px")}>
          <div className="bar">
            <Lights />
            <Tabs tabs={tabs} active={split ? "Browser" : tab} onTab={setTab} fresh={fresh} />
            <Pill kind="run" style={S("margin-left:auto")}>
              {agentName}
            </Pill>
          </div>
          <div style={S("display:flex;height:677px")}>
            {split ? (
              <>
                {browser(456)}
                {code}
              </>
            ) : tab === "Browser" ? (
              browser(0)
            ) : tab === "Code" ? (
              code
            ) : tab === "Docs" ? (
              <DocsPane />
            ) : tab === "Kanban" ? (
              <KanbanPane />
            ) : tab === "Automate" ? (
              <AutomatePane />
            ) : (
              <AgentsPane />
            )}
          </div>
        </div>
        <p className="micro" style={S("margin-top:16px")}>
          {caption(views)}
        </p>
      </div>
    </>
  );
}
