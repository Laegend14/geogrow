import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingCart, Hammer, Bug, Skull, TrendingUp, DollarSign, 
  RotateCw, Shield, Globe, Compass, Sparkles, Layers, Leaf, Map, 
  ChevronRight, BadgeCheck, Loader2
} from "lucide-react";
import { gameService } from "../services/gameService";

interface MarketTerminalProps {
  balance: number;
  cropType: string;
  isMature: boolean;
  loading: boolean;
  onSell: () => void;
  plot: any;
  onRefreshState: () => void;
}

export const MarketTerminal: React.FC<MarketTerminalProps> = ({ 
  balance, 
  cropType, 
  isMature,
  loading,
  onSell,
  plot,
  onRefreshState
}) => {
  const [activeTab, setActiveTab] = useState<"crops" | "equipment" | "territory" | "boosters">("crops");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [syncingPrices, setSyncingPrices] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPrices();
  }, [plot]);

  const loadPrices = async () => {
    const livePrices = await gameService.getCropPrices();
    setPrices(livePrices);
  };

  const handleSyncPrices = async () => {
    setSyncingPrices(true);
    setTxHash(null);
    try {
      const updated = await gameService.syncCropPrices();
      setPrices(updated);
      setTxHash(`0x${Math.floor(Math.random() * 1000000000).toString(16)}...${Math.floor(Math.random() * 1000).toString(16)}`);
      onRefreshState();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingPrices(false);
    }
  };

  const handleBuyTool = async (toolId: string, cost: number) => {
    setPurchaseLoading(toolId);
    try {
      await gameService.purchaseTool(toolId, cost);
      onRefreshState();
    } catch (e: any) {
      alert(e.message || "Failed to buy tool");
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleBuyLand = async (cost: number) => {
    setPurchaseLoading("land");
    try {
      await gameService.purchaseLandExpansion(cost);
      onRefreshState();
    } catch (e: any) {
      alert(e.message || "Failed to expand land");
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleBuyBooster = async (boostId: string, cost: number, power: number) => {
    setPurchaseLoading(boostId);
    try {
      await gameService.purchaseFertilizer(boostId, cost, power);
      onRefreshState();
    } catch (e: any) {
      alert(e.message || "Failed to buy booster");
    } finally {
      setPurchaseLoading(null);
    }
  };

  const ownedTools = plot?.tools || [];
  const currentLandLvl = plot?.land_expansion_level || 1;
  const landCost = currentLandLvl * 100;

  const TOOLS = [
    { id: "clear", name: "Land Cleaver", cost: 50, description: "Removes rocks, thick brush and trees from untamed soil.", icon: Hammer },
    { id: "hoe", name: "Sovereign Hoe", cost: 100, description: "Engineered tool to ridge and deep-till raw plots.", icon: Compass },
    { id: "weed", name: "Bio-Herbicider", cost: 30, description: "Double standard weeding power. Keeps weeds clear.", icon: Leaf },
    { id: "spray", name: "Pest-Nullifier", cost: 40, description: "Double pest eradication power. Purges parasite pests.", icon: Bug },
  ];

  const BOOSTERS = [
    { id: "boost_nitro", name: "Super Nitro Booster", cost: 8, power: 80, description: "Heavy nitrogen crystals. Grants +80% Soil Nutrition.", icon: Sparkles },
    { id: "boost_kelp", name: "Coastal Kelp Extract", cost: 5, power: 50, description: "Rich deep sea organic minerals. Grants +50% Soil Nutrition.", icon: Leaf },
    { id: "boost_humic", name: "Concentrated Humic Acid", cost: 3, power: 30, description: "Humic sub-surface carbon compost. Grants +30% Soil Nutrition.", icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111116] text-white overflow-hidden border-t border-white/5">
      {/* Wallet Balance Display */}
      <div className="p-6 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-black border-b border-white/5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield size={12} className="text-emerald-400" /> Secure Web3 Balance
          </span>
          <span className="text-[9px] font-bold text-white/30 uppercase">Arc Contract 1:1</span>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-extrabold tracking-tight text-white flex items-center">
            <DollarSign className="text-emerald-400 -ml-1 mt-1" size={24} />
            {balance.toFixed(2)}
            <span className="text-xs font-black text-indigo-300 ml-1.5 tracking-wider uppercase">GEN</span>
          </div>
          <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">
            Active
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/60 p-1 gap-1">
        {(["crops", "equipment", "territory", "boosters"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTab === tab
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-extrabold shadow-sm"
                : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent font-medium"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "crops" && (
            <motion.div
              key="crops"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Dynamic RWA Prices Banner */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe size={12} className="text-indigo-400" /> On-Chain RWA Oracles
                    </h4>
                    <p className="text-[9px] text-white/50 mt-1">
                      Dynamic prices determined by GenLayer LLM consensus nodes.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncPrices}
                    disabled={syncingPrices}
                    className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase disabled:opacity-40"
                  >
                    {syncingPrices ? (
                      <RotateCw size={12} className="animate-spin" />
                    ) : (
                      <RotateCw size={12} />
                    )}
                    Sync oracle
                  </button>
                </div>

                {txHash && (
                  <div className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg font-mono mb-3 uppercase flex justify-between items-center">
                    <span>Block consensus reached!</span>
                    <span>Hash: {txHash}</span>
                  </div>
                )}

                {/* Price Table */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {Object.entries(prices).map(([crop, price]) => (
                    <div key={crop} className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{crop}</span>
                      <span className="text-[11px] font-black text-emerald-400">{price.toFixed(2)} GEN</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell Hub */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isMature 
                  ? 'bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border-emerald-500/30' 
                  : 'bg-white/[0.02] border-white/5 opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Stock Ledger</span>
                    <h3 className="text-sm font-black text-white uppercase mt-0.5">Settle Yield On-chain</h3>
                  </div>
                  {isMature ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-black uppercase shadow-sm">
                      Matured
                    </span>
                  ) : (
                    <span className="text-[9px] bg-white/5 text-white/40 border border-white/5 px-2 py-0.5 rounded-lg font-bold uppercase">
                      Growing
                    </span>
                  )}
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[8px] font-bold text-white/30 uppercase block">Active Hybrid Crop</span>
                    <span className="text-xs font-black text-indigo-300 uppercase">{plot?.crop_type || "N/A"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-white/30 uppercase block">Current Oracle Quote</span>
                    <span className="text-sm font-black text-emerald-400">
                      {(prices[plot?.crop_type || ""] || 0).toFixed(2)} GEN
                    </span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: isMature ? 1.01 : 1 }}
                  whileTap={{ scale: isMature ? 0.99 : 1 }}
                  onClick={onSell}
                  disabled={!isMature || loading}
                  className="w-full py-3.5 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border-b-4 border-emerald-700 shadow-lg disabled:opacity-20 disabled:hover:scale-100 flex justify-center items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Publishing to Chain...
                    </>
                  ) : (
                    "Sell Yield & Secure Payout"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "equipment" && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {TOOLS.map((tool) => {
                const owned = ownedTools.includes(tool.id);
                const isAffordable = balance >= tool.cost;
                const buying = purchaseLoading === tool.id;

                return (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        <tool.icon size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white uppercase flex items-center gap-1.5">
                          {tool.name}
                          {owned && (
                            <span className="text-[8px] bg-emerald-500/25 border border-emerald-500/50 text-emerald-400 px-1.5 py-0.5 rounded-full font-black uppercase">
                              Owned
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-white/50 mt-1 max-w-[200px] leading-relaxed">
                          {tool.description}
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={owned || !isAffordable || buying}
                      onClick={() => handleBuyTool(tool.id, tool.cost)}
                      className={`px-3 py-2 rounded-lg font-black uppercase text-[10px] tracking-wider border transition-all ${
                        owned
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                          : isAffordable
                          ? "bg-indigo-600/10 text-indigo-300 hover:bg-indigo-600 hover:text-white border-indigo-500/30 hover:border-indigo-500"
                          : "bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed"
                      }`}
                    >
                      {buying ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : owned ? (
                        <BadgeCheck size={14} className="text-emerald-400" />
                      ) : (
                        `${tool.cost} GEN`
                      )}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "territory" && (
            <motion.div
              key="territory"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-black border border-white/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-indigo-500/10 pointer-events-none">
                  <Map size={180} />
                </div>
                
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
                  Sovereign Territory Bounds
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Expand Agricultural Land
                </h3>
                <p className="text-[10px] text-white/50 mt-2 max-w-[240px] leading-relaxed">
                  Purchase advanced sovereign title expansions 1:1 on-chain. Increases farming efficiency and provides extra space.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-bold text-white/30 uppercase block">Land Level</span>
                    <span className="text-lg font-black text-indigo-300">Lvl {currentLandLvl}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-bold text-white/30 uppercase block">Upgrade Cost</span>
                    <span className="text-lg font-black text-emerald-400">{landCost} GEN</span>
                  </div>
                </div>

                <button
                  disabled={balance < landCost || purchaseLoading === "land"}
                  onClick={() => handleBuyLand(landCost)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border-b-4 border-indigo-800 shadow-lg mt-6 disabled:opacity-20 flex justify-center items-center gap-1.5"
                >
                  {purchaseLoading === "land" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Expanding territory...
                    </>
                  ) : (
                    "Authorize Land Expansion"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "boosters" && (
            <motion.div
              key="boosters"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {BOOSTERS.map((boost) => {
                const isAffordable = balance >= boost.cost;
                const buying = purchaseLoading === boost.id;

                return (
                  <div
                    key={boost.id}
                    className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <boost.icon size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white uppercase">
                          {boost.name}
                        </div>
                        <div className="text-[9px] text-white/50 mt-1 max-w-[200px] leading-relaxed">
                          {boost.description}
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!isAffordable || buying}
                      onClick={() => handleBuyBooster(boost.id, boost.cost, boost.power)}
                      className={`px-3 py-2 rounded-lg font-black uppercase text-[10px] tracking-wider border transition-all ${
                        isAffordable
                          ? "bg-emerald-600/10 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/30 hover:border-emerald-500"
                          : "bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed"
                      }`}
                    >
                      {buying ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        `${boost.cost} GEN`
                      )}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
