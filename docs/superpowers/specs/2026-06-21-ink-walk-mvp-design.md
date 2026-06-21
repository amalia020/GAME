# Ink Walk — MVP Design

**Date:** 2026-06-21
**Location:** `test_game/` (standalone sandbox, outside the pnpm workspace)
**Status:** Approved for MVP build

## Purpose

A throwaway experiment to test a new rendering approach for PROJECT MORPHO:
capture the **walking feel** and **hand-inked cel-shaded look** of
[abeto.co/messenger](https://messenger.abeto.co/) in a clean-slate R3F app —
without fighting MORPHO's existing chunky-pixel renderer.

Success = you can walk a blocky kid around a small stylized town square; it has
weight, the camera follows smoothly, and the whole thing reads as hand-inked
with a curved horizon — recognizably "abeto-like."

## Reference

abeto's look (see `abeto-ref-A.jpeg`): bold black ink outlines on every form,
flat cel fills with a single shadow tone, teal sky, warm-cream buildings,
slightly desaturated painterly palette, third-person follow cam over a world
that curves away at the horizon.

### Palette (derived from reference)

| Role | Hex |
|------|-----|
| Sky teal | `#82C9C4` |
| Cloud / light | `#E8F2EC` |
| Cream building | `#DAC9A3` |
| Green structure | `#8FB89C` |
| Road grey | `#9BA39C` |
| Accent yellow (character) | `#E6C24A` |
| Ink (outlines, near-black warm) | `#1A1A22` |

## Approach (cheap fakes over real systems — correct for a sandbox)

| Element | MVP technique |
|---------|---------------|
| Cel/ink look | `MeshToonMaterial` (banded gradientMap) + drei `<Outlines>` (inverted-hull silhouette ink). Minimal custom shader code. |
| Curved planet | "Curve the world" vertex-shader patch (`onBeforeCompile`) bends geometry downward with distance from camera. Character walks a **flat** plane; only the *look* curves. No spherical physics. |
| 3rd-person cam | Camera lerps each frame to an offset point behind/above the character. |
| Momentum movement | Velocity with acceleration/decel; character mesh rotates to face heading; idle vs walk by speed. |
| Controls | WASD (core). Click-to-move deferred. |

## Architecture (small, focused files)

- `index.html`, `vite.config.ts`, `package.json`, `tsconfig.json` — standalone Vite scaffold
- `src/main.tsx` — React entry
- `src/InkWalk.tsx` — `<Canvas>` (full-res, antialias ON — opposite of pixel mode) + scene root, lights, sky background, fog
- `src/render/toon.ts` — builds the banded gradient map + a `makeToon(color)` helper; `curveWorld(material)` patch
- `src/world/Ground.tsx` — large flat ground plane (toon + curve patch)
- `src/world/TownSquare.tsx` — a handful of toon-shaded box buildings/props with outlines
- `src/player/Character.tsx` — blocky kid mesh (body + head + simple limbs) with `<Outlines>`
- `src/player/useThirdPersonController.ts` — WASD momentum movement + follow camera (runs in `useFrame`)
- `src/world/keys.ts` — keyboard state hook

## Out of scope (YAGNI for the experiment)

NPCs, dialogue, quests, click-to-move, audio, true spherical planet, interior
crease outlines (silhouette-only for MVP), custom art assets (primitives + flat
colors stand in), persistence, UI/HUD.

## Verification

Run `pnpm dev`, load in a real browser via the Playwright MCP, screenshot, and
confirm: ink outlines render, fills are flat-banded (not smooth gradient),
horizon curves, character walks with momentum and the camera follows.

## Stack

Vite 5 + React 18 + `@react-three/fiber@8` + `@react-three/drei@9` +
`three@0.184` + TypeScript. Standalone `node_modules` in `test_game/`
(not added to the workspace).
