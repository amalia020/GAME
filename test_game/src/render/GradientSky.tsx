import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A painterly sky: warm hazy horizon → cool blue zenith, with soft drifting
 * procedural clouds and a gentle sun glow. Unlit + fog-excluded so it stays a
 * clean backdrop; the scene fog fades distant geometry into the horizon band.
 */
export function GradientSky({
  top = '#5aa6dc',
  horizon = '#dbe9ec',
  offset = 0.04,
  sun = [9, 14, 7] as [number, number, number],
}: {
  top?: string;
  horizon?: string;
  offset?: number;
  sun?: [number, number, number];
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(top) },
        uHorizon: { value: new THREE.Color(horizon) },
        uLand: { value: new THREE.Color('#4a7d54') },
        uOffset: { value: offset },
        uTime: { value: 0 },
        uSun: { value: new THREE.Vector3(...sun).normalize() },
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
        uniform vec3 uLand;
        uniform vec3 uSun;
        uniform float uOffset;
        uniform float uTime;
        varying vec3 vDir;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
          return v;
        }

        void main() {
          // Reach the blue FAST. The camera pitches ~30 degrees down, so only a
          // thin band above the horizon is ever on screen — a wide pale gradient
          // would make that whole band read as blown-out haze.
          float h = smoothstep(-uOffset, 0.22, vDir.y);
          vec3 col = mix(uHorizon, uTop, h);

          // warm sun glow
          float sd = max(dot(normalize(vDir), uSun), 0.0);
          col += vec3(1.0, 0.82, 0.55) * pow(sd, 26.0) * 0.55;
          col += vec3(1.0, 0.88, 0.68) * pow(sd, 5.0) * 0.10;

          // ---- clouds: TWO decks on a projected sky plane, drifting at
          // different speeds so the sky reads as deep instead of painted-on.
          float y = max(vDir.y, 0.06);
          vec2 base = vDir.xz / y;
          // Hold clouds OFF the low band: that band is the only sky on screen, and
          // wall-to-wall cloud there just reads as a white void above the trees.
          float fade = smoothstep(0.05, 0.24, vDir.y);

          // deck A — high, thin cirrus: fast, stretched, faint
          vec2 uvA = base * 0.30 + vec2(uTime * 0.016, uTime * 0.006);
          float nA = fbm(uvA * vec2(1.1, 3.2));       // stretched = wind-combed
          float cirrus = smoothstep(0.50, 0.80, nA) * 0.38;
          col = mix(col, vec3(1.0, 0.99, 0.97), cirrus * fade);

          // deck B — low, puffy cumulus: slow, chunky, opaque, with shaded bellies
          vec2 uvB = base * 0.55 + vec2(uTime * 0.007, uTime * 0.003);
          float nB = fbm(uvB * 1.6);
          nB = nB * 0.72 + fbm(uvB * 4.1) * 0.28;     // wispy edge detail
          float cumulus = smoothstep(0.52, 0.78, nB) * fade;
          // sunward side catches warm light, undersides go cool grey
          float lit = smoothstep(0.55, 0.85, nB) * (0.55 + 0.45 * max(dot(normalize(vDir), uSun), 0.0));
          vec3 cloudCol = mix(vec3(0.78, 0.81, 0.88), vec3(1.0, 0.98, 0.93), lit);
          col = mix(col, cloudCol, cumulus * 0.92);

          // BELOW the horizon the sphere is distant LAND, never pale sky. The
          // curved ground bends away and exposes this band, so any gap in the
          // treeline reads as far-off forest instead of a white hole.
          col = mix(col, uLand, smoothstep(0.03, -0.05, vDir.y));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [top, horizon, offset, sun]);

  useFrame((state) => {
    const m = matRef.current ?? material;
    m.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[400, 48, 24]} />
    </mesh>
  );
}
