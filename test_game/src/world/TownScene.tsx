import { Ground } from './Ground';
import { TownSquare } from './TownSquare';
import { Player } from '../player/Player';

/** The outdoor hub: ground + buildings + the player (town colliders by default). */
export function TownScene({ spawn = [0, 0, 4] as [number, number, number] }: { spawn?: [number, number, number] }) {
  return (
    <>
      <Ground />
      <TownSquare />
      <Player spawn={spawn} />
    </>
  );
}
