// PROTOTYPE B — steps 5–8: Capabilities, Connect agents, Mobile, Get started.
import { useEffect, useRef, useState } from "react";
import { AGENTS, AgentIcon, GLogo, GhostPanel, GxWindow, Icon, Modal, Toggle, WindowCenter, Wire, Wires, at, elbow, fmtElapsed, useNow, useOutside, RM } from "./ui.jsx";
import { Cta, Eyebrow, Headline, Sub } from "./steps-1-4.jsx";

/* ═══════════════════════════════════════ 05 · Capabilities */
const CAPS = [
  { id: "browserUse", icon: "browser", t: "Browser Use", d: "Let agents inspect and control Ghostex browser tabs: screenshots, console, clicks, fills, keys, and page state.", b: "Limited to the Ghostex embedded browser", y: 346, h: 106 },
  { id: "computerUse", icon: "monitor", t: "Computer Use", d: "Allow supported agents to interact with your desktop when a task needs apps outside Ghostex.", b: "Requires OS accessibility / screen permissions", y: 462, h: 98 },
  { id: "control", icon: "terminal", t: "Control Ghostex", d: "Let agents create sessions, send prompts, launch other agents, and orchestrate work through the Ghostex CLI.", b: "Enables cross-agent workflows", y: 572, h: 104 },
  { id: "notify", icon: "bell", t: "Notifications", d: "Get notified when an agent needs attention or completes a task — on desktop and, if connected, on mobile.", b: "No agent action required", y: 688, h: 102 },
];
const CAP_NODES = {
  browserUse: { box: at(853, 97, 260, 214), wire: "M1117 200H1132Q1150 200 1150 218V273", ends: [[1117, 200]], d: ["Web access in", "a safe browser"] },
  computerUse: { box: at(1352, 97, 265, 214), wire: "M1348 200H1334Q1316 200 1316 218V273", ends: [[1348, 200]] },
  control: { box: at(865, 606, 248, 216), wire: "M998 606V564Q998 546 1016 546H1063", ends: [[998, 606]], d: ["CLI access", "and orchestration"] },
  notify: { box: at(1380, 606, 237, 216), wire: "M1453 606V564Q1453 546 1435 546H1387", ends: [[1453, 606]], d: ["Alerts on desktop", "and mobile"] },
};

