import { Router, Request, Response, RequestHandler } from 'express';
import { chatService } from '../ai/openai';

const router = Router();

interface ChatRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  showIntermediateSteps?: boolean;
  userAddress?: string;
  sessionId?: string;
}

const handleChatMessage: RequestHandler = async (req: Request<{}, {}, ChatRequest>, res: Response): Promise<void> => {
  try {
    const { messages, showIntermediateSteps, userAddress, sessionId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    console.log('Processing chat request:', {
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) + '...',
      showIntermediateSteps,
      userAddress: userAddress ? `${userAddress.substring(0, 8)}...` : null,
      sessionId
    });

    // Handle streaming response
    const response = await chatService.generateResponse(messages, showIntermediateSteps);
    
    // Set proper response headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    if (response.body) {
      const reader = response.body.getReader();
      
      // Process stream chunks
      let buffer = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Extract and format tool usage if present
        if (buffer.includes('Tool:')) {
          // Format tool usage with highlighting
          buffer = highlightToolUsage(buffer);
        }
        
        // Send chunk to client
        res.write(chunk);
      }
      
      // Process any remaining text
      const remainingText = decoder.decode();
      if (remainingText) {
        res.write(remainingText);
      }
      
      res.end();
    } else {
      res.status(500).json({ error: 'No response body from agent' });
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    
    // Send more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({
      error: errorMessage,
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      } : undefined,
      status: 'error'
    });
  }
};

/**
 * Formats and highlights tool usage in the response text
 */
function highlightToolUsage(text: string): string {
  // Replace tool invocation patterns with highlighted versions
  return text
    .replace(/Action: ([^\n]+)/g, '**Action: $1**')
    .replace(/Transaction successful!/g, '**Transaction successful!**')
    .replace(/Transaction hash: ([0-9a-fx]+)/g, 'Transaction hash: **$1**')
    .replace(/Position ID: ([0-9]+)/g, 'Position ID: **$1**');
}

// Define route for chat messages
router.post('/message', handleChatMessage);

// Define a specialized route for Aptos Agent interaction
router.post('/aptos-agent', (async (req, res) => {
  try {
    const { message, userAddress, sessionId } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    // Format the message for the agent
    const formattedMessages = [{
      role: 'user',
      content: message
    }];
    
    // Get response from the agent with intermediate steps enabled
    const agentResponse = await chatService.generateResponse(formattedMessages, true);
    
    // Process the response
    const responseText = await processAgentResponse(agentResponse);
    
    // Return formatted response
    res.json({
      message: responseText,
      sessionId,
      userAddress
    });
  } catch (error) {
    console.error('Error in aptos-agent route:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred',
      status: 'error'
    });
  }
}) as RequestHandler);

/**
 * Process the agent response to extract all valuable information
 */
async function processAgentResponse(response: { body: ReadableStream | null }): Promise<string> {
  if (!response.body) {
    return 'No response from agent';
  }
  
  const reader = response.body.getReader();
  let result = '';
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  
  // Add any remaining decoded text
  result += decoder.decode();
  
  // Format the response with tool usage highlighting
  return highlightToolUsage(result);
}

export default router;