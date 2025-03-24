import { createAptosTools } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime"
import { ToolConfig } from '../index';

/** Returns a list of tools that can be used by the agent which are aptos tools included in move-agent-kit which 
 * are aptos tools, joule tools, merkle tools, thala tools, liquidswap tools, amnis tools, aries tools, echelon tools, echo tools, panaro tools */
export async function genericTools(): Promise<ToolConfig[]> {
    const agentAgentRuntime = await createAgentRuntime();
    const aptosTools = createAptosTools(agentAgentRuntime);
    
    // Transform tools to match ToolConfig interface
    return aptosTools.map(tool => ({
        definition: {
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description || '',
                parameters: {
                    type: 'object',
                    properties: {},  
                    required: []     
                }
            }
        },
        handler: async (args: any) => {
            return await (tool as any).run(args);  
        }
    }));
}
