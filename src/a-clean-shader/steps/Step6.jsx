// 06 · Integration — the orchestration terminal plays itself; the sub-agent's question is answerable.
import { useEffect, useRef, useState } from "react";
import { S, Pill, Mark, useNow, since, fmtDur, useReveal, later } from "../ui.jsx";

// Each line: array of [text, class]. Classes: t muted (default), x text, a accent, r run, w wait.
const SCRIPT = [
  [["> hand the flaky auth tests to codex and", "x"]],
  [["  keep an eye on its output", "x"]],
  null,
  [["● Skill "], ["/ghostex-agent-orchestration", "x"]],
  null,
  [["  "], ["$", "a"], [" gx new --agent codex \\"]],
  [["      --title port-legacy-tests"]],
  [["  "], ["created", "r"], [" gx_7f21c4 on mini-01"]],
  null,
  [["  "], ["$", "a"], [' gx send gx_7f21c4 "port the auth']],
  [['    specs off the legacy harness"']],
  [["  "], ["queued", "r"]],
  null,
  [["  "], ["$", "a"], [" gx tail gx_7f21c4 --lines 3"]],
  [["    codex reading refresh.spec.ts"]],
  [["    codex legacy harness: 12 call sites"]],
  [["    codex "], ["waiting", "w"], [": keep the global"]],
  [["      fixtures, or inline them?"]],
  null,
  [["Codex needs a decision before it can", "x"]],
  [["continue. It's in your sidebar now.", "x"]],
];
const CREATED = 7;
const WAITING = 16;

const answerLines = (choice) => [
  null,
  [["  "], ["$", "a"], [` gx send gx_7f21c4 "${choice === "keep" ? "keep the global fixtures" : "inline them per spec"}"`]],
  [["  "], ["queued", "r"]],
  [[`    codex ${choice === "keep" ? "keeping global fixtures, porting 12 call sites" : "inlining fixtures into each spec"}`]],
  null,
  [["Codex is running again. I'll check back when", "x"]],
  [["its tests finish.", "x"]],
];

function TermLine({ segs }) {
  if (!segs) return <div style={{ height: 6 }} />;
  return (
    <div style={{ whiteSpace: "pre" }}>
      {segs.map(([t, c], i) => (
        <span key={i} className={c}>
          {t}
        </span>
      ))}
    </div>
  );
}

