import { Canvas } from "@react-three/fiber";
import { Html, Loader } from "@react-three/drei";
import { Suspense, useState } from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InteractiveRubiksCube, InteractiveGuitar, InteractiveVHSTape } from "./InteractiveElements";
import { VMDesktop } from "./VMDesktop";
import { ApartmentProvider, useApartment, projectData } from "../context/ApartmentContext";
import { DustParticles, LightBeamParticles } from "./Particles";
import { InvincibleBook, LetterboxdNotebook } from "./CoffeeTableItems";
import { InteractiveLegend } from "./HelpOverlay";
import { CameraController, CameraNavigation, CameraPreset } from "./CameraController";
import { RoomClickZones } from "./RoomClickZones";

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
    {/* Bar stools */}
    <group position={[-0.8, 0, 0.8]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
    </group>
    <group position={[0.8, 0, 0.8]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#3D3D3D" />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
    </group>
    {/* Fruit bowl on island */}
    <mesh position={[0.5, 0.52, 0]}>
      <sphereGeometry args={[0.15, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#E8E0D0" side={2} />
    </mesh>
    {/* Fruits */}
    <mesh position={[0.45, 0.55, 0.03]}>
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshStandardMaterial color="#FF6B35" />
    </mesh>
    <mesh position={[0.55, 0.54, -0.02]}>
      <sphereGeometry args={[0.045, 6, 6]} />
      <meshStandardMaterial color="#F4D03F" />
    </mesh>
    <mesh position={[0.5, 0.56, 0.06]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#27AE60" />
    </mesh>
  </group>
);

const Fridge = () => (
  // Dark/black fridge like in Sims reference
  <group position={[3.5, 0, -11.5]} rotation={[0, Math.PI / 2, 0]}>
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.9, 2, 0.8]} />
      <meshStandardMaterial color="#2D2D2D" />
    </mesh>
    {/* Handles */}
    <mesh position={[0.47, 1.2, 0.15]}>
      <boxGeometry args={[0.04, 0.5, 0.04]} />
      <meshStandardMaterial color="#808080" />
    </mesh>
    <mesh position={[0.47, 0.4, 0.15]}>
      <boxGeometry args={[0.04, 0.35, 0.04]} />
      <meshStandardMaterial color="#808080" />
    </mesh>
    {/* Door seam */}
    <mesh position={[0.46, 0.85, 0]}>
      <boxGeometry args={[0.01, 0.02, 0.78]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Ice dispenser */}
    <mesh position={[0.46, 1.3, 0]}>
      <boxGeometry args={[0.02, 0.25, 0.2]} />
      <meshStandardMaterial color="#404040" />
    </mesh>
    
    {/* === POLAROID PHOTOS / IG MAGNETS (per BRIEF) === */}
    {/* Polaroid 1 - tilted */}
    <group position={[0.47, 1.6, 0.2]} rotation={[0, 0, 0.1]}>
      <mesh>
        <boxGeometry args={[0.01, 0.12, 0.1]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Photo area */}
      <mesh position={[0.006, 0.01, 0]}>
        <boxGeometry args={[0.002, 0.08, 0.08]} />
        <meshStandardMaterial color="#5DADE2" />
      </mesh>
    </group>
    {/* Polaroid 2 */}
    <group position={[0.47, 1.55, -0.1]} rotation={[0, 0, -0.08]}>
      <mesh>
        <boxGeometry args={[0.01, 0.12, 0.1]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0.006, 0.01, 0]}>
        <boxGeometry args={[0.002, 0.08, 0.08]} />
        <meshStandardMaterial color="#E74C3C" />
      </mesh>
    </group>
    {/* Polaroid 3 */}
    <group position={[0.47, 1.35, 0.25]} rotation={[0, 0, 0.15]}>
      <mesh>
        <boxGeometry args={[0.01, 0.12, 0.1]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0.006, 0.01, 0]}>
        <boxGeometry args={[0.002, 0.08, 0.08]} />
        <meshStandardMaterial color="#27AE60" />
      </mesh>
    </group>
    {/* Polaroid 4 - overlapping */}
    <group position={[0.47, 1.45, 0.05]} rotation={[0, 0, -0.05]}>
      <mesh>
        <boxGeometry args={[0.01, 0.12, 0.1]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      <mesh position={[0.006, 0.01, 0]}>
        <boxGeometry args={[0.002, 0.08, 0.08]} />
        <meshStandardMaterial color="#F39C12" />
      </mesh>
    </group>
    
    {/* Fridge magnets */}
    <mesh position={[0.48, 1.7, 0.3]}>
      <cylinderGeometry args={[0.025, 0.025, 0.01, 8]} />
      <meshStandardMaterial color="#E91E63" />
    </mesh>
    <mesh position={[0.48, 1.3, -0.2]}>
      <cylinderGeometry args={[0.025, 0.025, 0.01, 8]} />
      <meshStandardMaterial color="#4CAF50" />
    </mesh>
    <mesh position={[0.48, 1.5, -0.25]}>
      <boxGeometry args={[0.01, 0.05, 0.04]} />
      <meshStandardMaterial color="#2196F3" />
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
    
    {/* Kitchen sink */}
    <mesh position={[0, 0.87, 0.15]}>
      <boxGeometry args={[0.6, 0.08, 0.4]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    {/* Faucet */}
    <mesh position={[0, 1.0, -0.05]}>
      <boxGeometry args={[0.04, 0.2, 0.04]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    <mesh position={[0, 1.08, 0.08]}>
      <boxGeometry args={[0.03, 0.03, 0.15]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    
    {/* Coffee maker */}
    <mesh position={[-1.5, 0.95, 0.1]}>
      <boxGeometry args={[0.2, 0.25, 0.2]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[-1.5, 1.12, 0.15]}>
      <boxGeometry args={[0.15, 0.08, 0.1]} />
      <meshStandardMaterial color="#2D2D2D" />
    </mesh>
    
    {/* Toaster */}
    <mesh position={[1.5, 0.92, 0.1]}>
      <boxGeometry args={[0.18, 0.15, 0.12]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
    
    {/* Knife block */}
    <mesh position={[-0.8, 0.95, 0.15]}>
      <boxGeometry args={[0.1, 0.2, 0.08]} />
      <meshStandardMaterial color="#5C4A3A" />
    </mesh>
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
    {/* Two windows on RIGHT wall of bedroom (matching Sims reference) */}
    {[-20, -22.5].map((z, i) => (
      <group key={i} position={[7.94, 1.5, z]}>
        {/* Window frame - glass */}
        <mesh>
          <boxGeometry args={[0.05, 1.4, 0.9]} />
          <meshStandardMaterial color="#87CEEB" opacity={0.4} transparent />
        </mesh>
        {/* Window frame border */}
        <mesh position={[-0.03, 0, 0]}>
          <boxGeometry args={[0.02, 1.5, 1.0]} />
          <meshStandardMaterial color="#D0D0D0" />
        </mesh>
        {/* Center divider horizontal */}
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.9]} />
          <meshStandardMaterial color="#D0D0D0" />
        </mesh>
        {/* Center divider vertical */}
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.02, 1.4, 0.04]} />
          <meshStandardMaterial color="#D0D0D0" />
        </mesh>
        
        {/* === CURTAINS === */}
        {/* Curtain rod */}
        <mesh position={[-0.15, 0.85, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
        {/* Left curtain - slightly open */}
        <mesh position={[-0.12, 0.1, -0.45]}>
          <boxGeometry args={[0.04, 1.4, 0.35]} />
          <meshStandardMaterial color="#2D2D3A" />
        </mesh>
        {/* Curtain folds (left) */}
        <mesh position={[-0.1, 0.1, -0.38]}>
          <boxGeometry args={[0.02, 1.35, 0.08]} />
          <meshStandardMaterial color="#3D3D4A" />
        </mesh>
        {/* Right curtain - slightly open */}
        <mesh position={[-0.12, 0.1, 0.45]}>
          <boxGeometry args={[0.04, 1.4, 0.35]} />
          <meshStandardMaterial color="#2D2D3A" />
        </mesh>
        {/* Curtain folds (right) */}
        <mesh position={[-0.1, 0.1, 0.38]}>
          <boxGeometry args={[0.02, 1.35, 0.08]} />
          <meshStandardMaterial color="#3D3D4A" />
        </mesh>
        
        {/* Soft light from windows */}
        <pointLight position={[-1, 0, 0]} color="#FFF8E8" intensity={0.4} distance={6} decay={2} />
      </group>
    ))}
  </group>
);

const Bed = () => (
  // Bed against RIGHT wall, headboard facing left (matching Sims reference)
  <group position={[5.5, 0, -21]} rotation={[0, -Math.PI / 2, 0]}>
    {/* Frame */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[2.2, 0.3, 3.5]} />
      <meshStandardMaterial color="#8B7355" />
    </mesh>
    {/* Mattress */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[2.0, 0.15, 3.3]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Headboard - wooden */}
    <mesh position={[0, 0.7, -1.7]}>
      <boxGeometry args={[2.2, 0.8, 0.1]} />
      <meshStandardMaterial color="#5C4A3A" />
    </mesh>
    {/* Blanket - Van Gogh Starry Night inspired swirl pattern (simplified) */}
    <mesh position={[0.1, 0.45, 0.3]} rotation={[0, 0.05, 0]}>
      <boxGeometry args={[1.8, 0.08, 2.2]} />
      <meshStandardMaterial color="#1E3A5F" />
    </mesh>
    {/* Blanket swirl accents */}
    <mesh position={[-0.3, 0.47, 0.2]} rotation={[0, 0.3, 0]}>
      <boxGeometry args={[0.4, 0.02, 0.6]} />
      <meshStandardMaterial color="#F4D03F" />
    </mesh>
    <mesh position={[0.4, 0.47, 0.5]} rotation={[0, -0.2, 0]}>
      <boxGeometry args={[0.3, 0.02, 0.5]} />
      <meshStandardMaterial color="#5DADE2" />
    </mesh>
    <mesh position={[0, 0.47, -0.2]} rotation={[0, 0.1, 0]}>
      <boxGeometry args={[0.5, 0.02, 0.4]} />
      <meshStandardMaterial color="#F4D03F" />
    </mesh>
    {/* Pillows */}
    <mesh position={[-0.4, 0.5, -1.3]} rotation={[0, 0.1, 0]}>
      <boxGeometry args={[0.5, 0.14, 0.4]} />
      <meshStandardMaterial color="#F5E6D3" />
    </mesh>
    <mesh position={[0.4, 0.48, -1.25]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.5, 0.14, 0.4]} />
      <meshStandardMaterial color="#F5E6D3" />
    </mesh>
  </group>
);

const Nightstand = () => (
  // Nightstand on LEFT side of bed now (bed moved to right wall)
  <group position={[3.2, 0, -21]}>
    {/* Main body */}
    <mesh position={[0, 0.25, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.4]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {/* Drawer */}
    <mesh position={[0, 0.25, 0.21]}>
      <boxGeometry args={[0.42, 0.18, 0.02]} />
      <meshStandardMaterial color="#4D3E2E" />
    </mesh>
    {/* Drawer handle */}
    <mesh position={[0, 0.25, 0.23]}>
      <boxGeometry args={[0.1, 0.02, 0.02]} />
      <meshStandardMaterial color="#C0A050" />
    </mesh>
    {/* Lamp base */}
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.06, 0.08, 0.08, 8]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Lamp stem */}
    <mesh position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
      <meshStandardMaterial color="#C0A050" />
    </mesh>
    {/* Lamp shade */}
    <mesh position={[0, 0.9, 0]}>
      <cylinderGeometry args={[0.1, 0.06, 0.2, 8, 1, true]} />
      <meshStandardMaterial color="#F5E6D3" side={2} />
    </mesh>
    {/* Lamp glow */}
    <pointLight position={[0, 0.85, 0]} color="#FFF5E6" intensity={0.3} distance={2} decay={2} />
    {/* Phone on nightstand - charging */}
    <mesh position={[-0.12, 0.52, 0.1]} rotation={[0, 0.2, 0]}>
      <boxGeometry args={[0.08, 0.01, 0.15]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Charging cable */}
    <mesh position={[-0.12, 0.51, 0.02]}>
      <boxGeometry args={[0.01, 0.01, 0.1]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    {/* Cable going to wall */}
    <mesh position={[-0.3, 0.3, -0.1]} rotation={[0.3, 0, -0.2]}>
      <boxGeometry args={[0.01, 0.5, 0.01]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    {/* Wall outlet */}
    <mesh position={[-0.48, 0.3, 0]}>
      <boxGeometry args={[0.02, 0.08, 0.05]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Alarm clock */}
    <mesh position={[0.12, 0.54, -0.08]}>
      <boxGeometry args={[0.1, 0.08, 0.05]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    <mesh position={[0.12, 0.54, -0.055]}>
      <boxGeometry args={[0.08, 0.05, 0.01]} />
      <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

const GamingDesk = () => (
  // Gaming desk in back-left corner of bedroom, facing left wall
  // Chair faces into the room (toward windows/door)
  <group position={[1.5, 0, -23.5]} rotation={[0, Math.PI / 2, 0]}>
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

    {/* Center monitor (larger) - with VM Desktop */}
    <mesh position={[0, 1.25, -0.4]}>
      <boxGeometry args={[0.9, 0.55, 0.04]} />
      <meshStandardMaterial color="#0A0A0F" />
    </mesh>
    {/* VM Desktop rendered on center monitor */}
    <VMDesktop position={[0, 1.25, -0.38]} />
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

    {/* === KEYBOARD & MOUSE === */}
    {/* Large mousepad/desk mat */}
    <mesh position={[0, 0.795, 0.1]}>
      <boxGeometry args={[1.8, 0.01, 0.6]} />
      <meshStandardMaterial color="#1A1A2E" />
    </mesh>
    {/* RGB edge on mousepad */}
    <mesh position={[0, 0.796, 0.38]}>
      <boxGeometry args={[1.75, 0.005, 0.02]} />
      <meshStandardMaterial color="#7B68EE" emissive="#7B68EE" emissiveIntensity={0.3} />
    </mesh>
    
    {/* Mechanical keyboard */}
    <mesh position={[0, 0.82, 0.15]}>
      <boxGeometry args={[0.45, 0.03, 0.15]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Keycaps (simplified) */}
    <mesh position={[0, 0.835, 0.15]}>
      <boxGeometry args={[0.42, 0.01, 0.12]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* RGB underglow on keyboard */}
    <pointLight position={[0, 0.81, 0.15]} color="#7B68EE" intensity={0.2} distance={0.5} decay={2} />
    
    {/* Gaming mouse */}
    <mesh position={[0.35, 0.815, 0.2]}>
      <boxGeometry args={[0.06, 0.025, 0.1]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Mouse RGB */}
    <mesh position={[0.35, 0.83, 0.18]}>
      <boxGeometry args={[0.02, 0.005, 0.04]} />
      <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={0.4} />
    </mesh>

    {/* === INTERACTIVE RUBIK'S CUBE (click to solve!) === */}
    <InteractiveRubiksCube position={[0.5, 0.85, 0.1]} />
    
    {/* === McDONALD'S TOYS (per BRIEF - new + vintage) === */}
    {/* Happy Meal toy 1 - character figure */}
    <mesh position={[-0.6, 0.85, 0.15]}>
      <boxGeometry args={[0.06, 0.12, 0.05]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    <mesh position={[-0.6, 0.94, 0.15]}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshStandardMaterial color="#FFEB3B" />
    </mesh>
    {/* Happy Meal toy 2 - vehicle */}
    <mesh position={[-0.45, 0.83, 0.2]}>
      <boxGeometry args={[0.1, 0.05, 0.06]} />
      <meshStandardMaterial color="#E53935" />
    </mesh>
    <mesh position={[-0.43, 0.81, 0.18]}>
      <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[-0.47, 0.81, 0.22]}>
      <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Vintage Happy Meal box (tiny) */}
    <mesh position={[-0.75, 0.82, 0.25]}>
      <boxGeometry args={[0.06, 0.08, 0.05]} />
      <meshStandardMaterial color="#E53935" />
    </mesh>
    <mesh position={[-0.75, 0.87, 0.25]}>
      <boxGeometry args={[0.05, 0.02, 0.04]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
    
    {/* === PEZ DISPENSERS (per BRIEF) === */}
    {/* Pez 1 */}
    <mesh position={[-0.3, 0.85, 0.12]}>
      <boxGeometry args={[0.03, 0.12, 0.025]} />
      <meshStandardMaterial color="#2196F3" />
    </mesh>
    <mesh position={[-0.3, 0.94, 0.12]}>
      <boxGeometry args={[0.04, 0.05, 0.04]} />
      <meshStandardMaterial color="#E91E63" />
    </mesh>
    {/* Pez 2 */}
    <mesh position={[-0.25, 0.85, 0.18]}>
      <boxGeometry args={[0.03, 0.12, 0.025]} />
      <meshStandardMaterial color="#FF9800" />
    </mesh>
    <mesh position={[-0.25, 0.94, 0.18]}>
      <boxGeometry args={[0.04, 0.05, 0.04]} />
      <meshStandardMaterial color="#4CAF50" />
    </mesh>
    {/* Pez 3 */}
    <mesh position={[-0.35, 0.85, 0.2]}>
      <boxGeometry args={[0.03, 0.12, 0.025]} />
      <meshStandardMaterial color="#9C27B0" />
    </mesh>
    <mesh position={[-0.35, 0.94, 0.2]}>
      <boxGeometry args={[0.04, 0.05, 0.04]} />
      <meshStandardMaterial color="#FFD700" />
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
    <mesh position={[0.85, 0.83, 0.28]}>
      <cylinderGeometry args={[0.03, 0.03, 0.12, 6]} />
      <meshStandardMaterial color="#00BCD4" />
    </mesh>
    
    {/* Stray cable/headphone cord */}
    <mesh position={[0.7, 0.8, 0.3]} rotation={[0.2, 0.5, 0.1]}>
      <boxGeometry args={[0.01, 0.25, 0.01]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
  </group>
);

const GamingChair = () => (
  // Chair positioned in front of desk, facing the desk (toward left wall)
  <group position={[2.8, 0, -23.5]} rotation={[0, -Math.PI / 2, 0]}>
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

// === BATHROOM (in hallway area) ===

const Bathroom = () => (
  <group position={[5, 0, -14.25]}>
    {/* Bathroom floor - tile effect */}
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2, 3]} />
      <meshStandardMaterial color="#E8E8E8" />
    </mesh>
    
    {/* Toilet */}
    <group position={[0.3, 0, -0.8]}>
      {/* Bowl */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.35, 0.5]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.45, -0.2]}>
        <boxGeometry args={[0.35, 0.4, 0.2]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.38, 0.05]}>
        <boxGeometry args={[0.38, 0.03, 0.35]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
    </group>

    {/* Sink */}
    <group position={[0.3, 0, 0.5]}>
      {/* Pedestal */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.45, 0.08, 0.35]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, 0.82, -0.1]}>
        <boxGeometry args={[0.06, 0.12, 0.06]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      {/* === BATHROOM MIRROR (potential About section per BRIEF) === */}
      {/* Mirror frame */}
      <mesh position={[-0.5, 1.3, 0]}>
        <boxGeometry args={[0.04, 0.7, 0.6]} />
        <meshStandardMaterial color="#3D2E2E" />
      </mesh>
      {/* Mirror surface - reflective blue tint */}
      <mesh position={[-0.48, 1.3, 0]}>
        <boxGeometry args={[0.01, 0.6, 0.5]} />
        <meshStandardMaterial color="#B8D4E3" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Subtle reflection glow */}
      <pointLight position={[-0.3, 1.3, 0]} color="#B8D4E3" intensity={0.1} distance={1} decay={2} />
      {/* Post-it note on mirror corner */}
      <mesh position={[-0.47, 1.5, 0.2]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.01, 0.08, 0.08]} />
        <meshStandardMaterial color="#FFEB3B" />
      </mesh>
    </group>

    {/* Washer/Dryer stack */}
    <group position={[-0.6, 0, 0]}>
      {/* Washer (bottom) */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.65, 0.55]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
      {/* Washer door */}
      <mesh position={[0.31, 0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 12]} />
        <meshStandardMaterial color="#B0B0B0" />
      </mesh>
      {/* Dryer (top) */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.55]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
      {/* Dryer door */}
      <mesh position={[0.31, 1.0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 12]} />
        <meshStandardMaterial color="#B0B0B0" />
      </mesh>
    </group>

    {/* Bathroom light */}
    <pointLight position={[0, 2.2, 0]} color="#FFFFFF" intensity={0.5} distance={4} decay={2} />
    
    {/* Laundry basket */}
    <group position={[-0.3, 0, 1]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.18, 0.4, 8]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>
      {/* Clothes sticking out */}
      <mesh position={[0.05, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.2]} />
        <meshStandardMaterial color="#5DADE2" />
      </mesh>
      <mesh position={[-0.08, 0.38, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.15]} />
        <meshStandardMaterial color="#E74C3C" />
      </mesh>
    </group>
    
    {/* Towel on hook */}
    <mesh position={[0.8, 1.2, 1.4]}>
      <boxGeometry args={[0.4, 0.6, 0.03]} />
      <meshStandardMaterial color="#F5E6D3" />
    </mesh>
  </group>
);

