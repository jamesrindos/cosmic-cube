import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Ambient dust particles floating in light beams
export const DustParticles = ({ 
  count = 100, 
  area = { x: 10, y: 3, z: 15 },
  offset = { x: 0, y: 1.5, z: -10 }
}: { 
  count?: number; 
  area?: { x: number; y: number; z: number };
  offset?: { x: number; y: number; z: number };
}) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area.x + offset.x;
      positions[i * 3 + 1] = Math.random() * area.y + offset.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area.z + offset.z;
      speeds[i] = 0.001 + Math.random() * 0.002;
    }
    
    return { positions, speeds };
  }, [count, area, offset]);

  useFrame(() => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Slow upward drift
        positions[i * 3 + 1] += particles.speeds[i];
        
        // Gentle horizontal sway
        positions[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.0005;
        
        // Reset if above ceiling
        if (positions[i * 3 + 1] > offset.y + area.y) {
          positions[i * 3 + 1] = offset.y;
          positions[i * 3] = (Math.random() - 0.5) * area.x + offset.x;
          positions[i * 3 + 2] = (Math.random() - 0.5) * area.z + offset.z;
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#FFF5E6"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// Floating motes in window light beams
export const LightBeamParticles = ({ 
  position,
  count = 30 
}: { 
  position: [number, number, number];
  count?: number;
}) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Concentrated in light beam area
      positions[i * 3] = (Math.random() - 0.5) * 1;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
      speeds[i] = 0.002 + Math.random() * 0.003;
    }
    
    return { positions, speeds };
  }, [count]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        // Swirling motion
        const angle = time * 0.5 + i * 0.1;
        positions[i * 3] += Math.sin(angle) * 0.002;
        positions[i * 3 + 1] += particles.speeds[i];
        positions[i * 3 + 2] += Math.cos(angle) * 0.002;
        
        // Reset
        if (positions[i * 3 + 1] > 2) {
          positions[i * 3 + 1] = 0;
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#FFF8E8"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};
