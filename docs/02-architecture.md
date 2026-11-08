# 02 — Architecture

## The big picture

```
 Main thread                                   Engine worker (Web Worker)
 ┌───────────────────────────┐   messages    ┌──────────────────────────────────┐
 │ React UI (panels, editor) │ ───────────▶  │ Simulation kernel (TS, pure)     │
 │ Zustand store             │               │ Pyodide + sandbox.py             │
 │ Town renderer (r3f)       │ ◀───────────  │ Primitive registry (TS + Python) │
 │ Save system (IndexedDB)   │  DayResult    │ Mission runtime                  │
 │ Watchdog                  │  (events,     └──────────────────────────────────┘
 └───────────────────────────┘   metrics)
```

**Why the sim lives in the worker with Python:** player code calls primitives synchronously (`need(h)` must return a number right now). The simplest correct design is to keep the sim state next to Python in the same worker. The main thread never runs player code and never mutates sim state; it renders from event logs and snapshots.

**Why a watchdog:** `sys.settrace` counts Python lines, but a single builtin call (`sum(range(10**12))`) can run for a long time without line events. The main thread watches the worker; if a day takes longer than a hard limit (default 5 s), it terminates the worker, starts a new one, restores the last snapshot, and reports "Your code ran too long and was stopped."

## Simulation kernel (`src/sim/`)

