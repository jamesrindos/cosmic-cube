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