// Speaker/stereo near bed (from Sims reference)
const BedroomStereo = () => (
  <group position={[3.5, 0, -23]}>
    {/* Speaker cabinet */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[0.4, 0.8, 0.35]} />
      <meshStandardMaterial color="#2D2D2D" />
    </mesh>
    {/* Speaker cone */}
    <mesh position={[-0.21, 0.5, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={[-0.21, 0.25, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* LED indicator */}
    <mesh position={[-0.21, 0.7, 0]}>
      <boxGeometry args={[0.01, 0.02, 0.06]} />
      <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

// Round wall clock in bedroom (from Sims reference)
const BedroomClock = () => (
  <group position={[7.94, 2, -19.5]}>
    {/* Clock face */}
    <mesh rotation={[0, -Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.25, 0.25, 0.03, 16]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Clock face inner */}
    <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Hour hand */}
    <mesh position={[-0.025, 0.05, 0]} rotation={[0, 0, 0.3]}>
      <boxGeometry args={[0.02, 0.1, 0.01]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Minute hand */}
    <mesh position={[-0.025, 0, 0.06]} rotation={[Math.PI / 4, 0, 0]}>
      <boxGeometry args={[0.015, 0.14, 0.01]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
  </group>
);

// Guitar component moved to InteractiveElements.tsx as InteractiveGuitar

// === LIVING ROOM ===

// Animated TV Screen with static effect + project content
const TVScreen = () => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [flickerIntensity, setFlickerIntensity] = useState(0.3);
  const { selectedTape } = useApartment();
  const project = selectedTape ? projectData[selectedTape] : null;
  
  useFrame(({ clock }) => {
    if (!project) {
      // Create static/flicker effect only when idle
      const time = clock.getElapsedTime();
      const flicker = 0.25 + Math.sin(time * 30) * 0.05 + Math.random() * 0.1;
      setFlickerIntensity(flicker);
      
      if (materialRef.current) {
        const hue = 185 + Math.sin(time * 2) * 5;
        materialRef.current.emissive.setHSL(hue / 360, 0.8, 0.3);
      }
    } else {
      // Stable glow when showing content
      setFlickerIntensity(0.4);
      if (materialRef.current) {
        materialRef.current.emissive.set(project.color);
      }
    }
  });
  
  return (
    <>
      <mesh position={[-0.55, 0.95, 0]}>
        <boxGeometry args={[0.08, 0.7, 0.9]} />
        <meshStandardMaterial 
          ref={materialRef}
          color="#0A0A0F" 
          emissive={project ? project.color : "#00D9FF"} 
          emissiveIntensity={flickerIntensity} 
        />
      </mesh>
      {/* Scanlines overlay */}
      <mesh position={[-0.54, 0.95, 0]}>
        <boxGeometry args={[0.01, 0.68, 0.88]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      {/* Project content overlay when tape selected */}
      {project && (
        <Html
          position={[-0.52, 0.95, 0]}
          transform
          style={{
            width: 140,
            height: 100,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.85)",
              color: project.color,
              padding: "8px",
              fontFamily: "'VT323', 'Courier New', monospace",
              fontSize: "9px",
              lineHeight: 1.3,
              overflow: "hidden",
              border: `1px solid ${project.color}`,
              textShadow: `0 0 5px ${project.color}`,
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "6px" }}>
              ▶ {project.title}
            </div>
            <div style={{ color: "#CCC", fontSize: "8px" }}>
              {project.description}
            </div>
          </div>
        </Html>
      )}
    </>
  );
};

const RetroTV = () => {
  const { selectedTape, setSelectedTape } = useApartment();
  const tapeData = selectedTape ? projectData[selectedTape] : null;
  
  return (
  <group position={[9.5, 0, -4]} onClick={() => setSelectedTape(null)}>
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
    {/* Animated TV Screen */}
    <TVScreen isPlaying={!!selectedTape} />
    {/* Screen bezel */}
    <mesh position={[-0.6, 0.95, 0]}>
      <boxGeometry args={[0.02, 0.8, 1.0]} />
      <meshStandardMaterial color="#1A1A2A" />
    </mesh>
    
    {/* Project info overlay when tape is playing */}
    {tapeData && (
      <Html position={[-1.5, 0.95, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(0,0,0,0.9)',
          color: tapeData.color,
          padding: '12px 16px',
          borderRadius: '8px',
          border: `2px solid ${tapeData.color}`,
          maxWidth: '200px',
          fontFamily: "'VT323', monospace",
          textShadow: `0 0 5px ${tapeData.color}`,
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
            {tapeData.title}
          </div>
          <div style={{ fontSize: '10px', color: '#ccc', lineHeight: '1.3' }}>
            {tapeData.description}
          </div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '8px' }}>
            Click TV to stop
          </div>
        </div>
      </Html>
    )}
    
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
    {/* Screen glow - pulsing, color changes with tape */}
    <pointLight 
      position={[-1, 0.95, 0]} 
      color={tapeData?.color || "#00D9FF"} 
      intensity={selectedTape ? 1.0 : 0.6} 
      distance={5} 
      decay={2} 
    />
  </group>
  );
};

const VHSShelf = () => {
  // 14 VHS tapes with brand colors (per BRIEF portfolio)
  const vhsTapes = [
    { color: "#FFD700", label: "#1A1A1A", name: "MoziWash" },
    { color: "#2196F3", label: "#FFFFFF", name: "Audien" },
    { color: "#FF5722", label: "#FFFFFF", name: "Boldebottle" },
    { color: "#FFEB3B", label: "#1A1A1A", name: "Sunflower1" },
    { color: "#FFC107", label: "#1A1A1A", name: "Sunflower2" },
    { color: "#4CAF50", label: "#FFFFFF", name: "Dirtea" },
    { color: "#3F51B5", label: "#FFFFFF", name: "DSC" },
    { color: "#9C27B0", label: "#FFFFFF", name: "GetMTE" },
    { color: "#1A1A1A", label: "#FFD700", name: "JB" },
    { color: "#E91E63", label: "#FFFFFF", name: "Kalshi" },
    { color: "#FF9800", label: "#8B4513", name: "Moes" },
    { color: "#795548", label: "#FFFFFF", name: "MudWTR" },
    { color: "#0D47A1", label: "#E53935", name: "Political" },
    { color: "#607D8B", label: "#FFFFFF", name: "Extra" },
  ];
  
  const { selectedTape, setSelectedTape } = useApartment();

  return (
    <group position={[9.6, 0.75, -6.5]}>
      {/* Shelf frame */}
      <mesh position={[0, 0, -0.55]}>
        <boxGeometry args={[0.3, 1.5, 0.05]} />
        <meshStandardMaterial color="#3D2E2E" />
      </mesh>
      <mesh position={[0, 0, 0.55]}>
        <boxGeometry args={[0.3, 1.5, 0.05]} />
        <meshStandardMaterial color="#3D2E2E" />
      </mesh>
      {/* Shelf levels */}
      {[-0.5, 0, 0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.3, 0.05, 1.1]} />
          <meshStandardMaterial color="#3D2E2E" />
        </mesh>
      ))}
      
      {/* Interactive VHS tapes - row 1 (top shelf) */}
      {vhsTapes.slice(0, 7).map((tape, i) => (
        <InteractiveVHSTape
          key={`top-${i}`}
          position={[0, 0.25, -0.4 + i * 0.14]}
          color={tape.color}
          labelColor={tape.label}
          projectName={tape.name}
          onSelect={() => setSelectedTape(tape.name)}
        />
      ))}
      
      {/* Interactive VHS tapes - row 2 (middle shelf) */}
      {vhsTapes.slice(7, 14).map((tape, i) => (
        <InteractiveVHSTape
          key={`mid-${i}`}
          position={[0, -0.25, -0.4 + i * 0.14]}
          color={tape.color}
          labelColor={tape.label}
          projectName={tape.name}
          onSelect={() => setSelectedTape(tape.name)}
        />
      ))}
      
      {/* Game console on bottom shelf */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[0.25, 0.08, 0.35]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Controller */}
      <mesh position={[0.02, -0.58, 0.25]}>
        <boxGeometry args={[0.12, 0.03, 0.08]} />
        <meshStandardMaterial color="#2D2D2D" />
      </mesh>
      {/* Controller cable */}
      <mesh position={[-0.05, -0.6, 0.1]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.01, 0.01, 0.2]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    </group>
  );
};

