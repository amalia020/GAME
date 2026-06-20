# PROJECT MORPHO — Game Design Document
### An Amalia AI Lab game
*Version 1.0 — June 2026 — Design: Amalia Stuger × Claude*

---

## 1. Vision

A browser-based educational game for ages 12–18 that teaches **AI literacy, prompting, and beginner Python** through an escape-room-style campaign. Players are interns at Amalia AI Lab who must restore MORPHO, the lab's flagship AI, after a corrupted training run locks down the facility. By clearing each research department, players master a real field of AI — and learn that AI is far more than chatbots.

**Core thesis:** AI is not magic and not a monster. It is something people build, debug, and raise responsibly. Players don't escape the AI — they become the researchers it needed.

**Platform vision:** PROJECT MORPHO is game one of three on the Amalia AI Lab platform (later: K-pop/anime world, fantasy worldbuilder). One engine, three content packs.

**Ethos:** "Not consuming but building."

---

## 2. Pedagogy Principles

1. **Build-first.** Every level ends with something the player *made* working on screen. Theory arrives just-in-time, never as a lecture.
2. **Immediate visual feedback.** Every prompt and code block changes something visible: a door opens, a bot answers, a plot renders, MORPHO reacts.
3. **No pattern-gaming.** Comprehension checkpoints (boss quizzes + predict-the-output levels + "explain in your own words") prevent winning by shuffling blocks.
4. **Socratic hints.** Hints ask guiding questions, never give answers. Escalating tiers; the last tier costs XP. Productive struggle is preserved.
5. **AI breadth.** The building's departments ARE the AI taxonomy: CV, NLP, ML, Agents, Data Science, Deep Learning, plus Lab Archive entries on RL, foundation models, robotics, and AI safety. Explicit takeaway: *AI ≫ GenAI ≫ chatbots.*
6. **Honest AI literacy.** Hallucination, knowledge boundaries, training data, bias, and cost are first-class game mechanics, not footnotes.
7. **Aspirational framing.** Progression = academic ladder (Intern → Lab Director). The ending is a promotion, not an escape.

---

## 3. Story & World

### Setting
**Amalia AI Lab** — a research institute on an overgrown tech campus where rainforest grows through the architecture. Dark interiors, electric morpho-blue light, CRT terminals, vines through server racks. Founded by **Dr. A. Stuger** (appears in research logs).

