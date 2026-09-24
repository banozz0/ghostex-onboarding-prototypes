// PROTOTYPE A · panes reused across steps: transcript lines, the Orbit browser page, the refresh.ts diff.
import { useState } from "react";
import { S, Pill } from "./ui.jsx";
import { STATE_COLOR } from "./data.js";

const NUM = ["zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

export function Line({ l, elapsed }) {
  switch (l.k) {
    case "prompt":
      return (
        <div>
          <span className="a">&gt;</span> <span style={{ color: "var(--text)" }}>{l.t}</span>
        </div>
      );
    case "gap":
      return <div style={{ height: l.h ?? 6 }} />;
    case "say":
      return <div style={S("color:var(--text);max-width:52ch;line-height:20px")}>{l.t}</div>;
    case "wait":
      return <div style={{ color: "var(--wait)" }}>{l.t}</div>;
    case "git":
      return (
        <div>
          {l.t} <span className="d">{l.d}</span>
          {elapsed ? ` · ${elapsed} elapsed` : ""}
        </div>
      );
    default:
      return (
        <div>
          {l.t}
          {l.d && (
            <>
              {" "}
              <span className="d">{l.d}</span>
            </>
          )}
          {l.ok && (
            <>
              {" "}
              <span style={{ color: "var(--run)" }}>{l.ok}</span>
            </>
          )}
        </div>
      );
  }
}

export function UrlBar({ url = "http://localhost:5173", onReload, spin, size = 22, font = 12, pad = "10px 12px" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: pad, borderBottom: "1px solid var(--line)" }}>
      <button
        type="button"
        onClick={onReload}
        title="Reload"
        style={{ width: size, height: size, border: "1px solid var(--line)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 11 }}
      >
        <span key={spin} className={spin ? "spin" : ""}>
          ↻
        </span>
      </button>
      <span className="mono" style={{ flex: 1, color: "var(--muted)", fontSize: font, border: "1px solid var(--line)", borderRadius: 8, padding: font === 12 ? "4px 9px" : "3px 8px" }}>
        {url}
      </span>
    </div>
  );
}

// The Orbit app the agent is building, as rendered in the Ghostex browser.
export function OrbitPage({ rows, onNew, flash }) {
  const [sel, setSel] = useState(null);
  const [picked, setPicked] = useState(null);
  const tab = picked ?? "Sessions";
  const setTab = setPicked;
  const [toast, setToast] = useState(null);
  const say = (t) => {
    setToast(t);
    setTimeout(() => setToast(null), 1800);
  };
  return (
    <div style={S("flex:1;background:#0C0D0F;padding:20px 22px;position:relative")}>
      <div style={S("display:flex;align-items:center;gap:10px;padding-bottom:16px;border-bottom:1px solid var(--line)")}>
        <span style={S("font-family:var(--display);font-weight:600;font-size:15px")}>Orbit</span>
        {["Sessions", "Hosts", "Settings"].map((t, i) => (
          <button key={t} type="button" className="cbody" onClick={() => setTab(t)} style={{ fontSize: 12, marginLeft: i === 0 ? 14 : 0, color: picked === t ? "var(--text)" : undefined }}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Sessions" ? (
        <>
          <div style={S("font-family:var(--display);font-weight:600;font-size:22px;line-height:28px;margin-top:20px")}>Active sessions</div>
          <div className="cbody" style={S("margin-top:6px;font-size:13px")}>
            {NUM[rows.length] ?? rows.length} sessions across two projects.
          </div>
          <div style={S("margin-top:16px;border:1px solid var(--line);border-radius:12px;overflow:hidden")}>
            <div style={S("display:flex;padding:8px 12px;border-bottom:1px solid var(--line)")}>
              <span className="label" style={{ flex: 1 }}>
                Session
              </span>
              <span className="label" style={{ width: 76 }}>
                Agent
              </span>
              <span className="label" style={{ width: 64 }}>
                State
              </span>
            </div>
            {rows.map((r, i) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setSel(r.id)}
                className={`row click ${sel === r.id ? "on" : ""} ${r.fresh ? "fade" : ""}`}
                style={{ width: "100%", borderRadius: 0, gap: 0, padding: "9px 12px", borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none" }}
              >
                <span className="mono" style={S("flex:1;font-size:12px;color:var(--text)")}>
                  {r.id}
                </span>
                <span className="cbody" style={S("width:76px;font-size:12px")}>
                  {r.agent}
                </span>
                <span className="mono" style={{ width: 64, fontSize: 12, color: STATE_COLOR[r.state] }}>
                  {r.state}
                </span>
              </button>
            ))}
          </div>
          <div style={S("margin-top:16px;display:flex;gap:10px")}>
            <button type="button" className="cta" style={S("height:34px;padding:0 14px;font-size:13px")} onClick={onNew}>
              New session
            </button>
            <button type="button" className="ghost" style={S("height:34px;font-size:13px")} onClick={() => say("Hosts attach from Settings under Remote.")}>
              Attach host
            </button>
          </div>
        </>
      ) : (
        <div className="fade" style={{ marginTop: 20 }}>
          <div style={S("font-family:var(--display);font-weight:600;font-size:22px;line-height:28px")}>{tab}</div>
          <div className="cbody" style={S("margin-top:6px;font-size:13px")}>
            {tab === "Hosts" ? "mini-01 · macOS · 4 sessions · 18 ms" : "Signed in as you@orbit.dev. Tokens refresh through a single-flight lock."}
          </div>
        </div>
      )}
      {(toast || flash) && (
        <div className="micro fade" style={S("position:absolute;left:22px;bottom:18px;color:var(--text)")}>
          {toast || flash}
        </div>
      )}
    </div>
  );
}

const DIFF = [
  ["28", "  const inflight = new Map()"],
  ["29", ""],
  ["30", "  export function single(key, fn) {"],
  ["+", "    if (inflight.has(key))"],
  ["+", "      return inflight.get(key)"],
  ["+", "    const p = fn().finally(() =>", "fix"],
  ["+", "      inflight.delete(key))", "fix"],
  ["+", "    inflight.set(key, p)"],
  ["+", "    return p"],
  ["39", "  }"],
  ["40", ""],
  ["−", "  return fetchToken(session)"],
  ["+", "  return single(session.id, fetchToken)"],
];

// src/auth/refresh.ts with one review comment that can be sent back to the agent.
export function DiffPane({ agentName = "Claude Code", sent, onSend, style }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, ...style }}>
      <div style={S("display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--line)")}>
        <span className="mono" style={S("color:var(--text);font-size:12px")}>
          src/auth/refresh.ts
        </span>
        <span className="mono" style={S("font-size:12px;color:var(--done)")}>
          +34 −11
        </span>
        <Pill dot={false} style={S("margin-left:auto;height:20px;font-size:10px")} kind={sent === "done" ? "run" : ""}>
          {sent === "done" ? "1 resolved" : sent === "sending" ? "applying…" : "1 review comment"}
        </Pill>
      </div>
      <div style={S("padding:14px 16px 0;flex:1")}>
        <div className="mono" style={S("font-size:12px;line-height:18px;color:var(--muted);display:flex;flex-direction:column")}>
          {DIFF.map(([g, code, tag], i) => (
            <div key={i} style={{ whiteSpace: "pre", transition: "background .4s", background: sent === "done" && tag === "fix" ? "rgba(65,211,146,.10)" : "transparent", borderRadius: 3 }}>
              <span style={{ color: g === "+" ? "var(--run)" : g === "−" ? "var(--err)" : undefined }}>{g}</span>
              {code}
            </div>
          ))}
        </div>
        <div style={S("margin-top:16px;border-left:2px solid var(--accent);padding:2px 0 2px 12px")}>
          <div className="micro" style={S("color:var(--accent);margin-bottom:3px")}>
            Review comment from you
          </div>
          <div className="cbody" style={S("font-size:13px;line-height:19px")}>
            Delete the entry in a finally, not after the await. A rejection leaves the key stuck otherwise.
          </div>
        </div>
        {sent === "done" && (
          <div className="fade" style={S("margin-top:12px;border-left:2px solid var(--run);padding:2px 0 2px 12px")}>
            <div className="micro" style={S("color:var(--run);margin-bottom:3px")}>
              {agentName} · resolved
            </div>
            <div className="cbody" style={S("font-size:13px;line-height:19px")}>
              Moved the delete into the finally. A rejected refresh now clears the key; added a test for it.
            </div>
          </div>
        )}
        <div style={S("margin-top:14px;display:flex;gap:8px")}>
          <button type="button" className="pill" style={{ height: 26 }} disabled={!!sent} onClick={onSend}>
            {sent === "done" ? `Sent to ${agentName}` : sent === "sending" ? "Sending…" : `Send review to ${agentName}`}
          </button>
        </div>
      </div>
    </div>
  );
}
