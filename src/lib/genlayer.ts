import { createClient, chains } from 'genlayer-js';

// In a real app, this would be the address of the deployed contract on Testnet
export const GENLAYER_CONTRACT_ADDRESS = "0x4C5E3c2faF8a31Bc769A15779f3B031ddB5f3C0c";

// Use the same-origin proxy in the browser to avoid CORS/fetch issues
const getRpcUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/api/genlayer-rpc';
  }
  return import.meta.env.VITE_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
};

export const getGenLayerClient = (accountAddr?: string | null) => {
  // Use studionet as default, with fallback structure
  const chain = chains?.studionet || {
    id: 61999,
    name: "GenLayer Studio",
    nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
    rpcUrls: { default: { http: ["https://studio.genlayer.com/api"] } }
  };
  
  return createClient({
    chain,
    endpoint: getRpcUrl(),
    account: accountAddr ? (accountAddr as `0x${string}`) : undefined,
  });
};

export const setupNetwork = async () => {
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    console.warn("[GeoGrow] No Ethereum provider for network setup");
    return;
  }
  
  const STUDIONET_DEFAULT_ID = 61999;
  const defaultChainId = chains?.studionet?.id || STUDIONET_DEFAULT_ID;
  const chainId = Number(import.meta.env.VITE_GENLAYER_CHAIN_ID) || defaultChainId;
  const chainIdHex = `0x${chainId.toString(16)}`;

  try {
    const currentChainId = await ethereum.request({ method: 'eth_chainId' });
    if (currentChainId === chainIdHex) {
      console.log("[GeoGrow] Already on correct network:", chainIdHex);
      return;
    }

    console.log("[GeoGrow] Switching to network:", chainIdHex);
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError: any) {
    console.error("[GeoGrow] Network switch error:", switchError);
    // This error code indicates that the chain has not been added to MetaMask.
    const isMissingChain = 
      switchError.code === 4902 || 
      switchError.data?.originalError?.code === 4902 ||
      switchError.message?.toLowerCase().includes("not been added");

    if (isMissingChain) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: import.meta.env.VITE_GENLAYER_CHAIN_NAME || chains?.studionet?.name || 'GenLayer Studio',
            rpcUrls: [import.meta.env.VITE_GENLAYER_RPC_URL || chains?.studionet?.rpcUrls?.default?.http?.[0] || 'https://studio.genlayer.com/api'],
            nativeCurrency: chains?.studionet?.nativeCurrency || { name: 'GEN', symbol: 'GEN', decimals: 18 },
          }],
        });
      } catch (addError) {
        console.error("[GeoGrow] Failed to add network:", addError);
      }
    }
  }
};

export const formatGEN = (wei: bigint | string | number) => {
  if (!wei) return "0.00";
  try {
    const val = typeof wei === "bigint" ? wei : BigInt(wei);
    return (Number(val) / 1e18).toFixed(2);
  } catch (e) {
    console.error("Format error", e);
    return "0.00";
  }
};
