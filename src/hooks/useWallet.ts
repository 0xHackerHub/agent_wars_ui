import { useState, useEffect } from 'react';
import { WalletManager } from '@/lib/account';
import { AccountAddress } from '@aptos-labs/ts-sdk';

interface TokenInfo {
  name: string;
  balance: string;
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<AccountAddress | null>(null);
  const [balance, setBalance] = useState("0");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const wallet = WalletManager.getInstance();

  const updateWalletState = async () => {
    setIsConnected(wallet.isConnected());
    setAddress(wallet.getAddress());
    
    if (wallet.isConnected()) {
      const balance = await wallet.getBalance();
      setBalance(balance);

      const tokens = await wallet.getTokens();
      const tokenList: TokenInfo[] = tokens.map(token => ({
        name: token.name || "Unknown Token",
        balance: token.balance || "0"
      }));
      setTokens(tokenList);
    } else {
      setBalance("0");
      setTokens([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      const privateKey = process.env.NEXT_PUBLIC_APTOS_PRIVATE_KEY;
      if (privateKey) {
        try {
          await wallet.connect(privateKey);
        } catch (error) {
          console.error("Failed to connect with private key:", error);
        }
      }
      await updateWalletState();
    };
    
    init();
  }, []);

  return {
    isConnected,
    address,
    balance,
    tokens
  };
}
