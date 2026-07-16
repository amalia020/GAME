import { NPC_RIGS, type CharacterRig } from '../player/characterModel';

export interface Task {
  title: string;
  body: string;
}

export interface HouseContent {
  id: string;
  /** department display name (also on the door sign). */
  dept: string;
  /** who you talk to inside. */
  npcName: string;
  npcRig: CharacterRig;
  /** department accent colour (door lintel, sign). */
  accent: string;
  /** NPC lines, shown one at a time. Placeholder — real MORPHO copy added later. */
  dialogue: string[];
  /** the floor's levels (from the design doc) shown as the task list. */
  tasks: Task[];
}

/**
 * PROJECT MORPHO — the 8 buildings are the AI departments (design doc §4). Content
 * here is PLACEHOLDER but real in STRUCTURE: names, order, and level titles match the
 * doc so wiring real challenges later is just filling bodies + a level id.
 */
export const HOUSE_CONTENT: Record<string, HouseContent> = {
  main: {
    id: 'main',
    dept: 'MORPHO Core',
    npcName: 'MORPHO',
    npcRig: NPC_RIGS.knight,
    accent: '#38bdf8',
    dialogue: [
      'in—int—intern. you are still here.',
      'the lab is l̶o̶c̶k̶e̶d̶. i am... not whole. the departments hold my missing pieces.',
      'clear them. bring the fragments back. (placeholder — MORPHO heals as you progress.)',
    ],
    tasks: [
      { title: 'Restore MORPHO', body: 'Recover all 6 wing fragments from the departments, then reach the Core.' },
      { title: 'Your rank', body: 'Intern → Junior Researcher → Researcher → Senior → Lab Director.' },
    ],
  },
  h1: {
    id: 'h1', dept: 'Computer Vision Lab', npcName: 'Scanner Bot', npcRig: NPC_RIGS.rogue, accent: '#7dd3fc',
    dialogue: ['Floor 1 — Computer Vision. Cameras, classifiers, scanners.', 'Teach the bots to see straight again. (placeholder)'],
    tasks: [
      { title: '1.1 Wake-Up Call', body: 'Assemble TASK + FORMAT blocks to make a door panel respond.' },
      { title: '1.2 The Scanner', body: 'Add ROLE + CONTEXT so the camera stops misclassifying you.' },
      { title: '1.3 Blind Spot', body: 'Order matters — put the constraint before the task.' },
      { title: '1.4 Predict the Bot', body: 'Predict which output a finished prompt produces.' },
      { title: '1.B The Watcher (boss)', body: 'Walk a camera bot down in 3 prompts. Reward: Wing Fragment 1.' },
    ],
  },
  h2: {
    id: 'h2', dept: 'NLP Department', npcName: 'Riddle Bot', npcRig: NPC_RIGS.rogueHooded, accent: '#f7b13e',
    dialogue: ['Floor 2 — Natural Language. Tokens, prediction, hallucination.', 'The chatbots speak in riddles. Make them specific. (placeholder)'],
    tasks: [
      { title: '2.1 Token Stream', body: 'Assemble a prompt while watching the token counter.' },
      { title: '2.2 The Riddle Bot', body: 'FORMAT + CONSTRAINT to force short, specific answers.' },
      { title: "2.3 Liar's Archive", body: 'Flag which "fact" the archive bot hallucinated.' },
      { title: '2.4 Broken Prompt', body: 'Find and replace the ONE wrong block.' },
      { title: '2.B Babel Door (boss)', body: 'Chain translate → summarize → command. Reward: Fragment 2.' },
    ],
  },
  h3: {
    id: 'h3', dept: 'Machine Learning Core', npcName: 'Janitor Bot', npcRig: NPC_RIGS.barbarian, accent: '#4f9d5a',
    dialogue: ['Floor 3 — Machine Learning. Training data, bias, iteration.', 'Free prompting begins here. Write it yourself. (placeholder)'],
    tasks: [
      { title: '3.1 First Words', body: 'Your first free-text prompt — get the code from the janitor bot.' },
      { title: '3.2 Garbage In', body: 'Pick which training set broke the sorting bot.' },
      { title: '3.3 The Iteration Gym', body: 'One task, three tries — improve your prompt twice.' },
      { title: '3.4 Interview the Machine', body: 'Prompt the archivist to interview YOU.' },
      { title: '3.B The Sorter (boss)', body: 'One prompt that handles 4 varied inputs. Reward: Fragment 3.' },
    ],
  },
  h4: {
    id: 'h4', dept: 'Agents Division', npcName: 'Empty Shell', npcRig: NPC_RIGS.skeletonWarrior, accent: '#a78bfa',
    dialogue: ['Floor 4 — Agents. System messages, tools, boundaries.', 'Give a derelict helper an identity — then it joins you. (placeholder)'],
    tasks: [
      { title: '4.1 The Empty Shell', body: 'Write a system message; test it in live chat.' },
      { title: '4.2 The Memory Implant', body: 'Write a knowledge file so the bot knows the lab.' },
      { title: '4.3 The Secret Keeper', body: 'Guard a secret against 5 extraction attempts.' },
      { title: '4.4 Tool Time', body: 'Pick 2 tools; the agent must fire the right ones.' },
      { title: '4.B The Gauntlet (boss)', body: 'Your agent passes a 5-question stress test. Reward: Fragment 4.' },
    ],
  },
  h5: {
    id: 'h5', dept: 'Data Science Wing', npcName: 'Tutorial Subsystem', npcRig: NPC_RIGS.skeletonMage, accent: '#38bdf8',
    dialogue: ['Floor 5 — Data Science. Lights out. Only code gets you through.', 'Python from zero, one line at a time. (placeholder)'],
    tasks: [
      { title: '5.1 Hello, Dark', body: 'Fill blanks: print(), variables — each correct line lights a corridor.' },
      { title: '5.2 The Sensor Loop', body: 'A for-loop + if to find the unlocked door.' },
      { title: '5.3 List of Lies', body: 'Indexing, len(), max() to find the corrupted reading.' },
      { title: '5.4 Predict the Output', body: 'Read a script; choose what it prints.' },
      { title: '5.B Power Router (boss)', body: 'Write a routing function; all tests pass. Reward: Fragment 5.' },
    ],
  },
  h6: {
    id: 'h6', dept: 'Deep Learning Labs', npcName: 'Repair Subsystem', npcRig: NPC_RIGS.skeletonRogue, accent: '#e58fb0',
    dialogue: ['Floor 6 — Deep Learning. Find where my metamorphosis broke.', 'It broke in the data. pandas + matplotlib will show it. (placeholder)'],
    tasks: [
      { title: '6.1 Frame the Data', body: 'Load the training log into pandas; find the bad epochs.' },
      { title: '6.2 The Curve', body: 'Plot the loss curve — the spike is the break.' },
      { title: '6.3 Filter the Poison', body: 'pandas filter + ask your agent to summarize the bad data.' },
      { title: '6.B Diagnosis (boss)', body: 'Assemble the repair report. Reward: Fragment 6.' },
    ],
  },
  h7: {
    id: 'h7', dept: 'Lab Archive', npcName: 'Archivist', npcRig: NPC_RIGS.skeletonMinion, accent: '#b0824f',
    dialogue: ['The Lab Archive — everything you learn is filed here.', 'Collect research logs; complete a field to master it. (placeholder)'],
    tasks: [
      { title: 'The Map of AI', body: 'ML · DL · NLP · CV · RL · GenAI · Foundation Models · Agents · Robotics · AI Safety.' },
      { title: 'Research logs', body: '2–4 per floor, found in the world — each a 60–90s illustrated read.' },
      { title: 'Takeaway', body: 'AI ≫ GenAI ≫ chatbots. Place GenAI correctly in the whole field.' },
    ],
  },
};

export function houseContent(id: string | undefined): HouseContent {
  return (id && HOUSE_CONTENT[id]) || HOUSE_CONTENT.main;
}
