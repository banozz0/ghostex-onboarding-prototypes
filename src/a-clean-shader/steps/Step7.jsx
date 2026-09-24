// 07 · Remote and mobile — Easy Connect toggle, copyable pairing code, simulated scan, live topology.
import { useEffect, useRef, useState } from "react";
import { S, Pill, Tog, press, useNow, since, fmtDur, later } from "../ui.jsx";

const STEPS = [
  { t: "Install the Easy Connect helper", b: "One click in Settings under Remote, with no terminal commands to run. Ghostex installs and manages the helper, which carries your SSH connection through an encrypted tunnel built on tailcat, the open source tunnel tool from Tailscale." },
  { t: "Leave SSH access on", b: "Required. Easy Connect carries SSH to this computer, and gxserver keeps the sessions alive on the side that holds your files." },
  { t: "Turn it on and pair a device", b: "Scan the code from the Android or iOS app, or copy the pairing code to another computer. Turn it off any time and paired devices stop reaching this computer." },
];
const PLATFORMS = [
  ["macOS", "desktop app"],
  ["Linux", "desktop app"],
  ["Windows", "WSL2 client, beta"],
  ["Android", "APK from Releases"],
  ["iOS", "TestFlight build"],
  ["TUI", "gx from any shell"],
];
const XS = [60.5, 198.5, 336.5, 474.5, 612.5, 750.5];
const ALPHA = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newCode = () =>
  Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join("")).join("-");

// The mockup's QR module map, lifted from panels.html (rects at 5px pitch).
const QR_RECTS =
  "0,0 5,0 10,0 15,0 20,0 25,0 30,0 45,0 55,0 70,0 75,0 80,0 85,0 90,0 95,0 100,0 0,5 30,5 50,5 70,5 100,5 0,10 10,10 15,10 20,10 30,10 45,10 60,10 70,10 80,10 85,10 90,10 100,10 0,15 10,15 15,15 20,15 30,15 45,15 70,15 80,15 85,15 90,15 100,15 0,20 10,20 15,20 20,20 30,20 55,20 60,20 70,20 80,20 85,20 90,20 100,20 0,25 30,25 50,25 70,25 100,25 0,30 5,30 10,30 15,30 20,30 25,30 30,30 40,30 50,30 60,30 70,30 75,30 80,30 85,30 90,30 95,30 100,30 30,40 50,40 10,45 20,45 25,45 35,45 55,45 65,45 75,45 80,45 85,45 90,45 100,45 0,50 10,50 25,50 30,50 40,50 45,50 70,50 75,50 85,50 90,50 10,55 15,55 20,55 35,55 45,55 50,55 55,55 60,55 65,55 75,55 0,60 25,60 30,60 45,60 50,60 60,60 65,60 70,60 75,60 85,60 90,60 95,60 45,65 50,65 55,65 65,65 75,65 95,65 100,65 0,70 5,70 10,70 15,70 20,70 25,70 30,70 45,70 55,70 60,70 65,70 70,70 75,70 85,70 95,70 100,70 0,75 30,75 45,75 65,75 70,75 75,75 100,75 0,80 10,80 15,80 20,80 30,80 50,80 75,80 100,80 0,85 10,85 15,85 20,85 30,85 50,85 55,85 70,85 75,85 80,85 85,85 95,85 100,85 0,90 10,90 15,90 20,90 30,90 55,90 60,90 65,90 85,90 90,90 95,90 100,90 0,95 30,95 50,95 75,95 100,95 0,100 5,100 10,100 15,100 20,100 25,100 30,100 45,100 50,100 65,100 70,100 80,100 85,100 95,100"
    .split(" ")
    .map((p) => p.split(",").map(Number));

const PHONE = [
  { id: "fix-token-refresh-race", c: "var(--run)", sub: (n) => `claude · running ${fmtDur(since(n, 492))}`, on: true },
  { id: "port-legacy-tests", c: "var(--wait)", sub: () => "codex · needs input" },
  { id: "write-migration-notes", c: "var(--run)", sub: (n) => `codex · running ${fmtDur(since(n, 100))}` },
  { id: "tokens-to-css-vars", c: "var(--done)", sub: () => "cursor · done 2m ago" },
];

