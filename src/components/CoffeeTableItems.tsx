import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Interactive Invincible Book
export const InvincibleBook = ({ position }: { position: [number, number, number] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Subtle float when hovered
      const targetY = isHovered ? 0.02 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      {/* Book */}
      <mesh rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.45]} />
        <meshStandardMaterial 
          color="#FFD700"
          emissive={isHovered ? "#FFD700" : "#000000"}
          emissiveIntensity={isHovered ? 0.1 : 0}
        />
      </mesh>
      {/* Red accent on cover */}
      <mesh position={[0, 0.022, 0]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.002, 0.25]} />
        <meshStandardMaterial color="#E74C3C" />
      </mesh>

      {/* Tooltip */}
      {isHovered && (
        <Html position={[0, 0.15, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.9)",
              color: "#FFD700",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontFamily: "'VT323', monospace",
              whiteSpace: "nowrap",
              border: "1px solid #FFD700",
            }}
          >
            📚 Invincible - Coffee Table Book
          </div>
        </Html>
      )}

      {/* Hover glow */}
      {isHovered && (
        <pointLight position={[0, 0.1, 0]} color="#FFD700" intensity={0.2} distance={0.5} decay={2} />
      )}
    </group>
  );
};

// Interactive Letterboxd Notebook
export const LetterboxdNotebook = ({ position }: { position: [number, number, number] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  const recentReviews = [
    { film: "Bugonia", rating: "★★★★★" },
    { film: "Avatar: Fire and Ash", rating: "★★★★" },
    { film: "Anaconda (2025)", rating: "★★★" },
    { film: "Woman of the Hour", rating: "★★½" },
  ];

  useFrame(() => {
    if (groupRef.current) {
      const targetY = isHovered ? 0.02 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => {
        setIsHovered(false);
        setShowReviews(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setShowReviews(!showReviews);
      }}
    >
      {/* Notebook */}
      <mesh rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.18, 0.025, 0.25]} />
        <meshStandardMaterial 
          color="#1A1A2E"
          emissive={isHovered ? "#FF8000" : "#000000"}
          emissiveIntensity={isHovered ? 0.1 : 0}
        />
      </mesh>
      {/* Orange Letterboxd stripe */}
      <mesh position={[0, 0.014, 0]} rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.04, 0.002, 0.24]} />
        <meshStandardMaterial color="#FF8000" />
      </mesh>
      {/* Pen */}
      <mesh position={[0.12, 0.04, 0]} rotation={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>

      {/* Tooltip or Reviews panel */}
      {isHovered && (
        <Html position={[0, 0.2, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(20,24,28,0.95)",
              color: "#FFFFFF",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "10px",
              fontFamily: "system-ui, sans-serif",
              width: showReviews ? "160px" : "auto",
              border: "1px solid #FF8000",
            }}
          >
            {!showReviews ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#00E054" }}>●</span>
                <span style={{ color: "#40BCF4" }}>●</span>
                <span style={{ color: "#FF8000" }}>●</span>
                <span style={{ marginLeft: "4px" }}>Letterboxd</span>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#FF8000" }}>
                  Recent Watches
                </div>
                {recentReviews.map((review, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "3px",
                      fontSize: "9px",
                    }}
                  >
                    <span>{review.film}</span>
                    <span style={{ color: "#00E054" }}>{review.rating}</span>
                  </div>
                ))}
                <div style={{ fontSize: "8px", marginTop: "6px", color: "#99AABB" }}>
                  @slimjim318
                </div>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Hover glow */}
      {isHovered && (
        <pointLight position={[0, 0.1, 0]} color="#FF8000" intensity={0.15} distance={0.4} decay={2} />
      )}
    </group>
  );
};
