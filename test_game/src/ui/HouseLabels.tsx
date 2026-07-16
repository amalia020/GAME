import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraRef } from '../state/camera';
import { HOUSES, houseDoor } from '../world/townData';
import { houseContent } from '../content/houses';

/** Publishes the live camera each frame (mount INSIDE the Canvas). */
export function CameraPublisher() {
  useFrame((s) => {
    cameraRef.cam = s.camera;
  });
  return null;
}

const anchor = new THREE.Vector3();

/**
 * Department name labels that track each house in screen space (mount OUTSIDE the
 * Canvas). Projected every frame; a label shows only while its house is on screen,
 * floating just above the roof. Robust regardless of camera angle.
 */
export function HouseLabels() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const cam = cameraRef.cam;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (cam) {
        const M = 54; // keep labels this far from the screen edge
        HOUSES.forEach((house, i) => {
          const el = refs.current[i];
          if (!el) return;
          const [dx, dz] = houseDoor(house);
          anchor.set(dx, 2.4, dz).project(cam);
          if (anchor.z > 1) {
            el.style.opacity = '0'; // behind the camera
            return;
          }
          const x = Math.max(M, Math.min(w - M, (anchor.x * 0.5 + 0.5) * w));
          const y2 = Math.max(M + 40, Math.min(h - M, (-anchor.y * 0.5 + 0.5) * h));
          el.style.left = `${x}px`;
          el.style.top = `${y2}px`;
          el.style.opacity = '1';
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {HOUSES.map((house, i) => (
        <div
          key={house.id}
          ref={(el) => { refs.current[i] = el; }}
          style={{
            position: 'fixed',
            transform: 'translate(-50%, -50%)',
            padding: '5px 15px 7px',
            borderRadius: 13,
            // carved wooden plaque: warm grain + lighter top bevel + dark edge
            background: 'linear-gradient(#916f47, #6d5133)',
            border: '2px solid #4a3620',
            borderTop: '2px solid #ab8354',
            color: '#f9f0d8',
            font: '800 15px/1.05 "Baloo 2", ui-rounded, system-ui, sans-serif',
            whiteSpace: 'nowrap',
            letterSpacing: 0.3,
            textShadow: '0 2px 0 rgba(58,38,18,0.55)',
            // department-accent strip along the bottom + soft drop shadow
            boxShadow: `inset 0 -4px 0 ${houseContent(house.id).accent}, 0 5px 12px rgba(0,0,0,0.4)`,
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 160ms',
            zIndex: 25,
          }}
        >
          {house.name}
        </div>
      ))}
    </>
  );
}
