import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/** Loads a PNG and forces nearest-neighbour filtering so it stays crisp under
 *  the pixel pass (no blurry edges on the billboards). */
export function useBillboardTexture(url: string): THREE.Texture {
  const tex = useTexture(url);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
