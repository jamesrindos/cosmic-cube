import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WALL_COLOR = "#F5F0E6";
const FLOOR_COLOR = "#8B7355";
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.1;

const Wall = ({ position, size }: { position: [number, number, number]; size: [number, number, number] }) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={WALL_COLOR} />
  </mesh>
);

const WoodFloor = ({ position, size }: { position: [number, number, number]; size: [number, number] }) => {
  const texture = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = FLOOR_COLOR;
    ctx.fillRect(0, 0, 256, 256);
    // Wood plank lines
    ctx.strokeStyle = "#7A6548";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    // Subtle vertical grain
    ctx.strokeStyle = "#8A7050";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(size[0] / 2, size[1] / 2);
    return tex;
  })();

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};

// === KITCHEN ===

const KitchenIsland = () => (
  <group position={[5, 0, -7.5]}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[3, 0.1, 1.2]} />
      <meshStandardMaterial color="#E8E8E8" />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[2.8, 0.4, 1.0]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
  </group>
);

const Fridge = () => (
  <group position={[9.3, 0, -11.5]}>
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.9, 2, 0.8]} />
      <meshStandardMaterial color="#D0D0D0" />
    </mesh>
    <mesh position={[-0.47, 1.2, 0.15]}>
      <boxGeometry args={[0.04, 0.6, 0.06]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[-0.47, 0.4, 0.15]}>
      <boxGeometry args={[0.04, 0.4, 0.06]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[-0.46, 0.85, 0]}>
      <boxGeometry args={[0.01, 0.02, 0.78]} />
      <meshStandardMaterial color="#B0B0B0" />
    </mesh>
  </group>
);

const SmallCounter = () => (
  <group position={[7, 0, -11.8]}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[3, 0.1, 0.6]} />
      <meshStandardMaterial color="#F0F0F0" />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[2.8, 0.4, 0.5]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
  </group>
);

// === BEDROOM ===

const Bed = () => (
  <group position={[2, 0, -21]}>
    {/* Frame */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[3, 0.3, 3.5]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Mattress */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[2.8, 0.15, 3.3]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Headboard */}
    <mesh position={[0, 0.7, -1.7]}>
      <boxGeometry args={[3, 0.8, 0.12]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Blanket - askew */}
    <mesh position={[0.15, 0.45, 0.3]} rotation={[0, 0.08, 0]}>
      <boxGeometry args={[2.6, 0.08, 2.2]} />
      <meshStandardMaterial color="#2D3A5C" />
    </mesh>
    {/* Pillows */}
    <mesh position={[-0.5, 0.5, -1.3]} rotation={[0, 0.15, 0]}>
      <boxGeometry args={[0.7, 0.14, 0.45]} />
      <meshStandardMaterial color="#D8D8D8" />
    </mesh>
    <mesh position={[0.45, 0.48, -1.25]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.7, 0.14, 0.45]} />
      <meshStandardMaterial color="#D8D8D8" />
    </mesh>
  </group>
);

