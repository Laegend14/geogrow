import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { DynamicSoil } from "./DynamicSoil";
import { CropMesh } from "./CropMesh";
import { EnvironmentalManager } from "./EnvironmentalManager";
import { FarmDecorations } from "./FarmDecorations";

// Local flying particle swarms circling the crop meshes
const PestSwarm: React.FC<{ pestLevel: number }> = ({ pestLevel }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = Math.min(25, Math.floor((pestLevel || 0) / 4));

  // Generate initial particles coordinates
  const particlesData = useMemo(() => {
    const tempPositions = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const speeds = new Float32Array(count);
    const heights = new Float32Array(count);
    const radii = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 1.5;
      heights[i] = 0.8 + Math.random() * 1.5;
      radii[i] = 0.6 + Math.random() * 0.8;

      tempPositions[i * 3] = Math.cos(angles[i]) * radii[i];
      tempPositions[i * 3 + 1] = heights[i];
      tempPositions[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }
    return { tempPositions, angles, speeds, heights, radii };
  }, [count]);

  const { angles, speeds, heights, radii } = particlesData;

  useFrame((state) => {
    if (!pointsRef.current || count === 0) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Swarm movement circling the central crop
      const currentAngle = angles[i] + time * speeds[i] * 0.6;
      // Add subtle height sinusoidal bobbing
      const currentHeight = heights[i] + Math.sin(time * 2 + i) * 0.15;
      const currentRadius = radii[i] + Math.cos(time + i) * 0.1;

      pos.setX(i, Math.cos(currentAngle) * currentRadius);
      pos.setY(i, currentHeight);
      pos.setZ(i, Math.sin(currentAngle) * currentRadius);
    }
    pos.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesData.tempPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#2E2E2E"
        size={0.12}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

interface FarmCanvasProps {
  plot: any;
  weatherCondition: "sunny" | "rainy" | "stormy" | "cloudy";
  isLoading: boolean;
}

export const FarmCanvas: React.FC<FarmCanvasProps> = ({
  plot,
  weatherCondition,
  isLoading,
}) => {
  const moisture = plot?.moisture ?? 50;
  const growth = plot?.growth_progress ?? 0;
  const status = (plot?.soil_status as "Raw" | "Cleared" | "Prepared") || "Raw";
  const weedLevel = plot?.weed_level ?? 0;
  const pestLevel = plot?.pest_level ?? 0;
  const hasPlot = !!plot && plot.latitude !== undefined;

  return (
    <div className="w-full h-full relative overflow-hidden" id="farm-viewport">
      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [15, 15, 15], fov: 30 }}
      >
        {/* Sky Color mapped dynamically */}
        <color
          attach="background"
          args={[
            weatherCondition === "sunny"
              ? "#87CEEB"
              : weatherCondition === "cloudy"
              ? "#B0C4DE"
              : weatherCondition === "rainy"
              ? "#708090"
              : "#4F4F4F",
          ]}
        />

        <EnvironmentalManager condition={weatherCondition} />

        <group position={[0, -0.5, 0]}>
          {/* Grass Field mesh */}
          <mesh
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.05, 0]}
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#4CAF50" roughness={1} />
          </mesh>

          {/* Dirt Soil Plot Area */}
          <DynamicSoil
            moisture={moisture}
            status={status}
            condition={weatherCondition}
          />

          <FarmDecorations />

          {hasPlot && (
            <>
              <CropMesh
                growth={growth}
                type={plot.crop_type}
                weedLevel={weedLevel}
              />
              {/* Flying Bug Swarm particles when infested */}
              <PestSwarm pestLevel={pestLevel} />
            </>
          )}
        </group>

        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={35}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={!hasPlot || isLoading}
          autoRotateSpeed={0.5}
          enableDamping
        />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-none z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
};
