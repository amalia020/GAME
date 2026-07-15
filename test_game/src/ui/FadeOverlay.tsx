import { useEffect, useRef, useState } from 'react';
import { useLocation } from '../state/location';

/**
 * A quick black fade on every scene change (town ⇄ interior) so transitions read
 * as a cut-to-black rather than a jarring pop. Pure DOM overlay over the canvas.
 */
export function FadeOverlay() {
  const loc = useLocation();
  const key = loc.kind === 'interior' ? `in:${loc.houseId}` : 'town';
  const [opaque, setOpaque] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setOpaque(true);
    const t = setTimeout(() => setOpaque(false), 120);
    return () => clearTimeout(t);
  }, [key]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#14120e',
        pointerEvents: 'none',
        opacity: opaque ? 1 : 0,
        transition: opaque ? 'opacity 80ms ease-in' : 'opacity 260ms ease-out',
        zIndex: 50,
      }}
    />
  );
}
