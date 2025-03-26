import { Tool } from "langchain/tools";
import { type AgentRuntime, parseJson } from "move-agent-kit";
import { transferUsdcWithCctp } from "./usdc";
import { Chain, Network } from "@wormhole-foundation/sdk";

// Define type extensions for AgentRuntime
declare module "move-agent-kit" {
  interface AgentRuntime {
    transferUsdcWithCctp: (
      targetChain: Chain,
      transferAmount: string,
      networkType: Network
    ) => ReturnType<typeof transferUsdcWithCctp>;
  }
}

export class CctpTransferTool extends Tool {
  name = "cctp_transfer";
  description = `Transfers USDC from Aptos to another chain using Circle's CCTP.
  
  Inputs (JSON string):
  {
    "targetChain": "Ethereum" | "Base" | "Avalanche" | "Optimism" | "Arbitrum",
    "transferAmount": "0.01" (string decimal),
    "networkType": "Mainnet" | "Testnet"
  }`;

  constructor(private agent: AgentRuntime) {
    super();
    
    // Add the method to agent runtime prototype
    if (!this.agent.transferUsdcWithCctp) {
      this.agent.transferUsdcWithCctp = (
        targetChain: Chain,
        transferAmount: string,
        networkType: Network
      ) => transferUsdcWithCctp({
        targetChain,
        transferAmount,
        networkType
      });
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = parseJson(input);
      const { targetChain, transferAmount, networkType } = parsedInput;
      
      if (!targetChain || !transferAmount || !networkType) {
        throw new Error("Missing required parameters");
      }

      const result = await this.agent.transferUsdcWithCctp(
        targetChain as Chain,
        transferAmount,
        networkType as Network
      );

      return JSON.stringify({
        status: result.isSuccess ? "success" : "error",
        ...result
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "CCTP_TRANSFER_FAILED",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }
}