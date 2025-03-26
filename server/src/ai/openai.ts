import { config } from 'dotenv';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { AccountAddress, Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { HumanMessage, AIMessage, ChatMessage, BaseMessage } from "@langchain/core/messages";

config();

// Ensure required environment variables are present
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not defined in environment variables');
  process.exit(1);
}

if (!process.env.APTOS_PRIVATE_KEY) {
  console.error('APTOS_PRIVATE_KEY is not defined in environment variables');
  process.exit(1);
}

interface VercelChatMessage {
  role: string;
  content: string;
}

const textDecoder = new TextDecoder();

/**
 * Helper function to read a stream and convert it to a string
 */
async function readStream(stream: ReadableStream): Promise<string> {
  try {
    const reader = stream.getReader();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += textDecoder.decode(value, { stream: true });
    }

    result += textDecoder.decode();
    return result;
  } catch (error) {
    console.error("Error reading stream:", error);
    throw error;
  }
}

/**
 * Convert Vercel chat message format to LangChain message format
 */
const convertVercelMessageToLangChainMessage = (message: VercelChatMessage): BaseMessage => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else if (message.role === "system") {
    return new ChatMessage(message.content, "system");
  } else {
    return new HumanMessage(message.content);
  }
};

/**
 * Convert LangChain message format to Vercel chat message format
 */
const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else if (message._getType() === "system") {
    return { content: message.content, role: "system" };
  } else {
    return { content: message.content, role: "user" };
  }
};

class ChatService {
  private agent: any;
  private aptosAgent!: AgentRuntime;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private tools: any[] = [];

  constructor() {
    // Initialize agent on first use (lazy initialization)
    this.initPromise = this.initializeAgent();
  }

