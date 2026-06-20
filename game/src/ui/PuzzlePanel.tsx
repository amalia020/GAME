import { useGame } from '../state/store';

/**
 * STUB (Checkpoint C1): proves the room→level→reward loop end-to-end. The real
 * drag-drop prompt-block puzzle + signal meter lands in Checkpoint C3 and
 * replaces this body.
 */
export function PuzzlePanel() {
  const completeLevel = useGame((s) => s.completeLevel);
  const closeLevel = useGame((s) => s.closeLevel);
  const activeLevelId = useGame((s) => s.activeLevelId) ?? '1-1';

  return (
    <div className="screen" style={{ background: 'rgba(10,14,26,0.92)' }}>
      <div className="screen-kicker">Terminal · Level {activeLevelId}</div>
      <h1 className="screen-title" style={{ fontSize: 'clamp(22px,3.4vw,34px)' }}>
        Prompt-block puzzle
      </h1>
      <p className="screen-sub">
        Placeholder. In Checkpoint C3 this becomes the drag-drop block tray, the
        live signal-strength meter, and the bot's reaction. For now, use the
        buttons to test the flow.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-ghost" onClick={closeLevel}>
          ← Walk away
        </button>
        <button className="btn-primary" onClick={() => completeLevel(activeLevelId, 50)}>
          Solve (debug) ▶
        </button>
      </div>
    </div>
  );
}
