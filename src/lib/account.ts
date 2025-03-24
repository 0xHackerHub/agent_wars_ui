import { Aptos, Account, Ed25519PrivateKey, AccountAddress, PrivateKey, PrivateKeyVariants, Network } from "@aptos-labs/ts-sdk";

interface PanoraToken {
  chainId: number;
  tokenAddress: string | null;
  faAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
}

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoUrl: string;
  assetType: string;
}

export class WalletManager {
  private static instance: WalletManager;
  private aptos: Aptos;
  private account: Account | null = null;
  private connected: boolean = false;

  private constructor() {
    this.aptos = new Aptos({
      network: Network.MAINNET,
      client: {
        provider: async (request) => {
          // Default REST provider implementation
          const response = await fetch(request.url, {
            method: request.method,
            body: request.body ? JSON.stringify(request.body) : undefined,
            headers: request.headers
          });
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
          return {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            data: await response.json()
          };
        }
      },
      getRequestUrl: () => "https://fullnode.mainnet.aptoslabs.com/v1",
      isPepperServiceRequest: (_url: string) => false,
      isProverServiceRequest: (_url: string) => false
    });
  }

  public static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  public async connect(privateKeyStr: string): Promise<void> {
    try {
      const privateKey = new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(
          privateKeyStr,
          PrivateKeyVariants.Ed25519
        )
      );
      this.account = Account.fromPrivateKey({ privateKey });
      this.connected = true;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      this.connected = false;
      this.account = null;
      throw error;
    }
  }

  public disconnect(): void {
    this.account = null;
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getAddress(): AccountAddress | null {
    return this.account?.accountAddress || null;
  }

  public async getTokens(): Promise<TokenBalance[]> {
    if (!this.account?.accountAddress) {
      return [];
    }

    try {
      // Fetch token list from Panora
      const tokenListResponse = await fetch('https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/refs/heads/main/token-list.json');
      const tokenList: PanoraToken[] = await tokenListResponse.json();

      const tokens = await this.aptos.getCurrentFungibleAssetBalances({ 
        options: {
          where: {
            owner_address: {
              _eq: this.account.accountAddress.toString(),
            },
          },
        },
      });

      return tokens.map(token => {
        // Find matching token in Panora list
        const panoraToken = token.token_standard === 'v1' 
          ? tokenList.find(t => t.tokenAddress === token.asset_type)
          : tokenList.find(t => t.faAddress === token.asset_type);

        if (!panoraToken) {
          return {
            symbol: 'Unknown',
            name: 'Unknown Token',
            balance: '0',
            decimals: 0,
            logoUrl: '',
            assetType: token.asset_type || 'unknown'
          };
        }

        // Calculate actual balance using decimals
        const balance = (Number(token.amount) / Math.pow(10, panoraToken.decimals)).toString();

        return {
          symbol: panoraToken.symbol,
          name: panoraToken.name,
          balance,
          decimals: panoraToken.decimals,
          logoUrl: panoraToken.logoUrl,
          assetType: token.asset_type || 'unknown'
        };
      });
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
      return [];
    }
  }

  public async getBalance(): Promise<string> {
    if (!this.account?.accountAddress) {
      return "0";
    }

    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: this.account.accountAddress.toString(),
      });
      
      const aptosCoinStore = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );

      if (aptosCoinStore?.data && typeof aptosCoinStore.data === 'object' && 'coin' in aptosCoinStore.data) {
        const rawBalance = (aptosCoinStore.data as { coin: { value: string } }).coin.value || "0";
        // APT has 8 decimals
        return (Number(rawBalance) / Math.pow(10, 8)).toString();
      }

      return "0";
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      return "0";
    }
  }
}