const GamingDesk = () => (
  <group position={[6.5, 0, -23]}>
    {/* Desktop */}
    <mesh position={[0, 0.75, 0]}>
      <boxGeometry args={[2.5, 0.08, 1]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Legs */}
    {[[-1.1, -0.4], [-1.1, 0.4], [1.1, -0.4], [1.1, 0.4]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.37, z]}>
        <boxGeometry args={[0.06, 0.74, 0.06]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    ))}

    {/* Center monitor (larger) */}
    <mesh position={[0, 1.25, -0.4]}>
      <boxGeometry args={[0.9, 0.55, 0.04]} />
      <meshStandardMaterial color="#0A0A0F" emissive="#7B68EE" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, 0.95, -0.35]}>
      <boxGeometry args={[0.15, 0.05, 0.1]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Left monitor */}
    <mesh position={[-0.85, 1.2, -0.38]} rotation={[0, 0.2, 0]}>
      <boxGeometry args={[0.7, 0.45, 0.04]} />
      <meshStandardMaterial color="#0A0A0F" emissive="#7B68EE" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[-0.8, 0.95, -0.33]}>
      <boxGeometry args={[0.12, 0.05, 0.08]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Right monitor */}
    <mesh position={[0.85, 1.2, -0.38]} rotation={[0, -0.2, 0]}>
      <boxGeometry args={[0.7, 0.45, 0.04]} />
      <meshStandardMaterial color="#0A0A0F" emissive="#7B68EE" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0.8, 0.95, -0.33]}>
      <boxGeometry args={[0.12, 0.05, 0.08]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>

    {/* RGB glow on BOTH sides of monitors */}
    <pointLight position={[-1.5, 1.2, -0.3]} color="#7B68EE" intensity={0.6} distance={4} decay={2} />
    <pointLight position={[1.5, 1.2, -0.3]} color="#7B68EE" intensity={0.6} distance={4} decay={2} />
    {/* Front monitor glow */}
    <pointLight position={[0, 1.2, 0.2]} color="#7B68EE" intensity={0.8} distance={4} decay={2} />

    {/* Rubik's cube */}
    <mesh position={[0.5, 0.85, 0.1]}>
      <boxGeometry args={[0.12, 0.12, 0.12]} />
      <meshStandardMaterial color="#CC3333" />
    </mesh>
    {/* Collectible figures */}
    <mesh position={[-0.6, 0.85, 0.15]}>
      <boxGeometry args={[0.08, 0.15, 0.08]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    <mesh position={[-0.45, 0.85, 0.2]}>
      <boxGeometry args={[0.06, 0.18, 0.06]} />
      <meshStandardMaterial color="#FF6B35" />
    </mesh>
    <mesh position={[-0.3, 0.85, 0.12]}>
      <boxGeometry args={[0.07, 0.13, 0.07]} />
      <meshStandardMaterial color="#4CAF50" />
    </mesh>
    {/* Energy drink cans */}
    <mesh position={[0.9, 0.83, 0.2]}>
      <cylinderGeometry args={[0.03, 0.03, 0.12, 6]} />
      <meshStandardMaterial color="#CC3333" />
    </mesh>
    <mesh position={[1.0, 0.83, 0.15]}>
      <cylinderGeometry args={[0.03, 0.03, 0.12, 6]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
  </group>
);

const GamingChair = () => (
  <group position={[6.5, 0, -21.5]}>
    {/* Seat */}
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[0.5, 0.08, 0.5]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Backrest */}
    <mesh position={[0, 0.85, 0.22]}>
      <boxGeometry args={[0.5, 0.7, 0.08]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Purple accent */}
    <mesh position={[0, 0.85, 0.27]}>
      <boxGeometry args={[0.12, 0.5, 0.01]} />
      <meshStandardMaterial color="#7B68EE" />
    </mesh>
    {/* Armrests */}
    <mesh position={[-0.28, 0.55, 0.05]}>
      <boxGeometry args={[0.06, 0.12, 0.35]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[0.28, 0.55, 0.05]}>
      <boxGeometry args={[0.06, 0.12, 0.35]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Base */}
    <mesh position={[0, 0.2, 0.05]}>
      <cylinderGeometry args={[0.08, 0.08, 0.35, 6]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[0, 0.04, 0.05]}>
      <cylinderGeometry args={[0.25, 0.25, 0.04, 5]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
  </group>
);

const Guitar = () => (
  <group position={[0.5, 0, -22]} rotation={[0, 0, 0.15]}>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.5, 0.8, 0.12]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.55, 0.4, 0.1]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    <mesh position={[0, 1.4, 0]}>
      <boxGeometry args={[0.12, 1.2, 0.06]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    <mesh position={[0, 2.05, 0]}>
      <boxGeometry args={[0.16, 0.2, 0.05]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[0, 0.55, -0.07]}>
      <boxGeometry args={[0.2, 0.2, 0.01]} />
      <meshStandardMaterial color="#0A0A0A" />
    </mesh>
  </group>
);

// === LIVING ROOM ===

const TV = () => (
  <group position={[9.7, 1.5, -4]}>
    <mesh>
      <boxGeometry args={[0.1, 1.5, 2]} />
      <meshStandardMaterial color="#0A0A0F" emissive="#00D9FF" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, -0.9, 0]}>
      <boxGeometry args={[0.3, 0.2, 0.8]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    <pointLight position={[-0.5, 0, 0]} color="#00D9FF" intensity={0.6} distance={5} decay={2} />
  </group>
);

const VHSShelf = () => (
  <group position={[9.6, 0.75, -6.5]}>
    <mesh position={[0, 0, -0.55]}>
      <boxGeometry args={[0.3, 1.5, 0.05]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[0, 0, 0.55]}>
      <boxGeometry args={[0.3, 1.5, 0.05]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {[-0.5, 0, 0.5].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <boxGeometry args={[0.3, 0.05, 1.1]} />
        <meshStandardMaterial color="#3D2E2E" />
      </mesh>
    ))}
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

