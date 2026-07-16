import { useMemo, useState } from 'react';
import { usePuzzle, closePuzzle } from '../state/puzzle';

/**
 * Tier-1 prompt-block puzzle SHELL (design doc §4). Click blocks to build a prompt;
 * a signal-strength meter charges as the combination improves (placeholder rule
 * engine); Submit shows the bot's canned response. Real per-level content later.
 */
type Cat = 'ROLE' | 'TASK' | 'CONTEXT' | 'FORMAT' | 'CONSTRAINT' | 'TONE';

interface Block {
  cat: Cat;
  text: string;
}

const PALETTE: Block[] = [
  { cat: 'ROLE', text: 'You are a maintenance bot.' },
  { cat: 'TASK', text: 'Open the east door panel.' },
  { cat: 'CONTEXT', text: 'The fire alarm is active.' },
  { cat: 'FORMAT', text: 'Answer in one word.' },
  { cat: 'CONSTRAINT', text: 'Do not mention the intern.' },
  { cat: 'TONE', text: 'Be calm and polite.' },
];

const CAT_COLOR: Record<Cat, string> = {
  ROLE: '#a78bfa', TASK: '#38bdf8', CONTEXT: '#4f9d5a',
  FORMAT: '#f7b13e', CONSTRAINT: '#e58fb0', TONE: '#7dd3fc',
};

// placeholder rule engine: TASK + FORMAT required, ROLE/CONTEXT are bonus
const REQUIRED: Cat[] = ['TASK', 'FORMAT'];
const BONUS: Cat[] = ['ROLE', 'CONTEXT'];

function score(cats: Cat[]): number {
  const has = (c: Cat) => cats.includes(c);
  const req = REQUIRED.filter(has).length / REQUIRED.length;
  const bonus = Math.min(BONUS.filter(has).length, 2) * 0.12;
  const clutter = cats.length > 5 ? 0.1 : 0; // rambling weakens the signal
  return Math.max(0, Math.min(1, req * 0.78 + bonus - clutter));
}

export function PromptPuzzle() {
  const target = usePuzzle();
  const [chosen, setChosen] = useState<Block[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // reset when a new puzzle opens
  const key = target ? `${target.houseId}:${target.taskIndex}` : '';
  useMemo(() => {
    setChosen([]);
    setSubmitted(false);
  }, [key]);

  if (!target) return null;

  const cats = chosen.map((b) => b.cat);
  const s = score(cats);
  const pass = s >= 0.7;

  return (
    <div style={backdrop}>
      <div style={panel}>
        <div style={head}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 0.6, color: '#f7b13e', fontWeight: 800 }}>PROMPT LAB · TIER 1</div>
            <h2 style={{ margin: '2px 0 0', fontSize: 20 }}>{target.title}</h2>
          </div>
          <button style={closeX} onClick={closePuzzle}>✕</button>
        </div>

        <p style={goal}>Goal: get the door panel to respond. Build a prompt from the blocks below.</p>

        {/* signal-strength meter */}
        <div style={{ margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.8, width: 96 }}>Signal strength</span>
          <div style={meterTrack}>
            <div style={{ ...meterFill, width: `${Math.round(s * 100)}%`, background: pass ? 'linear-gradient(90deg,#4f9d5a,#7dd3fc)' : 'linear-gradient(90deg,#e58fb0,#f7b13e)' }} />
          </div>
          <span style={{ fontSize: 12, width: 40, textAlign: 'right' }}>{Math.round(s * 100)}%</span>
        </div>

        {/* the prompt being built */}
        <div style={dropZone}>
          {chosen.length === 0 && <span style={{ opacity: 0.45, fontSize: 13 }}>Click blocks to add them here…</span>}
          {chosen.map((b, i) => (
            <button key={i} style={{ ...chip, borderColor: CAT_COLOR[b.cat] }} onClick={() => setChosen((c) => c.filter((_, j) => j !== i))} title="remove">
              <b style={{ color: CAT_COLOR[b.cat] }}>{b.cat}</b> {b.text}
            </button>
          ))}
        </div>

        {/* block palette */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {PALETTE.map((b) => (
            <button
              key={b.cat}
              style={{ ...chip, opacity: cats.includes(b.cat) ? 0.4 : 1, borderColor: CAT_COLOR[b.cat] }}
              disabled={cats.includes(b.cat)}
              onClick={() => setChosen((c) => [...c, b])}
            >
              <b style={{ color: CAT_COLOR[b.cat] }}>{b.cat}</b>
            </button>
          ))}
        </div>

        {/* submit + result */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={submitBtn} onClick={() => setSubmitted(true)} disabled={chosen.length === 0}>Send prompt ▸</button>
          {submitted && (
            <div style={{ fontSize: 14, color: pass ? '#8fe0a0' : '#f3b0a0' }}>
              {pass
                ? '🟢 Bot: “Acknowledged. Opening east door.” — the panel slides open. +XP'
                : '🔴 Bot: “…unclear request.” The panel stays shut. Add a clear TASK and a FORMAT.'}
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, opacity: 0.5, marginTop: 12 }}>
          Placeholder rule engine — real per-level blocks, goals, and bot responses come from content JSON later.
        </p>
      </div>
    </div>
  );
}

const font = 'ui-sans-serif, system-ui, sans-serif';
const backdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(20,18,14,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, font: `400 15px ${font}` };
const panel: React.CSSProperties = { width: 'min(680px, 94vw)', maxHeight: '86vh', overflow: 'auto', background: 'rgba(28,25,19,0.98)', color: '#f4ecd8', borderRadius: 18, padding: '20px 24px', border: '1px solid rgba(247,236,216,0.12)', boxShadow: '0 24px 70px rgba(0,0,0,0.6)' };
const head: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const closeX: React.CSSProperties = { background: 'none', border: 'none', color: '#f4ecd8', fontSize: 18, cursor: 'pointer', opacity: 0.7 };
const goal: React.CSSProperties = { fontSize: 14, opacity: 0.85, margin: '10px 0 0' };
const meterTrack: React.CSSProperties = { flex: 1, height: 12, borderRadius: 999, background: 'rgba(247,236,216,0.12)', overflow: 'hidden' };
const meterFill: React.CSSProperties = { height: '100%', transition: 'width 180ms ease' };
const dropZone: React.CSSProperties = { minHeight: 64, marginTop: 6, padding: 10, borderRadius: 12, border: '1px dashed rgba(247,236,216,0.25)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' };
const chip: React.CSSProperties = { padding: '7px 11px', borderRadius: 9, background: 'rgba(20,18,14,0.6)', border: '1.5px solid', color: '#f4ecd8', font: `600 13px ${font}`, cursor: 'pointer', textAlign: 'left' };
const submitBtn: React.CSSProperties = { padding: '9px 18px', borderRadius: 999, border: 'none', background: '#f7b13e', color: '#241a0a', fontWeight: 800, cursor: 'pointer' };
