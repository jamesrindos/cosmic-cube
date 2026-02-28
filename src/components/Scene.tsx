import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Float } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import * as THREE from "three";

// ============================================
// TV + TAPES PORTFOLIO - POLISHED VERSION
// ============================================

// VHS Tape data - About Me only (add your real projects here)
const tapeData = [
  { id: "about", label: "ABOUT ME", color: "#FFFFFF", accent: "#E91E63", spine: "#F5F5F5", isSpecial: true, content: {
    title: "James Rindos",
    subtitle: "Creative Technologist",
    description: "Building at the intersection of AI and video.",
    links: { 
      twitter: { handle: "@slimjimm318", url: "https://twitter.com/slimjimm318" },
      linkedin: { handle: "james-rindos", url: "https://linkedin.com/in/james-rindos-489a29245" },
      youtube: { handle: "@jackacetalks", url: "https://youtube.com/@jackacetalks" },
      email: "jamesrindos1@gmail.com"
    }
  }},
  // Add your real projects below - these are placeholders
  { id: "project1", label: "PROJECT 1", color: "#2196F3", accent: "#FFFFFF", spine: "#2196F3", content: {
    title: "Project Title",
    subtitle: "Project Type",
    description: "Add your project description here.",
  }},
  { id: "project2", label: "PROJECT 2", color: "#E91E63", accent: "#FFFFFF", spine: "#E91E63", content: {
    title: "Project Title",
    subtitle: "Project Type",
    description: "Add your project description here.",
  }},
  { id: "project3", label: "PROJECT 3", color: "#4CAF50", accent: "#FFFFFF", spine: "#4CAF50", content: {
    title: "Project Title",
    subtitle: "Project Type",
    description: "Add your project description here.",
  }},
];

// Animated timecode display
const TimecodeDisplay = () => {
  const [time, setTime] = useState("00:00:00");
  
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ 
      position: "absolute",
      bottom: "12px",
      right: "16px",
      fontSize: "14px",
      color: "#333",
      fontFamily: "monospace",
      letterSpacing: "2px",
    }}>
      {time}
    </div>
  );
};

