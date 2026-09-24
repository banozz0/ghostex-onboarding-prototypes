// PROTOTYPE B3 — panels 4–5: Mobile, Get started.
import { useEffect, useRef, useState } from "react";
import { AgentIcon, GLogo, Icon, QR, Toggle, at, useOutside, RM } from "./ui.jsx";
import { Cta, Eyebrow, Headline, Sub } from "./steps-1-3.jsx";
import { Link } from "./demos.jsx";

/* ═══════════════════════════════════════ 04 · Mobile */
const MSTEPS = [
  ["Install Ghostex Mobile", "Get Ghostex Mobile for Android or iPhone."],
  ["Pair this computer", "Turn on Easy Connect and scan the QR code."],
  ["Keep working remotely", "Reply, steer and keep working from your phone."],
];
// The pairing demo's timeline in ms. Step 2 covers Easy Connect, the password prompt and the scan.
const T = { easy: 2000, toggle: 2400, prompt: 2700, allow: 4300, qr: 4500, scan: 5300, paired: 6800, end: 8400 };
const STEP_AT = [0, T.easy, T.paired];
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

/** Milliseconds into the pairing demo, stopping at `end`; `jump(ms)` restarts it from that point. */
function useTimeline(end) {
  const [t0, setT0] = useState(() => Date.now() - (RM ? end : 0));
  const [t, setT] = useState(RM ? end : 0);
  useEffect(() => {
    const tick = () => setT(Math.min(end, Date.now() - t0));
    tick();
    const id = setInterval(() => {
      tick();
      if (Date.now() - t0 >= end) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [t0, end]);
  return [t, (ms) => setT0(Date.now() - ms)];
}

/** The paired phone once the demo has finished: home, agent list and a session you can reply in. */
function PhoneApp({ toast }) {
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
    setTimeout(() => setMsgs((m) => ({ ...m, [agent]: [...m[agent], ["bot", "On it. The work stays on your computer; I'll ping you when it needs you."]] })), 900);
  };
  const a = PH_AGENTS.find((x) => x[0] === agent);
  return (
    <>
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
            <b>{a[1]}</b>
            <span className={"ph-pill " + a[2]}>
              <i />
              {a[3]}
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
            <button type="button" className="ph-bell" onClick={() => setBanner((b) => !b)} aria-label="Notifications">
              <Icon n="bell" size={20} />
              <i />
            </button>
          </div>
          {view === "home" && (
            <>
              <div className="ph-label">My sessions</div>
              <button type="button" className="ph-card" onClick={() => toast("Your computer · 18 ms · 4 sessions")}>
                <span className="ph-mi">
                  <Icon n="monitor" size={17} />
                </span>
                <span>
                  <b>This computer</b>
                  <em>4 sessions</em>
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
          {view === "all" && <div className="ph-sub">All agents · this computer</div>}
          <div className="ph-rows">
            {PH_AGENTS.map(([id, nm, c, st]) => (
              <button type="button" key={id} className="ph-row" onClick={() => open(id)}>
                <AgentIcon id={id} size={20} />
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
              <button type="button" key={l} className={view === v && l !== "Sessions" ? "on" : ""} onClick={() => (v === "more" ? toast("Settings, computers and pairing") : setView(v))}>
                <Icon n={ic} size={19} />
                {l}
              </button>
            ))}
          </nav>
        </>
      )}
    </>
  );
}

/** What the phone shows while the demo plays: the install, the app waiting to connect, the camera, then Paired. */
function PhoneDemo({ t }) {
  if (t < T.easy) {
    const st = t < 900 ? "get" : t < 1600 ? "loading" : "open";
    return (
      <div className="pd">
        <GLogo size={64} glow />
        <b>Ghostex Mobile</b>
        <em>Your agents, in your pocket</em>
        <span className={"pd-get " + st}>{st === "get" ? "Get" : st === "loading" ? <span className="spinner" /> : "Open"}</span>
        <span className="pd-note">Android or iPhone</span>
      </div>
    );
  }
  if (t < T.scan)
    return (
      <div className="pd pd-connect">
        <div className="ph-head">
          <GLogo size={28} />
          <span>Ghostex</span>
        </div>
        <div className="pd-empty">
          <Icon n="monitor" size={34} />
          <b>Connect your computer</b>
          <em>Scan the code on your computer to pair.</em>
          <span className={"pd-btn" + (t >= T.qr + 400 ? " tap" : "")}>
            <Icon n="target" size={15} />
            Scan code
          </span>
        </div>
      </div>
    );
  if (t < T.paired)
    return (
      <div className="pd pd-cam">
        <div className="pd-cam-frame">
          <QR size={124} />
          <span className="pd-scanline" />
        </div>
        <em>Point at the code on your computer</em>
      </div>
    );
  return (
    <div className="pd">
      <span className="pd-ok">
        <Icon n="check" size={30} sw={2.4} />
      </span>
      <b>Paired</b>
      <em>Connected to this computer · 4 sessions</em>
    </div>
  );
}

/** The computer's side of the demo: Settings → Remote, with the one password prompt. */
function ComputerCard({ t }) {
  const ec = t >= T.toggle;
  const remote = t >= T.allow;
  const qr = t >= T.qr;
  const paired = t >= T.paired;
  const dots = Math.max(0, Math.min(8, Math.floor((t - T.prompt - 300) / 140)));
  return (
    <div className="glass pc" style={at(806, 246, 420, 448)}>
      <div className="pc-bar">
        <span className="lights sm">
          <i />
          <i />
          <i />
        </span>
        <span className="dim">Settings</span>
        <b>Remote</b>
        <span className="pc-host mono">This computer</span>
      </div>
      <div className="pc-body">
        <div className="pc-t">Connect your phone</div>
        <div className="pc-s">Easy Connect is the simplest way to reach this computer from your phone.</div>
        <div className="pc-row">
          <b>Easy Connect</b>
          <span className="pc-rec">Recommended</span>
          <span className={"tg tg-sm" + (ec ? " on" : "")} aria-hidden="true" />
        </div>
        <div className="pc-row sub">
          <span>Remote access</span>
          <span className={remote ? "ok mono" : "dim mono"}>{remote ? "on" : "off"}</span>
        </div>
        <div className="pc-qr">
          {qr ? (
            <QR size={128} />
          ) : (
            <div className="pc-qr-off">
              <Icon n="lock" size={22} />
            </div>
          )}
          <div className="pc-qr-t">
            {paired ? (
              <span className="ok pc-paired">
                <Icon n="checkCircle" size={16} /> Paired with your phone
              </span>
            ) : qr ? (
              "Scan it in the Ghostex app."
            ) : (
              "Turn on Easy Connect to show the code."
            )}
          </div>
        </div>
      </div>
      {t >= T.prompt && t < T.allow && (
        <div className="pc-sheet">
          <Icon n="lock" size={22} />
          <b>Ghostex wants to turn on remote access.</b>
          <em>Enter your password to allow this.</em>
          <span className="pc-pw mono">
            {"•".repeat(dots)}
            <i className="pc-caret" />
          </span>
          <span className={"pc-allow" + (t > T.allow - 400 ? " tap" : "")}>Allow</span>
        </div>
      )}
    </div>
  );
}

export function Step4({ s, set, go, toast }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [t, jump] = useTimeline(T.end);
  const lit = t >= T.paired ? 2 : t >= T.easy ? 1 : 0;
  const ended = t >= T.end;
  const move = (e) => {
    if (RM) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -5, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
  };
  return (
    <>
      <Eyebrow x={46} y={146}>Optional · Mobile</Eyebrow>
      <Headline x={46} y={174} w={700} size={52} l1="Take the session with you." />
      <Sub x={46} y={250} w={660} size={16}>
        The agents keep running on your computer while you reply, steer and keep working from your phone.
      </Sub>
      {MSTEPS.map(([n, d], i) => {
        const done = ended || lit > i;
        return (
          <div
            key={n}
            className={"glass mstep" + (done ? " done" : lit === i ? " on" : "")}
            style={at(46, 326 + i * 92, 660, 84)}
            onClick={() => jump(STEP_AT[i])}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && jump(STEP_AT[i])}
            role="button"
            tabIndex={0}
            aria-current={!ended && lit === i ? "step" : undefined}
          >
            <span className="mnum">{done ? <Icon n="check" size={18} sw={2.2} /> : i + 1}</span>
            <div>
              <div className="nm">{n}</div>
              <div className="ss">{d}</div>
            </div>
          </div>
        );
      })}
      <div className="glass vrow" style={at(46, 608, 660, 72)} onClick={() => set({ notify: !s.notify })}>
        <Icon n="bell" size={22} className="vicon" />
        <div>
          <div className="nm lg">Ping me when an agent needs me</div>
        </div>
        <Toggle on={s.notify} onClick={() => set({ notify: !s.notify })} label="Ping me when an agent needs me" />
      </div>
      <div className="actions" style={{ position: "absolute", left: 46, top: 704 }}>
        <Cta
          filled
          style={{ height: 52, padding: "0 24px", fontSize: 17 }}
          onClick={() => {
            set({ phoneQueued: true });
            toast("Phone setup opens after onboarding");
            go(5);
          }}
        >
          Connect my phone
        </Cta>
        <button
          type="button"
          className="ghost dimmer"
          style={{ marginLeft: 26, fontSize: 17 }}
          onClick={() => {
            set({ phoneQueued: false });
            go(5);
          }}
        >
          Not now
        </button>
      </div>
      <p className="note" style={{ position: "absolute", left: 46, top: 786 }}>
        You can set this up anytime from <b>Settings → Remote</b>.
      </p>

      {/* right: the pairing, played once — the computer's Settings on the left, the phone on the right */}
      <ComputerCard t={t} />
      <Link x={1226} y={470} w={90} send={t >= T.scan && t < T.scan + 1000 ? "l" : t >= T.paired && t < T.paired + 1000 ? "r" : null} label={t >= T.scan && t < T.paired ? "Scanning" : t >= T.paired ? "Paired" : null} />
      <div className="devices" onPointerMove={move} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className="phone" style={{ transform: `perspective(1400px) rotateY(${-6 + tilt.y}deg) rotateX(${2 + tilt.x}deg) rotateZ(1deg)` }}>
          <span className="ph-island" />
          <div className="ph-status">
            <span>9:41</span>
            <span className="ph-sig">
              <Icon n="signal" size={14} sw={2} />
              <Icon n="wifi" size={14} sw={2} />
              <span className="batt" />
            </span>
          </div>
          {ended ? <PhoneApp toast={toast} /> : <PhoneDemo t={t} />}
        </div>
      </div>
      {ended && (
        <button type="button" className="replay" style={{ position: "absolute", left: 1418, top: 790 }} onClick={() => jump(0)}>
          <Icon n="refresh" size={14} />
          Replay
        </button>
      )}
    </>
  );
}

/* ═══════════════════════════════════════ 05 · Get started */
const FOLDERS = ["~/Projects/my-app", "~/code/orbit-api", "~/code/orbit-web"];
const START = [
  ["claude", "Claude Code"],
  ["codex", "Codex"],
  ["cursor", "Cursor Agent"],
  ["terminal", "Terminal"],
];
const VIEWOPTS = [
  ["chat", "Chat", "Cleaner agent conversation"],
  ["terminal", "Terminal", "Raw CLI interface"],
  ["remember", "Remember last", "Switch freely"],
];
export const base = (p) => p.split("/").pop();

export function Step5({ s, set, toast }) {
  const [picker, setPicker] = useState(false);
  const pref = useRef(null);
  useOutside(pref, () => setPicker(false), picker);
  const open = () => set({ finished: true });

  return (
    <>
      <Eyebrow x={486} y={150} w={700}>Get started</Eyebrow>
      <Headline x={336} y={182} w={1000} size={48} center l1="Open your first project in Ghostex." />
      <Sub x={486} y={252} w={700} size={16.5} center>
        One folder, one agent, one default view — everything else can change later.
      </Sub>

      <div className="glass pcard" style={at(486, 310, 700, 350)} />
      <div className="label" style={{ position: "absolute", left: 506, top: 328 }}>
        Project folder
      </div>
      <div className="pfield" style={at(506, 354, 660, 50)} ref={pref}>
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
      <div className="label" style={{ position: "absolute", left: 506, top: 428 }}>
        Start with
      </div>
      {START.map(([id, t], i) => (
        <button type="button" key={id} className={"opt" + (s.startWith === id ? " sel" : "")} style={at(506 + i * 167, 452, 159, 72)} onClick={() => set({ startWith: id })}>
          <span className="nm">{t}</span>
          <span className="ss">{id === s.defaultAgent ? "Default agent" : id === "terminal" ? "No agent yet" : "Switch anytime"}</span>
        </button>
      ))}
      <div className="label" style={{ position: "absolute", left: 506, top: 544 }}>
        Default session view
      </div>
      {VIEWOPTS.map(([id, t, d], i) => (
        <button type="button" key={id} className={"opt" + (s.view === id ? " sel" : "")} style={at(506 + i * 223, 568, 213, 72)} onClick={() => set({ view: id })}>
          <span className="nm">{t}</span>
          <span className="ss">{d}</span>
        </button>
      ))}

      <div className="actions center" style={{ position: "absolute", left: 486, top: 692, width: 700 }}>
        <Cta filled style={{ height: 53, padding: "0 22px", fontSize: 17 }} onClick={open}>
          Open Ghostex
        </Cta>
        <button type="button" className="ghost" style={{ marginLeft: 22, fontSize: 17 }} onClick={() => toast("Advanced settings live in Settings (⌘,)")}>
          Advanced settings later
        </button>
      </div>
      <Sub x={486} y={772} w={700} size={15} center>
        That's it — the workspace teaches the deeper features once you are inside.
      </Sub>
    </>
  );
}