const Couch = () => (
  // Couch on LEFT side of living room, facing TV on right (per reference diagram)
  <group position={[1.5, 0, -4]} rotation={[0, Math.PI / 2, 0]}>
    {/* Main seat */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[2.5, 0.4, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Backrest - against left wall */}
    <mesh position={[0, 0.7, -0.5]}>
      <boxGeometry args={[2.5, 0.5, 0.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Armrests */}
    <mesh position={[-1.15, 0.55, 0]}>
      <boxGeometry args={[0.2, 0.7, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    <mesh position={[1.15, 0.55, 0]}>
      <boxGeometry args={[0.2, 0.7, 1.2]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Hoodie draped over armrest */}
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
    {/* Throw pillow - orange */}
    <mesh position={[-0.8, 0.65, 0.15]} rotation={[0.1, 0.3, 0.15]}>
      <boxGeometry args={[0.35, 0.25, 0.1]} />
      <meshStandardMaterial color="#E67E22" />
    </mesh>
    {/* Throw pillow - teal */}
    <mesh position={[0.6, 0.68, 0.2]} rotation={[0.05, -0.2, 0.1]}>
      <boxGeometry args={[0.3, 0.22, 0.1]} />
      <meshStandardMaterial color="#1ABC9C" />
    </mesh>
    {/* Throw blanket draped */}
    <mesh position={[0.3, 0.58, 0.45]} rotation={[0.4, 0, 0.1]}>
      <boxGeometry args={[0.8, 0.03, 0.6]} />
      <meshStandardMaterial color="#2E86AB" />
    </mesh>
  </group>
);

const CoffeeTable = () => (
  // Coffee table in CENTER of living room (between couch and TV)
  <group position={[5, 0, -4]}>
    {/* Table top */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[1.2, 0.08, 1.8]} />
      <meshStandardMaterial color="#3D2E2E" />
    </mesh>
    {/* Table legs */}
    {[[-0.5, -0.75], [-0.5, 0.75], [0.5, -0.75], [0.5, 0.75]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.2, z]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color="#2D2020" />
      </mesh>
    ))}
    {/* Remote control */}
    <mesh position={[0.35, 0.46, 0.3]} rotation={[0, 0.3, 0]}>
      <boxGeometry args={[0.15, 0.02, 0.05]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Coffee mug */}
    <mesh position={[-0.3, 0.48, -0.5]}>
      <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
      <meshStandardMaterial color="#E8E0D0" />
    </mesh>
    {/* Coaster */}
    <mesh position={[-0.3, 0.44, -0.5]}>
      <cylinderGeometry args={[0.06, 0.06, 0.01, 8]} />
      <meshStandardMaterial color="#5C4A3A" />
    </mesh>
    
    {/* INTERACTIVE Invincible coffee table book */}
    <InvincibleBook position={[-0.1, 0.45, 0.2]} />
    
    {/* INTERACTIVE Letterboxd notebook - shows recent watches! */}
    <LetterboxdNotebook position={[0.25, 0.45, -0.2]} />
    
    {/* Another book stacked */}
    <mesh position={[-0.15, 0.48, 0.15]} rotation={[0, 0.4, 0]}>
      <boxGeometry args={[0.22, 0.025, 0.3]} />
      <meshStandardMaterial color="#2D3436" />
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
    {/* Doormat */}
    <mesh position={[0, 0.01, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.8, 0.5]} />
      <meshStandardMaterial color="#5D4E37" side={2} />
    </mesh>
    {/* Shoes by the door */}
    <group position={[0.6, 0, 0.4]}>
      {/* Sneaker 1 */}
      <mesh position={[0, 0.04, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.25]} />
        <meshStandardMaterial color="#2D2D3A" />
      </mesh>
      {/* Sneaker 2 */}
      <mesh position={[0.15, 0.04, 0.05]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.25]} />
        <meshStandardMaterial color="#2D2D3A" />
      </mesh>
    </group>
    {/* Key hooks on wall */}
    <group position={[-0.5, 1.4, 0.06]}>
      <mesh>
        <boxGeometry args={[0.3, 0.15, 0.02]} />
        <meshStandardMaterial color="#5C4A3A" />
      </mesh>
      {/* Keys hanging */}
      <mesh position={[-0.08, -0.1, 0.02]}>
        <boxGeometry args={[0.04, 0.08, 0.01]} />
        <meshStandardMaterial color="#C0A050" />
      </mesh>
      <mesh position={[0.05, -0.12, 0.02]}>
        <boxGeometry args={[0.05, 0.1, 0.01]} />
        <meshStandardMaterial color="#A0A0A0" />
      </mesh>
    </group>
    
    {/* === CONTACT STICKY NOTE on door (per BRIEF) === */}
    {/* "out for a walk. leave me an email at jamesrindos1@gmail.com" */}
    <group position={[0.08, 1.5, 0.08]}>
      {/* Yellow sticky note */}
      <mesh rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.2, 0.15, 0.005]} />
        <meshStandardMaterial color="#FFEB3B" />
      </mesh>
      {/* "Writing" lines on note */}
      <mesh position={[0, 0.03, 0.003]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.15, 0.008, 0.001]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0, 0.01, 0.003]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.14, 0.008, 0.001]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0, -0.01, 0.003]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.16, 0.008, 0.001]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0, -0.03, 0.003]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.12, 0.008, 0.001]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[-0.02, -0.05, 0.003]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.1, 0.008, 0.001]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    </group>
  </group>
);

