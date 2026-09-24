// PROTOTYPE B — steps 1–4: Welcome, Why Ghostex, Agents, Workspace.
import { useEffect, useRef, useState } from "react";
import {
  AGENTS,
  AgentIcon,
  GLogo,
  GhostPanel,
  GxWindow,
  Icon,
  Menu,
  Modal,
  OtherGlyphs,
  Toggle,
  WindowCenter,
  Wire,
  Wires,
  at,
  elbow,
  fmtElapsed,
  useNow,
} from "./ui.jsx";

export function Eyebrow({ x, y, children }) {
  return (
    <div className="eyebrow" style={{ position: "absolute", left: x, top: y }}>
      <i />
      {children}
    </div>
  );
}

export function Headline({ x, y, w, size = 50, l1, l2 }) {
  return (
    <h1 className="h1" style={{ position: "absolute", left: x, top: y, width: w, fontSize: size, lineHeight: size * 1.0 + "px" }}>
      {l1}
      {l2 && (
        <>
          <br />
          <span className="h1-2">{l2}</span>
        </>
      )}
    </h1>
  );
}

export function Sub({ x, y, w, children, size = 15 }) {
  return (
    <p className="sub" style={{ position: "absolute", left: x, top: y, width: w, fontSize: size }}>
      {children}
    </p>
  );
}

export function Cta({ style, filled, children, onClick, arrow = true, disabled, className = "" }) {
  return (
    <button type="button" className={"cta " + (filled ? "filled " : "outline ") + className} style={style} onClick={onClick} disabled={disabled}>
      {children}
      {arrow && <Icon n="arrowR" size={18} />}
    </button>
  );
}

