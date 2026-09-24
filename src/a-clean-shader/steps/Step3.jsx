// 03 · Agents — a replayable PATH scan and a real default-agent picker.
import { useEffect, useRef, useState } from "react";
import { S, Mark, AGENTS, press } from "../ui.jsx";

// [offset ms, name, value, bright?] — offsets are the gaps in the original 10:24 scan.
const SCAN = [
  [0, "scanning PATH and common install roots"],
  [173, "claude", "/opt/homebrew/bin/claude", true],
  [1706, "codex", "/opt/homebrew/bin/codex", true],
  [1911, "cursor-agent", "/opt/homebrew/bin/cursor-agent", true],
  [2438, "gemini", "not found"],
  [2884, "qwen", "not found"],
  [2887, "opencode", "not found"],
  null,
  [3106, "reading ~/.ghostex/agents.toml"],
  [3484, "claude", "hooks installed"],
  [3487, "codex", "hooks installed"],
  [3813, "cursor-agent", "no hooks yet"],
  null,
  [4040, "3 of 6 known agent CLIs available", null, true],
];
const PATH_LINE = { claude: 1, codex: 2, cursor: 3 };
const HOOK_LINE = { claude: 9, codex: 10, cursor: 11 };
const HOOKS = { claude: "installed", codex: "installed", cursor: "not yet" };
const START = new Date(2026, 8, 10, 10, 24, 1, 204).getTime();

const p2 = (n, w = 2) => String(n).padStart(w, "0");
const stamp = (t) => {
  const d = new Date(t);
  return `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}.${p2(d.getMilliseconds(), 3)}`;
};

