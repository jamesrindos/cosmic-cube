import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Environment, useTexture } from "@react-three/drei";
import { Suspense, useState, useRef } from "react";
import * as THREE from "three";

// ============================================
// MINIMAL TV + TAPES PORTFOLIO
// Stripped down, focused, intentional
// ============================================

// VHS Tape data - portfolio projects + About Me
const tapeData = [
  { id: "about", label: "ABOUT ME", color: "#E8E8E8", accent: "#1A1A1A", content: {
    title: "James Rindos",
    description: "Creative technologist building at the intersection of AI and video. Previously led AI video production at Icon. Now building tools that make content creation feel like magic.",
    links: { twitter: "@slimjimm318", linkedin: "james-rindos-489a29245", email: "jamesrindos1@gmail.com" }
  }},
  { id: "moziwash", label: "MOZIWASH", color: "#FFD700", accent: "#1A1A1A", content: {
    title: "MoziWash Campaign",
    description: "AI-generated UGC campaign for car care brand. 12 videos, 2M+ views.",
  }},
  { id: "audien", label: "AUDIEN", color: "#2196F3", accent: "#FFFFFF", content: {
    title: "Audien Hearing",
    description: "Direct response video ads for hearing aid brand. Performance-focused creative.",
  }},
  { id: "kalshi", label: "KALSHI", color: "#E91E63", accent: "#FFFFFF", content: {
    title: "Kalshi",
    description: "Prediction market platform. Building automated trading systems.",
  }},
  { id: "mudwtr", label: "MUD\\WTR", color: "#795548", accent: "#FFFFFF", content: {
    title: "MUD\\WTR",
    description: "Coffee alternative brand. UGC-style video content at scale.",
  }},
  { id: "boldebottle", label: "BOLDE", color: "#FF5722", accent: "#FFFFFF", content: {
    title: "BoldeBottle",
    description: "Fitness bottle brand. Product demo and lifestyle content.",
  }},
  { id: "dirtea", label: "DIRTEA", color: "#4CAF50", accent: "#FFFFFF", content: {
    title: "Dirtea",
    description: "Mushroom tea brand. Wellness-focused video campaigns.",
  }},
  { id: "political", label: "POLITICAL", color: "#0D47A1", accent: "#E53935", content: {
    title: "Political Media",
    description: "Campaign ads and political content production.",
  }},
];

// VHS Tape Component
const VHSTape = ({ 
  position, 
  tape, 
  isSelected,
  onSelect 
}: { 
  position: [number, number, number];
  tape: typeof tapeData[0];
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Pop out when hovered
      const targetZ = hovered ? 0.15 : 0;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;
      
      // Glow when selected
      const targetEmissive = isSelected ? 0.3 : (hovered ? 0.15 : 0);
      // Applied via material below
    }
  });

  return (
    <group 
      ref={meshRef}
      position={position}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Tape case */}
      <mesh>
        <boxGeometry args={[0.8, 1.2, 0.25]} />
        <meshStandardMaterial 
          color="#1A1A1A" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Label - front */}
      <mesh position={[0, 0, 0.126]}>
        <boxGeometry args={[0.7, 1.0, 0.01]} />
        <meshStandardMaterial 
          color={tape.color}
          emissive={tape.color}
          emissiveIntensity={isSelected ? 0.4 : (hovered ? 0.2 : 0)}
          roughness={0.4}
        />
      </mesh>
      
      {/* Label text stripe */}
      <mesh position={[0, 0.3, 0.13]}>
        <boxGeometry args={[0.6, 0.15, 0.01]} />
        <meshStandardMaterial color={tape.accent} roughness={0.5} />
      </mesh>
      
      {/* Tape window */}
      <mesh position={[0, -0.2, 0.13]}>
        <boxGeometry args={[0.5, 0.35, 0.01]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* Tape reels visible through window */}
      <mesh position={[-0.12, -0.2, 0.12]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} />
      </mesh>
      <mesh position={[0.12, -0.2, 0.12]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.3} />
      </mesh>
      
      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, 0.8, 0.2]} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(0,0,0,0.9)",
            color: tape.color,
            padding: "8px 14px",
            borderRadius: "4px",
            fontSize: "14px",
            fontFamily: "'VT323', 'Courier New', monospace",
            whiteSpace: "nowrap",
            border: `2px solid ${tape.color}`,
            textShadow: `0 0 10px ${tape.color}`,
          }}>
            {tape.label}
          </div>
        </Html>
      )}
    </group>
  );
};

