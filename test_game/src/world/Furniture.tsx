import { GltfModel } from './GltfModel';

/** A KayKit Furniture-Bits piece (toon-shaded via GltfModel). */
export function Furniture({
  item,
  position,
  yaw = 0,
  scale = 1,
}: {
  item: string;
  position: [number, number, number];
  yaw?: number;
  scale?: number;
}) {
  return (
    <GltfModel
      url={`/models/kits/interior/${item}.gltf`}
      position={position}
      rotation={[0, yaw, 0]}
      scale={scale}
    />
  );
}
