import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const wp = new THREE.Vector3();

/**
 * Fades its children out as the CAMERA gets close to them.
 *
 * The follow camera sits at a fixed distance behind the character and no longer
 * dodges obstacles, so near the edge of the clearing it ends up standing inside
 * the treeline — a canopy fills half the screen. Foliage can't be shoved aside
 * the way the camera used to be (that was the jarring zoom), and it can't just
 * be culled either, or trees would pop. So it dissolves: by the time the camera
 * would be inside a canopy, that tree is already gone.
 */
export function ProximityFade({
  radius = 4.2,
  children,
}: {
  /** fully gone at this xz distance from the camera; fully solid ~2 units past it */
  radius?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const opacity = useRef(1);
  const primed = useRef(false);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;

    if (!primed.current) {
      // one-time: transparency must be enabled up front — toggling `transparent`
      // later recompiles the shader and hitches
      g.traverse((o: THREE.Object3D) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || !mesh.material) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) m.transparent = true;
      });
      primed.current = true;
    }

    g.getWorldPosition(wp);
    const d = Math.hypot(wp.x - state.camera.position.x, wp.z - state.camera.position.z);
    const want = THREE.MathUtils.clamp((d - radius) / 2, 0, 1);
    if (Math.abs(want - opacity.current) < 0.004) return;
    opacity.current = want;

    const solid = want > 0.985;
    g.visible = want > 0.01; // fully faded: skip it entirely
    g.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        m.opacity = want;
        m.depthWrite = solid; // a fading tree must not keep depth-hiding the character
      }
    });
  });

  return <group ref={ref}>{children}</group>;
}