// Wall decorations - specific posters from BRIEF
const WallArt = () => (
  <group>
    {/* === BEDROOM WALL POSTERS (back wall) === */}
    
    {/* Scott Pilgrim vs the World poster */}
    <group position={[2.5, 1.8, -24.9]}>
      <mesh>
        <boxGeometry args={[0.9, 1.3, 0.02]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Pink/magenta dominant colors */}
      <mesh position={[0, 0.1, 0.03]}>
        <boxGeometry args={[0.75, 0.5, 0.01]} />
        <meshStandardMaterial color="#E91E63" />
      </mesh>
      <mesh position={[0, -0.35, 0.03]}>
        <boxGeometry args={[0.75, 0.4, 0.01]} />
        <meshStandardMaterial color="#2196F3" />
      </mesh>
      <mesh position={[0.15, 0.35, 0.02]}>
        <boxGeometry args={[0.3, 0.2, 0.01]} />
        <meshStandardMaterial color="#FFEB3B" />
      </mesh>
    </group>

    {/* Into the Spider-Verse poster */}
    <group position={[4, 1.8, -24.9]}>
      <mesh>
        <boxGeometry args={[0.9, 1.3, 0.02]} />
        <meshStandardMaterial color="#0D0D0F" />
      </mesh>
      {/* Red/blue Spider-Man colors */}
      <mesh position={[0, 0.2, 0.03]}>
        <boxGeometry args={[0.4, 0.6, 0.01]} />
        <meshStandardMaterial color="#E53935" />
      </mesh>
      <mesh position={[-0.2, -0.2, 0.03]}>
        <boxGeometry args={[0.35, 0.4, 0.01]} />
        <meshStandardMaterial color="#1E88E5" />
      </mesh>
      {/* Halftone dots effect */}
      {[[-0.25, 0.4], [0.25, 0.35], [-0.15, -0.45], [0.3, -0.4]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.02]}>
          <circleGeometry args={[0.05, 6]} />
          <meshStandardMaterial color="#FF4081" />
        </mesh>
      ))}
    </group>

    {/* Whiplash poster */}
    <group position={[5.5, 1.8, -24.9]}>
      <mesh>
        <boxGeometry args={[0.8, 1.2, 0.02]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Yellow/gold dominant */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.65, 0.9, 0.01]} />
        <meshStandardMaterial color="#F9A825" />
      </mesh>
      {/* Cymbal silhouette */}
      <mesh position={[0, 0.15, 0.02]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.2, 12]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>

    {/* Babylon poster - smaller */}
    <group position={[6.8, 1.6, -24.9]}>
      <mesh>
        <boxGeometry args={[0.7, 1.0, 0.02]} />
        <meshStandardMaterial color="#0D0D0F" />
      </mesh>
      {/* Gold/art deco style */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.55, 0.8, 0.01]} />
        <meshStandardMaterial color="#D4AF37" />
      </mesh>
      <mesh position={[0, 0.2, 0.02]}>
        <boxGeometry args={[0.4, 0.25, 0.01]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
    </group>

    {/* === LEFT WALL (bedroom) - Music posters === */}
    
    {/* Tyler the Creator poster */}
    <group position={[0.06, 1.8, -22]}>
      <mesh>
        <boxGeometry args={[0.02, 1.0, 0.8]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Colorful IGOR/CMIYGL vibes */}
      <mesh position={[0.03, 0, 0]}>
        <boxGeometry args={[0.01, 0.8, 0.6]} />
        <meshStandardMaterial color="#E91E63" />
      </mesh>
      <mesh position={[0.02, 0.2, 0.15]}>
        <boxGeometry args={[0.01, 0.35, 0.25]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[0.02, -0.15, -0.1]}>
        <boxGeometry args={[0.01, 0.3, 0.2]} />
        <meshStandardMaterial color="#FF9800" />
      </mesh>
    </group>

    {/* Elliott Smith poster */}
    <group position={[0.06, 1.5, -20]}>
      <mesh>
        <boxGeometry args={[0.02, 0.8, 0.6]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      {/* Muted, melancholic tones */}
      <mesh position={[0.03, 0, 0]}>
        <boxGeometry args={[0.01, 0.6, 0.45]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
    </group>

    {/* Djo poster (Joe Keery's band) */}
    <group position={[0.06, 1.8, -23.5]}>
      <mesh>
        <boxGeometry args={[0.02, 0.9, 0.7]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Retro synth-wave colors */}
      <mesh position={[0.015, 0.1, 0]}>
        <boxGeometry args={[0.01, 0.4, 0.55]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      <mesh position={[0.02, -0.2, 0]}>
        <boxGeometry args={[0.01, 0.3, 0.5]} />
        <meshStandardMaterial color="#4ECDC4" />
      </mesh>
    </group>

    {/* Geese (band) poster */}
    <group position={[7.94, 1.6, -22]}>
      <mesh>
        <boxGeometry args={[0.02, 0.8, 0.6]} />
        <meshStandardMaterial color="#2D2D2D" />
      </mesh>
      {/* Raw, energetic rock aesthetic */}
      <mesh position={[-0.03, 0, 0]}>
        <boxGeometry args={[0.01, 0.6, 0.45]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.02, 0.15, 0.1]}>
        <boxGeometry args={[0.01, 0.25, 0.2]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
    </group>

    {/* Critical Role poster */}
    <group position={[7.94, 1.6, -23.5]}>
      <mesh>
        <boxGeometry args={[0.02, 1.0, 0.7]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>
      {/* D&D fantasy colors - red, gold, dark */}
      <mesh position={[-0.015, 0.2, 0]}>
        <boxGeometry args={[0.01, 0.5, 0.55]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      <mesh position={[-0.02, 0, 0.15]}>
        <boxGeometry args={[0.01, 0.35, 0.2]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-0.02, -0.25, -0.1]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>
    </group>

    {/* Marty Supreme poster (new movie) - smaller, above desk area */}
    <group position={[1.5, 2.2, -17.1]}>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.02]} />
        <meshStandardMaterial color="#0D0D0F" />
      </mesh>
      {/* Timothée Chalamet vibes - muted, stylish */}
      <mesh position={[0, 0, 0.03]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.45, 0.6, 0.01]} />
        <meshStandardMaterial color="#2F4F4F" />
      </mesh>
      <mesh position={[0, 0.2, 0.02]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.25, 0.2, 0.01]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>
    </group>

    {/* Living room - framed photo on left wall */}
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

    {/* RED PAINTING on right wall (matching Sims reference) */}
    <group position={[9.94, 1.6, -3]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.05, 1.0, 0.8]} />
        <meshStandardMaterial color="#2D2020" />
      </mesh>
      {/* Canvas - vibrant red/orange abstract */}
      <mesh position={[-0.03, 0, 0]}>
        <boxGeometry args={[0.01, 0.85, 0.65]} />
        <meshStandardMaterial color="#E74C3C" />
      </mesh>
      {/* Abstract shapes on canvas */}
      <mesh position={[-0.04, 0.15, 0.1]}>
        <boxGeometry args={[0.01, 0.3, 0.25]} />
        <meshStandardMaterial color="#F39C12" />
      </mesh>
      <mesh position={[-0.04, -0.1, -0.15]}>
        <boxGeometry args={[0.01, 0.25, 0.2]} />
        <meshStandardMaterial color="#27AE60" />
      </mesh>
      <mesh position={[-0.04, 0.25, -0.2]}>
        <boxGeometry args={[0.01, 0.15, 0.15]} />
        <meshStandardMaterial color="#F4D03F" />
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

    {/* Wall clock in hallway */}
    <group position={[2.94, 2, -14]}>
      {/* Clock face */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>
      {/* Clock rim */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <torusGeometry args={[0.25, 0.02, 8, 16]} />
        <meshStandardMaterial color="#2D2D3A" />
      </mesh>
      {/* Clock hands (simplified) */}
      <mesh position={[0.03, 0.08, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[0.02, 0.12, 0.01]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.03, 0, 0.05]} rotation={[0, -Math.PI / 2, Math.PI / 3]}>
        <boxGeometry args={[0.015, 0.15, 0.01]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    </group>
  </group>
);

// Ceiling fan in living room (per BRIEF - subtle ceiling fan hum ambiance)
const CeilingFan = () => {
  const fanRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (fanRef.current) {
      fanRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });
  
  return (
    <group position={[5, 2.9, -5]}>
      {/* Motor housing */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.2, 0.15, 8]} />
        <meshStandardMaterial color="#5C4A3A" />
      </mesh>
      {/* Down rod */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color="#5C4A3A" />
      </mesh>
      {/* Fan blades - rotating */}
      <group ref={fanRef}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, -0.05, 0]} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
            <mesh position={[0.5, 0, 0]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.8, 0.02, 0.15]} />
              <meshStandardMaterial color="#3D2E2E" />
            </mesh>
          </mesh>
        ))}
      </group>
      {/* Light fixture */}
      <mesh position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#F5F5F5" side={2} />
      </mesh>
    </group>
  );
};

