import { type AccountAddress } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime";
import { ToolConfig } from "../index";

/**
 * Burn fungible asset token
 * @param agent MoveAgentKit instance
 * @param mint Fungible asset address to burn
 * @param amount Amount to burn
 * @returns Transaction signature
 */
export async function burnToken(
    agent: AgentRuntime,
    mint: string,
    amount: number
): Promise<string> {
	try {
		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: {
				function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::burn_fa",
				functionArguments: [mint, amount],
			},
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token burn failed")
			throw new Error("Token burn failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Token burn failed: ${error.message}`)
	}
}

export const burnTokenTool: ToolConfig<any> = {
    definition: {
        type: 'function',
        function: {
            name: 'burnToken',
            description: 'Burn tokens from your account',
            parameters: {
                type: 'object',
                properties: {
                    mint: { type: 'string', description: 'Token mint address' },
                    amount: { type: 'number', description: 'Amount of tokens to burn' }
                },
                required: ['mint', 'amount']
            }
        }
    },
    handler: async (args) => {
        const agentRuntime = await createAgentRuntime();
        return await burnToken(agentRuntime, args.mint, args.amount);
    }
};