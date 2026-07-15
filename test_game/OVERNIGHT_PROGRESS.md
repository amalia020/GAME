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
- [x] **M7** — Polish: fixed interior camera (overlooks open-top room); animated central FOUNTAIN (bobbing water, spinning/pulsing spout, flow streams) as the plaza focal point; KayKit streetlights replace plain lamps; procedural wind SWAY on trees/bushes; overhauled interiors (wood floor, cream walls + skirting + trim rail, lit window, framed door, richer KayKit furniture, warm interior light). Verified in browser.
- [x] **M8** — Wrap-up + final push (this summary)

## ☀️ Morning summary — what's done
The ink-walk sandbox is now a cohesive KayKit-styled game (branch `AGENTIC-TEST`,
all pushed to GitHub):
- **Character**: KayKit Mage wizard, walks/runs with real animation (moonwalk + glide bugs fixed).
- **World**: colourful KayKit town — 8 houses ringing an **animated central fountain**
  plaza, KayKit streetlights, benches/hydrants, swaying trees/bushes, painterly sky +
  soft shadows.
- **Life**: 5 townsfolk wander the plaza; each house has a resident NPC that paces.
- **Houses**: all 8 enterable (walk to door → "Enter" → cozy furnished interior with
  wood floor, trim, lit window, KayKit furniture); talk to the NPC → **dialogue → tasks**
  overlay (all placeholder, data-driven in `src/content/houses.ts`).
- **Gamified HUD**: Lv/XP strip + Menu / Roadmap / Goals / Challenges buttons + panels.
- **IP**: every downloaded asset is CC0 (KayKit / Quaternius), logged in `CREDITS.md`.

## 🔜 Left for next session (your queued asks + nice-to-haves)
- **Content**: fill real dialogue + tasks in `src/content/houses.ts`; real roadmap/goals/
  challenge content in `src/ui/Hud.tsx`.
- **Polish**: fountain water animation is subtle — could add real particles/shader; door
  lintel glow is a bit strong; furniture has no colliders (player can walk through it);
  interior camera occasionally close on the back wall.
- **Cleanup**: remove now-unused `src/player/Npc.tsx`, `public/models/RobotExpressive.glb`,
  `Soldier.glb` (Soldier flagged in CREDITS as licence-unverified).
- **M12 (later, deferred by user)**: multiplayer with challenges.
- Swap in Amalia's own MORPHO 3D art when ready — change one rig url in `characterModel.ts`.

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
