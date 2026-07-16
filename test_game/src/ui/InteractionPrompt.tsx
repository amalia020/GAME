import { usePrompt } from '../state/interaction';

/** DOM pill showing the current interaction prompt ("Enter House 3 · press E"). */
export function InteractionPrompt() {
  const p = usePrompt();
  if (!p) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 84,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(20,18,14,0.82)',
        color: '#f4ecd8',
        font: '600 15px/1 "Baloo 2", ui-rounded, system-ui, sans-serif',
        letterSpacing: 0.3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      {p.label}
    </div>
  );
}
