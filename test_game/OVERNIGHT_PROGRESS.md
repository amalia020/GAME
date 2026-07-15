---
noteId: "58d34b30809911f18ecab983a964deaa"
tags: []

---

# Overnight facelift — progress tracker

Autonomous build on branch `AGENTIC-TEST`. World = **1 main house (home-base hub) + 7
challenge houses**, KayKit stylized look, walk-in interiors with placeholder dialogue
+ tasks. Every verified step is committed + pushed to `origin/AGENTIC-TEST`.

Per-step gate: `cd test_game && npx tsc --noEmit` green → Playwright screenshot on
:5180 → commit + push. Asset downloads are logged in `CREDITS.md`.

## Milestones
- [x] **M0** — Finish + commit Phase 1 (KayKit wizard, shadows, sky, moonwalk fix; remove debug; soften shadows)
- [ ] **M1** — Download KayKit building/interior/NPC kits + write `CREDITS.md`
- [ ] **M2** — Scene/state system (town ⇄ interior[houseId])
- [ ] **M3** — Replace villas with KayKit buildings + door "Enter" triggers
- [ ] **M4** — Walk-in interior room template + NPC (idle)
- [ ] **M5** — Placeholder dialogue + tasks (data-driven `content/houses.ts`)
- [ ] **M6** — Wire all 8 buildings (main house hub + 7 challenge houses)
- [ ] **M7** — Cohesion + polish pass
- [ ] **M8** — Wrap-up + final push

## Log
- 2026-07-16 — Loop started. M0 in progress.
- 2026-07-16 — M0 DONE. Removed debug, softened shadows (ramp floor 148, sun 1.65,
  hemi 1.05). tsc green, verified on :5180 (wizard faces away at idle, walks correctly,
  0 console errors). Committing + pushing Phase 1 checkpoint.
