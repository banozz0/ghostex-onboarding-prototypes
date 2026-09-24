// 01 · Welcome — live agents list, a working session window (tabs, sessions, composer).
import { useEffect, useRef, useState } from "react";
import { S, Pill, Mark, AGENTS, Lights, Tabs, press, useNow, since, fmtDur, useReveal } from "../ui.jsx";
import { SESSIONS, TRANSCRIPTS, ORBIT_ROWS, replyFor } from "../data.js";
import { Line, OrbitPage, DiffPane, UrlBar } from "../panes.jsx";

const ROWS = [
  { agent: "claude", sid: "fix-token-refresh-race" },
  { agent: "codex", sid: "port-legacy-tests" },
  { agent: "cursor", sid: "tokens-to-css-vars" },
];
const DOT = { run: "var(--run)", wait: "var(--wait)", done: "var(--done)" };

export default function Step1({ next, go }) {
  const now = useNow();
  const [tab, setTab] = useState("Agents");
  const [project, setProject] = useState("orbit-api");
  const [sid, setSid] = useState("fix-token-refresh-race");
  const [status, setStatus] = useState(() => Object.fromEntries(SESSIONS.map((s) => [s.id, s.status])));
  const [lines, setLines] = useState(TRANSCRIPTS);
  const [draft, setDraft] = useState("");
  const [review, setReview] = useState(null);
  const [orbitRows, setOrbitRows] = useState(ORBIT_ROWS);
  const [spin, setSpin] = useState(0);
  const seen = useRef(new Set());
  const scroller = useRef(null);
  const input = useRef(null);

  const session = SESSIONS.find((s) => s.id === sid);
  const list = lines[sid];
  const shown = useReveal(list.length, 85, sid, seen.current.has(sid));
  useEffect(() => {
    seen.current.add(sid);
  }, [sid]);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, sid]);

  const claudeSecs = since(now, 492);
  const pillFor = (id) => {
    const st = status[id];
    const s = SESSIONS.find((x) => x.id === id);
    if (st === "run") return <Pill kind="run">running {fmtDur(since(now, s.base))}</Pill>;
    if (st === "wait") return <Pill kind="wait">needs input</Pill>;
    return <Pill kind="done">done 2m ago</Pill>;
  };

  const [touched, setTouched] = useState(false);
  const pick = (id) => {
    setTouched(true);
    setSid(id);
    setProject("orbit-api");
    setTab("Agents");
  };

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const wasWaiting = status[sid] === "wait";
    setDraft("");
    setLines((L) => ({ ...L, [sid]: [...L[sid], { k: "gap", h: 8 }, { k: "prompt", t: text }] }));
    if (wasWaiting || status[sid] === "done") setStatus((s) => ({ ...s, [sid]: "run" }));
    setTimeout(() => setLines((L) => ({ ...L, [sid]: [...L[sid], ...replyFor(session, text, wasWaiting)] })), 650);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setTab("Agents");
        setTimeout(() => input.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sessionsForProject = project === "orbit-api" ? SESSIONS : [];

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>01</b>
          <span>Welcome</span>
        </div>
        <h1>
          Your coding agents.
          <br />
          One serious workspace.
        </h1>
        <p className="sub" style={S("margin-top:14px")}>
          A native desktop app for Claude Code, Codex CLI and any other agent CLI. Run them side by side and review the work in one window.
        </p>

        <div className="card raised" style={S("margin-top:18px;padding:15px 18px")}>
          <div className="label" style={S("margin-bottom:12px")}>
            Agents on mini-01
          </div>
          <div style={S("display:flex;flex-direction:column;gap:11px")}>
            {ROWS.map((r) => (
              <div key={r.sid} className={`agent pick ${touched && sid === r.sid && tab === "Agents" ? "on" : ""}`} {...press(() => pick(r.sid))}>
                <Mark agent={r.agent} />
                <div style={{ flex: 1 }}>
                  <div className="nm">{AGENTS[r.agent].name}</div>
                  <div className="ss">{r.sid}</div>
                </div>
                {pillFor(r.sid)}
              </div>
            ))}
          </div>
          <p className="micro" style={S("margin-top:11px")}>
            20+ more agent CLIs supported, including Gemini CLI, Qwen Code and OpenCode.
          </p>
        </div>

        <div className="card" style={S("margin-top:11px;padding:14px 18px")}>
          <div className="label" style={S("margin-bottom:10px")}>
            Everything around them
          </div>
          <div style={S("display:flex;flex-direction:column;gap:9px")}>
            <div>
              <div className="nm" style={S("font-size:14px;line-height:20px")}>
                Sessions that survive the app
              </div>
              <div className="cbody">Backed by zmx. Quit Ghostex, restart, reattach where you stopped.</div>
            </div>
            <div>
              <div className="nm" style={S("font-size:14px;line-height:20px")}>
                Browser and editor in the window
              </div>
              <div className="cbody">Review the actual work, not just the transcript.</div>
            </div>
            <div>
              <div className="nm" style={S("font-size:14px;line-height:20px")}>
                Desktop and mobile
              </div>
              <div className="cbody">Stay attached from another computer or from your phone.</div>
            </div>
          </div>
        </div>

        <div className="actions" style={S("margin-top:16px")}>
          <button type="button" className="cta" onClick={next}>
            Set up your workspace
          </button>
          <button type="button" className="ghost" onClick={() => go(8)}>
            I already know Ghostex
          </button>
        </div>
        <p className="micro" style={S("margin-top:10px")}>
          Free forever. No tracking.
        </p>
      </div>

      <div className="right">
        <div className="win" style={S("height:726px")}>
          <div className="bar">
            <Lights />
            <Tabs tabs={["Agents", "Code", "Browser"]} active={tab} onTab={setTab} />
            <div className="mono" style={S("margin-left:auto;color:var(--muted);font-size:12px")}>
              mini-01
            </div>
          </div>
          <div style={S("display:flex;height:685px")}>
            {tab === "Agents" && (
              <>
                <div style={S("width:238px;border-right:1px solid var(--line);padding:14px 12px;background:#0F1113;flex:none")}>
                  <div className="label" style={S("padding:0 6px 10px")}>
                    Projects
                  </div>
                  {["orbit-api", "orbit-web"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`mono row click ${project === p ? "on" : ""}`}
                      style={{ width: "100%", padding: "6px 8px", color: project === p ? "var(--text)" : "var(--muted)" }}
                      onClick={() => setProject(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <div className="label" style={S("padding:16px 6px 10px")}>
                    Sessions
                  </div>
                  <div style={S("display:flex;flex-direction:column;gap:2px")}>
                    {sessionsForProject.map((s) => (
                      <button key={s.id} type="button" className={`row click ${sid === s.id ? "on" : ""}`} style={S("width:100%;padding:7px 8px")} onClick={() => setSid(s.id)}>
                        <i className="dot" style={{ background: DOT[status[s.id]] }} />
                        <span className="mono" style={{ color: sid === s.id ? "var(--text)" : "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.id}
                        </span>
                      </button>
                    ))}
                    {!sessionsForProject.length && (
                      <div className="cbody fade" style={S("padding:0 8px;font-size:13px")}>
                        Nothing running in orbit-web.
                      </div>
                    )}
                  </div>
                </div>
                <div style={S("flex:1;padding:18px 22px;display:flex;flex-direction:column;min-width:0")}>
                  {project === "orbit-api" ? (
                    <>
                      <div style={S("display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--line)")}>
                        <span className="mono" style={S("color:var(--text)")}>
                          {sid}
                        </span>
                        <Pill kind={status[sid]}>{status[sid] === "run" ? "running" : status[sid] === "wait" ? "needs input" : "done"}</Pill>
                        <span className="mono" style={S("margin-left:auto;color:var(--muted);font-size:12px")}>
                          ~/code/orbit-api
                        </span>
                      </div>
                      <div ref={scroller} className="mono noscroll" style={S("padding-top:14px;color:var(--muted);display:flex;flex-direction:column;gap:6px;overflow-y:auto;flex:1;min-height:0;padding-bottom:12px")}>
                        {list.slice(0, shown).map((l, i) => (
                          <Line key={i} l={l} elapsed={sid === "fix-token-refresh-race" ? fmtDur(claudeSecs) : null} />
                        ))}
                      </div>
                      <form onSubmit={send} className="composer" style={S("border:1px solid var(--line);border-radius:8px;padding:11px 13px;color:var(--muted);display:flex;align-items:center;gap:10px;flex:none")}>
                        <input ref={input} className="mono" style={{ flex: 1, color: "var(--text)" }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${AGENTS[session.agent].name}`} />
                        <button type="button" className="kbd" style={S("margin-left:auto")} onClick={() => input.current?.focus()}>
                          ⌃G
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="fade" style={S("margin:auto;text-align:center")}>
                      <div style={S("font-family:var(--display);font-weight:600;font-size:18px")}>orbit-web</div>
                      <div className="cbody" style={S("margin-top:6px;font-size:13px")}>
                        No sessions here yet. Start one and it keeps running on mini-01.
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {tab === "Code" && <DiffPane sent={review} onSend={() => (setReview("sending"), setTimeout(() => setReview("done"), 1500))} />}
            {tab === "Browser" && (
              <div style={S("flex:1;display:flex;flex-direction:column")}>
                <UrlBar onReload={() => setSpin((n) => n + 1)} spin={spin} />
                <OrbitPage
                  key={spin}
                  rows={orbitRows}
                  onNew={() => setOrbitRows((r) => (r.length >= 7 ? r : [...r, { id: `new-session-${r.length - 3}`, agent: "claude", state: "running", fresh: true }]))}
                />
              </div>
            )}
          </div>
        </div>
        <div style={S("display:flex;align-items:center;gap:12px;margin-top:18px")}>
          <span style={S("width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none")} />
          <span className="cbody">Quit Ghostex here and this session keeps running. It is still attached when you come back.</span>
        </div>
      </div>
    </>
  );
}
