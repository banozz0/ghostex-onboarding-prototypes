// PROTOTYPE — shared primitives for the tone-down onboarding (version B).
import { useEffect, useId, useRef, useState } from "react";
import claudeSvg from "../shared/icons/claude.svg";
import codexSvg from "../shared/icons/codex.svg";
import cursorSvg from "../shared/icons/cursor-cli.svg";
import geminiSvg from "../shared/icons/gemini.svg";
import opencodeSvg from "../shared/icons/opencode.svg";

export const RM = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Absolute box in stage coordinates (the 1672x941 mockup canvas). */
export const at = (x, y, w, h) => ({ position: "absolute", left: x, top: y, width: w, height: h });

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export const fmtElapsed = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};

export function useOutside(ref, onOut, active) {
  useEffect(() => {
    if (!active) return;
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOut();
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [active]);
}

/* ─────────────── icons */
const P = {
  terminal: '<path d="M5 7l5 5-5 5M12.5 18h6.5"/>',
  browser: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18"/><path d="M6.3 6.8h.01M8.8 6.8h.01" stroke-width="2.2"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M11 18.6h2"/>',
  home: '<path d="M4 11.2 12 4l8 7.2v8.3a1 1 0 0 1-1 1h-4.6v-5.8H9.6v5.8H5a1 1 0 0 1-1-1z" fill="currentColor" stroke="none"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><circle cx="16.6" cy="9.4" r="2.5"/><path d="M15.7 14.3c2.3.1 4.1 1.8 4.6 4.7"/>',
  doc: '<path d="M6 3.5h8l4 4V20a.6.6 0 0 1-.6.6H6.6A.6.6 0 0 1 6 20z"/><path d="M14 3.5V8h4M9 12.2h6M9 15.6h6"/>',
  file: '<path d="M6 3.5h8l4 4V20a.6.6 0 0 1-.6.6H6.6A.6.6 0 0 1 6 20z"/><path d="M14 3.5V8h4M9 13.5h3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-13M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  review: '<rect x="3" y="3.5" width="18" height="15" rx="2"/><path d="M3 7.5h18"/><circle cx="12.5" cy="12.8" r="3"/><path d="M14.7 15l3.3 3.3"/>',
  org: '<rect x="9.5" y="3" width="5" height="4.5" rx="1"/><rect x="3" y="15.5" width="5" height="4.5" rx="1"/><rect x="16" y="15.5" width="5" height="4.5" rx="1"/><rect x="9.5" y="15.5" width="5" height="4.5" rx="1"/><path d="M12 7.5v8M5.5 15.5v-3h13v3"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  monitor: '<rect x="3" y="4" width="18" height="12.5" rx="1.8"/><path d="M9 20.5h6M12 16.5v4"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
  refresh: '<path d="M19.5 11.5A7.5 7.5 0 0 0 6 7.3M5 4v4h4M4.5 12.5A7.5 7.5 0 0 0 18 16.7M19 20v-4h-4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8 5.5-5.6"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  folder: '<path d="M3 7a1.5 1.5 0 0 1 1.5-1.5h4.3l2 2.2h8.7A1.5 1.5 0 0 1 21 9.2V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke-width="2.2"/>',
  arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowL: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  arrowD: '<path d="M12 4v15M6 13l6 6 6-6"/>',
  chevR: '<path d="M9 5l7 7-7 7"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
  kanban: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><rect x="7.5" y="8.5" width="6" height="8" rx=".6"/>',
  bolt: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" fill="currentColor" stroke="none"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/>',
  list: '<path d="M5 7h14M5 12h14M5 17h14"/>',
  send: '<path d="M4 12 20 4l-6 16-2.5-6.5z" fill="currentColor" stroke="none"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  signal: '<path d="M4 18v-2M8 18v-5M12 18V9M16 18V6" stroke-width="2.2"/>',
  wifi: '<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.8a7.5 7.5 0 0 1 11 0M9.6 16a3 3 0 0 1 4.8 0"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  layers: '<path d="M12 3 3 8l9 5 9-5z"/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
  sparkle: '<path d="M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7z"/>',
  triangle: '<path d="M12 4 21 19.5H3z"/>',
  brackets: '<path d="M8 4H5v16h3M16 4h3v16h-3"/>',
};

export function Icon({ n, size = 20, sw = 1.6, className, style }) {
  return (
    <svg
      className={"ic" + (className ? " " + className : "")}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: P[n] }}
    />
  );
}

