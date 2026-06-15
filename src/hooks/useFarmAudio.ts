import { useCozyFarmAudio } from "./useCozyFarmAudio";

interface AudioConfig {
  condition: "sunny" | "rainy" | "stormy" | "cloudy";
}

export const useFarmAudio = ({ condition }: AudioConfig) => {
  const cozyAudio = useCozyFarmAudio({ condition });
  
  return {
    playWarpSound: cozyAudio.playWarpSound,
    playHarvestSound: cozyAudio.playHarvestSound,
    playHoeSound: cozyAudio.playHoeSound,
    playWaterSound: cozyAudio.playWaterSound,
    playWeedSound: cozyAudio.playWeedSound,
    playSpraySound: cozyAudio.playSpraySound,
    initAudio: cozyAudio.initAudio,
  };
};
