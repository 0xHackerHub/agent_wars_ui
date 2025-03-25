import { burnTokenTool } from "./aptos/burn-token";
import { createTokenTool } from "./aptos/create-token";
import { getTokenPriceTool } from "./aptos/get-token-price";
import { mintTokenTool } from "./aptos/mint-token";
import { transferTokensTool } from "./aptos/transfer-token";
import { retrieveTweetTool } from "./socials/tweets";
import { genericTools } from "./tools";

export interface ToolConfig<T = any> {
    definition: {
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: {
                type: 'object';
                properties: Record<string, unknown>;
                required: string[];
            };
        };
    };
    handler: (args: T) => Promise<any>;
};

// Initialize tools with generic tools first
export const initializeTools = async (): Promise<Record<string, ToolConfig>> => {
    const genericToolsList = await genericTools();
    const genericToolsMap = genericToolsList.reduce((acc, tool) => {
        acc[tool.definition.function.name] = tool;
        return acc;
    }, {} as Record<string, ToolConfig>);

    // Specific tools override generic tools if they exist
    const specificTools = {
        // Socials
        "get_tweet_data": retrieveTweetTool,
        // Aptos
        "mint_token": mintTokenTool,
        "transfer_token": transferTokensTool,
        "burn_token": burnTokenTool,
        "get_token_price": getTokenPriceTool,
        "create_token": createTokenTool,
    };

    // Merge generic and specific tools, with specific tools taking precedence
    return {
        ...genericToolsMap,
        ...specificTools
    };
};

// Export an empty object initially, it will be populated when initializeTools is called
export let tools: Record<string, ToolConfig> = {};

// Initialize tools immediately
initializeTools().then(initializedTools => {
    tools = initializedTools;
});