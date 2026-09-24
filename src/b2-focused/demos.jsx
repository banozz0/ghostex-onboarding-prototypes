// PROTOTYPE B2 — panel 1's right side: one looping demo per tab, drawn as the thing itself.
import { useEffect, useState } from "react";
import { AgentIcon, GLogo, Icon, RM, Wire, Wires, at, elbow } from "./ui.jsx";

/** Frame index of a looping demo: `frames` beats of `ms`, the last beat held for `hold` more. */
function useLoop(frames, ms, hold = 3) {
  const [f, setF] = useState(RM ? frames - 1 : 0);
  useEffect(() => {
    if (RM) return;
    const id = setInterval(() => setF((x) => (x + 1) % (frames + hold)), ms);
    return () => clearInterval(id);
  }, [frames, ms, hold]);
  return Math.min(f, frames - 1);
}

function Pill({ kind, children }) {
  return (
    <span className={"dpill " + kind}>
      <i />
      {children}
    </span>
  );
}

/** A straight live link between two things; `send` fires one packet along it, "r…" rightwards or "l…" leftwards. */
export function Link({ x, y, w, send, label }) {
  return (
    <div className="dlink" style={at(x, y - 1, w, 2)}>
      <i className="dlink-end l" />
      <i className="dlink-end r" />
      {send && <span key={send} className={"dlink-pkt " + send[0]} />}
      {label && (
        <span key={label} className="dlink-label">
          {label}
        </span>
      )}
    </div>
  );
}

/* ─────────────── Agents that work together */
const CLAUDE_LOG = [
  [0, "me", "Refactor the auth flow."],
  [1, "", "Edited src/auth/refresh.ts"],
  [2, "acc", "Handing the tests to Codex"],
  [6, "ok", "Codex's tests pass. Ready to merge."],
];
const CODEX_LOG = [
  [3, "", "Got it: tests for refresh.ts"],
  [4, "", "Wrote 6 tests"],
  [5, "ok", "6 of 6 pass"],
];

function AgentCard({ id, name, role, box, status, log, f, lit }) {
  return (
    <div className={"dcard" + (lit ? " lit" : "")} style={box}>
      <div className="dcard-h">
        <span className="abox sm">
          <AgentIcon id={id} size={24} />
        </span>
        <span className="dcard-t">
          <b>{name}</b>
          <em>{role}</em>
        </span>
        <Pill kind={status[0]}>{status[1]}</Pill>
      </div>
      <div className="dcard-log">
        {log
          .filter(([n]) => n <= f)
          .map(([n, cls, t]) => (
            <div key={t} className={"dl " + cls + (n === f ? " fresh" : "")}>
              {t}
            </div>
          ))}
      </div>
    </div>
  );
}

export function TogetherDemo() {
  const f = useLoop(7, 1150);
  const handing = f >= 2 && f < 5;
  return (
    <>
      <AgentCard
        id="claude"
        name="Claude Code"
        role="Lead agent"
        box={at(812, 300, 300, 320)}
        status={f >= 6 ? ["done", "Done"] : ["run", "Working"]}
        log={CLAUDE_LOG}
        f={f}
        lit={f < 3 || f >= 6}
      />
      <Link x={1112} y={460} w={206} send={f === 2 ? "r2" : f === 5 ? "l5" : null} label={handing ? "Write tests for refresh.ts" : f >= 5 ? "Tests pass" : null} />
      <AgentCard
        id="codex"
        name="Codex"
        role={f >= 3 ? "Started by Claude" : "Sub-agent"}
        box={at(1318, 300, 300, 320)}
        status={f >= 5 ? ["done", "Done"] : f >= 3 ? ["run", "Working"] : ["idle", "Waiting"]}
        log={CODEX_LOG}
        f={f}
        lit={f >= 3 && f < 6}
      />
    </>
  );
}

/* ─────────────── Chat + terminal */
// Each beat lands the same moment on both sides: [terminal line, chat item or null].
const CT = [
  [["cmd", "$ claude"], null],
  [["me", "> Fix the flaky refresh test"], ["me", "Fix the flaky refresh test"]],
  [["tool", "● Read src/auth/refresh.ts"], ["tool", "Read refresh.ts"]],
  [["tool", "● Update src/auth/refresh.ts  +12 −4"], ["tool", "Edited refresh.ts · +12 −4"]],
  [["tool", "● Bash bun test  17 passed"], ["tool", "Ran the tests · 17 passed"]],
  [["out", "Fixed: the refresh now waits for the lock."], ["bot", "Fixed. The refresh now waits for the lock, and all 17 tests pass."]],
];

