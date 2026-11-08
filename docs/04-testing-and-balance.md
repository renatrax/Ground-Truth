# 04 — Testing and balance

A mission is a teaching tool, so it can be "broken" in ways a normal feature can't: the naive approach accidentally passes, the intended idea doesn't fit the budget, or a lucky seed hides the difference. Balance tests catch this automatically.

## Balance harness (`tests/balance/`)

- Runs in Node with the `pyodide` npm package and the same `sandbox.py` and sim kernel as the browser. No browser needed.
- For every mission, loads each reference solution from `tests/solutions/<mission-id>/` and runs the mission's **visible and hidden** test seeds.
- Asserts each solution lands exactly in its expected tier.

Reference solution files (SPOILERS, Shmuly shouldn't open these):

| File | Meaning | Expected result |
| --- | --- | --- |
| `naive.py` | What a beginner writes first | Fails the tier named in its header comment |
| `works.py` | Correct but not efficient | Exactly Works |
| `efficient.py` | The intended idea | Efficient |
| `engineered.py` | Intended idea + edge cases/robustness | Engineered |
| `broken-*.py` | Common mistakes | Specific friendly error or failure (asserted text) |

Each file starts with a header:

```python
# expect: tier=works
# expect-fail: efficient   (reason: wastes buckets on partial deliveries)
```

The harness parses these headers, so adding a case is just adding a file.

**Margin rule:** the intended solution must clear its tier threshold by a margin (default 3 percentage points or 10% of the budget), and the naive one must miss by a margin. This keeps balance stable when numbers are tweaked.

**Seed robustness:** for each mission, run the reference solutions on 50 random extra seeds and report the spread. If the naive solution reaches the target tier on more than 5% of seeds, the mission is too easy to luck through; tune it.

## Simulation tests (`tests/sim/`)

- Determinism: same seed + same event sequence → identical state digest (hash), across 100 days.
- Snapshot round-trip: `restore(snapshot(state))` equals `state`.
- Each primitive: argument validation, effect on `DayContext`, event emitted.
- Save migrations: every old fixture save loads into the current version.

## Sandbox tests

Run in Node with Pyodide:

- Endless loop → `OutOfOps` with the right line.
- Expensive builtin → stopped by the watchdog (browser-only, in e2e).
- Locked built-in → `LockedError` with the unlock message; `.sort(` static check.
- Import hook: player file import works; `import os` refused with a friendly message; unlocked module allowed.
- Memory meter: counts match hand-computed values for lists, nested lists, globals.
- Error formatting: `NameError` close-match hint, syntax errors with line numbers, wrong-type arguments to primitives.
- Player state persists across days within a test run, and is fresh per run.

## End-to-end (`tests/e2e/`, Playwright)

- Fresh load → Pyodide ready → write the mission 1 solution → Run test → Works shown.
- Reload keeps code and progress.
- Manual click on a house delivers a bucket.
- Endless-loop code doesn't freeze the page.

Note: CI must serve Pyodide from `public/pyodide/` (no CDN), same as production.

## Playtesting

- After each milestone, Shmuly plays it and notes: where he was confused, where it felt like homework, where it felt great.
- Record findings in `docs/playtest-log.md` (date, mission, finding, decision).