export default function Step7({ state, set, next }) {
  const now = useNow();
  const tick = useNow(1500);
  const on = state.easyConnect;
  const [code, setCode] = useState("7F2K-4QD9-M3XB");
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [paired, setPaired] = useState(false);
  const [lit, setLit] = useState(null);
  const [pin, setPin] = useState(null);
  const [done, setDone] = useState(0);
  const [walking, setWalking] = useState(false);
  const [openRow, setOpenRow] = useState(null);
  const lat = useRef(18);
  const lastTick = useRef(tick);
  if (lastTick.current !== tick) {
    lastTick.current = tick;
    lat.current = Math.max(14, Math.min(24, lat.current + Math.round((Math.random() - 0.5) * 5)));
  }

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };
  const scan = async () => {
    if (scanning) return;
    setScanning(true);
    await later(950);
    setScanning(false);
    setPaired(true);
  };
  const walk = async () => {
    if (done === 3) return next();
    setWalking(true);
    for (let i = 1; i <= 3; i++) {
      await later(650);
      setDone(i);
      if (i === 3) set({ easyConnect: true });
    }
    setWalking(false);
  };

  const hot = lit ?? pin;

  return (
    <>
      <div className="left">
        <div className="eyebrow" style={S("margin-bottom:16px")}>
          <b>07</b>
          <span>Remote and mobile</span>
        </div>
        <h1>
          Leave the desk.
          <br />
          Leave the agents running.
        </h1>
        <p className="sub">The work stays on the machine you choose. Everything else is a client attaching to it.</p>

        <div style={S("display:flex;flex-direction:column;gap:9px;margin-top:18px")}>
          {STEPS.map((s, i) => {
            const isDone = done > i;
            const active = walking && done === i;
            return (
              <div key={s.t} className={`card raised ${active ? "focusring" : ""}`} style={S("padding:13px 18px;display:flex;gap:16px")}>
                <span className="mono stepnum" style={{ width: 22, color: isDone ? "var(--run)" : "var(--accent)", fontSize: 15, flex: "none" }}>
                  {isDone ? "✓" : i + 1}
                </span>
                <div>
                  <div className="ctitle" style={S("font-size:16px")}>
                    {s.t}
                  </div>
                  <div className="cbody" style={S("margin-top:3px")}>
                    {s.b}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="actions" style={S("margin-top:16px")}>
          <button type="button" className={`cta ${done === 3 ? "ok" : ""}`} onClick={walk} disabled={walking}>
            {done === 3 ? "Easy Connect is on · Continue" : walking ? "Setting up…" : "Set up Easy Connect"}
          </button>
          <button type="button" className="ghost" onClick={next}>
            Not now
          </button>
        </div>
        <p className="micro" style={S("margin-top:10px")}>
          You can do this later from Settings under Remote.
        </p>

        <div className="card" style={S("margin-top:20px;padding:14px 18px")}>
          <div className="label" style={S("margin-bottom:9px")}>
            What never leaves the host
          </div>
          <div style={S("display:flex;gap:30px")}>
            <div>
              <div className="nm" style={S("font-size:14px")}>
                Agent processes
              </div>
              <div className="micro" style={S("margin-top:2px")}>
                The phone sends keystrokes, not work.
              </div>
            </div>
            <div>
              <div className="nm" style={S("font-size:14px")}>
                Your files
              </div>
              <div className="micro" style={S("margin-top:2px")}>
                The repo stays where it is.
              </div>
            </div>
            <div>
              <div className="nm" style={S("font-size:14px")}>
                Your credentials
              </div>
              <div className="micro" style={S("margin-top:2px")}>
                Agent logins stay on the host.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="right">
        <div className="label" style={S("margin-bottom:10px")}>
          Pairing a phone with Easy Connect
        </div>
        <div style={S("display:flex;gap:16px;align-items:stretch;height:440px")}>
          <div className="card raised" style={S("width:544px;overflow:hidden;display:flex;flex-direction:column")}>
            <div style={S("height:42px;display:flex;align-items:center;gap:8px;padding:0 16px;border-bottom:1px solid var(--line);flex:none")}>
              <span className="cbody" style={S("font-size:12px")}>
                Settings
              </span>
              <span className="cbody" style={S("font-size:12px;color:var(--text)")}>
                Remote
              </span>
              <span className="mono" style={S("margin-left:auto;font-size:11px;color:var(--muted)")}>
                mini-01
              </span>
            </div>
            <div style={S("padding:15px 18px 0")}>
              <div className="ctitle" style={S("font-size:16px")}>
                Connect to this computer
              </div>
              <div className="cbody" style={S("margin-top:4px;font-size:13px;line-height:19px")}>
                Use Ghostex from your phone or another computer. Most people only need Easy Connect.
              </div>
            </div>
            <div style={S("margin:14px 18px 0;padding-top:13px;border-top:1px solid var(--line);display:flex;align-items:center;gap:10px")}>
              <span className="ctitle" style={S("font-size:15px")}>
                Easy Connect
              </span>
              <Pill dot={false} style={S("height:21px;font-size:10px;color:var(--accent)")}>
                Recommended
              </Pill>
              <Pill dot={false} style={S("height:21px;font-size:10px")}>
                helper installed
              </Pill>
              <button type="button" role="switch" aria-checked={on} aria-label="Easy Connect" style={S("margin-left:auto")} onClick={() => set((s) => ({ easyConnect: !s.easyConnect }))}>
                <Tog on={on} />
              </button>
            </div>
            <div style={S("margin:9px 18px 0;display:flex;align-items:center;gap:10px")}>
              <span className="cbody" style={S("font-size:13px;flex:1")}>
                SSH access
              </span>
              <span className="mono" style={S("font-size:12px;color:var(--run)")}>
                on
              </span>
            </div>
            <div className="micro" style={S("margin:4px 18px 0")}>
              Required. Easy Connect carries SSH to this computer.
            </div>

            <div style={S("margin:14px 18px 0;padding-top:14px;border-top:1px solid var(--line);display:flex;gap:20px")}>
              <div style={S("width:200px")} className={on ? "undim" : "dim"}>
                <div className="label" style={S("margin-bottom:9px")}>
                  Connect a phone
                </div>
                <button
                  type="button"
                  title="Simulate a phone scanning this code"
                  className={`qr ${scanning ? "scanning" : ""}`}
                  onClick={scan}
                  style={S("width:121px;height:121px;border:1px solid var(--line);border-radius:8px;background:#0C0D0F;display:flex;align-items:center;justify-content:center")}
                >
                  <svg width="105" height="105" viewBox="0 0 105 105" fill="#E8EAED">
                    {QR_RECTS.map(([x, y]) => (
                      <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" />
                    ))}
                  </svg>
                  <span className="scan" />
                </button>
                <div className="micro" style={S("margin-top:9px;line-height:15px")}>
                  {scanning ? "Phone scanning…" : paired ? "Paired with Pixel 8 just now." : "Scan it in the Ghostex mobile app."}
                </div>
              </div>
              <div style={S("flex:1")} className={on ? "undim" : "dim"}>
                <div className="label" style={S("margin-bottom:9px")}>
                  Connect a remote machine
                </div>
                <div style={S("border:1px solid var(--line);border-radius:8px;background:var(--surface-2);padding:11px 13px;display:flex;align-items:center")}>
                  <button type="button" onClick={copy} title="Copy pairing code" style={{ flex: 1, textAlign: "left" }}>
                    <div className="micro" style={copied ? { color: "var(--run)" } : undefined}>
                      {copied ? "Copied" : "Pairing code"}
                    </div>
                    <div className="mono" style={S("margin-top:3px;font-size:15px;color:var(--text)")}>
                      {on ? code : "••••-••••-••••"}
                    </div>
                  </button>
                  <button type="button" title="New code" onClick={() => setCode(newCode())} className="micro" style={S("padding:4px 6px;border-radius:6px;font-size:13px")}>
                    ↻
                  </button>
                </div>
                <div className="micro" style={S("margin-top:9px;line-height:15px")}>
                  Then sign in over SSH from that machine.
                </div>
                <div className="mono" style={S("margin-top:5px;font-size:12px;color:var(--muted)")}>
                  ssh you@mini-01
                </div>
              </div>
            </div>
          </div>

          <div style={S("width:252px;display:flex;align-items:center;justify-content:center")}>
            <div
              style={{
                width: 214,
                height: 428,
                border: `1px solid ${paired && on ? "rgba(91,108,255,.5)" : "var(--line)"}`,
                borderRadius: 20,
                background: "var(--surface)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color .3s",
                position: "relative",
              }}
            >
              <div style={S("height:36px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line)")}>
                <span className="mono" style={{ fontSize: 11, color: on ? "var(--muted)" : "var(--wait)" }}>
                  {on ? `mini-01 · ${lat.current} ms` : "not connected"}
                </span>
              </div>
              <div style={S("padding:12px 11px;flex:1")} className={on ? "undim" : "dim"}>
                <div className="label" style={S("padding:0 3px 9px")}>
                  orbit-api
                </div>
                <div style={S("display:flex;flex-direction:column;gap:6px")}>
                  {PHONE.map((p) => (
                    <button key={p.id} type="button" className={`row click ${openRow === p.id || (!openRow && p.on) ? "on" : ""}`} onClick={() => setOpenRow(p.id)} style={{ display: "block", padding: "8px 9px", textAlign: "left" }}>
                      <div style={S("display:flex;align-items:center;gap:7px")}>
                        <i className="dot" style={{ background: p.c }} />
                        <span className="mono" style={{ fontSize: 11, color: openRow === p.id || (!openRow && p.on) || p.id === "port-legacy-tests" ? "var(--text)" : "var(--muted)" }}>
                          {p.id}
                        </span>
                      </div>
                      <div className="micro" style={S("margin-left:13px;margin-top:2px")}>
                        {p.sub(now)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {!on && (
                <div className="cbody fade" style={S("position:absolute;left:16px;right:16px;top:180px;text-align:center;font-size:12px;line-height:17px;color:var(--text)")}>
                  Not connected. Turn Easy Connect on to reach mini-01.
                </div>
              )}
              <div style={S("padding:11px 13px;border-top:1px solid var(--line)")}>
                <div className="micro" style={S("line-height:15px")}>
                  {openRow && on ? `Attached to ${openRow}. Keystrokes go to mini-01.` : "Same live sessions. The work never left mini-01."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={S("position:relative;width:812px;height:250px;margin-top:16px")}>
          {XS.map((x, i) => (
            <span key={x} className={`conn ${hot === i ? "lit" : ""}`} style={{ position: "absolute", left: x, top: 54, width: 1, height: 30, background: "rgba(91,108,255,.45)" }} />
          ))}
          <span style={S("position:absolute;left:61px;top:84px;width:690px;height:1px;background:rgba(91,108,255,.45)")} />
          {hot !== null && <span className="conn lit" style={{ position: "absolute", top: 84, height: 1, left: Math.min(XS[hot], 405.5), width: Math.abs(XS[hot] - 405.5) + 1 }} />}
          <span className={`conn ${hot !== null ? "lit" : ""}`} style={S("position:absolute;left:405.5px;top:84px;width:1px;height:24px;background:rgba(91,108,255,.45)")} />
          <span className={`conn ${hot !== null ? "lit" : ""}`} style={S("position:absolute;left:405.5px;top:168px;width:1px;height:24px;background:rgba(91,108,255,.45)")} />
          {XS.map((x, i) => (
            <span key={`d${x}`} style={{ position: "absolute", left: x - 2, top: 81.5, width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", boxShadow: hot === i ? "0 0 8px var(--accent)" : "none" }} />
          ))}
          <span style={S("position:absolute;left:403px;top:105px;width:6px;height:6px;border-radius:50%;background:var(--accent)")} />
          <span style={S("position:absolute;left:403px;top:189px;width:6px;height:6px;border-radius:50%;background:var(--accent)")} />
          {on &&
            XS.map((x, i) => <span key={`p${x}`} className="pulse-dot pv30" style={{ left: x - 1, top: 54, animationDelay: `${i * 0.43}s` }} />)}
          {on && <span className="pulse-dot pv24" style={{ left: 404.5, top: 84, animationDelay: "1.1s" }} />}
          {on && <span className="pulse-dot pv24" style={{ left: 404.5, top: 168, animationDelay: "1.9s" }} />}

          <div style={S("position:absolute;left:0;top:0;width:812px;display:flex;gap:16px")}>
            {PLATFORMS.map(([t, s], i) => (
              <div
                key={t}
                className={`card plat ${hot === i ? "lit" : ""}`}
                style={S("width:122px;height:54px;padding:8px 6px;text-align:center")}
                onMouseEnter={() => setLit(i)}
                onMouseLeave={() => setLit(null)}
                {...press(() => setPin((p) => (p === i ? null : i)))}
              >
                <div className="ctitle" style={S("font-size:13px;line-height:16px")}>
                  {t}
                </div>
                <div className="micro" style={S("margin-top:3px;line-height:13px")}>
                  {s}
                </div>
              </div>
            ))}
          </div>

          <div className="card raised" style={S("position:absolute;left:156px;top:108px;width:500px;height:60px;padding:0 20px;display:flex;align-items:center;gap:12px")}>
            <div className="ctitle" style={S("flex:1;font-size:16px")}>
              gxserver daemon
            </div>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              {hot !== null ? `${PLATFORMS[hot][0]} attached` : "hosts: macOS and Linux"}
            </span>
          </div>

          <div className="card" style={S("position:absolute;left:76px;top:192px;width:660px;height:58px;padding:0 20px;display:flex;align-items:center;gap:26px")}>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              Sessions <span style={{ color: "var(--text)" }}>4</span>
            </span>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              Memory <span style={{ color: "var(--text)" }}>412 MB</span>
            </span>
            <span className="mono" style={S("font-size:12px;color:var(--muted)")}>
              Uptime <span style={{ color: "var(--text)" }}>3h {24 + Math.floor(since(now, 0) / 60)}m</span>
            </span>
            <span className="mono" style={S("margin-left:auto;font-size:12px;color:var(--muted)")}>
              zmx keeps these attached
            </span>
          </div>
        </div>
        <p className="micro" style={S("margin-top:12px")}>
          Clients attach; they don't carry the workload. Windows joins as a client through WSL2 while that build is in beta.
        </p>
      </div>
    </>
  );
}
