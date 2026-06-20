import { PixiStage } from './render/PixiStage';
import { buildRoomScene } from './scenes/RoomScene';
import { useGame } from './state/store';
import { TitleScreen } from './ui/TitleScreen';
import { BadgePhoto } from './ui/BadgePhoto';
import { Hud } from './ui/Hud';
import { PuzzlePanel } from './ui/PuzzlePanel';
import { RewardToast } from './ui/RewardToast';
import './styles/ui.css';

/**
 * Phase router. Title/Badge are full-screen React. Once an intern is picked we
 * mount the Pixi world (RoomScene) ONCE and keep it alive underneath, layering
 * React overlays (HUD, puzzle, reward) by phase. The world emits interactions
 * into the store (walk-up-to-terminal → openLevel).
 */
export function App() {
  const phase = useGame((s) => s.phase);
  const internIndex = useGame((s) => s.internIndex);

  if (phase === 'title') return <div className="app-root"><TitleScreen /></div>;
  if (phase === 'badge') return <div className="app-root"><BadgePhoto /></div>;

  return (
    <div className="app-root">
      <PixiStage
        key={internIndex ?? 0}
        onReady={(app) =>
          buildRoomScene(app, { internIndex: internIndex ?? 0, scene: 'cvLab' })
        }
      />
      <Hud />
      {phase === 'level' && <PuzzlePanel />}
      {phase === 'reward' && <RewardToast />}
    </div>
  );
}
