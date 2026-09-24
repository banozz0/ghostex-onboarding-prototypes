// PROTOTYPE B4 — panel 3's right side: the workspace window, with one titlebar tab per view that is on, plus a
// dashed one for a view previewed from its row while it is still off.
import { useEffect, useState } from "react";
import { AgentIcon, GLogo, Icon, Menu, RM, at, useNow } from "./ui.jsx";

// The real app's titlebar order after Agents.
export const TAB_ORDER = ["code", "browser", "kanban", "automate", "docs"];
export const META = {
  agents: ["users", "Agents"],
  code: ["code", "Code"],
  browser: ["target", "Browser"],
  kanban: ["kanban", "Kanban"],
  automate: ["bolt", "Automate"],
  docs: ["list", "Docs"],
};
const WS_AGENTS = [
  ["claude", "Claude Code", "Building feature..."],
  ["codex", "Codex", "Ready"],
  ["cursor", "Cursor Agent", "Ready"],
  ["other", "Other agents", "20+ agents"],
];
const SESSION = {
  claude: [
    ["me", "Build the pricing page."],
    ["bot", "Done: /pricing has three tiers and a yearly toggle. Tests pass."],
  ],
  codex: [
    ["me", "Review the pricing page."],
    ["bot", "Looks good. One nit: the yearly toggle has no label."],
  ],
  cursor: [["bot", "Ready when you are."]],
  other: [["bot", "Gemini CLI and OpenCode are ready in this project."]],
};

function SessionView({ agent }) {
  const a = WS_AGENTS.find((x) => x[0] === agent);
  return (
    <div className="wv wv-sess">
      <div className="pane-h">
        <AgentIcon id={agent} size={20} />
        <span className="pt">{a[1]}</span>
        <span className="ph-pill run">
          <i />
          {agent === "claude" ? "Running" : "Ready"}
        </span>
      </div>
      <div className="wv-msgs">
        {SESSION[agent].map(([who, t]) => (
          <div key={t} className={"fb " + who}>
            {who === "bot" && <span className="fb-who">{a[1]}</span>}
            {t}
          </div>
        ))}
      </div>
      <div className="fm-input">
        <span className="dim">Message {a[1]}</span>
      </div>
    </div>
  );
}

/** With the browser skill on, an agent cursor clicks "Get started" every 5.2 s, in step with its CSS loop. */
function BrowserView({ drive, toast }) {
  const [signed, setSigned] = useState(false);
  useEffect(() => {
    if (!drive || RM) return;
    let id;
    const first = setTimeout(() => {
      setSigned(true);
      id = setInterval(() => setSigned(true), 5200);
    }, 2600);
    return () => (clearTimeout(first), clearInterval(id));
  }, [drive]);
  useEffect(() => {
    if (!signed) return;
    const id = setTimeout(() => setSigned(false), 2000);
    return () => clearTimeout(id);
  }, [signed]);
  return (
    <div className="wv">
      <div className="urlbar mono">
        <Icon n="arrowL" size={12} />
        <Icon n="arrowR" size={12} />
        <Icon n="refresh" size={12} />
        <span>http://localhost:3000</span>
      </div>
      <div className="site lg">
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
        <button type="button" className="site-btn" onClick={() => (setSigned(true), toast("You clicked it"))}>
          Get started <Icon n="arrowR" size={13} />
          {drive && !RM && <span className="agent-cursor" aria-hidden="true" />}
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
      <div className={"wv-foot skill" + (drive ? " on" : "")}>
        <b>{drive ? "Your agent is using the browser skill." : "The browser skill is off, so agents can't touch this browser."}</b>
        <em>
          {drive
            ? "It can open pages, click, type, read the page and take screenshots. Ask your agent to use it; remove it in Settings → Integrations."
            : "Switch it on and agents can open pages, click, type, read the page and take screenshots."}
        </em>
      </div>
    </div>
  );
}

function DocsView() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="wv">
      <div className="pane-h">
        <span className="pt">Project plan</span>
        <button type="button" className={"edit-chip" + (saved ? " saved" : "")} onClick={() => setSaved((x) => !x)}>
          {saved ? (
            <>
              <Icon n="check" size={12} /> Saved
            </>
          ) : (
            "Editing..."
          )}
        </button>
      </div>
      <div className="doc">
        <div className="doc-p">An overview of the architecture, key components, and next steps for the agent-driven application.</div>
        <div className="doc-s">System diagram</div>
        <div className="doc-dia">
          <div className="dnode">
            <Icon n="users" size={16} />
            User
          </div>
          <span className="doc-line" />
          <div className="dnode agent">Agent</div>
          <span className="doc-line" />
          <div className="doc-col">
            <div className="dnode row">
              <Icon n="target" size={15} />
              Browser
            </div>
            <div className="dnode row">
              <Icon n="list" size={15} />
              Docs
            </div>
          </div>
        </div>
        <div className="doc-s">Next steps</div>
        <ul className="doc-ul">
          <li>Ship the pricing page</li>
          <li>Label the yearly toggle</li>
          <li>Hand release notes to Automate</li>
        </ul>
      </div>
    </div>
  );
}

const CODE = [
  ["ctx", "import { lock } from './lock';"],
  ["ctx", ""],
  ["ctx", "export async function refresh(session: Session) {"],
  ["del", "  const token = await fetchToken(session);"],
  ["del", "  session.token = token;"],
  ["add", "  return lock.run(session.id, async () => {"],
  ["add", "    const token = await fetchToken(session);"],
  ["add", "    session.token = token;"],
  ["add", "    return token;"],
  ["add", "  });"],
  ["ctx", "}"],
];

