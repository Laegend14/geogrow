/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { UIOverlay } from "./components/UIOverlay";
import { FarmCanvas } from "./components/FarmCanvas";
import { Providers } from "./components/Providers";
import { useWallet } from "./components/WalletProvider";
import { useFarmAudio } from "./hooks/useFarmAudio";
import { gameService } from "./services/gameService";

const DEFAULT_COORDS = { lat: 36834000, lon: -24637000 };

function GeoGrowApp() {
  const { account, connect, isAuthenticated } = useWallet();
  const [plot, setPlot] = useState<any>(null);
  const [balance, setBalance] = useState<number>(10.0);
  const [stats, setStats] = useState<any>({ total_harvests: 0, total_earned: 0 });
  const [loading, setLoading] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "rainy" | "stormy" | "cloudy">("sunny");
  const [view, setView] = useState<"landing" | "onboarding" | "farm">("landing");

  const { 
    playWarpSound, 
    playHarvestSound, 
    playHoeSound, 
    playWaterSound, 
    playWeedSound, 
    playSpraySound 
  } = useFarmAudio({ condition: weatherCondition });

  const fetchPlotData = useCallback(async () => {
    try {
      const data = await gameService.getPlot();
      
      if (!data) {
        setView("onboarding");
      } else {
        setPlot(data);
        if (data.condition) setWeatherCondition(data.condition);
        
        const bal = await gameService.getBalance();
        setBalance(bal);

        const currentStats = await gameService.getStats();
        setStats(currentStats);
        
        setView("farm");
      }
    } catch (error) {
      console.error("[GeoGrow] Failed to fetch simulation data:", error);
      if (!plot) setView("onboarding");
    }
  }, [plot]);

  useEffect(() => {
    if (isAuthenticated && account) {
      setLoading(true);
      fetchPlotData().finally(() => setLoading(false));
      
      // Polling for simulation updates (faster than chain)
      const interval = setInterval(() => {
        // Auto-growth simulation could happen here or in service
        fetchPlotData();
      }, 5000); 
      return () => clearInterval(interval);
    } else {
      setView("landing");
    }
  }, [isAuthenticated, account, fetchPlotData]);

  const handleClaim = async (cropType: string) => {
    setLoading(true);
    try {
      if (cropType === "refresh") {
        await fetchPlotData();
      } else {
        await gameService.claimPlot(cropType);
        await fetchPlotData();
      }
    } catch (e: any) {
      alert(`Action failed: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWeather = async () => {
    setLoading(true);
    try {
      await gameService.syncCondition();
      await fetchPlotData();
    } finally {
      setLoading(false);
    }
  };

  const handleTimeWarp = async () => {
    setLoading(true);
    playWarpSound();
    try {
      await gameService.timeWarp();
      await fetchPlotData();
    } finally {
      setLoading(false);
    }
  };

  const handleHarvest = async () => {
    setLoading(true);
    playHarvestSound();
    try {
      await gameService.harvest();
      await fetchPlotData();
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = async (item: any) => {
    try {
      await gameService.purchaseTool(item.id || "tool", item.cost || 10);
      await fetchPlotData();
    } catch (e) {
      console.error("Purchase failed", e);
    }
  };

  const handleExecuteAction = async (actionType: string, payload?: any) => {
    setLoading(true);
    try {
      if (actionType === "clear") {
        playWeedSound();
        await gameService.clearSoil();
      } else if (actionType === "prepare") {
        playHoeSound();
        await gameService.prepareSoil();
      } else if (actionType === "plant") {
        playWaterSound();
        await gameService.plantCrop(payload);
      } else if (actionType === "fertilize") {
        playWarpSound(); // plays sparkles
        await gameService.fertilize();
      } else if (actionType === "weed") {
        playWeedSound();
        await gameService.weed();
      } else if (actionType === "spray") {
        playSpraySound();
        await gameService.spray();
      } else if (actionType === "water") {
        playWaterSound();
        await gameService.water();
      }
      await fetchPlotData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black text-white selection:bg-emerald-500/30 overflow-hidden">
      <UIOverlay 
        plot={plot} 
        loading={loading}
        balance={balance}
        stats={stats}
        onConnect={connect}
        onSync={handleSyncWeather}
        onWarp={handleTimeWarp}
        onHarvest={handleHarvest}
        onClaim={handleClaim}
        onAction={handleExecuteAction}
        onBuy={handleBuyItem}
        view={view}
        onRefreshState={fetchPlotData}
      >
        <FarmCanvas plot={plot} weatherCondition={weatherCondition as any} isLoading={loading} />
      </UIOverlay>
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <GeoGrowApp />
    </Providers>
  );
}

