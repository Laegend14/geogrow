
export interface PlotData {
  latitude: number;
  longitude: number;
  location_name?: string;
  crop_type: string;
  growth_progress: number;
  health: number;
  moisture: number;
  soil_status: "Raw" | "Cleared" | "Prepared";
  is_planted: boolean;
  condition: "sunny" | "rainy" | "stormy" | "cloudy";
  weed_level: number;
  pest_level: number;
  fertilizer_level: number;
  last_update: number;
  tools?: string[];
  land_expansion_level?: number;
}

export interface GameStats {
  total_harvests: number;
  total_earned: number;
  seeds_planted: number;
}
