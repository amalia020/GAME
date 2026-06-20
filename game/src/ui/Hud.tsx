import { RANKS, rankForXp, useGame } from '../state/store';

/** Top status bar: rank + XP progress toward the next rank, plus floor label. */
export function Hud() {
  const xp = useGame((s) => s.xp);
  const rank = rankForXp(xp);
  const idx = RANKS.findIndex((r) => r.id === rank.id);
  const next = RANKS[idx + 1];

  const pct = next
    ? Math.min(100, ((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)
    : 100;

  return (
    <div className="hud">
      <div className="hud-rank">
        <b>{rank.name}</b> · {xp} XP
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="hud-spacer" />
      <div className="hud-floor">Floor 1 · Computer Vision Lab</div>
    </div>
  );
}
