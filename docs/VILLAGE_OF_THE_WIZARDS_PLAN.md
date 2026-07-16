---
noteId: "5cd2f680811211f19768815f3b1f9af5"
tags: []

---

# The Village of the Wizards — product plan

> **Status:** the cozy 3D hub is built and checkpointed. Phase 1 (rebrand + intro
> screen + go live on Netlify) is the next milestone and has NOT started.
> Working branch: `AGENTIC-TEST`. The deployable app is `test_game/`.
>
> For "what do I do when I sit down next", see [NEXT_SESSION.md](NEXT_SESSION.md).

## The pitch

**AI might be magic — but we'll unravel it in the Village of the Wizards.**

A browser-based 3D game that teaches teenagers real AI literacy. Each house is a
School of Magic mapping 1:1 to a real AI field, with clear modular learning goals,
short lessons (how it works + **where it fits in the whole of AI**), and real
challenges. Players earn XP and ranks; rooms give a shared leaderboard; an admin
board manages it. Ships on Netlify.

Drop all MORPHO / lab / intern wording. Player = **Apprentice** → … → **Archmage**.

## Locked decisions

- **No API keys, no LLM, for now.** Everything is graded deterministically and all
  content is hardcoded. This is the whole platform for the foreseeable future.
- **LLM judging is quarantined and deferred** to a single GenAI school (open-ended
  prompt-craft is the only thing that genuinely needs it), behind BYO keys, later.
- **Everything that can be hardcoded is hardcoded.**
- Learners **code and build real AI** — with heavy tips, walkthroughs, and
  interactive info, and they always know **WHY** and **how it fits in all of AI**.
- Challenges use **open-source datasets the code actually trains on**.
- **Treasure List = the player's portfolio** of finished projects.
- Async multiplayer: rooms + shared leaderboard (no live co-presence yet).
- Personal accounts (email/nickname + password); join rooms by code + password.
- **Build order: rebrand + intro + go live FIRST**, then backend, then curriculum,
  then rooms/admin.

## Theme map (rename every house)

| Now (drop) | Becomes | Real AI field |
|---|---|---|
| MORPHO Core | **Wizards' Council** (hub + "Map of All Magic") | orientation |
| Computer Vision Lab | **School of Sight** | computer vision |
| NLP Department | **School of Words** | NLP |
| Machine Learning Core | **The Training Grounds** | ML, train/test/val |
| Agents Division | **School of Familiars** | agents |
| Data Science Wing | **The Divination Hall** | data science |
| Deep Learning Labs | **Deep Enchantments** | deep learning |
| Lab Archive | **The Grand Library** (revisit lessons) | reference |

## Architecture (Netlify-native)

- **Frontend** — the current Vite/React/R3F app, static build.
- **Auth** — Netlify Identity (skill: `netlify-identity`).
- **Data** — Netlify Database (Postgres + Drizzle): `users`, `progress`, `rooms`,
  `room_members`, `treasure`. Leaderboard derived from XP. Big artifacts → Netlify
  Blobs. (skills: `netlify-database`, `netlify-blobs`)
- **API** — Netlify Functions: save/load progress, submit challenge, room
  create/join, leaderboard, admin. (skill: `netlify-functions`)
- **Grading is deterministic**: assert-tests on Python output, exact-answer,
  train/test/val split validation (leakage + ratio checks), real-dataset projects
  graded by a metric threshold, and quizzes.
- **Programming + real-dataset challenges** — **Pyodide** (in-browser Python) with
  numpy/pandas/**scikit-learn**. Tiers: (a) code puzzles + assert-tests; (b) the
  train/test/val split exercise; (c) real projects — load an open-source dataset,
  split it, actually train + evaluate a model in the browser, pass a target metric.
- **Content-as-data** — `content/` JSON: modules → lessons → challenges, each with
  `learning_goal_id`, a fits-in-AI blurb, walkthrough + tips, and a challenge spec.
  This is what makes redo-levels, revisit-info, and modular goals possible.

## Phase 1 — Rebrand + intro screen + GO LIVE (next milestone)

Fully client-side (progress in `localStorage`) so it ships fast.

1. **Rebrand copy** — `src/content/houses.ts` + `src/world/townData.ts`: house names
   → School names, wizard-flavoured NPC names + dialogue. Remove every
   MORPHO/lab/intern string. Theme the HUD labels. New tagline.
2. **Enter/intro screen** — new `src/ui/IntroScreen.tsx` + `src/state/appPhase.ts`
   (`intro` → `village`): title, tagline, short how-to-play + the learning premise,
   **START** enters the village.
3. **Map of All Magic** (the roadmap) — new `src/ui/MapScreen.tsx` from the HUD:
   the 8 schools, their real-AI mapping, progress, plus a slot for an externally
   generated illustration.
4. **Modular learning goals** — a Goals panel listing each school's objectives.
5. **localStorage progress stub** — `src/state/progress.ts` (xp, completed levels)
   so redo + rank work now.
6. **Deploy** — `test_game/netlify.toml` is already written; deploy via Netlify CLI
   to a public URL. (skills: `netlify-cli-and-deploy`, `netlify-deploy`)

## Phases 2–6 — roadmap

- **P2 Accounts + saved progress + Treasure** — Identity login; DB users/progress/
  treasure; Functions save/load; migrate localStorage → account; redo levels; the
  Grand Library revisit; the Treasure Chest portfolio screen.
- **P3 Curriculum engine + first real school (deterministic, key-free)** — content
  model; challenge engine (Pyodide + assert-tests, the split exercise, the
  real-dataset project flow, quizzes). Wire **The Training Grounds** end-to-end.
- **P4 Rooms + leaderboard + admin** — create/join by code+password, per-room +
  global leaderboard, room challenges, protected admin board.
- **P5 Rest of curriculum + polish** — deterministic content for all non-GenAI
  schools + a real-dataset capstone each; shareable/exportable Treasure; integrate
  the roadmap image; a11y; optional live co-presence.
- **P6 (later) GenAI school + LLM judging** — the one school that needs an LLM,
  with real BYO API keys server-side. The only place keys ever enter the platform.

## Open items / user-provided

- **Netlify auth** — Amalia runs `netlify login` (interactive) before the first deploy.
- **Roadmap illustration** — to be generated with an external image model
  (ChatGPT/Gemini). A ready-to-paste prompt will be provided; placeholder until then.
- **Final naming/tagline** — "Village of the Wizards" + tagline are drafts.
- **Budget** — assumes the Netlify free tier (fine for a pilot).

## Known issues / debt

- **64 MB of models in `public/models`** (65 MB `dist`). Netlify serves it fine, but
  first load is heavy for players. Worth Draco/meshopt compression before any real
  pilot — a Phase-1-follow-up, not a blocker.
- The JS bundle is ~1.2 MB (338 kB gzipped); fine for now, code-split later.
