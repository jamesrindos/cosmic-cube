import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// INTERACTIVE RUBIK'S CUBE
// Animates a "solve" sequence when clicked
// ============================================
export const InteractiveRubiksCube = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [clickPulse, setClickPulse] = useState(0);
  
  // Cursor change on hover
  const handlePointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  useFrame((_, delta) => {
    if (isSolving && groupRef.current) {
      // Spin animation during solve
      groupRef.current.rotation.y += delta * 8;
      groupRef.current.rotation.x += delta * 4;
      
      setSolveProgress((prev) => {
        const next = prev + delta;
        if (next >= 1.5) {
          setIsSolving(false);
          // Reset rotation smoothly
          groupRef.current!.rotation.y = 0;
          groupRef.current!.rotation.x = 0;
          return 0;
        }
        return next;
      });
    }
    
    // Decay click pulse
    if (clickPulse > 0) {
      setClickPulse((prev) => Math.max(0, prev - delta * 3));
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isSolving) {
      setIsSolving(true);
      setSolveProgress(0);
      setClickPulse(1); // Trigger pulse
    }
  };

  // Scale up slightly when hovered or clicked
  const scale = (isHovered ? 1.15 : 1) + clickPulse * 0.1;

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      scale={[scale, scale, scale]}
    >
      {/* Main cube body */}
      <mesh>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Face colors - only show solved state when not solving */}
      {!isSolving && (
        <>
          {/* Right face - White */}
          <mesh position={[0.071, 0, 0]}>
            <boxGeometry args={[0.002, 0.12, 0.12]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Top face - Yellow */}
          <mesh position={[0, 0.071, 0]}>
            <boxGeometry args={[0.12, 0.002, 0.12]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          {/* Front face - Green */}
          <mesh position={[0, 0, 0.071]}>
            <boxGeometry args={[0.12, 0.12, 0.002]} />
            <meshStandardMaterial color="#27AE60" />
          </mesh>
          {/* Left face - Orange */}
          <mesh position={[-0.071, 0, 0]}>
            <boxGeometry args={[0.002, 0.12, 0.12]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>
          {/* Bottom face - Blue */}
          <mesh position={[0, -0.071, 0]}>
            <boxGeometry args={[0.12, 0.002, 0.12]} />
            <meshStandardMaterial color="#2196F3" />
          </mesh>
          {/* Back face - Red */}
          <mesh position={[0, 0, -0.071]}>
            <boxGeometry args={[0.12, 0.12, 0.002]} />
            <meshStandardMaterial color="#E53935" />
          </mesh>
        </>
      )}
      
      {/* Scrambled colors during solve animation */}
      {isSolving && (
        <>
          <mesh position={[0.071, 0, 0]}>
            <boxGeometry args={[0.002, 0.12, 0.12]} />
            <meshStandardMaterial color="#E53935" />
          </mesh>
          <mesh position={[0, 0.071, 0]}>
            <boxGeometry args={[0.12, 0.002, 0.12]} />
            <meshStandardMaterial color="#27AE60" />
          </mesh>
          <mesh position={[0, 0, 0.071]}>
            <boxGeometry args={[0.12, 0.12, 0.002]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[-0.071, 0, 0]}>
            <boxGeometry args={[0.002, 0.12, 0.12]} />
            <meshStandardMaterial color="#2196F3" />
          </mesh>
          <mesh position={[0, -0.071, 0]}>
            <boxGeometry args={[0.12, 0.002, 0.12]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0, -0.071]}>
            <boxGeometry args={[0.12, 0.12, 0.002]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>
        </>
      )}
      
      {/* Hover/click glow effect */}
      {(isHovered || clickPulse > 0) && (
        <pointLight 
          position={[0, 0, 0]} 
          color="#FFD700" 
          intensity={0.3 + clickPulse * 0.5} 
          distance={0.5 + clickPulse * 0.3} 
          decay={2} 
        />
      )}
    </group>
  );
};

