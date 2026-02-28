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
    ctx.strokeStyle = "#7A6548";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
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
  <group position={[5, 0, -9.5]}>
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
  <group position={[3.5, 0, -11.5]} rotation={[0, Math.PI / 2, 0]}>
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.9, 2, 0.8]} />
      <meshStandardMaterial color="#D0D0D0" />
    </mesh>
    <mesh position={[0.47, 1.2, 0.15]}>
      <boxGeometry args={[0.04, 0.6, 0.06]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[0.47, 0.4, 0.15]}>
      <boxGeometry args={[0.04, 0.4, 0.06]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[0.46, 0.85, 0]}>
      <boxGeometry args={[0.01, 0.02, 0.78]} />
      <meshStandardMaterial color="#B0B0B0" />
    </mesh>
  </group>
);

const KitchenCabinets = () => (
  <group position={[6, 0, -11.8]}>
    {/* Lower cabinets along back wall */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[4, 0.8, 0.6]} />
      <meshStandardMaterial color="#F0F0F0" />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 0.82, 0]}>
      <boxGeometry args={[4.1, 0.06, 0.65]} />
      <meshStandardMaterial color="#E8E8E8" />
    </mesh>
    {/* Upper cabinets */}
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[4, 0.8, 0.4]} />
      <meshStandardMaterial color="#F0F0F0" />
    </mesh>
    {/* Cabinet door lines */}
    {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
      <mesh key={i} position={[x, 0.4, 0.31]}>
        <boxGeometry args={[0.02, 0.7, 0.01]} />
        <meshStandardMaterial color="#D0D0D0" />
      </mesh>
    ))}
    {/* Cabinet handles */}
    {[-1, 0, 1].map((x, i) => (
      <mesh key={`h${i}`} position={[x, 0.45, 0.32]}>
        <boxGeometry args={[0.08, 0.03, 0.03]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
    ))}
  </group>
);

const Stove = () => (
  <group position={[8.5, 0, -11.8]}>
    {/* Oven body */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[0.9, 0.8, 0.6]} />
      <meshStandardMaterial color="#3D3D3D" />
    </mesh>
    {/* Stovetop */}
    <mesh position={[0, 0.82, 0]}>
      <boxGeometry args={[0.95, 0.06, 0.65]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Burners */}
    {[[-0.2, -0.15], [-0.2, 0.15], [0.2, -0.15], [0.2, 0.15]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.86, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 8]} />
        <meshStandardMaterial color="#2D2D3A" side={THREE.DoubleSide} />
      </mesh>
    ))}
    {/* Oven door */}
    <mesh position={[0, 0.35, 0.31]}>
      <boxGeometry args={[0.8, 0.5, 0.02]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Oven handle */}
    <mesh position={[0, 0.62, 0.33]}>
      <boxGeometry args={[0.5, 0.03, 0.03]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
  </group>
);

// === BEDROOM ===

const BedroomWindows = () => (
  <group>
    {/* Two tall parallel windows on left wall of bedroom */}
    {[-20, -22].map((z, i) => (
      <group key={i} position={[0.06, 1.5, z]}>
        {/* Window frame */}
        <mesh>
          <boxGeometry args={[0.05, 1.8, 0.9]} />
          <meshStandardMaterial color="#4A6A7A" opacity={0.3} transparent />
        </mesh>
        {/* Window frame border */}
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.02, 1.9, 1.0]} />
          <meshStandardMaterial color="#D0D0D0" />
        </mesh>
        {/* Center divider horizontal */}
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.9]} />
          <meshStandardMaterial color="#D0D0D0" />
        </mesh>
        {/* Center divider vertical */}
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.02, 1.8, 0.04]} />
          <meshStandardMaterial color="#D0D0D0" />
        </mesh>
        {/* Soft light from windows */}
        <pointLight position={[1, 0, 0]} color="#FFF8E8" intensity={0.3} distance={6} decay={2} />
      </group>
    ))}
  </group>
);