// Animated static noise for TV
const StaticNoise = ({ intensity = 0.3 }: { intensity: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.elapsedTime;
      const noise = Math.sin(t * 50) * 0.1 + Math.random() * 0.2;
      materialRef.current.opacity = intensity * (0.5 + noise);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[3.3, 2.4]} />
      <meshBasicMaterial 
        ref={materialRef}
        color="#FFFFFF" 
        transparent 
        opacity={0.1}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// VHS Tape Component - Enhanced
const VHSTape = ({ 
  position, 
  tape, 
  isSelected,
  isInserting,
  onSelect 
}: { 
  position: [number, number, number];
  tape: typeof tapeData[0];
  isSelected: boolean;
  isInserting: boolean;
  onSelect: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const [animProgress, setAnimProgress] = useState(0);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Hover pop-out effect
      const targetZ = hovered && !isInserting ? 0.2 : 0;
      groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.15;
      
      // Insertion animation
      if (isInserting) {
        setAnimProgress(prev => Math.min(1, prev + delta * 2));
      } else if (animProgress > 0 && !isSelected) {
        setAnimProgress(prev => Math.max(0, prev - delta * 3));
      }
    }
  });

  // Calculate position offset for insertion animation
  const insertionOffset = isInserting || isSelected ? animProgress * 8 : 0;
  const insertionY = isInserting || isSelected ? animProgress * 4 : 0;

  if (isSelected && animProgress > 0.8) {
    return null; // Hide tape when fully inserted
  }

  return (
    <group 
      ref={groupRef}
      position={[position[0], position[1] + insertionY, position[2] - insertionOffset]}
      rotation={[isInserting ? -animProgress * 0.3 : 0, 0, 0]}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); if (!isInserting) onSelect(); }}
    >
      {/* Tape case */}
      <mesh castShadow>
        <boxGeometry args={[0.75, 1.15, 0.22]} />
        <meshStandardMaterial 
          color={tape.isSpecial ? "#F0F0F0" : "#0F0F0F"}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>
      
      {/* Front label */}
      <mesh position={[0, 0.05, 0.112]}>
        <boxGeometry args={[0.65, 0.9, 0.01]} />
        <meshStandardMaterial 
          color={tape.color}
          emissive={tape.color}
          emissiveIntensity={isSelected ? 0.5 : (hovered ? 0.25 : 0.05)}
          roughness={0.5}
        />
      </mesh>
      
      {/* Label text area */}
      <mesh position={[0, 0.32, 0.118]}>
        <boxGeometry args={[0.55, 0.18, 0.005]} />
        <meshStandardMaterial color={tape.accent} roughness={0.6} />
      </mesh>
      
      {/* Tape window */}
      <mesh position={[0, -0.18, 0.115]}>
        <boxGeometry args={[0.45, 0.32, 0.01]} />
        <meshStandardMaterial color="#050505" roughness={0.15} metalness={0.4} />
      </mesh>
      
      {/* Tape reels */}
      <mesh position={[-0.1, -0.18, 0.11]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.015, 20]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.1, -0.18, 0.11]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.015, 20]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Spine label (visible from side) */}
      <mesh position={[0.376, 0.05, 0]}>
        <boxGeometry args={[0.01, 0.9, 0.18]} />
        <meshStandardMaterial 
          color={tape.spine}
          emissive={tape.spine}
          emissiveIntensity={hovered ? 0.15 : 0}
          roughness={0.5}
        />
      </mesh>
      
      {/* Special glow for About Me tape */}
      {tape.isSpecial && (
        <pointLight 
          position={[0, 0, 0.3]} 
          color="#E91E63" 
          intensity={hovered ? 0.5 : 0.2} 
          distance={1.5} 
          decay={2} 
        />
      )}
      
      {/* Tape label text - always visible */}
      <Html
        position={[0, 0.32, 0.13]}
        transform
        style={{ pointerEvents: "none" }}
      >
        <div style={{
          fontSize: "8px",
          fontFamily: "'VT323', monospace",
          color: tape.accent,
          textAlign: "center",
          width: "55px",
          letterSpacing: "1px",
          fontWeight: "bold",
          textShadow: tape.accent === "#FFFFFF" ? "0 0 2px rgba(0,0,0,0.5)" : "none",
        }}>
          {tape.label}
        </div>
      </Html>
      
      {/* Hover tooltip */}
      {hovered && !isInserting && (
        <Html position={[0, 0.8, 0.3]} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(0,0,0,0.95)",
            color: tape.color,
            padding: "10px 16px",
            borderRadius: "6px",
            fontSize: "15px",
            fontFamily: "'VT323', 'Courier New', monospace",
            whiteSpace: "nowrap",
            border: `2px solid ${tape.color}`,
            boxShadow: `0 0 20px ${tape.color}50`,
            textShadow: `0 0 10px ${tape.color}`,
          }}>
            ▶ {tape.label}
          </div>
        </Html>
      )}
    </group>
  );
};