/* ─────────────── brand + agents */
/** Ghostex "G": rounded blue square, white G, a small crescent arc off the top-right corner. */
export function GLogo({ size = 32, dim = false, glow = false }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={"glogo" + (glow ? " glow" : "")} width={size} height={size} viewBox="0 0 40 40" aria-label="Ghostex">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={dim ? "#2a4290" : "#4a74ff"} />
          <stop offset="1" stopColor={dim ? "#172a66" : "#1d3fcf"} />
        </linearGradient>
      </defs>
      <rect x="2" y="5" width="31" height="31" rx="8" fill={`url(#${id})`} stroke={dim ? "rgba(140,165,240,.35)" : "rgba(180,200,255,.55)"} strokeWidth=".8" />
      <text x="17.5" y="28.4" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="18.5" fill={dim ? "#dbe4ff" : "#fff"}>
        G
      </text>
      <path d="M33.6 1.6a4.6 4.6 0 1 1-4.3 6.1" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const SVGS = { claude: claudeSvg, codex: codexSvg, cursor: cursorSvg, gemini: geminiSvg, opencode: opencodeSvg };
const DOTS = ["#f5c542", "#35d0e0", "#4b7bff", "#f5c542", "#ff5fa2", "#9b6bff"];

export function AgentIcon({ id, size = 24 }) {
  if (id === "other")
    return (
      <svg className="aicon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        {DOTS.map((c, i) => (
          <circle key={i} cx={5 + (i % 3) * 7} cy={8.5 + Math.floor(i / 3) * 7} r="2.4" fill={c} />
        ))}
      </svg>
    );
  if (id === "terminal") return <Icon n="terminal" size={size} />;
  return <span className={"aicon " + id} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: SVGS[id] }} />;
}

/** The "other agents" glyph strip from panel 3: triangle, brackets, sparkle, plus. */
export function OtherGlyphs({ size = 18 }) {
  return (
    <span className="other-glyphs">
      <Icon n="triangle" size={size} style={{ color: "#9be15d" }} sw={2.2} />
      <Icon n="brackets" size={size} style={{ color: "#6f8cff" }} sw={2} />
      <Icon n="sparkle" size={size} style={{ color: "#7c9dff" }} sw={1.4} />
      <Icon n="plus" size={size} style={{ color: "#aab2c1" }} sw={2} />
    </span>
  );
}

export const AGENTS = {
  claude: { name: "Claude Code", short: "Claude Code", account: "Claude", cmd: "claude --version" },
  codex: { name: "Codex CLI", short: "Codex", account: "ChatGPT", cmd: "codex --version" },
  cursor: { name: "Cursor Agent", short: "Cursor Agent", account: "Cursor", cmd: "cursor-agent --version" },
};

/* ─────────────── controls */
export function Toggle({ on, onClick, size = "lg", label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!on}
      aria-label={label}
      className={"tg tg-" + size + (on ? " on" : "")}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    />
  );
}

