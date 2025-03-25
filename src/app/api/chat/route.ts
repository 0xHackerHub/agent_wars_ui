import { NextResponse } from 'next/server';
import { chatService } from '@/ai/service';
import { db } from '@/db';
import { chatHistory, wallets } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  error?: boolean;
}

interface ChatResponse {
  messages: Message[];
  sessionId: string;
  error?: string;
}

async function ensureWalletExists(userAddress: string) {
  try {
    console.log('Checking wallet existence for:', userAddress);
    const existingWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userAddress, userAddress),
    });

    if (!existingWallet) {
      console.log('Creating new wallet for:', userAddress);
      const [newWallet] = await db.insert(wallets).values({
        userAddress,
      }).returning();
      console.log('Created new wallet:', newWallet);
      return newWallet;
    }

    console.log('Found existing wallet:', existingWallet);
    return existingWallet;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database error while ensuring wallet exists:', {
        error: error.message,
        stack: error.stack,
        userAddress
      });
    } else {
      console.error('Unknown error while ensuring wallet exists:', error);
    }
    throw error;
  }
}

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;
    const userAddress = body.userAddress || '0x0000000000000000000000000000000000000000';

    console.log('Message content:', message);
    console.log('Session ID (if provided):', sessionId);

    // Ensure wallet exists
    await ensureWalletExists(userAddress);

    let currentSession;
    if (sessionId) {
      currentSession = await db.query.chatHistory.findFirst({
        where: eq(chatHistory.id, sessionId),
      });
    }

    if (!currentSession) {
      console.log('Creating new chat session');
      const [newSession] = await db.insert(chatHistory).values({
        userAddress,
        message,
        response: '', // Will be updated after getting the response
      }).returning();
      console.log('Created new chat session:', newSession);
      currentSession = newSession;
    }

    if (!currentSession) {
      throw new Error('Failed to create or find chat session');
    }

    // Format messages for the UI
    const uiMessages: Message[] = [
      {
        id: Date.now().toString(),
        text: message,
        type: 'user'
      }
    ];

    // Create a properly formatted message for the AI service
    const aiMessage = {
      role: 'user',
      content: message
    };

    // Get response from chat service
    const response = await chatService.generateResponse([aiMessage]);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'An error occurred';
      uiMessages.push({
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        type: 'assistant',
        error: true
      });

      // Update chat history with error
      await db.update(chatHistory)
        .set({ response: errorMessage })
        .where(eq(chatHistory.id, currentSession.id));
    } else {
      const reader = response.body?.getReader();
      if (reader) {
        let assistantMessage = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            assistantMessage += chunk;
            
            // Update the last message or create a new one
            const lastMessage = uiMessages[uiMessages.length - 1];
            if (lastMessage && lastMessage.type === 'assistant') {
              lastMessage.text = assistantMessage;
            } else {
              uiMessages.push({
                id: (Date.now() + 1).toString(),
                text: assistantMessage,
                type: 'assistant'
              });
            }
          }
        } catch (error) {
          console.error('Error reading stream:', error);
          // If there's a streaming error but we got some content, still use what we have
          if (!assistantMessage) {
            assistantMessage = 'Error reading response stream';
            uiMessages.push({
              id: (Date.now() + 1).toString(),
              text: assistantMessage,
              type: 'assistant',
              error: true
            });
          }
        }

        // Update chat history with final response
        await db.update(chatHistory)
          .set({ response: assistantMessage })
          .where(eq(chatHistory.id, currentSession.id));
      }
    }

    return NextResponse.json({
      messages: uiMessages,
      sessionId: currentSession.id
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred',
        status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    console.log('Fetching chat history for user:', userAddress);

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 });
    }

    try {
      await ensureWalletExists(userAddress);
    } catch (error) {
      console.error('Failed to ensure wallet exists:', error);
      return NextResponse.json({ 
        error: 'Database connection error. Please try again.' 
      }, { status: 500 });
    }

    try {
      const history = await db.query.chatHistory.findMany({
        where: eq(chatHistory.userAddress, userAddress),
        orderBy: (chatHistory, { asc }) => [asc(chatHistory.createdAt)],
      });

      console.log('Found chat history entries:', history.length);
      return NextResponse.json(history);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch chat history. Please try again.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/chat:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}