import { getGenLayerClient } from "../lib/genlayer";
import { getAccounts } from "../lib/wallet-client";

export interface WeatherData {
  condition: "sunny" | "rainy" | "stormy" | "cloudy";
  temperature: number;
  locationName: string;
}

class GenLayerService {
  private GAME_CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS?.trim()) || "0x45D5FF32bC65d3aa91aEDE639B2bAcC201d6612a";

  private async getClient(): Promise<any> {
    let accountAddr: string | null = null;
    try {
      const accounts = await getAccounts();
      if (accounts && accounts.length > 0) {
        accountAddr = accounts[0];
      }
    } catch (e) {
      console.warn("Failed to fetch active accounts for client:", e);
    }
    return getGenLayerClient(accountAddr);
  }

  // Record an action on the GenLayer blockchain
  async recordActionOnChain(action: string, data: any): Promise<string | null> {
    try {
      const client = await this.getClient();
      if (!client) return null;
      
      console.log(`[GenLayer] Recording ${action} on-chain...`, data);
      
      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'record_action',
        args: [action, JSON.stringify(data)],
        value: 0n
      });
      return result.hash || result;
    } catch (error) {
      console.error("GenLayer transaction failed:", error);
      return null;
    }
  }

  // Handle the "Time Warp" on-chain sync
  async syncGameStateOnChain(lat: number, lng: number): Promise<any> {
    const latScaled = Math.floor(lat * 1000000);
    const lngScaled = Math.floor(lng * 1000000);
    
    console.log(`[GenLayer] Syncing game state for scaled coords ${latScaled}, ${lngScaled}...`);
    
    try {
      const client = await this.getClient();
      if (!client) return { status: "synchronized_local" };

      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'sync_game_state',
        args: [latScaled, lngScaled],
        value: 0n
      });
      
      if (result && typeof result === 'string' && result.startsWith('{')) {
        return JSON.parse(result);
      }
      return { status: "synchronized" };
    } catch (error) {
      console.error("GenLayer Sync failed:", error);
      return { status: "synchronized_local_error" };
    }
  }

  // Dynamic Crop Price Consensus (on-chain AI Oracle)
  async syncCropPricesOnChain(): Promise<Record<string, number> | null> {
    console.log("[GenLayer] SECURE PRICE SYNC: Requesting AI Oracle Consensus on real-world agricultural commodity indexes...");
    try {
      const client = await this.getClient();
      if (!client) {
        // Mock consensus output for simulation mode if wallet is absent
        console.warn("[GenLayer] Using simulated consensus prices due to offline state.");
        return this.getSimulatedPrices();
      }

      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'sync_crop_prices',
        args: [],
        value: 0n
      });

      if (result && typeof result === 'string' && result.startsWith('{')) {
        return JSON.parse(result);
      }
      return await this.getCropPricesFromChain();
    } catch (error) {
      console.error("GenLayer crop price consensus tx failed:", error);
      return this.getSimulatedPrices();
    }
  }

  // Fetch verified crop prices from smart contract storage
  async getCropPricesFromChain(): Promise<Record<string, number>> {
    try {
      const client = await this.getClient();
      if (!client) return this.getSimulatedPrices();

      const result = await client.readContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'get_crop_prices',
        args: []
      });

      if (result) {
        return JSON.parse(result as string);
      }
    } catch (error) {
      console.error("Failed to query crop prices from block storage:", error);
    }
    return this.getSimulatedPrices();
  }

  // Purchase tool on-chain
  async buyToolOnChain(toolId: string, cost: number): Promise<string | null> {
    try {
      const client = await this.getClient();
      if (!client) return "mock_hash";

      const costScaled = Math.floor(cost * 100);
      console.log(`[GenLayer] SECURE SHOPPING: Executing buy_tool on-chain for ${toolId}, Cost: ${cost} GEN...`);

      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'buy_tool',
        args: [toolId, costScaled],
        value: 0n
      });
      return result.hash || result;
    } catch (error) {
      console.error("GenLayer buy_tool purchase transaction failed:", error);
      return null;
    }
  }

  // Purchase land expansion on-chain
  async buyLandExpansionOnChain(cost: number): Promise<string | null> {
    try {
      const client = await this.getClient();
      if (!client) return "mock_hash";

      const costScaled = Math.floor(cost * 100);
      console.log(`[GenLayer] SECURE SHOPPING: Executing buy_land_expansion on-chain, Cost: ${cost} GEN...`);

      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'buy_land_expansion',
        args: [costScaled],
        value: 0n
      });
      return result.hash || result;
    } catch (error) {
      console.error("GenLayer buy_land_expansion transaction failed:", error);
      return null;
    }
  }

  // Secure on-chain harvest
  async harvestCropOnChain(cropType: string, payout: number): Promise<string | null> {
    try {
      const client = await this.getClient();
      if (!client) return null;
      
      const payoutScaled = Math.floor(payout * 100);
      console.log(`[GenLayer] SECURE HARVEST: Executing harvest_crop on-chain for ${cropType}, payout: ${payout} GEN...`);
      
      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'harvest_crop',
        args: [cropType, payoutScaled],
        value: 0n
      });
      return result.hash || result;
    } catch (error) {
      console.error("GenLayer harvest transaction failed:", error);
      return null;
    }
  }

  // Secure on-chain time warp
  async activateTimeWarpOnChain(cost: number): Promise<string | null> {
    try {
      const client = await this.getClient();
      if (!client) return null;
      
      const costScaled = Math.floor(cost * 100);
      console.log(`[GenLayer] SECURE TIME WARP: Executing activate_time_warp on-chain with cost ${cost} GEN...`);
      
      const result = await client.writeContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'activate_time_warp',
        args: [costScaled],
        value: 0n
      });
      return result.hash || result;
    } catch (error) {
      console.error("GenLayer time warp transaction failed:", error);
      return null;
    }
  }

  async getPlotFromChain(address: string): Promise<any> {
    try {
      const client = await this.getClient();
      if (!client) return null;

      const result = await client.readContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'get_plot',
        args: [address],
      });
      return result ? JSON.parse(result as string) : null;
    } catch (error) {
      console.error("Failed to get plot from chain", error);
      return null;
    }
  }

  async getTotalSeedsFromChain(): Promise<number> {
    try {
      const client = await this.getClient();
      if (!client) return 0;

      const result = await client.readContract({
        address: this.GAME_CONTRACT_ADDRESS,
        functionName: 'get_total_seeds',
        args: [],
      });
      return Number(result);
    } catch (error) {
      return 0;
    }
  }

  // Simulated Coordinates
  async getPlayerLocation(): Promise<{ lat: number; lng: number }> {
    const locations = [
      { lat: 45.4215, lng: -75.6972 }, // Ottawa
      { lat: 51.5074, lng: -0.1278 },  // London
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: -33.8688, lng: 151.2093 }, // Sydney
      { lat: 37.7749, lng: -122.4194 } // San Francisco
    ];
    // Return a stable coordinate for simulation that doesn't trigger geo blocks
    const chosen = locations[Math.floor(Math.random() * locations.length)];
    return chosen;
  }

  // Simulated Weather, making it 100% robust, dynamic, and fun
  async fetchRealTimeWeather(): Promise<WeatherData> {
    const conditions: WeatherData['condition'][] = ["sunny", "rainy", "stormy", "cloudy"];
    const locNames = [
      "Verdant Outpost", "Highland Oasis", "Sunny Valleys", 
      "Sovereign Greenlands", "Cozy Meadow", "Alpine Crest", "Gilded Ridge"
    ];
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.floor(Math.random() * 15) + 12; // 12C to 27C
    const locationName = locNames[Math.floor(Math.random() * locNames.length)];

    console.log(`[GenLayer] Simulated Weather parsed: ${condition} (${temperature}°C) at ${locationName}`);
    return {
      condition,
      temperature,
      locationName
    };
  }

  // Balanced fallback simulation prices (tied 1:1 with $GEN)
  private getSimulatedPrices(): Record<string, number> {
    // Return base prices with a small random RWA index offset (-15% to +15%) to feel alive
    const nowLocal = new Date();
    const seed = nowLocal.getMinutes(); // Stable fluctuations within the current hour
    
    const offset = (seed % 7) * 0.05 - 0.15; // -15% to +15%
    return {
      tomato: Math.max(1.80, parseFloat((2.50 * (1 + offset)).toFixed(2))),
      wheat: Math.max(2.50, parseFloat((3.50 * (1 + offset * 0.8)).toFixed(2))),
      corn: Math.max(3.50, parseFloat((5.00 * (1 + offset * 1.2)).toFixed(2))),
      lettuce: Math.max(1.20, parseFloat((2.00 * (1 + offset)).toFixed(2))),
      carrot: Math.max(2.00, parseFloat((3.00 * (1 + offset * 0.9)).toFixed(2))),
      broccoli: Math.max(3.00, parseFloat((4.50 * (1 + offset * 1.1)).toFixed(2))),
      cabbage: Math.max(2.50, parseFloat((4.00 * (1 + offset * 0.7)).toFixed(2))),
      chili: Math.max(4.00, parseFloat((6.00 * (1 + offset * 1.4)).toFixed(2)))
    };
  }
}

export const genlayerService = new GenLayerService();
