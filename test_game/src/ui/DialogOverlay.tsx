import { useEffect, useState } from 'react';
import { useTalking, endTalk } from '../state/dialog';
import { houseContent } from '../content/houses';
import { openPuzzle } from '../state/puzzle';

/**
 * DOM dialogue → tasks overlay. When talking to an NPC it shows the NPC's lines
 * one at a time (advance with click / E / Enter / Space); after the last line it
 * reveals the placeholder task list. All content is data-driven from houses.ts.
 */
export function DialogOverlay() {
  const houseId = useTalking();
  const [phase, setPhase] = useState<'dialogue' | 'tasks'>('dialogue');
  const [line, setLine] = useState(0);

  // reset when a new conversation starts
  useEffect(() => {
    setPhase('dialogue');
    setLine(0);
  }, [houseId]);

  const content = houseContent(houseId ?? undefined);

  useEffect(() => {
    if (houseId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTalk();
        return;
      }
      if (phase === 'dialogue' && (e.key === 'e' || e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (houseId === null) return null;

  function advance() {
    if (line < content.dialogue.length - 1) setLine((l) => l + 1);
    else if (content.tasks.length > 0) setPhase('tasks');
    else endTalk();
  }

  return (
    <div style={backdrop}>
      {phase === 'dialogue' ? (
        <div style={panel} onClick={advance}>
          <div style={nameTag}>{content.npcName}</div>
          <p style={{ margin: '8px 0 14px', fontSize: 17, lineHeight: 1.5 }}>{content.dialogue[line]}</p>
          <div style={hint}>
            {line < content.dialogue.length - 1 ? 'click / E — next' : content.tasks.length ? 'click / E — see tasks' : 'click / E — done'}
          </div>
        </div>
      ) : (
        <div style={panel}>
          <div style={nameTag}>Challenges · {content.npcName}</div>
          <div style={{ margin: '10px 0 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {content.tasks.map((t, i) => (
              <button
                key={i}
                style={taskRow}
                onClick={() => { openPuzzle({ houseId: content.id, taskIndex: i, title: t.title }); endTalk(); }}
              >
                <div style={{ fontWeight: 700 }}>{t.title} <span style={{ color: '#f7b13e', fontSize: 12 }}>▸ play</span></div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>{t.body}</div>
              </button>
            ))}
          </div>
          <button style={btn} onClick={endTalk}>Close (Esc)</button>
        </div>
      )}
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(20,18,14,0.45)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  padding: '0 0 48px', zIndex: 60,
};
const panel: React.CSSProperties = {
  width: 'min(680px, 92vw)', background: 'rgba(24,22,17,0.94)', color: '#f4ecd8',
  borderRadius: 16, padding: '18px 22px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  border: '1px solid rgba(247,236,216,0.12)', cursor: 'pointer',
  font: '400 16px/1.4 ui-sans-serif, system-ui, sans-serif',
};
const nameTag: React.CSSProperties = {
  display: 'inline-block', fontWeight: 800, letterSpacing: 0.4,
  color: '#f7b13e', fontSize: 14, textTransform: 'uppercase',
};
const hint: React.CSSProperties = { fontSize: 12, opacity: 0.6, letterSpacing: 0.4 };
const btn: React.CSSProperties = {
  marginTop: 6, padding: '8px 16px', borderRadius: 999, border: 'none',
  background: '#f7b13e', color: '#241a0a', fontWeight: 700, cursor: 'pointer',
};
const taskRow: React.CSSProperties = {
  textAlign: 'left', padding: '10px 12px', borderRadius: 10,
  background: 'rgba(20,18,14,0.5)', border: '1px solid rgba(247,236,216,0.1)',
  color: '#f4ecd8', cursor: 'pointer', font: '400 15px/1.35 ui-sans-serif, system-ui, sans-serif',
};
