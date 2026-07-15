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
- [x] **M1** — Download KayKit building/interior/NPC kits + write `CREDITS.md`
- [x] **M2** — Scene/state system (town ⇄ interior[houseId])
- [x] **M3** — Replace villas with KayKit buildings + door "Enter" triggers
- [x] **M4** — Walk-in interior room template + NPC (idle)
- [x] **M5** — Placeholder dialogue + tasks (data-driven `content/houses.ts`)
- [x] **M6** — Wire all 8 buildings (main house hub + 7 challenge houses)
- [ ] **M7** — Cohesion + polish pass (interior camera clips walls; streets; central plaza point instead of central house)
- [ ] **M8** — Wrap-up + final push

## New requests (queued 2026-07-16, "can be after")
- [x] **M9** — NPCs move: WanderNpc (stroll → pause → new target, walk/idle crossfade); 5 town pedestrians + interior NPC paces. Verified moving across frames.
- [x] **M10** — Gamified UI scaffolding: HUD with Lv/XP strip + Menu/Roadmap/Goals/Challenges buttons + placeholder panels (verified in browser)
- [ ] **M11** — Town polish: nicer streets + a central PLAZA landmark (fountain/statue) instead of a central house
- [ ] **M12** — (later) multiplayer with challenges

## Log
- 2026-07-16 — Loop started. M0 in progress.
- 2026-07-16 — M0 DONE. Removed debug, softened shadows (ramp floor 148, sun 1.65,
  hemi 1.05). tsc green, verified on :5180 (wizard faces away at idle, walks correctly,
  0 console errors). Committed a0da480.
- 2026-07-16 — Fixed recurring glide (self-healing anim restart on HMR). Verified walk
  cycle plays across two frames on fresh load. Committed d733a57.
- 2026-07-16 — M1 DONE. Downloaded KayKit City-Builder buildings A–H, Furniture Bits
  (17 pieces), and NPCs (Adventurers: Knight/Rogue/Rogue_Hooded/Barbarian + Skeletons:
  Warrior/Mage/Rogue). All CC0, logged in CREDITS.md. Next: M2 scene/state system.
- 2026-07-16 — M2 DONE. External location store (town/interior), controller now takes
  per-scene colliders/bounds/camera, TownScene extracted + InteriorScene stub (room w/
  door gap), fade overlay. Verified town→interior→town via temp e/q keys (real door
  triggers land in M3). tsc green, 0 errors. Next: M3 KayKit buildings + door triggers.
- 2026-07-16 — M3 DONE. Replaced procedural villas with 8 KayKit City-Builder houses
  (auto-facing doors via yaw=atan2(-x,-z), scale 3.2); stripped procedural building code
  from TownSquare (kept trees/bushes/lamps). Interaction system: playerPos store,
  InteractionManager (proximity + E), DOM InteractionPrompt, house door triggers, interior
  exit door; exit returns at the house door. Verified in browser (colorful KayKit town,
  Enter prompt, E enters). tsc green. Next: M4 furnish interiors + NPC.
