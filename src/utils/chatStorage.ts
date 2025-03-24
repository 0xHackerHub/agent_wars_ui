import { ChatSession, ChatMessage } from '@/types/chat';

const STORAGE_KEY = 'chat_sessions';

// Get all chat sessions from storage
export const getChatSessions = (): ChatSession[] => {
  try {
    const sessionsJson = localStorage.getItem(STORAGE_KEY);
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

// Create a new chat session
export const createChatSession = async (firstMessage: string): Promise<ChatSession> => {
  const sessions = getChatSessions();
  const now = Date.now();
  
  const newSession: ChatSession = {
    id: now.toString(),
    title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  
  // Add the first message
  newSession.messages.push({
    id: now.toString(),
    content: firstMessage,
    sender: 'user',
    timestamp: now
  });
  
  // Save the updated sessions
  saveChatSessions([newSession, ...sessions]);
  
  return newSession;
};

// Add a message to a session
export const addMessageToSession = (
  sessionId: string, 
  message: { id: string; content: string; sender: 'user' | 'assistant' }
): ChatSession | null => {
  const sessions = getChatSessions();
  const sessionIndex = sessions.findIndex(session => session.id === sessionId);
  
  if (sessionIndex === -1) {
    return null;
  }
  
  const chatMessage: ChatMessage = {
    ...message,
    timestamp: Date.now()
  };
  
  // Update the session - safe to access since we checked sessionIndex !== -1
  const session = sessions[sessionIndex];
  if (!session) {
    return null;
  }
  
  session.messages.push(chatMessage);
  session.updatedAt = Date.now();
  
  saveChatSessions(sessions);
  
  return session;
};

// Save sessions to storage
const saveChatSessions = (sessions: ChatSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving chat sessions:', error);
  }
};

// Delete a chat session
export const deleteChatSession = (sessionId: string): void => {
  const sessions = getChatSessions();
  const updatedSessions = sessions.filter(session => session.id !== sessionId);
  saveChatSessions(updatedSessions);
};

// Clear all chat sessions
export const clearChatSessions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
