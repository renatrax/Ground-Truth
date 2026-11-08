# 06 — What the prototype taught us

`reference/prototype-era1.html` is a single-file playable version of missions 1–3, built and playtested on 2026-11-08. Its Python runtime is `reference/runtime.py`; the HTML has a `/*RUNTIME*/""` placeholder where that file is injected as a JSON string at build time. Shmuly played it through and reached the Engineered tier on mission 3 (94.3%).

## What worked (keep)

- **Doing it by hand first.** Clicking houses for a few days, then writing code to escape the grind, made the first program feel like a superpower.
- **The same problem growing.** Missions 1 → 2 → 3 are the same water system at 5, 20 and 40 houses. Old code still runs and visibly stops being good enough.
- **"Best possible" in the day report** (mission 2) shows that a better answer exists without hinting at how.
- **Ops counting with `sys.settrace`** (line events, only for player frames) catches endless loops cleanly and gives a number for "too slow".
- **Friendly errors:** line number + one hint (`Did you mean deliver?`, "The village doesn't have a tank yet.").
- **Locking `sorted()`** pushed toward inventing an approach instead of reaching for a built-in.
- **Fixed test days with seeds** made results reproducible and fair.
- **Simulating the balance before building** (`reference/balance-spike-mission3.js`) found the right numbers in minutes. Do this for every new mission.
- **Low-poly procedural geometry** (cones for roofs, cylinders for wells, golden-angle house placement) looked good with almost no assets.

## Problems found (fixed in the prototype, design them out)

- **Pyodide from a CDN failed** inside a sandboxed host: the loader script came through, but its runtime fetches (wasm, stdlib) were blocked, and the Run buttons stayed silently disabled. → Self-host Pyodide, and show a clear loading state and a clear failure message. Let the player play by hand while Python loads.
- **Some hosts refuse `.zip` files.** The stdlib can be renamed and passed via `loadPyodide({ stdLibURL })`. The desktop app serves files itself, so this shouldn't matter, but keep the option in mind.
- **Status bars rotated with their house** and went edge-on. → Billboard UI elements to face the camera.
- **First-mission camera was too close.** → Frame the whole island for each town size.

## Player behavior observed

- The player printed `well_left()`, `tank_level()` and `houses()` at the top of `run_day()` to understand the state. → Make print-debugging comfortable: day-labeled console, collapsible per day, and later a "watch" panel.
- The player computed totals before acting (planning), then acted. → Good sign that missions with "measure, then decide" will land.
- Ops went from ~370 (reference) to ~610 for the player's correct solution. Both are fine at Works/Engineered here, but it shows ops budgets need margins and that Efficient thresholds should be tested against several correct styles, not just the reference.
- The player asked not to be told whether his code was right before running it. → The game's own feedback (day reports, tiers) should be the judge; the Mentor never volunteers a verdict.
