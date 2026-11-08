# 01 — Game design

The full design discussion lives in the "Ground Truth — Game Design Document" (claude.ai doc). This file is the build-ready summary Claude Code works from. If they disagree, this file wins; update both.

## Pitch

A low-poly 3D town builder where every system runs on Python you write. Eight eras, 1950s to 2020s. The town grows only when your code can carry it, and growth is what breaks your old code.

## Core loop

1. The town needs something (a ticket from a named citizen or the mayor).
2. You clarify, plan, and write code from raw primitives.
3. The simulation runs your code against the town for one or more days.
4. Metrics come back: happiness, cost, ops, waste, reliability.
5. Coins and population grow. You spend coins to build and upgrade.
6. You choose when to grow. A bigger town brings bigger load and new problems.

The loop never resets. Every system you've shipped keeps running and keeps getting more load.

## Two layers

### Town layer (the fun of building and managing)

- **Map:** a floating low-poly island per era (later: several districts). Tiles for houses, roads, utilities, special buildings.
- **Build:** spend coins to place buildings. Placement matters in later missions (walking distance, pipe length, cable cost).
- **Manage:** coins in from happy citizens, upkeep out. Happiness per district.
- **Upgrade:** buildings have tiers. Upgrades add capacity, change the primitives they expose, and often break assumptions in old code.
- **Grow:** the player presses "Grow" to unlock the next town size. Never forced, never on a timer.
- **Feedback:** water bars over houses, red when thirsty; a town newspaper with headlines about your systems; citizens with names and short quotes.
- **Idle progress:** systems keep running while the player is away. On return, the sim fast-forwards the missed days deterministically and shows a summary ("While you were gone: 6 days, 94% happy, 212 coins").
- **Era look:** wood → brick → concrete → glass → solar. Era transitions are a big visual moment.

### Code layer (the engineering)

- One codebase per save, multiple files, real `import` between them. Files persist across missions and eras.
- Each building or system exposes **primitives** only. The set grows with buildings and eras.
- **Ops budget** per day, counted by the sandbox. "Too slow" is a number.
- **Memory budget** per era (from Era 1 mission 7 on): measured slots of stored values.
- **Locked built-ins** that unlock after you invent your own version.
- **Deterministic** runs with seeds; rewind and step-through are possible because everything replays.

## Anatomy of a mission

1. **Ticket:** plain-language request, often vague. No method, no function signatures beyond the primitives.
2. **Clarify (optional):** ask the requester from a list of questions. Answers reveal constraints. (Introduced in Era 1, mission 6.)
3. **Plan note (optional in Era 1):** a short text box. Saved to the journal.
4. **Build:** edit code, run today (live day), use print().
5. **Test:** fixed test days (visible) + hidden "reality" days. The goal is checked on tests, not on lucky live days.
6. **Tiers:** Works → Efficient → Engineered, each a metric threshold. Works is enough to continue. Engineered gives bonus coins and journal badges.
7. **Live with it:** the mission's system stays in the town and runs every day after.

## Help system

- **Syntax desk:** unlimited Python syntax examples. Free.
- **Mentor:** three hints per mission, opened one at a time: a question → a smaller version → the name of the idea. Never code. Hint use is recorded and caps that run at the Works tier (replaying without hints lifts the cap).
- **Friendly errors:** line number, plain message, one hint ("Did you mean deliver?", "Is there a loop that never stops?").
- **Later (not Era 1):** an AI mentor that reads the player's code and asks questions. Needs a backend; design the Mentor interface so it can be swapped in.

## Progress

- **Skill map:** decomposition, data modeling, algorithms, complexity, measurement, modeling, control, debugging, reliability, design, systems, security, judgment. Missions tag the skills they use; skills level up on Efficient/Engineered without hints.
- **Engineering journal:** plan notes, the inventions that unlocked built-ins, and before/after metrics per improvement.
- **Real-world bridge:** each era ends with one small real project outside the game (listed in the claude.ai design doc).

## Eras (overview)

| Era | Years | Town | New hardware | Big new idea |
| --- | --- | --- | --- | --- |
| 1 | 1950s | Village, 5 → 80 houses | Well, tank, punch cards | Loops, state, greedy choices, buffers, streaming, invariants |
| 2 | 1960s | Town, 2,000 | Mainframe, tape | Sorting, searching, indexes, messy specs, functions/modules |
| 3 | 1970s | 15,000 | Minicomputers, sensors | Calibration, control loops, state machines, discovery |
| 4 | 1980s | 40,000 | PCs, disks | Data structures, backtracking, compression, object design |
| 5 | 1990s | 80,000 | Networks | Graphs, protocols, concurrency, legacy (Y2K) |
| 6 | 2000s | 150,000 | The web | Caching, security, testing, ranking |
| 7 | 2010s | 300,000 | Mobile, cloud | Matching, heuristics, distributed state, experiments |
| 8 | 2020s | 500,000 | Smart city | Prediction, optimization, clustering, open mandates |

Era 1 is specified in `05-era1-missions.md`. Later eras get their own spec when their milestone starts.

## Decided

- Platform: desktop app (Windows, macOS, Linux) via Tauri. Decided 2026-11-08: writing code on a phone isn't realistic, so no mobile version for now.
- Look: low-poly 3D, Egg Inc.-style diorama.
- Players: Shmuly first; saves designed so accounts and cloud saves can be added later.
- Language: English UI; Python code.

## Still open

- Name ("Ground Truth" is the working title).
- How strict invent-then-unlock is (all built-ins vs. the big ones). Default for now: lock `sorted`, `list.sort`, `dict`, `set`, `min`, `max`, `sum` in Era 1; Era 1 unlocks `min`, `max`, `sum` after mission 4.
- Real-time deadlines for incidents (default: no).
