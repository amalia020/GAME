import { useGame } from '../state/store';

/**
 * Reward beat after a level clears. STUB-ish: shows XP gained and returns to the
 * room. Checkpoint C4 adds the MORPHO success line, badge/fragment art, and juice.
 */
export function RewardToast() {
  const lastReward = useGame((s) => s.lastReward);
  const dismiss = useGame((s) => s.dismissReward);

  return (
    <div className="screen" style={{ background: 'rgba(10,14,26,0.9)' }}>
      <div className="screen-kicker">Clearance granted</div>
      <h1 className="screen-title" style={{ color: 'var(--c-amber)' }}>
        +{lastReward} XP
      </h1>
      <p className="screen-sub">Nice. The panel responded. MORPHO steadies, just a little.</p>
      <button className="btn-primary" onClick={dismiss}>
        Continue ▶
      </button>
    </div>
  );
}
