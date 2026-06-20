/**
 * Slice room: a floor, two back walls, and a few boxes standing in for desks.
 * Primitive geometry only (CC0 glTF props are a later, out-of-slice task).
 */
export function LabRoom() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#3a4a6b" />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 2, -8]}>
        <boxGeometry args={[16, 4, 0.4]} />
        <meshStandardMaterial color="#2a3550" />
      </mesh>
      {/* side wall */}
      <mesh position={[-8, 2, 0]}>
        <boxGeometry args={[0.4, 4, 16]} />
        <meshStandardMaterial color="#313c5c" />
      </mesh>
      {/* desks (placeholder boxes) */}
      <mesh position={[3, 0.5, -3]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#52608a" />
      </mesh>
      <mesh position={[-3, 0.5, -2]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#52608a" />
      </mesh>
    </group>
  );
}
