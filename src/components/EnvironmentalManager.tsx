import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface EnvironmentalManagerProps {
  condition: string;
}

export const EnvironmentalManager: React.FC<EnvironmentalManagerProps> = ({ condition }) => {
  const lightningRef = useRef<THREE.PointLight>(null);
  const [lightningIntensity, setLightningIntensity] = useState(0);
  const cond = condition.toLowerCase();

  const particleCount = cond === "stormy" ? 4000 : cond === "rainy" ? 2000 : 0;
  
  const rainGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array(particleCount * 6);
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = Math.random() * 40;
      const z = (Math.random() - 0.5) * 60;
      
      vertices[i * 6] = x;
      vertices[i * 6 + 1] = y;
      vertices[i * 6 + 2] = z;
      vertices[i * 6 + 3] = x;
      vertices[i * 6 + 4] = y - 0.8;
      vertices[i * 6 + 5] = z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geo;
  }, [particleCount]);

  const cloudPositions = useMemo(() => {
    return [...Array(15)].map(() => [
      (Math.random() - 0.5) * 80,
      18 + Math.random() * 7,
      (Math.random() - 0.5) * 80,
    ] as [number, number, number]);
  }, []);

  const lineRef = useRef<THREE.LineSegments>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rain animation
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      const speed = cond === "stormy" ? 45 : 30;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 6 + 1] -= delta * speed;
        positions[i * 6 + 4] -= delta * speed;
        
        if (positions[i * 6 + 1] < 0) {
          const y = 40;
          positions[i * 6 + 1] = y;
          positions[i * 6 + 4] = y - 0.8;
        }
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Lightning logic
    if (cond === "stormy") {
      if (Math.random() > 0.992) {
        setLightningIntensity(15 + Math.random() * 30);
      } else if (lightningIntensity > 0) {
        setLightningIntensity(prev => Math.max(0, prev - delta * 150));
      }
    } else {
      setLightningIntensity(0);
    }
  });

  const ambientIntensity = cond === "sunny" ? 0.7 : (cond === "cloudy" ? 0.4 : (cond === "rainy" ? 0.25 : 0.08));
  const directIntensity = cond === "sunny" ? 1.5 : (cond === "cloudy" ? 0.8 : (cond === "rainy" ? 0.4 : 0.1));

  return (
    <group>
      {/* Dynamic Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={[20, 50, 20]} 
        intensity={directIntensity} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40, 0.5, 120]} />
      </directionalLight>

      {/* Sun rays for sunny weather */}
      {cond === "sunny" && (
        <group position={[20, 50, 20]}>
           {[...Array(8)].map((_, i) => (
             <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
                <cylinderGeometry args={[0.01, 3, 60, 4]} />
                <meshStandardMaterial color="#FFF9C4" transparent opacity={0.08} />
             </mesh>
           ))}
        </group>
      )}

      {/* Lightning Flash */}
      <pointLight 
        ref={lightningRef} 
        position={[Math.random() * 10 - 5, 25, Math.random() * 10 - 5]} 
        intensity={lightningIntensity} 
        color="#E1F5FE" 
        distance={200}
      />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={[
        cond === "sunny" ? "#B3E5FC" : 
        cond === "cloudy" ? "#90A4AE" : 
        cond === "rainy" ? "#607D8B" : 
        "#212121", 
        cond === "stormy" ? 5 : 15, 
        cond === "stormy" ? 60 : 100]} 
      />

      {/* Clouds */}
      {(cond !== "sunny") && (
        <group>
          {cloudPositions.map((pos, i) => (
            <Float key={i} speed={0.8 + i * 0.1} rotationIntensity={0} floatIntensity={0.6}>
              <mesh position={[pos[0] + (Math.sin(i + Date.now() * 0.0001) * 15), pos[1], pos[2]]}>
                <sphereGeometry args={[5 + Math.random() * 5, 10, 10]} />
                <meshStandardMaterial 
                  color={cond === "stormy" ? "#263238" : "#CFD8DC"} 
                  transparent 
                  opacity={cond === "stormy" ? 0.9 : 0.75} 
                  flatShading
                />
              </mesh>
            </Float>
          ))}
        </group>
      )}

      {/* Rain Streaks (LineSegments) */}
      {particleCount > 0 && (
        <lineSegments ref={lineRef} geometry={rainGeometry}>
          <lineBasicMaterial color="#B3E5FC" transparent opacity={0.4} linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
};
