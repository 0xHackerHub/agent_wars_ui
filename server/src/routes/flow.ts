import { Request, Response, NextFunction } from 'express'
import { eq } from 'drizzle-orm'
import {pipe, pipeFlow, toolMetadata} from "../db/schema"
import db from "../db/client"
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AgentRuntime, createAptosTools, LocalSigner } from 'move-agent-kit';
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk';

/**
 * Creates a new pipe and associated pipeFlow if needed
 */
type llmData = {
    llmType: "claude" | "open_ai"
    modal: string
    temp: number
    creds?:  string
}

export async function createPipeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      pipeFlowId,
      name,
      metadata,
      multiRun = false,
      maxCalls = 0,
      ownerId,
      flowTitle,
      flowDescription,
      modalData
    } = req.body

    const llmData = modalData as llmData
    const defaultAnthropicModal = 'claude-3-5-sonnet-latest'
    const defaultOpenAi = "gpt-4-turbo-preview"
    const temp = 0.7
    
 // Use Claude for best reasoning capabilities
 let llm: any = new ChatAnthropic({
    model: "claude-3-5-sonnet-latest", // Use the latest Claude model
    temperature: 0.7, // Higher temperature for more creative responses
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  if(llmData) {
    if(llmData.llmType === 'claude') {
     llm = new ChatAnthropic({
            model: llmData.modal, // Use the latest Claude model
            temperature:llmData.temp, // Higher temperature for more creative responses
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
    }else {
        llm = new ChatOpenAI({
            model: llmData.modal, // Use the latest Claude model
            temperature:llmData.temp, // Higher temperature for more creative responses
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
    }
  }
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
  });
  const aptos = new Aptos(aptosConfig);

      // Get private key from environment
  const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
      if (!privateKeyStr) {
        throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
  }
  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
  });
  const signer = new LocalSigner(account, Network.MAINNET);
  const aptosAgent = new AgentRuntime(signer, aptos, {
    PANORA_API_KEY: process.env.PANORA_API_KEY,
  });
  const tools = createAptosTools(aptosAgent);

  const prompt = generatePrompt(metadata as toolMetadata)
  const myAgent = createReactAgent({
    llm,
    tools: tools,
    messageModifier: prompt,
  })

  const messages = "Execute the requested task"; // Simple trigger message

  const eventStream = await myAgent.streamEvents(
    { messages },
    {
        version: "v2",
        configurable: {
            thread_id: "Aptos Agent Kit!",
        },
    }
)

res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no'); // Important for Ng


    let completeOutput = '';
    
    // Begin streaming the response
    for await (const { event, data } of eventStream) {
      if (event === "on_chat_model_stream") {
        if (data.chunk.content) {
          if (typeof data.chunk.content === "string") {
            const chunk = data.chunk.content;
            completeOutput += chunk;
            res.write(chunk);
          } else {
            for (const content of data.chunk.content) {
              if (content.text) {
                completeOutput += content.text;
                res.write(content.text);
              }
            }
          }
        }
      }
    }

    // End the stream response when all events are processed
    res.end();
    // let finalPipeFlowId = pipeFlowId

    // If no pipeFlowId is provided, create a new pipeFlow
    // if (!finalPipeFlowId) {
    //   // Generate a random name if not provided
    //   const randomTitle = flowTitle || `Flow-${Math.random().toString(36).substring(2, 10)}`
      
    //   // Create new pipeFlow
    //   const [newPipeFlow] = await db.insert(pipeFlow).values({
    //     ownerId,
    //     title: randomTitle,
    //     description: flowDescription || null
    //   }).returning({ id: pipeFlow.id })

    //   finalPipeFlowId = newPipeFlow.id
    // } else {
    //   // Check if the pipeFlow exists
    //   const existingFlow = await db.query.pipeFlow.findFirst({
    //     where: eq(pipeFlow.id, finalPipeFlowId)
    //   })

    //   if (!existingFlow) {
    //     // Create new pipeFlow with the provided ID
    //     const randomTitle = flowTitle || `Flow-${Math.random().toString(36).substring(2, 10)}`
        
    //     await db.insert(pipeFlow).values({
    //       id: finalPipeFlowId,
    //       ownerId,
    //       title: randomTitle,
    //       description: flowDescription || null
    //     })
    //   }
    // }

    // Now create the pipe with the finalPipeFlowId
    // const [newPipe] = await db.insert(pipe).values({
    //   pipeFlowId: finalPipeFlowId,
    //   name,
    //   metadata,
    //   multiRun,
    //   maxCalls,
    //   currentCallCount: 0,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // }).returning()

   return 
  } catch (error) {
    console.error('Error creating pipe:', error)
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

/**
 * Gets a pipe by ID
 */
export async function getPipeByIdHandler(req: Request, res: Response) {
  try {
    const id = req.params.id
    const result = await db.query.pipe.findFirst({
      where: eq(pipe.id, id)
    })

    if (!result) {
      return res.status(404).json({ success: false, error: 'Pipe not found' })
    }

    return res.json({ success: true, pipe: result })
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

/**
 * Gets all pipes belonging to a specific flow
 */
export async function getPipesByFlowIdHandler(req: Request, res: Response) {
  try {
    const flowId = req.params.id
    const pipes = await db.query.pipe.findMany({
      where: eq(pipe.pipeFlowId, flowId)
    })

    return res.json({ success: true, pipes })
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

/**
 * Updates a pipe by ID
 */
export async function updatePipeHandler(req: Request, res: Response) {
  try {
    const id = req.params.id
    const {
      name,
      metadata,
      multiRun,
      maxCalls,
      currentCallCount
    } = req.body

    const [updatedPipe] = await db.update(pipe)
      .set({
        name: name !== undefined ? name : undefined,
        metadata: metadata !== undefined ? metadata : undefined,
        multiRun: multiRun !== undefined ? multiRun : undefined,
        maxCalls: maxCalls !== undefined ? maxCalls : undefined,
        currentCallCount: currentCallCount !== undefined ? currentCallCount : undefined,
        updatedAt: new Date()
      })
      .where(eq(pipe.id, id))
      .returning()

    if (!updatedPipe) {
      return res.status(404).json({ success: false, error: 'Pipe not found' })
    }

    return res.json({ success: true, pipe: updatedPipe })
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

/**
 * Deletes a pipe by ID
 */
export async function deletePipeHandler(req: Request, res: Response) {
  try {
    const id = req.params.id
    
    const [deletedPipe] = await db.delete(pipe)
      .where(eq(pipe.id, id))
      .returning()

    if (!deletedPipe) {
      return res.status(404).json({ success: false, error: 'Pipe not found' })
    }

    return res.json({ success: true, message: 'Pipe deleted successfully' })
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

export function generatePrompt(data: toolMetadata): string {
    // Destructure the metadata for easier access
    const { toolName, toolInput, nextToCall, description, callCount, amount } = data;
    
    // Build the prompt with proper formatting and clear instructions
    let prompt = `# Task Description for ${toolName}\n\n`;
    
    // Add the main tool description
    prompt += `${description}\n\n`;
    
    // Specify execution details
    prompt += `## Execution Instructions:\n`;
    prompt += `- Tool to call: ${toolName}\n`;
    prompt += `- Required calls: ${callCount} time${callCount !== 1 ? 's' : ''}\n`;
    
    // Include amount information if provided
    if (amount !== undefined) {
      prompt += `- Amount to be passed: ${amount}\n`;
    }
    
    // Add information about the next tool if provided
    if (nextToCall) {
      prompt += `- Next tool to call after completion: ${nextToCall}\n`;
    }
    
    // Include input data information if available
    if (toolInput) {
      prompt += `\n## Input Data:\n`;
      if (typeof toolInput === 'object') {
        prompt += `\`\`\`json\n${JSON.stringify(toolInput, null, 2)}\n\`\`\`\n`;
      } else {
        prompt += `${toolInput}\n`;
      }
    }
    
    // Add execution example for clarity
    prompt += `\n## Example Usage:\n`;
    prompt += `Please call the ${toolName} tool`;
    if (amount !== undefined) {
      prompt += ` with the amount ${amount}`;
    }
    if (callCount > 1) {
      prompt += ` exactly ${callCount} times as specified`;
    }
    prompt += `.`;
    
    return prompt;
  }