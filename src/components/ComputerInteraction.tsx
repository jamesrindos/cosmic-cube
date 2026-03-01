import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// COMPUTER DESK SETUP - INTERACTIVE
// White outline on hover, click to zoom INTO monitor
// ============================================

interface ComputerSetupProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  onEnterDesktop: () => void;
}

export const ComputerSetup = ({ position, rotation = [0, 0, 0], onEnterDesktop }: ComputerSetupProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  const handlePointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };
  
  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onEnterDesktop();
  };

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Desktop */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.5, 0.08, 1]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Desk legs */}
      {[[-1.1, -0.4], [-1.1, 0.4], [1.1, -0.4], [1.1, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      ))}

      {/* CENTER MONITOR - main interactive element */}
      <group position={[0, 1.25, -0.4]}>
        {/* Monitor frame */}
        <mesh>
          <boxGeometry args={[0.9, 0.55, 0.04]} />
          <meshStandardMaterial color="#0A0A0F" />
        </mesh>
        
        {/* WHITE OUTLINE when hovered - indicates clickable */}
        {isHovered && (
          <>
            {/* Top edge */}
            <mesh position={[0, 0.28, 0.025]}>
              <boxGeometry args={[0.92, 0.02, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
            </mesh>
            {/* Bottom edge */}
            <mesh position={[0, -0.28, 0.025]}>
              <boxGeometry args={[0.92, 0.02, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
            </mesh>
            {/* Left edge */}
            <mesh position={[-0.46, 0, 0.025]}>
              <boxGeometry args={[0.02, 0.56, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
            </mesh>
            {/* Right edge */}
            <mesh position={[0.46, 0, 0.025]}>
              <boxGeometry args={[0.02, 0.56, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
            </mesh>
            
            {/* Click indicator */}
            <Html position={[0, 0.4, 0.1]} style={{ pointerEvents: "none" }}>
              <div style={{
                background: "rgba(0,0,0,0.9)",
                color: "#FFFFFF",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "'VT323', monospace",
                whiteSpace: "nowrap",
                border: "1px solid #FFFFFF",
              }}>
                Click to enter desktop
              </div>
            </Html>
          </>
        )}
        
        {/* Screen - purple glow idle */}
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.85, 0.5, 0.001]} />
          <meshStandardMaterial 
            color="#0A0A0F" 
            emissive={isHovered ? "#FFFFFF" : "#7B68EE"} 
            emissiveIntensity={isHovered ? 0.15 : 0.3} 
          />
        </mesh>
        
        {/* Monitor stand */}
        <mesh position={[0, -0.3, 0.05]}>
          <boxGeometry args={[0.15, 0.05, 0.1]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>
      
      {/* LEFT MONITOR */}
      <mesh position={[-0.85, 1.2, -0.38]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.7, 0.45, 0.04]} />
        <meshStandardMaterial color="#0A0A0F" emissive="#7B68EE" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.8, 0.95, -0.33]}>
        <boxGeometry args={[0.12, 0.05, 0.08]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* RIGHT MONITOR */}
      <mesh position={[0.85, 1.2, -0.38]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.7, 0.45, 0.04]} />
        <meshStandardMaterial color="#0A0A0F" emissive="#7B68EE" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.8, 0.95, -0.33]}>
        <boxGeometry args={[0.12, 0.05, 0.08]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>

      {/* RGB lighting on both sides */}
      <pointLight position={[-1.5, 1.2, -0.3]} color="#7B68EE" intensity={0.6} distance={4} decay={2} />
      <pointLight position={[1.5, 1.2, -0.3]} color="#7B68EE" intensity={0.6} distance={4} decay={2} />
      <pointLight position={[0, 1.2, 0.2]} color="#7B68EE" intensity={0.8} distance={4} decay={2} />

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
      <mesh position={[0, 0.835, 0.15]}>
        <boxGeometry args={[0.42, 0.01, 0.12]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <pointLight position={[0, 0.81, 0.15]} color="#7B68EE" intensity={0.2} distance={0.5} decay={2} />
      
      {/* Gaming mouse */}
      <mesh position={[0.35, 0.815, 0.2]}>
        <boxGeometry args={[0.06, 0.025, 0.1]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.35, 0.83, 0.18]}>
        <boxGeometry args={[0.02, 0.005, 0.04]} />
        <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};

// ============================================
// FULLSCREEN DESKTOP VIEW
// Renders when user clicks computer
// ============================================

interface FullscreenDesktopProps {
  onExit: () => void;
}

const desktopIcons = [
  { id: "steam", icon: "🎮", label: "Steam" },
  { id: "ideas", icon: "📝", label: "ideas.txt" },
  { id: "linkedin", icon: "💼", label: "LinkedIn" },
  { id: "youtube", icon: "📺", label: "YouTube" },
];

const ideasContent = `ideas.txt
---------

// mantras
- figure it out as you go
- good enough to ship is good enough
- stay curious, stay competitive
- most problems are just puzzles with missing pieces
- you don't have to have it all figured out

// ideas i keep coming back to
- prediction market for creative briefs (will this ad hit?)
- something with golf. idk what yet
- letterboxd but for ads

// things i want to learn
- writing
- robotics
- applied mathematics
- drone op

// random
- why do i play league when it makes me angry
- social media subcultures based on where you grew up
- dancing with no stars 3/28/2026`;

const steamContent = `Recently Played:
━━━━━━━━━━━━━━━━
🎯 Overwatch 2    - 847 hrs
⚔️ League         - 2,341 hrs  
🎱 Ball X Pit     - 12 hrs
🚗 Rocket League  - 234 hrs
⛏️ Minecraft      - 156 hrs

Status: 🟢 Online
Friends Online: 3`;

const socialLinks = {
  linkedin: { url: "https://linkedin.com/in/james-rindos-489a29245", name: "James Rindos" },
  youtube: { url: "https://youtube.com/@jackacetalks", channel: "@jackacetalks" },
};

export const FullscreenDesktop = ({ onExit }: FullscreenDesktopProps) => {
  const [openWindow, setOpenWindow] = useState<string | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
  
  // Update clock
  useFrame(() => {
    const newTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (newTime !== time) setTime(newTime);
  });
  
  const getWindowContent = (id: string) => {
    switch (id) {
      case "ideas":
        return { title: "ideas.txt - Notepad", content: ideasContent };
      case "steam":
        return { title: "Steam", content: steamContent };
      case "linkedin":
        return { 
          title: "LinkedIn", 
          content: `💼 LinkedIn\n\n${socialLinks.linkedin.name}\n\n${socialLinks.linkedin.url}`,
          isLink: true,
          url: socialLinks.linkedin.url
        };
      case "youtube":
        return { 
          title: "YouTube", 
          content: `📺 YouTube\n\n${socialLinks.youtube.channel}\n\n${socialLinks.youtube.url}`,
          isLink: true,
          url: socialLinks.youtube.url
        };
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #245EDC 0%, #3A7BD5 50%, #00D2FF 100%)",
        zIndex: 10000,
        fontFamily: "'Tahoma', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Exit button - top right */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(0,0,0,0.6)",
          border: "2px solid #FFFFFF",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontFamily: "'VT323', monospace",
          zIndex: 10001,
        }}
      >
        ESC to exit
      </button>
      
      {/* Desktop icons */}
      <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "20px", width: "120px" }}>
        {desktopIcons.map((icon) => (
          <div
            key={icon.id}
            onClick={() => setOpenWindow(icon.id)}
            style={{
              textAlign: "center",
              cursor: "pointer",
              padding: "10px",
              borderRadius: "4px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(100, 150, 255, 0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ fontSize: "48px" }}>{icon.icon}</div>
            <div style={{ 
              color: "white", 
              fontSize: "14px", 
              textShadow: "1px 1px 2px black",
              marginTop: "8px",
            }}>
              {icon.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Open window */}
      {openWindow && (() => {
        const windowData = getWindowContent(openWindow);
        if (!windowData) return null;
        
        return (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              maxHeight: "400px",
              background: "#ECE9D8",
              border: "3px solid #0A246A",
              borderRadius: "8px 8px 0 0",
              boxShadow: "4px 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                background: "linear-gradient(180deg, #0A246A 0%, #2B5DAA 50%, #0A246A 100%)",
                color: "white",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "14px",
                borderRadius: "6px 6px 0 0",
              }}
            >
              <span>{windowData.title}</span>
              <button
                onClick={() => setOpenWindow(null)}
                style={{
                  background: "linear-gradient(180deg, #E5735F 0%, #C42B1C 100%)",
                  border: "1px solid #3D0700",
                  borderRadius: "4px",
                  color: "white",
                  width: 24,
                  height: 20,
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div
              style={{
                padding: "16px",
                maxHeight: "300px",
                overflow: "auto",
                fontSize: "13px",
                whiteSpace: "pre-wrap",
                fontFamily: "'Lucida Console', monospace",
                lineHeight: "1.5",
              }}
            >
              {windowData.content}
              {windowData.isLink && windowData.url && (
                <a
                  href={windowData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    marginTop: "16px",
                    color: "#0066CC",
                    textDecoration: "underline",
                  }}
                >
                  Open in new tab →
                </a>
              )}
            </div>
          </div>
        );
      })()}
      
      {/* Taskbar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          background: "linear-gradient(180deg, #3168D5 0%, #4E91D7 3%, #3168D5 97%, #15419C 100%)",
          borderTop: "2px solid #0A246A",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
        }}
      >
        {/* Start button */}
        <div
          style={{
            background: "linear-gradient(180deg, #3C8C38 0%, #49B749 50%, #3C8C38 100%)",
            border: "2px solid #2D6B2D",
            borderRadius: "6px",
            padding: "6px 16px",
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
            fontStyle: "italic",
            cursor: "pointer",
          }}
        >
          🪟 start
        </div>
        
        {/* Time */}
        <div
          style={{
            marginLeft: "auto",
            color: "white",
            fontSize: "14px",
            padding: "0 12px",
            background: "linear-gradient(180deg, #0F8CDB 0%, #0F8CDB 100%)",
            borderLeft: "2px solid #15419C",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
};
