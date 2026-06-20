import WorldCanvas from './world/WorldCanvas';
import { useGame } from './state/store';
import { TitleScreen } from './ui/TitleScreen';
import { BadgePhoto } from './ui/BadgePhoto';
import { Hud } from './ui/Hud';
import { PuzzlePanel } from './ui/PuzzlePanel';
import { RewardToast } from './ui/RewardToast';
import './styles/ui.css';

/**
 * Phase router. Title/Badge are full-screen React. Once an intern is picked we
 * mount the pixel-3D world (WorldCanvas / react-three-fiber) ONCE and keep it
 * alive underneath, layering React overlays (HUD, puzzle, reward) by phase. The
 * world emits interactions into the store (walk up to MORPHO → openLevel).
 */
export function App() {
  const phase = useGame((s) => s.phase);
  const internIndex = useGame((s) => s.internIndex);

  if (phase === 'title') return <div className="app-root"><TitleScreen /></div>;
  if (phase === 'badge') return <div className="app-root"><BadgePhoto /></div>;

  return (
    <div className="app-root">
      <WorldCanvas internIndex={internIndex ?? 0} />
      <Hud />
      {phase === 'level' && <PuzzlePanel />}
      {phase === 'reward' && <RewardToast />}
    </div>
  );
}
