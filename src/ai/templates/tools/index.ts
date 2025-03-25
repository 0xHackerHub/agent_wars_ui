import { createAptosTools } from "move-agent-kit"
import { createAgentRuntime } from "../agentRuntime"
import { ToolConfig } from '../index';

/** Returns a list of tools that can be used by the agent which are aptos tools included in move-agent-kit which 
 * are aptos tools, joule tools, merkle tools, thala tools, liquidswap tools, amnis tools, aries tools, echelon tools, echo tools, panaro tools */
export async function genericTools(): Promise<ToolConfig[]> {
    const agentRuntime = await createAgentRuntime();
    const aptosTools = createAptosTools(agentRuntime);
    
    // Transform tools to match ToolConfig interface
    return aptosTools.map(tool => ({
        definition: {
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description || '',
                parameters: {
                    type: 'object',
                    properties: {
                        input: { type: 'string', description: 'Input for the tool' }
                    },
                    required: ['input']
                }
            }
        },
        handler: async (args: any) => {
            try {
                // Call the tool's run method
                return await (tool as any).run(args.input);
            } catch (error) {
                console.error(`Error executing tool ${tool.name}:`, error);
                throw error;
            }
        }
    }));
}
