import { TilePath } from './Tiles';
import { HOUSES, houseDoor, PLAZA_POS } from './townData';

/** A tiled stone path from the central plaza out to every house's door, so each
 *  house is clearly connected. */
export function Paths() {
  const px = PLAZA_POS[0];
  const pz = PLAZA_POS[2];
  return (
    <>
      {HOUSES.map((h) => {
        const door = houseDoor(h);
        const dx = door[0] - px;
        const dz = door[1] - pz;
        const len = Math.hypot(dx, dz) || 1;
        // start just outside the plaza slab so the path meets the plaza, not its centre
        const start: [number, number] = [px + (dx / len) * 5.6, pz + (dz / len) * 5.6];
        return <TilePath key={h.id} from={start} to={door} width={2.8} />;
      })}
    </>
  );
}
