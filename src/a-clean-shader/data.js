// PROTOTYPE A · example sessions and transcripts (mini-01 / orbit-api), shared by several steps.

// base = seconds already elapsed when the page loads.
export const SESSIONS = [
  { id: "fix-token-refresh-race", agent: "claude", status: "run", base: 492, note: "reattached" },
  { id: "port-legacy-tests", agent: "codex", status: "wait", base: 215 },
  { id: "write-migration-notes", agent: "codex", status: "run", base: 100 },
  { id: "tokens-to-css-vars", agent: "cursor", status: "done", base: 0 },
];

// k: prompt | tool | say | wait | gap. d = diff stat (muted), ok = green result.
export const TRANSCRIPTS = {
  "fix-token-refresh-race": [
    { k: "prompt", t: "the refresh token races when two tabs wake at once" },
    { k: "gap", h: 6 },
    { k: "tool", t: "read  src/auth/session.ts" },
    { k: "tool", t: "read  src/auth/refresh.ts" },
    { k: "tool", t: "edit  src/auth/refresh.ts", d: "+34 −11" },
    { k: "tool", t: "run   bun test auth", ok: "14 passed" },
    { k: "gap", h: 6 },
    { k: "say", t: "Serialized refresh behind a single-flight lock keyed on the session id. Second tab now awaits the first result instead of issuing its own request." },
    { k: "gap", h: 8 },
    { k: "tool", t: "read  src/auth/__tests__/refresh.spec.ts" },
    { k: "tool", t: "edit  src/auth/__tests__/refresh.spec.ts", d: "+52 −0" },
    { k: "tool", t: "run   bun test auth", ok: "17 passed" },
    { k: "tool", t: "run   bun run typecheck", ok: "clean" },
    { k: "gap", h: 8 },
    { k: "say", t: "Added a regression test that wakes two tabs in the same tick. It fails on the old code and passes on the new one." },
    { k: "gap", h: 8 },
    { k: "git", t: "git   3 files changed", d: "+86 −11" },
  ],
  "port-legacy-tests": [
    { k: "prompt", t: "port the auth specs off the legacy harness" },
    { k: "gap", h: 6 },
    { k: "tool", t: "read  test/legacy/harness.js" },
    { k: "tool", t: 'grep  "legacyHarness" src', d: "12 call sites" },
    { k: "tool", t: "edit  src/auth/__tests__/login.spec.ts", d: "+40 −62" },
    { k: "tool", t: "run   bun test auth/login", ok: "9 passed" },
    { k: "gap", h: 6 },
    { k: "say", t: "The legacy harness sets up global fixtures that three other suites also read. Keep the global fixtures, or inline them per spec?" },
    { k: "gap", h: 6 },
    { k: "wait", t: "waiting for your answer" },
  ],
  "write-migration-notes": [
    { k: "prompt", t: "write migration notes for the token store change" },
    { k: "gap", h: 6 },
    { k: "tool", t: "read  CHANGELOG.md" },
    { k: "tool", t: "read  src/auth/store.ts" },
    { k: "tool", t: "edit  notes/0042-token-store.md", d: "+61 −0" },
    { k: "gap", h: 6 },
    { k: "say", t: "Drafted the notes: what moved, the one-time sign-in for sessions older than 30 days, and how to roll back." },
    { k: "gap", h: 6 },
    { k: "say", t: "Ghostex restarted while I was writing. I picked up from the same line." },
  ],
  "tokens-to-css-vars": [
    { k: "prompt", t: "move the design tokens into CSS variables" },
    { k: "gap", h: 6 },
    { k: "tool", t: "read  src/styles/tokens.ts" },
    { k: "tool", t: "edit  src/styles/tokens.css", d: "+48 −0" },
    { k: "tool", t: "edit  src/components/Button.tsx", d: "+6 −9" },
    { k: "tool", t: "run   bun run build", ok: "clean" },
    { k: "gap", h: 6 },
    { k: "say", t: "All 48 tokens are CSS variables now and components read them through var(). The snapshot run shows no visual diff." },
    { k: "gap", h: 6 },
    { k: "tool", t: "git   4 files changed", d: "+71 −23" },
  ],
};

const FILES = { claude: "src/auth/refresh.ts", codex: "src/auth/__tests__/login.spec.ts", cursor: "src/styles/tokens.css" };

export function replyFor(session, text, wasWaiting) {
  const quoted = text.length > 60 ? `${text.slice(0, 57)}…` : text;
  if (wasWaiting) {
    return [
      { k: "gap", h: 6 },
      { k: "say", t: `Got it: “${quoted}”. Carrying on with the port; 12 call sites left.` },
      { k: "tool", t: "edit  src/auth/__tests__/session.spec.ts", d: "+18 −27" },
    ];
  }
  return [
    { k: "gap", h: 6 },
    { k: "tool", t: `read  ${FILES[session.agent]}` },
    { k: "say", t: `On it: “${quoted}”. I'll work in ${FILES[session.agent].split("/").pop()} and rerun the tests before I report back.` },
  ];
}

export const ORBIT_ROWS = [
  { id: "fix-token-refresh-race", agent: "claude", state: "running" },
  { id: "port-legacy-tests", agent: "codex", state: "waiting" },
  { id: "write-migration-notes", agent: "codex", state: "running" },
  { id: "tokens-to-css-vars", agent: "cursor", state: "done" },
];

export const STATE_COLOR = { running: "var(--run)", waiting: "var(--wait)", done: "var(--done)", starting: "var(--muted)" };