export function ChatTerminalDemo() {
  const f = useLoop(CT.length, 1150);
  const rows = CT.slice(0, f + 1);
  return (
    <>
      <Wires>
        <Wire d={elbow(1215, 196, 1000, 250)} ends={[[1000, 250]]} active />
        <Wire d={elbow(1215, 196, 1430, 250)} ends={[[1430, 250]]} active delay={0.5} />
      </Wires>
      <div className="dsess" style={at(1095, 158, 240, 38)}>
        <span className="dot run" />
        refactor-auth · one session
      </div>
      <div className="dpane" style={at(810, 250, 380, 440)}>
        <div className="dpane-h">
          <Icon n="terminal" size={16} />
          Terminal
        </div>
        <div className="dpane-b mono">
          {rows.map(([t], i) => (
            <div key={i} className={"tline " + t[0] + (i === f ? " fresh" : "")}>
              {t[1]}
            </div>
          ))}
          <span className="caret sm" />
        </div>
      </div>
      <div className="dpane" style={at(1240, 250, 380, 440)}>
        <div className="dpane-h">
          <Icon n="chat" size={16} />
          Chat view
        </div>
        <div className="dpane-b">
          {rows.map(([, c], i) =>
            c ? (
              <div key={i} className={"cline " + c[0] + (i === f ? " fresh" : "")}>
                {c[0] === "bot" && (
                  <span className="who">
                    <AgentIcon id="claude" size={13} /> Claude Code
                  </span>
                )}
                {c[0] === "tool" && <Icon n="check" size={13} sw={2.2} />}
                {c[1]}
              </div>
            ) : null,
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────── Desktop + mobile */
const SESS = [
  ["claude", "refactor-auth"],
  ["codex", "port-legacy-tests"],
  ["cursor", "tokens-to-css-vars"],
];

export function DesktopMobileDemo() {
  const f = useLoop(6, 1150);
  const codex = f >= 5 ? ["done", "Done"] : f >= 4 ? ["run", "Working"] : f >= 1 ? ["need", "Needs you"] : ["run", "Working"];
  const status = (id) => (id === "codex" ? codex : ["run", "Working"]);
  return (
    <>
      <div className="dmon" style={at(800, 262, 450, 312)}>
        <div className="dmon-bar">
          <span className="lights sm">
            <i />
            <i />
            <i />
          </span>
          <GLogo size={18} />
          <b>orbit-api</b>
        </div>
        <div className="dmon-body">
          {SESS.map(([id, n]) => (
            <div key={n} className={"dmon-row" + (id === "codex" && f >= 1 ? " hot" : "")}>
              <AgentIcon id={id} size={16} />
              <span className="mono">{n}</span>
              <Pill kind={status(id)[0]}>{status(id)[1]}</Pill>
            </div>
          ))}
          <div className="dmon-detail" key={f >= 4 ? "r" : "q"}>
            {f >= 1 && f < 4 && (
              <>
                <AgentIcon id="codex" size={14} /> Keep the global fixtures, or inline them?
              </>
            )}
            {f >= 4 && (
              <>
                <span className="ok">Replied from your phone:</span> Inline them
              </>
            )}
          </div>
        </div>
      </div>
      <div className="dmon-neck" style={at(990, 574, 70, 30)} />
      <div className="dmon-foot" style={at(945, 603, 160, 7)} />
      <div className="dcap" style={at(800, 628, 450, 20)}>
        Your computer keeps the work
      </div>

      <Link x={1250} y={440} w={170} send={f === 1 ? "r1" : f === 4 ? "l4" : null} label={f === 1 || f === 2 ? "Codex needs you" : f === 3 || f === 4 ? "Inline them" : "Live"} />

      <div className="dphone" style={at(1420, 236, 196, 404)}>
        <span className="dphone-island" />
        {(f === 1 || f === 2) && (
          <div className="dphone-banner">
            <AgentIcon id="codex" size={13} />
            <span>
              <b>Codex needs you</b>
              Keep global, or inline?
            </span>
          </div>
        )}
        <div className="dphone-h">
          <GLogo size={16} /> Ghostex
        </div>
        {f < 2 ? (
          <div className="dphone-rows">
            {SESS.map(([id, n]) => (
              <div key={n} className="dphone-row">
                <AgentIcon id={id} size={13} />
                <span className="mono">{n}</span>
                <Pill kind={status(id)[0]}>{status(id)[1]}</Pill>
              </div>
            ))}
          </div>
        ) : (
          <div className="dphone-chat">
            <div className="dpc bot">Keep the global fixtures, or inline them?</div>
            <div className="dpc-quick">
              <span>Keep global</span>
              <span className={f === 3 ? "tap" : f > 3 ? "picked" : ""}>Inline them</span>
            </div>
            {f >= 3 && <div className="dpc me">Inline them</div>}
            {f >= 5 && <div className="dpc bot">Inlined 12 fixtures. Tests pass.</div>}
          </div>
        )}
      </div>
      <div className="dcap" style={at(1420, 656, 196, 20)}>
        Your phone steers it
      </div>
    </>
  );
}