// Couch now FACES the TV (rotated 90 degrees, backrest away from TV)
const Couch = () => (
  <group position={[6, 0, -4]} rotation={[0, -Math.PI / 2, 0]}>
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[2.5, 0.4, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    <mesh position={[0, 0.7, -0.5]}>
      <boxGeometry args={[2.5, 0.5, 0.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    <mesh position={[-1.15, 0.55, 0]}>
      <boxGeometry args={[0.2, 0.7, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    <mesh position={[1.15, 0.55, 0]}>
      <boxGeometry args={[0.2, 0.7, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Hoodie */}
    <mesh position={[1.15, 0.95, 0.1]}>
      <boxGeometry args={[0.35, 0.12, 0.8]} />
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
  <group position={[8, 0, -4]}>
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[0.8, 0.08, 1.5]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {[[-0.3, -0.6], [-0.3, 0.6], [0.3, -0.6], [0.3, 0.6]].map(([x, z], i) => (
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
      {/* Open living room + kitchen (one big space) */}
      <WoodFloor position={[5, 0.01, -6]} size={[10, 12]} />
      {/* Hallway - longer and narrower */}
      <WoodFloor position={[2, 0.01, -14.5]} size={[2, 5]} />
      {/* Bedroom */}
      <WoodFloor position={[4, 0.01, -21]} size={[8, 8]} />

      {/* === ROOM LIGHTING === */}
      {/* Bright living/kitchen fill */}
      <pointLight position={[5, 2.8, -3]} color="#FFF5E6" intensity={1.5} distance={16} decay={1.5} />
      <pointLight position={[5, 2.8, -9]} color="#FFF5E6" intensity={1.2} distance={14} decay={1.5} />
      {/* TV accent */}
      <PulsingLight position={[9, 1.5, -4]} color="#00D9FF" intensity={0.4} />

      {/* Bedroom - dim with purple glow */}
      <PulsingLight position={[6.5, 1.5, -23]} color="#7B68EE" intensity={1.5} />
      <pointLight position={[4, 2.5, -21]} color="#FFF5E6" intensity={0.25} distance={10} decay={2} />

      {/* Hallway */}
      <pointLight position={[2, 2, -14.5]} color="#FFF5E6" intensity={0.6} distance={6} decay={2} />

      {/* === OUTER WALLS - OPEN LIVING/KITCHEN === */}
      {/* Front wall (south) */}
      <Wall position={[5, hy, 0]} size={[10, h, t]} />
      {/* Left wall (living + kitchen) */}
      <Wall position={[0, hy, -6]} size={[t, h, 12]} />
      {/* Right wall (living + kitchen) */}
      <Wall position={[10, hy, -6]} size={[t, h, 12]} />
      {/* Back kitchen wall */}
      <Wall position={[5, hy, -12]} size={[10, h, t]} />

      {/* NO wall between kitchen and living room - open plan! */}
      {/* Kitchen island is the only separator (placed at z=-7.5) */}

      {/* === HALLWAY WALLS - longer and narrower === */}
      {/* Left hallway wall */}
      <Wall position={[1, hy, -14.5]} size={[t, h, 5]} />
      {/* Right hallway wall */}
      <Wall position={[3, hy, -14.5]} size={[t, h, 5]} />

      {/* === BEDROOM WALLS === */}
      {/* North bedroom wall (top) */}
      <Wall position={[4, hy, -25]} size={[8, h, t]} />
      {/* Left bedroom wall */}
      <Wall position={[0, hy, -21]} size={[t, h, 8]} />
      {/* Right bedroom wall */}
      <Wall position={[8, hy, -21]} size={[t, h, 8]} />
      {/* South bedroom wall - with doorway opening */}
      <Wall position={[0.5, hy, -17]} size={[1, h, t]} />
      <Wall position={[5.5, hy, -17]} size={[5, h, t]} />

      {/* === KITCHEN (back half of open space) === */}
      <KitchenIsland />
      <Fridge />
      <SmallCounter />

      {/* === LIVING ROOM (front half of open space) === */}
      <TV />
      <VHSShelf />
      <Couch />
      <CoffeeTable />

      {/* === BEDROOM FURNITURE === */}
      <Bed />
      <GamingDesk />
      <GamingChair />
      <Guitar />
    </group>
  );
};

const Scene = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0D0D0F" }}>
      <Canvas camera={{ position: [20, 20, 20], fov: 45 }} shadows>
        <color attach="background" args={["#0D0D0F"]} />
        <ambientLight color="#FFF5E6" intensity={0.8} />
        <directionalLight position={[-8, 20, 5]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[10, 15, -10]} intensity={0.4} color="#FFF5E6" />
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
