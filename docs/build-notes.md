---
noteId: "c4e2f46064f111f19aca8be2ab113fe4"
tags: []

---

# Build notes — PROJECT MORPHO

The canonical design doc is `project-morpho-design-doc.md` at the repo root.
The execution plan is in `~/.claude/plans/`.

## Where things live

| Path | What |
|---|---|
| `game/` | Vite + React + PixiJS v8 client (the game) |
| `shared/` | Design tokens + the code-defined pixel-art system + sprites |
| `content/` | Levels, quizzes, hints, dialogue, archive logs (JSON/MD) — added per floor |
| `api/` | Cloudflare Worker (Phase 2 placeholder) |
| `slides/` | Teaching decks (Phase 6 placeholder) |

## The pixel-art pipeline (the load-bearing idea)

No image files exist. A sprite is `{ palette: string[], pixels: number[][] }`.
- Author readably with `sprp(legend, rows)` in `shared/src/sprites/`.
- `shared` rasterizes a grid → a `<canvas>` (framework-agnostic, no Pixi).
- `game/src/render/textureCache.ts` wraps that canvas → a cached `PIXI.Texture`.
- The intern avatar is a **layered** sprite (body/coat/hair/badge); `recolor()`
  swaps palettes for rank coat colors and skin/hair customization.

Worlds 2 & 3 reskin by swapping `shared/src/tokens.ts` + the sprite palettes —
no engine changes.

## Requested additions (from Amalia, beyond the base plan)

- **Art quality bar:** reference art incoming — 2 scenes + 4 avatars. Re-author
  code sprites (bigger grids, shading, correct proportions) to match. Reference
  files live in `docs/art-reference/`.
- **Progress overview map:** a zoomed-out, navigable building/floor map that
  fills in as the player clears levels (extends the doc's "circuit-board wing"
  floor map + the Big Map of AI). Target checkpoint: F (cross-cutting/story),
  with a simple stub possible earlier as a floor-select screen.

## Milestone status

- **Checkpoint A (foundation):** monorepo, tokens, pixel-art system, demo scene. ← current
- B–G: see the plan file.
