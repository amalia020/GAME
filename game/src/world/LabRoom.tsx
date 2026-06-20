import { Grid } from '@react-three/drei';

const CONSOLES = [-5, -2.5, 2.5, 5];
const PILLARS = [-7, 7];

/**
 * The lab environment: a neon tech-grid floor receding into fog, walls with
 * emissive accent strips, a row of glowing consoles, and framing pillars.
 * Low-poly primitives + emissive accents = cheap on a Chromebook, but reads as
 * a real, lit place (not a blank void).
 */
export function LabRoom() {
  return (
    <group>
      {/* solid floor under the grid so it isn't see-through */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#26345a" />
      </mesh>

      {/* neon tech grid — chunky lines so they survive the low-res pixel pass */}
      <Grid
        position={[0, 0.02, 0]}
        args={[60, 60]}
        cellSize={1.25}
        cellThickness={1.4}
        cellColor="#3c5187"
        sectionSize={5}
        sectionThickness={2.6}
        sectionColor="#86ecff"
        fadeDistance={42}
        fadeStrength={1}
        infiniteGrid
      />

      {/* bold glowing floor strips framing the walkway (read clearly when pixelated) */}
      {[-6.4, 6.4].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, 0]}>
          <planeGeometry args={[0.32, 20]} />
          <meshStandardMaterial color="#6fe0ff" emissive="#6fe0ff" emissiveIntensity={2.2} />
        </mesh>
      ))}

      {/* back wall + emissive accent strip */}
      <mesh position={[0, 2.5, -8]}>
        <boxGeometry args={[26, 5, 0.4]} />
        <meshStandardMaterial color="#19233f" />
      </mesh>
      <mesh position={[0, 3.4, -7.78]}>
        <boxGeometry args={[26, 0.12, 0.05]} />
        <meshStandardMaterial color="#5fd9ff" emissive="#5fd9ff" emissiveIntensity={2.4} />
      </mesh>

      {/* side walls */}
      <mesh position={[-9, 2.5, 0]}>
        <boxGeometry args={[0.4, 5, 26]} />
        <meshStandardMaterial color="#1b2748" />
      </mesh>
      <mesh position={[9, 2.5, 0]}>
        <boxGeometry args={[0.4, 5, 26]} />
        <meshStandardMaterial color="#1b2748" />
      </mesh>

      {/* consoles with glowing monitors along the back */}
      {CONSOLES.map((x, i) => (
        <group key={i} position={[x, 0, -6.2]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 1, 0.8]} />
            <meshStandardMaterial color="#27365e" />
          </mesh>
          <mesh position={[0, 1.3, 0.05]} rotation={[-0.22, 0, 0]}>
            <planeGeometry args={[1.25, 0.72]} />
            <meshStandardMaterial
              color="#0a1730"
              emissive={i % 2 ? '#ff7eb6' : '#5fd9ff'}
              emissiveIntensity={1.7}
            />
          </mesh>
        </group>
      ))}

      {/* framing pillars */}
      {PILLARS.map((x, i) => (
        <mesh key={i} position={[x, 2.5, -2]}>
          <boxGeometry args={[0.6, 5, 0.6]} />
          <meshStandardMaterial color="#212e54" />
        </mesh>
      ))}
    </group>
  );
}
