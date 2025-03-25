import type { AgentRuntime } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime";
import { ToolConfig } from "../index";

/**
 * Create a fungible asset token
 * @param agent MoveAgentKit instance
 * @param name Name of the token
 * @param symbol Symbol of the token
 * @param iconURI URI of the token icon
 * @param projectURI URI of the token project
 */
export async function createToken(
	agent: AgentRuntime,
	name: string,
	symbol: string,
	iconURI: string,
	projectURI: string
): Promise<string> {
	try {
		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: {
				function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::create_fa_simple",
				functionArguments: [name, symbol, iconURI, projectURI],
			},
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token creation failed")
			throw new Error("Token creation failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Token creation failed: ${error.message}`)
	}
}

export const createTokenTool: ToolConfig<any> = {
	definition: {
		type: 'function',
		function: {
			name: 'createToken',
			description: 'Create a new token',
			parameters: {
				type: 'object',
				properties: {
					name: { type: 'string', description: 'Name of the token' },
					symbol: { type: 'string', description: 'Symbol of the token' },
					iconURI: { type: 'string', description: 'URI of the token icon' },
					projectURI: { type: 'string', description: 'URI of the token project' }
				},
				required: ['name', 'symbol', 'iconURI', 'projectURI']
			}
		}
	},
	handler: async (args) => {
		const agentRuntime = await createAgentRuntime();
		return await createToken(agentRuntime, args.name, args.symbol, args.iconURI, args.projectURI);
	}
};