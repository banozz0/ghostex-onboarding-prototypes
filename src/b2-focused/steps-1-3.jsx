// PROTOTYPE B2 — panels 1–3: What Ghostex can do, Your agents, Workspace.
import { Fragment, useEffect, useRef, useState } from "react";
import { AGENTS, AgentIcon, HowItWorks, Icon, InstallGuide, Modal, OtherStrip, Toggle, at } from "./ui.jsx";
import { ChatTerminalDemo, DesktopMobileDemo, TogetherDemo } from "./demos.jsx";
import { WorkspaceWindow } from "./workspace.jsx";

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
const HIW_INTEGRATION = [
  ["What's added", "A small Ghostex helper in each agent's own settings."],
  ["What you get", "Live status, alerts, session names, the chat view and resume."],
  ["Your agent", "Still runs as its normal CLI, and nothing goes through a Ghostex cloud."],
  ["To remove it", "Settings → Agents, one agent or all at once."],
];
const HIW_CU = [
  ["What's added", "A Computer Use skill for your agents and a small helper app."],
  ["Your computer asks", "For Accessibility and Screen Recording, once."],
  ["What agents can do", "Click, type and read other apps when a task needs it."],
  ["To turn it off", "Settings → Integrations, any time."],
];

export function Step2({ s, set, go, toast }) {
  const [scanId, setScanId] = useState(0);
  const [shown, setShown] = useState(0);
  const [base, setBase] = useState(() => new Date());
  const [guide, setGuide] = useState(false);
  const [confirm, setConfirm] = useState(false);
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

      <div className="glass vrow" style={at(48, 576, 706, 72)} onClick={() => set({ integration: !s.integration })}>
        <Icon n="pulse" size={22} className="vicon" />
        <div>
          <div className="nm lg">
            Ghostex integration
            <HowItWorks title="How the Ghostex integration works" items={HIW_INTEGRATION} pop={[250, 360, 420]} />
          </div>
          <div className="ss">Adds a small Ghostex helper to each agent's own settings, so you see its live status and can resume it.</div>
        </div>
        <Toggle on={s.integration} onClick={() => set({ integration: !s.integration })} label="Ghostex integration" />
      </div>
      <div className={"glass curow" + (cu ? " on" : "")} style={at(48, 660, 706, 72)} onClick={() => (cu ? cuOff() : setConfirm(true))}>
        <Icon n="monitor" size={22} className="vicon" />
        <div>
          <div className="nm lg">
            Computer Use
            <HowItWorks title="How Computer Use works" items={HIW_CU} pop={[230, 446, 420]} />
          </div>
          <div className="ss">Let agents use apps outside Ghostex, off until you allow it.</div>
        </div>
        {cu && <span className="perm-pill">Needs OS permission</span>}
        <Toggle size="md" on={cu} onClick={() => (cu ? cuOff() : setConfirm(true))} label="Computer Use" />
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
      {confirm && (
        <Modal title="Turn on Computer Use?" onClose={() => setConfirm(false)} width={470}>
          <p className="modal-p">
            This hands over the whole machine: supported agents can see your screen and drive apps outside Ghostex. Your computer will ask for accessibility and screen
            recording next.
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={() => setConfirm(false)}>
              Keep it off
            </button>
            <Cta
              filled
              arrow={false}
              style={{ height: 38, padding: "0 18px", fontSize: 14 }}
              onClick={() => {
                set({ computerUse: "on" });
                addLine(CU_LINE);
                setConfirm(false);
                toast("Computer Use is on. Your computer will ask for permission.");
              }}
            >
              Allow
            </Cta>
          </div>
        </Modal>
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
const RECOMMENDED = { browser: true, docs: true, code: false, kanban: false, automate: false };
// Panel 3 left column: Browser is taller because it owns the nested browser-skill row.
const ROW_Y = { docs: 464, code: 532, kanban: 600, automate: 668 };
const HIW_BROWSER = [
  ["What's added", "The Ghostex browser skill, installed into your agents."],
  ["What agents can do", "Open pages, click, type, read the page and take screenshots."],
  ["How to use it", "Ask your agent to use the browser skill."],
  ["To remove it", "Settings → Integrations."],
];

export function Step3({ s, set, go, toast }) {
  const [sel, setSel] = useState("claude");
  const [active, setActive] = useState("browser");
  // Views in the order they were ticked, so switching one off falls back to the one ticked before it.
  const [hist, setHist] = useState(["docs", "browser"]);
  const v = s.views;
  const drive = v.browser && s.browserUse;
  const isRec = Object.keys(RECOMMENDED).every((k) => RECOMMENDED[k] === v[k]);
  const current = active === "agents" || v[active] ? active : ([...hist].reverse().find((id) => v[id]) ?? "agents");
  const flip = (id) => {
    const on = !v[id];
    set((p) => ({ views: { ...p.views, [id]: on } }));
    if (on) {
      setHist((h) => [...h.filter((x) => x !== id), id]);
      setActive(id);
    }
  };

  const row = (r, y, h) => (
    <div key={r.id} className={"glass vrow" + (v[r.id] ? " on" : "")} style={at(60, y, 632, h)} onClick={() => flip(r.id)}>
      <Icon n={r.icon} size={22} className="vicon" />
      <div>
        <div className="nm lg">{r.t}</div>
        <div className="ss">{r.d}</div>
      </div>
      <Toggle on={v[r.id]} onClick={() => flip(r.id)} label={r.t} />
    </div>
  );

  return (
    <>
      <Eyebrow x={60} y={118}>Workspace</Eyebrow>
      <Headline x={60} y={144} w={640} size={46} l1="Choose what lives next" l2="to your agents." />
      <Sub x={60} y={250} w={632} size={16}>
        Start lean; anything you hide stays available in Settings.
      </Sub>
      <button
        type="button"
        className={"rec-chip" + (isRec ? " on" : "")}
        style={at(60, 290, undefined, 38)}
        onClick={() => {
          set({ views: { ...RECOMMENDED } });
          setHist(["docs", "browser"]);
          setActive("browser");
        }}
      >
        <Icon n="checkCircle" size={18} />
        Recommended · Browser + Docs
      </button>

      <div className={"glass vgroup" + (v.browser ? " on" : "")} style={at(60, 340, 632, 112)}>
        <div className="vrow inner" onClick={() => flip("browser")}>
          <Icon n="target" size={22} className="vicon" />
          <div>
            <div className="nm lg">Browser</div>
            <div className="ss">Preview and inspect the app your agent is building.</div>
          </div>
          <Toggle on={v.browser} onClick={() => flip("browser")} label="Browser" />
        </div>
        <div className={"vsub" + (v.browser ? "" : " off")}>
          <span className="vsub-l" />
          <div className="vsub-t">
            <span className="vsub-n">
              Give agents the browser skill
              <HowItWorks title="How the browser skill works" items={HIW_BROWSER} pop={[250, 458, 420]} />
            </span>
            <span className="vsub-d">Agents can open, click, type and screenshot pages in this browser.</span>
          </div>
          <Toggle size="sm" on={drive} disabled={!v.browser} onClick={() => set({ browserUse: !s.browserUse })} label="Give agents the browser skill" />
        </div>
      </div>
      {VIEWS.filter((r) => r.id !== "browser").map((r) => row(r, ROW_Y[r.id], 58))}

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
    </>
  );
}
