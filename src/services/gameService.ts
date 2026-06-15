import { PlotData, GameStats } from '../types';
import { genlayerService } from './genlayerService';

const INITIAL_BALANCE = 100.0; // Gift starting balance in 100 $GEN to kickstart game

class GameService {
  private plot: PlotData | null = null;
  private stats: GameStats | null = null;
  private balance: number = INITIAL_BALANCE;
  private cropPrices: Record<string, number> = {
    tomato: 2.50,
    wheat: 3.50,
    corn: 5.00,
    lettuce: 2.00,
    carrot: 3.00,
    broccoli: 4.50,
    cabbage: 4.00,
    chili: 6.00
  };

  constructor() {
    this.loadState();
  }

  private loadState() {
    const savedPlot = localStorage.getItem('geogrow_plot');
    const savedStats = localStorage.getItem('geogrow_stats');
    const savedBalance = localStorage.getItem('geogrow_balance');
    const savedPrices = localStorage.getItem('geogrow_crop_prices');

    if (savedPlot) {
      this.plot = JSON.parse(savedPlot);
      // Ensure defaults/migrations
      if (this.plot) {
        if (this.plot.health === undefined) this.plot.health = 100;
        if (this.plot.weed_level === undefined) this.plot.weed_level = 0;
        if (this.plot.pest_level === undefined) this.plot.pest_level = 0;
        if (this.plot.fertilizer_level === undefined) this.plot.fertilizer_level = 0;
        if (this.plot.tools === undefined) this.plot.tools = [];
        if (this.plot.land_expansion_level === undefined) this.plot.land_expansion_level = 1;
        if (!this.plot.location_name) this.plot.location_name = "Verdant Outpost";
      }
    }
    if (savedStats) this.stats = JSON.parse(savedStats);
    if (savedBalance) this.balance = parseFloat(savedBalance);
    if (savedPrices) this.cropPrices = JSON.parse(savedPrices);
  }

  private saveState() {
    if (this.plot) localStorage.setItem('geogrow_plot', JSON.stringify(this.plot));
    if (this.stats) localStorage.setItem('geogrow_stats', JSON.stringify(this.stats));
    localStorage.setItem('geogrow_balance', this.balance.toString());
    localStorage.setItem('geogrow_crop_prices', JSON.stringify(this.cropPrices));
  }

  async getPlot(): Promise<PlotData | null> {
    if (this.plot) {
      const now = Date.now();
      const elapsedSecs = (now - this.plot.last_update) / 1000;

      if (this.plot.is_planted && this.plot.growth_progress < 1000000) {
        // Simulated Weather Modifiers
        let weatherGrowthMod = 1.0;
        let weatherWeedMod = 1.0;
        let weatherFertilizerMod = 1.0;

        switch (this.plot.condition) {
          case "sunny":
            weatherGrowthMod = 1.5;
            weatherWeedMod = 0.8;
            weatherFertilizerMod = 1.5; // Rapid decay in heat
            break;
          case "rainy":
            weatherGrowthMod = 1.0;
            weatherWeedMod = 2.0; // Weeds love rain
            weatherFertilizerMod = 0.7; // Washed away slowly
            break;
          case "stormy":
            weatherGrowthMod = 0.5;
            weatherWeedMod = 0.5;
            weatherFertilizerMod = 2.0; // Washed away fast
            break;
          case "cloudy":
            weatherGrowthMod = 1.1;
            weatherWeedMod = 1.1;
            weatherFertilizerMod = 1.0;
            break;
        }

        // Growth logic
        const weedPenalty = 1 - (this.plot.weed_level / 200); // Up to 50% slower growth
        const pestPenalty = 1 - (this.plot.pest_level / 250); // Up to 40% slower growth
        const fertilizerBonus = 1 + (this.plot.fertilizer_level / 100); // Up to 100% faster growth
        
        // Base growth adjusted by weather and modifiers
        const passiveGrowth = Math.floor(elapsedSecs * 1000 * weatherGrowthMod * weedPenalty * pestPenalty * fertilizerBonus); 
        this.plot.growth_progress = Math.min(1000000, this.plot.growth_progress + passiveGrowth);

        // Update health based on moisture, weeds, pests and storms
        let healthChange = 0;
        if (this.plot.moisture < 25 || this.plot.moisture > 90) {
          healthChange -= elapsedSecs * 0.5;
        } else if (this.plot.moisture >= 40 && this.plot.moisture <= 75) {
          healthChange += elapsedSecs * 0.4;
        }
        
        // Storm damage
        if (this.plot.condition === "stormy") {
          healthChange -= elapsedSecs * 1.5;
        }

        // Weeds damage health
        if (this.plot.weed_level > 20) {
          healthChange -= (this.plot.weed_level / 100) * elapsedSecs * 0.8;
        }

        // Pests damage health
        if (this.plot.pest_level > 15) {
          healthChange -= (this.plot.pest_level / 100) * elapsedSecs * 1.2;
        }
        
        this.plot.health = Math.max(0, Math.min(100, this.plot.health + healthChange));

        // Weed growth
        const baseWeedGrowth = 0.15;
        this.plot.weed_level = Math.min(100, this.plot.weed_level + elapsedSecs * baseWeedGrowth * weatherWeedMod);

        // Pest growth (accelerates if high weeds)
        const basePestGrowth = 0.08 + (this.plot.weed_level * 0.002);
        this.plot.pest_level = Math.min(100, this.plot.pest_level + elapsedSecs * basePestGrowth);
        
        // Fertilizer decay
        const baseFertilizerDecay = 0.08;
        this.plot.fertilizer_level = Math.max(0, this.plot.fertilizer_level - elapsedSecs * baseFertilizerDecay * weatherFertilizerMod);
      }

      // Moisture dynamics
      const dryingRate = this.plot.condition === "sunny" ? 0.08 : 0.03;
      const wettingRate = (this.plot.condition === "rainy" || this.plot.condition === "stormy") ? 0.5 : 0;
      
      this.plot.moisture = Math.max(0, Math.min(100, this.plot.moisture - (elapsedSecs * dryingRate) + (elapsedSecs * wettingRate)));

      this.plot.last_update = now;
      this.saveState();
    }
    return this.plot;
  }

