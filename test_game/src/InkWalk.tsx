import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { TownScene } from './world/TownScene';
import { InteriorScene } from './world/InteriorScene';
import { InkEffects } from './render/InkEffects';
import { GradientSky } from './render/GradientSky';
import { FadeOverlay } from './ui/FadeOverlay';
import { InteractionPrompt } from './ui/InteractionPrompt';
import { DialogOverlay } from './ui/DialogOverlay';
import { PromptPuzzle } from './ui/PromptPuzzle';
import { Hud } from './ui/Hud';
import { CameraPublisher, HouseLabels } from './ui/HouseLabels';
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
      {loc.kind === 'town' ? (
        <>
          {/* OUTDOORS — painterly gradient sky + warm hazy horizon + Ghibli daylight */}
          <GradientSky top="#8ec5e6" horizon="#f4ecd8" />
          <fog attach="fog" args={['#e9e3d2', 42, 105]} />
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
        </>
      ) : (
        <>
          {/* INDOORS — dark warm enclosure (no outdoor sky bleeding in), cozy lamp
              light + a soft overhead key; near fog fades the room edges into the dark. */}
          <color attach="background" args={['#171310']} />
          <fog attach="fog" args={['#171310', 7, 30]} />
          <ambientLight intensity={0.5} color="#ffdca8" />
          <hemisphereLight args={['#4a3b28', '#161009', 0.55]} />
          <directionalLight
            position={[4, 11, 3]}
            intensity={0.55}
            color="#ffd8a0"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0006}
            shadow-normalBias={0.04}
          >
            <orthographicCamera attach="shadow-camera" args={[-9, 9, 9, -9, 0.5, 30]} />
          </directionalLight>
        </>
      )}

      <Suspense fallback={null}>
        {loc.kind === 'town' ? (
          <TownScene spawn={townSpawn(loc.spawnAt)} />
        ) : (
          <InteriorScene houseId={loc.houseId} />
        )}
      </Suspense>

      <CameraPublisher />
      <InkEffects />
    </Canvas>
    <Hud />
    {loc.kind === 'town' && <HouseLabels />}
    <InteractionPrompt />
    <DialogOverlay />
    <PromptPuzzle />
    <FadeOverlay />
    </>
  );
}
