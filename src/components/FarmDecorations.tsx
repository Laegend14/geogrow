import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const Barn: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Main Body */}
    <mesh position={[0, 3, 0]} castShadow receiveShadow>
      <boxGeometry args={[8, 6, 12]} />
      <meshStandardMaterial color="#A52A2A" />
    </mesh>
    {/* Roof */}
    <mesh position={[0, 7, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
      <boxGeometry args={[6, 6, 12.2]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
    {/* Doors */}
    <mesh position={[0, 1.5, 6.1]} castShadow>
      <boxGeometry args={[4, 3, 0.2]} />
      <meshStandardMaterial color="#3E2723" />
    </mesh>
    <mesh position={[4.1, 1.5, 0]} castShadow>
      <boxGeometry args={[0.2, 2, 4]} />
      <meshStandardMaterial color="#3E2723" />
    </mesh>
  </group>
);

const GrassClump: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {[...Array(5)].map((_, i) => (
      <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0, 0.2, 0]}>
        <planeGeometry args={[0.2, 0.4]} />
        <meshStandardMaterial color="#2E7D32" side={THREE.DoubleSide} alphaTest={0.5} />
      </mesh>
    ))}
  </group>
);

const Farmhouse: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Base */}
    <mesh position={[0, 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[10, 4, 8]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
    {/* Windows */}
    {[ -3, 3 ].map((x) => (
      <mesh key={x} position={[x, 2.5, 4.1]} castShadow>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#81D4FA" emissive="#81D4FA" emissiveIntensity={0.2} />
      </mesh>
    ))}
    {/* Door */}
    <mesh position={[0, 1.25, 4.1]} castShadow>
      <boxGeometry args={[1.5, 2.5, 0.1]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
    {/* Porch roof */}
    <mesh position={[0, 3, 5]} rotation={[0.2, 0, 0]} castShadow>
      <boxGeometry args={[11, 0.2, 3]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
    {/* Main Roof */}
    <mesh position={[0, 5.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
      <boxGeometry args={[8, 8, 8.5]} />
      <meshStandardMaterial color="#424242" />
    </mesh>
    {/* Picket Fence */}
    <group position={[0, 0, 5]}>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[-5 + i * 2, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 1, 0.1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[11, 0.1, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  </group>
);

const Windmill: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const bladesRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z = state.clock.getElapsedTime() * 2;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[1, 2, 10, 8]} />
        <meshStandardMaterial color="#B0BEC5" />
      </mesh>
      <mesh position={[0, 10.5, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshStandardMaterial color="#455A64" />
      </mesh>
      <group ref={bladesRef} position={[0, 10.5, 1.3]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 4, 0]}>
            <boxGeometry args={[0.2, 8, 0.1]} />
            <meshStandardMaterial color="#ECEFF1" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Flower: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.3]} />
      <meshStandardMaterial color="#2E7D32" />
    </mesh>
    <mesh position={[0, 0.35, 0]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
);

const Tractor: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Body */}
    <mesh position={[0, 1, 0]} castShadow>
      <boxGeometry args={[2, 1.5, 4]} />
      <meshStandardMaterial color="#2E7D32" />
    </mesh>
    {/* Cabin */}
    <mesh position={[0, 2.2, 0.5]} castShadow>
      <boxGeometry args={[1.8, 1.2, 1.5]} />
      <meshStandardMaterial color="#81D4FA" transparent opacity={0.6} />
    </mesh>
    {/* Large Back Wheels */}
    {[ -1.1, 1.1 ].map((x) => (
      <mesh key={x} position={[x, 1, -1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1, 1, 0.5, 12]} />
        <meshStandardMaterial color="#212121" roughness={1} />
      </mesh>
    ))}
    {/* Small Front Wheels */}
    {[ -0.8, 0.8 ].map((x) => (
      <mesh key={x} position={[x, 0.5, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 12]} />
        <meshStandardMaterial color="#212121" roughness={1} />
      </mesh>
    ))}
    {/* Exhaust */}
    <mesh position={[0.6, 2, 1.8]}>
      <cylinderGeometry args={[0.1, 0.1, 1.5]} />
      <meshStandardMaterial color="#424242" />
    </mesh>
  </group>
);

const Well: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Wall */}
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[1.5, 1.5, 1, 12]} />
      <meshStandardMaterial color="#9E9E9E" />
    </mesh>
    {/* Water */}
    <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.2, 12]} />
      <meshStandardMaterial color="#0288D1" transparent opacity={0.8} />
    </mesh>
    {/* Columns */}
    {[ -1.2, 1.2 ].map((x) => (
      <mesh key={x} position={[x, 2, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    ))}
    {/* Roof */}
    <mesh position={[0, 3.8, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
      <boxGeometry args={[2.5, 2.5, 3]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
  </group>
);

export const FarmDecorations: React.FC = () => {
  const grassPositions = useMemo(() => {
    return [...Array(200)].map(() => [
      (Math.random() - 0.5) * 120,
      0,
      (Math.random() - 0.5) * 120,
    ] as [number, number, number]);
  }, []);

  const flowerPositions = useMemo(() => {
    const colors = ["#FFEB3B", "#F44336", "#E91E63", "#9C27B0", "#2196F3"];
    return [...Array(60)].map(() => ({
      pos: [(Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100] as [number, number, number],
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, []);

  return (
    <group>
      {/* Buildings */}
      <Barn position={[-25, 0, -15]} rotation={[0, Math.PI / 6, 0]} />
      <Farmhouse position={[25, 0, -20]} rotation={[0, -Math.PI / 4, 0]} />
      <Windmill position={[-40, 0, 20]} />
      <Tractor position={[0, 0, 18]} rotation={[0, -Math.PI / 2, 0]} />
      <Well position={[15, 0, -5]} />
      
      {/* Paths */}
      <group>
        <mesh position={[0, -0.04, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 12]} />
          <meshStandardMaterial color="#8D6E63" transparent opacity={0.6} />
        </mesh>
        <mesh position={[12, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 4]} />
          <meshStandardMaterial color="#8D6E63" transparent opacity={0.6} />
        </mesh>
      </group>
      
      {/* Scattered Flowers */}
      {flowerPositions.map((f, i) => (
        <Flower key={`flower-${i}`} position={f.pos} color={f.color} />
      ))}
      
      <group position={[15, 0, 25]} rotation={[0, -Math.PI / 3, 0]}>
        {/* Shed */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4, 3, 4]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[3.5, 2, 4]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </group>

      {/* Boundary Fences */}
      <group position={[0, 0, 0]}>
        {/* Northern Fence */}
        {[...Array(20)].map((_, i) => (
          <mesh key={`nf-${i}`} position={[-47.5 + i * 5, 1, -45]} castShadow>
            <boxGeometry args={[0.4, 2, 0.4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
        <mesh position={[0, 1.5, -45]} receiveShadow>
          <boxGeometry args={[100, 0.2, 0.2]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>

        {/* Southern Fence */}
        {[...Array(20)].map((_, i) => (
          <mesh key={`sf-${i}`} position={[-47.5 + i * 5, 1, 45]} castShadow>
            <boxGeometry args={[0.4, 2, 0.4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
        <mesh position={[0, 1.5, 45]} receiveShadow>
          <boxGeometry args={[100, 0.2, 0.2]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      </group>

      {/* Scattered Grass */}
      {grassPositions.map((pos, i) => (
        <GrassClump key={i} position={pos} />
      ))}

      {/* Varied Trees */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2 + (Math.random() * 0.5);
        const radius = 35 + Math.random() * 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Randomly pick between 4 types
        const rand = Math.random();
        let type = 'oak';
        if (rand < 0.25) type = 'pine';
        else if (rand < 0.5) type = 'birch';
        else if (rand < 0.75) type = 'maple';

        const trunkHeight = type === 'birch' ? 4 : type === 'pine' ? 2 : 3;
        const trunkColor = type === 'birch' ? "#E0E0E0" : type === 'maple' ? "#3E2723" : "#5D4037";
        const foliageColor = type === 'pine' ? "#1B5E20" : type === 'birch' ? "#81C784" : type === 'maple' ? "#BF360C" : "#2E7D32";

        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={0.05} floatIntensity={0.05}>
            <group position={[x, 0, z]} scale={[0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4]}>
              {/* Trunk */}
              <mesh position={[0, trunkHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[type === 'birch' ? 0.15 : 0.3, 0.5, trunkHeight, 8]} />
                <meshStandardMaterial color={trunkColor} roughness={0.8} />
                {/* Birch "spots" simulation */}
                {type === 'birch' && (
                  <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.16, 0.51, trunkHeight, 8]} />
                    <meshStandardMaterial color="#424242" transparent opacity={0.3} wireframe />
                  </mesh>
                )}
              </mesh>

              {/* Foliage */}
              {type === 'pine' ? (
                <group position={[0, trunkHeight + 2, 0]}>
                  <mesh position={[0, 0, 0]} castShadow>
                    <coneGeometry args={[2.5, 5, 8]} />
                    <meshStandardMaterial color={foliageColor} />
                  </mesh>
                  <mesh position={[0, -1.5, 0]} castShadow>
                    <coneGeometry args={[3, 4, 8]} />
                    <meshStandardMaterial color={foliageColor} />
                  </mesh>
                </group>
              ) : type === 'birch' ? (
                <mesh position={[0, trunkHeight + 1.5, 0]} castShadow>
                  <sphereGeometry args={[1.5, 12, 12]} scale={[1, 1.5, 1]} />
                  <meshStandardMaterial color={foliageColor} />
                </mesh>
              ) : type === 'maple' ? (
                <group position={[0, trunkHeight + 1.5, 0]}>
                  <mesh position={[0, 0, 0]} castShadow>
                    <sphereGeometry args={[2.2, 10, 10]} />
                    <meshStandardMaterial color={foliageColor} />
                  </mesh>
                  <mesh position={[1.2, -0.5, 0]} castShadow>
                    <sphereGeometry args={[1.5, 8, 8]} />
                    <meshStandardMaterial color={foliageColor} />
                  </mesh>
                  <mesh position={[-1, -0.2, 0.8]} castShadow>
                    <sphereGeometry args={[1.6, 8, 8]} />
                    <meshStandardMaterial color={foliageColor} />
                  </mesh>
                </group>
              ) : (
                <mesh position={[0, trunkHeight + 1.5, 0]} castShadow>
                  <sphereGeometry args={[2.5, 12, 12]} />
                  <meshStandardMaterial color={foliageColor} />
                </mesh>
              )}
            </group>
          </Float>
        );
      })}

      {/* Some bigger rocks */}
      {[...Array(5)].map((_, i) => (
        <group key={i} position={[(Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 60]}>
          <mesh castShadow scale={[1 + Math.random(), 0.5 + Math.random(), 1 + Math.random()]}>
            <dodecahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color="#9E9E9E" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
