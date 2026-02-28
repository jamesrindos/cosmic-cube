import { useState } from "react";
import { Html } from "@react-three/drei";

// ============================================
// WINDOWS XP STYLE VM DESKTOP
// Renders on the gaming monitor
// ============================================

interface WindowState {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
}

const desktopIcons = [
  { id: "steam", icon: "🎮", label: "Steam", x: 10, y: 10 },
  { id: "ideas", icon: "📝", label: "ideas.txt", x: 10, y: 70 },
  { id: "twitter", icon: "🐦", label: "Twitter", x: 10, y: 130 },
  { id: "instagram", icon: "📸", label: "Instagram", x: 10, y: 190 },
  { id: "linkedin", icon: "💼", label: "LinkedIn", x: 70, y: 10 },
  { id: "youtube", icon: "📺", label: "YouTube", x: 70, y: 70 },
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
  twitter: { url: "https://twitter.com/slimjimm318", handle: "@slimjimm318" },
  instagram: { url: "https://instagram.com/jamesrindos", handle: "@jamesrindos" },
  linkedin: { url: "https://linkedin.com/in/james-rindos-489a29245", name: "James Rindos" },
  youtube: { url: "https://youtube.com/@jackacetalks", channel: "@jackacetalks" },
};

// Window component
const Window = ({ 
  title, 
  children, 
  onClose, 
  position 
}: { 
  title: string; 
  children: React.ReactNode; 
  onClose: () => void;
  position: { x: number; y: number };
}) => (
  <div
    style={{
      position: "absolute",
      left: position.x,
      top: position.y,
      width: 180,
      background: "linear-gradient(180deg, #0A246A 0%, #A6CAF0 3%, #A6CAF0 97%, #0A246A 100%)",
      border: "2px solid #0A246A",
      borderRadius: "6px 6px 0 0",
      boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
      fontFamily: "'Tahoma', sans-serif",
      fontSize: "9px",
      color: "#000",
      zIndex: 100,
    }}
  >
    {/* Title bar */}
    <div
      style={{
        background: "linear-gradient(180deg, #0A246A 0%, #2B5DAA 50%, #0A246A 100%)",
        color: "white",
        padding: "2px 4px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "9px",
        borderRadius: "4px 4px 0 0",
      }}
    >
      <span>{title}</span>
      <button
        onClick={onClose}
        style={{
          background: "linear-gradient(180deg, #E5735F 0%, #C42B1C 100%)",
          border: "1px solid #3D0700",
          borderRadius: "3px",
          color: "white",
          width: 16,
          height: 14,
          cursor: "pointer",
          fontSize: "8px",
          lineHeight: "10px",
        }}
      >
        ✕
      </button>
    </div>
    {/* Content area */}
    <div
      style={{
        background: "#ECE9D8",
        padding: "6px",
        minHeight: 80,
        maxHeight: 120,
        overflow: "auto",
        fontSize: "8px",
        whiteSpace: "pre-wrap",
        fontFamily: "'Lucida Console', monospace",
      }}
    >
      {children}
    </div>
  </div>
);

// Desktop Icon component
const DesktopIcon = ({
  icon,
  label,
  x,
  y,
  onClick,
}: {
  icon: string;
  label: string;
  x: number;
  y: number;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 50,
      textAlign: "center",
      cursor: "pointer",
      padding: "4px",
      borderRadius: "2px",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(100, 150, 255, 0.3)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <div style={{ fontSize: "20px" }}>{icon}</div>
    <div
      style={{
        color: "white",
        fontSize: "8px",
        textShadow: "1px 1px 1px black",
        marginTop: "2px",
      }}
    >
      {label}
    </div>
  </div>
);

// Main VM Desktop component
export const VMDesktop = ({ position }: { position: [number, number, number] }) => {
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);

  const openWindow = (id: string) => {
    // Don't open if already open
    if (openWindows.find((w) => w.id === id)) return;

    let content: React.ReactNode;
    let title: string;

    switch (id) {
      case "ideas":
        title = "ideas.txt - Notepad";
        content = ideasContent;
        break;
      case "steam":
        title = "Steam";
        content = steamContent;
        break;
      case "twitter":
        title = "Twitter";
        content = (
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>🐦 Twitter</div>
            <div>{socialLinks.twitter.handle}</div>
            <div style={{ color: "#1DA1F2", fontSize: "7px", marginTop: 4 }}>
              {socialLinks.twitter.url}
            </div>
          </div>
        );
        break;
      case "instagram":
        title = "Instagram";
        content = (
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>📸 Instagram</div>
            <div>{socialLinks.instagram.handle}</div>
            <div style={{ color: "#E1306C", fontSize: "7px", marginTop: 4 }}>
              {socialLinks.instagram.url}
            </div>
          </div>
        );
        break;
      case "linkedin":
        title = "LinkedIn";
        content = (
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>💼 LinkedIn</div>
            <div>{socialLinks.linkedin.name}</div>
            <div style={{ color: "#0077B5", fontSize: "7px", marginTop: 4 }}>
              {socialLinks.linkedin.url}
            </div>
          </div>
        );
        break;
      case "youtube":
        title = "YouTube";
        content = (
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>📺 YouTube</div>
            <div>{socialLinks.youtube.channel}</div>
            <div style={{ color: "#FF0000", fontSize: "7px", marginTop: 4 }}>
              {socialLinks.youtube.url}
            </div>
          </div>
        );
        break;
      default:
        return;
    }

    setOpenWindows((prev) => [
      ...prev,
      {
        id,
        title,
        content,
        position: { x: 60 + prev.length * 15, y: 30 + prev.length * 15 },
      },
    ]);
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <Html
      position={position}
      transform
      occlude
      style={{
        width: 280,
        height: 170,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #245EDC 0%, #3A7BD5 50%, #00D2FF 100%)",
          borderRadius: "4px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Desktop icons */}
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon.icon}
            label={icon.label}
            x={icon.x}
            y={icon.y}
            onClick={() => openWindow(icon.id)}
          />
        ))}

        {/* Open windows */}
        {openWindows.map((window) => (
          <Window
            key={window.id}
            title={window.title}
            position={window.position}
            onClose={() => closeWindow(window.id)}
          >
            {window.content}
          </Window>
        ))}

        {/* Taskbar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 22,
            background: "linear-gradient(180deg, #3168D5 0%, #4E91D7 3%, #3168D5 97%, #15419C 100%)",
            borderTop: "1px solid #0A246A",
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
          }}
        >
          {/* Start button */}
          <div
            style={{
              background: "linear-gradient(180deg, #3C8C38 0%, #49B749 50%, #3C8C38 100%)",
              border: "1px solid #2D6B2D",
              borderRadius: "4px",
              padding: "2px 8px",
              color: "white",
              fontSize: "9px",
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
              fontSize: "9px",
              padding: "0 6px",
              background: "linear-gradient(180deg, #0F8CDB 0%, #0F8CDB 100%)",
              borderLeft: "1px solid #15419C",
            }}
          >
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </Html>
  );
};