export default function Step6({ state, set, next }) {
  const now = useNow();
  const [play, setPlay] = useState(0);
  const [lines, setLines] = useState(SCRIPT);
  const [choice, setChoice] = useState(null);
  const [chooser, setChooser] = useState(false);
  const [resumedAt, setResumedAt] = useState(null);
  const [hooks, setHooks] = useState({ claude: "installed", codex: "installed" });
  const [busy, setBusy] = useState(false);
  const shown = useReveal(lines.length, 150, play);
  const term = useRef(null);
  useEffect(() => {
    const el = term.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const replay = () => {
    setLines(SCRIPT);
    setChoice(null);
    setChooser(false);
    setResumedAt(null);
    setPlay((p) => p + 1);
  };
  const decide = (c) => {
    setChoice(c);
    setChooser(false);
    setResumedAt(Date.now());
    setLines((L) => [...L, ...answerLines(c)]);
  };
  const connect = async () => {
    setBusy(true);
    setHooks({ claude: "verifying", codex: "verifying" });
    await later(700);
    setHooks({ claude: "installed", codex: "verifying" });
    await later(500);
    setHooks({ claude: "installed", codex: "installed" });
    set({ hooks: "installed" });
    await later(650);
    next();
  };

  const subVisible = shown > CREATED;
  const waiting = shown > WAITING && !choice;
  const hookPill = (a) =>
    hooks[a] === "verifying" ? (
      <Pill kind="wait" className="pulse">
        verifying…
      </Pill>
    ) : (
      <Pill dotColor="var(--run)">hooks installed</Pill>
    );

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>06</b>
          <span>Integration</span>
        </div>
        <h1>Make the agents native to the workspace.</h1>
        <p className="sub">A small hook lets Ghostex read agent status and render a real chat view. Skills let the agent act on the workspace itself.</p>

        <div className="card raised" style={S("margin-top:22px;padding:16px 18px")}>
          <div className="label" style={S("margin-bottom:12px")}>
            Connected agents
          </div>
          <div style={S("display:flex;flex-direction:column;gap:13px")}>
            <div style={S("display:flex;align-items:center;gap:12px")}>
              <Mark agent="claude" />
              <div style={{ flex: 1 }}>
                <div className="nm" style={S("font-size:15px")}>
                  Claude Code
                </div>
                <div className="cbody">Status, session titles and a chat view over the same process.</div>
              </div>
              {hookPill("claude")}
            </div>
            <div style={S("display:flex;align-items:center;gap:12px")}>
              <Mark agent="codex" />
              <div style={{ flex: 1 }}>
                <div className="nm" style={S("font-size:15px")}>
                  Codex CLI
                </div>
                <div className="cbody">The same status feed, plus resume after a restart.</div>
              </div>
              {hookPill("codex")}
            </div>
          </div>
        </div>

        <div className="card raised" style={S("margin-top:10px;padding:16px 18px")}>
          <div className="label" style={S("margin-bottom:12px")}>
            Skills both of them gain
          </div>
          <div style={S("display:flex;flex-direction:column;gap:11px")}>
            <div>
              <div className="mono" style={S("color:var(--text)")}>
                /ghostex-browser-use
              </div>
              <div className="cbody" style={S("margin-top:2px")}>
                Drive browser tabs without an approval prompt on every click.
              </div>
            </div>
            <div>
              <div className="mono" style={S("color:var(--text)")}>
                /ghostex-agent-orchestration
              </div>
              <div className="cbody" style={S("margin-top:2px")}>
                Launch another agent, send it a prompt and read its output back.
              </div>
            </div>
          </div>
        </div>

        <div style={S("margin-top:20px;border-left:2px solid var(--accent);padding-left:16px")}>
          <div className="ctitle" style={S("font-size:18px;line-height:26px;color:var(--text)")}>
            Your agent still runs as its own CLI.
          </div>
          <div className="cbody" style={S("margin-top:4px")}>
            Ghostex wraps the process on your machine. Nothing routes through a Ghostex service, and your prompts never leave your host.
          </div>
        </div>

        <div className="actions" style={S("margin-top:20px")}>
          <button type="button" className="cta" onClick={connect} disabled={busy}>
            {busy ? "Connecting…" : "Connect installed agents"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              set({ hooks: "skipped" });
              next();
            }}
          >
            Skip for now
          </button>
        </div>
      </div>

      <div className="right">
        <div className="label" style={S("margin-bottom:12px")}>
          Claude Code handing a job to Codex
        </div>
        <div style={S("display:flex;gap:14px;align-items:stretch;height:560px")}>
          <div ref={term} className="term noscroll" style={S("flex:1;padding:16px 18px;overflow:auto")}>
            <div style={S("margin-bottom:10px;display:flex;align-items:center")}>
              <span>
                <span className="a">$</span> claude <span className="t">· ~/code/orbit-api</span>
              </span>
              <button type="button" className="t" onClick={replay} style={S("margin-left:auto;font-size:11px")} title="Replay">
                ↻ replay
              </button>
            </div>
            <div className="t" style={S("display:flex;flex-direction:column;gap:5px;font-size:12px;line-height:18px")}>
              {lines.slice(0, shown).map((l, i) => (
                <TermLine key={i} segs={l} />
              ))}
              {shown < lines.length && <span className="caret" style={{ width: 7, height: 13, background: "var(--muted)" }} />}
            </div>
          </div>

          <div className="card raised" style={S("width:292px;overflow:visible;display:flex;flex-direction:column;position:relative")}>
            <div style={S("height:44px;display:flex;align-items:center;padding:0 14px;border-bottom:1px solid var(--line);flex:none")}>
              <span className="cbody" style={S("font-size:13px;color:var(--text)")}>
                Sessions
              </span>
              <span className="mono" style={S("margin-left:auto;font-size:11px;color:var(--muted)")}>
                orbit-api
              </span>
            </div>
            <div style={S("padding:10px;display:flex;flex-direction:column;gap:4px")}>
              <div style={S("padding:9px 10px;border-radius:8px;background:var(--surface-2)")}>
                <div style={S("display:flex;align-items:center;gap:8px")}>
                  <i className="dot" style={{ background: "var(--run)" }} />
                  <span className="mono" style={S("font-size:12px;color:var(--text)")}>
                    fix-token-refresh-race
                  </span>
                </div>
                <div className="micro" style={S("margin-left:14px;margin-top:2px")}>
                  claude · running {fmtDur(since(now, 492))}
                </div>
              </div>
              {subVisible && (
                <div style={{ position: "relative" }}>
                  <button type="button" className="row click fade" onClick={() => waiting && setChooser((c) => !c)} style={{ display: "block", width: "100%", padding: "9px 10px", textAlign: "left", cursor: waiting ? "pointer" : "default", background: chooser ? "var(--surface-2)" : undefined }}>
                    <div style={S("display:flex;align-items:center;gap:8px")}>
                      <i className="dot" style={{ background: waiting || shown <= WAITING ? (shown > WAITING ? "var(--wait)" : "var(--run)") : "var(--run)" }} />
                      <span className="mono" style={S("font-size:12px;color:var(--text)")}>
                        port-legacy-tests
                      </span>
                    </div>
                    <div className="micro" style={S("margin-left:14px;margin-top:2px")}>
                      {choice ? `codex · running ${fmtDur(since(now, 0, resumedAt))}` : "codex · launched by Claude Code"}
                    </div>
                    {waiting && (
                      <div className="micro" style={S("margin-left:14px;color:var(--wait)")}>
                        needs a decision
                      </div>
                    )}
                  </button>
                  {chooser && (
                    <div className="pop" style={S("left:10px;right:10px;top:calc(100% + 4px)")}>
                      <div className="micro" style={S("padding:4px 10px 6px")}>
                        Keep the global fixtures, or inline them?
                      </div>
                      <button type="button" onClick={() => decide("keep")}>
                        Keep global fixtures
                      </button>
                      <button type="button" onClick={() => decide("inline")}>
                        Inline them
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div style={S("padding:9px 10px;border-radius:8px")}>
                <div style={S("display:flex;align-items:center;gap:8px")}>
                  <i className="dot" style={{ background: "var(--run)" }} />
                  <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
                    write-migration-notes
                  </span>
                </div>
                <div className="micro" style={S("margin-left:14px;margin-top:2px")}>
                  codex · running {fmtDur(since(now, 100))}
                </div>
              </div>
              <div style={S("padding:9px 10px;border-radius:8px")}>
                <div style={S("display:flex;align-items:center;gap:8px")}>
                  <i className="dot" style={{ background: "var(--done)" }} />
                  <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
                    tokens-to-css-vars
                  </span>
                </div>
                <div className="micro" style={S("margin-left:14px;margin-top:2px")}>
                  cursor · done 2m ago
                </div>
              </div>
            </div>
            <div style={S("margin-top:auto;padding:12px 14px;border-top:1px solid var(--line)")}>
              <div className="micro">Sub-agent sessions are ordinary sessions. Open, reply to or kill them like any other.</div>
            </div>
          </div>
        </div>
        <p className="cbody" style={S("margin-top:16px")}>
          One agent starting another, in your workspace, on your machine.
        </p>
      </div>
    </>
  );
}