function CodeView() {
  const [n, setN] = useState(RM ? CODE.length : 0);
  useEffect(() => {
    if (RM) return;
    const id = setInterval(() => setN((x) => (x >= CODE.length + 4 ? 0 : x + 1)), 420);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="wv wv-code">
      <aside className="code-tree mono">
        <span className="dim">src</span>
        <span className="dim">  auth</span>
        <span className="on">    refresh.ts</span>
        <span>    lock.ts</span>
        <span>  pricing.tsx</span>
      </aside>
      <div className="code-main">
        <div className="code-tabs mono">
          <span className="on">refresh.ts</span>
          <span>M</span>
        </div>
        <div className="code-lines mono">
          {CODE.slice(0, Math.min(n, CODE.length)).map(([k, t], i) => (
            <div key={i} className={"cl " + k}>
              <span className="ln">{i + 1}</span>
              <span className="sg">{k === "add" ? "+" : k === "del" ? "−" : " "}</span>
              {t}
            </div>
          ))}
          {n < CODE.length && <span className="cur" />}
        </div>
      </div>
    </div>
  );
}

// Each beat an agent picks up the next card and finishes the one before it.
const CARDS = [
  ["Label the yearly toggle", "codex"],
  ["Fix the flaky refresh test", "claude"],
  ["Move tokens to CSS variables", "cursor"],
  ["Write release notes", "claude"],
];
function KanbanView() {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (RM) return;
    const id = setInterval(() => setBeat((b) => (b + 1) % 5), 1800);
    return () => clearInterval(id);
  }, []);
  const col = (i) => (i < beat - 1 ? "done" : i === beat - 1 ? "prog" : "todo");
  const cols = [
    ["todo", "To do"],
    ["prog", "In progress"],
    ["done", "Done"],
  ];
  return (
    <div className="wv wv-kan">
      {cols.map(([id, label]) => {
        const cards = CARDS.filter((_, i) => col(i) === id);
        return (
          <div key={id} className="kcol">
            <div className="kh">
              {label} <b>{cards.length}</b>
            </div>
            {cards.map(([t, a]) => (
              <div key={t} className={"kcard " + id}>
                <span>{t}</span>
                {id !== "todo" && <AgentIcon id={a} size={14} />}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const JOBS = [
  ["Nightly dependency bump", "Every night at 02:00", "codex"],
  ["Weekly issue triage", "Mondays at 09:00", "claude"],
  ["Release notes", "Once, Friday at 17:00", "cursor"],
];
function AutomateView({ toast }) {
  const now = useNow(1000);
  const left = 59 - (Math.floor(now / 1000) % 60);
  return (
    <div className="wv wv-auto">
      <div className="pane-h">
        <span className="pt">Automations</span>
        <span className="anext mono">next run in 00:{String(left).padStart(2, "0")}</span>
      </div>
      {JOBS.map(([t, when, a], i) => (
        <div key={t} className="job">
          <span className={"ad" + (i === 0 ? " on" : "")} />
          <span className="job-t">
            <b>{t}</b>
            <em>{when}</em>
          </span>
          <AgentIcon id={a} size={18} />
        </div>
      ))}
      <button type="button" className="job-new" onClick={() => toast("New automation")}>
        <Icon n="plus" size={14} /> New automation
      </button>
    </div>
  );
}

const PANES = { browser: BrowserView, docs: DocsView, code: CodeView, kanban: KanbanView, automate: AutomateView };

/** One view's pane; the workspace window and the view previews (previews.jsx) both draw it. */
export function ViewPane({ id, drive, toast }) {
  const Pane = PANES[id];
  return <Pane drive={drive} toast={toast} />;
}

export function WorkspaceWindow({ views, drive, current, onTab, sel, onAgent, toast }) {
  // A view previewed from its row may still be off: it gets a dashed tab in its real place until it is switched on.
  const tabs = ["agents", ...TAB_ORDER.filter((id) => views[id] || id === current)];
  const view = current === "agents" ? <SessionView agent={sel} /> : <ViewPane id={current} drive={drive} toast={toast} />;
  return (
    <>
      <div className="glass wswin" style={at(758, 116, 875, 720)} />
      <div className="wsbar" style={at(758, 116, 875, 54)}>
        <span className="lights">
          <i />
          <i />
          <i />
        </span>
        <GLogo size={28} />
        <span className="wst">my-app</span>
        <div className="wtabs" role="tablist" aria-label="Workspace views">
          {tabs.map((id) => {
            const ghost = id !== "agents" && !views[id];
            return (
              <button type="button" role="tab" key={id} aria-selected={current === id} className={"wtab" + (ghost ? " ghost" : current === id ? " on" : "")} onClick={() => onTab(id)}>
                <Icon n={META[id][0]} size={14} />
                {META[id][1]}
                {id === "browser" && drive && <span className="wtab-badge">skill on</span>}
                {/* hangs under the dashed tab, so the titlebar never runs out of room or shifts when it turns real */}
                {ghost && <span className="wtab-adds">↑ adds this tab</span>}
              </button>
            );
          })}
        </div>
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
          <button type="button" key={id} className={"wsa" + (sel === id && current === "agents" ? " on" : "")} onClick={() => onAgent(id)}>
            <span className="abox sm">
              <AgentIcon id={id} size={22} />
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
      <div className={"wview wview-" + current} style={at(972, 182, 650, 640)} key={current}>
        {view}
      </div>
    </>
  );
}