  async getStats(): Promise<GameStats | null> {
    return this.stats || { total_harvests: 0, total_earned: 0, seeds_planted: 0 };
  }

  async getBalance(): Promise<number> {
    return this.balance;
  }

  async getCropPrices(): Promise<Record<string, number>> {
    // Attempt block index retrieval
    try {
      const livePrices = await genlayerService.getCropPricesFromChain();
      if (livePrices && Object.keys(livePrices).length > 0) {
        this.cropPrices = { ...this.cropPrices, ...livePrices };
        this.saveState();
      }
    } catch (e) {
      console.warn("Could not load fresh on-chain prices, using memory cache", e);
    }
    return this.cropPrices;
  }

  async syncCropPrices(): Promise<Record<string, number>> {
    try {
      const activeConsensus = await genlayerService.syncCropPricesOnChain();
      if (activeConsensus && Object.keys(activeConsensus).length > 0) {
        this.cropPrices = { ...this.cropPrices, ...activeConsensus };
        this.saveState();
      }
    } catch (e) {
      console.error("AI Price validation block creation failed:", e);
    }
    return this.cropPrices;
  }

  async claimPlot(cropType: string): Promise<void> {
    // Simulated Location Near User
    const simCoords = await genlayerService.getPlayerLocation();
    const weather = await genlayerService.fetchRealTimeWeather();

    this.plot = {
      latitude: Math.floor(simCoords.lat * 1000000),
      longitude: Math.floor(simCoords.lng * 1000000),
      location_name: weather.locationName || "Verdant Outpost",
      crop_type: cropType,
      growth_progress: 0,
      health: 100,
      moisture: 50,
      soil_status: "Raw",
      is_planted: false,
      condition: weather.condition,
      weed_level: 0,
      pest_level: 0,
      fertilizer_level: 0,
      last_update: Date.now(),
      tools: [],
      land_expansion_level: 1
    };
    
    this.stats = {
      total_harvests: 0,
      total_earned: 0,
      seeds_planted: 0
    };
    
    this.saveState();
    await genlayerService.recordActionOnChain("CLAIM_PLOT", { cropType, lat: simCoords.lat, lng: simCoords.lng });
    // Pull on-chain prices to initialize
    await this.getCropPrices();
  }

  // Simulated weather transitions
  async syncCondition(): Promise<PlotData | null> {
    if (!this.plot) return null;
    
    try {
      const weather = await genlayerService.fetchRealTimeWeather();
      this.plot.condition = weather.condition;
      this.plot.location_name = weather.locationName || "Verdant Outpost";

      // Real-time synchronization bonus (simulated)
      if (this.plot.is_planted) {
        this.plot.growth_progress = Math.min(1000000, this.plot.growth_progress + 30000);
      }
      
      this.saveState();
    } catch (e) {
      console.error("Weather update failed", e);
    }
    
    return this.plot;
  }

  async timeWarp(): Promise<PlotData | null> {
    if (!this.plot || !this.plot.is_planted || this.balance < 5.0) return this.plot;
    
    this.balance -= 5.0; // Warp costs 5 $GEN on-chain
    this.plot.growth_progress = Math.min(1000000, this.plot.growth_progress + 250000);
    this.plot.health = Math.max(0, this.plot.health - 5);
    
    try {
      await genlayerService.activateTimeWarpOnChain(5.0);
    } catch (e) {
      console.error("On-chain warp failed", e);
    }
    
    this.saveState();
    return this.plot;
  }

  async harvest(): Promise<void> {
    if (!this.plot || this.plot.growth_progress < 1000000) return;
    
    // Read dynamic price registry validated from AI smart contract
    const currentPrices = await this.getCropPrices();
    const payout = currentPrices[this.plot.crop_type] || 2.50;
    
    this.balance += payout;
    
    if (this.stats) {
      this.stats.total_harvests += 1;
      this.stats.total_earned += payout;
    }
    
    const harvestedType = this.plot.crop_type;

    // Reset plot after harvest
    this.plot.growth_progress = 0;
    this.plot.soil_status = "Cleared";
    this.plot.is_planted = false;
    
    try {
      await genlayerService.harvestCropOnChain(harvestedType, payout);
    } catch (e) {
      console.error("On-chain harvest transaction failed", e);
    }

    this.saveState();
  }

