# SPOILERS — Era 1 hidden rules and balance targets

**Shmuly: if you want to play Era 1 fresh, don't read this file.** It's for Claude Code to build and balance the missions.

Claude Code: never quote this file in chat or summaries unless Shmuly asks.

## General

- Every mission: visible test seeds (shown to the player) + hidden seeds (only the result is shown: "passed 4/5 hidden days").
- Reference solutions go in `tests/solutions/<mission-id>/` per `04-testing-and-balance.md`.
- Numbers below are starting points; the balance harness decides.

## 1 — Water for the Village

- Needs fixed at 2 per house, well 30. Nothing hidden.
- Intended idea: describe the manual routine, then loop over house numbers.
- `naive.py`: no solution needed beyond Works; add `broken-iterate-int.py` (`for h in houses():`) and assert the TypeError hint explains that `houses()` is a number and suggests looking at `range` in the Syntax desk.

## 2 — Not Enough Water

- Needs 1–4 uniform, well 35, 20 houses. Prototype seed 1002 checked: in-order delivery misses the best on most days.
- Intended idea: greedy, cheapest houses first. With `sorted` locked, iterate need sizes 1..4 (bucket by value) or write a selection loop.
- Waste: partial deliveries to houses that can't be completed.
- `naive.py` (in-order `deliver(h, need(h))`): ~85–95% of best → Works, not Efficient.
- `efficient.py`: size buckets 1..4 → matches best every day.
- Engineered ops threshold: 50% of budget; a selection loop that rescans everything per house should exceed it, size-bucketing should not. Verify.

## 3 — Wet and Dry

- Needs 1–3, 40 houses; wet = 120, dry = 30; tank capacity 60; leftover well water lost overnight.
- Visible weather pattern `WdWddWWdWd`, seed 3003 (prototype). Hidden: 4 other patterns including two dry days in a row twice.
- Prototype measurements on seed 3003: in-order no tank 68%, greedy no tank 77.5%, in-order + tank 91%, greedy + tank 94.3%.
- Intended: buffer (store surplus, draw on deficit). Engineered insight: on a dry day before a dry day, holding some water back can beat spending it all (sacrifice today's marginal houses to protect tomorrow). Confirm that a "reserve" strategy beats plain greedy+tank on hidden patterns; if not, lower the Engineered threshold to what greedy+tank reliably gets and keep reserve as a journal "bonus insight".

## 4 — The Census

- Deck: 600 cards (house 0–39, age 0–90). Hidden decks: empty deck, one card, all newborns (age 0), oldest appears last, a child aged exactly 12 and a person aged exactly 13.
- Expected reports: `people`, `children` (age < 13), `oldest` (None for an empty deck, as the ticket states).
- Intended: single pass with accumulators; sentinel loop on `None`.
- Classic bugs to assert in `broken-*.py`: `while read_card():` (skips cards — reads twice), `oldest = 0` (fine here except empty deck), `<= 13`.
- Ops: reading costs 1 op extra per card; 2,000/day budget fits one pass of 600 cards with ~2 lines per card, not more. Verify and tune.

## 5 — The Grain Ledger

- Deck: 180 days, 1–4 cards per day, amounts between −120 and +150; first card is the starting stock (day 0).
- Hidden trap (fair, because the ticket says only closing time counts): within one day, stock can dip below zero between cards and recover by the evening. Checking after every card reports a wrong day. Only end-of-day (closing) values count.
- Hidden decks: never goes negative (expect `None`), negative on the very first evening, lowest point on the last day, a day with 4 cards.
- Intended: track the current day; when the day changes, evaluate the closing value of the previous day; don't forget the last day after `None`.
- `naive.py`: checks after each card → Works on visible deck (visible deck has no intra-day dip) but fails hidden → not Engineered. Make sure the visible deck does NOT contain the trap.

## 6 — Fair Rations

- 50 households (hidden: 80), sizes 1–9, sacks 300–700.
- Miriam's rule (revealed only by clarify answers): each family gets `floor(sacks * size / total_people)`. Leftover sacks go one each to the biggest families first; ties go to the lower house number. A family can get zero only if its fair share rounds down to zero.
- Clarify answers: "fair means in proportion to family size", "whole sacks, round down first", "leftovers: biggest families first, ties to the lower house number", "zero is allowed if the share rounds to zero".
- Works: total exact + every family ≥ floor share (any leftover rule). Efficient: Miriam's exact rule (only possible if you asked). Engineered: ops ≤ 50% on 80 families → reusing the "iterate sizes 9..1" trick from mission 2 (a callback the journal can point out), not repeated full scans per leftover sack.
- Invariant lesson: the journal entry praises checking `total == sacks` in code.

## 7 — The Clerk's Program

Shimon's `clerk.py` (about 25 lines, with friendly old-fashioned comments) contains exactly 3 bugs:
1. The running total is reset inside the loop.
2. A guard skips stalls whose number is 0 (`if stall:`), so stall 0's sales are lost.
3. The final loop that applies the market tax uses `range(1, n)` and skips the first stall.

- Minimum changed lines: 3. Efficient: ≤ 6.
- Hidden decks: stall 0 present with big sales; only one stall; empty week.
- Diff metric: count changed/added/removed lines vs. the original (ignore blank lines and comments).

## 8 — The Middle Family

- 500 income cards (hidden: 501, 2, 1, 0 → report None), incomes 0–30 coins.
- Works budgets: 400,000 ops/day, 1,000 memory slots → storing all incomes and sorting by hand (selection/bubble) passes.
- Efficient budgets: 6,000 ops/day, 40 memory slots → storing all is impossible; intended idea: counting array of 31 slots (histogram), then walk to the middle.
- The ticket shows both budget sets. The jump between them is the lesson: the data range is small even though the data is big.
- Engineered: even counts (lower middle), single card, empty deck.
- Era 2 callback: when incomes become 0–1,000,000, counting stops fitting → motivates real sorting on tape.

## 9 — The Second Well

**Needs a design spike before building:** simulate it like the prototype did for mission 3 (Python or Node script under `tests/balance/spikes/`), and only lock numbers once the spike shows the intended curve.

- Grid 40×40, well 0 at the center, houses clustered unevenly: a dense cluster in the north-east, a sparse spread elsewhere. Hidden: cluster positions differ per hidden seed.
- Each house's daily need varies around a hidden per-house mean (1–4). The mean is never shown; it can only be estimated by observing `need(h)` over days.
- Carry time: walking cost = Manhattan distance × 2 per bucket trip (there and back); daily carry-time budget limits deliveries.
- Intended: observe a week; estimate per-house mean demand; choose the dig site that minimizes demand-weighted distance (weighted median per axis is optimal for Manhattan distance — a great journal insight); then route each house to its nearer well.
- Naive strategies to beat: dig at the geometric center of all houses (ignores demand), dig next to the first well, dig at the cluster's corner by eye.
- Targets (to confirm in spike): naive center ≈ 75%, demand-weighted ≈ 90%, weighted + daily routing by remaining carry time ≈ 95%.
