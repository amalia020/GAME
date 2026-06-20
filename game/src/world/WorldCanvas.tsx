import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress, Stats } from '@react-three/drei';
import { WorldScene } from './WorldScene';
import './world.css';

/** Low internal resolution → big GPU savings + the chunky pixel look. */
export const PIXEL_DPR = 0.25;

function Loader() {
  const { active } = useProgress();
  return (
    <Html center>
      <div className="world-loading">{active ? 'Entering the lab…' : ''}</div>
    </Html>
  );
}

export default function WorldCanvas({ internIndex }: { internIndex: number }) {
  return (
    <div className="world-canvas-wrap fade-in">
      <Canvas
        className="world-canvas"
        dpr={PIXEL_DPR}
        gl={{ antialias: false }}
        camera={{ position: [0, 6, 10], fov: 45 }}
      >
        <Suspense fallback={<Loader />}>
          <WorldScene internIndex={internIndex} />
        </Suspense>
        {import.meta.env.DEV && <Stats />}
      </Canvas>
    </div>
  );
}
