import { useState } from "react";
import * as THREE from "three";
import { CameraPreset } from "./CameraController";

interface RoomClickZoneProps {
  position: [number, number, number];
  size: [number, number];
  preset: CameraPreset;
  onNavigate: (preset: CameraPreset) => void;
  label: string;
}

// Individual clickable room zone
const RoomClickZone = ({ position, size, preset, onNavigate, label }: RoomClickZoneProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onNavigate(preset);
      }}
    >
      <planeGeometry args={size} />
      <meshBasicMaterial 
        color={hovered ? "#7B68EE" : "#FFFFFF"} 
        transparent 
        opacity={hovered ? 0.15 : 0} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

interface RoomClickZonesProps {
  onNavigate: (preset: CameraPreset) => void;
}

// All room click zones
export const RoomClickZones = ({ onNavigate }: RoomClickZonesProps) => {
  return (
    <group>
      {/* Living Room zone */}
      <RoomClickZone
        position={[5, 0.05, -4]}
        size={[8, 7]}
        preset="livingRoom"
        onNavigate={onNavigate}
        label="Living Room"
      />
      
      {/* Kitchen zone */}
      <RoomClickZone
        position={[5, 0.05, -10]}
        size={[8, 4]}
        preset="kitchen"
        onNavigate={onNavigate}
        label="Kitchen"
      />
      
      {/* Hallway zone */}
      <RoomClickZone
        position={[2, 0.05, -14.5]}
        size={[2, 4]}
        preset="hallway"
        onNavigate={onNavigate}
        label="Hallway"
      />
      
      {/* Bedroom zone */}
      <RoomClickZone
        position={[4, 0.05, -21]}
        size={[7, 7]}
        preset="bedroom"
        onNavigate={onNavigate}
        label="Bedroom"
      />
    </group>
  );
};

export default RoomClickZones;
