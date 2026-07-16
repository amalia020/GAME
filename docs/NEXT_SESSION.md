---
noteId: "6d8c6d30811211f19768815f3b1f9af5"
tags: []

---

# Next session — start here

**Goal, in order:** ① put what exists live on Netlify · ② then work Phase 1 of
[VILLAGE_OF_THE_WIZARDS_PLAN.md](VILLAGE_OF_THE_WIZARDS_PLAN.md).

---

## The one thing only Amalia can do

**Netlify needs YOUR login. Claude cannot do this step** — it's an interactive
browser flow, and the Netlify MCP connector was unauthorized last session.

Pick either:

- **CLI** (simplest): run `netlify login` in a terminal. A browser opens; approve it.
- **MCP connector**: run `/mcp` in an interactive Claude Code session and authorize
  the `netlify` server.

Do this **before** asking for the deploy, or the session stalls on it. Everything
else below, Claude can do.

## Then say

> "Deploy test_game to Netlify."

### What Claude does (verified ready — no surprises expected)

1. `cd test_game && npm run build` — **confirmed green**, 23 s, 338 kB gzipped JS.
2. Deploy with the Netlify CLI. `test_game/netlify.toml` is already written:
   build command, publish dir, SPA redirect, and immutable caching for
   `/models/*` + `/fonts/*`.
3. Open the public URL, walk the village, screenshot it, and report back.

**Set the site's base directory to `test_game`** in the Netlify UI (or deploy from
inside that folder). The repo root is a parked pnpm workspace (`game/ api/ slides/`)
and is NOT the app.

### Known snag, flagged in advance

`public/models` is **64 MB** (dist is 65 MB). Netlify serves it fine and the deploy
will work, but **first load is heavy for players**. Not a blocker for getting a URL
up; worth Draco/meshopt compression before showing it to actual teenagers.

---

## Where everything is

| What | Where |
|---|---|
| The game (the thing we deploy) | `test_game/` — standalone Vite + React + react-three-fiber |
| Product plan | `docs/VILLAGE_OF_THE_WIZARDS_PLAN.md` |
| Asset licences / IP manifest | `test_game/CREDITS.md` |
| Build history | `test_game/OVERNIGHT_PROGRESS.md` |
| Branch | `AGENTIC-TEST` (main branch is `ink-walk-sandbox`) |
| This checkpoint | tag `checkpoint-2026-07-16-forest-fade` |
| Parked legacy | `game/ api/ slides/` — ignore |

Dev server: `cd test_game && npm run dev` → http://localhost:5180

## What's built and working

Cozy KayKit village: wizard with working locomotion · 8 houses with carved wooden
signs · enclosed furnished interiors with pacing NPCs · dialogue → tasks → a Tier-1
prompt puzzle · animated fountain plaza · tiled paths · wandering pedestrians ·
wooden HUD (Menu/Roadmap/Goals/Challenges) · bounded clearing ringed by dense forest.

Recent polish (this session): three-layer grass · instanced real-tree forest you
can't see through · forest-floor shade · two-deck sky · **houses ghost out of the
way of the camera** instead of the camera dodging them.

All assets **CC0** except one **CC-BY** fountain (attributed in CREDITS.md).

## Open decisions waiting on Amalia

- **Ghost strength** — a house between you and the camera fades to 16% opacity
  (`GHOST` in `src/world/Building.tsx`). Walk around and say if it's too faint or
  too strong.
- **Rebrand naming** — "Village of the Wizards", the tagline, and the eight School
  names in the plan's theme map are drafts. Confirm or change them before Phase 1
  rewrites the copy, so it isn't done twice.
- **Roadmap illustration** — you wanted this made with an external image model.
  Claude will supply a ready-to-paste prompt; the Map screen ships with a
  placeholder slot until you drop the image in.

## Conventions to keep

- Per-step gate: `npx tsc --noEmit` green → screenshot-verify in the browser →
  commit + push. Don't batch unverified work.
- Every downloaded asset gets logged in `CREDITS.md` — the point is that the IP
  trail stays auditable.
