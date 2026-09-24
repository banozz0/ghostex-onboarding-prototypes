// PROTOTYPE A · stage, chrome, and the one flow state every step reads and writes.
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Arrow, BackArrow } from "./ui.jsx";
import Step1 from "./steps/Step1.jsx";
import Step2 from "./steps/Step2.jsx";
import Step3 from "./steps/Step3.jsx";
import Step4 from "./steps/Step4.jsx";
import Step5 from "./steps/Step5.jsx";
import Step6 from "./steps/Step6.jsx";
import Step7 from "./steps/Step7.jsx";
import Step8 from "./steps/Step8.jsx";
import Finish from "./steps/Finish.jsx";

const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8];
const pad = (n) => String(n).padStart(2, "0");
const clamp = (n) => Math.min(8, Math.max(1, n));

export const INITIAL = {
  agent: "claude",
  views: { browser: true, code: true, docs: false, kanban: false, automate: false },
  caps: { browserUse: true, computerUse: false, control: true, notifications: true },
  osGranted: false,
  hooks: "installed",
  easyConnect: true,
  folder: "~/code/orbit-api",
  startWith: "claude",
  defaultView: "chat",
  projectSessions: [],
};

function useScale() {
  const get = () => Math.min(window.innerWidth / 1672, window.innerHeight / 941);
  const [scale, setScale] = useState(get);
  useLayoutEffect(() => {
    const f = () => setScale(get());
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return scale;
}

function Flow({ startStep, restart }) {
  const scale = useScale();
  const [step, setStep] = useState(startStep);
  const [finished, setFinished] = useState(false);
  const [state, setState] = useState(INITIAL);
  const set = useCallback((patch) => setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) })), []);

  const go = useCallback((n) => {
    setFinished(false);
    setStep(clamp(n));
  }, []);
  const next = useCallback(() => setStep((s) => clamp(s + 1)), []);
  const back = () => (finished ? setFinished(false) : go(step - 1));

  useEffect(() => {
    const u = new URL(location.href);
    u.searchParams.set("step", String(step));
    history.replaceState(null, "", u);
  }, [step]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input,textarea,[contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && !finished && step < 8) go(step + 1);
      if (e.key === "ArrowLeft" && (finished || step > 1)) back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const Comp = finished ? Finish : STEPS[step - 1];
  const props = { state, set, next, go, finish: () => setFinished(true), restart };

  return (
    <div className="stage">
      <div className="stage-box" style={{ width: 1672 * scale, height: 941 * scale }}>
        <div className="panel" style={{ transform: `scale(${scale})` }}>
          <div className="shader" />
          <div className="divider" />
          <div className="lockup">
            <span className="gx-logo" role="img" aria-label="Ghostex" />
            <span>Ghostex</span>
          </div>
          <div className="counter">
            <b>{pad(step)}</b> <i>/ 08</i>
          </div>

          <div className="step" key={finished ? "done" : step}>
            <Comp {...props} />
          </div>

          <div className="foot">
            {(step > 1 || finished) && (
              <button type="button" className="back" onClick={back}>
                <BackArrow />
                Back
              </button>
            )}
            <div className="dots">
              {STEPS.map((_, k) => (
                <button type="button" key={k} aria-label={`Step ${k + 1}`} onClick={() => go(k + 1)}>
                  <i className={k === step - 1 ? "on" : ""} />
                </button>
              ))}
            </div>
            {step < 8 && !finished && (
              <button type="button" className="next" onClick={next}>
                Next
                <Arrow />
              </button>
            )}
          </div>
          <div className="grain" />
        </div>
      </div>
      <div className="proto">
        <span>Prototype A · Clean shader</span>
        <button type="button" onClick={restart}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [run, setRun] = useState(0);
  const q = parseInt(new URLSearchParams(location.search).get("step"), 10);
  const [start, setStart] = useState(clamp(Number.isFinite(q) ? q : 1));
  const restart = useCallback(() => {
    setStart(1);
    setRun((r) => r + 1);
  }, []);
  return <Flow key={run} startStep={start} restart={restart} />;
}