  // Purchases
  async purchaseTool(toolId: string, cost: number): Promise<void> {
    if (this.balance < cost) throw new Error("Insufficient $GEN balance for tool purchase");
    
    if (this.plot) {
      if (!this.plot.tools) this.plot.tools = [];
      if (this.plot.tools.includes(toolId)) {
        throw new Error("You already own this tool!");
      }
      
      this.balance -= cost;
      this.plot.tools.push(toolId);
      
      try {
        await genlayerService.buyToolOnChain(toolId, cost);
      } catch (e) {
        console.error("On-chain buy_tool purchase failed:", e);
      }
      
      this.saveState();
    }
  }

  async purchaseLandExpansion(cost: number): Promise<void> {
    if (this.balance < cost) throw new Error("Insufficient $GEN balance for land expansion");
    
    if (this.plot) {
      const currentLvl = this.plot.land_expansion_level || 1;
      this.balance -= cost;
      this.plot.land_expansion_level = currentLvl + 1;

      try {
        await genlayerService.buyLandExpansionOnChain(cost);
      } catch (e) {
        console.error("On-chain purchase of land expansion failed:", e);
      }

      this.saveState();
    }
  }

  async purchaseFertilizer(boostId: string, cost: number, progressAdd: number): Promise<void> {
    if (this.balance < cost) throw new Error("Insufficient $GEN balance for fertilizer");
    
    if (this.plot) {
      this.balance -= cost;
      this.plot.fertilizer_level = Math.min(100, this.plot.fertilizer_level + progressAdd);

      try {
        await genlayerService.recordActionOnChain("FERTILIZE_RWA", { id: boostId, level: this.plot.fertilizer_level, spend: cost });
      } catch (e) {
        console.error("On-chain fertilizer purchase failed:", e);
      }

      this.saveState();
    }
  }

  async clearSoil(): Promise<void> {
    if (this.plot && this.plot.soil_status === "Raw") {
      this.plot.soil_status = "Cleared";
      await genlayerService.recordActionOnChain("CLEAR", { status: "Cleared" });
      this.saveState();
    }
  }

  async prepareSoil(): Promise<void> {
    if (this.plot && this.plot.soil_status === "Cleared") {
      this.plot.soil_status = "Prepared";
      await genlayerService.recordActionOnChain("HOE", { status: "Prepared" });
      this.saveState();
    }
  }

  async plantCrop(cropType?: string): Promise<void> {
    if (this.plot && this.plot.soil_status === "Prepared" && !this.plot.is_planted) {
      if (cropType) {
        this.plot.crop_type = cropType;
      }
      this.plot.is_planted = true;
      this.plot.weed_level = 0; // Fresh start
      this.plot.pest_level = 0;
      if (this.stats) {
        this.stats.seeds_planted += 1;
      }
      await genlayerService.recordActionOnChain("PLANT_CROP", { cropType: this.plot.crop_type });
      this.saveState();
    }
  }

  async fertilize(): Promise<void> {
    if (this.plot && this.plot.is_planted) {
      // Free basic compost
      this.plot.fertilizer_level = Math.min(100, this.plot.fertilizer_level + 20);
      await genlayerService.recordActionOnChain("FERTILIZE", { level: this.plot.fertilizer_level });
      this.saveState();
    }
  }

  async weed(): Promise<void> {
    if (this.plot && this.plot.is_planted) {
      // Check if they have the Herbicider for 2x power
      const hasHerbicider = this.plot.tools?.includes("weed") || false;
      const reduction = hasHerbicider ? 80 : 40;
      this.plot.weed_level = Math.max(0, this.plot.weed_level - reduction);
      await genlayerService.recordActionOnChain("WEED", { level: this.plot.weed_level, boosted: hasHerbicider });
      this.saveState();
    }
  }

  async spray(): Promise<void> {
    if (this.plot && this.plot.is_planted) {
      // Check if they have the Spray tool for 2x power
      const hasSprayer = this.plot.tools?.includes("spray") || false;
      const reduction = hasSprayer ? 90 : 45;
      this.plot.pest_level = Math.max(0, this.plot.pest_level - reduction);
      await genlayerService.recordActionOnChain("SPRAY", { level: this.plot.pest_level, boosted: hasSprayer });
      this.saveState();
    }
  }

  async water(): Promise<void> {
    if (this.plot) {
      this.plot.moisture = Math.min(100, this.plot.moisture + 30);
      await genlayerService.recordActionOnChain("WATER", { level: this.plot.moisture });
      this.saveState();
    }
  }

  reset() {
    localStorage.removeItem('geogrow_plot');
    localStorage.removeItem('geogrow_stats');
    localStorage.removeItem('geogrow_balance');
    localStorage.removeItem('geogrow_crop_prices');
    this.plot = null;
    this.stats = null;
    this.balance = INITIAL_BALANCE;
  }
}

export const gameService = new GameService();
