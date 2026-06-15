import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface CropMeshProps {
  growth: number; // 0 to 1,000,000
  type: string;
  weedLevel: number;
}

const Sparkle: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <Float speed={10} rotationIntensity={2} floatIntensity={1}>
    <mesh position={position}>
      <octahedronGeometry args={[0.06, 0]} />
      <meshStandardMaterial 
        color="#FFFFFF" 
        emissive="#FFFFE0" 
        emissiveIntensity={4} 
        transparent 
        opacity={0.9} 
      />
    </mesh>
  </Float>
);

export const CropMesh: React.FC<CropMeshProps> = ({ growth, type, weedLevel }) => {
  const meshRef = useRef<THREE.Group>(null);
  const progress = Math.min(1, growth / 1000000);
  const isReady = progress >= 1;
  const cropType = type?.toLowerCase() || "tomato";
  const weeds = Math.floor(weedLevel / 10); // 0 to 10 visual weeds per slot? No, per grid maybe.

  // Pre-calculate random sparkle offsets to keep it stable
  const sparkleOffsets = useMemo(() => {
    return [...Array(3)].map(() => [
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.5 + 1.8,
      (Math.random() - 0.5) * 0.8,
    ] as [number, number, number]);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.children.forEach((child, i) => {
        // More sophisticated swaying with per-plant offsets
        const phase = i * 0.5 + Math.sin(i * 0.2);
        
        // Differentiate sway by crop type
        let swaySpeed = 2;
        let swayAmount = 0.05;
        
        if (cropType === "wheat") {
          swaySpeed = 3;
          swayAmount = 0.08;
        } else if (cropType === "corn") {
          swaySpeed = 1.5;
          swayAmount = 0.03;
        } else if (cropType === "lettuce" || cropType === "cabbage") {
          swaySpeed = 1;
          swayAmount = 0.015;
        }
        
        child.rotation.z = Math.sin(time * swaySpeed + phase) * swayAmount * progress;
        child.rotation.x = Math.cos(time * (swaySpeed * 0.5) + phase) * (swayAmount * 0.5) * progress;

        // Pulse scale: breathing effect during growth, stronger pulse when ready
        const basePulse = 1 + Math.sin(time * 2 + phase) * 0.01;
        const readyPulse = isReady ? (1 + Math.sin(time * 6 + phase) * 0.04) : basePulse;
        
        // Apply scale transition
        const targetScale = progress > 0.05 ? readyPulse : progress * 20;
        child.scale.set(targetScale, targetScale, targetScale);
      });
    }
  });

  const gridX = [-4.5, -3, -1.5, 0, 1.5, 3, 4.5];
  const gridZ = [-4.55, -3.15, -1.75, -0.35, 1.05, 2.45, 3.85, 5.25];
  const yOffset = 0.25;

  return (
    <group ref={meshRef}>
      {gridX.map((x) => 
        gridZ.map((z) => {
          // Add some randomness per plant position
          const randSeed = (Math.abs(x * 100 + z * 10) % 100) / 100;
          
          return (
            <group key={`${x}-${z}`} position={[x, yOffset, z]}>
                {/* Weeds Visualization */}
                {weedLevel > 20 &&
                  [...Array(Math.min(3, Math.floor(weedLevel / 30)))].map(
                    (_, i) => (
                      <mesh
                        key={`weed-${i}`}
                        position={[
                          Math.cos(i * 2 + randSeed) * 0.4,
                          0.05,
                          Math.sin(i * 2 + randSeed) * 0.4,
                        ]}
                        rotation={[0, i, 0]}
                      >
                        <coneGeometry
                          args={[0.05, 0.2 + (weedLevel / 100) * 0.3, 3]}
                        />
                        <meshStandardMaterial color="#33691E" />
                      </mesh>
                    ),
                  )}

                {/* Model logic based on crop type */}
                {cropType === "tomato" && (
                  <>
                    {/* Main Stem */}
                    <mesh position={[0, progress * 0.75, 0]} castShadow>
                      <cylinderGeometry args={[0.08, 0.12, progress * 1.5, 8]} />
                      <meshStandardMaterial color="#55BB55" />
                    </mesh>
                    {/* Leaves */}
                   {progress > 0.4 && (
                     <group position={[0, progress * 1, 0]}>
                       <mesh rotation={[0.5, 0, 0]}>
                          <coneGeometry args={[0.4, 0.1, 4]} />
                          <meshStandardMaterial color="#44AA44" />
                       </mesh>
                       <mesh rotation={[-0.5, 3.14, 0]}>
                          <coneGeometry args={[0.4, 0.1, 4]} />
                          <meshStandardMaterial color="#44AA44" />
                       </mesh>
                     </group>
                   )}
                   {/* Fruit */}
                   {progress > 0.8 && (
                     <mesh position={[0, progress * 1.6, 0]} castShadow>
                       <sphereGeometry args={[0.3, 8, 8]} />
                       <meshStandardMaterial 
                         color={isReady ? "#FF2200" : "#CC3311"} 
                         emissive={isReady ? "#FF0000" : "#000000"}
                         emissiveIntensity={isReady ? 0.4 : 0}
                         roughness={0.2} 
                       />
                     </mesh>
                   )}
                 </>
               )}

               {cropType === "wheat" && (
                 <>
                   {/* Thin Golden Stalk */}
                   <mesh position={[0, progress * 0.8, 0]} castShadow>
                     <cylinderGeometry args={[0.03, 0.05, progress * 1.6, 6]} />
                     <meshStandardMaterial color={progress > 0.7 ? "#D4AF37" : "#88AA33"} />
                   </mesh>
                   {/* Grain head */}
                   {progress > 0.6 && (
                     <group position={[0, progress * 1.5, 0]}>
                        {[...Array(5)].map((_, i) => (
                           <mesh key={i} position={[Math.sin(i) * 0.05, i * 0.1, Math.cos(i) * 0.05]} rotation={[0.4, 0, 0]}>
                              <sphereGeometry args={[0.08, 4, 4]} />
                              <meshStandardMaterial color={isReady ? "#F9D71C" : "#AABB44"} />
                           </mesh>
                        ))}
                     </group>
                   )}
                 </>
               )}

               {cropType === "corn" && (
                 <>
                   {/* Thick Stalk */}
                   <mesh position={[0, progress * 1.2, 0]} castShadow>
                     <cylinderGeometry args={[0.12, 0.18, progress * 2.4, 8]} />
                     <meshStandardMaterial color="#2E7D32" />
                   </mesh>
                   {/* Large Leaves */}
                   {progress > 0.3 && (
                     <group position={[0, progress * 1.2, 0]}>
                        <mesh rotation={[1, 0, 0.5]} position={[0.2, 0, 0]}>
                           <coneGeometry args={[0.6, 0.1, 4]} />
                           <meshStandardMaterial color="#388E3C" />
                        </mesh>
                        <mesh rotation={[-1, 3.14, -0.5]} position={[-0.2, 0.4, 0]}>
                           <coneGeometry args={[0.6, 0.1, 4]} />
                           <meshStandardMaterial color="#4CAF50" />
                        </mesh>
                     </group>
                   )}
                   {/* Corn ears */}
                   {progress > 0.7 && (
                     <mesh position={[0.2, progress * 1.5, 0.1]} rotation={[0.3, 0, 0.2]} castShadow>
                       <cylinderGeometry args={[0.1, 0.15, 0.6, 6]} />
                       <meshStandardMaterial color={isReady ? "#FFD600" : "#9E9E9E"} />
                     </mesh>
                   )}
                 </>
               )}

               {cropType === "lettuce" && (
                 <>
                   {/* Wide base */}
                   <group position={[0, progress * 0.2, 0]}>
                      {[...Array(8)].map((_, i) => (
                        <mesh 
                          key={i} 
                          rotation={[0.3, (i / 8) * Math.PI * 2, 0]} 
                          position={[Math.cos((i / 8) * Math.PI * 2) * 0.3 * progress, 0, Math.sin((i / 8) * Math.PI * 2) * 0.3 * progress]}
                        >
                           <sphereGeometry args={[0.4 * progress, 4, 4]} scale={[1, 0.5, 1.2]} />
                           <meshStandardMaterial color={isReady ? "#81C784" : "#4CAF50"} />
                        </mesh>
                      ))}
                      {progress > 0.6 && (
                        <mesh position={[0, 0.1, 0]}>
                          <sphereGeometry args={[0.35 * progress, 8, 8]} />
                          <meshStandardMaterial color={isReady ? "#A5D6A7" : "#81C784"} />
                        </mesh>
                      )}
                   </group>
                 </>
               )}

               {cropType === "carrot" && (
                 <>
                   {/* Underground part (invisible or just peaking) */}
                   <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
                      <coneGeometry args={[0.1, progress * 0.6, 6]} />
                      <meshStandardMaterial color="#FF6D00" />
                   </mesh>
                   {/* Leafy top */}
                   <group position={[0, 0.05, 0]}>
                      {[...Array(4)].map((_, i) => (
                        <mesh key={i} rotation={[0, (i / 4) * Math.PI * 2, 0]} position={[0, progress * 0.2, 0]}>
                           <cylinderGeometry args={[0.01, 0.02, progress * 0.6, 4]} />
                           <meshStandardMaterial color="#2E7D32" />
                           <mesh position={[0, 0.3, 0]} rotation={[0.4, 0, 0]}>
                              <coneGeometry args={[0.15, 0.1, 3]} />
                              <meshStandardMaterial color="#388E3C" />
                           </mesh>
                        </mesh>
                      ))}
                   </group>
                 </>
               )}

               {cropType === "broccoli" && (
                 <>
                   {/* Thick Stem */}
                   <mesh position={[0, progress * 0.5, 0]} castShadow>
                     <cylinderGeometry args={[0.12, 0.18, progress * 1.0, 8]} />
                     <meshStandardMaterial color="#8BC34A" />
                   </mesh>
                   {/* Bushy Head */}
                   {progress > 0.4 && (
                     <group position={[0, progress * 0.9, 0]}>
                        {[...Array(6)].map((_, i) => (
                          <mesh 
                            key={i} 
                            position={[
                              Math.cos((i / 6) * Math.PI * 2) * 0.25 * progress, 
                              Math.random() * 0.2, 
                              Math.sin((i / 6) * Math.PI * 2) * 0.25 * progress
                            ]}
                          >
                             <sphereGeometry args={[0.35 * progress, 6, 6]} />
                             <meshStandardMaterial color={isReady ? "#1B5E20" : "#2E7D32"} roughness={1} />
                          </mesh>
                        ))}
                        <mesh position={[0, 0.2, 0]}>
                           <sphereGeometry args={[0.4 * progress, 8, 8]} />
                           <meshStandardMaterial color={isReady ? "#1B5E20" : "#2E7D32"} roughness={1} />
                        </mesh>
                     </group>
                   )}
                 </>
               )}

               {cropType === "cabbage" && (
                 <>
                   {/* Layered Leaf Ball */}
                   <group position={[0, progress * 0.3, 0]}>
                      {[...Array(12)].map((_, i) => (
                        <mesh 
                          key={i} 
                          rotation={[Math.random() * 0.5, (i / 12) * Math.PI * 2, Math.random() * 0.5]}
                          position={[0, 0, 0]}
                        >
                           <sphereGeometry args={[0.6 * progress, 8, 8]} scale={[1, 0.6, 1.3]} />
                           <meshStandardMaterial 
                             color={isReady ? "#C5E1A5" : "#81C784"} 
                             transparent={i > 8}
                             opacity={i > 8 ? 0.6 : 1}
                           />
                        </mesh>
                      ))}
                      {progress > 0.7 && (
                        <mesh position={[0, 0, 0]}>
                          <sphereGeometry args={[0.45 * progress, 12, 12]} />
                          <meshStandardMaterial color="#DCEDC8" />
                        </mesh>
                      )}
                   </group>
                 </>
               )}

               {cropType === "chili" && (
                 <>
                   {/* Multi-branched plant */}
                   <mesh position={[0, progress * 0.6, 0]} castShadow>
                     <cylinderGeometry args={[0.04, 0.08, progress * 1.2, 6]} />
                     <meshStandardMaterial color="#4CAF50" />
                   </mesh>
                   {/* Branches & Peppers */}
                   {progress > 0.4 && (
                     <group position={[0, progress * 0.8, 0]}>
                        {[...Array(4)].map((_, i) => (
                          <group key={i} rotation={[0, (i / 4) * Math.PI * 2, 0]}>
                            <mesh position={[0.2 * progress, 0.2 * progress, 0]} rotation={[0, 0, -1]}>
                               <cylinderGeometry args={[0.02, 0.02, 0.4 * progress, 4]} />
                               <meshStandardMaterial color="#4CAF50" />
                               {progress > 0.7 && (
                                 <mesh position={[0, 0.2 * progress, 0]} rotation={[0, 0, 0.5]}>
                                    <coneGeometry args={[0.08 * progress, 0.4 * progress, 6]} />
                                    <meshStandardMaterial 
                                      color={isReady ? "#D50000" : "#2E7D32"} 
                                      emissive={isReady ? "#FF0000" : "#000000"}
                                      emissiveIntensity={isReady ? 0.3 : 0}
                                    />
                                 </mesh>
                               )}
                            </mesh>
                          </group>
                        ))}
                     </group>
                   )}
                 </>
               )}

               {/* Harvest Ready Sparkles */}
               {isReady && sparkleOffsets.map((offset, i) => (
                 <Sparkle key={i} position={[(offset[0] + randSeed * 0.2), offset[1] * (cropType === 'corn' ? 1.5 : 1), offset[2]]} />
               ))}
            </group>
          );
        })
      )}
    </group>
  );
};
