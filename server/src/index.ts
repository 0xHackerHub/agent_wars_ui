import express, { RequestHandler } from 'express';
import cors, { CorsOptions } from 'cors';
import { db } from './db/client';
import { wallets, chatHistory, chatSessions } from './db/schema';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import { chatService } from './ai/openai';
config();

const app = express();
const port = 8000;

export const corsOptions: CorsOptions = {
  origin: [
    "https://www.agent-w.xyz",
    "http://localhost:3000",
  ], // Replace with your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug endpoint to check database connection
app.get('/debug', async (req, res) => {
  try {
    // Try to query the database
    const count = await db.select().from(wallets).execute();
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      walletCount: count.length,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 20) + '...' // Only show part of the URL for security
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get chat sessions for a user
app.get('/api/chat/sessions', (async (req, res) => {
  try {
    const { userAddress } = req.query;
    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({ error: 'User address is required' });
    }

    console.log('Fetching chat sessions for user:', userAddress);

    // Get or create wallet
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userAddress, userAddress),
    });

    if (!wallet) {
      console.log('Creating new wallet for:', userAddress);
      const [newWallet] = await db.insert(wallets).values({
        userAddress,
      }).returning();
      wallet = newWallet;
      console.log('Created new wallet:', newWallet);
    }

    // Get chat sessions
    const sessions = await db.query.chatSessions.findMany({
      where: eq(chatSessions.userAddress, userAddress),
      orderBy: (chatSessions, { desc }) => [desc(chatSessions.updatedAt)],
    });

    console.log('Found chat sessions:', sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

// Get chat history
app.get('/api/chat', (async (req, res) => {
  try {
    const { userAddress, sessionId } = req.query;
    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({ error: 'User address is required' });
    }

    console.log('Fetching chat history for user:', userAddress);

    // Get or create wallet
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userAddress, userAddress),
    });

    console.log('Existing wallet:', wallet);

    if (!wallet) {
      console.log('Creating new wallet for:', userAddress);
      const [newWallet] = await db.insert(wallets).values({
        userAddress,
      }).returning();
      wallet = newWallet;
      console.log('Created new wallet:', newWallet);
    }

    // Build query conditions
    let historyQuery: any = { 
      where: eq(chatHistory.userAddress, userAddress) 
    };

    // Add session filter if provided
    if (sessionId && typeof sessionId === 'string') {
      historyQuery = {
        where: (fields: any) => 
          eq(fields.userAddress, userAddress) && 
          eq(fields.sessionId, sessionId)
      };
    }

    // Get chat history with ordering
    const history = await db.query.chatHistory.findMany({
      ...historyQuery,
      orderBy: (chatHistory, { asc }) => [asc(chatHistory.createdAt)],
    });

    console.log('Found chat history:', history.length);
    res.json(history);
  } catch (error) {
    console.error('Detailed error in chat history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

// Send message
app.post('/api/chat', (async (req, res) => {
  try {
    const { userAddress, message, role, sessionId } = req.body;
    if (!userAddress || !message) {
      return res.status(400).json({ error: 'Missing required fields: userAddress and message are required' });
    }

    console.log('Processing message from user:', userAddress);
    console.log('Message content:', message);
    console.log('Session ID (if provided):', sessionId);

    // Get or create wallet
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userAddress, userAddress),
    });

    if (!wallet) {
      console.log('Creating new wallet for:', userAddress);
      const [newWallet] = await db.insert(wallets).values({
        userAddress,
      }).returning();
      wallet = newWallet;
      console.log('Created new wallet:', newWallet);
    }

    // Get or create chat session
    let chatSessionId = sessionId;
    
    // Check if the session ID exists if provided
    if (sessionId) {
      const existingSession = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, sessionId),
      });
      
      if (!existingSession) {
        console.log('Session ID provided but not found, creating new session');
        chatSessionId = null; // Will create a new session below
      } else {
        console.log('Using existing session:', existingSession);
      }
    }
    
    // Create a new session if needed
    if (!chatSessionId) {
      console.log('Creating new chat session');
      // Use first few words of message as title
      const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      const [newSession] = await db.insert(chatSessions).values({
        userAddress,
        title,
      }).returning();
      chatSessionId = newSession.id;
      console.log('Created new chat session:', newSession);
    } else {
      // Update the session's updatedAt timestamp
      await db.update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, chatSessionId))
        .execute();
      console.log('Updated existing session timestamp:', chatSessionId);
    }

    // Generate AI response
    const aiResponse = await chatService.generateResponse(message);
    console.log('AI response:', aiResponse);

    // Save user message
    const [userMessage] = await db.insert(chatHistory).values({
      userAddress,
      sessionId: chatSessionId,
      message,
      response: '',
    }).returning();

    // Save AI response
    const [assistantMessage] = await db.insert(chatHistory).values({
      userAddress,
      sessionId: chatSessionId,
      message: aiResponse,
      response: aiResponse,
    }).returning();

    res.json({
      id: assistantMessage.id,
      sessionId: chatSessionId,
      response: aiResponse
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 