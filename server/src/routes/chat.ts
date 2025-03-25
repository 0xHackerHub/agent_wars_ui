import { Router, Request, Response, RequestHandler } from 'express';
import { chatService } from '../ai/openai';

const router = Router();

interface ChatRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  showIntermediateSteps?: boolean;
}

const handleChatMessage: RequestHandler = async (req: Request<{}, {}, ChatRequest>, res: Response): Promise<void> => {
  try {
    const { messages, showIntermediateSteps } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const response = await chatService.generateResponse(messages, showIntermediateSteps);
    
    // Forward the response headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle the response stream
    if (response.body) {
      const reader = response.body.getReader();
      const encoder = new TextEncoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = encoder.encode(value);
        res.write(chunk);
      }
      
      res.end();
    } else {
      res.status(500).json({ error: 'No response body' });
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      status: 'error'
    });
  }
};

router.post('/message', handleChatMessage);

export default router; 