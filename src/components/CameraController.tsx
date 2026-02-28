import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Camera presets for each room/view
export const CAMERA_PRESETS = {
  overview: {
    position: new THREE.Vector3(20, 18, 10),
    target: new THREE.Vector3(4, 0, -12),
    name: "Overview",
    key: "1",
  },
  livingRoom: {
    position: new THREE.Vector3(14, 6, 4),
    target: new THREE.Vector3(5, 1, -4),
    name: "Living Room",
    key: "2",
  },
  kitchen: {
    position: new THREE.Vector3(0, 5, -6),
    target: new THREE.Vector3(6, 1, -10),
    name: "Kitchen",
    key: "3",
  },
  hallway: {
    position: new THREE.Vector3(-3, 4, -13),
    target: new THREE.Vector3(4, 1, -14.5),
    name: "Hallway",
    key: "4",
  },
  bedroom: {
    position: new THREE.Vector3(14, 7, -16),
    target: new THREE.Vector3(4, 1, -21),
    name: "Bedroom",
    key: "5",
  },
} as const;

export type CameraPreset = keyof typeof CAMERA_PRESETS;

interface CameraControllerProps {
  activePreset: CameraPreset;
  onPresetChange?: (preset: CameraPreset) => void;
  transitionDuration?: number;
}

export const CameraController = ({
  activePreset,
  transitionDuration = 1.5,
}: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);
  const transitionProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());

  // Initialize current look-at
  useEffect(() => {
    const preset = CAMERA_PRESETS[activePreset];
    camera.position.copy(preset.position);
    currentLookAt.current.copy(preset.target);
    camera.lookAt(preset.target);
  }, []);

  // Handle preset changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[activePreset];
    
    // Store starting positions
    startPosition.current.copy(camera.position);
    startLookAt.current.copy(currentLookAt.current);
    
    // Set targets
    targetPosition.current.copy(preset.position);
    targetLookAt.current.copy(preset.target);
    
    // Start transition
    isTransitioning.current = true;
    transitionProgress.current = 0;
  }, [activePreset, camera]);

  // Animate camera
  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    // Ease-in-out progress
    transitionProgress.current += delta / transitionDuration;
    
    if (transitionProgress.current >= 1) {
      transitionProgress.current = 1;
      isTransitioning.current = false;
    }

    // Smooth easing function
    const t = transitionProgress.current;
    const ease = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Interpolate position
    camera.position.lerpVectors(
      startPosition.current,
      targetPosition.current,
      ease
    );

    // Interpolate look-at
    currentLookAt.current.lerpVectors(
      startLookAt.current,
      targetLookAt.current,
      ease
    );
    
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

// Navigation UI component
interface CameraNavigationProps {
  activePreset: CameraPreset;
  onPresetChange: (preset: CameraPreset) => void;
}

export const CameraNavigation = ({
  activePreset,
  onPresetChange,
}: CameraNavigationProps) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const presets = Object.entries(CAMERA_PRESETS);
      const found = presets.find(([_, preset]) => preset.key === e.key);
      if (found) {
        onPresetChange(found[0] as CameraPreset);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPresetChange]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "8px",
        padding: "12px 16px",
        background: "rgba(13, 13, 15, 0.9)",
        borderRadius: "12px",
        border: "1px solid rgba(123, 104, 238, 0.3)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
      }}
    >
      {Object.entries(CAMERA_PRESETS).map(([key, preset]) => (
        <button
          key={key}
          onClick={() => onPresetChange(key as CameraPreset)}
          style={{
            padding: "8px 16px",
            background: activePreset === key 
              ? "linear-gradient(135deg, #7B68EE, #00D9FF)"
              : "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontFamily: "'VT323', monospace",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
          onMouseEnter={(e) => {
            if (activePreset !== key) {
              e.currentTarget.style.background = "rgba(123, 104, 238, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (activePreset !== key) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }
          }}
        >
          <span>{preset.name}</span>
          <span style={{ fontSize: "10px", opacity: 0.6 }}>[{preset.key}]</span>
        </button>
      ))}
    </div>
  );
};

export default CameraController;
