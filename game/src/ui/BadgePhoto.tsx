import { useState } from 'react';
import { INTERNS } from '../render/assets';
import { useGame } from '../state/store';

/**
 * The "intern badge photo" moment — pick your character from the 12 (diverse by
 * default). The choice becomes the player's avatar and (later) leaderboard icon.
 */
export function BadgePhoto() {
  const pickIntern = useGame((s) => s.pickIntern);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="screen">
      <div className="screen-kicker">Security · New Intern</div>
      <h1 className="screen-title" style={{ fontSize: 'clamp(24px,4vw,40px)' }}>
        Take your badge photo
      </h1>
      <p className="screen-sub">Choose your intern. This is you for the rest of the lab.</p>

      <div className="badge-grid">
        {INTERNS.map((src, i) => (
          <button
            key={i}
            className={`badge-card${selected === i ? ' selected' : ''}`}
            onClick={() => setSelected(i)}
            aria-label={`Intern ${i + 1}`}
          >
            <span className="badge-no">{String(i + 1).padStart(2, '0')}</span>
            <img src={src} alt={`Intern ${i + 1}`} />
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        disabled={selected === null}
        style={selected === null ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
        onClick={() => selected !== null && pickIntern(selected)}
      >
        Clock in ▶
      </button>
    </div>
  );
}
