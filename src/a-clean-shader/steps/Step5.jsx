// 05 · Capabilities — toggles, a real press-and-hold for Computer Use, and the OS grant walk-through.
import { useEffect, useRef, useState } from "react";
import { S, Pill, Tog, Lights, press, later } from "../ui.jsx";

const HOLD_MS = 1200;

export default function Step5({ state, set, next }) {
  const caps = state.caps;
  const [hold, setHold] = useState(0);
  const [nope, setNope] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [applied, setApplied] = useState(false);
  const [lockNudge, setLockNudge] = useState(false);
  const raf = useRef(0);
  const t0 = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const toggle = (k) => set((s) => ({ caps: { ...s.caps, [k]: !s.caps[k] } }));

  const startHold = (e) => {
    if (caps.computerUse) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    t0.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0.current) / HOLD_MS);
      setHold(p);
      if (p >= 1) {
        set((s) => ({ caps: { ...s.caps, computerUse: true } }));
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const endHold = () => {
    cancelAnimationFrame(raf.current);
    if (!caps.computerUse) setHold(0);
  };
  const cuToggle = (e) => {
    e.stopPropagation();
    if (caps.computerUse) {
      set((s) => ({ caps: { ...s.caps, computerUse: false } }));
      setHold(0);
    } else {
      setNope(true);
      setTimeout(() => setNope(false), 400);
    }
  };

  const cu = caps.computerUse;
  const granted = cu && state.osGranted;
  const osRow = granted ? ["granted", "var(--run)"] : ["not granted", "var(--wait)"];

  const apply = async () => {
    setApplied(true);
    await later(750);
    next();
  };

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>05</b>
          <span>Capabilities</span>
        </div>
        <h1>Choose what your agents can do.</h1>
        <p className="sub">These reach outside the terminal session. All of them can be changed later.</p>

        <div className="note" style={S("margin-top:16px;width:fit-content")}>
          <span className="cbody" style={S("color:var(--text)")}>
            Safer default: Computer Use starts off.
          </span>
        </div>

        <div style={S("display:flex;flex-direction:column;gap:7px;margin-top:14px")}>
          <div className={`card hover ${caps.browserUse ? "raised" : ""}`} style={S("padding:12px 16px;display:flex;align-items:flex-start;gap:14px")} aria-checked={caps.browserUse} {...press(() => toggle("browserUse"), "switch")}>
            <div style={{ flex: 1 }}>
              <div className="ctitle" style={S("font-size:15px;line-height:21px")}>
                Browser Use
              </div>
              <div className="cbody" style={S("margin-top:3px")}>
                Agents inspect and drive tabs in the Ghostex browser: screenshots, console, clicks, form fills. Runs through{" "}
                <span className="mono" style={S("color:var(--text)")}>
                  /ghostex-browser-use
                </span>
                .
              </div>
            </div>
            <Tog on={caps.browserUse} style={S("margin-top:3px")} />
          </div>

          <div className={`card ${cu ? "raised" : ""}`} style={S("padding:12px 16px")}>
            <div style={S("display:flex;align-items:flex-start;gap:14px")}>
              <div style={{ flex: 1 }}>
                <div className="ctitle" style={S("font-size:15px;line-height:21px")}>
                  Computer Use
                </div>
                <div className="cbody" style={S("margin-top:3px")}>
                  Supported agents drive your desktop when a task needs apps outside Ghostex. This one hands over the whole machine, so it asks twice.
                </div>
              </div>
              <button type="button" role="switch" aria-checked={cu} aria-label="Computer Use" onClick={cuToggle} style={S("margin-top:3px")}>
                <Tog on={cu} className={nope ? "nope" : ""} />
              </button>
            </div>
            <div style={S("margin-top:9px;display:flex;align-items:center;gap:12px")}>
              <span style={S("display:inline-flex;flex-direction:column;gap:6px")}>
                <button type="button" className={`hold ${cu ? "done" : ""}`} onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && startHold(e)} onKeyUp={endHold}>
                  {cu ? "Enabled" : hold > 0 ? "Keep holding…" : "Hold to enable"}
                </button>
                <span style={S("display:block;height:3px;border-radius:2px;background:#22262C;overflow:hidden")}>
                  <span style={{ display: "block", width: `${(cu ? 1 : hold) * 100}%`, height: 3, background: cu ? "var(--run)" : "var(--accent)", transition: hold === 0 ? "width .25s" : "none" }} />
                </span>
              </span>
              <span className="micro" style={nope ? { color: "var(--text)" } : undefined}>
                {cu ? (granted ? "Granted in the OS too. Agents can act outside Ghostex." : "Now grant it in the OS: accessibility and screen recording.") : nope ? "Hold the button to turn this on." : "Then your OS asks for accessibility and screen recording."}
              </span>
            </div>
          </div>

          <div className={`card hover ${caps.control ? "raised" : ""}`} style={S("padding:12px 16px;display:flex;align-items:flex-start;gap:14px")} aria-checked={caps.control} {...press(() => toggle("control"), "switch")}>
            <div style={{ flex: 1 }}>
              <div className="ctitle" style={S("font-size:15px;line-height:21px")}>
                Control Ghostex
              </div>
              <div className="cbody" style={S("margin-top:3px")}>
                Agents create sessions, send prompts and launch other agents through the{" "}
                <span className="mono" style={S("color:var(--text)")}>
                  ghostex
                </span>{" "}
                CLI.
              </div>
            </div>
            <Tog on={caps.control} style={S("margin-top:3px")} />
          </div>

          <div className={`card hover ${caps.notifications ? "raised" : ""}`} style={S("padding:11px 16px;display:flex;align-items:flex-start;gap:14px")} aria-checked={caps.notifications} {...press(() => toggle("notifications"), "switch")}>
            <div style={{ flex: 1 }}>
              <div className="ctitle" style={S("font-size:15px;line-height:21px")}>
                Notifications
              </div>
              <div className="cbody" style={S("margin-top:3px")}>
                Menu bar indicators and sounds when an agent needs you or finishes, on desktop and on your phone.
              </div>
            </div>
            <Tog on={caps.notifications} style={S("margin-top:3px")} />
          </div>
        </div>

        <div className="actions" style={S("margin-top:12px")}>
          <button type="button" className={`cta ${applied ? "ok" : ""}`} onClick={apply} disabled={applied}>
            {applied ? "Applied" : "Apply capabilities"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              set({ caps: { browserUse: false, computerUse: false, control: false, notifications: false } });
              setHold(0);
            }}
          >
            Use minimal setup
          </button>
        </div>
      </div>

      <div className="right">
        <div className="label" style={S("margin-bottom:12px")}>
          Enabling Computer Use, step by step
        </div>
        <div style={S("display:flex;gap:16px;align-items:flex-start")}>
          <div className="win" style={S("width:452px;height:452px")}>
            <div className="bar">
              <Lights />
              <span className="cbody" style={S("font-size:12px;margin-left:6px")}>
                Settings
              </span>
            </div>
            <div style={S("display:flex;height:411px")}>
              <div style={S("width:132px;border-right:1px solid var(--line);padding:12px 8px;background:#0F1113;display:flex;flex-direction:column;gap:2px")}>
                {["Permissions", "Agents", "Sessions", "Hosts", "Appearance"].map((x, i) => (
                  <span key={x} className="cbody" style={{ fontSize: 13, padding: "7px 9px", borderRadius: 8, background: i === 0 ? "var(--surface-2)" : undefined, color: i === 0 ? "var(--text)" : undefined }}>
                    {x}
                  </span>
                ))}
              </div>
              <div style={S("flex:1;padding:16px 18px")}>
                <div className="ctitle" style={S("font-size:15px")}>
                  Computer Use
                </div>
                <div style={S("display:flex;align-items:center;gap:9px;margin-top:9px")}>
                  {granted ? <Pill kind="run">active</Pill> : cu ? <Pill kind="wait" className="pulse">waiting on the OS</Pill> : <Pill kind="wait">blocked by the system</Pill>}
                </div>
                <div className="cbody" style={S("margin-top:12px;font-size:13px;line-height:19px")}>
                  {granted
                    ? "Granted on both sides. Supported agents can now act outside this window, and every action shows in the session."
                    : "Ghostex has your permission. The operating system hasn't granted screen and input access yet, so the agent can't act outside this window."}
                </div>
                <div style={S("margin-top:14px;border-top:1px solid var(--line);padding-top:12px;display:flex;flex-direction:column;gap:9px")}>
                  <div style={S("display:flex;align-items:center")}>
                    <span className="cbody" style={S("font-size:13px;flex:1")}>
                      Accessibility
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: osRow[1] }}>
                      {osRow[0]}
                    </span>
                  </div>
                  <div style={S("display:flex;align-items:center")}>
                    <span className="cbody" style={S("font-size:13px;flex:1")}>
                      Screen recording
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: osRow[1] }}>
                      {osRow[0]}
                    </span>
                  </div>
                  <div style={S("display:flex;align-items:center")}>
                    <span className="cbody" style={S("font-size:13px;flex:1")}>
                      Applies to
                    </span>
                    <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
                      Claude Code, Codex CLI
                    </span>
                  </div>
                </div>
                <div style={S("margin-top:16px")}>
                  <button type="button" className="cta" style={S("height:34px;padding:0 14px;font-size:13px")} onClick={() => setUnlocked(true)}>
                    Open system settings
                  </button>
                </div>
                <p className="micro" style={S("margin-top:12px")}>
                  On Windows and Linux the equivalent prompt comes from the desktop environment.
                </p>
              </div>
            </div>
          </div>

          <div className={`card raised ${unlocked && !state.osGranted ? "focusring" : ""}`} style={S("flex:1;overflow:hidden;margin-top:44px")}>
            <div style={S("display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)")}>
              <span className="cbody" style={S("font-size:12px")}>
                System Settings
              </span>
              <span className="cbody" style={S("font-size:12px;color:var(--text)")}>
                Privacy &amp; Security
              </span>
            </div>
            <div style={S("padding:14px")}>
              <div className="ctitle" style={S("font-size:14px")}>
                Accessibility
              </div>
              <div className="cbody" style={S("margin-top:5px;font-size:12px;line-height:18px")}>
                Allow the apps below to control your computer.
              </div>
              <div style={S("margin-top:12px;border:1px solid var(--line);border-radius:8px;overflow:hidden")}>
                <div
                  style={S("display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line)")}
                  aria-checked={state.osGranted}
                  {...press(() => {
                    if (!unlocked) {
                      setLockNudge(true);
                      setTimeout(() => setLockNudge(false), 900);
                      return;
                    }
                    set((s) => ({ osGranted: !s.osGranted }));
                  }, "switch")}
                >
                  <span className="gx-logo" style={S("width:20px;height:20px;border-radius:5px")} />
                  <span className="cbody" style={S("flex:1;font-size:13px;color:var(--text)")}>
                    Ghostex
                  </span>
                  <Tog on={state.osGranted} style={S("transform:scale(.82)")} />
                </div>
                <div style={S("display:flex;align-items:center;gap:10px;padding:10px 12px")}>
                  <span className="mark" style={S("width:20px;height:20px;font-size:9px;border-radius:5px")}>
                    tm
                  </span>
                  <span className="cbody" style={S("flex:1;font-size:13px")}>
                    Terminal
                  </span>
                  <Tog on style={S("transform:scale(.82)")} />
                </div>
              </div>
              <button type="button" onClick={() => setUnlocked((u) => !u)} style={S("display:flex;align-items:center;gap:8px;margin-top:12px")}>
                <svg width="11" height="12" viewBox="0 0 11 12" fill="none" stroke={lockNudge ? "#E8EAED" : "#8A929C"} strokeWidth="1.1">
                  <rect x=".6" y="5" width="9.8" height="6.4" rx="1.6" />
                  <path d={unlocked ? "M3 5V3.2a2.5 2.5 0 0 1 5 0" : "M3 5V3.2a2.5 2.5 0 0 1 5 0V5"} />
                </svg>
                <span className="micro" style={lockNudge ? { color: "var(--text)" } : undefined}>
                  {unlocked ? "Unlocked. Switch Ghostex on to grant it." : "Unlock to make changes."}
                </span>
              </button>
            </div>
          </div>
        </div>
        <p className="cbody" style={S("margin-top:18px;max-width:70ch")}>
          Ghostex never quietly acquires this. It stays blocked until you hold the switch here and grant it in the operating system as well.
        </p>
      </div>
    </>
  );
}
