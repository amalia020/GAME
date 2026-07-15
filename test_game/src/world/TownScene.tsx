import { Ground } from './Ground';
import { TownSquare } from './TownSquare';
import { Player } from '../player/Player';
import { Houses } from './Houses';

/** The outdoor hub: ground + KayKit houses + greenery + the player. */
export function TownScene({ spawn = [0, 0, 4] as [number, number, number] }: { spawn?: [number, number, number] }) {
  return (
    <>
      <Ground />
      <Houses />
      <TownSquare />
      <Player spawn={spawn} />
    </>
  );
}