// CRT TV Component
const CRTTV = ({ 
  selectedTape,
  onClearSelection
}: { 
  selectedTape: typeof tapeData[0] | null;
  onClearSelection: () => void;
}) => {
  const screenRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame(({ clock }) => {
    if (screenRef.current && !selectedTape) {
      // Static noise effect when idle
      const noise = 0.15 + Math.sin(clock.elapsedTime * 30) * 0.03 + Math.random() * 0.05;
      screenRef.current.emissiveIntensity = noise;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* TV Body - chunky CRT */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.5, 3.5, 3]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Screen bezel */}
      <mesh position={[0, 0.1, 1.45]}>
        <boxGeometry args={[3.8, 2.8, 0.15]} />
        <meshStandardMaterial color="#0D0D0D" roughness={0.4} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0.1, 1.53]} onClick={onClearSelection}>
        <boxGeometry args={[3.4, 2.5, 0.05]} />
        <meshStandardMaterial 
          ref={screenRef}
          color={selectedTape ? "#0A0A12" : "#1A1A2A"}
          emissive={selectedTape ? selectedTape.color : "#00D9FF"}
          emissiveIntensity={selectedTape ? 0.3 : 0.15}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      
      {/* Screen content when tape selected */}
      {selectedTape && (
        <Html
          position={[0, 0.1, 1.6]}
          transform
          style={{
            width: 320,
            height: 230,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.9)",
              color: selectedTape.color,
              padding: "20px",
              fontFamily: "'VT323', 'Courier New', monospace",
              overflow: "hidden",
              border: `2px solid ${selectedTape.color}`,
              boxShadow: `0 0 30px ${selectedTape.color}40`,
            }}
          >
            <div style={{ 
              fontSize: "24px", 
              fontWeight: "bold", 
              marginBottom: "12px",
              textShadow: `0 0 10px ${selectedTape.color}`,
            }}>
              ▶ {selectedTape.content.title}
            </div>
            <div style={{ 
              color: "#CCCCCC", 
              fontSize: "14px",
              lineHeight: "1.5",
            }}>
              {selectedTape.content.description}
            </div>
            {selectedTape.content.links && (
              <div style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
                <div>🐦 {selectedTape.content.links.twitter}</div>
                <div>💼 {selectedTape.content.links.linkedin}</div>
                <div>📧 {selectedTape.content.links.email}</div>
              </div>
            )}
            <div style={{ 
              position: "absolute",
              bottom: "10px",
              right: "15px",
              fontSize: "11px",
              color: "#555",
            }}>
              Click TV to stop
            </div>
          </div>
        </Html>
      )}
      
      {/* Scanlines overlay */}
      <mesh position={[0, 0.1, 1.54]}>
        <boxGeometry args={[3.38, 2.48, 0.01]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.1} />
      </mesh>
      
      {/* VCR slot */}
      <mesh position={[0, -1.4, 1.4]}>
        <boxGeometry args={[1.5, 0.15, 0.3]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.5} />
      </mesh>
      
      {/* VCR slot opening */}
      <mesh position={[0, -1.4, 1.56]}>
        <boxGeometry args={[1.0, 0.06, 0.02]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>
      
      {/* Control knobs */}
      <mesh position={[1.8, -0.5, 1.5]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.8, -1.0, 1.5]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Power LED */}
      <mesh position={[1.8, -1.35, 1.52]}>
        <boxGeometry args={[0.08, 0.03, 0.02]} />
        <meshStandardMaterial 
          color="#00FF00" 
          emissive="#00FF00" 
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Speaker grills on sides */}
      <mesh position={[-2.0, 0, 1.2]}>
        <boxGeometry args={[0.3, 2, 0.5]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.6} />
      </mesh>
      <mesh position={[2.0, 0, 1.2]}>
        <boxGeometry args={[0.3, 2, 0.5]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.6} />
      </mesh>
      
      {/* Screen glow */}
      <pointLight 
        position={[0, 0, 2.5]} 
        color={selectedTape ? selectedTape.color : "#00D9FF"} 
        intensity={selectedTape ? 2 : 0.8} 
        distance={8} 
        decay={2} 
      />
    </group>
  );
};

// Tape Shelf Component
const TapeShelf = ({ 
  selectedTapeId,
  onSelectTape 
}: { 
  selectedTapeId: string | null;
  onSelectTape: (tape: typeof tapeData[0]) => void;
}) => {
  return (
    <group position={[0, -3, 1]}>
      {/* Shelf board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.15, 1.2]} />
        <meshStandardMaterial color="#3D2E1E" roughness={0.7} />
      </mesh>
      
      {/* Shelf supports */}
      <mesh position={[-3.5, -0.5, 0]}>
        <boxGeometry args={[0.15, 1, 1]} />
        <meshStandardMaterial color="#2D1E0E" roughness={0.8} />
      </mesh>
      <mesh position={[3.5, -0.5, 0]}>
        <boxGeometry args={[0.15, 1, 1]} />
        <meshStandardMaterial color="#2D1E0E" roughness={0.8} />
      </mesh>
      
      {/* VHS Tapes */}
      {tapeData.map((tape, i) => (
        <VHSTape
          key={tape.id}
          position={[-3.2 + i * 0.92, 0.68, 0]}
          tape={tape}
          isSelected={selectedTapeId === tape.id}
          onSelect={() => onSelectTape(tape)}
        />
      ))}
    </group>
  );
};

