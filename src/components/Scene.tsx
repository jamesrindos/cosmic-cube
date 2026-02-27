import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const FLOOR_COLOR = "#1A1A2E";
const WALL_COLOR = "#16213E";
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.1;

const Wall = ({ position, size }: { position: [number, number, number]; size: [number, number, number] }) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={WALL_COLOR} />
  </mesh>
);

const Floor = ({ position, size }: { position: [number, number, number]; size: [number, number] }) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={size} />
    <meshStandardMaterial color={FLOOR_COLOR} side={THREE.DoubleSide} />
  </mesh>
);

const KitchenIsland = () => (
  <mesh position={[6, 0.4, -2]}>
    <boxGeometry args={[2, 0.8, 1]} />
    <meshStandardMaterial color="#0F3460" />
  </mesh>
);

const Apartment = () => {
  const h = WALL_HEIGHT;
  const t = WALL_THICKNESS;
  const hy = h / 2;

  return (
    <group position={[-5, 0, 5]}>
      {/* === FLOORS === */}
      {/* Living room floor 10x8 */}
      <Floor position={[5, 0.01, -4]} size={[10, 8]} />
      {/* Kitchen floor (right of living room) */}
      <Floor position={[5, 0.01, -10]} size={[10, 4]} />
      {/* Hallway floor */}
      <Floor position={[2, 0.01, -13]} size={[2, 2]} />
      {/* Bedroom floor 8x10 */}
      <Floor position={[4, 0.01, -19]} size={[8, 10]} />

      {/* === LIVING ROOM WALLS === */}
      {/* Bottom wall (south) */}
      <Wall position={[5, hy, 0]} size={[10, h, t]} />
      {/* Left wall */}
      <Wall position={[0, hy, -4]} size={[t, h, 8]} />
      {/* Right wall */}
      <Wall position={[10, hy, -4]} size={[t, h, 8]} />
      {/* Top wall with doorway to kitchen - left segment */}
      <Wall position={[2, hy, -8]} size={[4, h, t]} />
      {/* Top wall with doorway to kitchen - right segment */}
      <Wall position={[8.5, hy, -8]} size={[3, h, t]} />

      {/* === KITCHEN WALLS === */}
      {/* Left wall - upper part (with opening to hallway) */}
      <Wall position={[0, hy, -10]} size={[t, h, 4]} />
      {/* Right wall */}
      <Wall position={[10, hy, -10]} size={[t, h, 4]} />
      {/* Top wall with opening for hallway */}
      <Wall position={[0.5, hy, -12]} size={[1, h, t]} />
      <Wall position={[6.5, hy, -12]} size={[7, h, t]} />

      {/* Kitchen island */}
      <KitchenIsland />

      {/* === HALLWAY === */}
      {/* Left wall */}
      <Wall position={[1, hy, -13]} size={[t, h, 2]} />
      {/* Right wall */}
      <Wall position={[3, hy, -13]} size={[t, h, 2]} />

      {/* === BEDROOM WALLS === */}
      {/* Top wall with doorway - left segment */}
      <Wall position={[1, hy, -14]} size={[2, h, t]} />
      {/* Top wall with doorway - right segment */}
      <Wall position={[6, hy, -14]} size={[4, h, t]} />
      {/* Left wall */}
      <Wall position={[0, hy, -19]} size={[t, h, 10]} />
      {/* Right wall */}
      <Wall position={[8, hy, -19]} size={[t, h, 10]} />
      {/* Bottom wall */}
      <Wall position={[4, hy, -24]} size={[8, h, t]} />
    </group>
  );
};

const Scene = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0D0D0F" }}>
      <Canvas camera={{ position: [20, 20, 20], fov: 45 }}>
        <color attach="background" args={["#0D0D0F"]} />
        <ambientLight color="#7B68EE" intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1} />
        <directionalLight position={[-5, 10, -5]} intensity={0.3} />
        <Apartment />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 3}
          target={[0, 0, -7]}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
