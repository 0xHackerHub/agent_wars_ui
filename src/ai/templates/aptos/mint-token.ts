import { type AccountAddress } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime";
import { ToolConfig } from "../index";

/**
 * Mint a fungible asset token
 * @param agent MoveAgentKit instance
 * @param name Name of the token
 * @param symbol Symbol of the token
 * @param iconURI URI of the token icon
 * @param projectURI URI of the token project
 */
export async function mintToken(
	agent: AgentRuntime,
	to: AccountAddress,
	mint: string,
	amount: number
): Promise<string> {
	try {
		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: {
				function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::mint_to_address",
				functionArguments: [to.toString(), mint, amount],
			},
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token mint failed")
			throw new Error("Token mint failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Token mint failed: ${error.message}`)
	}
}

export const mintTokenTool: ToolConfig<any> = {
	definition: {
		type: 'function',
		function: {
			name: 'mintToken',
			description: 'Mint tokens to a specified address',
			parameters: {
				type: 'object',
				properties: {
					to: { type: 'string', description: 'Account address to mint tokens to' },
					mint: { type: 'string', description: 'Token mint address' },
					amount: { type: 'number', description: 'Amount of tokens to mint' }
				},
				required: ['to', 'mint', 'amount']
			}
		}
	},
	handler: async (args) => {
		const agentRuntime = await createAgentRuntime();
		return await mintToken(agentRuntime, args.to, args.mint, args.amount);
	}
};