/** Node card on the right-hand diagrams. */
function Node({ box, hl, onEnter, onLeave, onClick, children, className = "" }) {
  return (
    <div
      className={"node glass-n " + className + (hl ? " hl" : "")}
      style={box}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════ 01 · Welcome */
const S1_NODES = [
  { id: "claude", box: at(813, 128, 173, 135), from: [901, 263], to: [990, 340] },
  { id: "codex", box: at(1004, 128, 182, 135), from: [1095, 263], to: [1163, 340] },
  { id: "cursor", box: at(1206, 128, 187, 135), from: [1298, 263], to: [1226, 340] },
  { id: "other", box: at(1413, 128, 185, 135), from: [1506, 263], to: [1407, 340] },
];
const S1_FEATS = [
  { id: "persist", icon: "terminal", t: "Persistent sessions", d: ["Pick up where", "you left off"], row: "Powered by ZMX · leave, restart, reconnect", box: at(813, 655, 244, 163), from: [1030, 604], to: [928, 655], tab: "sessions" },
  { id: "browser", icon: "browser", t: "Browser + VS Code", d: ["Full environment", "in your workspace"], row: "Review the actual work", box: at(1085, 655, 234, 163), from: [1199, 604], to: [1199, 655], tab: "files" },
  { id: "mobile", icon: "phone", t: "Desktop + mobile", d: ["Work anywhere,", "stay in sync"], row: "Stay attached anywhere", box: at(1347, 655, 254, 163), from: [1366, 604], to: [1470, 655], tab: "settings" },
];

export function Step1({ go, toast }) {
  const now = useNow(1000);
  const [t0] = useState(() => Date.now() - (8 * 60 + 12) * 1000);
  const [st, setSt] = useState({ claude: "live", codex: "ready", cursor: "ready" });
  const [hov, setHov] = useState(null);
  const [tab, setTab] = useState("workspace");
  const run = fmtElapsed(now - t0);
  const cycle = (id) => setSt((p) => ({ ...p, [id]: p[id] === "live" ? "ready" : "live" }));
  const sub = {
    claude: st.claude === "live" ? `Refactor · running ${run}` : "Refactor · paused",
    codex: st.codex === "live" ? "Tests · running" : "Tests · waiting",
    cursor: st.cursor === "live" ? "Agent session · running" : "Agent session · ready",
  };
  const nodeSt = (id) => (st[id] === "live" ? ["run", "Running"] : id === "codex" ? ["wait", "Waiting"] : ["wait", "Ready"]);
  const winStatus = { claude: st.claude === "live" ? "running" : "ready", codex: st.codex === "live" ? "running" : "waiting", cursor: st.cursor === "live" ? "running" : "ready" };
  const h = (id) => ({ onPointerEnter: () => setHov(id), onPointerLeave: () => setHov(null) });

  return (
    <>
      <Eyebrow x={46} y={114}>Welcome to Ghostex</Eyebrow>
      <Headline x={46} y={139} w={700} l1="Your coding agents." l2="One serious workspace." />
      <Sub x={46} y={248} w={668}>
        Keep Codex, Claude Code, and other CLI agents running side by side — with persistent sessions, a real browser, an editor, and remote access when you
        leave your desk.
      </Sub>

      <div className="glass lcard" style={at(46, 312, 676, 234)}>
        <div className="lcard-head">
          <span className="label">Your agents</span>
          <Menu items={["Rescan agents", "Add an agent…", "Hide finished sessions"]} onPick={(i) => toast(i)} />
        </div>
        {["claude", "codex", "cursor"].map((id) => (
          <div key={id} className={"arow" + (hov === id ? " hl" : "")} {...h(id)}>
            <AgentIcon id={id} size={27} />
            <div className="arow-t">
              <div className="nm">{id === "codex" ? "Codex" : AGENTS[id].name}</div>
              <div className="ss">{sub[id]}</div>
            </div>
            <button type="button" className={"stpill " + (st[id] === "live" ? "live" : "ready")} onClick={() => cycle(id)} title="Click to change status">
              <i />
              {st[id] === "live" ? "LIVE" : "READY"}
            </button>
          </div>
        ))}
        <div className={"arow" + (hov === "other" ? " hl" : "")} {...h("other")}>
          <AgentIcon id="other" size={27} />
          <div className="arow-t">
            <div className="nm">Other agents</div>
            <div className="ss">Choose from 20+ supported CLI agents</div>
          </div>
          <button type="button" className="stpill count" onClick={() => toast("Gemini CLI, Qwen Code, OpenCode and 20+ more")}>
            20+
          </button>
        </div>
      </div>
      <Icon n="arrowD" size={16} className="flow-arrow" style={{ position: "absolute", left: 372, top: 549 }} />

      <div className="glass lcard" style={at(46, 572, 676, 200)}>
        <div className="ws-head">
          <GLogo size={36} />
          <div>
            <div className="nm b">Ghostex workspace</div>
            <div className="ss">Everything around the agents</div>
          </div>
          <Menu items={["What's a workspace?", "Keyboard shortcuts"]} onPick={(i) => toast(i)} />
        </div>
        {S1_FEATS.map((f) => (
          <div key={f.id} className={"frow" + (hov === f.id ? " hl" : "")} {...h(f.id)} onClick={() => setTab(f.tab)}>
            <span className="ibox">
              <Icon n={f.icon} size={17} />
            </span>
            <div>
              <div className="nm">{f.t === "Desktop + mobile" ? "Desktop + mobile" : f.t}</div>
              <div className="ss">{f.row}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="actions" style={{ position: "absolute", left: 46, top: 790 }}>
        <Cta filled style={{ height: 44, padding: "0 20px" }} onClick={() => go(2)}>
          Set up your Ghostex workspace
        </Cta>
        <span className="vbar" />
        <button type="button" className="ghost" onClick={() => go(8)}>
          I already know Ghostex
        </button>
      </div>

      {/* right: agents feed one workspace, which carries three capabilities */}
      <Wires>
        {S1_NODES.map((n, i) => (
          <Wire key={n.id} d={elbow(n.from[0], n.from[1], n.to[0], n.to[1])} ends={[n.from, n.to]} active={hov === n.id} delay={i * 0.7} />
        ))}
        {S1_FEATS.map((f, i) => (
          <Wire key={f.id} d={elbow(f.from[0], f.from[1], f.to[0], f.to[1])} ends={[f.from, f.to]} active={hov === f.id} delay={0.4 + i * 0.8} />
        ))}
      </Wires>
      {S1_NODES.map((n) => {
        const [c, label] = n.id === "other" ? ["none", "20+ agents"] : nodeSt(n.id);
        return (
          <Node key={n.id} box={n.box} hl={hov === n.id} onEnter={() => setHov(n.id)} onLeave={() => setHov(null)} onClick={() => n.id !== "other" && cycle(n.id)} className="agent-node">
            <span className="nicon">
              <AgentIcon id={n.id} size={n.id === "other" ? 30 : 38} />
            </span>
            <div className="nt">{n.id === "codex" ? "Codex" : n.id === "other" ? "Other agents" : AGENTS[n.id].name}</div>
            <div className={"ns " + c}>
              {c !== "none" && <i />}
              {label}
            </div>
          </Node>
        );
      })}
      <GxWindow style={at(846, 340, 716, 264)} tab={tab} onTab={setTab} onMenu={(i) => toast(i)} className={hov && S1_NODES.some((n) => n.id === hov) ? "pulse-in" : ""}>
        <div className="wmain">
          <WindowCenter tab={tab} statuses={winStatus} />
          {tab === "workspace" && <GhostPanel />}
        </div>
      </GxWindow>
      {S1_FEATS.map((f) => (
        <Node key={f.id} box={f.box} hl={hov === f.id} onEnter={() => setHov(f.id)} onLeave={() => setHov(null)} onClick={() => setTab(f.tab)} className="feat-node">
          <span className="fbox">
            <Icon n={f.icon} size={26} />
          </span>
          <div className="nt">{f.t}</div>
          <div className="nd">
            {f.d[0]}
            <br />
            {f.d[1]}
          </div>
        </Node>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════ 02 · Why Ghostex */
const WHY = [
  { id: "multi", k: "01 · Multi-agent", t: "Run several agents at once", d: "Claude on the refactor, Codex on tests, another terminal on the server — organized by project instead of scattered windows." },
  { id: "review", k: "02 · Review", t: "See what the agent is building", d: "Open the embedded Chromium browser, inspect DevTools, review code, Markdown, diffs, and generated docs without leaving the workspace." },
  { id: "persist", k: "03 · Persistence", t: "Your sessions survive the UI", d: "Agent sessions stay attachable. Restart Ghostex, switch machines, search old prompts, and resume where you stopped." },
  { id: "orch", k: "04 · Orchestration", t: "Let agents work together", d: "Claude can launch Codex sub-agents. Work can move through a project board instead of living inside one chat thread." },
  { id: "mobile", k: "05 · Mobile", t: "Walk away without losing control", d: "Check running sessions, reply, or resume from your phone while the actual workload stays on your computer or remote host." },
  { id: "choice", k: "06 · Choice", t: "Use the interface that fits", d: "Terminal when you need raw power. Chat view when you want readability. Browser and IDE when it's time to inspect the result." },
];
const WHY_POS = [
  [48, 308, 353],
  [413, 308, 347],
  [48, 466, 353],
  [413, 466, 347],
  [48, 625, 353],
  [413, 625, 347],
];
const S2_NODES = {
  multi: { box: at(955, 95, 230, 163), t: "Multi-agent", d: ["Run several agents", "at once"], wire: elbow(1068, 258, 1137, 322), ends: [[1068, 258], [1137, 322]] },
  review: { box: at(1230, 95, 210, 163), t: "Review", d: ["See what the agent", "is building"], wire: elbow(1334, 258, 1247, 322), ends: [[1334, 258], [1247, 322]] },
  orch: { box: at(1475, 373, 155, 167), t: "Orchestration", d: ["Let agents work", "together"], wire: "M1435 452H1475", ends: [[1437, 452]] },
  persist: { box: at(880, 646, 164, 166), t: "Persistence", d: ["Your sessions", "survive the UI"], wire: elbow(1032, 590, 958, 646), ends: [[1032, 590], [958, 646]] },
  mobile: { box: at(1083, 646, 181, 166), t: "Mobile", d: ["Walk away without", "losing control"], wire: elbow(1171, 590, 1171, 646), ends: [[1171, 590], [1171, 646]] },
  choice: { box: at(1311, 646, 187, 166), t: "Choice", d: ["Use the interface", "that fits"], wire: elbow(1315, 590, 1405, 646), ends: [[1315, 590], [1405, 646]] },
};

function NodeIcon2({ id }) {
  if (id === "multi")
    return (
      <span className="fbox claude-box">
        <AgentIcon id="claude" size={34} />
      </span>
    );
  if (id === "choice")
    return (
      <span className="fpair">
        <span className="fbox sm">
          <Icon n="terminal" size={22} />
        </span>
        <span className="fbox sm tint">
          <Icon n="grid" size={20} />
        </span>
      </span>
    );
  const n = { review: "review", orch: "org", persist: "database", mobile: "phone" }[id];
  return <Icon n={n} size={46} sw={1.3} className="bigic" />;
}

function FeatureCenter({ id }) {
  const [lens, setLens] = useState("chat");
  if (id === "multi")
    return (
      <div className="fc">
        <div className="fc-t">Three agents, one project</div>
        {[
          ["claude", "Claude Code", "refactor", 72],
          ["codex", "Codex", "tests", 45],
          ["cursor", "Cursor Agent", "tokens", 88],
        ].map(([a, n, w, p]) => (
          <div className="fc-row" key={a}>
            <AgentIcon id={a} size={16} />
            <span className="nm">{n}</span>
            <span className="dim mono">{w}</span>
            <span className="bar">
              <i style={{ width: p + "%" }} />
            </span>
          </div>
        ))}
      </div>
    );
  if (id === "review")
    return (
      <div className="fc">
        <div className="fc-url mono">
          <Icon n="refresh" size={11} /> localhost:3000
        </div>
        <div className="fc-site">
          <b>Build faster</b>
          <i style={{ width: "70%" }} />
          <i style={{ width: "48%" }} />
          <span className="btn">Get started</span>
        </div>
        <div className="fc-console mono">
          <span className="ok">✓</span> console clean · 0 errors · diff +34 −11
        </div>
      </div>
    );
  if (id === "persist")
    return (
      <div className="fc">
        <div className="fc-t">Ghostex restarted 2m ago</div>
        {["refactor-auth", "port-legacy-tests", "tokens-to-css-vars"].map((n) => (
          <div className="fc-row mono" key={n}>
            <span className="dot run" />
            <span className="nm">{n}</span>
            <span className="ok">reattached</span>
          </div>
        ))}
      </div>
    );
  if (id === "orch")
    return (
      <div className="fc fc-orch">
        <div className="fc-chip">
          <AgentIcon id="claude" size={15} /> Claude Code
        </div>
        <span className="fc-link mono">gx new --agent codex</span>
        <div className="fc-chip sub">
          <AgentIcon id="codex" size={15} /> Codex · sub-agent <span className="wait">waiting</span>
        </div>
      </div>
    );
  if (id === "mobile")
    return (
      <div className="fc fc-mobile">
        <div className="phone-mini">
          <div className="mono dim">mini-01 · 18 ms</div>
          <div className="fc-row">
            <span className="dot run" /> refactor-auth
          </div>
          <div className="fc-row">
            <span className="dot wait" /> port-legacy-tests
          </div>
        </div>
        <div className="fc-t">Same live sessions. The work never left your computer.</div>
      </div>
    );
  if (id === "choice")
    return (
      <div className="fc">
        <div className="seg" onClick={(e) => e.stopPropagation()}>
          {["terminal", "chat", "browser"].map((l) => (
            <button type="button" key={l} className={lens === l ? "on" : ""} onClick={() => setLens(l)}>
              {l[0].toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
        {lens === "terminal" && (
          <div className="fc-term mono">
            <div>
              <span className="acc">$</span> claude
            </div>
            <div className="dim">edit src/auth/refresh.ts +34 −11</div>
            <div className="dim">
              run bun test <span className="ok">17 passed</span>
            </div>
          </div>
        )}
        {lens === "chat" && (
          <div className="fc-chat">
            <div className="me">The refresh token races when two tabs wake at once.</div>
            <div className="bot">Serialized the refresh behind a single-flight lock. 17 tests pass.</div>
          </div>
        )}
        {lens === "browser" && (
          <div className="fc-site">
            <b>Signed in</b>
            <i style={{ width: "62%" }} />
            <i style={{ width: "40%" }} />
          </div>
        )}
        <div className="fc-foot">Same session behind every lens.</div>
      </div>
    );
  return null;
}

export function Step2({ go }) {
  const [hov, setHov] = useState(null);
  const [pin, setPin] = useState(null);
  const act = hov ?? pin;
  const bind = (id) => ({
    onPointerEnter: () => setHov(id),
    onPointerLeave: () => setHov(null),
    onClick: () => setPin((p) => (p === id ? null : id)),
  });
  return (
    <>
      <Eyebrow x={48} y={135}>Why Ghostex?</Eyebrow>
      <Headline x={48} y={168} w={760} size={41.5} l1="Codex and Claude are the agents." l2="Ghostex is the workspace around them." />
      <Sub x={48} y={265} w={700}>
        You keep your existing agent subscriptions and CLIs, Ghostex doesn't replace them.
      </Sub>
      {WHY.map((c, i) => {
        const [x, y, w] = WHY_POS[i];
        return (
          <div key={c.id} className={"glass why" + (act === c.id ? " hl" : "") + (pin === c.id ? " pinned" : "")} style={at(x, y, w, 146)} role="button" tabIndex={0} {...bind(c.id)}>
            <div className="why-k">{c.k}</div>
            <div className="why-t">{c.t}</div>
            <div className="why-d">{c.d}</div>
          </div>
        );
      })}
      <Cta style={{ position: "absolute", left: 48, top: 787, height: 48 }} onClick={() => go(3)}>
        Set up my agents
      </Cta>

      <Wires>
        {Object.entries(S2_NODES).map(([id, n], i) => (
          <Wire key={id} d={n.wire} ends={n.ends} active={act === id} delay={i * 0.6} />
        ))}
      </Wires>
      {Object.entries(S2_NODES).map(([id, n]) => (
        <Node key={id} box={n.box} hl={act === id} {...{ onEnter: () => setHov(id), onLeave: () => setHov(null), onClick: () => setPin((p) => (p === id ? null : id)) }} className="why-node">
          <NodeIcon2 id={id} />
          <div className="nt">{n.t}</div>
          <div className="nd">
            {n.d[0]}
            <br />
            {n.d[1]}
          </div>
        </Node>
      ))}
      <GxWindow style={at(866, 322, 569, 268)} tab="workspace" logo={24} sideW={124}>
        <div className="wmain">
          {act ? <FeatureCenter id={act} /> : <WindowCenter tab="workspace" logo={56} />}
          {!act && <GhostPanel />}
        </div>
      </GxWindow>
    </>
  );
}

/* ═══════════════════════════════════════ 03 · Agents */
const SCAN = [
  { t: "Scanning your machine..." },
  { t: "Checking installed CLIs..." },
  { t: "Found Claude Code", ok: true, a: "claude" },
  { t: "Found Codex CLI", ok: true, a: "codex" },
  { t: "Found Cursor Agent", ok: true, a: "cursor" },
  { t: "Scanning for other agents..." },
  { t: "Found 3 more agents", ok: true, a: "other" },
  { t: "Scan complete.", done: true },
];
const OFFS = [0, 1.1, 2.0, 2.4, 3.1, 3.5, 4.2, 4.5];
const hhmmss = (d) => d.toTimeString().slice(0, 8);
const INSTALLS = [
  ["Gemini CLI", "gemini", "npm install -g @google/gemini-cli"],
  ["Qwen Code", "other", "npm install -g @qwen-code/qwen-code"],
  ["OpenCode", "opencode", "curl -fsSL https://opencode.ai/install | bash"],
];

function copy(text, toast) {
  navigator.clipboard?.writeText(text).catch(() => {});
  toast(`Copied ${text}`);
}

export function Step3({ s, set, go, toast }) {
  const [scanId, setScanId] = useState(0);
  const [shown, setShown] = useState(0);
  const [base, setBase] = useState(() => new Date());
  const [guide, setGuide] = useState(false);
  useEffect(() => {
    setShown(0);
    setBase(new Date());
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= SCAN.length) clearInterval(id);
    }, 360);
    return () => clearInterval(id);
  }, [scanId]);
  const scanning = shown < SCAN.length;
  const found = (a) => SCAN.slice(0, shown).some((l) => l.a === a);
  const count = ["claude", "codex", "cursor", "other"].filter(found).length;
  const pick = (a) => set({ defaultAgent: a });

  const LROWS = [
    ["claude", "Installed • uses your Claude account"],
    ["codex", "Installed • uses your ChatGPT account"],
    ["cursor", "Installed • uses your Cursor account"],
  ];
  const RROWS = [
    ["claude", "Claude Code", "~ claude --version"],
    ["codex", "Codex CLI", "~ codex --version"],
    ["cursor", "Cursor Agent", "~ cursor --version"],
  ];
  return (
    <>
      <Eyebrow x={48} y={138}>Agents</Eyebrow>
      <Headline x={48} y={170} w={720} size={49} l1="Use the agents you already have." />
      <Sub x={48} y={236} w={705} size={16}>
        Ghostex can detect installed CLIs. Pick the one you want as your default — you can run the others anytime.
      </Sub>
      <button type="button" className="rescan" style={at(48, 302, 130, 42)} onClick={() => setScanId((n) => n + 1)} disabled={scanning}>
        <Icon n="refresh" size={18} className={scanning ? "spin" : ""} />
        Rescan
      </button>

      <div role="radiogroup" aria-label="Default agent">
        {LROWS.map(([a, sub], i) => (
          <div
            key={a}
            role="radio"
            aria-checked={s.defaultAgent === a}
            tabIndex={0}
            className={"glass arow3" + (s.defaultAgent === a ? " sel" : "") + (found(a) ? "" : " pending")}
            style={at(48, 362 + i * 88, 706, 77)}
            onClick={() => found(a) && pick(a)}
            onKeyDown={(e) => e.key === " " && pick(a)}
          >
            <span className="radio" />
            <span className="abox">
              <AgentIcon id={a} size={34} />
            </span>
            <div className="arow-t">
              <div className="nm lg">{AGENTS[a].name}</div>
              <div className="ss">{sub}</div>
            </div>
            <span className={"detpill" + (found(a) ? "" : " wait")}>{found(a) ? "Detected" : "Scanning…"}</span>
          </div>
        ))}
        <div className="glass arow3 other" style={at(48, 627, 706, 78)} onClick={() => setGuide(true)}>
          <span className="radio off" />
          <span className="abox">
            <OtherGlyphs size={11} />
          </span>
          <div className="arow-t">
            <div className="nm lg">Other agents</div>
            <div className="ss">Pi Agent, OpenCode, Gemini, and more</div>
          </div>
          <button type="button" className="guide-btn">
            Install guide
          </button>
        </div>
      </div>
      <Sub x={48} y={723} w={700} size={13.5}>
        Ghostex supports many CLI agents. Start with one detected agent now; add or configure others anytime from Settings.
      </Sub>
      <Cta style={{ position: "absolute", left: 48, top: 779, height: 47 }} onClick={() => go(4)}>
        Continue with {AGENTS[s.defaultAgent].name}
      </Cta>

      {/* right: live scan */}
      <div className="glass term" style={at(901, 85, 670, 289)}>
        <div className="term-head">
          <span>
            <span className="dimc">$</span> ghostex scan
          </span>
          <span className={"term-state" + (scanning ? "" : " done")}>
            {scanning ? <span className="spinner" /> : <Icon n="checkCircle" size={16} />}
            {scanning ? "Scanning..." : "Complete"}
          </span>
        </div>
        <div className="term-lines">
          {SCAN.slice(0, shown).map((l, i) => (
            <div key={`${scanId}-${i}`} className={"tl" + (l.done ? " done" : "")}>
              <span className="ts">[{hhmmss(new Date(base.getTime() + OFFS[i] * 1000))}]</span>
              <span className="tt">{l.t}</span>
              {l.ok && <Icon n="check" size={17} className="tick" sw={2} />}
            </div>
          ))}
          {scanning && <span className="caret" />}
        </div>
      </div>
      <Icon n="arrowD" size={20} className="flow-arrow" style={{ position: "absolute", left: 1212, top: 396 }} />
      <div className="label wide" style={{ position: "absolute", left: 860, top: 421 }}>
        Detected agents
      </div>
      <div className="count" style={{ position: "absolute", right: 1672 - 1609, top: 421 }}>
        {count} agent{count === 1 ? "" : "s"} detected
      </div>
      {RROWS.map(([a, nm, cmd], i) => (
        <div key={a} className={"glass drow" + (found(a) ? " in" : "") + (s.defaultAgent === a ? " sel" : "")} style={at(862, 449 + i * 79, 747, 71)} onClick={() => found(a) && pick(a)}>
          <span className="abox">
            <AgentIcon id={a} size={34} />
          </span>
          <div className="arow-t">
            <div className="nm lg">{nm}</div>
            <div className="ss mono">{cmd}</div>
          </div>
          <Icon n="checkCircle" size={34} sw={1.4} className="okc" />
          <span className="detpill">{found(a) ? "Detected" : "…"}</span>
          <Menu items={["Set as default", "Copy version command"]} onPick={(it) => (it === "Set as default" ? pick(a) : copy(AGENTS[a].cmd, toast))} />
        </div>
      ))}
      <div className={"glass drow" + (found("other") ? " in" : "")} style={at(862, 687, 747, 73)}>
        <span className="abox wide">
          <OtherGlyphs size={20} />
        </span>
        <div className="arow-t">
          <div className="nm lg">Other agents</div>
          <div className="ss mono">Found 3 more (20+ supported)</div>
        </div>
        <Icon n="checkCircle" size={34} sw={1.4} className="okc" />
        <span className="detpill">{found("other") ? "Detected" : "…"}</span>
        <Menu items={["Open install guide"]} onPick={() => setGuide(true)} />
      </div>
      <div className="glass info" style={at(862, 782, 747, 78)}>
        <Icon n="info" size={30} sw={1.3} className="info-i" />
        <div>
          <div className="nm b">
            {count} agent{count === 1 ? "" : "s"} detected
          </div>
          <div className="ss">{scanning ? "Still scanning your PATH…" : "Choose one on the left to get started."}</div>
        </div>
      </div>

      {guide && (
        <Modal title="Install another agent" onClose={() => setGuide(false)} width={560}>
          <p className="modal-p">Ghostex runs any agent CLI already on your PATH. Install one, then press Rescan.</p>
          <div className="install-list">
            {INSTALLS.map(([n, ic, cmd]) => (
              <div key={n} className="install-row">
                <AgentIcon id={ic} size={18} />
                <span className="nm">{n}</span>
                <code>{cmd}</code>
                <button type="button" className="icon-btn" onClick={() => copy(cmd, toast)} aria-label={`Copy ${n} install command`}>
                  <Icon n="copy" size={15} />
                </button>
              </div>
            ))}
          </div>
          <p className="modal-p dim">20+ more are listed in Settings → Agents.</p>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={() => setGuide(false)}>
              Close
            </button>
            <Cta
              filled
              arrow={false}
              style={{ height: 38, padding: "0 16px", fontSize: 14 }}
              onClick={() => {
                set({ installQueued: true });
                setGuide(false);
                toast("Install guide will open after setup");
              }}
            >
              Open after onboarding
            </Cta>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ═══════════════════════════════════════ 04 · Workspace */
const VIEWS = [
  { id: "browser", icon: "target", t: "Browser", d: "Preview and inspect the app your agent is building." },
  { id: "docs", icon: "list", t: "Docs", d: "Markdown, HTML mockups, diagrams, annotations." },
  { id: "code", icon: "code", t: "Code", d: "VS Code-style editor for source, diffs, and PR review." },
  { id: "kanban", icon: "kanban", t: "Kanban", d: "Hand project tasks directly to agents and orchestrators." },
  { id: "automate", icon: "bolt", t: "Automate", d: "Schedule one-time or recurring agent work." },
];
const RECOMMENDED = { browser: true, docs: true, code: false, kanban: false, automate: false };
const WS_AGENTS = [
  ["claude", "Claude Code", "Building feature...", "run"],
  ["codex", "Codex", "Ready", "run"],
  ["cursor", "Cursor Agent", "Ready", "run"],
  ["other", "Other agents", "20+ agents", "run"],
];

function CodeTile({ on }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setN((x) => (x + 1) % 12), 700);
    return () => clearInterval(id);
  }, [on]);
  const widths = [60, 42, 74, 30, 66, 52, 38, 70, 46, 58];
  return (
    <div className="tile-code mono">
      {widths.map((w, i) => (
        <div key={i}>
          <span className="ln">{i + 1}</span>
          <i style={{ width: (i < n || !on ? w : 0) + "%" }} className={i % 3 === 1 ? "b" : i % 4 === 2 ? "g" : ""} />
          {on && i === Math.min(n, 9) && <span className="cur" />}
        </div>
      ))}
    </div>
  );
}

function KanbanTile({ on }) {
  const [moved, setMoved] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setMoved((m) => (m + 1) % 3), 1800);
    return () => clearInterval(id);
  }, [on]);
  const todo = 3 - moved,
    prog = 2 + moved;
  return (
    <div className="tile-kan">
      <div>
        <span className="kh">
          To do <b>{todo}</b>
        </span>
        {Array.from({ length: Math.min(todo, 2) }).map((_, i) => (
          <span key={i} className="kc">
            <i className="p" />
            <em />
          </span>
        ))}
      </div>
      <div>
        <span className="kh">
          In progress <b>{prog}</b>
        </span>
        {Array.from({ length: Math.min(prog, 2) }).map((_, i) => (
          <span key={i} className={"kc" + (i === 1 && moved ? " new" : "")}>
            <i className={i ? "g" : "p"} />
            <em />
          </span>
        ))}
      </div>
    </div>
  );
}

function AutomateTile({ on }) {
  const now = useNow(1000);
  const left = 59 - (Math.floor(now / 1000) % 60);
  return (
    <div className="tile-auto">
      {["Nightly deps bump", "Weekly triage", "One-time: release notes"].map((n, i) => (
        <div key={n} className="ar">
          <span className={"ad" + (i === 0 ? " on" : "")} />
          <span className="an">{on ? n : ""}</span>
          <i style={{ width: [70, 52, 60][i] + "%" }} />
        </div>
      ))}
      {on && <div className="anext mono">next run in 00:{String(left).padStart(2, "0")}</div>}
    </div>
  );
}

export function Step4({ s, set, go, toast }) {
  const [sel, setSel] = useState("claude");
  const [signed, setSigned] = useState(false);
  const [saved, setSaved] = useState(false);
  const v = s.views;
  const flip = (id) => set((p) => ({ views: { ...p.views, [id]: !p.views[id] } }));
  const isRec = Object.keys(RECOMMENDED).every((k) => RECOMMENDED[k] === v[k]);
  const selA = WS_AGENTS.find((a) => a[0] === sel);
  useEffect(() => {
    if (!signed) return;
    const id = setTimeout(() => setSigned(false), 2600);
    return () => clearTimeout(id);
  }, [signed]);

  return (
    <>
      <Eyebrow x={60} y={132}>Workspace</Eyebrow>
      <Headline x={60} y={160} w={660} size={50} l1="Choose what lives next" l2="to your agents." />
      <Sub x={60} y={268} w={640} size={16}>
        These are workspace views, not permissions. Start lean; anything you hide remains available in Settings.
      </Sub>
      <button type="button" className={"rec-chip" + (isRec ? " on" : "")} style={at(60, 326, undefined, 40)} onClick={() => set({ views: { ...RECOMMENDED } })}>
        <Icon n="checkCircle" size={18} />
        Recommended · Browser + Docs
      </button>
      {VIEWS.map((r, i) => (
        <div key={r.id} className={"glass vrow" + (v[r.id] ? " on" : "")} style={at(60, 383 + i * 77.7, 632, 69)} onClick={() => flip(r.id)} role="switch" aria-checked={v[r.id]} tabIndex={0}>
          <Icon n={r.icon} size={22} className="vicon" />
          <div>
            <div className="nm lg">{r.t}</div>
            <div className="ss">{r.d}</div>
          </div>
          <Toggle on={v[r.id]} onClick={() => flip(r.id)} label={r.t} />
        </div>
      ))}
      <Cta filled style={{ position: "absolute", left: 60, top: 781, height: 50, padding: "0 22px", fontSize: 17 }} onClick={() => go(5)}>
        Continue
      </Cta>

      {/* right: the workspace mirrors the toggles */}
      <div className="glass wswin" style={at(758, 116, 875, 720)} />
      <div className="wsbar" style={at(758, 116, 875, 54)}>
        <span className="lights">
          <i />
          <i />
          <i />
        </span>
        <GLogo size={32} />
        <span className="wst">Ghostex workspace</span>
        <span className="ws-agent">
          <span className="abox xs">
            <AgentIcon id={sel} size={20} />
          </span>
          <span>
            <b>{selA[1]}</b>
            <em>
              <i />
              {sel === "claude" ? "Running" : "Ready"}
            </em>
          </span>
        </span>
        <Menu items={["New session", "Split right", "Settings"]} onPick={(i) => toast(i)} />
      </div>
      <div className="wscol" style={at(760, 182, 200, 640)}>
        <div className="wscol-h">
          Agents
          <button type="button" className="icon-btn" onClick={() => toast("New agent session")} aria-label="New agent session">
            <Icon n="plus" size={16} />
          </button>
        </div>
        {WS_AGENTS.map(([id, nm, st]) => (
          <button type="button" key={id} className={"wsa" + (sel === id ? " on" : "")} onClick={() => setSel(id)}>
            <span className="abox sm">
              <AgentIcon id={id} size={id === "other" ? 18 : 22} />
            </span>
            <span>
              <b>{nm}</b>
              <em>
                <i />
                {st}
              </em>
            </span>
          </button>
        ))}
      </div>

      <div className={"pane" + (v.browser ? "" : " off")} style={at(972, 182, 425, 361)}>
        <div className="pane-h">
          <Toggle size="sm" on={v.browser} onClick={() => flip("browser")} label="Browser" />
          <span className="pt">Browser</span>
          <button type="button" className="icon-btn" onClick={() => toast("Opens the browser in a split pane")} aria-label="Pop out">
            <Icon n="external" size={15} />
          </button>
          <Menu items={["Reload", "Open DevTools", "Split right"]} onPick={(i) => toast(i)} />
        </div>
        <div className="urlbar mono">
          <Icon n="arrowL" size={12} />
          <Icon n="arrowR" size={12} />
          <Icon n="refresh" size={12} />
          <span>http://localhost:3000</span>
        </div>
        <div className="site">
          <div className="site-nav">
            <span className="acme">
              <b>A</b> Acme
            </span>
            <span>Product</span>
            <span>Docs</span>
            <span>Pricing</span>
            <span className="signin">Sign in</span>
          </div>
          <div className="site-h">
            {signed ? "You're in." : "Build faster"}
            <br />
            {signed ? "Welcome to Acme." : "with AI agents."}
          </div>
          <div className="site-s">From idea to production, together.</div>
          <button type="button" className="site-btn" onClick={() => (setSigned(true), toast("Your agent saw the click in DevTools"))}>
            Get started <Icon n="arrowR" size={13} />
          </button>
          <div className="site-deco">
            <span className="lights sm">
              <i />
              <i />
              <i />
            </span>
            <i />
            <i />
            <i />
          </div>
        </div>
        {!v.browser && <span className="off-chip">Hidden · available in Settings</span>}
      </div>

      <div className={"pane" + (v.docs ? "" : " off")} style={at(972, 556, 425, 274)}>
        <div className="pane-h">
          <span className="abox xs">
            <Icon n="list" size={15} />
          </span>
          <span className="pt">Docs</span>
          <button type="button" className={"edit-chip" + (saved ? " saved" : "")} onClick={() => setSaved((x) => !x)}>
            {saved ? (
              <>
                <Icon n="check" size={12} /> Saved
              </>
            ) : (
              "Editing..."
            )}
          </button>
          <button type="button" className="icon-btn" onClick={() => toast("Opens the doc in a split pane")} aria-label="Pop out">
            <Icon n="external" size={15} />
          </button>
          <Menu items={["Send annotations to agent", "Export HTML"]} onPick={(i) => toast(i)} />
        </div>
        <div className="doc">
          <div className="doc-h">Project plan</div>
          <div className="doc-p">An overview of the architecture, key components, and next steps for the agent-driven application.</div>
          <div className="doc-s">System diagram</div>
          <svg className="doc-svg" width="425" height="274" viewBox="0 0 425 274">
            <path
              d="M104 208H146M226 208H240Q250 208 250 198V183.5Q250 173.5 260 173.5H271M240 208Q250 208 250 218V219.5Q250 229.5 260 229.5H271"
              fill="none"
              stroke="rgba(150,170,230,.45)"
              strokeWidth="1.2"
            />
          </svg>
          <div className="dnode" style={{ left: 36, top: 173, width: 68, height: 70 }}>
            <Icon n="users" size={16} />
            User
          </div>
          <div className="dnode agent" style={{ left: 146, top: 183, width: 80, height: 50 }}>
            Agent
          </div>
          <div className="dnode row" style={{ left: 271, top: 151, width: 122, height: 45 }}>
            <Icon n="kanban" size={15} />
            Browser
          </div>
          <div className="dnode row" style={{ left: 271, top: 207, width: 122, height: 45 }}>
            <Icon n="file" size={15} />
            Docs
          </div>
        </div>
        {!v.docs && <span className="off-chip">Hidden · available in Settings</span>}
      </div>

      <div className={"tile" + (v.code ? " on" : "")} style={at(1410, 182, 212, 218)} onClick={() => flip("code")}>
        <div className="tile-h">
          <Icon n="code" size={20} />
          Code
        </div>
        <CodeTile on={v.code} />
      </div>
      <div className={"tile" + (v.kanban ? " on" : "")} style={at(1410, 412, 212, 188)} onClick={() => flip("kanban")}>
        <div className="tile-h">
          <Icon n="kanban" size={20} />
          Kanban
        </div>
        <KanbanTile on={v.kanban} />
      </div>
      <div className={"tile" + (v.automate ? " on" : "")} style={at(1410, 615, 212, 215)} onClick={() => flip("automate")}>
        <div className="tile-h">
          <Icon n="bolt" size={20} />
          Automate
        </div>
        <AutomateTile on={v.automate} />
      </div>
    </>
  );
}
