import { useState, useEffect } from "react";

// Unobtrusive help overlay that fades in/out
export const HelpOverlay = () => {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Don't render if dismissed
  if (dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(13,13,15,0.9)",
        padding: "12px 24px",
        borderRadius: "8px",
        border: "1px solid #7B68EE",
        fontFamily: "'VT323', monospace",
        fontSize: "14px",
        color: "#FFFFFF",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-out",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
      onMouseEnter={() => setVisible(true)}
    >
      <div>
        <div style={{ color: "#7B68EE", marginBottom: "4px" }}>
          🎮 Interactive Apartment
        </div>
        <div style={{ fontSize: "12px", color: "#888" }}>
          Click objects to interact • Drag to orbit • Scroll to zoom
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "transparent",
          border: "1px solid #444",
          borderRadius: "4px",
          color: "#666",
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        ✕
      </button>
    </div>
  );
};

// Interactive elements legend (optional, for debugging)
export const InteractiveLegend = () => {
  const [expanded, setExpanded] = useState(false);

  const items = [
    { emoji: "🧊", name: "Rubik's Cube", action: "Click to solve" },
    { emoji: "🎸", name: "Guitar", action: "Click to strum" },
    { emoji: "📼", name: "VHS Tapes", action: "Click to play on TV" },
    { emoji: "📺", name: "TV", action: "Click to stop playing" },
    { emoji: "📚", name: "Invincible Book", action: "Hover for info" },
    { emoji: "🎬", name: "Letterboxd", action: "Click for reviews" },
    { emoji: "💻", name: "Monitor", action: "XP Desktop - click icons" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "rgba(13,13,15,0.9)",
        padding: expanded ? "12px" : "8px",
        borderRadius: "8px",
        border: "1px solid #333",
        fontFamily: "'VT323', monospace",
        fontSize: "12px",
        color: "#FFFFFF",
        zIndex: 1000,
        maxWidth: "200px",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "transparent",
          border: "none",
          color: "#7B68EE",
          cursor: "pointer",
          padding: 0,
          fontSize: "14px",
        }}
      >
        {expanded ? "▼" : "▶"} Interactive Items
      </button>
      
      {expanded && (
        <div style={{ marginTop: "8px" }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
                fontSize: "11px",
              }}
            >
              <span>{item.emoji}</span>
              <span style={{ color: "#AAA" }}>{item.name}</span>
              <span style={{ color: "#666", marginLeft: "auto" }}>
                {item.action}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
