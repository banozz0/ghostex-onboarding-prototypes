// PROTOTYPE A · shared bits: inline-style parser, agent marks, pills, toggles, timers.
import { useEffect, useState } from "react";
import claudeSvg from "../shared/icons/claude.svg";
import codexSvg from "../shared/icons/codex.svg";
import cursorSvg from "../shared/icons/cursor-cli.svg";

export const REDUCED = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

// Lets the panels.html inline styles be pasted verbatim: S("display:flex;gap:8px").
const cache = new Map();
export function S(str) {
  let o = cache.get(str);
  if (!o) {
    o = {};
    for (const decl of str.split(";")) {
      const i = decl.indexOf(":");
      if (i < 0) continue;
      o[decl.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decl.slice(i + 1).trim();
    }
    cache.set(str, o);
  }
  return o;
}

export const AGENTS = {
  claude: { id: "claude", name: "Claude Code", short: "claude", bin: "/opt/homebrew/bin/claude", account: "uses your Claude account", svg: claudeSvg },
  codex: { id: "codex", name: "Codex CLI", short: "codex", bin: "/opt/homebrew/bin/codex", account: "uses your ChatGPT account", svg: codexSvg },
  cursor: { id: "cursor", name: "Cursor Agent", short: "cursor", bin: "/opt/homebrew/bin/cursor-agent", account: "uses your Cursor account", svg: cursorSvg },
};

export function Mark({ agent, style }) {
  return (
    <div className="mark" style={style}>
      <span className="pmark" dangerouslySetInnerHTML={{ __html: AGENTS[agent].svg }} />
    </div>
  );
}

export function Pill({ kind = "", dot = true, dotColor, className = "", children, ...rest }) {
  return (
    <span className={`pill ${kind} ${className}`} {...rest}>
      {dot && <i style={dotColor ? { background: dotColor } : undefined} />}
      {children}
    </span>
  );
}

export function Tog({ on, style, className = "" }) {
  return <span className={`tog${on ? " on" : ""} ${className}`} style={style} />;
}

export function Lights() {
  return (
    <div className="lights">
      <i />
      <i />
      <i />
    </div>
  );
}

export function Tabs({ tabs, active, onTab, fresh = [] }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t} type="button" className={`${t === active ? "on" : ""} ${fresh.includes(t) ? "new" : ""}`} onClick={() => onTab(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

// Keyboard + click handler for non-button rows that contain other controls.
export function press(fn, role = "button") {
  return {
    role,
    tabIndex: 0,
    onClick: fn,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn(e);
      }
    },
  };
}

export const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 8h11M9.5 4l4 4-4 4" />
  </svg>
);
export const BackArrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 8h-11M6.5 4l-4 4 4 4" />
  </svg>
);

// One clock for every "running 8m 12s" in the prototype.
export const T0 = Date.now();
export function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setN(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return n;
}
export const since = (now, base, from = T0) => base + Math.max(0, Math.floor((now - from) / 1000));
export function fmtDur(s) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

// Reveals `len` items one at a time; chases len when items are appended; restarts when `key` changes.
export function useReveal(len, ms, key, startFull = false) {
  const full = startFull || REDUCED;
  const [st, setSt] = useState({ key, n: full ? len : 0 });
  let n = st.n;
  if (st.key !== key) {
    n = full ? len : 0;
    setSt({ key, n });
  }
  useEffect(() => {
    if (st.n >= len) return;
    const id = setTimeout(() => setSt((s) => ({ ...s, n: s.n + 1 })), ms);
    return () => clearTimeout(id);
  }, [st, len, ms]);
  return Math.min(n, len);
}

export const later = (ms) => new Promise((r) => setTimeout(r, ms));