export function Step5({ s, set, go, toast }) {
  const [confirm, setConfirm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [hub, setHub] = useState("Permissions");
  const [hov, setHov] = useState(null);
  const c = s.caps;
  const on = (id) => (id === "computerUse" ? c.computerUse !== "off" : c[id]);
  const setCap = (id, v) => set((p) => ({ caps: { ...p.caps, [id]: v } }));
  const flip = (id) => {
    if (id === "computerUse") return c.computerUse === "off" ? setConfirm(true) : setCap(id, "off");
    setCap(id, !c[id]);
  };
  const status = (id) => {
    if (id === "computerUse")
      return { off: ["perm", "Requires permission"], pending: ["wait", "Waiting for your OS"], on: ["run", "Enabled"] }[c.computerUse];
    return c[id] ? ["run", "Enabled"] : ["off", "Off"];
  };
  const apply = () => {
    setApplied(true);
    setTimeout(() => go(6), 750);
  };

  return (
    <>
      <Eyebrow x={46} y={111}>Capabilities</Eyebrow>
      <Headline x={46} y={135} w={720} size={44} l1="Choose what your agents can do" l2="through Ghostex." />
      <Sub x={46} y={234} w={690}>
        These add power beyond a normal terminal session. You stay in control and can change every capability later.
      </Sub>
      <div className="chip" style={at(46, 296, undefined, 35)}>
        <Icon n="info" size={16} className="dimc2" />
        Safer default: Computer Use starts off.
      </div>
      {CAPS.map((r) => (
        <div
          key={r.id}
          className={"glass crow" + (on(r.id) ? " on" : "") + (hov === r.id ? " hl" : "")}
          style={at(47, r.y, 710, r.h)}
          onClick={() => flip(r.id)}
          onPointerEnter={() => setHov(r.id)}
          onPointerLeave={() => setHov(null)}
        >
          <span className="ibox48">
            <Icon n={r.icon} size={22} />
          </span>
          <div className="ct">
            <div className="nm lg">{r.t}</div>
            <div className="cd">{r.d}</div>
            <div className="cb">• {r.b}</div>
          </div>
          <Toggle size="md" on={on(r.id)} onClick={() => flip(r.id)} label={r.t} />
        </div>
      ))}
      <div className="actions" style={{ position: "absolute", left: 47, top: 804 }}>
        <Cta style={{ height: 46 }} onClick={apply} className={applied ? "applied" : ""}>
          {applied ? "Applied" : "Apply capabilities"}
        </Cta>
        <button
          type="button"
          className="ghost"
          style={{ marginLeft: 22 }}
          onClick={() => {
            set({ caps: { browserUse: false, computerUse: "off", control: false, notify: false } });
            toast("Minimal setup: agents stay inside the terminal");
          }}
        >
          Use minimal setup
        </button>
      </div>

      <Wires>
        {Object.entries(CAP_NODES).map(([id, n], i) => (
          <Wire key={id} d={n.wire} ends={n.ends} dashed on={on(id) || id === "computerUse"} active={hov === id || (on(id) && id === "computerUse" && c.computerUse === "on")} delay={i * 0.5} />
        ))}
      </Wires>
      {CAPS.map((r) => {
        const n = CAP_NODES[r.id];
        const [cls, label] = status(r.id);
        return (
          <div key={r.id} className={"node glass-n capn" + (r.id === "computerUse" ? " cu" : "") + (on(r.id) || r.id === "computerUse" ? " lit" : " dimmed") + (hov === r.id ? " hl" : "")} style={n.box} onPointerEnter={() => setHov(r.id)} onPointerLeave={() => setHov(null)}>
            <span className="fbox">
              <Icon n={r.icon} size={28} />
            </span>
            {r.id === "computerUse" && <Icon n={c.computerUse === "on" ? "unlock" : "lock"} size={20} className={"lockic" + (c.computerUse === "on" ? " open" : "")} />}
            <div className="nt">{r.t}</div>
            <div className={"ns " + cls}>
              <i />
              {label}
            </div>
            {r.id === "computerUse" ? (
              c.computerUse === "pending" ? (
                <button type="button" className="grant" onClick={() => (setCap("computerUse", "on"), toast("Accessibility and screen recording granted"))}>
                  Grant in system settings
                </button>
              ) : (
                <div className="nd">
                  {c.computerUse === "on" ? "Desktop control" : "Needs OS accessibility"}
                  <br />
                  {c.computerUse === "on" ? "granted by your OS" : "to enable"}
                </div>
              )
            ) : (
              <div className="nd">
                {n.d[0]}
                <br />
                {n.d[1]}
              </div>
            )}
          </div>
        );
      })}
      <div className="node glass-n hub" style={at(1063, 273, 324, 368)}>
        <span className="lights">
          <i />
          <i />
          <i />
        </span>
        <GLogo size={62} glow />
        <div className="hub-t">Ghostex</div>
        <div className="hub-s">
          Agent permissions
          <br />
          under your control.
        </div>
        <div className="hub-menu">
          {[
            ["Permissions", "shield"],
            ["Agents", "users"],
            ["Sessions", "doc"],
            ["Settings", "gear"],
          ].map(([n, ic]) => (
            <button type="button" key={n} className={hub === n ? "on" : ""} onClick={() => setHub(n)}>
              <Icon n={ic} size={19} />
              {n}
            </button>
          ))}
        </div>
      </div>

      {confirm && (
        <Modal title="Turn on Computer Use?" onClose={() => setConfirm(false)} width={470}>
          <p className="modal-p">
            This hands over the whole machine: supported agents can see your screen and drive apps outside Ghostex. Your OS will ask for accessibility and screen recording
            next.
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
                setCap("computerUse", "pending");
                setConfirm(false);
                toast("Allowed in Ghostex. Grant it on the Computer Use node.");
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

/* ═══════════════════════════════════════ 06 · Connect your agents */
const CONN = [
  { id: "claude", name: "Claude Code", items: ["detect running / waiting / done", "richer chat session view", "Ghostex control skill"], box: at(48, 378, 359, 212) },
  { id: "codex", name: "Codex CLI", items: ["session status integration", "persistent resume flow", "Ghostex control skill"], box: at(423, 378, 354, 212) },
];
const LOGS = {
  claude: ["analyzing...", "hooks active", "streaming logs...", "status → running", "edit src/auth/refresh.ts", "bun test · 14 passed", "title → refactor-auth"],
  codex: ["queued...", "hooks active", "ready to run", "status → waiting", "resume token saved", "reply received"],
};
const TCARDS = {
  claude: { box: at(925, 100, 298, 202), st: ["run", "Running"], from: [1062, 302] },
  codex: { box: at(1252, 100, 314, 202), st: ["wait", "Waiting"], from: [1413, 302] },
};

function useLog(lines, live, offset) {
  const [i, setI] = useState(3);
  useEffect(() => {
    if (!live || RM) return;
    let id;
    const t = setTimeout(() => (id = setInterval(() => setI((x) => x + 1), 1300)), offset);
    return () => (clearTimeout(t), clearInterval(id));
  }, [live]);
  return [i - 3, i - 2, i - 1].map((k) => ({ k, t: lines[k % lines.length] }));
}

function SessionCenter({ chip, toast, setChip }) {
  const now = useNow(1000);
  const [t0] = useState(() => Date.now() - (8 * 60 + 12) * 1000);
  const [resumed, setResumed] = useState(false);
  useEffect(() => {
    if (chip !== "resume") return;
    setResumed(false);
    const id = setTimeout(() => setResumed(true), 1500);
    return () => clearTimeout(id);
  }, [chip]);
  if (!chip) return <WindowCenter tab="workspace" title="Ghostex session" logo={58} />;
  if (chip === "running")
    return (
      <div className="sc">
        <AgentIcon id="claude" size={34} />
        <div className="sc-t">Claude Code is running</div>
        <div className="sc-s mono">refactor-auth · {fmtElapsed(now - t0)}</div>
        <span className="shimmer" />
        <div className="sc-f mono">hook: status → running · tool: edit</div>
      </div>
    );
  if (chip === "waiting")
    return (
      <div className="sc">
        <AgentIcon id="codex" size={30} />
        <div className="sc-t">Codex needs a decision</div>
        <div className="sc-s">Keep the global fixtures, or inline them?</div>
        <div className="sc-btns">
          {["Keep global", "Inline them"].map((b) => (
            <button type="button" key={b} onClick={() => (toast(`Sent “${b}” to Codex`), setChip("running"))}>
              {b}
            </button>
          ))}
        </div>
      </div>
    );
  if (chip === "done")
    return (
      <div className="sc">
        <Icon n="checkCircle" size={38} className="ok" sw={1.4} />
        <div className="sc-t">Session finished</div>
        <div className="sc-s mono">3 files changed · +86 −11 · 8m 12s</div>
      </div>
    );
  return (
    <div className="sc">
      {resumed ? <Icon n="checkCircle" size={36} className="ok" sw={1.4} /> : <span className="spinner lg" />}
      <div className="sc-t">{resumed ? "Resumed" : "Resuming gx_7f21c4…"}</div>
      <div className="sc-s">{resumed ? "Same conversation, same scrollback." : "Reattaching after the restart"}</div>
    </div>
  );
}

export function Step6({ s, set, go, toast }) {
  const [phase, setPhase] = useState(0); // 0 idle, 1..4 lighting checks, 5 connected
  const [chip, setChip] = useState(null);
  const [tab, setTab] = useState("workspace");
  const inc = s.connected;
  const any = inc.claude || inc.codex;
  const flip = (id) => phase === 0 && set((p) => ({ connected: { ...p.connected, [id]: !p.connected[id] } }));
  const logC = useLog(LOGS.claude, inc.claude, 0);
  const logX = useLog(LOGS.codex, inc.codex, 650);
  const connect = () => {
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setPhase(k);
      if (k === 4) {
        clearInterval(id);
        set({ hooks: true });
        setTimeout(() => go(7), 600);
      }
    }, 330);
  };
  return (
    <>
      <Eyebrow x={48} y={148}>Connect your agents</Eyebrow>
      <Headline x={48} y={188} w={740} size={52} l1="Make Codex and Claude feel" l2="native in Ghostex." />
      <Sub x={48} y={309} w={715} size={16.5}>
        A lightweight integration lets Ghostex understand agent status, show richer session UI, and support actions around the terminal session.
      </Sub>
      {CONN.map((a) => (
        <div key={a.id} className={"glass cc" + (inc[a.id] ? "" : " off")} style={a.box} onClick={() => flip(a.id)} role="checkbox" aria-checked={inc[a.id]} tabIndex={0}>
          <div className="cc-head">
            <AgentIcon id={a.id} size={38} />
            <div>
              <div className="nm lg">{a.name}</div>
              <div className="ss">Hooks + Ghostex skill</div>
            </div>
            <span className="cc-check">
              <Icon n="check" size={20} sw={2} />
            </span>
          </div>
          <div className="cc-list">
            {a.items.map((it, i) => (
              <div key={it} className={inc[a.id] && phase > i ? "lit" : ""}>
                <Icon n="check" size={15} sw={2} />
                {it}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="glass infobox" style={at(48, 607, 729, 79)}>
        <Icon n="info" size={28} sw={1.3} className="info-i" />
        <div>
          <div className="nm">The agent still runs as its normal CLI.</div>
          <div className="ss">Ghostex adds integration around it; it doesn't proxy your prompts through a Ghostex cloud service.</div>
        </div>
      </div>
      <div className="actions" style={{ position: "absolute", left: 48, top: 715 }}>
        <Cta style={{ height: 55, padding: "0 24px", fontSize: 17 }} onClick={connect} disabled={!any || phase > 0}>
          {phase >= 4 ? "Connected" : phase > 0 ? "Connecting…" : any ? "Connect installed agents" : "Select an agent"}
        </Cta>
        <button type="button" className="ghost" style={{ marginLeft: 26, fontSize: 17 }} onClick={() => go(7)}>
          Skip for now
        </button>
      </div>

      <Wires>
        <Wire d={elbow(1062, 302, 1238, 381)} ends={[[1062, 302], [1151, 341.5]]} on={inc.claude} active={phase > 0 && inc.claude} />
        <Wire d={elbow(1413, 302, 1238, 381)} ends={[[1413, 302], [1325, 341.5]]} on={inc.codex} active={phase > 0 && inc.codex} delay={0.8} />
        <Wire d="M1238 465V496" on={any} active={phase > 0} />
      </Wires>
      {Object.entries(TCARDS).map(([id, t]) => {
        const log = id === "claude" ? logC : logX;
        return (
          <div key={id} className={"node glass-n tcard" + (inc[id] ? "" : " dimmed")} style={t.box} onClick={() => flip(id)}>
            <div className="tcard-head">
              <span className="abox tc">
                <AgentIcon id={id} size={36} />
              </span>
              <div>
                <div className="nt">{AGENTS[id].name}</div>
                <div className={"ns " + (inc[id] ? t.st[0] : "off")}>
                  <i />
                  {inc[id] ? t.st[1] : "Not connected"}
                </div>
              </div>
            </div>
            <div className="mini-term mono">
              <div className="pr">&gt;_</div>
              {log.map((l) => (
                <div key={l.k} className="ln">
                  {l.t}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className={"node glass-n hooks" + (phase > 0 ? " hl" : "")} style={at(1066, 381, 344, 84)}>
        <span className={"fbox" + (phase > 0 && phase < 4 ? " gear-spin" : "")}>
          <Icon n="gear" size={30} sw={1.5} />
        </span>
        <div>
          <div className="nt">Ghostex Hooks</div>
          <div className="nd">Integrate • Enrich • Control</div>
        </div>
      </div>
      <GxWindow style={at(885, 496, 722, 242)} tab={tab} onTab={setTab} logo={24} sideW={140}>
        <div className="wmain">
          {tab === "workspace" ? <SessionCenter chip={chip} toast={toast} setChip={setChip} /> : <WindowCenter tab={tab} />}
          {tab === "workspace" && <GhostPanel style={{ width: 232 }} />}
        </div>
      </GxWindow>
      {[
        ["running", "play", "Running", 888, 159],
        ["waiting", "clock", "Waiting", 1074, 153],
        ["done", "checkCircle", "Done", 1257, 157],
        ["resume", "refresh", "Resume", 1441, 165],
      ].map(([id, ic, label, x, w]) => (
        <button type="button" key={id} className={"chipbtn " + id + (chip === id ? " on" : "")} style={at(x, 771, w, 60)} onClick={() => (setTab("workspace"), setChip((c) => (c === id ? null : id)))}>
          <Icon n={ic} size={32} sw={1.6} />
          {label}
        </button>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════ 07 · Mobile */
const MSTEPS = [
  { t: "Install Ghostex Mobile", d: "Android now; iOS access can be offered through the current distribution path." },
  { t: "Pair this machine", d: "Ghostex creates the connection details; the phone attaches to the same gxserver sessions." },
  { t: "Keep working remotely", d: "The heavy work stays on the host. Your phone is the control surface." },
];
const LAP_AGENTS = [
  ["claude", "Claude Code", "Refactor authentication flow...", "run", "Running"],
  ["codex", "Codex", "Writing tests...", "work", "Working"],
  ["cursor", "Cursor Agent", "SCSS updates...", "run", "Running"],
  ["other", "Other agents", "2 agents running", "run", "Running"],
];
const PH_AGENTS = [
  ["claude", "Claude Code", "run", "Running"],
  ["codex", "Codex", "work", "Working"],
  ["cursor", "Cursor Agent", "run", "Running"],
  ["other", "Other agents", "run", "3 running"],
];
const CHAT = {
  claude: [
    ["me", "Refactor the auth flow so two tabs can't race the refresh."],
    ["bot", "Serialized the refresh behind a single-flight lock keyed on the session id. 14 tests pass."],
    ["bot", "Running the full suite now · 8m 12s"],
  ],
  codex: [
    ["me", "Port the auth specs off the legacy harness."],
    ["bot", "12 call sites use the legacy harness. Keep the global fixtures, or inline them?"],
  ],
  cursor: [
    ["me", "Move the tokens to CSS variables."],
    ["bot", "SCSS updates in progress: 31 of 48 tokens migrated."],
  ],
  other: [["bot", "Gemini CLI and OpenCode are running in orbit-web and orbit-docs."]],
};

function Phone({ tilt, toast }) {
  const [view, setView] = useState("home");
  const [agent, setAgent] = useState("claude");
  const [banner, setBanner] = useState(false);
  const [msgs, setMsgs] = useState(CHAT);
  const [draft, setDraft] = useState("");
  const open = (id) => (setAgent(id), setView("session"));
  const send = (text) => {
    if (!text.trim()) return;
    setMsgs((m) => ({ ...m, [agent]: [...m[agent], ["me", text]] }));
    setDraft("");
    setTimeout(() => setMsgs((m) => ({ ...m, [agent]: [...m[agent], ["bot", "On it. The work stays on gxserver-01; I'll ping you when it needs you."]] })), 900);
  };
  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(false), 3200);
    return () => clearTimeout(id);
  }, [banner]);
  return (
    <div className="phone" style={{ transform: `perspective(1400px) rotateY(${-16 + tilt.y}deg) rotateX(${3 + tilt.x}deg) rotateZ(2deg)` }}>
      <span className="ph-island" />
      <div className="ph-status">
        <span>9:41</span>
        <span className="ph-sig">
          <Icon n="signal" size={14} sw={2} />
          <Icon n="wifi" size={14} sw={2} />
          <span className="batt" />
        </span>
      </div>
      {banner && (
        <button type="button" className="ph-banner" onClick={() => (open("codex"), setBanner(false))}>
          <AgentIcon id="codex" size={16} />
          <span>
            <b>Codex is waiting</b>
            Keep the global fixtures, or inline them?
          </span>
        </button>
      )}
      {view === "session" ? (
        <div className="ph-sess">
          <div className="ph-shead">
            <button type="button" className="icon-btn" onClick={() => setView("home")} aria-label="Back">
              <Icon n="chevL" size={18} />
            </button>
            <AgentIcon id={agent} size={18} />
            <b>{PH_AGENTS.find((a) => a[0] === agent)[1]}</b>
            <span className={"ph-pill " + PH_AGENTS.find((a) => a[0] === agent)[2]}>
              <i />
              {PH_AGENTS.find((a) => a[0] === agent)[3]}
            </span>
          </div>
          <div className="ph-msgs">
            {msgs[agent].map(([who, t], i) => (
              <div key={i} className={"ph-msg " + who}>
                {t}
              </div>
            ))}
            {agent === "codex" && (
              <div className="ph-quick">
                {["Keep global", "Inline them"].map((b) => (
                  <button type="button" key={b} onClick={() => send(b)}>
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            className="ph-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input id="ph-reply" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply…" />
            <button type="submit" aria-label="Send">
              <Icon n="send" size={16} />
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="ph-head">
            <GLogo size={28} />
            <span>Ghostex</span>
            <button type="button" className="ph-bell" onClick={() => setBanner(true)} aria-label="Notifications">
              <Icon n="bell" size={20} />
              <i />
            </button>
          </div>
          {view === "home" && (
            <>
              <div className="ph-label">My sessions</div>
              <button type="button" className="ph-card" onClick={() => toast("gxserver-01 · 18 ms · 4 sessions")}>
                <span className="ph-mi">
                  <Icon n="browser" size={17} />
                </span>
                <span>
                  <b>This machine</b>
                  <em>gxserver-01</em>
                  <span className="ph-conn">
                    <i />
                    Connected
                  </span>
                </span>
                <Icon n="chevR" size={14} className="dim" />
              </button>
              <div className="ph-sub">Active agents</div>
            </>
          )}
          {view === "all" && <div className="ph-sub">All agents · gxserver-01</div>}
          <div className="ph-rows">
            {PH_AGENTS.map(([id, nm, c, st]) => (
              <button type="button" key={id} className="ph-row" onClick={() => open(id)}>
                <AgentIcon id={id} size={id === "other" ? 16 : 20} />
                <span className="nm">
                  {nm}
                  {view === "all" && <em>{CHAT[id][CHAT[id].length - 1][1].slice(0, 30)}…</em>}
                </span>
                <span className={"ph-pill " + c}>
                  <i />
                  {st}
                  <Icon n="chevR" size={10} sw={2.4} />
                </span>
              </button>
            ))}
          </div>
          {view === "home" ? (
            <>
              <button type="button" className="ph-primary" onClick={() => open("claude")}>
                Resume session <Icon n="arrowR" size={16} />
              </button>
              <button type="button" className="ph-secondary" onClick={() => setView("all")}>
                View all agents <Icon n="chevR" size={14} />
              </button>
            </>
          ) : (
            <button type="button" className="ph-secondary" onClick={() => setView("home")}>
              <Icon n="chevL" size={14} /> Back to home
            </button>
          )}
          <nav className="ph-tabs">
            {[
              ["home", "home", "Home"],
              ["all", "layers", "Agents"],
              ["all", "folder", "Sessions"],
              ["more", "grid", "More"],
            ].map(([v, ic, l]) => (
              <button type="button" key={l} className={view === v && l !== "Sessions" ? "on" : ""} onClick={() => (v === "more" ? toast("Settings, hosts and pairing") : setView(v))}>
                <Icon n={ic} size={19} />
                {l}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

export function Step7({ s, set, go, toast }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [walking, setWalking] = useState(false);
  const m = s.mobile;
  const mark = (i) => set((p) => ({ mobile: p.mobile.map((v, k) => (k === i ? !v : v)) }));
  const setup = () => {
    if (s.mobileReady) return go(8);
    setWalking(true);
    [0, 1, 2].forEach((i) =>
      setTimeout(() => {
        set((p) => ({ mobile: p.mobile.map((v, k) => (k <= i ? true : v)), mobileReady: i === 2 }));
        if (i === 2) {
          setWalking(false);
          toast("Paired: this phone attaches to gxserver-01");
        }
      }, 450 * (i + 1)),
    );
  };
  const move = (e) => {
    if (RM) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -6, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
  };
  return (
    <>
      <Eyebrow x={46} y={155}>Optional · Mobile Ghostex</Eyebrow>
      <Headline x={52} y={185} w={700} size={52} l1="Take the session with you." />
      <Sub x={46} y={258} w={690} size={16}>
        Keep the agents running on your computer or remote host, then check in from your phone. Reply to a waiting agent, inspect status, or continue the same live session.
      </Sub>
      {MSTEPS.map((st, i) => (
        <div key={i} className={"glass mstep" + (m[i] ? " done" : "")} style={at(46, 333 + i * 103.5, 680, 87)} onClick={() => mark(i)} role="checkbox" aria-checked={m[i]} tabIndex={0}>
          <span className="mnum">{m[i] ? <Icon n="check" size={18} sw={2.2} /> : i + 1}</span>
          <div>
            <div className="nm">{st.t}</div>
            <div className="ss">{st.d}</div>
          </div>
        </div>
      ))}
      <div className="actions" style={{ position: "absolute", left: 46, top: 657 }}>
        <Cta filled style={{ height: 58, padding: "0 24px", fontSize: 17 }} onClick={setup} disabled={walking}>
          {s.mobileReady ? "Mobile ready · continue" : walking ? "Pairing…" : "Set up mobile"}
        </Cta>
        <button type="button" className="ghost dimmer" style={{ marginLeft: 26, fontSize: 17 }} onClick={() => go(8)}>
          Not now
        </button>
      </div>
      <p className="note" style={{ position: "absolute", left: 46, top: 740 }}>
        You can set this up anytime from <b>Settings → Remote &amp; Mobile</b>.
      </p>

      <div className="devices" onPointerMove={move} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className="laptop" style={{ transform: `perspective(1800px) rotateY(${12 + tilt.y}deg) rotateX(${3 + tilt.x}deg)` }}>
          <div className="lscreen">
            <div className="ls-head">
              <GLogo size={22} />
              <span className="ls-name">Ghostex</span>
              <span className="ls-host">
                <i />
                Host connected
              </span>
              <span className="more static">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="ls-body">
              <nav className="ls-side">
                {[
                  ["home", "Workspace"],
                  ["layers", "Agents"],
                  ["folder", "Sessions"],
                  ["file", "Files"],
                  ["gear", "Settings"],
                ].map(([ic, l], i) => (
                  <span key={l} className={i === 0 ? "on" : ""}>
                    <Icon n={ic} size={13} />
                    {l}
                  </span>
                ))}
              </nav>
              <div className="ls-main">
                <div className="ls-t">Active agents</div>
                {LAP_AGENTS.map(([id, nm, sub, c, st]) => (
                  <div key={id} className="ls-row">
                    <AgentIcon id={id} size={id === "other" ? 16 : 22} />
                    <span className="nm">
                      {nm}
                      <em>{sub}</em>
                    </span>
                    <span className={"ph-pill " + c}>
                      <i />
                      {st}
                      <Icon n="chevR" size={9} sw={2.4} />
                    </span>
                  </div>
                ))}
                <div className="ls-cur">
                  <div className="ls-cur-h">
                    Current session
                    <span className="more static">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <div className="ls-cur-r">
                    <span className="abox xs">
                      <Icon n="terminal" size={15} />
                    </span>
                    <span className="nm">
                      Persistent session<em>Linux · gxserver-01</em>
                    </span>
                    <span className="ph-pill run live">
                      <i />
                      Live
                    </span>
                  </div>
                  <div className="ls-stats">
                    <span>
                      <Icon n="clock" size={11} />
                      Uptime<b>3h 24m</b>
                    </span>
                    <span>
                      <Icon n="layers" size={11} />
                      Agent count<b>4</b>
                    </span>
                    <span>
                      <Icon n="wifi" size={11} />
                      Network<b className="ok">Good</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lbase" />
        </div>
        <Phone tilt={tilt} toast={toast} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════ 08 · Get started */
const FOLDERS = ["~/Projects/my-app", "~/code/orbit-api", "~/code/orbit-web"];
const START = [
  ["claude", "Claude Code", "Default agent"],
  ["codex", "Codex", "Use for first session"],
  ["terminal", "Terminal", "No agent yet"],
];
const VIEWOPTS = [
  ["chat", "Chat", "Cleaner agent conversation"],
  ["terminal", "Terminal", "Raw CLI interface"],
  ["remember", "Remember last", "Switch freely"],
];
export const base = (p) => p.split("/").pop();

function ViewMock({ view, agent }) {
  const who = agent === "codex" ? "Codex" : "Claude";
  if (view === "terminal")
    return (
      <div className="vmock mono term-mock">
        <div>
          <span className="acc">$</span> {agent === "terminal" ? "ls" : agent === "codex" ? "codex" : "claude"}
        </div>
        <div className="dim">{agent === "terminal" ? "README.md  package.json  src  tests" : "✻ Welcome back. What should we work on?"}</div>
        <div>
          <span className="acc">&gt;</span> <span className="caret sm" />
        </div>
      </div>
    );
  return (
    <div className="vmock">
      {view === "remember" && <div className="vm-tag mono">last used: Chat</div>}
      <div className="vm-row">
        <GLogo size={26} />
        <span className="vm-bub">
          <i style={{ width: "92%" }} />
          <i style={{ width: "68%" }} className="acc" />
        </span>
      </div>
      <div className="vm-row me">
        <span className="vm-bub">
          <i style={{ width: "86%" }} />
          <i style={{ width: "60%" }} />
        </span>
      </div>
      <div className="vm-input">
        <Icon n="plus" size={12} />
        Message {who}...
        <Icon n="send" size={14} />
      </div>
    </div>
  );
}

export function Step8({ s, set, toast }) {
  const [picker, setPicker] = useState(false);
  const [ticks, setTicks] = useState(0);
  const pref = useRef(null);
  useOutside(pref, () => setPicker(false), picker);
  useEffect(() => {
    setTicks(0);
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setTicks(k);
      if (k >= 4) clearInterval(id);
    }, 380);
    return () => clearInterval(id);
  }, [s.folder, s.startWith, s.view]);
  const done = ticks >= 4;
  const sw = START.find((x) => x[0] === s.startWith);
  const vw = VIEWOPTS.find((x) => x[0] === s.view);
  const open = () => set({ finished: true });
  const LOADS = [
    ["Project folder", s.folder],
    [sw[1], s.startWith === "terminal" ? "No agent" : "Default agent"],
    [vw[0] === "remember" ? "Session view" : `${vw[1]} view`, "Ready"],
    ["Workspace", done ? "Ready" : "Almost there..."],
  ];
  return (
    <>
      <Eyebrow x={44} y={141}>Get started</Eyebrow>
      <Headline x={44} y={170} w={720} size={55} l1="Open your first project." />
      <Sub x={44} y={247} w={690} size={16.5}>
        One folder, one default agent, one default view. Everything else can evolve after you're inside the app.
      </Sub>
      <div className="glass pcard" style={at(44, 313, 699, 359)} />
      <div className="label" style={{ position: "absolute", left: 61, top: 330 }}>
        Project folder
      </div>
      <div className="pfield" style={at(61, 358, 665, 50)} ref={pref}>
        <Icon n="folder" size={22} className="dimc2" />
        <span className="path">{s.folder}</span>
        <button type="button" className="choose" onClick={() => setPicker((p) => !p)}>
          Choose folder
        </button>
        {picker && (
          <div className="picker" style={{ left: 0, right: 0, top: 56 }}>
            {FOLDERS.map((f) => (
              <button
                type="button"
                key={f}
                className={s.folder === f ? "on" : ""}
                onClick={() => {
                  set({ folder: f });
                  setPicker(false);
                }}
              >
                <Icon n="folder" size={16} />
                {f}
                {s.folder === f && <Icon n="check" size={14} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
            <div className="pnote">The real app opens your system folder picker here.</div>
          </div>
        )}
      </div>
      <div className="label" style={{ position: "absolute", left: 61, top: 432 }}>
        Start with
      </div>
      {START.map(([id, t, d], i) => (
        <button type="button" key={id} className={"opt" + (s.startWith === id ? " sel" : "")} style={at([61, 289, 513][i], 457, [216, 211, 213][i], 75)} onClick={() => set({ startWith: id })}>
          <span className="nm">{t}</span>
          <span className="ss">{d}</span>
        </button>
      ))}
      <div className="label" style={{ position: "absolute", left: 61, top: 554 }}>
        Default session view
      </div>
      {VIEWOPTS.map(([id, t, d], i) => (
        <button type="button" key={id} className={"opt" + (s.view === id ? " sel" : "")} style={at([61, 289, 513][i], 579, [216, 211, 213][i], 75)} onClick={() => set({ view: id })}>
          <span className="nm">{t}</span>
          <span className="ss">{d}</span>
        </button>
      ))}
      <div className="actions" style={{ position: "absolute", left: 44, top: 696 }}>
        <Cta filled style={{ height: 53, padding: "0 22px", fontSize: 17 }} onClick={open}>
          Open Ghostex
        </Cta>
        <button type="button" className="ghost" style={{ marginLeft: 22, fontSize: 17 }} onClick={() => toast("Advanced settings live in Settings (⌘,)")}>
          Advanced settings later
        </button>
      </div>
      <Sub x={44} y={772} w={680} size={15}>
        That's it. No feature tour to memorize — the workspace can teach deeper features contextually after first launch.
      </Sub>

      <Wires>
        <Wire d={elbow(1023, 220, 1125, 278)} ends={[[1023, 220], [1125, 278]]} active={!done} />
        <Wire d={elbow(1414, 220, 1314, 278)} ends={[[1414, 220], [1314, 278]]} active={!done} delay={0.5} />
        <Wire d="M1028 541V565" ends={[[1028, 541], [1028, 565]]} active={done} />
        <Wire d="M1413 541V565" ends={[[1413, 541], [1413, 565]]} active={done} delay={0.4} />
      </Wires>
      <div className="node glass-n pnode" style={at(849, 115, 348, 105)} onClick={() => setPicker(true)}>
        <span className="fbox">
          <Icon n="folder" size={30} sw={1.4} />
        </span>
        <div>
          <div className="nt">Your project</div>
          <div className="nd">{s.folder}</div>
        </div>
        <span className={"okg" + (ticks > 0 ? " on" : "")}>
          <Icon n="check" size={15} sw={2.6} />
        </span>
      </div>
      <div className="node glass-n pnode" style={at(1243, 115, 364, 105)}>
        <span className="fbox">
          <AgentIcon id={s.startWith} size={s.startWith === "terminal" ? 28 : 40} />
        </span>
        <div>
          <div className="nt">{sw[1]}</div>
          <div className="nd">{sw[2]}</div>
        </div>
        <span className={"okg" + (ticks > 1 ? " on" : "")}>
          <Icon n="check" size={15} sw={2.6} />
        </span>
      </div>
      <GxWindow style={at(865, 278, 723, 263)} tab="workspace" logo={30} sideW={150}>
        <div className="load">
          <GLogo size={72} glow />
          <div>
            <div className="load-t">{done ? "Your project is ready." : "Loading your project..."}</div>
            {LOADS.map(([k, v], i) => (
              <div key={k} className={"lrow" + (ticks > i ? " ok" : "")}>
                <span className="cb">{ticks > i && <Icon n="check" size={11} sw={3} />}</span>
                {k}
                <em>{v}</em>
              </div>
            ))}
          </div>
        </div>
      </GxWindow>
      <div className="node glass-n vcard" style={at(852, 565, 338, 217)}>
        <div className="vcard-h">
          <span className="fbox">
            <Icon n={s.view === "terminal" ? "terminal" : s.view === "remember" ? "refresh" : "chat"} size={26} />
          </span>
          <div>
            <div className="nt">{vw[1]}</div>
            <div className="nd">Default session view</div>
          </div>
          <span className={"okg" + (ticks > 2 ? " on" : "")}>
            <Icon n="check" size={15} sw={2.6} />
          </span>
        </div>
        <ViewMock view={s.view} agent={s.startWith} />
      </div>
      <div className="node glass-n vcard" style={at(1225, 565, 378, 220)}>
        <div className="vcard-h">
          <span className="fbox">
            <Icon n="users" size={26} />
          </span>
          <div>
            <div className="nt">Your workspace</div>
            <div className="nd">Ready for your first session</div>
          </div>
          <span className={"okg" + (done ? " on" : "")}>
            <Icon n="check" size={15} sw={2.6} />
          </span>
        </div>
        <div className="vmock tree-mock">
          <div className="tm-files">
            <div className="root">
              <Icon n="folder" size={13} /> {base(s.folder)}
            </div>
            {[46, 30, 52, 38, 44].map((w, i) => (
              <div key={i}>
                <Icon n="folder" size={12} />
                <i style={{ width: w }} />
              </div>
            ))}
          </div>
          <div className="tm-code">
            {[
              [40, ""],
              [70, "p"],
              [52, "p"],
              [64, "b"],
              [30, ""],
              [58, "g"],
              [44, "p"],
              [36, ""],
            ].map(([w, c], i) => (
              <i key={i} className={c} style={{ width: w + "%", marginLeft: i % 3 ? 14 : 0 }} />
            ))}
          </div>
        </div>
      </div>
      <button type="button" className={"node glass-n ready" + (done ? " on" : "")} style={at(1037, 806, 338, 74)} onClick={open}>
        <span className="rt">
          <span className="okg on">
            <Icon n="check" size={15} sw={2.6} />
          </span>
          Project ready
        </span>
        <span className="rs">Open Ghostex and start building</span>
      </button>
    </>
  );
}
