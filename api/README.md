---
noteId: "b8bdf9f064f111f19aca8be2ab113fe4"
tags: []

---

# api/ — Cloudflare Worker (placeholder)

Phase 2+ only. This milestone (Session 1) is **100% offline** — no API calls, no
network. The Worker that proxies Claude Haiku and backs class codes / progress
with **Cloudflare D1** lands here later.

Planned endpoints (per design doc §10):

- `POST /judge` — Haiku JSON verdict `{ pass, score, feedback, socratic_hint }`
- `POST /agent-chat` — Floor 4 agent simulation (player system message runs live)
- `POST /class` — create class → 6-letter code; join with code + nickname
- `POST /progress` — sync level completion, badges, Floor Exam results

Cost rules live in the design doc: Haiku only, `max_tokens ≤ 250`, prompt
caching, client-side pre-checks, per-player/-class rate limits.

The game keeps a clean seam: until this exists, all progress is in localStorage.