const Bed = () => (
  <group position={[2.5, 0, -21]}>
    {/* Frame - bigger */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[3.5, 0.3, 4.5]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Mattress */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[3.3, 0.15, 4.3]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Headboard */}
    <mesh position={[0, 0.7, -2.2]}>
      <boxGeometry args={[3.5, 0.8, 0.12]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Blanket - askew */}
    <mesh position={[0.15, 0.45, 0.4]} rotation={[0, 0.08, 0]}>
      <boxGeometry args={[3.0, 0.08, 2.8]} />
      <meshStandardMaterial color="#2D3A5C" />
    </mesh>
    {/* Pillows */}
    <mesh position={[-0.6, 0.5, -1.7]} rotation={[0, 0.15, 0]}>
      <boxGeometry args={[0.8, 0.16, 0.5]} />
      <meshStandardMaterial color="#D8D8D8" />
    </mesh>
    <mesh position={[0.5, 0.48, -1.6]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.8, 0.16, 0.5]} />
      <meshStandardMaterial color="#D8D8D8" />
    </mesh>
  </group>
);

const GamingDesk = () => (
  <group position={[1.5, 0, -18.5]} rotation={[0, Math.PI, 0]}>
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
  <group position={[1.5, 0, -19.8]} rotation={[0, Math.PI, 0]}>
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
  <group position={[0.4, 0, -23.5]} rotation={[0, 0.2, 0.15]}>
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

const RetroTV = () => (
  <group position={[9.5, 0, -4]}>
    {/* TV Stand / shelf unit */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.6, 0.6, 1.5]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {/* CRT TV body - chunky box with depth */}
    <mesh position={[0, 0.95, 0]}>
      <boxGeometry args={[1.2, 0.9, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Screen (front face) - slightly recessed */}
    <mesh position={[-0.55, 0.95, 0]}>
      <boxGeometry args={[0.08, 0.7, 0.9]} />
      <meshStandardMaterial color="#0A0A0F" emissive="#00D9FF" emissiveIntensity={0.3} />
    </mesh>
    {/* Screen bezel */}
    <mesh position={[-0.6, 0.95, 0]}>
      <boxGeometry args={[0.02, 0.8, 1.0]} />
      <meshStandardMaterial color="#1A1A2A" />
    </mesh>
    {/* VCR slot at bottom */}
    <mesh position={[-0.55, 0.45, 0]}>
      <boxGeometry args={[0.08, 0.06, 0.5]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* VCR slot opening */}
    <mesh position={[-0.61, 0.45, 0]}>
      <boxGeometry args={[0.01, 0.02, 0.35]} />
      <meshStandardMaterial color="#0A0A0A" />
    </mesh>
    {/* Knobs/buttons on front */}
    <mesh position={[-0.61, 0.95, 0.5]}>
      <cylinderGeometry args={[0.03, 0.03, 0.02, 6]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[-0.61, 0.85, 0.5]}>
      <cylinderGeometry args={[0.03, 0.03, 0.02, 6]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Antenna stubs */}
    <mesh position={[0.1, 1.55, -0.2]} rotation={[0, 0, 0.3]}>
      <cylinderGeometry args={[0.015, 0.01, 0.5, 4]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[0.1, 1.55, 0.2]} rotation={[0, 0, -0.3]}>
      <cylinderGeometry args={[0.015, 0.01, 0.5, 4]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Screen glow */}
    <pointLight position={[-1, 0.95, 0]} color="#00D9FF" intensity={0.6} distance={5} decay={2} />
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

const Couch = () => (
  <group position={[7.5, 0, -4]} rotation={[0, -Math.PI / 2, 0]}>
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
    {/* Throw pillow */}
    <mesh position={[-0.8, 0.65, 0.15]} rotation={[0.1, 0.3, 0.15]}>
      <boxGeometry args={[0.35, 0.25, 0.1]} />
      <meshStandardMaterial color="#E67E22" />
    </mesh>
    {/* Throw blanket draped */}
    <mesh position={[0.3, 0.58, 0.45]} rotation={[0.4, 0, 0.1]}>
      <boxGeometry args={[0.8, 0.03, 0.6]} />
      <meshStandardMaterial color="#2E86AB" />
    </mesh>
  </group>
);

const CoffeeTable = () => (
  <group position={[8.2, 0, -4]}>
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
    {/* Remote control */}
    <mesh position={[0.15, 0.46, 0.2]} rotation={[0, 0.3, 0]}>
      <boxGeometry args={[0.15, 0.02, 0.05]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Coffee mug */}
    <mesh position={[-0.2, 0.48, -0.3]}>
      <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
      <meshStandardMaterial color="#E8E0D0" />
    </mesh>
    {/* Coaster */}
    <mesh position={[-0.2, 0.44, -0.3]}>
      <cylinderGeometry args={[0.06, 0.06, 0.01, 8]} />
      <meshStandardMaterial color="#5C4A3A" />
    </mesh>
    {/* Magazine/book */}
    <mesh position={[0.1, 0.45, -0.4]} rotation={[0, -0.2, 0]}>
      <boxGeometry args={[0.2, 0.02, 0.28]} />
      <meshStandardMaterial color="#CC3333" />
    </mesh>
  </group>
);

const FrontDoor = () => (
  <group position={[2, 0, 0]}>
    {/* Door frame */}
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[1.0, 2.6, 0.15]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {/* Door panel */}
    <mesh position={[0.05, 1.25, 0.02]}>
      <boxGeometry args={[0.85, 2.4, 0.1]} />
      <meshStandardMaterial color="#5C3A1E" />
    </mesh>
    {/* Door handle */}
    <mesh position={[0.35, 1.1, 0.08]}>
      <boxGeometry args={[0.06, 0.12, 0.06]} />
      <meshStandardMaterial color="#C0A050" />
    </mesh>
    {/* Peephole */}
    <mesh position={[0.05, 1.6, 0.08]}>
      <cylinderGeometry args={[0.02, 0.02, 0.02, 6]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
  </group>
);

// Wall decorations
const WallArt = () => (
  <group>
    {/* Bedroom poster - gaming/anime style */}
    <group position={[4, 1.8, -24.9]}>
      <mesh>
        <boxGeometry args={[1.2, 1.6, 0.02]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>
      {/* Poster art - abstract shapes */}
      <mesh position={[0, 0.2, 0.02]}>
        <boxGeometry args={[0.8, 0.6, 0.01]} />
        <meshStandardMaterial color="#E94560" />
      </mesh>
      <mesh position={[-0.2, -0.3, 0.02]}>
        <boxGeometry args={[0.3, 0.4, 0.01]} />
        <meshStandardMaterial color="#533483" />
      </mesh>
      <mesh position={[0.25, -0.35, 0.02]}>
        <boxGeometry args={[0.4, 0.3, 0.01]} />
        <meshStandardMaterial color="#0F3460" />
      </mesh>
    </group>

    {/* Bedroom poster 2 - smaller */}
    <group position={[6.5, 1.6, -24.9]}>
      <mesh>
        <boxGeometry args={[0.8, 1.0, 0.02]} />
        <meshStandardMaterial color="#2D2D3A" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.6, 0.8, 0.01]} />
        <meshStandardMaterial color="#7B68EE" emissive="#7B68EE" emissiveIntensity={0.1} />
      </mesh>
    </group>

    {/* Living room - framed photo */}
    <group position={[0.06, 1.8, -4]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.05, 0.8, 1.0]} />
        <meshStandardMaterial color="#5C4A3A" />
      </mesh>
      {/* Photo */}
      <mesh position={[0.03, 0, 0]}>
        <boxGeometry args={[0.01, 0.65, 0.85]} />
        <meshStandardMaterial color="#E8DCC8" />
      </mesh>
    </group>

    {/* Living room - small shelf with plants */}
    <group position={[0.08, 1.2, -8]}>
      <mesh>
        <boxGeometry args={[0.15, 0.04, 0.5]} />
        <meshStandardMaterial color="#5C4A3A" />
      </mesh>
      {/* Small potted plant */}
      <mesh position={[0, 0.08, 0.1]}>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 6]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>
      <mesh position={[0, 0.18, 0.1]}>
        <sphereGeometry args={[0.08, 6, 4]} />
        <meshStandardMaterial color="#4A7C59" />
      </mesh>
      {/* Small succulent */}
      <mesh position={[0, 0.06, -0.12]}>
        <cylinderGeometry args={[0.04, 0.035, 0.06, 6]} />
        <meshStandardMaterial color="#C4A484" />
      </mesh>
      <mesh position={[0, 0.12, -0.12]}>
        <coneGeometry args={[0.05, 0.08, 5]} />
        <meshStandardMaterial color="#7CB342" />
      </mesh>
    </group>

    {/* Kitchen - magnetic board/notes area */}
    <group position={[9.94, 1.5, -9]}>
      <mesh>
        <boxGeometry args={[0.02, 0.6, 0.8]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Sticky notes */}
      <mesh position={[0.02, 0.15, -0.2]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.01, 0.12, 0.12]} />
        <meshStandardMaterial color="#FFEB3B" />
      </mesh>
      <mesh position={[0.02, 0.1, 0.15]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.01, 0.1, 0.1]} />
        <meshStandardMaterial color="#FF80AB" />
      </mesh>
      <mesh position={[0.02, -0.1, 0]} rotation={[0, 0, 0.02]}>
        <boxGeometry args={[0.01, 0.15, 0.12]} />
        <meshStandardMaterial color="#80DEEA" />
      </mesh>
    </group>
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
      <WoodFloor position={[5, 0.01, -6]} size={[10, 12]} />
      <WoodFloor position={[2, 0.01, -14.5]} size={[2, 5]} />
      <WoodFloor position={[4, 0.01, -21]} size={[8, 8]} />

      {/* === ROOM LIGHTING === */}
      <pointLight position={[5, 2.8, -3]} color="#FFF5E6" intensity={1.5} distance={16} decay={1.5} />
      <pointLight position={[5, 2.8, -9]} color="#FFF5E6" intensity={1.2} distance={14} decay={1.5} />
      <PulsingLight position={[9, 1.5, -4]} color="#00D9FF" intensity={0.4} />
      <PulsingLight position={[2.5, 1.5, -18]} color="#7B68EE" intensity={1.5} />
      <pointLight position={[4, 2.5, -21]} color="#FFF5E6" intensity={0.25} distance={10} decay={2} />
      <pointLight position={[2, 2, -14.5]} color="#FFF5E6" intensity={0.6} distance={6} decay={2} />

      {/* === OUTER WALLS - OPEN LIVING/KITCHEN === */}
      <Wall position={[5, hy, 0]} size={[10, h, t]} />
      <Wall position={[0, hy, -6]} size={[t, h, 12]} />
      <Wall position={[10, hy, -6]} size={[t, h, 12]} />
      <Wall position={[5, hy, -12]} size={[10, h, t]} />

      {/* === HALLWAY WALLS === */}
      <Wall position={[1, hy, -14.5]} size={[t, h, 5]} />
      <Wall position={[3, hy, -14.5]} size={[t, h, 5]} />

      {/* === BEDROOM WALLS === */}
      <Wall position={[4, hy, -25]} size={[8, h, t]} />
      <Wall position={[0, hy, -21]} size={[t, h, 8]} />
      <Wall position={[8, hy, -21]} size={[t, h, 8]} />
      <Wall position={[0.5, hy, -17]} size={[1, h, t]} />
      <Wall position={[5.5, hy, -17]} size={[5, h, t]} />

      {/* === FRONT DOOR at end of hallway === */}
      <FrontDoor />

      {/* === BEDROOM === */}
      <BedroomWindows />
      <Bed />
      <GamingDesk />
      <GamingChair />
      <Guitar />

      {/* === KITCHEN === */}
      <KitchenIsland />
      <Fridge />
      <KitchenCabinets />
      <Stove />

      {/* === LIVING ROOM === */}
      <RetroTV />
      <VHSShelf />
      <Couch />
      <CoffeeTable />

      {/* === WALL DECORATIONS === */}
      <WallArt />

      {/* === RUG under coffee table === */}
      <mesh position={[7.8, 0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial color="#4A3728" side={2} />
      </mesh>
      {/* Rug border */}
      <mesh position={[7.8, 0.025, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.4, 4]} />
        <meshStandardMaterial color="#6B4423" side={2} />
      </mesh>
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
