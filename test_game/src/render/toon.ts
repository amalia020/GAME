import * as THREE from 'three';

/**
 * Shared "curve the world" uniforms (the fake tiny-planet horizon).
 * Near field stays FLAT (so character + outlines sit tight); only geometry
 * past `uNear` view-distance bends downward, ∝ distance² — exactly how
 * abeto's real sphere reads at ground level.
 */
export const curveUniforms = {
  uCurvature: { value: 0.011 },
  uNear: { value: 13.0 },
};

/** N-step grayscale ramp → soft cel bands as MeshToonMaterial.gradientMap.
 *  4 bands + a lifted floor give the softer, painterly Ghibli/Lunistice shading
 *  (gentler light→shadow falloff than a hard 3-band comic cel). */
function createToonGradient(steps = 4): THREE.DataTexture {
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) {
    // lifted floor so shadows stay warm & luminous, not muddy
    data[i] = Math.round(THREE.MathUtils.lerp(148, 255, i / (steps - 1)));
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const gradient = createToonGradient(4);

/** Inject the curve-down displacement into a material's vertex stage. */
export function curveWorld(material: THREE.Material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCurvature = curveUniforms.uCurvature;
    shader.uniforms.uNear = curveUniforms.uNear;
    shader.vertexShader =
      'uniform float uCurvature;\nuniform float uNear;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      /* glsl */ `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        float cdist = length( mvPosition.xz );
        float d = max( 0.0, cdist - uNear );
        mvPosition.y -= d * d * uCurvature;
        gl_Position = projectionMatrix * mvPosition;
      `,
    );
  };
}

export interface ToonOpts {
  color: THREE.ColorRepresentation;
  curve?: boolean;
  /** emissive intensity; >1 pushes into HDR so the targeted bloom catches it. */
  emissive?: number;
}

/** Cel-shaded material (banded light). Curved by default. */
export function makeToon({ color, curve = true, emissive = 0 }: ToonOpts): THREE.MeshToonMaterial {
  const mat = new THREE.MeshToonMaterial({ color, gradientMap: gradient });
  if (emissive > 0) {
    mat.emissive = new THREE.Color(color);
    mat.emissiveIntensity = emissive;
  }
  if (curve) curveWorld(mat);
  return mat;
}

/**
 * Convert an imported model material to the cel-shaded look, preserving its
 * base color + texture. Used to make GLB characters match the world's toon
 * style. Not curved (characters live in the flat near field).
 */
export function toonifyMaterial(src: THREE.Material, curve = false): THREE.MeshToonMaterial {
  const s = src as THREE.MeshStandardMaterial;
  const m = new THREE.MeshToonMaterial({
    color: s.color ? s.color.clone() : new THREE.Color('#cccccc'),
    map: s.map ?? null,
    gradientMap: gradient,
    transparent: src.transparent,
    opacity: src.opacity,
    vertexColors: (src as THREE.MeshStandardMaterial).vertexColors ?? false,
  });
  if (curve) curveWorld(m); // world props bend with the horizon; characters don't
  return m;
}

/** Solarpunk palette — warm cream/concrete + lush greens + amber & cyan glow,
 *  keeping MORPHO's electric-blue + amber accent identity (cozier base). */
export const INK = '#14120e'; // warm near-black ink line
export const PALETTE = {
  sky: '#c4e3f0', // soft bright blue
  cloud: '#f1f7fa',
  // building bodies — warm concrete / cream / wood
  cream: '#ece4d2', // primary warm off-white wall
  concrete: '#cdc7b8', // secondary warm grey concrete
  wood: '#b0824f', // warm wood trim
  woodDark: '#6f4f34',
  orange: '#d98a4a', // (kept) terracotta
  blue: '#bcd6e8', // (kept) pale blue wall option
  green: '#4f9d5a', // mid foliage (also building-tint key, reused for leaves)
  // ground
  grass: '#6fae64', // lush grass
  road: '#bcb4a2', // warm stone path
  // foliage layers
  leafDeep: '#2e7d46',
  leaf: '#4f9d5a',
  leafLight: '#79c06a',
  flower: '#e58fb0', // soft pink blossoms
  vine: '#3a8a4e', // climbing vines
  // glowing accents (HDR emissive → targeted bloom)
  accentBlue: '#38bdf8', // cyan porthole / panel glow
  accentAmber: '#f7b13e', // warm window glow
  glass: '#f7b13e', // lit window (amber)
  glassCool: '#7dd3fc', // cool glass option
  // architectural detail
  trim: '#3a3a42', // soft dark frames/detail
  solar: '#1c2740', // solar panel base
  solarGrid: '#2f6d9e', // solar panel cells
  roofGreen: '#3f6d54',
  roofBlue: '#46566f',
  roofRust: '#b5653f', // terracotta tile
  // props / misc
  yellow: '#f7b13e',
  hair: '#3a3a42', // lamp post
  skin: '#e9bd97',
  bag: '#7d7361',
} as const;