export default function Step3({ state, set, next }) {
  const [base, setBase] = useState(START);
  const [shown, setShown] = useState(SCAN.length);
  const [scanning, setScanning] = useState(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const rescan = () => {
    timers.current.forEach(clearTimeout);
    setBase(Date.now());
    setShown(0);
    setScanning(true);
    SCAN.forEach((l, i) => {
      const at = (l ? l[0] : SCAN[i - 1][0]) / 2.2 + 120 * i;
      timers.current.push(setTimeout(() => setShown(i + 1), at));
    });
    timers.current.push(setTimeout(() => setScanning(false), SCAN[SCAN.length - 1][0] / 2.2 + 120 * SCAN.length));
  };

  const last = new Date(base + 4040);
  const agent = AGENTS[state.agent];

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>03</b>
          <span>Agents</span>
        </div>
        <h1>Use the agents you already have.</h1>
        <p className="sub">Ghostex detects installed agent CLIs and uses your existing accounts. Pick a default now; the others stay one command away.</p>

        <div style={S("display:flex;align-items:center;gap:14px;margin-top:22px")}>
          <button type="button" className="pill" disabled={scanning} style={S("height:32px;padding:0 14px;font-size:12px;color:var(--text)")} onClick={rescan}>
            {scanning ? "Scanning…" : "Rescan"}
          </button>
          <span className="micro">{scanning ? "Reading PATH on mini-01" : `Last scan ${last.getHours()}:${p2(last.getMinutes())} on mini-01`}</span>
        </div>

        <div role="radiogroup" aria-label="Default agent" style={S("display:flex;flex-direction:column;gap:10px;margin-top:14px")}>
          {Object.values(AGENTS).map((a) => {
            const on = state.agent === a.id;
            return (
              <div key={a.id} className={`card hover ${on ? "sel" : ""}`} aria-checked={on} style={S("padding:13px 16px;display:flex;align-items:center;gap:14px")} {...press(() => set({ agent: a.id }), "radio")}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    border: on ? "5px solid var(--accent)" : "1px solid #3A4048",
                    background: on ? "var(--ink)" : "transparent",
                    flex: "none",
                    transition: "border .15s",
                  }}
                />
                <Mark agent={a.id} />
                <div style={{ flex: 1 }}>
                  <div className="nm" style={S("font-size:15px")}>
                    {a.name}
                  </div>
                  <div className="mono" style={S("color:var(--muted);font-size:12px")}>
                    {a.bin}
                  </div>
                </div>
                <span className="micro">{a.account}</span>
              </div>
            );
          })}
        </div>

        <p className="cbody" style={S("margin-top:14px")}>
          20+ more agent CLIs are supported, including Gemini CLI, Qwen Code and OpenCode. None of those three are installed on this machine; add them anytime from Settings.
        </p>

        <div className="actions" style={S("margin-top:20px")}>
          <button type="button" className="cta" onClick={next}>
            Continue with {agent.name}
          </button>
        </div>
      </div>

      <div className="right">
        <div className="term" style={S("height:404px")}>
          <div style={S("display:flex;align-items:center;margin-bottom:12px")}>
            <span>
              <span className="a">$</span> ghostex scan
            </span>
            <span className="t" style={S("margin-left:auto;font-size:12px")}>
              mini-01 · macOS
            </span>
          </div>
          <div className="t" style={S("display:flex;flex-direction:column;gap:4px")}>
            {SCAN.slice(0, shown).map((l, i) =>
              l === null ? (
                <div key={i} style={{ height: 6 }} />
              ) : (
                <div key={`${base}-${i}`} className={scanning ? "fade" : ""} style={{ whiteSpace: "pre" }}>
                  <span className="d">{stamp(base + l[0])}</span>
                  {"  "}
                  {l[2] === undefined || l[2] === null ? (
                    <span style={l[3] ? { color: "var(--text)" } : undefined}>{l[1]}</span>
                  ) : (
                    <>
                      {l[1].padEnd(14)}
                      <span style={l[3] ? { color: "var(--text)" } : undefined}>{l[2]}</span>
                    </>
                  )}
                </div>
              ),
            )}
            {scanning && <span className="caret" style={{ width: 7, height: 13, background: "var(--muted)" }} />}
          </div>
        </div>

        <div className="card" style={S("margin-top:18px;overflow:hidden")}>
          <div style={S("display:flex;align-items:center;padding:13px 18px;border-bottom:1px solid var(--line)")}>
            <span className="ctitle" style={S("font-size:15px")}>
              Detected agents
            </span>
            <span className="mono" style={S("margin-left:auto;color:var(--muted);font-size:12px")}>
              {scanning ? "scanning…" : "3 detected · 2 with hooks"}
            </span>
          </div>
          <div style={S("display:flex;padding:9px 18px;border-bottom:1px solid var(--line)")}>
            <span className="label" style={S("width:170px")}>
              Agent
            </span>
            <span className="label" style={S("flex:1")}>
              Binary
            </span>
            <span className="label" style={S("width:104px")}>
              Hooks
            </span>
            <span className="label">Status</span>
          </div>
          {Object.values(AGENTS).map((a, i) => {
            const found = shown > PATH_LINE[a.id];
            const hooked = shown > HOOK_LINE[a.id];
            const on = state.agent === a.id;
            return (
              <div
                key={a.id}
                {...press(() => set({ agent: a.id }))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "13px 18px",
                  borderBottom: i < 2 ? "1px solid var(--line)" : "none",
                  background: on ? "rgba(91,108,255,.07)" : "transparent",
                  opacity: found ? 1 : 0.3,
                  transition: "background .2s, opacity .25s",
                }}
              >
                <span className="nm" style={S("width:170px;font-size:14px")}>
                  {a.name}
                </span>
                <span className="mono" style={S("flex:1;color:var(--muted)")}>
                  {found ? a.bin : "—"}
                </span>
                <span className="mono" style={{ width: 104, color: HOOKS[a.id] === "installed" ? "var(--text)" : "var(--muted)" }}>
                  {hooked ? HOOKS[a.id] : "—"}
                </span>
                <span className="mono" style={S("color:var(--text)")}>
                  {found ? "ready" : "…"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="micro" style={S("margin-top:16px")}>
          Ghostex reads the binaries already on your PATH. It doesn't install or update them for you.
        </p>
      </div>
    </>
  );
}