// Bedroom floor clutter - clothes, etc (per BRIEF - "lived-in chaos, 24yo")
const BedroomClutter = () => (
  <group>
    {/* T-shirt on floor */}
    <mesh position={[3, 0.03, -19.5]} rotation={[-Math.PI / 2, 0, 0.3]}>
      <boxGeometry args={[0.5, 0.4, 0.02]} />
      <meshStandardMaterial color="#2D2D3A" />
    </mesh>
    {/* Jeans crumpled */}
    <mesh position={[2.5, 0.05, -20]} rotation={[-0.1, 0.5, 0]}>
      <boxGeometry args={[0.35, 0.08, 0.6]} />
      <meshStandardMaterial color="#1A3A5C" />
    </mesh>
    {/* Sock 1 */}
    <mesh position={[4.5, 0.02, -18.5]} rotation={[0, 0.8, 0]}>
      <boxGeometry args={[0.08, 0.03, 0.15]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
    {/* Sock 2 (not matching - realistic) */}
    <mesh position={[4.8, 0.02, -19]} rotation={[0, -0.3, 0]}>
      <boxGeometry args={[0.08, 0.03, 0.15]} />
      <meshStandardMaterial color="#1A1A1A" />
    </mesh>
    {/* Hoodie draped near bed */}
    <mesh position={[6, 0.04, -19.5]} rotation={[-0.1, 0.2, 0]}>
      <boxGeometry args={[0.5, 0.06, 0.6]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    {/* Pillow that fell off bed */}
    <mesh position={[4, 0.1, -19.8]} rotation={[0.2, 0.4, 0.1]}>
      <boxGeometry args={[0.35, 0.12, 0.25]} />
      <meshStandardMaterial color="#E8DCC8" />
    </mesh>
    {/* Book on floor */}
    <mesh position={[3.5, 0.02, -22]} rotation={[0, 0.6, 0]}>
      <boxGeometry args={[0.18, 0.025, 0.25]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
    {/* Water bottle */}
    <mesh position={[2.8, 0.1, -21]}>
      <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
    </mesh>
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
      {/* RGB glow from gaming desk corner */}
      <PulsingLight position={[1.5, 1.5, -18]} color="#7B68EE" intensity={1.2} />
      {/* Window light from right wall */}
      <pointLight position={[7, 2, -21]} color="#FFF8E8" intensity={0.6} distance={8} decay={2} />
      <pointLight position={[4, 2.5, -21]} color="#FFF5E6" intensity={0.3} distance={10} decay={2} />
      <pointLight position={[2, 2, -14.5]} color="#FFF5E6" intensity={0.6} distance={6} decay={2} />

      {/* === AMBIENT PARTICLES === */}
      {/* Dust motes floating throughout apartment */}
      <DustParticles count={80} area={{ x: 15, y: 3, z: 20 }} offset={{ x: 5, y: 0.5, z: -12 }} />
      {/* Concentrated particles in bedroom window light beams */}
      <LightBeamParticles position={[7.5, 0.5, -21]} count={25} />
      <LightBeamParticles position={[7.5, 0.5, -22.5]} count={25} />

      {/* === OUTER WALLS - OPEN LIVING/KITCHEN === */}
      {/* Front wall with door opening - split into two sections */}
      <Wall position={[0.75, hy, 0]} size={[1.5, h, t]} /> {/* Left of door */}
      <Wall position={[7, hy, 0]} size={[6, h, t]} /> {/* Right of door */}
      {/* Door header above opening */}
      <mesh position={[2, WALL_HEIGHT - 0.2, 0]}>
        <boxGeometry args={[1.2, 0.4, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <Wall position={[0, hy, -6]} size={[t, h, 12]} />
      <Wall position={[10, hy, -6]} size={[t, h, 12]} />
      <Wall position={[5, hy, -12]} size={[10, h, t]} />

      {/* === HALLWAY WALLS === */}
      {/* Left hallway wall - extends from living room to bedroom */}
      <Wall position={[1, hy, -14.5]} size={[t, h, 5]} />
      {/* Right hallway wall - with bathroom cutout */}
      <Wall position={[3, hy, -13]} size={[t, h, 2]} /> {/* Before bathroom */}
      <Wall position={[3, hy, -16]} size={[t, h, 2]} /> {/* After bathroom */}
      
      {/* === BATHROOM ENCLOSURE (off right side of hallway) === */}
      {/* Bathroom back wall */}
      <Wall position={[5, hy, -15.5]} size={[4, h, t]} />
      {/* Bathroom right wall */}
      <Wall position={[7, hy, -14.25]} size={[t, h, 2.5]} />
      {/* Bathroom front wall with door opening */}
      <Wall position={[5.5, hy, -13]} size={[3, h, t]} />

      {/* === BEDROOM WALLS === */}
      <Wall position={[4, hy, -25]} size={[8, h, t]} />
      <Wall position={[0, hy, -21]} size={[t, h, 8]} />
      <Wall position={[8, hy, -21]} size={[t, h, 8]} />
      <Wall position={[0.5, hy, -17]} size={[1, h, t]} />
      <Wall position={[5.5, hy, -17]} size={[5, h, t]} />

      {/* === FRONT DOOR at end of hallway === */}
      <FrontDoor />

      {/* === BATHROOM === */}
      <Bathroom />

      {/* === BEDROOM === */}
      <BedroomWindows />
      <Bed />
      <Nightstand />
      <BedroomStereo />
      <BedroomClock />
      <GamingDesk />
      <GamingChair />
      {/* Interactive Guitar - click to strum! */}
      <InteractiveGuitar position={[0.3, 0, -20]} />
      <BedroomClutter />

      {/* === KITCHEN === */}
      <KitchenIsland />
      <Fridge />
      <KitchenCabinets />
      <Stove />
      
      {/* Kitchen trash can */}
      <mesh position={[9.2, 0.25, -10]}>
        <cylinderGeometry args={[0.15, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#404040" />
      </mesh>

      {/* === LIVING ROOM === */}
      <RetroTV />
      <VHSShelf />
      <Couch />
      <CoffeeTable />
      <CeilingFan />

      {/* === WALL DECORATIONS === */}
      <WallArt />

      {/* === AREA RUG in living room (between couch and TV) === */}
      <mesh position={[5.5, 0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#4A3728" side={2} />
      </mesh>
      {/* Rug pattern - geometric */}
      <mesh position={[5.5, 0.025, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#5C4433" side={2} />
      </mesh>
      <mesh position={[5.5, 0.027, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshStandardMaterial color="#6B5243" side={2} />
      </mesh>
      
      {/* === PIZZA BOX on floor by couch (lived-in chaos per BRIEF) === */}
      <group position={[2.8, 0, -2.5]}>
        <mesh position={[0, 0.04, 0]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
        {/* Pizza box lid slightly open */}
        <mesh position={[0, 0.08, -0.22]} rotation={[0.3, 0.15, 0]}>
          <boxGeometry args={[0.48, 0.02, 0.48]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
        {/* Grease stain on top */}
        <mesh position={[0.05, 0.09, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.08, 6]} />
          <meshStandardMaterial color="#8B4513" transparent opacity={0.4} />
        </mesh>
      </group>
      
      {/* Another pizza box stacked */}
      <mesh position={[2.75, 0.12, -2.45]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.45, 0.04, 0.45]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>

      {/* === BEDROOM RUG === */}
      <mesh position={[4, 0.02, -21]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#8B7355" side={2} />
      </mesh>
    </group>
  );
};

// Inner scene content that uses context
const SceneContent = ({ 
  activePreset, 
  onNavigate 
}: { 
  activePreset: CameraPreset;
  onNavigate: (preset: CameraPreset) => void;
}) => {
  return (
    <>
      <color attach="background" args={["#1A1A2E"]} />
      {/* Bright Sims-style lighting - warm and well-lit */}
      <ambientLight color="#FFF8F0" intensity={1.2} />
      <directionalLight position={[-8, 25, 10]} intensity={1.5} color="#FFFFFF" castShadow />
      <directionalLight position={[15, 20, -5]} intensity={0.8} color="#FFF5E6" />
      {/* Fill light from below to reduce harsh shadows */}
      <hemisphereLight args={["#FFF8F0", "#8B7355", 0.6]} />
      <Apartment />
      <RoomClickZones onNavigate={onNavigate} />
      <CameraController activePreset={activePreset} />
    </>
  );
};

// Loading screen component
const LoadingScreen = () => (
  <Html center>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'VT323', monospace",
        color: "#7B68EE",
        textAlign: "center",
      }}
    >
      {/* Retro TV icon */}
      <div style={{
        fontSize: "48px",
        marginBottom: "16px",
        animation: "bounce 1s ease-in-out infinite",
      }}>📺</div>
      
      <div style={{ 
        fontSize: "28px",
        marginBottom: "8px",
        textShadow: "0 0 15px #7B68EE",
      }}>
        James's Apartment
      </div>
      
      <div style={{ 
        fontSize: "14px", 
        color: "#888",
        marginBottom: "20px",
      }}>
        Loading...
      </div>
      
      {/* Progress bar */}
      <div
        style={{
          width: "200px",
          height: "6px",
          background: "rgba(123, 104, 238, 0.2)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #7B68EE, #00D9FF, #7B68EE)",
            backgroundSize: "200% 100%",
            borderRadius: "3px",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  </Html>
);

const Scene = () => {
  const [activePreset, setActivePreset] = useState<CameraPreset>("overview");

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0D0D0F" }}>
      <ApartmentProvider>
        <Canvas camera={{ position: [18, 16, 8], fov: 45 }} shadows>
          <Suspense fallback={<LoadingScreen />}>
            <SceneContent activePreset={activePreset} onNavigate={setActivePreset} />
          </Suspense>
        </Canvas>
        <Loader
          containerStyles={{
            background: "#0D0D0F",
          }}
          innerStyles={{
            background: "#7B68EE",
          }}
          barStyles={{
            background: "#00D9FF",
          }}
          dataStyles={{
            color: "#7B68EE",
            fontFamily: "'VT323', monospace",
            fontSize: "14px",
          }}
        />
        {/* Camera Navigation */}
        <CameraNavigation 
          activePreset={activePreset} 
          onPresetChange={setActivePreset} 
        />
        {/* Interactive legend - top right */}
        <InteractiveLegend />
      </ApartmentProvider>
    </div>
  );
};

export default Scene;
