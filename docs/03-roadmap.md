# 03 — Roadmap

Each milestone ends with something Shmuly can run and judge. Don't start a milestone before the previous one's acceptance criteria pass.

## M0 — Project skeleton

- Vite + React + TS strict, pnpm, ESLint + Prettier, Vitest, Playwright, GitHub Actions (lint, typecheck, test).
- `scripts/copy-pyodide.ts`; Pyodide bundled into the app from `/pyodide/`.
- Tauri 2 desktop shell; CI builds installers for Windows, macOS and Linux and runs the desktop smoke test on each.

**Done when:** `pnpm desktop:dev` opens the app with an empty layout; CI is green; the built app on each OS loads Python from inside itself and prints `2 + 2 = 4` from a worker.

## M1 — Engine core (no 3D, no polish)

- Sim kernel with state, RNG streams, day lifecycle, events, metrics.
- Primitive registry + generated Python stubs.
- Engine worker: Pyodide + sandbox (ops counting, player files under `/player/`, import hook, locked built-ins, error formatting, print capture).
- Main-thread worker client + watchdog + restore from snapshot.
- Headless balance harness (Node + `pyodide` npm) that runs a mission with a solution file.
- One test mission: the prototype's mission 1.

**Done when:** unit tests cover the sim; the balance harness runs mission 1 with a correct and a broken solution; an endless loop gets `OutOfOps`; `sum(range(10**12))` gets stopped by the watchdog and the game recovers; two runs with the same seed produce identical events.

## M2 — Game shell

- Layout, header stats, ticket panel, tabs (Code / Tools / Syntax / Mentor / Journal stub), console.
- CodeMirror editor with file tabs (create/rename/delete files), error markers, completions.
- Run today / Run test / speed; test summary card with tier.
- Save system (files in the app data folder), autosave, export/import JSON with native dialogs, "Start over".

**Done when:** a player can write code in two files that import each other, run mission 1 live and in test mode, reload the page, and find everything as they left it.

## M3 — The 3D town

- r3f scene: island, well, tank, houses (instanced), trees, rocks, weather (rain), day/night tint.
- `BuildingKit` with era-1 procedural models; billboard status bars; pop-in animations.
- Event playback with speeds; manual actions by clicking houses.
- Camera orbit/zoom, building inspector on click.

**Done when:** it looks at least as good as the prototype at 60 fps with 80 houses, and mission 1 is playable by hand and by code.

## M4 — Mission framework + the water arc

- `defineMission`, tiers, visible + hidden test seeds, hints with usage tracking, "Grow" gating.
- Missions 1–3 from `05-era1-missions.md` (parity with the prototype) with balance tests.
- Coins, the build menu (place houses, buy the tank), growth pulled by the player.
- Newspaper headlines and citizen quotes reacting to results.

**Done when:** `pnpm balance` passes for missions 1–3; a fresh player can go from 5 houses to 40 with a tank, building as they go.

## M5 — The rest of Era 1

- Card reader building and primitives; memory meter.
- Missions 4–9 with balance tests.
- Unlock system live: `min`/`max`/`sum` unlock after mission 4; unlock moments shown in the journal.
- Clarify questions (mission 6) and plan notes.
- Journal: notes, inventions, before/after metrics. Skill map (simple version).
- Idle fast-forward with "while you were gone" summary.
- Era 1 finale + teaser of Era 2.

**Done when:** all Era 1 missions pass balance tests; Shmuly plays Era 1 start to finish without needing to ask how the game works.

## M6 — Polish and playtest

- Sound (light, toggleable), onboarding for the first 2 minutes, settings.
- Performance pass against the budgets in `02-architecture.md`.
- Playtest with someone who isn't Shmuly; fix the top 5 confusions.
- Error message review: every common mistake gets a clear hint.
- Release: app icon, code signing (Windows) and signing + notarization (macOS, needs an Apple Developer account), auto-updater, a downloads page (GitHub Releases or itch.io; Steam is an option to decide then).

**Done when:** a new player finishes mission 3 without outside help, and Shmuly signs off on Era 1.

## Later

- Era 2 spec and build (sorting on tape, binary search, messy specs, shared library).
- Accounts + cloud saves (`CloudSaveRepository`).
- Mobile/tablet: only if there is a good answer to writing code on a touch screen.
- AI mentor that reads code and asks questions (behind the existing Mentor interface; needs a small backend).
- Endless mode, leaderboards against your own past solutions.
