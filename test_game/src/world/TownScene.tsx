import { Ground } from './Ground';
import { TownSquare } from './TownSquare';
import { Player } from '../player/Player';
import { Houses } from './Houses';
import { Pedestrians } from './Pedestrians';
import { Plaza } from './Plaza';
import { Paths } from './Paths';
import { Scatter } from './Scatter';
import { VillageEdge } from './VillageEdge';
import { PLAZA_POS, VILLAGE } from './townData';

/** The outdoor hub: ground + tiled paths + KayKit houses + fountain + greenery + townsfolk + player. */
export function TownScene({ spawn = [0, 0, 4] as [number, number, number] }: { spawn?: [number, number, number] }) {
  return (
    <>
      <Ground />
      <Paths />
      <Houses />
      <Plaza position={PLAZA_POS} />
      <TownSquare />
      <Scatter />
      <VillageEdge />
      <Pedestrians />
      {/* circular clearing: you can roam the whole village but not off into empty grass */}
      <Player spawn={spawn} boundCircle={VILLAGE} />
    </>
  );
}
