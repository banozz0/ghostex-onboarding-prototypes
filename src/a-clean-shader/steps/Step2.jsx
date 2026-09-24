// 02 · Why Ghostex — feature cards light up the part of the window that proves them.
import { useEffect, useState } from "react";
import { S, Pill, Lights, Tabs, useNow, since, fmtDur } from "../ui.jsx";
import { SESSIONS, TRANSCRIPTS } from "../data.js";
import { UrlBar } from "../panes.jsx";

const FEATS = [
  { t: "Ghostty terminals", b: "Lower RAM use and better battery life than an Electron shell, and agent CLI sessions that stay stable under long runs.", r: "status" },
  { t: "Run several agents at once", b: "Claude on the refactor, Codex on the tests, Cursor on the tokens. Grouped by project instead of scattered terminal tabs.", r: "sessions" },
  { t: "Review the work, not the chat", b: "An embedded Chromium browser and a VS Code editor sit beside the session. Inspect the UI, read the diff, send comments back.", r: "browser" },
  { t: "Sessions survive the app", b: "Backed by zmx. Quit Ghostex, move to another machine, reattach the same running session.", r: "survive" },
  { t: "Let agents work together", b: "Claude Code launches a Codex sub-agent, sends it a prompt and reads the output back. The sub-agent lands in your sidebar as an ordinary session.", r: "subagent" },
  { t: "Use the interface that fits", b: "Terminal for raw power, Chat for readability, Browser and the editor for inspecting the result. Same session behind all of them.", r: "seg" },
];

const SUB = {
  "fix-token-refresh-race": (now) => `claude · running ${fmtDur(since(now, 492))}`,
  "port-legacy-tests": () => "codex · launched by Claude Code",
  "write-migration-notes": () => "codex · reattached after restart",
  "tokens-to-css-vars": () => "cursor · done 2m ago",
};
const DOT = { run: "var(--run)", wait: "var(--wait)", done: "var(--done)" };

