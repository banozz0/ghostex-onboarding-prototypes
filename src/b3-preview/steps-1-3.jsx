// PROTOTYPE B3 — panels 1–3: What Ghostex can do, Your agents, Workspace.
import { Fragment, useEffect, useRef, useState } from "react";
import { AGENTS, AgentIcon, Icon, InstallGuide, OtherStrip, at } from "./ui.jsx";
import { ChatTerminalDemo, DesktopMobileDemo, TogetherDemo } from "./demos.jsx";
import { WorkspaceWindow } from "./workspace.jsx";
import { ComputerUsePreview, IntegrationPreview, PreviewModal, TileState, ViewPreview, opens } from "./previews.jsx";

export function Eyebrow({ x, y, children, w }) {
  return (
    <div className={"eyebrow" + (w ? " center" : "")} style={{ position: "absolute", left: x, top: y, width: w }}>
      <i />
      {children}
    </div>
  );
}

export function Headline({ x, y, w, size = 50, l1, l2, center }) {
  return (
    <h1
      className={"h1" + (center ? " center" : "")}
      style={{ position: "absolute", left: x, top: y, width: w, fontSize: size, lineHeight: size * 1.0 + "px" }}
    >
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

export function Sub({ x, y, w, children, size = 15, center }) {
  return (
    <p className={"sub" + (center ? " center" : "")} style={{ position: "absolute", left: x, top: y, width: w, fontSize: size }}>
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

/* ═══════════════════════════════════════ 01 · What Ghostex can do */
// One sentence per tab. The subtitle carries "your agents", so no tab repeats it and no agent is named here.
const TABS = [
  { id: "together", icon: "org", t: "Agents that work together", d: "One agent can launch and hand work to another." },
  { id: "chat", icon: "chat", t: "Chat + terminal", d: "Read it as a chat, the real CLI runs underneath." },
  { id: "mobile", icon: "phone", t: "Desktop + mobile", d: "Always-on sessions, pick up anywhere." },
];
const DEMOS = { together: TogetherDemo, chat: ChatTerminalDemo, mobile: DesktopMobileDemo };

export function Step1({ go }) {
  const [sel, setSel] = useState("together");
  const [hov, setHov] = useState(null);
  const Demo = DEMOS[sel];

  return (
    <>
      <Eyebrow x={46} y={114}>Welcome to Ghostex</Eyebrow>
      <Headline x={46} y={139} w={700} l1="Your coding agents." l2="One serious workspace." />
      <Sub x={46} y={264} w={640}>
        Use your own subscriptions or API keys with 20+ supported agents, Ghostex is the workspace around them.
      </Sub>

      <div className="glass tabcard" style={at(46, 348, 676, 312)} role="tablist" aria-label="What Ghostex can do">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            role="tab"
            aria-selected={sel === t.id}
            className={"tabrow" + (hov === t.id ? " hl" : "") + (sel === t.id ? " sel" : "")}
            onClick={() => setSel(t.id)}
            onPointerEnter={() => setHov(t.id)}
            onPointerLeave={() => setHov(null)}
          >
            <span className="ibox lg">
              <Icon n={t.icon} size={20} />
            </span>
            <span className="tabrow-t">
              <span className="nm lg">{t.t}</span>
              <span className="ss">{t.d}</span>
            </span>
            <Icon n="chevR" size={16} className="tabrow-c" />
          </button>
        ))}
      </div>

      <div className="actions" style={{ position: "absolute", left: 46, top: 700 }}>
        <Cta filled style={{ height: 44, padding: "0 20px" }} onClick={() => go(2)}>
          Set up your Ghostex workspace
        </Cta>
        <span className="vbar" />
        <button type="button" className="ghost" onClick={() => go(5)}>
          I already know Ghostex
        </button>
      </div>

      {/* right: just the selected tab's demo; picking a tab remounts it so its loop starts over */}
      <Demo key={sel} />
    </>
  );
}

/* ═══════════════════════════════════════ 02 · Your agents */
const SCAN = [
  { t: "Starting the scan..." },
  { t: "Checking installed agent CLIs..." },
  { t: "Found Claude Code", ok: true, a: "claude" },
  { t: "Found Codex", ok: true, a: "codex" },
  { t: "Found Cursor Agent", ok: true, a: "cursor" },
  { t: "Looking for other agents..." },
  { t: "Found 3 more agents", ok: true, a: "other" },
  { t: "Scan complete.", done: true },
];
const OFFS = [0, 1.1, 2.0, 2.4, 3.1, 3.5, 4.2, 4.5];
const hhmmss = (d) => d.toTimeString().slice(0, 8);
const S2_ROWS = ["claude", "codex", "cursor"];
// Connect covers every detected agent, the three rows plus the others the scan found.
const CONNECT = ["Claude Code", "Codex", "Cursor Agent", "3 more agents"];
const PHASES = [
  ["search", "Searching"],
  ["found", "Found"],
  ["connected", "Connected"],
];
const CU_LINE = { id: "cu", t: "Computer Use: waiting for your permission", cls: "wait" };
// What switching each one on does, shown in its popup beside the live preview.
const INTEGRATION_TERMS = [
  ["What's added", "A small Ghostex helper in each agent's own settings."],
  ["What you get", "Live status, alerts, session names, the chat view and resume."],
  ["Your agent", "Still runs as its normal CLI, and nothing goes through a Ghostex cloud."],
  ["To remove it", "Settings → Agents, one agent or all at once."],
];
const CU_TERMS = [
  ["What's added", "A Computer Use skill for your agents and a small helper app."],
  ["What agents can do", "Click, type and read other apps when a task needs it."],
  ["To turn it off", "Settings → Integrations, any time."],
];

export function Step2({ s, set, go, toast }) {
  const [scanId, setScanId] = useState(0);
  const [shown, setShown] = useState(0);
  const [base, setBase] = useState(() => new Date());
  const [guide, setGuide] = useState(false);
  const [pv, setPv] = useState(null); // the open preview: "integration" | "cu"
  const [connecting, setConnecting] = useState(0);
  // Console lines added after the scan: default pick, connects, Computer Use.
  const [log, setLog] = useState(() => (s.computerUse === "on" ? [{ ...CU_LINE, at: new Date() }] : []));
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    setShown(0);
    setBase(new Date());
    setLog((l) => l.filter((x) => x.id === "cu"));
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
  const live = s.integration;
  const conn = live && (s.connected || connecting >= CONNECT.length);
  const cu = s.computerUse === "on";
  const addLine = (line) => setLog((l) => [...l.filter((x) => x.id !== line.id), { ...line, at: new Date() }]);
  const pick = (a) => {
    if (a !== s.defaultAgent) addLine({ id: "default", t: `${AGENTS[a].short} set as your default`, cls: "acc" });
    set({ defaultAgent: a, startWith: a });
  };
  const pill = (a, i) => {
    if (conn || (live && connecting > i)) return ["detpill on", "Connected"];
    if (found(a)) return ["detpill", "Detected"];
    return ["detpill wait", "Scanning…"];
  };
  const connect = () => {
    if (!live || conn) return go(3);
    CONNECT.forEach((n, k) =>
      timers.current.push(
        setTimeout(() => {
          addLine({ id: "c" + k, t: `Connected ${n}`, cls: "ok" });
          setConnecting(k + 1);
          if (k === CONNECT.length - 1) {
            set({ connected: true });
            timers.current.push(setTimeout(() => go(3), 1200));
          }
        }, 300 * (k + 1)),
      ),
    );
  };
  // "here" marks where the flow stands: Found once the scan is done, Connected once every agent is.
  const phase = {
    search: scanning ? "active" : "done",
    found: scanning ? "idle" : conn || connecting > 0 ? "done" : "here",
    connected: conn ? "here" : connecting > 0 ? "active" : "idle",
  };
  const cuOn = () => {
    set({ computerUse: "on" });
    addLine(CU_LINE);
    toast("Computer Use is on. Your computer will ask for permission.");
  };
  const cuOff = () => {
    set({ computerUse: "off" });
    setLog((l) => l.filter((x) => x.id !== "cu"));
  };

  return (
    <>
      <Eyebrow x={48} y={120}>Agents</Eyebrow>
      <Headline x={48} y={150} w={720} size={46} l1="Use the agents you already have." />
      <Sub x={48} y={212} w={720} size={16}>
        Ghostex finds the agents already installed and asks which one should be your default.
      </Sub>

      <div role="radiogroup" aria-label="Default agent">
        {S2_ROWS.map((a, i) => {
          const [cls, label] = pill(a, i);
          return (
            <div
              key={a}
              role="radio"
              aria-checked={s.defaultAgent === a}
              tabIndex={0}
              className={"glass arow3" + (s.defaultAgent === a ? " sel" : "") + (found(a) ? "" : " pending")}
              style={at(48, 264 + i * 76, 706, 68)}
              onClick={() => found(a) && pick(a)}
              onKeyDown={(e) => e.key === " " && found(a) && pick(a)}
            >
              <span className="radio" />
              <span className="abox">
                <AgentIcon id={a} size={28} />
              </span>
              <div className="arow-t">
                <div className="nm lg">{AGENTS[a].short}</div>
                <div className="ss">{AGENTS[a].note}</div>
              </div>
              <span className={cls}>{label}</span>
            </div>
          );
        })}
        <div className="glass arow3 other" style={at(48, 492, 706, 68)} onClick={() => setGuide(true)}>
          <span className="radio off" />
          <span className="abox wide">
            <OtherStrip size={19} />
          </span>
          <div className="arow-t">
            <div className="nm lg">Other agents</div>
            <div className="ss">Pi Agent, OpenCode, Gemini, and more.</div>
          </div>
          <button type="button" className="guide-btn">
            Install guide
          </button>
        </div>
      </div>

      <div className={"glass vrow xtile" + (live ? " on" : "")} style={at(48, 576, 706, 72)} {...opens(() => setPv("integration"))}>
        <Icon n="pulse" size={22} className="vicon" />
        <div>
          <div className="nm lg">Ghostex integration</div>
          <div className="ss">Adds a small Ghostex helper to each agent's own settings, so you see its live status and can resume it.</div>
        </div>
        <TileState on={live} />
      </div>
      <div className={"glass curow xtile" + (cu ? " on" : "")} style={at(48, 660, 706, 72)} {...opens(() => setPv("cu"))}>
        <Icon n="monitor" size={22} className="vicon" />
        <div>
          <div className="nm lg">Computer Use</div>
          <div className="ss">Let agents use apps outside Ghostex, off until you allow it.</div>
        </div>
        <TileState on={cu} extra={cu ? <span className="perm-pill">Needs OS permission</span> : null} />
      </div>

      <div className="actions" style={{ position: "absolute", left: 48, top: 756 }}>
        <Cta filled style={{ height: 46, padding: "0 20px" }} onClick={connect} disabled={scanning || connecting > 0}>
          {!live || conn ? "Continue" : connecting > 0 ? "Connecting…" : "Connect & continue"}
        </Cta>
        {live && !conn && (
          <button type="button" className="ghost" style={{ marginLeft: 24 }} onClick={() => go(3)}>
            Skip for now
          </button>
        )}
      </div>

      {/* right: the scan console, and a tracker that follows it */}
      <div className="glass term" style={at(885, 128, 700, 486)}>
        <div className="term-head">
          <span>Looking for agents</span>
          <span className={"term-state" + (scanning ? "" : " done")}>
            {scanning ? <span className="spinner" /> : <Icon n="checkCircle" size={16} />}
            {scanning ? "Scanning..." : "Complete"}
          </span>
          <button type="button" className="rescan" onClick={() => setScanId((n) => n + 1)} disabled={scanning || connecting > 0}>
            <Icon n="refresh" size={15} className={scanning ? "spin" : ""} />
            Rescan
          </button>
        </div>
        <div className="term-lines">
          {SCAN.slice(0, shown).map((l, i) => (
            <div key={`${scanId}-${i}`} className={"tl" + (l.done ? " done" : "") + (l.a && l.a === s.defaultAgent ? " hot" : "")}>
              <span className="ts">[{hhmmss(new Date(base.getTime() + OFFS[i] * 1000))}]</span>
              <span className="tt">{l.t}</span>
              {l.ok && <Icon n="check" size={17} className="tick" sw={2} />}
            </div>
          ))}
          {!scanning &&
            log.map((l) => (
              <div key={l.id + l.at.getTime()} className={"tl extra " + l.cls}>
                <span className="ts">[{hhmmss(l.at)}]</span>
                <span className="tt">{l.t}</span>
              </div>
            ))}
          {scanning && <span className="caret" />}
        </div>
      </div>
      <div className="track" style={at(900, 652, 670, 60)} aria-label="Progress">
        {PHASES.map(([id, label], i) => (
          <Fragment key={id}>
            {i > 0 && <span className={"track-seg" + (phase[id] !== "idle" ? " on" : "")} />}
            <div className={"track-chip " + phase[id]} data-phase={id}>
              {phase[id] === "active" ? <span className="spinner" /> : phase[id] === "idle" ? <span className="track-o" /> : <Icon n="checkCircle" size={20} sw={1.7} />}
              {label}
            </div>
          </Fragment>
        ))}
      </div>

      {guide && (
        <InstallGuide
          toast={toast}
          onClose={() => setGuide(false)}
          onLater={() => {
            set({ installQueued: true });
            setGuide(false);
            toast("Install guide will open after setup");
          }}
        />
      )}
      {pv === "integration" && (
        <PreviewModal
          title="Ghostex integration"
          lead="Ghostex adds a small helper to each agent's own settings, so it can show what every agent is doing."
          terms={INTEGRATION_TERMS}
          onClose={() => setPv(null)}
          switches={[
            {
              label: "Ghostex integration",
              note: !live ? "Off: your agents run as plain terminals." : conn ? "On: every detected agent is connected." : "On: Connect & continue adds it to every detected agent.",
              on: live,
              onChange: () => set({ integration: !live }),
            },
          ]}
        >
          <IntegrationPreview on={live} />
        </PreviewModal>
      )}
      {pv === "cu" && (
        <PreviewModal
          title="Computer Use"
          lead="This hands over the whole machine: supported agents can see your screen and drive apps outside Ghostex."
          terms={CU_TERMS}
          onClose={() => setPv(null)}
          switches={[
            {
              label: "Allow Computer Use",
              note: cu ? "On: your computer will ask for permission next." : "Off until you allow it.",
              on: cu,
              onChange: () => (cu ? cuOff() : cuOn()),
            },
          ]}
        >
          <ComputerUsePreview on={cu} />
        </PreviewModal>
      )}
    </>
  );
}

/* ═══════════════════════════════════════ 03 · Workspace */
const VIEWS = [
  { id: "browser", icon: "target", t: "Browser", d: "Preview and inspect the app your agent is building." },
  { id: "docs", icon: "list", t: "Docs", d: "Markdown, mockups, diagrams and annotations." },
  { id: "code", icon: "code", t: "Code", d: "VS Code, built in: source, diffs and review." },
  { id: "kanban", icon: "kanban", t: "Kanban", d: "Split work into cards and hand each one to an agent." },
  { id: "automate", icon: "bolt", t: "Automate", d: "Run agents on a schedule, once or on repeat." },
];
// Recommended only ever adds these two; views already on stay on. Docs first so Browser ends up the shown tab.
const REC = ["docs", "browser"];
// Panel 3 left column: five equal tiles now that the browser skill lives in Browser's popup.
const TILE_Y = { browser: 340, docs: 418, code: 496, kanban: 574, automate: 652 };
// What switching each view on does, shown in its popup. The real app switches these in Settings → Extensions.
const HIDE = ["To hide it", "Settings → Extensions, any time."];
const VIEW_TERMS = {
  browser: [
    ["Adds", "A Browser tab in the titlebar, next to Agents."],
    ["Browser skill", "Agents can open pages, click, type, read the page and take screenshots. It has its own switch."],
    ["How to use it", "Ask your agent to use the browser skill."],
    HIDE,
  ],
  docs: [["Adds", "A Docs tab in the titlebar."], ["Good for", "Plans, mockups and diagrams your agents write, with room for your annotations."], HIDE],
  code: [["Adds", "A Code tab: VS Code, built in."], ["Good for", "Reading source and reviewing the diffs your agents make."], ["Runs", "VS Code on this computer, inside Ghostex."], HIDE],
  kanban: [
    ["Adds", "A Kanban tab with a board of cards."],
    ["Good for", "Splitting work into cards and handing each one to an agent."],
    ["Needs", "The Beads command-line tool (bd) installed on this computer."],
    HIDE,
  ],
  automate: [
    ["Adds", "An Automate tab."],
    ["Good for", "Running agents on a schedule, once or on repeat."],
    ["Heads-up", "Scheduled runs start agents while you are away, on your own subscriptions."],
    HIDE,
  ],
};

export function Step3({ s, set, go, toast }) {
  const [sel, setSel] = useState("claude");
  const [active, setActive] = useState("browser");
  // Views in the order they were ticked, so switching one off falls back to the one ticked before it.
  const [hist, setHist] = useState(["docs", "browser"]);
  const [pv, setPv] = useState(null); // the view whose preview is open
  const v = s.views;
  const drive = v.browser && s.browserUse;
  const isRec = REC.every((id) => v[id]);
  const current = active === "agents" || v[active] ? active : ([...hist].reverse().find((id) => v[id]) ?? "agents");
  const flip = (id) => {
    const on = !v[id];
    set((p) => ({ views: { ...p.views, [id]: on } }));
    if (on) {
      setHist((h) => [...h.filter((x) => x !== id), id]);
      setActive(id);
    }
  };
  const recommend = () => {
    const added = REC.filter((id) => !v[id]);
    if (!added.length) return;
    set((p) => ({ views: { ...p.views, ...Object.fromEntries(added.map((id) => [id, true])) } }));
    setHist((h) => [...h.filter((id) => !added.includes(id)), ...added]);
    setActive(added[added.length - 1]);
  };
  const open = VIEWS.find((r) => r.id === pv);

  return (
    <>
      <Eyebrow x={60} y={118}>Workspace</Eyebrow>
      <Headline x={60} y={144} w={640} size={46} l1="Choose what lives next" l2="to your agents." />
      <Sub x={60} y={250} w={632} size={16}>
        Start lean; anything you hide stays available in Settings.
      </Sub>
      <button type="button" className={"rec-chip" + (isRec ? " on" : "")} style={at(60, 290, undefined, 38)} onClick={recommend}>
        <Icon n="checkCircle" size={18} />
        Recommended · Browser + Docs
      </button>

      {VIEWS.map((r) => (
        <div key={r.id} className={"glass vrow xtile" + (v[r.id] ? " on" : "")} style={at(60, TILE_Y[r.id], 632, 68)} {...opens(() => setPv(r.id))}>
          <Icon n={r.icon} size={22} className="vicon" />
          <div>
            <div className="nm lg">{r.t}</div>
            <div className="ss">{r.d}</div>
          </div>
          <TileState on={v[r.id]} extra={r.id === "browser" && drive ? <span className="wtab-badge">skill on</span> : null} />
        </div>
      ))}

      <Cta filled style={{ position: "absolute", left: 60, top: 758, height: 46, padding: "0 22px" }} onClick={() => go(4)}>
        Continue
      </Cta>

      {/* right: the workspace, one titlebar tab per view that is on */}
      <WorkspaceWindow
        views={v}
        drive={drive}
        current={current}
        onTab={setActive}
        sel={sel}
        onAgent={(id) => {
          setSel(id);
          setActive("agents");
        }}
        toast={toast}
      />

      {open && (
        <PreviewModal
          title={open.t}
          lead={open.d}
          terms={VIEW_TERMS[open.id]}
          onClose={() => setPv(null)}
          switches={[
            {
              label: `${open.t} tab`,
              note: v[open.id] ? "On: it sits in your titlebar, next to Agents." : "Off: no tab in your titlebar.",
              on: v[open.id],
              onChange: () => flip(open.id),
            },
            ...(open.id === "browser"
              ? [
                  {
                    label: "Give agents the browser skill",
                    note: !v.browser ? "Needs the Browser tab." : drive ? "On: agents can drive this browser." : "Off: agents can't touch the browser.",
                    on: drive,
                    disabled: !v.browser,
                    onChange: () => set({ browserUse: !s.browserUse }),
                  },
                ]
              : []),
          ]}
        >
          <ViewPreview id={open.id} views={v} drive={drive} toast={toast} />
        </PreviewModal>
      )}
    </>
  );
}
