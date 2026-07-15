import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * A cheap painterly sky: a big back-side sphere with a soft vertical gradient
 * (warm hazy horizon → cool blue zenith), the Ghibli/Lunistice look. Unlit and
 * fog-excluded so it stays a clean gradient; sits behind everything and lets the
 * scene fog fade distant geometry into the warm horizon band.
 */
export function GradientSky({
  top = '#8ec5e6', // cool zenith blue
  horizon = '#f4ecd8', // warm hazy cream at the horizon
  offset = 0.18, // push the warm band a touch below the true horizon
}: {
  top?: string;
  horizon?: string;
  offset?: number;
}) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(top) },
        uHorizon: { value: new THREE.Color(horizon) },
        uOffset: { value: offset },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform float uOffset;
        varying vec3 vDir;
        void main() {
          float h = smoothstep(-uOffset, 0.55, vDir.y);
          vec3 col = mix(uHorizon, uTop, h);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [top, horizon, offset]);

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}
