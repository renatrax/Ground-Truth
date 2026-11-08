# Ground Truth — instructions for Claude Code

Read this file first, every session. Then read the doc in `docs/` that matches the task.

## What this project is

Ground Truth is a desktop game (Windows, macOS, Linux) where a low-poly 3D town (Egg Inc.-style look) runs on Python the player writes. The town grows from a 1950s village to a 2020s smart city. Every system in it — water, ledgers, traffic, networks — is code the player designs from raw primitives.

The goal is not to teach syntax. It is to train a real engineer: inventing algorithms, measuring reality, debugging from evidence, making trade-offs, and living with a codebase that grows.

**The player is also the developer.** Shmuly (18) is building this game with you and will play it. See "Spoiler policy" below.

## The rules that shape every decision

1. **Syntax is free, logic is earned.** Never put a solution to a mission in UI text, hints, tooltips, error messages, sample code, or the Mentor. Hints go up to "the name of the idea", never code.
2. **Primitives, not conveniences.** The game exposes low-level tools only (`need(h)`, `deliver(h, n)`, `read_card()`). Never add a helper that solves part of a mission (`find_cheapest_house()`).
3. **Invent, then unlock.** Python built-ins like `sorted()`, `dict`, `heapq` are locked per era and unlock after the player invents their own version. Locks are data in the unlock registry, not scattered `if`s.
4. **Complexity comes from the town, not the rules.** Early problems are real but small. Difficulty rises because the town grows, and the town only grows when the player chooses to grow it.
5. **Deterministic simulation.** Same seed + same code = same result, always. No `Math.random()`, `Date.now()` or wall-clock time inside the simulation. Use the seeded RNG streams in `src/sim/rng.ts`.
6. **Content is data.** Missions, primitives, tickets, hints and unlocks live in `src/content/` as typed definitions. Engine code must not mention a specific mission.
7. **Every mission has balance tests.** A mission isn't done until reference solutions prove the intended curve: the naive approach misses the target tier and the intended idea reaches it (see `docs/04-testing-and-balance.md`).
8. **Fun first.** If a feature makes it feel like homework, raise it with Shmuly before building it.

## Spoiler policy

Shmuly wants to solve the missions himself.

- Reference solutions live in `tests/solutions/` and hidden rules live in `docs/spoilers/`. Never paste their contents into chat or summaries.
- When reporting work on a mission, describe what was built and whether the balance tests pass, not how to solve it.
- If Shmuly asks for a solution or spoiler directly, give it — it's his call.

## Stack

- **Build:** Vite + TypeScript (strict), pnpm.
- **UI:** React 18 + Zustand for app state.
- **3D:** three.js via @react-three/fiber and @react-three/drei. Low-poly, flat-shaded, mostly procedural geometry and instancing.
- **Editor:** CodeMirror 6 + @codemirror/lang-python.
- **Desktop shell:** Tauri 2 (`src-tauri/`). The game is a web frontend running in the system webview (WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux). Rust only hosts the window and file saves; no game logic in Rust.
- **Python:** Pyodide 0.26.x, bundled inside the app from `public/pyodide/` (never loaded from a CDN or the network), running in a Web Worker together with the simulation. The game must work fully offline.
- **Saves:** JSON files in the app data folder (via the Tauri shell) behind a `SaveRepository` interface; IndexedDB is used only when the frontend runs in a plain browser during development. Cloud saves can be added later without changing callers.
- **Tests:** Vitest (sim and engine), a Node balance harness using the `pyodide` npm package, Playwright for e2e against the frontend in Chromium, and a desktop smoke test that runs the real app (`GT_SMOKE=1`).
- **Distribution:** desktop installers built by CI for Windows (`.msi`/`.exe`), macOS (`.dmg`) and Linux (`.deb`/`.rpm`/`.AppImage`). Mobile is out of scope.

## Commands

```
pnpm desktop:dev    # run the desktop app with hot reload (starts the Vite dev server)
pnpm dev            # frontend only, in a browser (faster for UI work)
pnpm desktop:build  # build installers into src-tauri/target/release/bundle/ (--no-bundle = binary only)
pnpm desktop:smoke  # run the built app with GT_SMOKE=1; passes if Python answers 2 + 2 (Linux headless: xvfb-run -a pnpm desktop:smoke)
pnpm test           # vitest unit tests
pnpm balance        # run every mission's reference solutions headless and check tiers (from M1)
pnpm e2e            # playwright tests against the frontend build
pnpm build          # frontend production build (copies Pyodide into dist/pyodide)
pnpm lint && pnpm typecheck && pnpm format:check
pnpm check          # everything above except the desktop app: lint, format, typecheck, unit, e2e
pnpm check:desktop  # build the desktop binary and run the smoke test (uses xvfb on Linux without a display)
```

Keep these working. If you add a script, document it here.

## Testing happens locally, not on GitHub

GitHub Actions minutes are limited. **All tests run locally while developing.** Before every commit, run `pnpm check`, plus `pnpm check:desktop` when anything in `src-tauri/`, the worker, or Pyodide loading changed. Report the results honestly.

- The CI workflow (`.github/workflows/ci.yml`) is manual-only (`workflow_dispatch`). Never change it to run on push or pull requests, and never trigger it (no `gh workflow run`) unless the person you are working with asks.
- Windows and macOS installers can't be built on Linux. They are built by running CI by hand, only when a release or cross-platform check is actually wanted.

## Where things are

```
src-tauri/         desktop shell (Rust): window, smoke-test hooks, later file saves
src/
  app/            React shell, panels, layout
  editor/         CodeMirror setup, file tabs, error markers, completions from the primitive registry
  render/         three.js scene, buildings, event playback, camera
  engine/         main-thread side: worker client, watchdog, save system, desktop bridge (desktop.ts)
  worker/         engine.worker.ts: Pyodide + simulation, the only place player code runs
  sim/            deterministic simulation kernel (pure TS, no DOM)
  python/         sandbox.py (ops counting, import hook, error formatting) + generated stubs
  content/        primitives, unlocks, eras, missions, tickets, hints, syntax desk
scripts/          copy-pyodide.ts, desktop-smoke.ts
tests/
  sim/            vitest
  engine/         vitest
  e2e/            playwright
  balance/        balance harness
  solutions/      reference solutions per mission (SPOILERS)
docs/             design, architecture, roadmap, testing (docs/spoilers = SPOILERS)
reference/        the working Era 1 prototype (single HTML file) + its Python runtime
```

## How to work

- Follow `docs/03-roadmap.md` milestone by milestone. Finish a milestone's acceptance criteria before starting the next.
- Write sim and engine logic test-first. The sim must be runnable headless in Node.
- The prototype in `reference/` already solved several problems (ops counting with `sys.settrace`, friendly errors, the sorting lock, self-hosting Pyodide). Reuse its ideas; don't copy its single-file structure.
- When a design question isn't answered by `docs/`, ask Shmuly instead of guessing, and record the answer in the relevant doc.
- Keep player-facing text short, plain and friendly. The player may be tired; error messages should help, not lecture.
