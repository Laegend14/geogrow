import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DynamicSoil } from "./DynamicSoil";
import { CropMesh } from "./CropMesh";
import { EnvironmentalManager } from "./EnvironmentalManager";
import { FarmDecorations } from "./FarmDecorations";

interface FarmViewportProps {
  plot: any;
  weatherCondition: "sunny" | "rainy" | "stormy" | "cloudy";
  isLoading: boolean;
}

export const FarmViewport: React.FC<FarmViewportProps> = ({ plot, weatherCondition, isLoading }) => {
  const moisture = plot?.moisture ?? 50;
  const growth = plot?.growth_progress ?? 0;
  const status = (plot?.soil_status as "Raw" | "Cleared" | "Prepared") || "Raw";
  const hasPlot = !!plot && plot.latitude !== undefined;

  return (
    <div className="w-full h-full relative overflow-hidden" id="farm-viewport">
      <Canvas shadows gl={{ antialias: true }} camera={{ position: [15, 15, 15], fov: 30 }}>
        {/* Sky Color */}
        <color attach="background" args={["#87CEEB"]} />
        
        <EnvironmentalManager condition={weatherCondition} />
        
        <group position={[0, -0.5, 0]}>
          {/* Main Farm Ground (Grass) */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#4CAF50" roughness={1} />
          </mesh>

          {/* Dirt Plot Area */}
          <DynamicSoil moisture={moisture} status={status} condition={weatherCondition} />
          
          <FarmDecorations />
          
          {hasPlot && (
             <CropMesh growth={growth} type={plot.crop_type} weedLevel={plot.weed_level || 0} />
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
