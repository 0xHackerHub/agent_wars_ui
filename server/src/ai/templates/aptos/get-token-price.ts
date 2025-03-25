/**
 * Fetches token price from the Pyth network
 * @param agent Agent runtime
 * @param mint Token mint address
 * @returns Price feed data
 */
import type { AgentRuntime } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime";
import { ToolConfig } from "../index";

interface AssetData {
	id: string;
	attributes: {
		display_symbol: string;
		symbol: string;
	};
}

interface PriceData {
	id: string;
	price: {
		price: string;
		expo: number;
	};
}

interface PriceResponse {
	parsed: PriceData[];
}

export async function getTokenPrice(
	agent: AgentRuntime,
	mint: string
): Promise<number> {
	try {
		const assetDataResponse = await fetch(`https://hermes.pyth.network/v2/price_feeds?query=${mint}&asset_type=crypto`)
		const assetData = await assetDataResponse.json() as AssetData[]

		const formattedData = assetData.map((data) => {
			return {
				id: data.id,
				displayName: data.attributes.display_symbol,
				symbol: data.attributes.symbol,
			}
		})

		const assetIdArray = formattedData.map((data) => data.id)

		if (assetIdArray.length === 0) {
			throw new Error("No assets found for the given query")
		}
		const assetPriceDataResponse = await fetch(
			`https://hermes.pyth.network/v2/updates/price/latest?ids[]=${assetIdArray.join("&ids[]=")}`
		)

		const assetPriceData = await assetPriceDataResponse.json() as PriceResponse

		const priceFeed = formattedData.map((data) => {
			const priceData = assetPriceData.parsed.find((price) => price.id === data.id)
			if (!priceData) {
				throw new Error(`No price data found for asset ${data.id}`);
			}

			return {
				...data,
				price:
					(Number(priceData.price.price) / 10 ** Math.abs(priceData.price.expo)).toLocaleString() ||
					Number(priceData.price.price).toLocaleString(),
			}
		})

		return Number(priceFeed[0].price.replace(/,/g, ''))
	} catch (error: any) {
		throw new Error(`Token transfer failed: ${error.message}`)
	}
}

export const getTokenPriceTool: ToolConfig<any> = {
	definition: {
		type: 'function',
		function: {
			name: 'getTokenPrice',
			description: 'Get the current price of a token',
			parameters: {
				type: 'object',
				properties: {
					mint: { type: 'string', description: 'Token mint address' }
				},
				required: ['mint']
			}
		}
	},
	handler: async (args) => {
		const agentRuntime = await createAgentRuntime();
		return await getTokenPrice(agentRuntime, args.mint);
	}
};