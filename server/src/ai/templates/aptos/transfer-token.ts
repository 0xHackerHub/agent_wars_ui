import { type AccountAddress, type InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime";
import { ToolConfig } from "../index";

/**
 * Transfer APT, tokens or fungible asset to a recipient
 * @param agent MoveAgentKit instance
 * @param to Recipient's public key
 * @param mint Move struct ID or address of the token / fungible asset to transfer
 * @param amount Amount to transfer
 * @returns Transaction signature
 * @example
 * ```ts
 * const transactionHash = await transferTokens(agent, recipientAddress, amount, APTOS_COIN); // For APT
 * const otherTransactionHash = await transferTokens(agent, recipientAddress, amount, OTHER_TOKEN); // For another token
 * const fungibleAssetTransactionHash = await transferTokens(agent, recipientAddress, amount, fungibleAssetAddress); // For fungible asset
 * ```
 */
export async function transferTokens(
	agent: AgentRuntime,
	to: AccountAddress,
	mint: string,
	amount: number
): Promise<string> {
	const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
		function: "0x1::coin::transfer",
		typeArguments: [mint],
		functionArguments: [to.toString(), amount],
	}

	const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
		function: "0x1::primary_fungible_store::transfer",
		typeArguments: ["0x1::fungible_asset::Metadata"],
		functionArguments: [mint, to.toString(), amount],
	}

	try {
		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: mint.split("::").length === 3 ? COIN_STANDARD_DATA : FUNGIBLE_ASSET_DATA,
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token transfer failed")
			throw new Error("Token transfer failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Token transfer failed: ${error.message}`)
	}
}

export const transferTokensTool: ToolConfig<any> = {
	definition: {
		type: 'function',
		function: {
			name: 'transferTokens',
			description: 'Transfer tokens to another account',
			parameters: {
				type: 'object',
				properties: {
					to: { type: 'string', description: 'Account address to transfer tokens to' },
					mint: { type: 'string', description: 'Token mint address' },
					amount: { type: 'number', description: 'Amount of tokens to transfer' }
				},
				required: ['to', 'mint', 'amount']
			}
		}
	},
	handler: async (args) => {
		const agentRuntime = await createAgentRuntime();
		return await transferTokens(agentRuntime, args.to, args.mint, args.amount);
	}
};