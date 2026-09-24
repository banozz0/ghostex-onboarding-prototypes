// PROTOTYPE B4 — flow shell: stage scaling, chrome, navigation and the one shared state.
import { useCallback, useEffect, useState } from "react";
import { Nebula } from "./nebula.jsx";
import { DarkVeil } from "./darkveil.jsx";
import { GLogo, Icon, at } from "./ui.jsx";
import { Step1, Step2, Step3 } from "./steps-1-3.jsx";
import { Step4, Step5 } from "./steps-4-5.jsx";
import { Finish } from "./finish.jsx";

const W = 1672,
  H = 941;
const N = 5;
// Column split per panel; the divider glides between them. Panel 5 is full width, so its split is
// the stage edge: no divider, and the right column's DarkVeil is clipped away.
const SPLIT = [759, 796, 727, 756, W];
// The DarkVeil spans the widest right column and is clipped at the current split, so it glides with the
// divider while the shader itself never moves or resizes.
const VEIL_X = Math.min(...SPLIT);
const LX = [46, 48, 60, 46, 44];
const STEPS = [Step1, Step2, Step3, Step4, Step5];

export const INITIAL = {
  defaultAgent: "claude",
  connected: false,
  integration: true,
  installQueued: false,
  views: { browser: true, docs: true, code: false, kanban: false, automate: false },
  browserUse: true,
  computerUse: "off",
  phoneQueued: false,
  phonePaired: false,
  notify: true,
  folder: "~/Projects/my-app",
  startWith: "claude",
  view: "chat",
  finished: false,
};

const urlStep = () => {
  const n = parseInt(new URLSearchParams(location.search).get("step"), 10);
  return n >= 1 && n <= N ? n : 1;
};
const fit = () => Math.min(innerWidth / W, innerHeight / H);

export default function App() {
  const [step, setStep] = useState(urlStep);
  const [s, setS] = useState(INITIAL);
  const [nonce, setNonce] = useState(0);
  const [toastMsg, setToast] = useState(null);
  const [scale, setScale] = useState(fit);

  const set = useCallback((patch) => setS((p) => ({ ...p, ...(typeof patch === "function" ? patch(p) : patch) })), []);
  const go = useCallback((n) => {
    setStep(Math.max(1, Math.min(N, n)));
    setS((p) => (p.finished ? { ...p, finished: false } : p));
  }, []);
  const toast = useCallback((m) => setToast({ m, id: Math.random() }), []);
  const restart = () => {
    setS(INITIAL);
    setStep(1);
    setNonce((n) => n + 1);
  };

  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toastMsg]);

  useEffect(() => {
    try {
      history.replaceState(null, "", `?step=${step}`);
    } catch {}
  }, [step]);

  useEffect(() => {
    const r = () => setScale(fit());
    addEventListener("resize", r);
    return () => removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    const k = (e) => {
      if (e.target.closest?.("input,textarea,[contenteditable]") || document.querySelector(".modal-back")) return;
      if (e.key === "ArrowRight") go(step + 1);
      if (e.key === "ArrowLeft") go(step - 1);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [step, go]);

  const Step = STEPS[step - 1];
  const split = SPLIT[step - 1];
  const lx = LX[step - 1];
  const rx = split - 35;

  return (
    <div className="page">
      <div className="stage" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
        <Nebula />
        <div className="veil" style={{ ...at(VEIL_X, 0, W - VEIL_X, H), clipPath: `inset(0 0 0 ${split - VEIL_X}px)` }}>
          <DarkVeil hueShift={25} noiseIntensity={0.01} scanlineIntensity={1} speed={0.6} scanlineFrequency={0} warpAmount={0.2} resolutionScale={1} />
        </div>
        {split < W && <div className="divider" style={{ left: split }} />}

        <div className="lockup" style={{ left: lx - 9 }}>
          <GLogo size={34} />
          <span>Ghostex</span>
        </div>
        <div className="counter" style={{ left: rx - 120 }}>
          <b>{String(step).padStart(2, "0")}</b> <span>/ 0{N}</span>
        </div>

        <div className="scene" key={`${nonce}-${step}-${s.finished}`}>
          {s.finished && step === N ? (
            <Finish s={s} set={set} go={go} toast={toast} restart={restart} />
          ) : (
            <Step s={s} set={set} go={go} toast={toast} step={step} />
          )}
        </div>

        <div className="foot" style={{ left: lx, width: rx - lx }}>
          <button type="button" className="back" disabled={step === 1} onClick={() => go(step - 1)}>
            <Icon n="arrowL" size={18} />
            Back
          </button>
          <div className="dots" role="tablist" aria-label="Panels">
            {STEPS.map((_, i) => (
              <button type="button" key={i} aria-label={`Panel ${i + 1}`} aria-selected={i + 1 === step} onClick={() => go(i + 1)}>
                <i className={i + 1 === step ? "on" : i + 1 < step ? "past" : ""} />
              </button>
            ))}
          </div>
          <button type="button" className="next" disabled={step === N} onClick={() => go(step + 1)}>
            Next
            <Icon n="arrowR" size={18} />
          </button>
        </div>

        {toastMsg && (
          <div className="toast" key={toastMsg.id} style={{ left: split >= W ? W / 2 : split + (W - split) / 2 }}>
            <Icon n="checkCircle" size={15} />
            {toastMsg.m}
          </div>
        )}
        <div className="vignette" />
        <div className="grain" />
      </div>

      <div className="proto-pill">
        <span>Prototype B4 · Extensions</span>
        <button type="button" onClick={restart}>
          Restart
        </button>
      </div>
    </div>
  );
}
