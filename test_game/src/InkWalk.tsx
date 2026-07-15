import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { TownScene } from './world/TownScene';
import { InteriorScene } from './world/InteriorScene';
import { InkEffects } from './render/InkEffects';
import { GradientSky } from './render/GradientSky';
import { FadeOverlay } from './ui/FadeOverlay';
import { InteractionPrompt } from './ui/InteractionPrompt';
import { DialogOverlay } from './ui/DialogOverlay';
import { useLocation } from './state/location';
import { HOUSES, houseDoor } from './world/townData';

/** Where the player appears in town: at the door of the house they just left,
 *  else the default plaza spot. */
function townSpawn(spawnAt?: string): [number, number, number] {
  const h = spawnAt ? HOUSES.find((x) => x.id === spawnAt) : undefined;
  if (h) {
    const [x, z] = houseDoor(h);
    return [x, 0, z];
  }
  return [0, 0, 4];
}

/**
 * Ink Walk — a clean-slate experiment: cel-shaded + ink-outlined world with a
 * curved horizon and a third-person follow cam. Full-res + antialiased (the
 * opposite of MORPHO's pixel renderer) so the ink lines stay crisp.
 */
export function InkWalk() {
  const loc = useLocation();

  return (
    <>
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 5, 9], fov: 42 }}
      shadows="soft" /* PCFSoft shadow maps — soft Ghibli shadows */
      flat /* NoToneMapping — let HDR emissives survive into the bloom pass */
    >
      {/* painterly gradient sky + a warm hazy horizon the fog fades into */}
      <GradientSky top="#8ec5e6" horizon="#f4ecd8" />
      <fog attach="fog" args={['#e9e3d2', 42, 105]} />

      {/* Ghibli daylight: warm sky/ground hemisphere bounce + a warm sun that
          casts soft shadows, plus a gentle cool rim from behind. */}
      <hemisphereLight args={['#cfe6f2', '#6f8a55', 1.05]} />
      <ambientLight intensity={0.22} color="#efe9dc" />
      <directionalLight
        position={[9, 14, 7]}
        intensity={1.65}
        color="#ffe6bd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.045}
      >
        <orthographicCamera attach="shadow-camera" args={[-32, 32, 32, -32, 0.5, 70]} />
      </directionalLight>
      <directionalLight position={[-6, 5, -5]} intensity={0.4} color="#bcd6e8" />

      <Suspense fallback={null}>
        {loc.kind === 'town' ? (
          <TownScene spawn={townSpawn(loc.spawnAt)} />
        ) : (
          <InteriorScene houseId={loc.houseId} />
        )}
      </Suspense>

      <InkEffects />
    </Canvas>
    <InteractionPrompt />
    <DialogOverlay />
    <FadeOverlay />
    </>
  );
}
