import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
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

const GridFloor = ({ position, size }: { position: [number, number, number]; size: [number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1A1A2E";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "#252547";
    ctx.lineWidth = 1;
    const step = 32;
    for (let i = 0; i <= 256; i += step) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(size[0] / 2, size[1] / 2);
    return tex;
  })();

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};

const KitchenIsland = () => (
  <mesh position={[6, 0.4, -2]}>
    <boxGeometry args={[2, 0.8, 1]} />
    <meshStandardMaterial color="#0F3460" />
  </mesh>
);

// === LIVING ROOM FURNITURE ===

const TV = () => (
  <group position={[9.7, 1.5, -4]}>
    {/* Screen */}
    <mesh>
      <boxGeometry args={[0.1, 1.5, 2]} />
      <meshStandardMaterial color="#0A0A0F" emissive="#00D9FF" emissiveIntensity={0.3} />
    </mesh>
    {/* Stand */}
    <mesh position={[0, -0.9, 0]}>
      <boxGeometry args={[0.3, 0.2, 0.8]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Screen glow light */}
    <pointLight position={[-0.5, 0, 0]} color="#00D9FF" intensity={0.6} distance={5} decay={2} />
  </group>
);

const VHSShelf = () => (
  <group position={[9.6, 0.75, -6.5]}>
    {/* Frame */}
    {/* Left side */}
    <mesh position={[0, 0, -0.55]}>
      <boxGeometry args={[0.3, 1.5, 0.05]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Right side */}
    <mesh position={[0, 0, 0.55]}>
      <boxGeometry args={[0.3, 1.5, 0.05]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Shelves */}
    {[-0.5, 0, 0.5].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <boxGeometry args={[0.3, 0.05, 1.1]} />
        <meshStandardMaterial color="#16213E" />
      </mesh>
    ))}
    {/* VHS tapes / items on shelves */}
    {[-0.25, 0.25].map((y, row) =>
      [-0.35, -0.15, 0.05, 0.25].map((z, col) => (
        <mesh key={`${row}-${col}`} position={[0, y, z]}>
          <boxGeometry args={[0.15, 0.2, 0.12]} />
          <meshStandardMaterial color={["#1a1a3e", "#2a1a3e", "#1a2a3e", "#2a2a3e"][col]} />
        </mesh>
      ))
    )}
  </group>
);

const Couch = () => (
  <group position={[2, 0, -4]}>
    {/* Seat base */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[2.5, 0.4, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Backrest */}
    <mesh position={[0, 0.7, -0.5]}>
      <boxGeometry args={[2.5, 0.5, 0.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Left arm */}
    <mesh position={[-1.15, 0.55, 0]}>
      <boxGeometry args={[0.2, 0.7, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Right arm */}
    <mesh position={[1.15, 0.55, 0]}>
      <boxGeometry args={[0.2, 0.7, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Hoodie draped on right arm */}
    <mesh position={[1.15, 0.95, 0.1]}>
      <boxGeometry args={[0.35, 0.12, 0.8]} />
      <meshStandardMaterial color="#9B8AC4" />
    </mesh>
    {/* Hoodie sleeve hanging down */}
    <mesh position={[1.35, 0.65, 0.3]}>
      <boxGeometry args={[0.12, 0.5, 0.2]} />
      <meshStandardMaterial color="#9B8AC4" />
    </mesh>
    {/* Cushions */}
    <mesh position={[-0.5, 0.55, 0]}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color="#353548" />
    </mesh>
    <mesh position={[0.5, 0.55, 0]}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color="#353548" />
    </mesh>
  </group>
);

const CoffeeTable = () => (
  <group position={[5.5, 0, -4]}>
    {/* Table top */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[1.5, 0.08, 0.8]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {/* Legs */}
    {[[-0.6, -0.3], [-0.6, 0.3], [0.6, -0.3], [0.6, 0.3]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.2, z]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#2D2020" />
      </mesh>
    ))}
  </group>
);

const PulsingLight = ({ position, color, intensity }: { position: [number, number, number]; color: string; intensity: number }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = intensity + Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });
  return <pointLight ref={lightRef} position={position} color={color} intensity={intensity} distance={12} decay={2} />;
};

const Apartment = () => {
  const h = WALL_HEIGHT;
  const t = WALL_THICKNESS;
  const hy = h / 2;

  return (
    <group position={[-5, 0, 5]}>
      {/* === FLOORS === */}
      <GridFloor position={[5, 0.01, -4]} size={[10, 8]} />
      <GridFloor position={[5, 0.01, -10]} size={[10, 4]} />
      <GridFloor position={[2, 0.01, -13]} size={[2, 2]} />
      <GridFloor position={[4, 0.01, -19]} size={[8, 10]} />

      {/* === ROOM LIGHTING === */}
      {/* TV glow in living room */}
      <PulsingLight position={[5, 1.5, -7.5]} color="#00D9FF" intensity={1.8} />
      {/* Ambient bounce from TV on floor */}
      <pointLight position={[5, 0.3, -6]} color="#00D9FF" intensity={0.4} distance={6} decay={2} />

      {/* RGB desk glow in bedroom */}
      <PulsingLight position={[2, 1.5, -20]} color="#7B68EE" intensity={1.5} />
      {/* Accent strip in bedroom */}
      <pointLight position={[4, 0.2, -22]} color="#9B59B6" intensity={0.3} distance={5} decay={2} />

      {/* Dim hallway light */}
      <pointLight position={[2, 2, -13]} color="#7B68EE" intensity={0.3} distance={5} decay={2} />

      {/* Kitchen under-cabinet glow */}
      <pointLight position={[6, 0.9, -2]} color="#00D9FF" intensity={0.4} distance={4} decay={2} />

      {/* === LIVING ROOM WALLS === */}
      <Wall position={[5, hy, 0]} size={[10, h, t]} />
      <Wall position={[0, hy, -4]} size={[t, h, 8]} />
      <Wall position={[10, hy, -4]} size={[t, h, 8]} />
      <Wall position={[2, hy, -8]} size={[4, h, t]} />
      <Wall position={[8.5, hy, -8]} size={[3, h, t]} />

      {/* === KITCHEN WALLS === */}
      <Wall position={[0, hy, -10]} size={[t, h, 4]} />
      <Wall position={[10, hy, -10]} size={[t, h, 4]} />
      <Wall position={[0.5, hy, -12]} size={[1, h, t]} />
      <Wall position={[6.5, hy, -12]} size={[7, h, t]} />

      <KitchenIsland />

      {/* === LIVING ROOM FURNITURE === */}
      <TV />
      <VHSShelf />
      <Couch />
      <CoffeeTable />

      {/* === HALLWAY === */}
      <Wall position={[1, hy, -13]} size={[t, h, 2]} />
      <Wall position={[3, hy, -13]} size={[t, h, 2]} />

      {/* === BEDROOM WALLS === */}
      <Wall position={[1, hy, -14]} size={[2, h, t]} />
      <Wall position={[6, hy, -14]} size={[4, h, t]} />
      <Wall position={[0, hy, -19]} size={[t, h, 10]} />
      <Wall position={[8, hy, -19]} size={[t, h, 10]} />
      <Wall position={[4, hy, -24]} size={[8, h, t]} />
    </group>
  );
};

const Scene = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0D0D0F" }}>
      <Canvas camera={{ position: [20, 20, 20], fov: 45 }} shadows>
        <color attach="background" args={["#0D0D0F"]} />
        <ambientLight color="#7B68EE" intensity={0.3} />
        <directionalLight position={[10, 20, 10]} intensity={0.2} color="#ffffff" />
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
