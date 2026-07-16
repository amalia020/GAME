import { Building } from './Building';
import { InteractionManager, type InteractPoint } from './InteractionManager';
import { HOUSES, houseYaw, houseDoor, HOUSE_SCALE, BUILDING_BOXES } from './townData';
import { enterHouse } from '../state/location';

/** All KayKit houses ringing the plaza + their door-entry triggers + name signs. */
export function Houses() {
  const points: InteractPoint[] = HOUSES.map((h) => {
    const [x, z] = houseDoor(h);
    return {
      id: h.id,
      label: `Enter ${h.name}  ·  press E`,
      x,
      z,
      radius: 3,
      onActivate: () => enterHouse(h.id),
    };
  });

  return (
    <group>
      {HOUSES.map((h) => (
        <Building
          key={h.id}
          model={h.model}
          position={[h.pos[0], 0, h.pos[1]]}
          yaw={houseYaw(h)}
          scale={HOUSE_SCALE}
          box={BUILDING_BOXES.find((b) => b.id === h.id)}
        />
      ))}
      <InteractionManager points={points} />
    </group>
  );
}
