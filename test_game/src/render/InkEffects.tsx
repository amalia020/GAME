import { wrapEffect, EffectComposer, Bloom } from '@react-three/postprocessing';
import { InkOutlineEffect } from './InkOutlineEffect';

const InkOutline = wrapEffect(InkOutlineEffect);

/**
 * Post stack: targeted bloom (only HDR-emissive accents exceed the threshold,
 * so cream walls stay crisp while cyan portholes + amber windows glow) then the
 * ink outline on top so lines stay sharp. mipmapBlur keeps bloom cheap for web.
 */
export function InkEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={1.0}
        luminanceSmoothing={0.15}
        mipmapBlur
        radius={0.7}
      />
      <InkOutline />
    </EffectComposer>
  );
}
