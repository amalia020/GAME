import { Billboard } from '@react-three/drei';
import { useBillboardTexture } from './textures';

/** A camera-facing card showing a character PNG (Demon Turf style). The plane
 *  width is derived from the texture aspect ratio so art isn't stretched. */
export function CharacterBillboard({
  url,
  position,
  height = 2,
}: {
  url: string;
  position: [number, number, number];
  height?: number;
}) {
  const tex = useBillboardTexture(url);
  const img = tex.image as { width: number; height: number } | undefined;
  const aspect = img && img.height ? img.width / img.height : 1;
  const width = height * aspect;
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.5} />
      </mesh>
    </Billboard>
  );
}