// TV Stand/Cabinet
const TVStand = () => (
  <group position={[0, -1.8, 0]}>
    {/* Main cabinet */}
    <mesh position={[0, 0, 0.5]}>
      <boxGeometry args={[5, 1.2, 2]} />
      <meshStandardMaterial color="#2D1E0E" roughness={0.7} />
    </mesh>
    
    {/* Cabinet door lines */}
    <mesh position={[-1.2, 0, 1.51]}>
      <boxGeometry args={[0.02, 0.9, 0.02]} />
      <meshStandardMaterial color="#1A1008" roughness={0.5} />
    </mesh>
    <mesh position={[1.2, 0, 1.51]}>
      <boxGeometry args={[0.02, 0.9, 0.02]} />
      <meshStandardMaterial color="#1A1008" roughness={0.5} />
    </mesh>
    
    {/* Handles */}
    <mesh position={[-0.8, 0, 1.52]}>
      <boxGeometry args={[0.15, 0.04, 0.04]} />
      <meshStandardMaterial color="#C0A050" roughness={0.3} metalness={0.7} />
    </mesh>
    <mesh position={[0.8, 0, 1.52]}>
      <boxGeometry args={[0.15, 0.04, 0.04]} />
      <meshStandardMaterial color="#C0A050" roughness={0.3} metalness={0.7} />
    </mesh>
  </group>
);

// Floor
const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]}>
    <planeGeometry args={[30, 30]} />
    <meshStandardMaterial color="#1A1612" roughness={0.9} />
  </mesh>
);

// Background wall
const BackWall = () => (
  <mesh position={[0, 2, -4]}>
    <planeGeometry args={[30, 20]} />
    <meshStandardMaterial color="#12100E" roughness={0.95} />
  </mesh>
);

// Scene content
const SceneContent = () => {
  const [selectedTape, setSelectedTape] = useState<typeof tapeData[0] | null>(null);

  return (
    <>
      {/* Dark ambient environment */}
      <color attach="background" args={["#0A0908"]} />
      <fog attach="fog" args={["#0A0908", 10, 30]} />
      
      {/* Lighting - moody, focused on TV */}
      <ambientLight intensity={0.15} color="#FFF5E6" />
      <spotLight 
        position={[0, 8, 5]} 
        angle={0.4} 
        penumbra={0.5} 
        intensity={0.8} 
        color="#FFF8F0"
        castShadow
      />
      
      {/* Subtle rim lights */}
      <pointLight position={[-6, 2, 2]} color="#4A3020" intensity={0.3} distance={15} />
      <pointLight position={[6, 2, 2]} color="#4A3020" intensity={0.3} distance={15} />
      
      {/* Main elements */}
      <CRTTV 
        selectedTape={selectedTape} 
        onClearSelection={() => setSelectedTape(null)} 
      />
      <TVStand />
      <TapeShelf 
        selectedTapeId={selectedTape?.id || null}
        onSelectTape={setSelectedTape}
      />
      <Floor />
      <BackWall />
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, -1, 0]}
      />
    </>
  );
};

// Loading screen
const LoadingScreen = () => (
  <Html center>
    <div style={{
      fontFamily: "'VT323', monospace",
      color: "#00D9FF",
      fontSize: "24px",
      textAlign: "center",
    }}>
      <div style={{ marginBottom: "10px" }}>📼</div>
      <div>Loading...</div>
    </div>
  </Html>
);

// Main Scene
const Scene = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0A0908" }}>
      <Canvas 
        camera={{ position: [0, 1, 10], fov: 50 }}
        shadows
      >
        <Suspense fallback={<LoadingScreen />}>
          <SceneContent />
        </Suspense>
      </Canvas>
      
      {/* Branding */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          fontFamily: "'VT323', monospace",
          zIndex: 1000,
        }}
      >
        <div style={{ fontSize: "28px", color: "#FFFFFF" }}>
          James Rindos
        </div>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
          Creative Portfolio
        </div>
      </div>
      
      {/* Instructions */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace",
          fontSize: "14px",
          color: "#444",
          textAlign: "center",
        }}
      >
        Click a tape to play • Drag to orbit • Scroll to zoom
      </div>
    </div>
  );
};

export default Scene;