- Pure TypeScript, no DOM, runnable in Node for tests.
- **State** is a plain serializable object: town, buildings, citizens, resources, day counter, RNG states. `structuredClone`-able, versioned.
- **RNG:** seeded generator (xoshiro128** or mulberry32) with **named streams** (`weather`, `needs`, `citizens`, …) so adding a new random feature doesn't shift every other number.
- **Day lifecycle:**
  1. `beginDay(state, missionCtx)` → creates a `DayContext` (today's needs, well output, cards to read…).
  2. Player's `run_day()` runs; every primitive call goes through the registry, mutates the `DayContext`, and appends an **event** (`{t:'deliver', h:3, n:2}`).
  3. `endDay(state, ctx)` → computes metrics, updates state (tank carries over, well water lost…), returns `DayResult`.
- **Integer math** for anything compared in tests.
- **No mission-specific code in the kernel.** Missions plug in via hooks (`setup`, `beginDay`, `endDay`, `metrics`).

## Primitive registry (`src/content/primitives/`)

Each primitive is defined once:

```ts
definePrimitive({
  name: 'deliver',
  signature: 'deliver(h, n) -> int',
  doc: 'Carry n buckets from the well to house h. Returns how many arrived.',
  args: [{ name: 'h', kind: 'houseIndex' }, { name: 'n', kind: 'nonNegInt' }],
  cost: { ops: 1 },              // extra ops beyond the line itself (optional)
  availableWhen: (town) => town.has('well'),
  impl: (ctx, h, n) => { /* mutate DayContext, push event, return amount */ },
});
```

From this one definition the build generates:
- the Python stub module the player imports from (with argument checks and friendly errors),
- the Tools tab documentation,
- editor autocompletion,
- availability per era/building.

Argument validation happens in Python stubs (so errors point at the player's line) using shared `kind` validators.

## Python sandbox (`src/python/sandbox.py`)

Proven in the prototype (`reference/runtime.py`); productionize it:

- **Ops counting:** `sys.settrace` with a global tracer that only returns a local tracer for frames whose `co_filename` starts with `/player/`. Count `line` events; raise `OutOfOps` past the budget.
- **Player files:** written into the Pyodide FS under `/player/`. `sys.path` includes `/player`, so `import helpers` works between the player's files. Clear player modules from `sys.modules` before each run.
- **Import hook:** a custom `__import__` in the player's builtins allows only player files, the game API module, and modules unlocked for the era (`math` from Era 2, etc.).
- **Locked built-ins:** builtins dict per run built from the unlock registry; locked names raise a friendly `LockedError` explaining when they unlock. Also a static check for `.sort(` until unlocked.
- **Memory meter (Era 1, mission 7+):** after each primitive call and at end of day, walk objects reachable from player globals and live player frames; count scalar slots (int/str/bool/float each = 1, containers = sum of items). Over budget → `OutOfMemory` with the count.
- **Error formatting:** line number in the player's file, plain message, one hint (close-match names via `difflib`, missing tools, syntax tips). Return JSON to the worker.
- **print():** captured and sent to the console with the day number.

## Worker protocol (`src/worker/`)

Typed messages (discriminated unions, shared types in `src/engine/protocol.ts`):

| Main → worker | Worker → main |
| --- | --- |
| `init { pyodideBase }` | `ready` / `initFailed { reason }` |
| `loadSave { snapshot }` | `loaded` |
| `setFiles { files }` | `filesOk` / `compileError` |
| `runDay { mode: 'live' | 'test', missionId, seed? }` | `dayResult { events, metrics, ops, mem, logs, error? }` |
| `runTest { missionId }` | stream of `dayResult` + `testSummary { tier, perDay }` |
| `manual { action }` | `dayResult` (partial) |
| `fastForward { days }` | `idleSummary` |
| `snapshot` | `snapshot { state }` |

The worker processes one message at a time. The watchdog runs on the main thread.

## Rendering (`src/render/`)

- react-three-fiber scene; **instanced meshes** for repeated buildings and trees; flat-shaded `MeshLambertMaterial`; one directional light with soft shadows; per-era palettes.
- Procedural low-poly geometry first (as in the prototype). A `BuildingKit` maps building type + tier + era → geometry/material, so glTF models can replace procedural ones later without touching game code.
- **Event playback:** `DayResult.events` are animated (bucket droplets, card reader flashes) with a speed setting; speed max = apply instantly. The renderer keeps "shown" values separate from true state and catches up as animations land.
- Billboarded status bars and icons; pop-in animation for new buildings; camera orbit and zoom; click picking for manual actions and building inspection.
- Target: 60 fps with 500 buildings on a mid laptop.

## UI (`src/app/`, `src/editor/`)

- Layout: header stats → 3D town (left) → right panel (ticket, tabs: Code / Tools / Syntax / Mentor / Journal, run controls, console).
- Editor: CodeMirror 6, Python mode, file tabs, error line markers, completions from the primitive registry, Tab = 4 spaces, auto-indent after `:`.
- Console: logs, day reports, errors with hints; capped length.
- Responsive down to a laptop screen; mobile is view-only for now.

## Saves (`src/engine/save/`)

```ts
interface SaveRepository {
  list(): Promise<SaveMeta[]>;
  load(id: string): Promise<SaveFile>;
  save(file: SaveFile): Promise<void>;
  export(id: string): Promise<Blob>;   // JSON backup
  import(blob: Blob): Promise<SaveMeta>;
}
```

- Now: `IndexedDbSaveRepository` (via `idb-keyval`). Autosave after each day and on code edits (debounced).
- Later: `CloudSaveRepository` (e.g. Supabase) behind the same interface + accounts.
- `SaveFile` = `{ version, profile, simState, files, journal, missions: {bestTier, metrics, hintsUsed}, unlocks, settings }`. Every schema change adds a migration in `src/engine/save/migrations.ts`.

## Content (`src/content/`)

```
content/
  primitives/         one file per building family (well.ts, cards.ts…)
  unlocks.ts          locked built-ins and modules, and what unlocks them
  eras/era1/
    era.ts            palette, hardware budgets, buildings available
    missions/*.ts     one mission per file (see 05-era1-missions.md)
  syntax-desk.ts
```

A mission definition:

```ts
defineMission({
  id: 'e1-m2-not-enough-water',
  era: 1,
  ticket: { from: 'Yossi', role: 'Water carrier', text: '…' },
  town: { houses: 20 },
  primitives: ['houses', 'need', 'deliver', 'well_left'],
  budgets: { opsPerDay: 600 },
  dayModel: 'scarceWell',            // name of a sim hook set
  tests: { visibleSeeds: [1002], visibleDays: 5, hiddenSeeds: [/* … */] },
  tiers: { works: …, efficient: …, engineered: … },   // predicates over test metrics
  hints: ['…', '…', '…'],
  unlocksOnComplete: [],
  skills: ['algorithms', 'decomposition'],
});
```

## Hosting and Pyodide

- Copy Pyodide's core files from `node_modules/pyodide` into `public/pyodide/` at build (`scripts/copy-pyodide.ts`). Load with `loadPyodide({ indexURL: '/pyodide/' })`. Never fetch from a CDN at runtime: sandboxed hosts block it, and offline play should work.
- Vercel static deploy. Long cache headers for `/pyodide/*`.
- First load is ~13 MB; show a progress state and let the player play by hand meanwhile.

## Performance budgets

| Thing | Budget |
| --- | --- |
| Sim day, excluding player code | < 20 ms at Era 1 sizes |
| Worker startup (cached) | < 3 s |
| Render | 60 fps, 500 buildings |
| Idle fast-forward | 30 days < 2 s at Era 1 sizes |
