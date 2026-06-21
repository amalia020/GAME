import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Ground } from './world/Ground';
import { TownSquare } from './world/TownSquare';
import { Player } from './player/Player';
import { InkEffects } from './render/InkEffects';
import { PALETTE } from './render/toon';

/**
 * Ink Walk — a clean-slate experiment: cel-shaded + ink-outlined world with a
 * curved horizon and a third-person follow cam. Full-res + antialiased (the
 * opposite of MORPHO's pixel renderer) so the ink lines stay crisp.
 */
export function InkWalk() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 5, 9], fov: 42 }}
      shadows={false}
      flat /* NoToneMapping — let HDR emissives survive into the bloom pass */
    >
      <color attach="background" args={[PALETTE.sky]} />
      <fog attach="fog" args={[PALETTE.sky, 40, 95]} />

      {/* warm solarpunk daylight: soft sky ambient + warm sun key */}
      <ambientLight intensity={0.62} color="#dfeaf0" />
      <directionalLight position={[8, 13, 6]} intensity={1.9} color="#fff1d6" />
      <directionalLight position={[-6, 5, -5]} intensity={0.45} color={PALETTE.sky} />

      <Suspense fallback={null}>
        <Ground />
        <TownSquare />
        <Player />
      </Suspense>

      <InkEffects />
    </Canvas>
  );
}