// ============================================
// INTERACTIVE GUITAR
// Tilts and "strums" when clicked
// ============================================
export const InteractiveGuitar = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isStrumming, setIsStrumming] = useState(false);
  const [strumTime, setStrumTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Cursor change on hover
  const handlePointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  useFrame((_, delta) => {
    if (isStrumming && groupRef.current) {
      setStrumTime((prev) => {
        const next = prev + delta;
        // Wobble effect
        groupRef.current!.rotation.z = 0.12 + Math.sin(next * 20) * 0.05 * Math.exp(-next * 3);
        
        if (next >= 1.5) {
          setIsStrumming(false);
          groupRef.current!.rotation.z = 0.12;
          return 0;
        }
        return next;
      });
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isStrumming) {
      setIsStrumming(true);
      setStrumTime(0);
    }
  };

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={[0, 0.1, 0.12]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Guitar body - dusty cherry red */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.12]} />
        <meshStandardMaterial color={isHovered ? "#B83A3A" : "#A52A2A"} />
      </mesh>
      {/* Guitar body lower bout */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.55, 0.4, 0.1]} />
        <meshStandardMaterial color={isHovered ? "#B83A3A" : "#A52A2A"} />
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
      {/* Dust accumulation */}
      <mesh position={[0.1, 0.7, -0.065]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.15, 0.1, 0.002]} />
        <meshStandardMaterial color="#C4A484" transparent opacity={0.3} />
      </mesh>
      <mesh position={[-0.08, 0.45, -0.055]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.1, 0.08, 0.002]} />
        <meshStandardMaterial color="#C4A484" transparent opacity={0.25} />
      </mesh>
      {/* Strings - vibrate when strumming */}
      <mesh position={[0, 1.0, -0.065]}>
        <boxGeometry args={[0.08, 1.0, 0.005]} />
        <meshStandardMaterial 
          color={isStrumming ? "#FFD700" : "#D4AF37"} 
          emissive={isStrumming ? "#FFD700" : "#000000"}
          emissiveIntensity={isStrumming ? 0.3 : 0}
        />
      </mesh>
      
      {/* Hover indicator */}
      {isHovered && (
        <pointLight position={[0, 0.6, 0.2]} color="#A52A2A" intensity={0.2} distance={1} decay={2} />
      )}
    </group>
  );
};

// ============================================
// INTERACTIVE VHS TAPE
// Glows on hover, pops out slightly
// ============================================
interface VHSTapeProps {
  position: [number, number, number];
  color: string;
  labelColor: string;
  projectName?: string;
  onSelect?: () => void;
}

export const InteractiveVHSTape = ({ position, color, labelColor, projectName, onSelect }: VHSTapeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Cursor change on hover
  const handlePointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  useFrame(() => {
    if (meshRef.current) {
      // Pop out slightly when hovered
      const targetX = isHovered ? -0.05 : 0;
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.1;
    }
  });

  return (
    <group 
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* Tape body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.15, 0.18, 0.1]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Label */}
      <mesh position={[-0.076, 0, 0]}>
        <boxGeometry args={[0.01, 0.14, 0.08]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isHovered ? color : "#000000"}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>
      {/* Label stripe */}
      <mesh position={[-0.078, 0.04, 0]}>
        <boxGeometry args={[0.005, 0.03, 0.06]} />
        <meshStandardMaterial color={labelColor} />
      </mesh>
      
      {/* Hover glow */}
      {isHovered && (
        <pointLight position={[-0.1, 0, 0]} color={color} intensity={0.3} distance={0.3} decay={2} />
      )}
      
      {/* Tooltip on hover */}
      {isHovered && projectName && (
        <Html
          position={[-0.2, 0.15, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.9)",
              color: color,
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              fontFamily: "'VT323', monospace",
              whiteSpace: "nowrap",
              border: `1px solid ${color}`,
              textShadow: `0 0 3px ${color}`,
            }}
          >
            {projectName}
          </div>
        </Html>
      )}
    </group>
  );
};

// ============================================
// TV SCREEN WITH CONTENT
// Shows static, then content when VHS selected
// ============================================
interface TVScreenProps {
  isPlaying?: boolean;
  content?: string;
}

export const TVScreen = ({ isPlaying = false }: TVScreenProps) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [staticOffset, setStaticOffset] = useState(0);

  useFrame((_, delta) => {
    if (!isPlaying) {
      // Animate static effect
      setStaticOffset((prev) => (prev + delta * 10) % 1);
    }
  });

  // Static color variation
  const staticColor = isPlaying ? "#00D9FF" : `hsl(${staticOffset * 360}, 10%, ${20 + Math.sin(staticOffset * 100) * 5}%)`;

  return (
    <mesh position={[-0.55, 0.95, 0]}>
      <boxGeometry args={[0.08, 0.7, 0.9]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={isPlaying ? "#0A0A0F" : "#1A1A2A"}
        emissive={staticColor}
        emissiveIntensity={isPlaying ? 0.5 : 0.2}
      />
    </mesh>
  );
};
