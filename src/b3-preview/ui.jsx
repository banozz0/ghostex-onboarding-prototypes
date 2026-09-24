// PROTOTYPE — shared primitives for the preview onboarding (version B3, forked from B2).
import { useEffect, useRef, useState } from "react";
import claudeSvg from "../shared/icons/claude.svg";
import codexSvg from "../shared/icons/codex.svg";
import cursorSvg from "../shared/icons/cursor-cli.svg";
import geminiSvg from "../shared/icons/gemini.svg";
import opencodeSvg from "../shared/icons/opencode.svg";
import piSvg from "./icons/pi.svg";
import logoPng from "./icons/ghostex.png";

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
/** The Ghostex logo: the app icon the desktop build ships (apps/desktop/resources/AppIcon.appiconset, 256 px). */
export function GLogo({ size = 32, glow = false }) {
  return <img className={"glogo" + (glow ? " glow" : "")} src={logoPng} width={size} height={size} alt="Ghostex" draggable={false} />;
}

const SVGS = { claude: claudeSvg, codex: codexSvg, cursor: cursorSvg, gemini: geminiSvg, opencode: opencodeSvg, pi: piSvg };
const OTHER = ["gemini", "opencode", "pi"];

export function AgentIcon({ id, size = 24 }) {
  if (id === "other") return <OtherLogos size={size} />;
  if (id === "terminal") return <Icon n="terminal" size={size} />;
  return <span className={"aicon " + id} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: SVGS[id] }} />;
}

/** "Other agents" where one logo fits: three real agent logos and a plus, in a 2x2 square. */
export function OtherLogos({ size = 24 }) {
  const c = Math.round(size * 0.47);
  return (
    <span className="olog" style={{ width: size, height: size }} aria-hidden="true">
      {OTHER.map((id) => (
        <span key={id} className={"aicon " + id} style={{ width: c, height: c }} dangerouslySetInnerHTML={{ __html: SVGS[id] }} />
      ))}
      <span className="olog-more" style={{ width: c, height: c, fontSize: Math.max(8, c * 0.9) }}>
        +
      </span>
    </span>
  );
}

/** "Other agents" where a row has room: the logos side by side and a +20 badge. */
export function OtherStrip({ size = 20 }) {
  return (
    <span className="ostrip" aria-hidden="true">
      {OTHER.map((id) => (
        <AgentIcon key={id} id={id} size={size} />
      ))}
      <span className="ostrip-more">+20</span>
    </span>
  );
}

export const AGENTS = {
  claude: { name: "Claude Code", short: "Claude Code", note: "Installed \u2022 uses your Claude account" },
  codex: { name: "Codex", short: "Codex", note: "Installed \u2022 uses your ChatGPT account" },
  cursor: { name: "Cursor Agent", short: "Cursor Agent", note: "Installed \u2022 uses your Cursor account" },
};

/* ─────────────── controls */
export function Toggle({ on, onClick, size = "lg", label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!on}
      aria-label={label}
      disabled={disabled}
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

const INSTALLS = [
  ["Gemini CLI", "gemini", "npm install -g @google/gemini-cli"],
  ["OpenCode", "opencode", "curl -fsSL https://opencode.ai/install | bash"],
  ["Pi", "pi", "npm install -g @mariozechner/pi-coding-agent"],
];

/** The install guide: opened from panel 2, or after onboarding when it was saved for later. */
export function InstallGuide({ onClose, onLater, toast }) {
  const copy = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast(`Copied ${text}`);
  };
  return (
    <Modal title="Install another agent" onClose={onClose} width={580}>
      <p className="modal-p">
        Ghostex runs any agent CLI already installed on your computer. Install one, then {onLater ? "press Rescan" : "rescan in Settings → Agents"}.
      </p>
      <div className="install-list">
        {INSTALLS.map(([n, ic, cmd]) => (
          <div key={n} className="install-row">
            <AgentIcon id={ic} size={18} />
            <span className="nm">{n}</span>
            <code>{cmd}</code>
            <button type="button" className="icon-btn" onClick={() => copy(cmd)} aria-label={`Copy ${n} install command`}>
              <Icon n="copy" size={15} />
            </button>
          </div>
        ))}
      </div>
      <p className="modal-p dim">20+ more are listed in Settings → Agents.</p>
      <div className="modal-actions">
        {onLater && (
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        )}
        <button type="button" className="cta filled sm" onClick={onLater ?? onClose}>
          {onLater ? "Open after onboarding" : "Done"}
        </button>
      </div>
    </Modal>
  );
}

// Prototype A's QR module map (rects at 5px pitch), so every panel draws the same code.
const QR_RECTS =
  "0,0 5,0 10,0 15,0 20,0 25,0 30,0 45,0 55,0 70,0 75,0 80,0 85,0 90,0 95,0 100,0 0,5 30,5 50,5 70,5 100,5 0,10 10,10 15,10 20,10 30,10 45,10 60,10 70,10 80,10 85,10 90,10 100,10 0,15 10,15 15,15 20,15 30,15 45,15 70,15 80,15 85,15 90,15 100,15 0,20 10,20 15,20 20,20 30,20 55,20 60,20 70,20 80,20 85,20 90,20 100,20 0,25 30,25 50,25 70,25 100,25 0,30 5,30 10,30 15,30 20,30 25,30 30,30 40,30 50,30 60,30 70,30 75,30 80,30 85,30 90,30 95,30 100,30 30,40 50,40 10,45 20,45 25,45 35,45 55,45 65,45 75,45 80,45 85,45 90,45 100,45 0,50 10,50 25,50 30,50 40,50 45,50 70,50 75,50 85,50 90,50 10,55 15,55 20,55 35,55 45,55 50,55 55,55 60,55 65,55 75,55 0,60 25,60 30,60 45,60 50,60 60,60 65,60 70,60 75,60 85,60 90,60 95,60 45,65 50,65 55,65 65,65 75,65 95,65 100,65 0,70 5,70 10,70 15,70 20,70 25,70 30,70 45,70 55,70 60,70 65,70 70,70 75,70 85,70 95,70 100,70 0,75 30,75 45,75 65,75 70,75 75,75 100,75 0,80 10,80 15,80 20,80 30,80 50,80 75,80 100,80 0,85 10,85 15,85 20,85 30,85 50,85 55,85 70,85 75,85 80,85 85,85 95,85 100,85 0,90 10,90 15,90 20,90 30,90 55,90 60,90 65,90 85,90 90,90 95,90 100,90 0,95 30,95 50,95 75,95 100,95 0,100 5,100 10,100 15,100 20,100 25,100 30,100 45,100 50,100 65,100 70,100 80,100 85,100 95,100"
    .split(" ")
    .map((p) => p.split(",").map(Number));

export function QR({ size = 120 }) {
  return (
    <svg className="qr-svg" width={size} height={size} viewBox="-6 -6 117 117" aria-label="Pairing QR code">
      <rect x="-6" y="-6" width="117" height="117" rx="6" fill="#f1f3f7" />
      {QR_RECTS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="#0b0d12" />
      ))}
    </svg>
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
