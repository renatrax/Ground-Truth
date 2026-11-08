# Ground Truth

A low-poly 3D town builder where the town runs on Python you write. From a 1950s village to a 2020s smart city.

A desktop game for Windows, macOS and Linux.

## Running it

You need [Node 22+](https://nodejs.org), [pnpm](https://pnpm.io), [Rust](https://rustup.rs), and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

```bash
pnpm install
```

```bash
pnpm desktop:dev
```

Installers for Windows, macOS and Linux come from the CI workflow, which only runs when started by hand (Actions tab → CI → Run workflow) to save GitHub Actions minutes. All tests run locally: `pnpm check` and `pnpm check:desktop`.

## Starting the build with Claude Code

1. Create an empty folder (or GitHub repo) and copy everything in this package into it.
2. Open Claude Code in that folder.
3. First message:

   > Read CLAUDE.md and everything in docs/ except docs/spoilers/. Then start milestone M0 from docs/03-roadmap.md. Show me your plan before writing code.

4. Work milestone by milestone. At the end of each one, play it and write what you noticed in `docs/playtest-log.md`.

When Claude Code builds the Era 1 missions (M4–M5), it will need `docs/spoilers/era1.md`. Tell it to read that file then, and not to show you its contents.

## What's here

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Rules and context Claude Code reads every session |
| `docs/01-game-design.md` | What the game is, the loop, the eras |
| `docs/02-architecture.md` | How it's built: worker, sim, sandbox, renderer, saves |
| `docs/03-roadmap.md` | Milestones M0–M6 with "done when" checks |
| `docs/04-testing-and-balance.md` | Balance harness and tests |
| `docs/05-era1-missions.md` | Era 1 missions, player-facing (no solutions) |
| `docs/06-prototype-lessons.md` | What the first playable test taught us |
| `docs/spoilers/era1.md` | Hidden rules and balance targets (spoilers!) |
| `reference/` | The working prototype of missions 1–3 |
