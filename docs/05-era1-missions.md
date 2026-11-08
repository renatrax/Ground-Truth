# 05 — Era 1: The Village (1950s)

Player-facing spec: tickets, tools, budgets, goals. **No solutions here.** Hidden rules, intended ideas and balance targets are in `docs/spoilers/era1.md`.

## Era overview

- **Town:** a floating island village. 5 houses at the start, 80 by the end.
- **Look:** wooden houses, thatched and tiled roofs, a stone well, dirt paths, pine trees. Warm morning light.
- **Hardware:** the well, then a water tank, a punch-card reader at the town hall, a granary.
- **Budgets:** ops per day per mission (below). Memory meter switches on from mission 8.
- **Locked built-ins:** `sorted`, `list.sort`, `dict`, `set`, `min`, `max`, `sum`. `min`, `max`, `sum` unlock after mission 4.
- **Arc:** water (missions 1–3) → records (4–8) → the finale that brings both together (9).

## Mission list

| # | Mission | Town | New building | Ops / day |
| --- | --- | --- | --- | --- |
| 1 | Water for the Village | 5 houses | Well | 300 |
| 2 | Not Enough Water | 20 houses | — | 600 |
| 3 | Wet and Dry | 40 houses | Tank | 1,500 |
| 4 | The Census | 40 houses | Town hall + card reader | 2,000 |
| 5 | The Grain Ledger | 50 houses | Granary | 3,000 |
| 6 | Fair Rations | 50 houses | — | 3,000 |
| 7 | The Clerk's Program | 60 houses | — | 3,000 |
| 8 | The Middle Family | 60 houses | — | see mission |
| 9 | The Second Well | 80 houses | Second well (you choose where) | 6,000 |

## 1 — Water for the Village

- **Ticket (Miriam, village elder):** "Our 5 houses carry water from the well every day. Each house needs 2 buckets. Can you make sure nobody goes thirsty?"
- **Tools:** `houses()`, `need(h)`, `deliver(h, n)`, `well_left()`.
- **Manual mode:** click a house to carry one bucket; "End day by hand".
- **Goal:** every house happy 3 days in a row (by hand or code). Test: 3 fixed days, all happy.
- **Tiers:** Works = goal. (Mission 1 has no higher tiers.)

## 2 — Not Enough Water

- **Ticket (Yossi, water carrier):** "We're 20 houses now, and the well only gives 35 buckets a day. Each house needs between 1 and 4. A house is only happy if it gets ALL it needs. One bucket short is still thirsty, and that water is wasted."
- **Tools:** same as mission 1.
- **Day report shows** the best possible number of happy houses for today's water (computed by the game).
- **Tiers:** Works = at least 80% of the best possible on average · Efficient = matches the best possible on every test day · Engineered = Efficient on hidden days too, under 50% of the ops budget.

## 3 — Wet and Dry

- **Ticket (Miriam):** "40 houses! On wet days the well overflows with 120 buckets. On dry days it gives only 30. Water left in the well dries up overnight. We built a tank that holds 60 buckets — you decide how to use it."
- **New tools:** `tank_level()`, `tank_store(n)`, `tank_take(n)`.
- **Weather:** fixed pattern in tests (visible), different patterns in hidden tests. Today's weather is only known today.
- **Tiers:** Works = 85% average happiness over the 10-day test · Engineered = 93% (visible and hidden).
- **Prototype result to keep:** this mission exists in `reference/` and plays well. Keep its numbers as the starting point.

## 4 — The Census

- **Ticket (Mayor Baruch):** "The town hall got a card reader! Every person in the village filled in a card: house number and age. We need three numbers for the regional office: how many people live here, how many children (under 13), and the age of the oldest person. The reader can only read each card once. If a deck is empty, report None for the oldest."
- **New building:** town hall with a card reader (animated card feed).
- **New tools:** `read_card()` → `(house, age)` or `None` when the deck is empty; `report(name, value)`.
- **Rules:** cards come in no particular order; a card can't be read twice.
- **Tiers:** Works = all three numbers correct on the visible deck · Efficient = under the ops budget on a 600-card deck · Engineered = correct on the hidden decks too.
- **Unlocks on completion:** `min()`, `max()`, `sum()` — with a journal entry: "You built these yourself first."