export default function Step2({ next }) {
  const now = useNow();
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [tour, setTour] = useState(null);
  const [view, setView] = useState("Chat");
  const [sid, setSid] = useState("fix-token-refresh-race");
  const [tok, setTok] = useState(null);
  const [spin, setSpin] = useState(0);
  const [mem, setMem] = useState(412);

  useEffect(() => {
    const id = setInterval(() => setMem((m) => Math.min(421, Math.max(404, m + Math.round((Math.random() - 0.5) * 6)))), 2200);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (tour === null) return;
    const id = setTimeout(() => setTour((t) => (t >= FEATS.length - 1 ? null : t + 1)), 2000);
    return () => clearTimeout(id);
  }, [tour]);

  const active = hover ?? (tour !== null ? tour : pinned);
  const hl = active !== null ? FEATS[active].r : null;
  const rg = (key) => `rg ${hl === key ? "hl" : ""}`;
  const up = 3 * 3600 + 24 * 60 + since(now, 0);
  const s = SESSIONS.find((x) => x.id === sid);
  const t = TRANSCRIPTS[sid];

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>02</b>
          <span>Why Ghostex</span>
        </div>
        <h1>
          Keep your agents.
          <br />
          Change where they work.
        </h1>
        <p className="sub">Ghostex is not a coding agent. It's the workspace you run your agents in, so more of them can work at once and you can actually keep up.</p>

        <div style={S("display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px")} onMouseLeave={() => setHover(null)}>
          {FEATS.map((f, i) => (
            <div
              key={f.t}
              className={`card raised feat ${active === i ? "on" : ""}`}
              style={S("padding:16px 18px")}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => {
                setTour(null);
                setPinned((p) => (p === i ? null : i));
                if (f.r === "seg") setView((v) => (v === "Chat" ? "Terminal" : "Chat"));
              }}
            >
              <div className="ctitle">{f.t}</div>
              <div className="cbody" style={S("margin-top:6px")}>
                {f.b}
              </div>
            </div>
          ))}
        </div>

        <div className="actions" style={S("margin-top:20px")}>
          <button type="button" className="cta" onClick={next}>
            Set up my agents
          </button>
          <button type="button" className="ghost" onClick={() => setTour((t) => (t === null ? 0 : null))}>
            {tour === null ? "See how it works" : "Stop the tour"}
          </button>
        </div>
      </div>

      <div className="right">
        <div className="label" style={S("margin-bottom:12px")}>
          One window, four agents, everything in reach
        </div>
        <div className="win" style={S("height:636px")}>
          <div className="bar">
            <Lights />
            <Tabs tabs={["Agents", "Code", "Browser"]} active="Agents" onTab={(x) => setPinned(x === "Agents" ? 1 : 2)} />
            <div className="mono" style={S("margin-left:auto;color:var(--muted);font-size:12px")}>
              mini-01 · orbit-api
            </div>
          </div>
          <div style={S("display:flex;height:546px")}>
            <div className={rg("sessions")} style={S("width:228px;border-right:1px solid var(--line);padding:13px 10px;background:#0F1113;flex:none")}>
              <div className="label" style={S("padding:0 6px 9px")}>
                Sessions
              </div>
              <div style={S("display:flex;flex-direction:column;gap:3px")}>
                {SESSIONS.map((x) => {
                  const child = x.id === "port-legacy-tests";
                  const on = sid === x.id;
                  const key = child ? "subagent" : x.id === "write-migration-notes" ? "survive" : "";
                  return (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setSid(x.id)}
                      className={`row click ${on ? "on" : ""} ${key ? rg(key) : ""}`}
                      style={{
                        display: "block",
                        width: child ? "auto" : "100%",
                        padding: child ? "8px 9px 8px 20px" : "8px 9px",
                        borderLeft: child ? "1px solid var(--line)" : undefined,
                        marginLeft: child ? 9 : 0,
                        textAlign: "left",
                      }}
                    >
                      <div style={S("display:flex;align-items:center;gap:8px")}>
                        <i className="dot" style={{ background: DOT[x.status] }} />
                        <span className="mono" style={{ fontSize: 12, color: on || child ? "var(--text)" : "var(--muted)" }}>
                          {x.id}
                        </span>
                      </div>
                      <div className="micro" style={S("margin-left:14px;margin-top:2px")}>
                        {SUB[x.id](now)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className={`micro ${rg("survive")}`} style={S("padding:14px 7px 0;line-height:15px;border-radius:6px")}>
                Ghostex quit and restarted while these kept running.
              </div>
            </div>

            <div className={rg("seg")} style={S("width:330px;border-right:1px solid var(--line);display:flex;flex-direction:column;flex:none")}>
              <div style={S("padding:11px 14px;border-bottom:1px solid var(--line)")}>
                <div style={S("display:flex;align-items:center;gap:10px")}>
                  <span className="mono" style={S("flex:1;font-size:12px;color:var(--text)")}>
                    {sid}
                  </span>
                  <span className="seg">
                    {["Terminal", "Chat"].map((v) => (
                      <button key={v} type="button" className={view === v ? "on" : ""} onClick={() => setView(v)}>
                        {v}
                      </button>
                    ))}
                  </span>
                </div>
                <div style={S("display:flex;align-items:center;gap:10px;margin-top:9px")}>
                  <Pill kind={s.status}>{s.status === "run" ? "running" : s.status === "wait" ? "waiting" : "done"}</Pill>
                  <span className="mono" style={S("margin-left:auto;font-size:12px;color:var(--muted)")}>
                    ~/code/orbit-api
                  </span>
                </div>
              </div>
              {view === "Chat" ? (
                <div key={sid + view} className="fade" style={S("padding:13px;display:flex;flex-direction:column;gap:11px")}>
                  <div style={S("align-self:flex-end;max-width:90%;background:var(--surface-2);border:1px solid var(--line);border-radius:12px;padding:9px 12px")}>
                    <div className="cbody" style={S("color:var(--text);font-size:13px;line-height:19px")}>
                      {sid === "fix-token-refresh-race" ? "The refresh token races when two tabs wake at once." : t[0].t.charAt(0).toUpperCase() + t[0].t.slice(1) + "."}
                    </div>
                  </div>
                  <div>
                    <div className="micro" style={S("margin-bottom:5px")}>
                      {s.agent === "claude" ? "Claude Code" : s.agent === "codex" ? "Codex CLI" : "Cursor Agent"}
                    </div>
                    <div className="cbody" style={S("color:var(--text);font-size:13px;line-height:19px")}>
                      {sid === "fix-token-refresh-race"
                        ? "Serialized refresh behind a single-flight lock keyed on the session id. The second tab awaits the first result instead of issuing its own request."
                        : t.find((l) => l.k === "say").t}
                    </div>
                  </div>
                  {sid === "fix-token-refresh-race" && (
                    <>
                      <div className={rg("browser")} style={S("border:1px solid var(--line);border-radius:8px;overflow:hidden")}>
                        <div style={S("padding:7px 11px;border-bottom:1px solid var(--line)")}>
                          <span className="mono" style={S("color:var(--muted);font-size:12px")}>
                            src/auth/refresh.ts
                          </span>
                          <span className="mono" style={S("float:right;font-size:12px;color:var(--done)")}>
                            +34 −11
                          </span>
                        </div>
                        <div className="mono" style={S("padding:9px 11px;font-size:12px;line-height:17px;color:var(--muted);white-space:nowrap;letter-spacing:0")}>
                          <div>
                            <span style={{ color: "var(--run)" }}>+</span> const inflight = new Map()
                          </div>
                          <div>
                            <span style={{ color: "var(--err)" }}>−</span> return fetchToken(session)
                          </div>
                          <div>
                            <span style={{ color: "var(--run)" }}>+</span> return single(session.id, fetchToken)
                          </div>
                        </div>
                      </div>
                      <div style={S("display:flex;gap:8px")}>
                        <Pill dotColor="var(--run)">17 passed</Pill>
                        <Pill dot={false}>typecheck clean</Pill>
                      </div>
                    </>
                  )}
                  <div style={S("border:1px solid var(--line);border-radius:8px;padding:10px 12px;display:flex;align-items:center")}>
                    <span className="mono" style={S("color:var(--muted);font-size:12px")}>
                      Message {s.agent === "claude" ? "Claude Code" : s.agent === "codex" ? "Codex CLI" : "Cursor Agent"}
                    </span>
                    <span className="kbd" style={S("margin-left:auto")}>
                      ⌃G
                    </span>
                  </div>
                </div>
              ) : (
                <div key={sid + view} className="mono fade noscroll" style={S("padding:13px 14px;font-size:12px;line-height:18px;color:var(--muted);display:flex;flex-direction:column;gap:4px;overflow:auto;background:#0C0D0F;flex:1")}>
                  <div>
                    <span style={{ color: "var(--accent)" }}>$</span> <span style={{ color: "var(--text)" }}>{s.agent === "cursor" ? "cursor-agent" : s.agent}</span>
                  </div>
                  {t
                    .filter((l) => l.k !== "gap")
                    .map((l, i) =>
                      l.k === "prompt" ? (
                        <div key={i} style={{ color: "var(--text)" }}>
                          &gt; {l.t}
                        </div>
                      ) : l.k === "say" ? (
                        <div key={i} style={{ color: "var(--text)", margin: "4px 0" }}>
                          ● {l.t}
                        </div>
                      ) : (
                        <div key={i} style={{ color: l.k === "wait" ? "var(--wait)" : undefined }}>
                          {"  "}
                          {l.t} {l.d && <span style={{ color: "var(--done)" }}>{l.d}</span>} {l.ok && <span style={{ color: "var(--run)" }}>{l.ok}</span>}
                        </div>
                      ),
                    )}
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: "var(--text)" }}>&gt;</span> <span className="caret" />
                  </div>
                </div>
              )}
            </div>

            <div className={rg("browser")} style={S("width:252px;display:flex;flex-direction:column;flex:none")}>
              <UrlBar url="localhost:5173" size={20} font={11} pad="9px 11px" onReload={() => setSpin((n) => n + 1)} spin={spin} />
              <div key={spin} className={spin ? "fade" : ""} style={S("flex:1;background:#0C0D0F;padding:15px 16px")}>
                <div style={S("display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)")}>
                  <span style={S("font-family:var(--display);font-weight:600;font-size:14px")}>Orbit</span>
                  <span className="cbody" style={S("font-size:11px")}>
                    Sessions
                  </span>
                  <span className="cbody" style={S("font-size:11px")}>
                    Hosts
                  </span>
                </div>
                <div style={S("font-family:var(--display);font-weight:600;font-size:16px;margin-top:14px")}>Signed in</div>
                <div className="cbody" style={S("margin-top:5px;font-size:12px;line-height:18px")}>
                  Two tabs opened from sleep. One refresh call went out and both tabs took the same token.
                </div>
                <div style={S("margin-top:12px;border:1px solid var(--line);border-radius:8px;overflow:hidden")}>
                  <div style={S("display:flex;padding:7px 10px;border-bottom:1px solid var(--line)")}>
                    <span className="label" style={S("flex:1;font-size:11px")}>
                      Tab
                    </span>
                    <span className="label" style={S("font-size:11px")}>
                      Token
                    </span>
                  </div>
                  {[
                    ["orbit · 1", "fresh", "var(--text)"],
                    ["orbit · 2", "reused", "var(--muted)"],
                  ].map(([a, b, c], i) => (
                    <button key={a} type="button" className={`row click ${tok === i ? "on" : ""}`} onClick={() => setTok(tok === i ? null : i)} style={{ width: "100%", borderRadius: 0, padding: "8px 10px", borderBottom: i === 0 ? "1px solid var(--line)" : "none" }}>
                      <span className="mono" style={S("flex:1;font-size:11px;color:var(--text)")}>
                        {a}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: c }}>
                        {b}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="micro" style={S("margin-top:12px;line-height:15px")}>
                  {tok === null ? "Read the diff on the left, click the result on the right." : tok === 0 ? "Tab 1 made the only refresh call at 10:24:03." : "Tab 2 waited 41 ms and reused tab 1's token."}
                </div>
              </div>
            </div>
          </div>

          <div className={rg("status")} style={S("display:flex;gap:30px;align-items:center;height:48px;padding:0 16px;border-top:1px solid var(--line)")}>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              Memory <span style={{ color: "var(--text)" }}>{mem} MB</span>
            </span>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              Sessions <span style={{ color: "var(--text)" }}>4</span>
            </span>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              Uptime <span style={{ color: "var(--text)" }}>{`${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m`}</span>
            </span>
            <span className="micro" style={S("margin-left:auto")}>
              Ghostty terminals, not an Electron shell.
            </span>
          </div>
        </div>
        <p className="cbody" style={S("margin-top:16px")}>
          Every claim on the left is one window. The Terminal and Chat switch is a lens on the same process, not a second copy of it.
        </p>
      </div>
    </>
  );
}
