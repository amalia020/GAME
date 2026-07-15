import { Ground } from './Ground';
import { TownSquare } from './TownSquare';
import { Player } from '../player/Player';
import { Houses } from './Houses';
import { Pedestrians } from './Pedestrians';
import { Plaza } from './Plaza';
import { PLAZA_POS } from './townData';

/** The outdoor hub: ground + KayKit houses + fountain + greenery + townsfolk + player. */
export function TownScene({ spawn = [0, 0, 4] as [number, number, number] }: { spawn?: [number, number, number] }) {
  return (
    <>
      <Ground />
      <Houses />
      <Plaza position={PLAZA_POS} />
      <TownSquare />
      <Pedestrians />
      <Player spawn={spawn} />
    </>
  );
}