  /**
   * Initialize the Aptos agent with all necessary tools
   */
  private async initializeAgent(): Promise<void> {
    try {
      console.log('Initializing Aptos Agent with Claude...');
      
      // Use Claude for best reasoning capabilities
      const llm = new ChatAnthropic({
        model: "claude-3-5-sonnet-latest", // Use the latest Claude model
        temperature: 0.7, // Higher temperature for more creative responses
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Configure Aptos connection
      const aptosConfig = new AptosConfig({
        network: Network.MAINNET,
      });

      const aptos = new Aptos(aptosConfig);

      // Get private key from environment
      const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
      if (!privateKeyStr) {
        throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
      }

      // Set up account and signer
      const account = await aptos.deriveAccountFromPrivateKey({
        privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
      });

      const signer = new LocalSigner(account, Network.MAINNET);
      this.aptosAgent = new AgentRuntime(signer, aptos, {
        PANORA_API_KEY: process.env.PANORA_API_KEY,
      });

      // Get available Aptos tools
      const aptosTools = createAptosTools(this.aptosAgent);
      this.tools = aptosTools;
      console.log('Available Aptos tools:', aptosTools.map(tool => tool.name).join(', '));

      // Create the ReAct agent with the tools
      this.agent = createReactAgent({
        llm,
        tools: aptosTools,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the
          faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
          (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
          can't do with your currently available tools, you must say so, and encourage them to implement it
          themselves using the Aptos Agent Kit, recommend they go to https://www.aptosagentkit.xyz for more information.
          Always add the timestamp and give response back the timestamp when the transaction is successfully obtained. 
          
          When you use a tool, ALWAYS FORMAT THE TOOL NAME LIKE THIS:
          - The name of the tool you're using MUST be prefixed with "Tool: [EXACT_TOOL_NAME]"
          - This exact formatting is critical for the UI to display tools correctly
          - Example: If using a tool called "aptos_create_token", format it as "Tool: aptos_create_token"
          - After identifying the tool, clearly explain:
            - The parameters you're using with the tool
            - The result of the tool execution
            - Explanations in simple terms of what you're doing
          
          For transactions:
          - Make the transaction amount VERY CLEAR to the user
          - Always report the transaction hash when a transaction is successful using the format: "Transaction hash: [HASH]"
          - Always report any position IDs or other identifiers for future reference
          
          The response also contains token/token[] which contains the name and address of the token and the decimals.
          WHEN YOU RETURN ANY TOKEN AMOUNTS, RETURN THEM ACCORDING TO THE DECIMALS OF THE TOKEN.
          
          Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.

          Available tools:
          ${aptosTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}
        `,
      });

      this.isInitialized = true;
      console.log('Aptos Agent with Claude initialized successfully!');
    } catch (error) {
      console.error('Error initializing Aptos agent with Claude:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Ensure the agent is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      if (this.initPromise) {
        await this.initPromise;
      } else {
        this.initPromise = this.initializeAgent();
        await this.initPromise;
      }
    }
  }

  /**
   * Find the tool name by ID
   */
  private getToolNameById(toolId: string): string {
    const tool = this.tools.find(t => t.name === toolId);
    return tool ? tool.name : toolId;
  }

  /**
   * Generate a response using the Aptos agent with Claude
   */
  /**
 * Generate a response using the Aptos agent with Claude
 */
async generateResponse(
  messages: VercelChatMessage | VercelChatMessage[], 
  showIntermediateSteps: boolean = false
): Promise<Response> {
  try {
    await this.ensureInitialized();
    
    // Convert single message to array if needed
    const messageArray = Array.isArray(messages) ? messages : [messages];
    console.log(`Generating Claude response for ${messageArray.length} messages...`);
    
    // Convert messages to LangChain format
    const langChainMessages = messageArray.map(convertVercelMessageToLangChainMessage);

    if (!showIntermediateSteps) {
      // Stream the response for better user experience
      const eventStream = await this.agent.streamEvents(
        { messages: langChainMessages },
        {
          version: "v2",
          configurable: {
            thread_id: "Aptos Agent Kit with Claude!",
          },
        }
      );

      const textEncoder = new TextEncoder();
      // Track which tools have been used to prevent duplicates
      const toolsUsed = new Set();
      
      const transformStream = new ReadableStream({
        async start(controller) {
          try {
            let currentOutput = "";
            
            for await (const { event, data } of eventStream) {
              if (event === "on_chat_model_stream") {
                if (data.chunk.content) {
                  if (typeof data.chunk.content === "string") {
                    // Process content to remove markdown from transaction hashes
                    let content = data.chunk.content;
                    
                    // Remove markdown from transaction hashes (if present)
                    content = content.replace(/Transaction hash: \*\*([0-9a-fx]+)\*\*/g, 'Transaction hash: $1');
                    
                    controller.enqueue(textEncoder.encode(content));
                    currentOutput += content;
                  } else {
                    for (const content of data.chunk.content) {
                      controller.enqueue(textEncoder.encode(content.text ? content.text : ""));
                      if (content.text) currentOutput += content.text;
                    }
                  }
                }
              } else if (event === "on_tool_start") {
                // Signal tool execution start - only if tool is valid
                if (data.tool && data.tool !== "undefined" && !toolsUsed.has(data.tool)) {
                  // Add tool to used set to prevent duplicates
                  toolsUsed.add(data.tool);
                  
                  // Format without markdown
                  controller.enqueue(textEncoder.encode(`\nTool: ${data.tool}\n`));
                  currentOutput += `\nTool: ${data.tool}\n`;
                }
              } else if (event === "on_tool_end") {
                // Signal tool execution completion with result summary
                if (data.output) {
                  // For transaction outputs, highlight success/failure
                  if (typeof data.output === 'object' && data.output.hash && 
                      !currentOutput.includes("Transaction successful!")) {
                    controller.enqueue(textEncoder.encode(`\nTransaction successful!\n`));
                    // Format transaction hash without markdown
                    controller.enqueue(textEncoder.encode(`Transaction hash: ${data.output.hash}\n`));
                    currentOutput += `\nTransaction successful!\nTransaction hash: ${data.output.hash}\n`;
                  }
                }
              }
            }
            controller.close();
          } catch (error) {
            console.error('Error in stream processing:', error);
            controller.enqueue(textEncoder.encode('\nAn error occurred while processing your request. Please try again later.\n'));
            controller.close();
          }
        },
      });

      return new Response(transformStream);
    } else {
      // For non-streaming mode, invoke the agent and return the full result
      console.log("Running Claude agent in non-streaming mode with intermediate steps");
      const result = await this.agent.invoke({ messages: langChainMessages });
      
      // Format the tool execution and transaction information for better readability
      const formattedMessages = result.messages.map((message: BaseMessage) => {
        if (message._getType() === "ai") {
          // Process AI message to fix formatting
          let content = message.content.toString();
          console.log("AI Msg:",content);
          
          // Remove duplicated tool declarations and undefined tools
          content = content.replace(/\*\*Tool: undefined\*\*/g, '');
          
          // Remove markdown from transaction hashes
          content = content.replace(/Transaction hash: \*\*([0-9a-fx]+)\*\*/g, 'Transaction hash: $1');
          content = content.replace(/Position ID: \*\*([0-9]+)\*\*/g, 'Position ID: $1');
          
          return {
            ...convertLangChainMessageToVercelMessage(message),
            content
          };
        }
        return convertLangChainMessageToVercelMessage(message);
      });
      
      return new Response(JSON.stringify({ messages: formattedMessages }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error generating Claude response:', error);
    
    // Provide detailed error information
    const errorDetails = error instanceof Error 
      ? { message: error.message, name: error.name, stack: error.stack } 
      : { message: "Unknown error" };
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred processing your request",
        details: errorDetails,
        status: "error",
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
  
  /**
   * Get wallet address for the current Aptos agent
   */
  getWalletAddress(): AccountAddress | null {
    if (!this.isInitialized || !this.aptosAgent) {
      return null;
    }
    
    try {
      return this.aptosAgent.account.getAddress();
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }
  
  /**
   * Check if the agent is initialized and ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const chatService = new ChatService();