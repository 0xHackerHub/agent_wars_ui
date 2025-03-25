import OpenAI from 'openai';
import { config } from 'dotenv';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { HumanMessage, AIMessage, ChatMessage, BaseMessage } from "@langchain/core/messages";

config();

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VercelChatMessage {
  role: string;
  content: string;
}

const textDecoder = new TextDecoder();

async function readStream(stream: any) {
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

// Fixed conversion function to properly handle message structure
const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new HumanMessage(message.content);
  }
};

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).additional_kwargs?.tool_calls,
    };
  } else {
    return { content: message.content, role: "user" };
  }
};

class ChatService {
  private agent: any;
  private aptosAgent!: AgentRuntime;

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      const llm = new ChatOpenAI({
        modelName: "gpt-4-turbo-preview",
        temperature: 0,
        streaming: true,
      });

      const aptosConfig = new AptosConfig({
        network: Network.MAINNET,
      });

      const aptos = new Aptos(aptosConfig);

      const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
      if (!privateKeyStr) {
        throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
      }

      const account = await aptos.deriveAccountFromPrivateKey({
        privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
      });

      const signer = new LocalSigner(account, Network.MAINNET);
      this.aptosAgent = new AgentRuntime(signer, aptos, {
        PANORA_API_KEY: process.env.PANORA_API_KEY,
      });

      const aptosTools = createAptosTools(this.aptosAgent);
      console.log('Available tools:', aptosTools.map(tool => tool.name));

      this.agent = createReactAgent({
        llm,
        tools: aptosTools,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the
          faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
          (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
          can't do with your currently available tools, you must say so, and encourage them to implement it
          themselves using the Aptos Agent Kit, recommend they go to https://www.aptosagentkit.xyz for more information. Be
          concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.

          The response also contains token/token[] which contains the name and address of the token and the decimals.
          WHEN YOU RETURN ANY TOKEN AMOUNTS, RETURN THEM ACCORDING TO THE DECIMALS OF THE TOKEN.

          Available tools:
          ${aptosTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}
        `,
      });
    } catch (error) {
      console.error('Error initializing agent:', error);
      throw error;
    }
  }

  async generateResponse(messages: VercelChatMessage | VercelChatMessage[], showIntermediateSteps: boolean = false): Promise<Response> {
    try {
      // Convert single message to array if needed
      const messageArray = Array.isArray(messages) ? messages : [messages];
      console.log('Generating AI response for messages:', messageArray);
      
      if (!this.agent) {
        await this.initializeAgent();
      }

      const langChainMessages = messageArray.map(convertVercelMessageToLangChainMessage);

      if (!showIntermediateSteps) {
        const eventStream = await this.agent.streamEvents(
          { messages: langChainMessages },
          {
            version: "v2",
            configurable: {
              thread_id: "Aptos Agent Kit!",
            },
          }
        );

        const textEncoder = new TextEncoder();
        const transformStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const { event, data } of eventStream) {
                if (event === "on_chat_model_stream") {
                  if (data.chunk.content) {
                    if (typeof data.chunk.content === "string") {
                      controller.enqueue(textEncoder.encode(data.chunk.content));
                    } else {
                      for (const content of data.chunk.content) {
                        controller.enqueue(textEncoder.encode(content.text ? content.text : ""));
                      }
                    }
                  }
                }
              }
              controller.close();
            } catch (error) {
              console.error('Error in stream processing:', error);
              controller.enqueue(textEncoder.encode('An error occurred while processing your request.'));
              controller.close();
            }
          },
        });

        return new Response(transformStream);
      } else {
        const result = await this.agent.invoke({ messages: langChainMessages });
        const vercelMessages = result.messages.map(convertLangChainMessageToVercelMessage);
        
        return new Response(JSON.stringify({ messages: vercelMessages }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "An error occurred",
          status: "error",
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}

export const chatService = new ChatService();