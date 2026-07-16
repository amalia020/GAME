import { useState } from 'react';
import { HOUSE_CONTENT } from '../content/houses';

/**
 * Gamified HUD scaffolding (placeholders — real content added later): an XP/level
 * strip, and buttons opening Menu / Roadmap / Goals / Challenges panels. All DOM,
 * sits above the canvas.
 */
type Panel = 'menu' | 'roadmap' | 'goals' | 'challenges' | null;

const CHALLENGE_HOUSES = Object.values(HOUSE_CONTENT).filter((h) => h.id !== 'main');

export function Hud() {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <>
      {/* top-left: level + XP progress (placeholder) */}
      <div style={xpWrap}>
        <div style={levelBadge}>Lv 1</div>
        <div style={xpTrack}><div style={{ ...xpFill, width: '35%' }} /></div>
        <span style={xpLabel}>350 / 1000 XP</span>
      </div>

      {/* top-right: gamified buttons */}
      <div style={btnBar}>
        <HudButton icon="☰" label="Menu" onClick={() => setPanel('menu')} />
        <HudButton icon="🗺" label="Roadmap" onClick={() => setPanel('roadmap')} />
        <HudButton icon="🎯" label="Goals" onClick={() => setPanel('goals')} />
        <HudButton icon="🏆" label="Challenges" onClick={() => setPanel('challenges')} />
      </div>

      {panel && (
        <div style={backdrop} onClick={() => setPanel(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHead}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{titles[panel]}</h2>
              <button style={closeX} onClick={() => setPanel(null)}>✕</button>
            </div>
            {panel === 'menu' && (
              <ul style={list}>
                <li>Resume</li>
                <li>Settings (placeholder)</li>
                <li>Credits — see CREDITS.md</li>
                <li>Sign out (placeholder)</li>
              </ul>
            )}
            {panel === 'roadmap' && (
              <div>
                <p style={muted}>Your learning path (placeholder — real curriculum added later).</p>
                <ol style={list}>
                  <li>Module 1 — Intro <span style={pill}>current</span></li>
                  <li>Module 2 — Foundations <span style={pillDim}>locked</span></li>
                  <li>Module 3 — Practice <span style={pillDim}>locked</span></li>
                  <li>Module 4 — Mastery <span style={pillDim}>locked</span></li>
                </ol>
              </div>
            )}
            {panel === 'goals' && (
              <div>
                <p style={muted}>Goals (placeholder).</p>
                <ul style={list}>
                  <li>◻ Visit the Home Base</li>
                  <li>◻ Talk to your first NPC</li>
                  <li>◻ Complete a challenge</li>
                  <li>◻ Earn 1000 XP</li>
                </ul>
              </div>
            )}
            {panel === 'challenges' && (
              <div>
                <p style={muted}>Challenges — one per house (content added later).</p>
                <ul style={{ ...list, listStyle: 'none', paddingLeft: 0 }}>
                  {CHALLENGE_HOUSES.map((h, i) => (
                    <li key={h.id} style={challengeRow}>
                      <span>Challenge {i + 1} — {h.npcName}</span>
                      <span style={pillDim}>not started</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const titles: Record<Exclude<Panel, null>, string> = {
  menu: 'Menu',
  roadmap: 'Learning Roadmap',
  goals: 'Goals',
  challenges: 'Challenges',
};

function HudButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button style={hudBtn} onClick={onClick}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const font = '"Baloo 2", ui-rounded, system-ui, sans-serif';
const xpWrap: React.CSSProperties = { position: 'fixed', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8, zIndex: 30 };
const levelBadge: React.CSSProperties = { background: '#f7b13e', color: '#241a0a', fontWeight: 800, borderRadius: 8, padding: '4px 8px', font: `800 13px ${font}` };
const xpTrack: React.CSSProperties = { width: 150, height: 9, background: 'rgba(20,18,14,0.35)', borderRadius: 999, overflow: 'hidden' };
const xpFill: React.CSSProperties = { height: '100%', background: 'linear-gradient(90deg,#7dd3fc,#38bdf8)' };
const xpLabel: React.CSSProperties = { color: '#f4ecd8', font: `600 12px ${font}`, textShadow: '0 1px 3px rgba(0,0,0,0.5)' };
const btnBar: React.CSSProperties = { position: 'fixed', top: 12, right: 14, display: 'flex', gap: 8, zIndex: 30 };
const hudBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 9px', borderRadius: 13, border: '2px solid #4a3620', borderTop: '2px solid #ab8354', background: 'linear-gradient(#916f47, #6d5133)', color: '#f9f0d8', font: `800 14px ${font}`, textShadow: '0 2px 0 rgba(58,38,18,0.5)', boxShadow: '0 4px 10px rgba(0,0,0,0.32)', cursor: 'pointer' };
const backdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(20,18,14,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70 };
const modal: React.CSSProperties = { width: 'min(560px, 92vw)', maxHeight: '80vh', overflow: 'auto', background: 'rgba(28,25,19,0.97)', color: '#f4ecd8', borderRadius: 18, padding: '20px 24px', border: '1px solid rgba(247,236,216,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)', font: `400 15px ${font}` };
const modalHead: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 };
const closeX: React.CSSProperties = { background: 'none', border: 'none', color: '#f4ecd8', fontSize: 18, cursor: 'pointer', opacity: 0.7 };
const list: React.CSSProperties = { lineHeight: 1.9, margin: '6px 0' };
const muted: React.CSSProperties = { opacity: 0.75, marginTop: 0 };
const pill: React.CSSProperties = { background: '#38bdf8', color: '#06222e', borderRadius: 999, padding: '1px 8px', fontSize: 12, marginLeft: 8, fontWeight: 700 };
const pillDim: React.CSSProperties = { background: 'rgba(247,236,216,0.14)', color: '#cbb', borderRadius: 999, padding: '1px 8px', fontSize: 12, marginLeft: 8 };
const challengeRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(247,236,216,0.08)' };
