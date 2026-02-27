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
  <group position={[5, 0, -10]}>
    {/* Counter top */}
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[3, 0.1, 1.5]} />
      <meshStandardMaterial color="#E8E8E8" />
    </mesh>
    {/* Base */}
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[2.8, 0.4, 1.3]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
  </group>
);

const Fridge = () => (
  <group position={[9.3, 0, -11.5]}>
    {/* Body */}
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.9, 2, 0.8]} />
      <meshStandardMaterial color="#D0D0D0" />
    </mesh>
    {/* Handle */}
    <mesh position={[-0.47, 1.2, 0.15]}>
      <boxGeometry args={[0.04, 0.6, 0.06]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[-0.47, 0.4, 0.15]}>
      <boxGeometry args={[0.04, 0.4, 0.06]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Door line */}
    <mesh position={[-0.46, 0.85, 0]}>
      <boxGeometry args={[0.01, 0.02, 0.78]} />
      <meshStandardMaterial color="#B0B0B0" />
    </mesh>
  </group>
);

const KitchenCounters = () => (
  <group>
    {/* Back wall counter */}
    <group position={[5, 0, -11.8]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[6, 0.1, 0.6]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[5.8, 0.4, 0.5]} />
        <meshStandardMaterial color="#2D2D3A" />
      </mesh>
    </group>
    {/* Side wall counter */}
    <group position={[0.5, 0, -10]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.6, 0.1, 3]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.4, 2.8]} />
        <meshStandardMaterial color="#2D2D3A" />
      </mesh>
    </group>

    {/* Coffee maker */}
    <group position={[3, 0.5, -11.8]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.25]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>
      <mesh position={[0, 0.35, -0.05]}>
        <boxGeometry args={[0.25, 0.1, 0.15]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>
    </group>

    {/* Microwave */}
    <group position={[6.5, 0.5, -11.8]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.4]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>
      {/* Door */}
      <mesh position={[-0.31, 0.2, 0]}>
        <boxGeometry args={[0.01, 0.28, 0.32]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>

    {/* Pizza boxes stacked on side counter */}
    <group position={[0.5, 0.5, -9]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#CC3333" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
    </group>
  </group>
);

// === BEDROOM FURNITURE ===

const Bed = () => (
  <group position={[6, 0, -21]}>
    {/* Frame */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[2.2, 0.3, 3]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Mattress */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[2, 0.15, 2.8]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Headboard */}
    <mesh position={[0, 0.7, -1.4]}>
      <boxGeometry args={[2.2, 0.8, 0.12]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Blanket - slightly askew */}
    <mesh position={[0.1, 0.45, 0.3]} rotation={[0, 0.08, 0]}>
      <boxGeometry args={[1.9, 0.08, 2]} />
      <meshStandardMaterial color="#2D3A5C" />
    </mesh>
    {/* Pillow 1 - angled */}
    <mesh position={[-0.4, 0.5, -1.1]} rotation={[0, 0.15, 0]}>
      <boxGeometry args={[0.6, 0.12, 0.4]} />
      <meshStandardMaterial color="#D8D8D8" />
    </mesh>
    {/* Pillow 2 */}
    <mesh position={[0.35, 0.48, -1.05]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.6, 0.12, 0.4]} />
      <meshStandardMaterial color="#D8D8D8" />
    </mesh>
  </group>
);

const GamingDesk = () => (
  <group position={[1.5, 0, -17]}>
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

    {/* Monitor glow */}
    <pointLight position={[0, 1.2, -0.2]} color="#7B68EE" intensity={0.8} distance={4} decay={2} />

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
    <mesh position={[0.95, 0.83, 0.3]}>
      <cylinderGeometry args={[0.03, 0.03, 0.12, 6]} />
      <meshStandardMaterial color="#CC3333" />
    </mesh>
  </group>
);

const GamingChair = () => (
  <group position={[1.5, 0, -16]}>
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
    {/* Purple accent stripes on backrest */}
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
    {/* Wheels base */}
    <mesh position={[0, 0.04, 0.05]}>
      <cylinderGeometry args={[0.25, 0.25, 0.04, 5]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
  </group>
);

const Guitar = () => (
  <group position={[7.5, 0, -19]} rotation={[0, 0, 0.15]}>
    {/* Body */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.5, 0.8, 0.12]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    {/* Body curve (lower bout wider) */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.55, 0.4, 0.1]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    {/* Neck */}
    <mesh position={[0, 1.4, 0]}>
      <boxGeometry args={[0.12, 1.2, 0.06]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {/* Headstock */}
    <mesh position={[0, 2.05, 0]}>
      <boxGeometry args={[0.16, 0.2, 0.05]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Sound hole */}
    <mesh position={[0, 0.55, -0.07]}>
      <boxGeometry args={[0.2, 0.2, 0.01]} />
      <meshStandardMaterial color="#0A0A0A" />
    </mesh>
  </group>
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
      {/* Bright living room fill light */}
      <pointLight position={[5, 2.8, -4]} color="#FFF5E6" intensity={1.2} distance={14} decay={1.5} />
      {/* TV glow - accent only */}
      <PulsingLight position={[5, 1.5, -7.5]} color="#00D9FF" intensity={0.6} />
      <pointLight position={[5, 0.3, -6]} color="#00D9FF" intensity={0.15} distance={4} decay={2} />

      {/* Bright kitchen fill */}
      <pointLight position={[5, 2.8, -10]} color="#FFF5E6" intensity={1.0} distance={12} decay={1.5} />
      <pointLight position={[6, 0.9, -2]} color="#FFF5E6" intensity={0.3} distance={4} decay={2} />

      {/* RGB desk glow in bedroom - stays moody */}
      <PulsingLight position={[2, 1.5, -20]} color="#7B68EE" intensity={1.5} />
      <pointLight position={[4, 0.2, -22]} color="#9B59B6" intensity={0.3} distance={5} decay={2} />
      {/* Dim bedroom fill so it's not pitch black */}
      <pointLight position={[4, 2.5, -19]} color="#FFF5E6" intensity={0.3} distance={10} decay={2} />

      {/* Hallway */}
      <pointLight position={[2, 2, -13]} color="#FFF5E6" intensity={0.5} distance={5} decay={2} />

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
      <Fridge />
      <KitchenCounters />

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
        <ambientLight color="#FFF5E6" intensity={0.7} />
        <directionalLight position={[-8, 20, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[10, 15, -10]} intensity={0.3} color="#FFF5E6" />
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
