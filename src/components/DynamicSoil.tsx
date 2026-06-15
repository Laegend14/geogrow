import React, { useMemo } from "react";
import * as THREE from "three";

interface DynamicSoilProps {
  moisture: number;
  status: "Raw" | "Cleared" | "Prepared";
  condition?: string;
}

export const DynamicSoil: React.FC<DynamicSoilProps> = ({ moisture, status, condition }) => {
  const cond = condition?.toLowerCase() || "";

  // Generate a procedural noise texture for the bump map
  const noiseTexture = useMemo(() => {
    const size = 64;
    const data = new Uint8Array(size * size * 3);
    for (let i = 0; i < size * size * 3; i++) {
      data[i] = Math.random() * 255;
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const moistureColor = useMemo(() => {
    // 0 = dry (light brown), 100 = wet (dark brown/black)
    const t = moisture / 100;
    if (status === "Raw") return new THREE.Color().setHSL(0.1, 0.4, 0.3 - t * 0.1);
    return new THREE.Color().setHSL(0.08, 0.4, 0.4 - t * 0.3);
  }, [moisture, status]);

  const trenchColor = useMemo(() => {
    const color = moistureColor.clone();
    color.offsetHSL(0, 0, -0.05); // Slightly darker for troughs
    return color;
  }, [moistureColor]);

  const ridgeColor = useMemo(() => {
    const color = moistureColor.clone();
    color.offsetHSL(0, 0, 0.08); // More distinct highlights
    return color;
  }, [moistureColor]);

  const roughness = useMemo(() => 1 - (moisture / 100) * 0.8, [moisture]);

  return (
    <group position={[0, -0.04, 0]}>
      {/* The soil plot base (Box instead of Plane for thickness) */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[12.2, 0.2, 12.2, status === "Raw" ? 32 : 8, 1, status === "Raw" ? 32 : 8]} />
        <meshStandardMaterial 
          color={moistureColor}
          roughness={roughness}
          flatShading={status === "Raw"}
          bumpMap={noiseTexture}
          bumpScale={status === "Prepared" ? 0.05 : 0.15}
        />
      </mesh>

      {/* Row Furrows for "Prepared" status - More dense and organic */}
      {status === "Prepared" && (
        <group>
          {[...Array(16)].map((_, i) => (
            <group key={i} position={[0, 0, -5.25 + i * 0.7]}>
              {/* The Peak */}
              <mesh 
                position={[0, 0.18, 0]} 
                rotation={[-Math.PI / 2, (Math.random() - 0.5) * 0.02, 0]} 
                receiveShadow
              >
                <cylinderGeometry args={[0.2, 0.55, 11.9, 6]} />
                <meshStandardMaterial 
                  color={ridgeColor} 
                  roughness={roughness + 0.1} 
                  bumpMap={noiseTexture} 
                  bumpScale={0.15} 
                />
              </mesh>
              {/* Trench shading simulation */}
              <mesh position={[0, 0.02, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[11.8, 0.3]} />
                <meshStandardMaterial color={trenchColor} transparent opacity={0.5} />
              </mesh>
            </group>
          ))}
          {/* Finer clumps near ridges for organic look */}
          {[...Array(80)].map((_, i) => {
             const ridgeIdx = Math.floor(i / 5);
             const z = -5.25 + ridgeIdx * 0.7 + (Math.random() - 0.5) * 0.4;
             const x = (Math.random() - 0.5) * 11.5;
             return (
               <mesh key={`ridge-clump-${i}`} position={[x, 0.2 + Math.random() * 0.1, z]} rotation={[Math.random(), Math.random(), Math.random()]}>
                 <sphereGeometry args={[0.08 + Math.random() * 0.12, 5, 5]} />
                 <meshStandardMaterial color={ridgeColor} roughness={1} />
               </mesh>
             );
          })}
        </group>
      )}

      {/* Scattered Debris and dirt clumps for "Cleared" status */}
      {status === "Cleared" && (
        <group>
          {[...Array(12)].map((_, i) => (
            <mesh key={`debris-${i}`} position={[(Math.random() - 0.5) * 10, 0.05, (Math.random() - 0.5) * 10]}>
              <boxGeometry args={[0.2, 0.02, 0.5]} />
              <meshStandardMaterial color="#5d4037" />
            </mesh>
          ))}
          {[...Array(20)].map((_, i) => (
             <mesh key={`clump-${i}`} position={[(Math.random() - 0.5) * 11, 0.05, (Math.random() - 0.5) * 11]}>
               <sphereGeometry args={[0.1 + Math.random() * 0.1, 4, 4]} />
               <meshStandardMaterial color={moistureColor} roughness={1} />
             </mesh>
          ))}
        </group>
      )}

      {/* Puddles */}
      {(cond === "rainy" || cond === "stormy") && (
        <group>
          {[...Array(5)].map((_, i) => (
            <mesh key={`puddle-${i}`} position={[(Math.random() - 0.5) * 10, 0.04, (Math.random() - 0.5) * 10]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.5 + Math.random() * 1, 8]} />
              <meshStandardMaterial color="#81D4FA" transparent opacity={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* Wild growth and rocks for "Raw" status */}
      {status === "Raw" && (
        <group>
           {/* Rocks */}
           {[...Array(15)].map((_, i) => (
             <mesh key={`rock-${i}`} position={[(Math.random() - 0.5) * 11, 0.2, (Math.random() - 0.5) * 11]} castShadow>
               <dodecahedronGeometry args={[0.2 + Math.random() * 0.4]} />
               <meshStandardMaterial color="#7a7a7a" roughness={0.9} />
             </mesh>
           ))}
           {/* Weeds */}
           {[...Array(30)].map((_, i) => (
             <group key={`weed-${i}`} position={[(Math.random() - 0.5) * 11, 0, (Math.random() - 0.5) * 11]}>
               <mesh position={[0, 0.2, 0]} castShadow>
                 <coneGeometry args={[0.1, 0.4, 3]} />
                 <meshStandardMaterial color="#2e7d32" />
               </mesh>
             </group>
           ))}
        </group>
      )}
    </group>
  );
};