## 5 — The Grain Ledger

- **Ticket (Dina, granary keeper):** "Every time grain goes in or out, I punch a card: the day and the amount (positive in, negative out). The cards are in date order, and some days have several cards. The first card is what we started the season with. I only count the granary at closing time each evening. Tell me the first evening we closed below zero, and the lowest we ever closed at. If we never closed below zero, say None for the first part."
- **New building:** granary (fill level shown on the building).
- **New tools:** `read_card()` → `(day, amount)` or `None`; `report(name, value)`.
- **Tiers:** Works = correct on the visible deck · Efficient = within budget on a full-season deck · Engineered = correct on hidden decks.
- **Note for the build:** keep the ticket wording exactly; the details in it matter.

## 6 — Fair Rations

- **Ticket (Miriam):** "Winter is coming. The granary has some sacks of grain to hand out. It has to be fair: bigger families get more. Whole sacks only, and every single sack must be handed out."
- **New tools:** `households()`, `size(h)`, `total_sacks()`, `give(h, sacks)`.
- **Clarify (first appearance):** before running, the player can ask Miriam questions from a list (e.g. "What does fair mean exactly?", "What if sacks don't divide evenly?", "Who gets the leftovers?", "Can a family get zero?"). Each question costs 1 in-game hour of the day (cosmetic in Era 1). Answers appear in the ticket.
- **Tiers:** Works = every sack handed out and no family below its fair share · Efficient = matches Miriam's rule exactly on every test day · Engineered = also within half the ops budget on the hidden 80-family days.

## 7 — The Clerk's Program

- **Ticket (Mayor Baruch):** "Old Shimon the clerk wrote a program that adds up the weekly market sales. Shimon has moved to the city, and his program gives wrong totals. Fix it, but don't throw it away: the market people trust it."
- **Setup:** the player's codebase gets a new file `clerk.py` (Shimon's code, with his comments). `run_day()` must call `clerk.weekly_total()`.
- **New tools:** `read_card()` → `(stall, coins)` or `None`; `report(name, value)`.
- **Metric:** lines changed compared to Shimon's original (shown live).
- **Tiers:** Works = correct totals · Efficient = correct with 6 or fewer changed lines · Engineered = correct with the minimum possible changed lines (shown as a number only after completion).

## 8 — The Middle Family

- **Ticket (regional office letter):** "Please send the income of the middle family of your village: if you lined up all families from poorest to richest, the one in the middle. With an even number of families, send the poorer of the two middle ones. Incomes are whole coins. If there are no families, send None."
- **New:** the memory meter turns on. The header shows memory slots used.
- **Tools:** `read_card()` → `income` or `None`; `report(name, value)`.
- **Budgets:** generous for Works; tight for Efficient (exact numbers in spoilers file; shown to the player in the ticket).
- **Tiers:** Works = correct · Efficient = correct within the tight ops and memory budgets · Engineered = also correct on hidden decks.

## 9 — The Second Well (Era finale)

- **Ticket (Miriam):** "80 houses. One well can't carry us anymore. We can dig one more well, once — it's expensive and it can't be moved. The water carriers can only walk so far in a day. Where should we dig?"
- **New tools:** `pos(h)` → `(x, y)`; `carry_time_left()`; `deliver(h, n, well)` (well 0 or 1; walking costs time by distance); `dig(x, y)` (once, permanent, costs coins); `wells()`.
- **Flow:** the player runs the village for as many days as they like with one well (measuring), then digs, then the 14-day test runs with both wells.
- **Tiers:** Works / Efficient / Engineered by average happiness over the 14-day test (thresholds tuned in balance; shown in the ticket).
- **Finale:** a short era transition: the village becomes a town, wooden houses turn to brick, a newspaper headline about the new decade, and a teaser for the mainframe arriving.
