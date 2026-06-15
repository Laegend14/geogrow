
export const GENLAYER_CHAIN_ID = Number(import.meta.env.VITE_GENLAYER_CHAIN_ID) || 61999;
export const GENLAYER_NETWORK = {
  chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}`,
  chainName: import.meta.env.VITE_GENLAYER_CHAIN_NAME || "GenLayer Studio",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: [import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"],
  blockExplorerUrls: [],
};

export function getEthereumProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
}

export function isMetaMaskInstalled() {
  const provider = getEthereumProvider();
  return !!provider && !!provider.isMetaMask;
}

export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) return [];
  return await provider.request({ method: "eth_accounts" });
}

export async function getCurrentChainId(): Promise<string | null> {
  const provider = getEthereumProvider();
  if (!provider) return null;
  return await provider.request({ method: "eth_chainId" });
}

export async function isOnGenLayerNetwork(): Promise<boolean> {
  const chainId = await getCurrentChainId();
  if (!chainId) return false;
  return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}

export async function connectMetaMask(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("Provider not found");
  
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) throw new Error("No accounts found");
  
  // Optionally ensure network
  const correct = await isOnGenLayerNetwork();
  if (!correct) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: GENLAYER_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [GENLAYER_NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  }
  
  return accounts[0];
}

export async function switchAccount(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("Provider not found");
  
  // MetaMask doesn't have a direct 'switch account' RPC call that pops up the picker easily
  // but eth_requestAccounts often shows the picker if multiple accounts are authorized or if configured.
  // A common trick is to use 'wallet_requestPermissions'
  await provider.request({
    method: "wallet_requestPermissions",
    params: [{ eth_accounts: {} }],
  });
  
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  return accounts[0];
}