// CRT TV Component - Enhanced
const CRTTV = ({ 
  selectedTape,
  isInserting,
  onClearSelection
}: { 
  selectedTape: typeof tapeData[0] | null;
  isInserting: boolean;
  onClearSelection: () => void;
}) => {
  const screenRef = useRef<THREE.MeshStandardMaterial>(null);
  const [showContent, setShowContent] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  
  // Show tracking distortion when inserting tape
  useEffect(() => {
    if (isInserting) {
      setShowTracking(true);
      setShowContent(false);
    } else if (selectedTape) {
      // Delay hiding tracking and showing content
      const trackingTimer = setTimeout(() => setShowTracking(false), 400);
      const contentTimer = setTimeout(() => setShowContent(true), 600);
      return () => {
        clearTimeout(trackingTimer);
        clearTimeout(contentTimer);
      };
    } else {
      setShowTracking(false);
      setShowContent(false);
    }
  }, [selectedTape, isInserting]);
  
  useFrame(({ clock }) => {
    if (screenRef.current) {
      if (!selectedTape) {
        // Static noise effect when idle
        const t = clock.elapsedTime;
        const flicker = 0.1 + Math.sin(t * 40) * 0.02 + Math.random() * 0.03;
        screenRef.current.emissiveIntensity = flicker;
      } else {
        screenRef.current.emissiveIntensity = 0.25;
      }
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* TV Body - chunky CRT with rounded feel */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[5, 4, 3.5]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.25} metalness={0.1} />
      </mesh>
      
      {/* Top vent */}
      <mesh position={[0, 2.01, 0]}>
        <boxGeometry args={[3, 0.02, 1.5]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.8} />
      </mesh>
      
      {/* Screen bezel - recessed */}
      <mesh position={[0, 0.2, 1.7]}>
        <boxGeometry args={[4.2, 3.2, 0.2]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.4} />
      </mesh>
      
      {/* Screen glass */}
      <mesh position={[0, 0.2, 1.81]} onClick={selectedTape ? onClearSelection : undefined}>
        <boxGeometry args={[3.6, 2.7, 0.05]} />
        <meshStandardMaterial 
          ref={screenRef}
          color={selectedTape ? "#08080C" : "#0A0A15"}
          emissive={selectedTape ? selectedTape.color : "#00AACC"}
          emissiveIntensity={selectedTape ? 0.25 : 0.1}
          roughness={0.05}
          metalness={0.3}
        />
      </mesh>
      
      {/* Static noise overlay when no tape */}
      {!selectedTape && !showTracking && (
        <group position={[0, 0.2, 1.84]}>
          <StaticNoise intensity={0.15} />
        </group>
      )}
      
      {/* Tracking distortion overlay */}
      {showTracking && (
        <Html position={[0, 0.2, 1.9]} transform style={{ pointerEvents: "none" }}>
          <div style={{
            width: "360px",
            height: "270px",
            background: "linear-gradient(0deg, #000 0%, transparent 10%, transparent 90%, #000 100%)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Tracking bars */}
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "3px",
                background: "rgba(255,255,255,0.3)",
                top: `${10 + i * 12 + Math.sin(Date.now() / 100 + i) * 5}%`,
                animation: `tracking ${0.1 + Math.random() * 0.1}s linear infinite`,
              }}/>
            ))}
            {/* "TRACKING" text */}
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              color: "#FFF",
              fontFamily: "'VT323', monospace",
              fontSize: "18px",
              textShadow: "2px 2px 0 #000",
              animation: "blink 0.5s infinite",
            }}>
              TRACKING...
            </div>
            <style>{`
              @keyframes tracking {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(10px); }
              }
            `}</style>
          </div>
        </Html>
      )}
      
      {/* Scanlines overlay */}
      <mesh position={[0, 0.2, 1.85]}>
        <planeGeometry args={[3.58, 2.68]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
      
      {/* Screen glare/reflection highlight */}
      <mesh position={[-0.8, 0.8, 1.86]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.03}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Screen content */}
      {selectedTape && showContent && (
        <Html
          position={[0, 0.2, 1.9]}
          transform
          style={{
            width: 380,
            height: 280,
            pointerEvents: "auto",
          }}
        >
          <div
            onClick={(e) => { e.stopPropagation(); onClearSelection(); }}
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,10,15,0.98) 100%)`,
              color: selectedTape.color,
              padding: "24px",
              fontFamily: "'VT323', 'Courier New', monospace",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: `inset 0 0 60px ${selectedTape.color}20`,
              animation: "fadeIn 0.5s ease-out",
            }}
          >
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
            `}</style>
            
            {/* REC indicator */}
            <div style={{
              position: "absolute",
              top: "12px",
              right: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#FF3333",
              animation: "blink 1s infinite",
            }}>
              <span style={{ 
                width: "8px", 
                height: "8px", 
                background: "#FF3333", 
                borderRadius: "50%",
                boxShadow: "0 0 10px #FF3333",
              }}/>
              REC
            </div>
            
            <div style={{ 
              fontSize: "28px", 
              fontWeight: "bold", 
              marginBottom: "6px",
              textShadow: `0 0 15px ${selectedTape.color}`,
            }}>
              {selectedTape.content.title}
            </div>
            
            {selectedTape.content.subtitle && (
              <div style={{
                fontSize: "16px",
                color: "#888",
                marginBottom: "16px",
                borderBottom: `1px solid ${selectedTape.color}40`,
                paddingBottom: "12px",
              }}>
                {selectedTape.content.subtitle}
              </div>
            )}
            
            <div style={{ 
              color: "#CCCCCC", 
              fontSize: "15px",
              lineHeight: "1.6",
              maxHeight: "100px",
              overflow: "hidden",
            }}>
              {selectedTape.content.description}
            </div>
            
            {selectedTape.content.links && (
              <div style={{ 
                marginTop: "20px", 
                fontSize: "13px", 
                color: "#666",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                {Object.entries(selectedTape.content.links).map(([key, value]) => (
                  <a
                    key={key}
                    href={typeof value === 'object' ? value.url : `mailto:${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: selectedTape.color,
                      textDecoration: "none",
                      padding: "4px 8px",
                      border: `1px solid ${selectedTape.color}50`,
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${selectedTape.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {key === 'twitter' && '𝕏'}
                    {key === 'linkedin' && '💼'}
                    {key === 'youtube' && '▶'}
                    {key === 'email' && '✉'}
                    {' '}
                    {typeof value === 'object' ? value.handle : value}
                  </a>
                ))}
              </div>
            )}
            
            <div style={{ 
              position: "absolute",
              bottom: "12px",
              left: "24px",
              fontSize: "11px",
              color: "#444",
            }}>
              CLICK TO EJECT
            </div>
            
            {/* Timecode - animated */}
            <TimecodeDisplay />
          </div>
        </Html>
      )}
      
      {/* VCR slot area */}
      <mesh position={[0, -1.65, 1.65]}>
        <boxGeometry args={[2, 0.35, 0.4]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.5} />
      </mesh>
      
      {/* VCR LED display */}
      <Html position={[-0.5, -1.6, 1.87]} transform style={{ pointerEvents: "none" }}>
        <div style={{
          background: "#000",
          padding: "3px 8px",
          borderRadius: "2px",
          fontFamily: "'VT323', monospace",
          fontSize: "10px",
          color: selectedTape ? "#00FF00" : "#333",
          letterSpacing: "1px",
          textShadow: selectedTape ? "0 0 5px #00FF00" : "none",
          minWidth: "80px",
          textAlign: "center",
        }}>
          {selectedTape ? `▶ ${selectedTape.label}` : "NO TAPE"}
        </div>
      </Html>
      
      {/* VCR slot opening */}
      <mesh position={[0, -1.6, 1.86]}>
        <boxGeometry args={[1.2, 0.08, 0.02]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>
      
      {/* VCR buttons */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x + 1.2, -1.6, 1.86]}>
          <boxGeometry args={[0.12, 0.06, 0.02]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
        </mesh>
      ))}
      
      {/* Control panel area */}
      <mesh position={[2.1, -0.3, 1.65]}>
        <boxGeometry args={[0.35, 1.8, 0.4]} />
        <meshStandardMaterial color="#0F0F0F" roughness={0.5} />
      </mesh>
      
      {/* Channel knobs */}
      <mesh position={[2.15, 0.3, 1.86]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 20]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[2.15, -0.2, 1.86]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 20]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.35} metalness={0.5} />
      </mesh>
      
      {/* Power LED */}
      <mesh position={[2.15, -0.9, 1.87]}>
        <boxGeometry args={[0.06, 0.025, 0.015]} />
        <meshStandardMaterial 
          color={selectedTape ? "#00FF00" : "#FF0000"} 
          emissive={selectedTape ? "#00FF00" : "#FF0000"}
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Brand text area */}
      <mesh position={[-1.5, -1.6, 1.86]}>
        <boxGeometry args={[0.8, 0.15, 0.01]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Screen glow */}
      <pointLight 
        position={[0, 0.2, 3]} 
        color={selectedTape ? selectedTape.color : "#00CCFF"} 
        intensity={selectedTape ? 3 : 1.5} 
        distance={10} 
        decay={2} 
      />
      
      {/* Ambient screen fill */}
      <rectAreaLight
        position={[0, 0.2, 2.5]}
        width={3}
        height={2.5}
        intensity={selectedTape ? 0.8 : 0.3}
        color={selectedTape ? selectedTape.color : "#00CCFF"}
      />
    </group>
  );
};

// TV Stand/Cabinet - Enhanced
const TVStand = () => (
  <group position={[0, -1.5, 0.3]}>
    {/* Main cabinet */}
    <mesh castShadow receiveShadow position={[0, 0, 0]}>
      <boxGeometry args={[6, 1, 2.2]} />
      <meshStandardMaterial color="#1A1008" roughness={0.75} />
    </mesh>
    
    {/* Cabinet top */}
    <mesh position={[0, 0.52, 0]}>
      <boxGeometry args={[6.1, 0.06, 2.3]} />
      <meshStandardMaterial color="#231810" roughness={0.6} />
    </mesh>
    
    {/* Cabinet doors */}
    <mesh position={[-1.4, 0, 1.11]}>
      <boxGeometry args={[1.8, 0.8, 0.02]} />
      <meshStandardMaterial color="#12090A" roughness={0.7} />
    </mesh>
    <mesh position={[1.4, 0, 1.11]}>
      <boxGeometry args={[1.8, 0.8, 0.02]} />
      <meshStandardMaterial color="#12090A" roughness={0.7} />
    </mesh>
    
    {/* Handles */}
    <mesh position={[-0.6, 0, 1.13]}>
      <boxGeometry args={[0.12, 0.03, 0.03]} />
      <meshStandardMaterial color="#C9A227" roughness={0.25} metalness={0.8} />
    </mesh>
    <mesh position={[0.6, 0, 1.13]}>
      <boxGeometry args={[0.12, 0.03, 0.03]} />
      <meshStandardMaterial color="#C9A227" roughness={0.25} metalness={0.8} />
    </mesh>
    
    {/* Legs */}
    {[[-2.7, -0.6], [2.7, -0.6]].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0]} castShadow>
        <boxGeometry args={[0.15, 0.3, 2]} />
        <meshStandardMaterial color="#0F0808" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

// Tape Shelf Component - Single row for now
const TapeShelf = ({ 
  selectedTapeId,
  insertingTapeId,
  onSelectTape 
}: { 
  selectedTapeId: string | null;
  insertingTapeId: string | null;
  onSelectTape: (tape: typeof tapeData[0]) => void;
}) => {
  return (
    <group position={[0, -3.2, 1.5]}>
      {/* Shelf unit back */}
      <mesh position={[0, 0.5, -0.4]} receiveShadow>
        <boxGeometry args={[5, 2, 0.1]} />
        <meshStandardMaterial color="#1A1008" roughness={0.85} />
      </mesh>
      
      {/* Shelf surface */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.12, 0.9]} />
        <meshStandardMaterial color="#2A1A10" roughness={0.7} />
      </mesh>
      
      {/* Side panels */}
      <mesh position={[-2.45, 0.5, 0]}>
        <boxGeometry args={[0.1, 1.8, 0.9]} />
        <meshStandardMaterial color="#1A1008" roughness={0.8} />
      </mesh>
      <mesh position={[2.45, 0.5, 0]}>
        <boxGeometry args={[0.1, 1.8, 0.9]} />
        <meshStandardMaterial color="#1A1008" roughness={0.8} />
      </mesh>
      
      {/* Tapes - centered */}
      {tapeData.map((tape, i) => (
        <VHSTape
          key={tape.id}
          position={[-1.35 + i * 0.9, 1.25, 0]}
          tape={tape}
          isSelected={selectedTapeId === tape.id}
          isInserting={insertingTapeId === tape.id}
          onSelect={() => onSelectTape(tape)}
        />
      ))}
    </group>
  );
};

// Floating dust particles
const DustParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 + 3;
  }
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        pos[idx + 1] += Math.sin(clock.elapsedTime * 0.3 + i) * 0.001;
        pos[idx] += Math.cos(clock.elapsedTime * 0.2 + i * 0.5) * 0.0005;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#FFE4C4"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

// Environment elements
const Environment = () => (
  <group>
    {/* Floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#0D0A08" roughness={0.92} />
    </mesh>
    
    {/* Back wall */}
    <mesh position={[0, 4, -5]} receiveShadow>
      <planeGeometry args={[40, 20]} />
      <meshStandardMaterial color="#0A0806" roughness={0.95} />
    </mesh>
    
    {/* Subtle floor reflection plane */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.49, 2]}>
      <planeGeometry args={[10, 8]} />
      <meshStandardMaterial 
        color="#000000" 
        roughness={0.7} 
        metalness={0.3}
        transparent
        opacity={0.3}
      />
    </mesh>
  </group>
);

// Scene content
const SceneContent = () => {
  const [selectedTape, setSelectedTape] = useState<typeof tapeData[0] | null>(null);
  const [insertingTapeId, setInsertingTapeId] = useState<string | null>(null);

  const handleSelectTape = (tape: typeof tapeData[0]) => {
    if (selectedTape?.id === tape.id) {
      // Eject
      setSelectedTape(null);
      setInsertingTapeId(null);
    } else {
      // Insert new tape
      setInsertingTapeId(tape.id);
      setTimeout(() => {
        setSelectedTape(tape);
        setInsertingTapeId(null);
      }, 600);
    }
  };

  const handleClearSelection = () => {
    setSelectedTape(null);
    setInsertingTapeId(null);
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        handleClearSelection();
      }
      // Arrow keys to browse tapes
      if (!selectedTape && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        // Could implement tape focusing here
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTape]);

  return (
    <>
      {/* Dark ambient environment */}
      <color attach="background" args={["#050403"]} />
      <fog attach="fog" args={["#050403", 12, 35]} />
      
      {/* Main lighting */}
      <ambientLight intensity={0.08} color="#FFF8F0" />
      
      {/* Key light - from above */}
      <spotLight 
        position={[0, 10, 6]} 
        angle={0.5} 
        penumbra={0.6} 
        intensity={0.6} 
        color="#FFF5E8"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Fill light - warm side */}
      <pointLight position={[-8, 3, 3]} color="#4A3020" intensity={0.25} distance={20} />
      <pointLight position={[8, 3, 3]} color="#4A3020" intensity={0.25} distance={20} />
      
      {/* Backlight - subtle rim */}
      <pointLight position={[0, 2, -4]} color="#1A1520" intensity={0.3} distance={15} />
      
      {/* Main elements */}
      <CRTTV 
        selectedTape={selectedTape}
        isInserting={!!insertingTapeId}
        onClearSelection={handleClearSelection}
      />
      <TVStand />
      <TapeShelf 
        selectedTapeId={selectedTape?.id || null}
        insertingTapeId={insertingTapeId}
        onSelectTape={handleSelectTape}
      />
      <Environment />
      <DustParticles />
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={7}
        maxDistance={18}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, -0.5, 0]}
        rotateSpeed={0.5}
      />
    </>
  );
};

// Loading screen - VHS tracking effect
const LoadingScreen = () => (
  <Html center>
    <div style={{
      fontFamily: "'VT323', monospace",
      color: "#00CCFF",
      textAlign: "center",
      position: "relative",
      width: "300px",
      height: "200px",
      background: "#0A0A0A",
      border: "3px solid #1A1A1A",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* VHS tracking lines */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,204,255,0.03) 2px,
          rgba(0,204,255,0.03) 4px
        )`,
        animation: "scanlines 8s linear infinite",
        pointerEvents: "none",
      }}/>
      
      {/* Static noise overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.8\" /></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" /></svg>')",
        animation: "noise 0.2s steps(10) infinite",
        pointerEvents: "none",
      }}/>
      
      <div style={{ 
        fontSize: "64px",
        marginBottom: "10px",
        animation: "pulse 1.5s ease-in-out infinite",
        filter: "drop-shadow(0 0 10px #00CCFF)",
      }}>📼</div>
      
      <div style={{ fontSize: "24px", letterSpacing: "4px" }}>LOADING</div>
      
      <div style={{
        marginTop: "15px",
        width: "150px",
        height: "4px",
        background: "#1A1A1A",
        borderRadius: "2px",
        overflow: "hidden",
      }}>
        <div style={{
          width: "50%",
          height: "100%",
          background: "linear-gradient(90deg, #00CCFF, #00FFFF)",
          animation: "loading 1.5s ease-in-out infinite",
          borderRadius: "2px",
        }}/>
      </div>
      
      <div style={{
        position: "absolute",
        bottom: "10px",
        right: "15px",
        fontSize: "12px",
        color: "#333",
      }}>
        PLAY ▶
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-1%, 1%); }
          40% { transform: translate(1%, -1%); }
          50% { transform: translate(-1%, 0); }
          60% { transform: translate(1%, 0); }
          70% { transform: translate(0, 1%); }
          80% { transform: translate(0, -1%); }
          90% { transform: translate(1%, 1%); }
        }
      `}</style>
    </div>
  </Html>
);

// Main Scene
const Scene = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#050403" }}>
      <Canvas 
        camera={{ position: [0, 1, 12], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <SceneContent />
        </Suspense>
      </Canvas>
      
      {/* Branding */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          fontFamily: "'VT323', monospace",
          zIndex: 1000,
        }}
      >
        <div style={{ 
          fontSize: "32px", 
          color: "#FFFFFF",
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          letterSpacing: "2px",
        }}>
          JAMES RINDOS
        </div>
        <div style={{ 
          fontSize: "14px", 
          color: "#666", 
          marginTop: "6px",
          letterSpacing: "4px",
        }}>
          CREATIVE PORTFOLIO
        </div>
      </div>
      
      {/* Instructions - hide on mobile */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace",
          fontSize: "14px",
          color: "#444",
          textAlign: "center",
          letterSpacing: "1px",
        }}
        className="desktop-only"
      >
        SELECT A TAPE TO PLAY • DRAG TO ORBIT • SCROLL TO ZOOM • ESC TO EJECT
      </div>
      
      {/* Mobile touch hint */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace",
          fontSize: "12px",
          color: "#444",
          textAlign: "center",
          display: "none",
        }}
        className="mobile-only"
      >
        TAP A TAPE • PINCH TO ZOOM
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
      `}</style>
      
      {/* Social links */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          fontFamily: "'VT323', monospace",
          fontSize: "14px",
          display: "flex",
          gap: "16px",
        }}
      >
        <a href="https://twitter.com/slimjimm318" target="_blank" rel="noopener noreferrer" 
           style={{ color: "#444", textDecoration: "none", transition: "color 0.2s" }}
           onMouseEnter={(e) => e.currentTarget.style.color = "#1DA1F2"}
           onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
          𝕏
        </a>
        <a href="https://linkedin.com/in/james-rindos-489a29245" target="_blank" rel="noopener noreferrer"
           style={{ color: "#444", textDecoration: "none", transition: "color 0.2s" }}
           onMouseEnter={(e) => e.currentTarget.style.color = "#0077B5"}
           onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
          in
        </a>
        <a href="https://youtube.com/@jackacetalks" target="_blank" rel="noopener noreferrer"
           style={{ color: "#444", textDecoration: "none", transition: "color 0.2s" }}
           onMouseEnter={(e) => e.currentTarget.style.color = "#FF0000"}
           onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
          ▶
        </a>
      </div>
    </div>
  );
};

export default Scene;
