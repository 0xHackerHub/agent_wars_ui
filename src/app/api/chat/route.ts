import { NextResponse } from 'next/server';
import { chatService } from '@/ai/service';
import { db } from '@/db';
import { chatHistory, wallets } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface ChatResponse {
  assistantId: string;
  threadId: string;
  text: {
    value: string;
    annotations: never[];
  };
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

export async function POST(req: Request) {
  try {
    const { message, userAddress } = await req.json();
    console.log('Processing message for user:', userAddress);

    try {
      await ensureWalletExists(userAddress);
    } catch (error) {
      console.error('Failed to ensure wallet exists:', error);
      return NextResponse.json({ 
        error: 'Database connection error. Please try again.' 
      }, { status: 500 });
    }
    
    console.log('Processing message:', message);
    
    const result = await chatService.processMessage(
      userAddress,
      message,
    ) as ChatResponse;

    console.log('Chat API result:', result);

    try {
      const [savedChat] = await db.insert(chatHistory).values({
        userAddress,
        message,
        response: result.text.value,
      }).returning();

      return NextResponse.json({
        id: savedChat?.id,
        response: result.text.value
      });
    } catch (error) {
      console.error('Failed to save chat history:', error);
      return NextResponse.json({ 
        error: 'Failed to save chat history. Please try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process message'
    }, { status: 500 });
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