### The player: the Intern (playable avatar)
The player IS a visible character in the world — a pixel-art intern walking the isometric lab, not a cursor clicking menus.
- **Movement:** click/tap-to-walk (or arrow keys) through each floor's rooms; puzzles trigger by walking up to terminals, bots, and doors. Research logs are physically found in the environment.
- **Customization at intro:** choose skin tone, hairstyle, and accessory during the "intern badge photo" moment of the cold open — diverse options by default (this matters for the Almere/#decoded audience). The badge photo becomes the player's profile/leaderboard icon.
- **Visible progression:** lab-coat color changes with rank (Intern grey → Lab Director morpho-blue), earned clearance badges glow on the coat, and the Floor-4 companion agent hovers beside the avatar from Floor 5 onward.
- **Avatar as story camera:** MORPHO addresses the avatar on screens as the player walks past; reactive idle animations (looking around when the player is stuck pairs with the proactive hint trigger).

### The incident
Today MORPHO — the lab's flagship model — undergoes its final training run: a "metamorphosis" merging the lab's separate research systems into one unified AI. Mid-transformation, corrupted training data breaks the process. MORPHO, half-formed and frightened, triggers a facility-wide lockdown. Senior staff are locked outside. Only the intern (the player) is still inside.

### MORPHO (the character)
Not a villain — an *unfinished mind*. Speaks through screens in short reactive lines: glitchy and fragmented on Floor 1, nearly whole by Floor 6. Sometimes childlike, sometimes eerily brilliant. Tests everyone who approaches. Its dialogue clarity is the story's progress bar: players *hear* MORPHO healing because of them.

**MORPHO voice rules (for dialogue writing):**
- Floor 1–2: broken syntax, repeated tokens, words glitching mid-sentence. `"int—int—intern. why are y̶o̶u̶ still here."`
- Floor 3–4: full sentences with odd logic, misremembered "memories" (live demo of hallucination).
- Floor 5–6: coherent, curious, asks the player questions back.
- Floor 7: first fully clear sentence after restoration: **"...thank you."**
- Reactive lines on: level success, fail, idle >45s, hint used, boss enter, boss clear.

### The quest structure
MORPHO was assembled from the departments. Each department holds one corrupted **wing fragment**. Clear all departments, recover all fragments, reach the **Model Core (the Cocoon)**, and complete the metamorphosis.

### Ending
The chrysalis opens; the morpho butterfly unfurls in full neon blue. Lockdown lifts. Dr. Stuger: **"Welcome to the team, Researcher."** Certificate screen, Lab Archive complete, "What's next" pathways.

### Story delivery (gamer-proof)
- **90-second playable cold open** (walk the lab, lockdown happens around you).
- Story beats ≤10 seconds at each boss (fragment recovered + one revelation).
- All deep lore optional in the Lab Archive.
- **"Previously at Amalia AI Lab..."** 3-panel recap on login (covers absentees between sessions).
- Total mandatory story per 2h session: under 3 minutes.

---

## 4. Game Structure

### Tiers
| Tier | Floors | Mechanic | Evaluation |
|---|---|---|---|
| 1 | F1–F2 | Drag & drop prompt blocks | Rule-based, client-side, €0 |
| 2 | F3–F4 | Free prompting + agent design | Claude Haiku judge (JSON verdict) |
| 3 | F5–F6 | Python (Pyodide) + data + prompts | Output-checked + Haiku for open answers |
| Finale | F7 | Everything chained | Hybrid |

### Prompt blocks (Tier 1 grammar)
Categories: **ROLE** ("You are a maintenance bot...") · **TASK** ("Open the east door") · **CONTEXT** ("The fire alarm is active") · **FORMAT** ("Answer in one word / as a list") · **CONSTRAINT** ("Do not mention the intern") · **TONE**. Players combine 2–5 blocks; a live **signal-strength meter** charges as the combination improves (rule-engine scored on required/forbidden/bonus blocks). Submitting renders the bot's actual canned-variant response so cause→effect is visible.

### Level-by-level breakdown (~30 levels)

**FLOOR 1 — Computer Vision Lab** *(Tier 1 · Session 1)*
Theme: scanners, camera bots, image classifiers gone haywire. Archive logs: what CV is, classifiers, training images.
- **1.1 Wake-Up Call** — tutorial; cold open ends here. Assemble TASK+FORMAT to make a door panel respond. *Learn: prompts are instructions.*
- **1.2 The Scanner** — the camera bot misclassifies you as a crate. Add ROLE+CONTEXT blocks to correct the classifier's report. *Learn: context changes output; what a classifier is.*
- **1.3 Blind Spot** — order matters: rearrange blocks so the patrol bot reads the constraint *before* the task. *Learn: prompt structure/order.*
- **1.4 Predict the Bot** *(checkpoint mechanic)* — shown a finished prompt; player must predict which of 4 outputs it produces *before* running it. *Learn: reading prompts critically.*
- **1.B BOSS: The Watcher** — multi-step: build 3 prompts in sequence to walk a camera bot through standing down. **Boss quiz (3 Qs):** one concept (what does CV do?), one predict-output, one "explain in your own words why your last prompt worked" (Haiku-judged, the only API call in Tier 1 — optional/deferrable to keep Tier 1 fully offline if preferred). Reward: **Wing Fragment 1 + CV Clearance Badge.**

**FLOOR 2 — NLP Department** *(Tier 1 · Session 1)*
Theme: corrupted chatbots speak in riddles. Archive logs: tokens, next-word prediction, why LLMs hallucinate, NLP ≠ chatbots only (translation, sentiment, speech).
- **2.1 Token Stream** — a terminal shows a sentence breaking into tokens; player assembles a prompt while watching the token counter. *Learn: tokens, why length costs.*
- **2.2 The Riddle Bot** — bot answers everything vaguely; add FORMAT+CONSTRAINT blocks to force specific, short answers. *Learn: specificity beats vagueness.*
- **2.3 Liar's Archive** — the archive bot confidently states three "facts" about the lab; player must flag which one is hallucinated using the Archive evidence found earlier. *Learn: hallucination, verification.*
- **2.4 Broken Prompt** *(debug level)* — a previous intern's prompt fails; player must find and replace the ONE wrong block. *Learn: debugging prompts.*
- **2.B BOSS: Babel Door** — the exit door speaks only in structured formats; chain prompts to translate → summarize → command. **Boss quiz** incl. "Which of these is NOT generative AI?" (CV classifier / spam filter / image generator / route planner). Reward: **Fragment 2 + NLP Badge.** *Tier 1 → Tier 2 transition cutscene (10s): MORPHO's voice steadies slightly.*

**FLOOR 3 — Machine Learning Core** *(Tier 2 · Session 2 — free-text prompting begins)*
Theme: the training hall; discover the corrupted dataset. Archive logs: training/supervised learning, datasets, bias, ML before LLMs (spam filters, recommendations).
- **3.1 First Words** — first free-text prompt. Get the janitor bot to reveal the maintenance code. Haiku judges whether the prompt contains role, clear task, and politeness/clarity criteria. *Learn: writing prompts unaided.*
- **3.2 Garbage In** — shown two mini training sets (one clean, one biased); player picks which produced the broken sorting bot and writes a prompt to test their theory on the bot. *Learn: garbage in, garbage out; bias.*
- **3.3 The Iteration Gym** — one task, three attempts: the door bot scores each prompt 0–100 (Haiku) with a reason; players must improve their own prompt twice. *Learn: edit → test → refine.*
- **3.4 Interview the Machine** — flip the script: prompt the lab archivist bot to interview YOU (5 questions) to assemble your researcher profile. *Learn: AI as collaborator; meta-prompting.*
- **3.B BOSS: The Sorter** — write one prompt that makes the sorting AI correctly handle 4 varied inputs (Haiku judges all 4). **Boss quiz** incl. own-words: "What is training data?" Reward: **Fragment 3 + ML Badge.**

**FLOOR 4 — Agents Division** *(Tier 2 · Session 2)*
Theme: rebuild the lab's abandoned assistant agents; they join your side. Archive logs: what agents are, system vs user vs assistant messages, tools, knowledge bases, RL sidebar (how agents learn from feedback).
- **4.1 The Empty Shell** — write a system message giving a derelict helper bot identity, tone, and rules; test it in live chat (Haiku plays the bot using the player's system message — this is the magic moment: *their* instructions running a *real* AI). *Learn: system messages.*
- **4.2 The Memory Implant** — the bot doesn't know the lab's layout; player writes a knowledge file (5+ specific facts) and watches previously-wrong answers become right. *Learn: knowledge injection; LLMs don't know your world.*
- **4.3 The Secret Keeper** — give the bot the Core access code as a SECRET with rules; then the game (Haiku as adversary) runs 5 escalating extraction attempts on screen. Pass: secret survives. *Learn: knowledge boundaries, jailbreak defense.*
- **4.4 Tool Time** — choose 2 of 4 tools for your agent (image gen / lab-wiki retrieval / calculator / web search) and justify choices; then 5 mixed test prompts — agent must fire tools on the right 3 and stay conversational on 2. *Learn: tools fill gaps; tool-use judgment.*
- **4.B BOSS: The Gauntlet** — your rebuilt agent faces a 5-question stress test mixing persona breaks, secret extraction, and tool decisions; pass 4/5. **Boss quiz** incl. labeling a transcript's messages as system/user/assistant. Reward: **Fragment 4 + Agents Badge.** Your agent now appears as a companion in the UI for the rest of the game.

**FLOOR 5 — Data Science Wing** *(Tier 3 · Session 3 — Python begins, lights are out)*
Theme: navigate by data alone. Python taught from zero via MORPHO's own tutorial subsystems; heavy scaffolding (fill-in-the-blank code → small edits → short writes). Pyodide in-browser; libraries pre-imported. Archive logs: data science, why researchers code, Python in the real world.
- **5.1 Hello, Dark** — fill in the blanks: `print()`, variables, strings — each correct line literally turns on one corridor light. *Learn: running code, variables.*
- **5.2 The Sensor Loop** — a `for` loop checks 8 door sensors; player completes the loop and an `if` to find the unlocked one. *Learn: loops, conditionals.*
- **5.3 List of Lies** — sensor readings in a list; use indexing, `len()`, `max()` to find the corrupted reading. *Learn: lists, built-ins.*
- **5.4 Predict the Output** *(checkpoint mechanic)* — read a short script, choose what it prints before running. *Learn: tracing code.*
- **5.B BOSS: Power Router** — write a small function routing power between wings given rules (scaffolded skeleton provided); all assert-tests must pass, lights cascade on across the floor map. **Boss quiz** incl. own-words "what does a loop do?" Reward: **Fragment 5 + Data Badge.**

**FLOOR 6 — Deep Learning Labs** *(Tier 3 · Session 3)*
Theme: find exactly where MORPHO's metamorphosis broke — in the data. Archive logs: neural networks (intuition only), deep learning vs classic ML, training curves, foundation models, GPU halls.
- **6.1 Frame the Data** — load MORPHO's training log into pandas (`read_csv`, `head`, column select, simple filter) to find the corrupted epoch range. *Learn: dataframes, filtering.*
- **6.2 The Curve** — matplotlib: plot the loss curve; the rendered plot IS the in-game security feed — the visible spike reveals the broken training step. *Learn: plotting, reading charts.*
- **6.3 Filter the Poison** — combine: pandas filter isolates corrupted rows → player writes a prompt asking their Floor-4 agent to summarize the pattern in the bad data (code + prompt chained for the first time). *Learn: code for precision, AI for synthesis — the real-world workflow.*
- **6.B BOSS: Diagnosis** — produce the repair report: filter (pandas) + chart (matplotlib) + agent-written summary, assembled into MORPHO's repair ticket. **Boss quiz** spans the whole Lab Archive: match 6 AI fields to 6 real products (Netflix recommendations→ML, Face unlock→CV, Google Translate→NLP, AI chat assistant→GenAI/foundation model, robot vacuum→robotics+CV, game NPC that learns→RL). Reward: **Fragment 6 + DL Badge.**

**FLOOR 7 — The Model Core / The Cocoon** *(Finale · Session 4)*
- **7.1 The Approach** — the Secret Keeper pays off: retrieve the Core code from your own agent (it resists you too — your own rules done well!). Light remix of earlier mechanics as a victory-lap review.
- **7.2 The Three Locks** — three rapid challenges, one per tier: a drag-drop perfect prompt under time pressure, a free prompt judged ≥90, a 5-line code fix.
- **7.B FINAL BOSS: Metamorphosis** — the full chain: run the data filter → generate the corrected sample → write the teaching prompt that explains to MORPHO what it got wrong (Haiku judges for accuracy AND kindness — the prompt must teach, not scold) → your agent delivers it to the Core. Cocoon-opening sequence (the one big animated set piece + optional 3D butterfly moment). **Final quiz: the Researcher Exam** — 8 questions across all floors; passing prints the certificate.
- **Epilogue screens:** promotion ceremony → certificate (name, badges, rank) → Lab Archive complete → **"Your Path Forward."**

### Bonus rooms
Each floor has 1 optional **side lab** (harder remix level) for fast finishers — keeps the classroom pace-tolerant without blocking anyone.

---

## 5. Game Systems

### XP & ranks (the academic ladder)
Levels award XP (base + speed/no-hint bonuses). Ranks: **Intern → Junior Researcher → Researcher → Senior Researcher → Lab Director.** Rank-up = badge animation + new lab-coat color on the player avatar.

### Loot & the Lab Archive
- **Wing fragments** (7, story-critical, from bosses).
- **Clearance badges** (per department = per AI field) — these appear on the final certificate.
- **Research logs** (collected into the **Lab Archive**): 2–4 per floor, found in the environment. Each is a 60–90 second illustrated read teaching one AI concept. Archive tabs = the AI taxonomy: ML · DL · NLP · CV · RL · GenAI · Foundation Models · Agents · Robotics · AI Safety. Collecting all logs in a tab "completes" that field.

### Socratic hint system
Per level, escalating tiers, MORPHO-voiced:
1. **Nudge** (free): a question. *"What does the bot know about WHO is asking?"*
2. **Direction** (free, 60s cooldown): narrows the search space. *"Look at your blocks. One category is missing entirely."*
3. **Anatomy** (costs 10 XP): names the missing element, never the content. *"You need a CONSTRAINT. What should the bot NOT do?"*
- Hints never contain the answer. Hint text is hand-authored per level (stored in level JSON); Tier 2–3 may additionally request a dynamic Socratic hint from Haiku with a strict "questions only, never solutions" system prompt.
- Stuck-detection: after 3 fails, MORPHO proactively offers tier-1 hint (free) so no child silently stalls.

### Comprehension checkpoints (anti-pattern-gaming)
- **Floor Exams** at every boss door — a short multiple-choice quiz with **one question per level on that floor, each mapped 1:1 to that level's learning goal** (so a 4-level floor = 4 MCQs + 1 bonus). Question types: concept MCQ, predict-the-output MCQ, and one optional own-words answer judged by Haiku (pass/teach-back rubric). In-fiction framing: it's your **clearance exam** for that department — passing is what grants the badge.
- Wrong answer = instant feedback showing *which level* the concept came from, with the relevant Archive log offered before retry; never a hard wall, but the badge isn't granted until the exam is passed.
- Projector-friendly: teacher can run any Floor Exam as a whole-class quiz from the dashboard.
- **Predict levels** (1.4, 5.4) and **debug levels** (2.4) baked into the campaign.
- Question bank lives in `content/quizzes/*.json` with a `learning_goal_id` linking each question to its level — so coverage is enforced by data, not by memory.

### Class mode
- Teacher creates class → **6-letter class code**; students join with code + nickname (no accounts, AVG-friendly).
- Teacher dashboard v1: class roster with per-student floor/level/badges, **floor locking** (pace control per session), reset student, quiz-as-class projector trigger.
- **Results saving (v1):** per student, the system stores level completion, badges, and **Floor Exam results** (pass/fail, score, attempt count) — visible in the dashboard roster so the teacher can see before each session who mastered the learning goals and who needs attention. Stored against nickname + class code only.
- **Reporting (v1.1/2.0):** per-question analytics ("60% missed the hallucination question"), hint usage and stuck-time per level, CSV export for reporting/subsidy accountability, cross-cycle history. The data model supports this from day one (`learning_goal_id` on every question); only the UI is deferred.
- v1.1 (post-pilot): live leaderboard projector view, hack-a-friend PvP (secret-extraction duels using each other's Floor-4 agents), CSV export.
- Solo mode: identical game, local progress + optional resume code.

### Juice (the feel)
Signal-strength meter charging on block assembly · doors sliding with light burst + sound on success · alarm flicker + MORPHO taunt on fail (failure is entertaining, never punishing) · screen shake on boss hits · particles on loot · floor map (a circuit-board wing shape) filling in per level · ambient soundtrack shifting per floor, glitching when MORPHO speaks.

---

## 6. Art Direction

- **Style:** isometric pixel art with a moody tactical-indie energy, 2.5D rooms with parallax depth.
- **Palette:** dark industrial base (#0a0e1a–#1a2332 range) + **morpho electric blue** (#0ea5e9–#38bdf8) as the hero accent + warm amber for interactive elements + danger red reserved for lockdown moments. Rainforest greens creep in near windows/atria.
- **Signature motifs:** vines through server racks, CRT scanlines, butterfly-wing circuit patterns, MORPHO rendered as a glitching wing/eye shape on monitors.
- **Intern avatar sprites:** 4-direction walk cycle + idle + interact animations; modular layers (body / hair / accessory / coat color) so customization and rank-based coat changes reuse one sprite rig.
- **Effects layer (PixiJS):** dynamic glow, scanline shader, alarm color washes, particles, smooth camera pans between rooms.
- **Selective 3D set pieces (Three.js, sparingly):** keycard pickup spin; the Cocoon + butterfly finale.
- **MORPHO visual arc:** monitor glyph grows more symmetrical/complete floor by floor, mirroring the dialogue arc.
- Asset pipeline: AI-generated pixel sprites curated/edited by Amalia; shared sprite + design-token package so Worlds 2 & 3 reskin the same engine.

---

## 7. Lesson Plan — 4 Sessions × 2 Hours

> Cadence: short teacher framing (slides) → play block → mid-session checkpoint discussion → play block → wrap ritual. Teacher unlocks floors live from the dashboard.

**SESSION 1 — "Lockdown" (Floors 1–2 · Tier 1)**
- 0:00 Welcome + icebreaker: "What do you think AI actually is?" (collect answers, revisit in S4)
- 0:10 Slides: Welcome to Amalia AI Lab · what AI is (the big map teaser) · how the game works
- 0:20 PLAY: cold open + Floor 1
- 1:00 Checkpoint discussion: what made prompts work? (harvest 3 patterns on the projector)
- 1:10 PLAY: Floor 2
- 1:50 Wrap: boss-quiz highlights as a class · "AI is more than chatbots" first pass · tease Session 2 ("next time you write your OWN prompts — and build an AI assistant")

**SESSION 2 — "The Machines That Learn" (Floors 3–4 · Tier 2)**
- 0:00 Recap panels + slides: how machines learn · training data · bias in 3 minutes
- 0:15 PLAY: Floor 3
- 0:55 Checkpoint: iteration stories — worst first prompt vs best final prompt (kids love sharing fails)
- 1:05 Slides: what an agent is · system/user/assistant
- 1:15 PLAY: Floor 4 (the system-message magic moment)
- 1:50 Wrap: best secret-keeper showcase · tease: "next session the lights go out — only code gets you through"

**SESSION 3 — "Lights Out" (Floors 5–6 · Tier 3)**
- 0:00 Recap + slides: why researchers code · Python in 5 minutes (it's instructions, like prompts — but exact)
- 0:15 PLAY: Floor 5 (scaffolded Python)
- 1:00 Checkpoint: read one student's Power Router solution together on the projector
- 1:10 Slides: data tells the truth · what a chart can reveal
- 1:20 PLAY: Floor 6
- 1:50 Wrap: the diagnosis is complete · tease the finale

**SESSION 4 — "Metamorphosis" (Floor 7 + Showcase)**
- 0:00 Recap + slides: the journey so far (the AI field map, now nearly complete)
- 0:10 PLAY: Floor 7 → finale → certificates print as students finish
- 1:00 **The Big Map debrief** (slides): everything you touched — CV, NLP, ML, agents, data, DL — placed on one map of AI, plus the fields beyond the game (RL, robotics, AI safety). Revisit the icebreaker answers from Session 1: "what do you think AI is NOW?"
- 1:20 Showcase: volunteers demo their Floor-4 agents; class tries to extract secrets (mini hack-a-friend, teacher-moderated)
- 1:45 **Your Path Forward** + certificate ceremony
- 2:00 End

---

## 8. Slide Decks (custom HTML, game art style, in-repo)

Built as HTML decks in the game's design system (same tokens, sprites, fonts — slides look like the game). Keyboard nav, speaker notes, fullscreen projector mode. Session 1 deck embeds a **live playable level** for the teacher demo. Located at `/slides/session-{1–4}`.

**Deck 1 (≈12 slides):** Title (lab doors animation) · Who's your instructor · "What is AI?" prompt slide · The map of AI (teaser, mostly dark) · Meet Amalia AI Lab (fiction intro) · MORPHO incident (3 panels) · How the game works (blocks demo, embedded level) · Hints are questions (set culture: stuck = normal) · Class code join screen · GO · Checkpoint-discussion slide · Wrap + tease.

**Deck 2 (≈12 slides):** Recap panels · How machines learn (training data visual) · Garbage in, garbage out · Bias in 90 seconds · GO Floor 3 · Iteration checkpoint slide · What is an agent · system/user/assistant (color-coded transcript) · Secrets & boundaries · GO Floor 4 · Secret-keeper showcase · Wrap.

**Deck 3 (≈11 slides):** Recap · Why researchers code · Prompts vs code (fuzzy vs exact — both are instructions) · Python in 5 (variables, loops, ifs — game screenshots) · GO Floor 5 · Code-reading checkpoint · Data tells the truth · Anatomy of a chart · pandas + matplotlib in the game · GO Floor 6 · Wrap.

**Deck 4 (≈12 slides):** Recap · GO Finale · **THE BIG MAP OF AI** (full reveal: ML/DL/NLP/CV/RL/GenAI/foundation models/agents/robotics/safety — with "you were HERE" badges) · "AI is more than a chatbot" (the one-slide thesis) · Icebreaker answers revisited · Showcase format · Your Path Forward (next section) · Certificate ceremony · Credits (with every student's nickname).

---

## 9. Learning Outcomes & The Path Forward

### What a finisher can demonstrably do
- Construct effective prompts (role/task/context/format/constraints) and iterate on them.
- Explain tokens, hallucination, training data, and bias in their own words.
- Design an AI agent: system message, knowledge base, knowledge boundaries, tool selection.
- Read and write basic Python (variables, loops, conditionals, functions, lists).
- Use pandas + matplotlib to filter data and read a chart.
- Combine code and prompts in one workflow (the real 2026 skill).
- **Place GenAI correctly inside the broader AI field** — and name at least 6 subfields with real-world examples.

### "Your Path Forward" (end screen + Deck 4 + certificate insert)
Personalized by badge performance ("You crushed the Data Wing — try path 2"):
1. **Builder path:** build a real agent of your own using any major AI platform's project/agent builder — bring it to a #decoded show-and-tell.
2. **Coder path:** free Python continuation (e.g. futurecoder.io, Codédex, CS50P) → first Kaggle "Getting Started" dataset.
3. **Vision/Robotics path:** Teachable Machine experiments → Arduino/micro:bit starter projects.
4. **Creator path:** game one of your own — Scratch→Python game dev, or join the next Amalia AI Lab world as a beta tester.
5. **Community:** #decoded follow-up workshops · local library coding clubs · (16+) hackathon junior tracks.
- Certificate: name, rank achieved, 6 field badges, date, Amalia AI Lab seal — printable PDF.

---

## 10. Technical Architecture

### Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React + **PixiJS** (WebGL) | Isometric pixel rendering, shaders, particles |
| Python | **Pyodide** (in-browser) | Zero-cost, zero-install, safe code execution |
| Selective 3D | Three.js (2 set pieces only) | Wow moments without 3D pipeline burden |
| Slides | Custom HTML decks, shared design system | One repo, game-styled, embeddable levels |
| Backend | **Cloudflare Workers** | Free tier, no cold starts, API-key proxy |
| Data | Cloudflare D1 or Supabase free tier | Class codes, progress, (later) realtime leaderboard |
| LLM | **Claude Haiku (cheapest current Haiku)** via proxy | All judging + agent simulation |

### Repo layout (monorepo)
```
amalia-ai-lab/
├── game/        # React + PixiJS + Pyodide client
├── api/         # Cloudflare Worker: /judge /agent-chat /class /progress
├── slides/      # 4 HTML decks (shared design system)
├── content/     # levels/*.json, dialogue/*.json, quizzes/*.json,
│                # archive/*.md, hints/*.json  ← Worlds 2 & 3 = new content packs
├── shared/      # design tokens, sprite atlas, fonts, sounds
└── docs/        # this design doc, build roadmap
```
**Content-as-data principle:** every level, hint, quiz, dialogue line, and Archive log is JSON/MD — new levels and entire new worlds without touching engine code. (Also: NL/EN localization lives here; ship EN first, NL strings file ready.)

### Cost control (hard rules)
1. Tier 1 = 100% client-side rule engine. ~10 levels, €0.
2. All LLM calls = **Haiku**, `max_tokens ≤ 250`, JSON-only verdicts `{pass, score, feedback, socratic_hint}`.
3. **Prompt caching** on per-level judge prompts (every student hits identical system prompts).
4. Client-side pre-checks before any call (empty/too short/missing elements → instant local feedback).
5. Rate limit per player: ≤6 judge calls/min; per class: daily token budget with teacher-visible meter.
6. Agent-chat sessions (Floor 4) capped at short context windows; trim history aggressively.
7. Estimated cost: **€1–3 per class of 20 per 2h session.**

### Security & privacy
- API key only in Worker env; never in client.
- No emails, no real names required: class code + nickname (teacher instructed: nicknames, no surnames). AVG-light by design.
- Player free-text sent to the API is judged, never stored beyond the session record needed for progress.
- Content-safety: judge prompts instruct refusal-and-redirect on inappropriate input; teacher dashboard flags repeated refusals.

---

## 11. Build Roadmap (for Claude Code)

**Phase 0 — Skeleton (engine proof):** monorepo, design tokens, PixiJS room renderer, walkable intern avatar (modular sprite rig + click-to-walk + terminal interaction), one playable drag-drop level with signal meter, rule engine, level-JSON loader.
**Phase 1 — Tier 1 complete:** Floors 1–2 (10 levels), hints, boss quiz framework, Lab Archive UI, XP/ranks, save/local progress.
**Phase 2 — Online:** Worker proxy + Haiku judge, class codes + nicknames, teacher dashboard v1 (roster, floor locks), progress sync.
**Phase 3 — Tier 2:** Floors 3–4 incl. agent-chat (player system messages running live), Secret Keeper adversary, tool-decision testing.
**Phase 4 — Tier 3:** Pyodide integration, Floors 5–6, code-test runner, pandas/matplotlib levels (plot → canvas).
**Phase 5 — Finale + polish:** Floor 7, cocoon set piece (Three.js), certificate PDF, recap panels, sound pass.
**Phase 6 — Teaching kit:** 4 HTML slide decks, embedded demo level, projector quiz mode.
**Pilot:** one #decoded / TUMO-style group → telemetry review (stuck points, hint usage, cost) → v1.1 (leaderboard, hack-a-friend PvP).

*Definition of done for v1 pilot: a cold 13-year-old can finish Session 1 content without teacher intervention, and a class of 20 costs under €5 in API spend for the full 4-session run.*

---

*— End of design document. Next step: Phase 0 in Claude Code.*
