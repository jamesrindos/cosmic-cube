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

// Interactive elements legend - shows clickable items
export const InteractiveLegend = () => {
  const [expanded, setExpanded] = useState(true); // Start expanded

  const items = [
    { emoji: "📼", name: "VHS Tapes", action: "Click → play on TV" },
    { emoji: "📺", name: "TV", action: "Click → stop video" },
    { emoji: "🧊", name: "Rubik's Cube", action: "Click → solve" },
    { emoji: "🎸", name: "Guitar", action: "Click → strum" },
    { emoji: "💻", name: "Monitor", action: "Windows XP desktop" },
    { emoji: "📚", name: "Books", action: "Hover → info" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "rgba(13,13,15,0.95)",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(123, 104, 238, 0.3)",
        backdropFilter: "blur(10px)",
        fontFamily: "'VT323', monospace",
        fontSize: "13px",
        color: "#FFFFFF",
        zIndex: 1000,
        maxWidth: "220px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
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
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "100%",
        }}
      >
        <span style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
        Interactive Items
      </button>
      
      {expanded && (
        <div style={{ marginTop: "10px" }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
                fontSize: "12px",
                padding: "4px 0",
                borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <span style={{ fontSize: "14px" }}>{item.emoji}</span>
              <span style={{ color: "#DDD", flex: 1 }}>{item.name}</span>
              <span style={{ 
                color: "#7B68EE", 
                fontSize: "10px",
                background: "rgba(123, 104, 238, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                {item.action}
              </span>
            </div>
          ))}
          <div style={{ 
            marginTop: "10px", 
            paddingTop: "10px", 
            borderTop: "1px solid rgba(255,255,255,0.1)",
            fontSize: "10px",
            color: "#666",
          }}>
            💡 Use keyboard 1-5 to navigate rooms
          </div>
        </div>
      )}
    </div>
  );
};