export function Menu({ items, onPick, align = "right", label = "More" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  return (
    <span className="menu" ref={ref}>
      <button type="button" className="more" aria-label={label} onClick={(e) => (e.stopPropagation(), setOpen((o) => !o))}>
        <i />
        <i />
        <i />
      </button>
      {open && (
        <span className={"menu-pop " + align}>
          {items.map((it) => (
            <button
              type="button"
              key={it}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onPick?.(it);
              }}
            >
              {it}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

export function Modal({ title, onClose, children, width = 480 }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <div className="modal-back" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass" style={{ width }} role="dialog" aria-label={title}>
        <div className="modal-head">
          <span>{title}</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon n="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────── connectors */
/** Vertical, horizontal, vertical with rounded corners. */
export function elbow(x1, y1, x2, y2, r = 16) {
  if (Math.abs(x2 - x1) < 1) return `M${x1} ${y1}V${y2}`;
  const my = (y1 + y2) / 2,
    sx = Math.sign(x2 - x1),
    sy = Math.sign(y2 - y1);
  const rr = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(my - y1));
  return `M${x1} ${y1}V${my - sy * rr}Q${x1} ${my} ${x1 + sx * rr} ${my}H${x2 - sx * rr}Q${x2} ${my} ${x2} ${my + sy * rr}V${y2}`;
}
/** Horizontal then vertical, one rounded corner. */
export function hv(x1, y1, x2, y2, r = 18) {
  const sx = Math.sign(x2 - x1),
    sy = Math.sign(y2 - y1);
  return `M${x1} ${y1}H${x2 - sx * r}Q${x2} ${y1} ${x2} ${y1 + sy * r}V${y2}`;
}

export function Wire({ d, active = false, on = true, dashed = false, ends = [], dur = 3.6, delay = 0 }) {
  return (
    <g className={"wire" + (active ? " active" : "") + (on ? "" : " off")}>
      <path d={d} className="wire-glow" />
      <path d={d} className="wire-line" strokeDasharray={dashed ? "4 6" : undefined} />
      {ends.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" className="wire-dot" />
      ))}
      {on && !RM && (
        <circle r={active ? 3.2 : 2.3} className="wire-pulse">
          <animateMotion dur={(active ? 1.15 : dur) + "s"} begin={delay + "s"} repeatCount="indefinite" path={d} />
        </circle>
      )}
      {on && active && !RM && (
        <circle r="2.6" className="wire-pulse">
          <animateMotion dur="1.15s" begin="0.57s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </g>
  );
}

export function Wires({ children }) {
  return (
    <svg className="wires" width="1672" height="941" viewBox="0 0 1672 941" aria-hidden="true">
      {children}
    </svg>
  );
}

/* ─────────────── mock Ghostex window */
export const NAV = [
  { id: "workspace", label: "Workspace", icon: "home" },
  { id: "agents", label: "Agents", icon: "users" },
  { id: "sessions", label: "Sessions", icon: "doc" },
  { id: "files", label: "Files", icon: "file" },
  { id: "settings", label: "Settings", icon: "gear" },
];

export function GxWindow({ style, tab = "workspace", onTab, children, title = "Ghostex", className = "", sideW = 132, logo = 26, onMenu }) {
  return (
    <div className={"gxwin " + className} style={style}>
      <div className="gxwin-bar">
        <span className="lights">
          <i />
          <i />
          <i />
        </span>
        <GLogo size={logo} />
        <span className="gxwin-title">{title}</span>
        {onMenu ? <Menu items={["New session", "Split pane", "Settings"]} onPick={onMenu} /> : <span className="more static"><i /><i /><i /></span>}
      </div>
      <div className="gxwin-body">
        <nav className="gxwin-side" style={{ width: sideW }}>
          {NAV.map((n) => (
            <button type="button" key={n.id} className={tab === n.id ? "on" : ""} onClick={(e) => (e.stopPropagation(), onTab?.(n.id))}>
              <Icon n={n.icon} size={15} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="gxwin-main">{children}</div>
      </div>
    </div>
  );
}

/** The faint checklist panel on the right of the mock window. */
export function GhostPanel({ style }) {
  return (
    <div className="ghostpanel" style={style}>
      <Icon n="x" size={11} />
      <i className="gp-bar" style={{ width: "34%" }} />
      <i className="gp-bar" style={{ width: "70%", marginTop: 18 }} />
      <i className="gp-bar" style={{ width: "54%" }} />
      <i className="gp-bar" style={{ width: "62%" }} />
      <div className="gp-rows">
        {[64, 48, 58, 40, 52].map((w, i) => (
          <span key={i}>
            <b />
            <i className="gp-bar" style={{ width: w + "%" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Centre content of the mock window for each sidebar tab. */
export function WindowCenter({ tab, title = "Ghostex workspace", sub = "One workspace. All your agents.", logo = 64, statuses }) {
  if (tab === "agents")
    return (
      <div className="wc-list">
        {[
          ["claude", "Claude Code", statuses?.claude ?? "running"],
          ["codex", "Codex", statuses?.codex ?? "waiting"],
          ["cursor", "Cursor Agent", statuses?.cursor ?? "ready"],
          ["other", "Other agents", "20+ supported"],
        ].map(([id, nm, st]) => (
          <div className="wc-row" key={id}>
            <AgentIcon id={id} size={18} />
            <span className="nm">{nm}</span>
            <span className={"st st-" + st.split(" ")[0]}>
              <i />
              {st}
            </span>
          </div>
        ))}
      </div>
    );
  if (tab === "sessions")
    return (
      <div className="wc-list mono">
        {[
          ["refactor-auth", "claude", "running", "run"],
          ["port-legacy-tests", "codex", "waiting", "wait"],
          ["tokens-to-css-vars", "cursor", "done", "done"],
        ].map(([n, a, st, c]) => (
          <div className="wc-row" key={n}>
            <span className={"dot " + c} />
            <span className="nm">{n}</span>
            <span className="dim">{a}</span>
            <span className={"st st-" + c}>{st}</span>
          </div>
        ))}
        <div className="wc-foot">Sessions survive a restart. zmx keeps them attached.</div>
      </div>
    );
  if (tab === "files")
    return (
      <div className="wc-tree mono">
        <div>
          <Icon n="folder" size={13} /> my-app
        </div>
        {["src/", "  auth/refresh.ts", "  app.tsx", "tests/", "package.json"].map((f) => (
          <div key={f} className={f.startsWith("  ") ? "in" : ""}>
            <Icon n={f.endsWith("/") ? "folder" : "file"} size={12} /> {f.trim()}
          </div>
        ))}
      </div>
    );
  if (tab === "settings")
    return (
      <div className="wc-list">
        {["Browser", "Docs", "Notifications"].map((n, i) => (
          <div className="wc-row" key={n}>
            <span className="nm">{n}</span>
            <span className={"mini-tg" + (i !== 1 ? " on" : "")} />
          </div>
        ))}
        <div className="wc-foot">Everything here stays changeable after setup.</div>
      </div>
    );
  return (
    <div className="wc-hero">
      <GLogo size={logo} glow />
      <div className="wc-title">{title}</div>
      <div className="wc-sub">{sub}</div>
    </div>
  );
}
