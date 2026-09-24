// PROTOTYPE B2 — after onboarding: offer what was saved for later, and the Settings → Remote pairing mock.
import { useEffect, useState } from "react";
import { Icon, InstallGuide, Modal, QR, RM, Toggle } from "./ui.jsx";
import { Cta } from "./steps-1-3.jsx";

const ASK = {
  phone: ["Connect your phone now?", "Ghostex opens Settings → Remote, where you turn on Easy Connect and scan the QR code.", "Connect now"],
  install: ["Open the install guide now?", "It lists agents you can add; install one and Ghostex picks it up.", "Open guide"],
};
const CHOICES = [
  ["install", "plus", "Install guide", "Add another agent to Ghostex."],
  ["phone", "phone", "Phone setup", "Connect your phone with Easy Connect."],
];

/** Settings → Remote, as the real app shows it: Easy Connect, one password prompt, the QR code, then Paired. */
function RemoteSettings({ onClose, toast }) {
  const [stage, setStage] = useState("off"); // off → password → on → paired
  useEffect(() => {
    if (stage !== "on") return;
    const id = setTimeout(() => setStage("paired"), RM ? 0 : 2800);
    return () => clearTimeout(id);
  }, [stage]);
  useEffect(() => {
    if (stage === "paired") toast("Paired with your phone");
  }, [stage]);
  const on = stage === "on" || stage === "paired";
  const close = () => onClose(stage === "paired");
  return (
    <Modal title="Settings" onClose={close} width={700}>
      <div className="rset">
        <nav className="rset-nav">
          {["General", "Agents", "Integrations", "Remote"].map((n) => (
            <span key={n} className={n === "Remote" ? "on" : ""}>
              {n}
            </span>
          ))}
        </nav>
        <div className="rset-main">
          <div className="pc-t">Connect to this computer</div>
          <div className="pc-s">Use Ghostex from your phone. Most people only need Easy Connect.</div>
          <div className="pc-row">
            <b>Easy Connect</b>
            <span className="pc-rec">Recommended</span>
            <Toggle size="sm" on={on} label="Easy Connect" onClick={() => setStage(on ? "off" : "password")} />
          </div>
          <div className="pc-row sub">
            <span>Remote access</span>
            <span className={on ? "ok mono" : "dim mono"}>{on ? "on" : "off"}</span>
          </div>
          <div className="pc-qr">
            {on ? (
              <button type="button" className="rset-qr" title="Simulate your phone scanning this code" onClick={() => stage === "on" && setStage("paired")}>
                <QR size={132} />
              </button>
            ) : (
              <div className="pc-qr-off">
                <Icon n="lock" size={22} />
              </div>
            )}
            <div className="pc-qr-t">
              <b>Connect a phone</b>
              <span>{on ? "In the Ghostex app: Connect your computer → Scan code." : "Turn on Easy Connect to show the code."}</span>
              {stage === "on" && (
                <span className="rset-wait">
                  <span className="spinner" /> Waiting for your phone…
                </span>
              )}
              {stage === "paired" && (
                <span className="rset-wait ok">
                  <Icon n="checkCircle" size={16} /> Paired with your phone
                </span>
              )}
            </div>
          </div>
        </div>
        {stage === "password" && (
          <div className="pc-sheet">
            <Icon n="lock" size={22} />
            <b>Ghostex wants to turn on remote access.</b>
            <em>Enter your password to allow this.</em>
            <span className="pc-pw mono">••••••••</span>
            <span className="pc-sheet-btns">
              <button type="button" className="ghost" onClick={() => setStage("off")}>
                Cancel
              </button>
              <button type="button" className="cta filled sm" onClick={() => setStage("on")}>
                Allow
              </button>
            </span>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <Cta filled arrow={false} className="sm" onClick={close}>
          Done
        </Cta>
      </div>
    </Modal>
  );
}

/** Sven's call: real pairing waits until the walkthrough is over; with both saved, a chooser picks which goes first. */
export function AfterOnboarding({ s, set, toast }) {
  const [left, setLeft] = useState(() => [s.installQueued && "install", s.phoneQueued && !s.phonePaired && "phone"].filter(Boolean));
  const [open, setOpen] = useState(null); // choose | ask | install | phone
  useEffect(() => {
    if (!left.length) return;
    const id = setTimeout(() => setOpen(left.length > 1 ? "choose" : "ask"), RM ? 0 : 900);
    return () => clearTimeout(id);
  }, []);
  const done = (id, patch = {}) => {
    const rest = left.filter((x) => x !== id);
    setLeft(rest);
    set({ [id === "install" ? "installQueued" : "phoneQueued"]: false, ...patch });
    setOpen(rest.length ? "ask" : null);
  };
  const later = () => {
    setOpen(null);
    toast("You can do this anytime from Settings");
  };

  if (open === "choose")
    return (
      <Modal title="Two things are waiting" onClose={later} width={560}>
        <p className="modal-p">Pick one to do now; the other one comes right after.</p>
        <div className="choose-cards">
          {CHOICES.map(([id, ic, t, d]) => (
            <button type="button" key={id} className="choose-card" onClick={() => setOpen(id)}>
              <Icon n={ic} size={22} />
              <b>{t}</b>
              <em>{d}</em>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={later}>
            Later
          </button>
        </div>
      </Modal>
    );
  if (open === "ask") {
    const [title, body, yes] = ASK[left[0]];
    return (
      <Modal title={title} onClose={later} width={480}>
        <p className="modal-p">{body}</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={later}>
            Later
          </button>
          <Cta filled arrow={false} className="sm" onClick={() => setOpen(left[0])}>
            {yes}
          </Cta>
        </div>
      </Modal>
    );
  }
  if (open === "install") return <InstallGuide toast={toast} onClose={() => done("install")} />;
  if (open === "phone") return <RemoteSettings toast={toast} onClose={(paired) => done("phone", paired ? { phonePaired: true } : {})} />;
  return null;
}
