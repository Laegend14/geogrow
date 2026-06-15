
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  isMetaMaskInstalled,
  connectMetaMask,
  switchAccount,
  getAccounts,
  getCurrentChainId,
  isOnGenLayerNetwork,
  getEthereumProvider,
  GENLAYER_CHAIN_ID,
} from "../lib/wallet-client";
import { error, userRejected } from "../utils/toast";

// Key for simulation session
const MOCK_SESSION_KEY = "geogrow_mock_session";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  isOnCorrectNetwork: boolean;
}

interface WalletContextValue extends WalletState {
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  switchWalletAccount: () => Promise<string>;
  // Aliases for compatibility
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isAuthenticated: boolean;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * MOCKED Wallet Provider for simulation gameplay
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: "61999",
    isConnected: false,
    isLoading: true,
    isMetaMaskInstalled: true,
    isOnCorrectNetwork: true,
  });

  // --- Initial Session Check ---
  useEffect(() => {
    async function checkConnection() {
      const provider = getEthereumProvider();
      if (!provider) {
        setState(prev => ({ ...prev, isLoading: false, isMetaMaskInstalled: false }));
        return;
      }

      try {
        const accounts = await getAccounts();
        const chainId = await getCurrentChainId();
        const isCorrect = chainId ? parseInt(chainId, 16) === GENLAYER_CHAIN_ID : false;

        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            address: accounts[0],
            chainId,
            isConnected: true,
            isOnCorrectNetwork: isCorrect,
            isLoading: false,
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Wallet check failed", err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    checkConnection();

    const provider = getEthereumProvider();
    if (provider) {
      const handleAccounts = (accounts: string[]) => {
        setState(prev => ({
          ...prev,
          address: accounts[0] || null,
          isConnected: accounts.length > 0,
        }));
      };
      const handleChain = (chainId: string) => {
        setState(prev => ({
          ...prev,
          chainId,
          isOnCorrectNetwork: parseInt(chainId, 16) === GENLAYER_CHAIN_ID,
        }));
      };

      provider.on("accountsChanged", handleAccounts);
      provider.on("chainChanged", handleChain);

      return () => {
        provider.removeListener("accountsChanged", handleAccounts);
        provider.removeListener("chainChanged", handleChain);
      };
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const addr = await connectMetaMask();
      const chainId = await getCurrentChainId();
      setState(prev => ({
        ...prev,
        address: addr,
        chainId,
        isConnected: true,
        isOnCorrectNetwork: true,
        isLoading: false,
      }));
      return addr;
    } catch (err: any) {
      if (err.code === 4001) {
        userRejected("User rejected the connection request.");
      } else {
        error("Failed to connect wallet", { description: err.message || String(err) });
      }
      setState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    // There is no standard disconnect for Web3 wallets, we just clear our internal state
    setState(prev => ({ ...prev, address: null, isConnected: false }));
  }, []);

  const switchWalletAccount = useCallback(async () => {
    try {
      const addr = await switchAccount();
      setState(prev => ({ ...prev, address: addr }));
      return addr;
    } catch (err) {
      error("Failed to switch account", { description: "User cancelled or another error occurred" });
      throw err;
    }
  }, []);

  const connect = async () => { await connectWallet(); };
  const disconnect = () => { disconnectWallet(); };

  return (
    <WalletContext.Provider value={{ 
      ...state, 
      connectWallet, 
      disconnectWallet, 
      switchWalletAccount,
      account: state.address,
      connect,
      disconnect,
      isAuthenticated: state.isConnected
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return context;
}
