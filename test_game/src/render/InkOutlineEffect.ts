import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform, Color } from 'three';

/**
 * Full-scene ink outline. Reads the depth buffer and marks pixels where depth
 * curvature spikes — i.e. silhouettes AND interior creases — while leaving flat
 * or evenly-sloped surfaces clean (a discrete Laplacian is ~0 on linear ramps).
 * Because it runs on the final depth, lines follow the curved-world shader for
 * free. This is abeto's signature ink, done as a post pass.
 */
const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uThickness;
uniform float uStrength;

float linearize(float d) {
  float z = d * 2.0 - 1.0;
  return (2.0 * cameraNear * cameraFar) /
         (cameraFar + cameraNear - z * (cameraFar - cameraNear));
}

float depthAt(vec2 uv) {
  return linearize(texture2D(depthBuffer, uv).x);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec2 t = uThickness / resolution;

  float dC = linearize(depth);
  float dL = depthAt(uv + vec2(-t.x, 0.0));
  float dR = depthAt(uv + vec2( t.x, 0.0));
  float dU = depthAt(uv + vec2(0.0,  t.y));
  float dD = depthAt(uv + vec2(0.0, -t.y));

  // second derivative (Laplacian) → 0 on flat/evenly-sloped, spikes on edges
  float lap = abs(2.0 * dC - dL - dR) + abs(2.0 * dC - dU - dD);

  // scale by depth so distant edges still register; ignore the far sky plane
  float edge = lap / (dC * 0.05 + 0.0001);
  float ink = smoothstep(0.4, 1.0, edge) * uStrength;
  ink *= step(dC, cameraFar * 0.92); // don't ink the background

  outputColor = vec4(mix(inputColor.rgb, uColor, ink), inputColor.a);
}
`;

export interface InkOutlineOptions {
  color?: Color;
  thickness?: number;
  strength?: number;
}

export class InkOutlineEffect extends Effect {
  constructor({ color = new Color('#0a0e1a'), thickness = 1.7, strength = 1.0 }: InkOutlineOptions = {}) {
    super('InkOutlineEffect', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform<unknown>>([
        ['uColor', new Uniform(color)],
        ['uThickness', new Uniform(thickness)],
        ['uStrength', new Uniform(strength)],
      ]),
    });
  }
}
