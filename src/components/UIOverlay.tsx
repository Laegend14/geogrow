import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplet,
  Heart,
  Zap,
  Globe,
  Timer,
  Sprout,
  Target,
  Database,
  Activity,
  ShoppingCart,
  X,
  Scissors,
  Shovel,
  Bug,
} from "lucide-react";
import { useWallet } from "./WalletProvider";
import { MarketTerminal } from "./MarketTerminal";

interface HUDProps {
  plot: any;
  loading: boolean;
  onConnect: () => void;
  onSync: () => void;
  onWarp: () => void;
  onHarvest: () => void;
  onClaim: (crop: string) => void;
  onAction: (type: string, payload?: any) => void;
  onBuy: (item: any) => void;
  balance: number;
  stats: any;
  view: "landing" | "onboarding" | "farm";
  children: React.ReactNode;
  onRefreshState: () => void;
}

const isIframe = () => window.self !== window.top;

const ProgressBar = ({ label, value, max = 100, color, icon: Icon }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#5d4037]">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#8d6e63]" />}
        <span>{label}</span>
      </div>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-4 w-full bg-[#fdf5e6] rounded-full overflow-hidden border-2 border-[#8B4513] shadow-inner">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      />
    </div>
  </div>
);

export const UIOverlay: React.FC<HUDProps> = ({
  plot,
  loading,
  onConnect,
  onSync,
  onWarp,
  onHarvest,
  onClaim,
  onAction,
  onBuy,
  balance,
  stats,
  view,
  children,
  onRefreshState,
}) => {
  const {
    account,
    disconnect,
    isLoading: walletLoading,
    isOnCorrectNetwork,
  } = useWallet();
  const [showMarket, setShowMarket] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);
  const [showSeedPicker, setShowSeedPicker] = React.useState(false);
  const growth = plot?.growth_progress ?? 0;
  const isMature = growth >= 1000000;

  const [logs, setLogs] = React.useState<string[]>([]);
  const [showLogs, setShowLogs] = React.useState(false);

  React.useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      setLogs((prev) => [
        ...prev.slice(-19),
        `[LOG] ${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ")}`,
      ]);
      originalLog(...args);
    };
    console.error = (...args) => {
      setLogs((prev) => [
        ...prev.slice(-19),
        `[ERR] ${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ")}`,
      ]);
      originalError(...args);
    };
    console.warn = (...args) => {
      setLogs((prev) => [
        ...prev.slice(-19),
        `[WRN] ${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ")}`,
      ]);
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden flex flex-col font-sans">
      {/* Background World */}
      <div className="absolute inset-0 z-0 pointer-events-auto">{children}</div>

      {/* Global Header */}
      <div className="p-4 md:p-8 flex justify-between items-start z-20">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="flex flex-col gap-1 p-4 bg-[#FFEB3B] border-4 border-[#8B4513] rounded-3xl shadow-[0_8px_0_#8B4513] pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-[#8B4513] flex items-center justify-center cursor-help shadow-[0_4px_0_#8B4513]"
              onClick={() => setShowLogs(!showLogs)}
            >
              <Sprout size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase text-[#8B4513] drop-shadow-sm">
              GeoGrow
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#8B4513] uppercase">
            <div
              className={`w-2 h-2 rounded-full ${isOnCorrectNetwork ? "bg-green-600" : "bg-red-600"}`}
            ></div>
            {isOnCorrectNetwork ? "StudioNet Ready" : "Please Switch Network"}
          </div>
        </motion.div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (account ? setShowStats(true) : onConnect())}
            className={`p-4 border-4 border-[#8B4513] rounded-3xl shadow-[0_8px_0_#8B4513] flex items-center gap-4 ${
              account ? "bg-[#FFEB3B]" : "bg-white"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${account ? "bg-green-500 shadow-[0_2px_0_#1b5e20]" : "bg-gray-300"}`}
            ></div>
            <span className="text-sm font-black text-[#8B4513] uppercase tracking-wide">
              {account ? `${balance.toFixed(2)} GEN` : "Start Farming"}
            </span>
          </motion.button>

          {account && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={disconnect}
              className="px-3 py-1 bg-white border-2 border-[#8B4513] rounded-full text-xs font-black text-[#C62828] uppercase shadow-[0_2px_0_#8B4513]"
              title="Logout"
            >
              Logout
            </motion.button>
          )}
        </div>
      </div>

      {/* Dynamic Content Views */}
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10 pointer-events-none"
          >
            <div className="max-w-2xl space-y-8 pointer-events-auto">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block p-8 bg-[#FFEB3B] border-8 border-[#8B4513] rounded-[4rem] shadow-[0_16px_0_#8B4513]"
              >
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#8B4513] leading-none drop-shadow-md">
                  GEOGROW <br />
                </h2>
                <div className="bg-[#4CAF50] text-white py-2 px-6 rounded-full inline-block mt-4 border-4 border-[#1b5e20] shadow-[0_4px_0_#1b5e20] font-black italic">
                  STUDIO EDITION
                </div>
              </motion.div>

              <p className="text-[#5d4037] font-bold text-lg max-w-lg mx-auto bg-white/80 p-4 rounded-3xl border-2 border-[#8B4513] shadow-lg backdrop-blur-sm">
                The world's first decentralized farm simulator. Program your
                crops, conquer the market.
              </p>

              <div className="pt-8">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onConnect}
                  className="bg-[#FF9800] text-white px-16 py-6 rounded-[2rem] border-4 border-[#E65100] shadow-[0_12px_0_#E65100] font-black uppercase text-xl pointer-events-auto"
                >
                  Enter The Farm
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {view === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex items-center justify-center p-8 z-10 pointer-events-none"
          >
            <div className="bg-[#FFF9C4] border-8 border-[#8B4513] p-10 rounded-[3rem] max-w-2xl w-full space-y-10 shadow-[0_20px_0_#8B4513] pointer-events-auto">
              <div className="space-y-2 text-center">
                <div className="text-sm font-black text-[#4CAF50] uppercase tracking-widest bg-white/50 inline-block px-4 py-1 rounded-full border-2 border-[#4CAF50]">
                  Protocol Initialized
                </div>
                <h3 className="text-4xl font-black uppercase text-[#8B4513]">
                  Pick Your Starter
                </h3>
                <p className="text-sm text-[#5d4037] font-bold">
                  WHICH CROP WILL KICKSTART YOUR EMPIRE?
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  {
                    id: "tomato",
                    name: "Tomato",
                    desc: "Fast growth, juicy!",
                    color: "bg-red-500",
                    icon: Heart,
                  },
                  {
                    id: "wheat",
                    name: "Wheat",
                    desc: "Solid yield, gold!",
                    color: "bg-yellow-500",
                    icon: Zap,
                  },
                  {
                    id: "corn",
                    name: "Corn",
                    desc: "Super tall, sweet!",
                    color: "bg-orange-400",
                    icon: Target,
                  },
                  {
                    id: "lettuce",
                    name: "Lettuce",
                    desc: "Fresh & leafy!",
                    color: "bg-green-400",
                    icon: Sprout,
                  },
                  {
                    id: "carrot",
                    name: "Carrot",
                    desc: "Deep roots, crunch!",
                    color: "bg-orange-600",
                    icon: Activity,
                  },
                  {
                    id: "broccoli",
                    name: "Broccoli",
                    desc: "Super food!",
                    color: "bg-emerald-600",
                    icon: Sprout,
                  },
                  {
                    id: "cabbage",
                    name: "Cabbage",
                    desc: "Heavy hitter!",
                    color: "bg-green-300",
                    icon: Database,
                  },
                  {
                    id: "chili",
                    name: "Chili",
                    desc: "Spicy profit!",
                    color: "bg-red-700",
                    icon: Zap,
                  },
                ].map((crop) => (
                  <motion.button
                    key={crop.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onClaim(crop.id)}
                    className="flex flex-col gap-4 p-6 bg-white border-4 border-[#8B4513] rounded-[2rem] shadow-[0_8px_0_#8B4513] transition-all text-center pointer-events-auto"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${crop.color} mx-auto border-4 border-[#00000020] flex items-center justify-center shadow-inner`}
                    >
                      <crop.icon
                        size={24}
                        className="text-white drop-shadow-md"
                      />
                    </div>
                    <div>
                      <div className="font-black text-lg text-[#8B4513] uppercase leading-tight">
                        {crop.name}
                      </div>
                      <div className="text-[10px] text-[#5d4037] font-bold mt-1 uppercase opacity-60 leading-tight">
                        {crop.desc}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="text-[10px] font-bold text-[#8B4513]/40 text-center uppercase tracking-tighter">
                  DEPLOYING TO THE SMART CONTRACT REQUIRES NETWORK GAS
                </div>
                {account && (
                  <button
                    onClick={() => onClaim("refresh")}
                    className="text-xs font-black text-[#4CAF50] hover:text-[#388E3C] underline uppercase tracking-widest pointer-events-auto transition-colors"
                  >
                    Sync State
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === "farm" && (
          <motion.div
            key="farm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-between p-4 md:p-8 z-10 pointer-events-none"
          >
            {/* Top Stats */}
            <div className="flex justify-between items-start pointer-events-auto">
              <div
                className="bg-[#FFF9C4] border-solid border-[#8B4513] p-6 rounded-[2rem] space-y-4 shadow-[0_6px_0_#8B4513]"
                style={{
                  width: "269px",
                  height: "242.581px",
                  borderWidth: "0.3333300000000001px",
                }}
              >
                <div className="flex justify-between items-center pb-2 border-b-2 border-[#8B4513]/10">
                  <span className="text-xs font-black text-[#5d4037] uppercase">
                    Plot Status
                  </span>
                  <span className="text-[10px] font-black text-white px-2 py-1 bg-[#4CAF50] rounded-full uppercase border-2 border-[#1b5e20]">
                    STABLE
                  </span>
                </div>

                <div className="space-y-4">
                  <ProgressBar
                    label="Plant Health"
                    value={plot.health}
                    color="bg-red-500"
                    icon={Heart}
                  />
                  <ProgressBar
                    label="Moisture"
                    value={plot.moisture}
                    color="bg-blue-500"
                    icon={Droplet}
                  />
                  <ProgressBar
                    label="Weeds"
                    value={plot.weed_level || 0}
                    color="bg-orange-800"
                    icon={Activity}
                  />
                  <ProgressBar
                    label="Pests"
                    value={plot.pest_level || 0}
                    color="bg-yellow-800"
                    icon={Bug}
                  />
                  <ProgressBar
                    label="Nutrients"
                    value={plot.fertilizer_level || 0}
                    color="bg-emerald-500"
                    icon={Zap}
                  />
                </div>
              </div>

              <div className="bg-[#E1F5FE] border-4 border-[#0288D1] p-4 rounded-[2rem] w-64 space-y-1 text-right shadow-[0_6px_0_#0288D1] hidden md:block">
                <div className="text-[10px] font-black text-[#0288D1] uppercase flex items-center justify-end gap-2">
                  <Globe size={12} /> LOC: {plot.location_name || `${plot.latitude / 1000000}, ${plot.longitude / 1000000}`}
                </div>
                <div className="pt-2 border-t-2 border-[#0288D1]/10 mt-2">
                  <div className="text-[10px] font-black text-[#0288D1]/60 uppercase mb-1">GenLayer Real-Time Feed</div>
                  <div className="text-sm font-black uppercase text-[#0288D1] flex items-center justify-end gap-2">
                    <Activity size={14} /> {plot.condition}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div
              className="flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-auto"
              style={{ width: "1423.01px" }}
            >
              <div className="w-full md:w-1/2 space-y-3 bg-white/90 p-6 rounded-[2.5rem] border-4 border-[#8B4513] shadow-[0_8px_0_#8B4513] backdrop-blur-sm">
                <div className="flex justify-between items-end mb-2">
                  <div className="space-y-1">
                    <div className="text-4xl font-black uppercase text-[#8B4513] drop-shadow-sm">
                      {plot.crop_type}
                    </div>
                    <div className="text-[10px] font-bold text-[#8B4513]/40 uppercase tracking-widest">
                      SOVEREIGN BIO-CONTRACT
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-black text-[#4CAF50] italic drop-shadow-sm">
                      {Math.floor((growth / 1000000) * 100)}%
                    </span>
                    <div className="text-[10px] font-black text-[#5d4037] uppercase">
                      Ready to Harvest
                    </div>
                  </div>
                </div>
                <div className="h-6 w-full bg-[#fdf5e6] rounded-full overflow-hidden border-2 border-[#8B4513] shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(growth / 1000000) * 100}%` }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  />
                </div>
              </div>

              <div className="flex gap-4 pointer-events-auto h-24 mb-2">
                {plot.soil_status === "Raw" && (
                  <ActionButton
                    onClick={() => onAction("clear")}
                    label="Clear"
                    icon={Scissors}
                    loading={loading}
                    bg="bg-[#9E9E9E]"
                    border="border-[#616161]"
                    shadow="shadow-[0_6px_0_#616161]"
                  />
                )}
                {plot.soil_status === "Cleared" && (
                  <ActionButton
                    onClick={() => onAction("prepare")}
                    label="Till"
                    icon={Shovel}
                    loading={loading}
                    bg="bg-[#795548]"
                    border="border-[#5D4037]"
                    shadow="shadow-[0_6px_0_#5D4037]"
                  />
                )}
                {plot.soil_status === "Prepared" && !plot.is_planted && (
                  <ActionButton
                    onClick={() => setShowSeedPicker(true)}
                    label="Plant"
                    icon={Sprout}
                    loading={loading}
                    bg="bg-[#4CAF50]"
                    border="border-[#1b5e20]"
                    shadow="shadow-[0_6px_0_#1b5e20]"
                  />
                )}
                {plot.is_planted && (
                  <>
                    <ActionButton
                      onClick={() => onAction("water")}
                      label="Water"
                      icon={Droplet}
                      loading={loading}
                      bg="bg-[#2196F3]"
                      border="border-[#1976D2]"
                      shadow="shadow-[0_6px_0_#1976D2]"
                    />
                    <ActionButton
                      onClick={() => onAction("weed")}
                      label="Weed"
                      icon={Activity}
                      loading={loading}
                      bg="bg-[#795548]"
                      border="border-[#5D4037]"
                      shadow="shadow-[0_6px_0_#5D4037]"
                    />
                    <ActionButton
                      onClick={() => onAction("spray")}
                      label="Spray"
                      icon={Bug}
                      loading={loading}
                      bg="bg-[#9C27B0]"
                      border="border-[#7B1FA2]"
                      shadow="shadow-[0_6px_0_#7B1FA2]"
                    />
                    <ActionButton
                      onClick={() => onAction("fertilize")}
                      label="Feed"
                      icon={Zap}
                      loading={loading}
                      sub="0.5 GEN"
                      bg="bg-[#8BC34A]"
                      border="border-[#689F38]"
                      shadow="shadow-[0_6px_0_#689F38]"
                    />
                  </>
                )}
                <ActionButton
                  onClick={() => setShowMarket(true)}
                  label="Shop"
                  icon={ShoppingCart}
                  loading={loading}
                  bg="bg-[#2196F3]"
                  border="border-[#1976D2]"
                  shadow="shadow-[0_6px_0_#1976D2]"
                />
                <ActionButton
                  onClick={onSync}
                  label="Sync"
                  icon={Globe}
                  loading={loading}
                  bg="bg-[#4CAF50]"
                  border="border-[#388E3C]"
                  shadow="shadow-[0_6px_0_#388E3C]"
                />
                <ActionButton
                  onClick={onWarp}
                  label="Warp"
                  icon={Zap}
                  loading={loading}
                  sub="1.0 GEN"
                  bg="bg-[#FF9800]"
                  border="border-[#F57C00]"
                  shadow="shadow-[0_6px_0_#F57C00]"
                />
                {isMature && (
                  <ActionButton
                    onClick={onHarvest}
                    label="Sell"
                    icon={Target}
                    loading={loading}
                    bg="bg-[#E91E63]"
                    border="border-[#C2185B]"
                    shadow="shadow-[0_6px_0_#C2185B]"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market Side Terminal */}
      <AnimatePresence>
        {showStats && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStats(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-[40] pointer-events-auto"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-full max-w-lg bg-slate-950 border border-white/10 p-8 rounded-2xl z-[45] pointer-events-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Target className="text-emerald-400" size={24} />
                  <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
                    Account Status
                  </h2>
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Total Harvests
                  </div>
                  <div className="text-4xl font-bold text-emerald-400">
                    {stats.harvests}
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    All-Time Revenue
                  </div>
                  <div className="text-4xl font-bold text-cyan-400">
                    ${(stats.total_earned / 100).toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-1 col-span-2">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Active Land Holdings
                  </div>
                  <div className="text-xl font-bold text-white/90">
                    Sovereign Plot #{plot?.latitude?.toString().slice(-4)}
                  </div>
                  <div className="text-[9px] font-mono text-white/20 uppercase">
                    Registered on GenLayer Network Studio
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
                <button
                  onClick={disconnect}
                  className="px-8 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest rounded hover:bg-rose-500/20 transition-all"
                >
                  Terminate Session
                </button>
              </div>
            </motion.div>
          </>
        )}

        {showSeedPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSeedPicker(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] pointer-events-auto"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-full max-w-2xl bg-[#FFF9C4] border-8 border-[#8B4513] p-10 rounded-[3rem] z-[65] pointer-events-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase text-[#8B4513]">
                    Select Seed
                  </h3>
                  <p className="text-xs font-bold text-[#5d4037] uppercase">
                    What will you grow today?
                  </p>
                </div>
                <button
                  onClick={() => setShowSeedPicker(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#8B4513]"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  {
                    id: "tomato",
                    name: "Tomato",
                    color: "bg-red-500",
                    icon: Heart,
                  },
                  {
                    id: "wheat",
                    name: "Wheat",
                    color: "bg-yellow-500",
                    icon: Zap,
                  },
                  {
                    id: "corn",
                    name: "Corn",
                    color: "bg-orange-400",
                    icon: Target,
                  },
                  {
                    id: "lettuce",
                    name: "Lettuce",
                    color: "bg-green-400",
                    icon: Sprout,
                  },
                  {
                    id: "carrot",
                    name: "Carrot",
                    color: "bg-orange-600",
                    icon: Activity,
                  },
                  {
                    id: "broccoli",
                    name: "Broccoli",
                    color: "bg-emerald-600",
                    icon: Sprout,
                  },
                  {
                    id: "cabbage",
                    name: "Cabbage",
                    color: "bg-green-300",
                    icon: Database,
                  },
                  {
                    id: "chili",
                    name: "Chili",
                    color: "bg-red-700",
                    icon: Zap,
                  },
                ].map((crop) => (
                  <motion.button
                    key={crop.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onAction("plant", crop.id);
                      setShowSeedPicker(false);
                    }}
                    className="flex flex-col gap-4 p-6 bg-white border-4 border-[#8B4513] rounded-[2rem] shadow-[0_8px_0_#8B4513] transition-all text-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${crop.color} mx-auto border-4 border-[#00000020] flex items-center justify-center shadow-inner`}
                    >
                      <crop.icon
                        size={24}
                        className="text-white drop-shadow-md"
                      />
                    </div>
                    <div>
                      <div className="font-black text-lg text-[#8B4513] uppercase leading-tight">
                        {crop.name}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {showMarket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMarket(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[25] pointer-events-auto"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[400px] bg-slate-950 border-l border-white/10 z-[30] pointer-events-auto flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-emerald-400" size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-white">
                    Market Terminal
                  </h2>
                </div>
                <button
                  onClick={() => setShowMarket(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50"
                >
                  <X size={20} />
                </button>
              </div>
              <MarketTerminal
                balance={balance}
                cropType={plot?.crop_type || "N/A"}
                isMature={isMature}
                loading={loading}
                onSell={onHarvest}
                plot={plot}
                onRefreshState={onRefreshState}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Internal Debug Console (Hidden by default, toggle by clicking logo) */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 h-48 bg-black/90 border border-white/10 rounded-lg z-[100] p-4 font-mono text-[9px] overflow-y-auto pointer-events-auto backdrop-blur-3xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
              <span className="text-emerald-500 font-bold uppercase tracking-widest">
                Debug Console
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-white/20 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap text-white/60">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-white/10">Waiting for events...</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center pointer-events-auto"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="font-mono text-[11px] text-emerald-400 uppercase tracking-[0.4em] animate-pulse text-center">
              GenLayer Intelligent Contract Pipeline <br />
              <span className="text-white/30">VALIDATING SPATIAL DATA...</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ActionButton = ({
  onClick,
  label,
  icon: Icon,
  loading,
  sub,
  bg,
  border,
  shadow,
}: any) => (
  <motion.button
    whileHover={{ scale: 1.1, y: -5 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    disabled={loading}
    className={`group flex flex-col items-center justify-center min-w-[5.5rem] h-full rounded-[1.5rem] border-4 ${bg} ${border} ${shadow} transition-all px-2`}
  >
    <Icon className="mb-1 text-white drop-shadow-sm" size={24} />
    <span className="text-[11px] font-black uppercase text-white drop-shadow-sm">
      {label}
    </span>
    {sub && (
      <span className="text-[8px] font-bold text-white/80 uppercase">
        {sub}
      </span>
    )}
  </motion.button>
);
