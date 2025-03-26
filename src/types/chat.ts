export interface ChatMessage {
    id: string;
    content: string;
    timestamp: number;
    sender: 'user' | 'assistant';
    error?: string;
    sessionId?: string;
  }


interface ChatSessionMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}
  
  export interface ChatSession {
    id: string;
    title: string;  // First few words of the first message
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
  } 

  interface ImportedChatSession extends ChatSession {
    messages: ChatSessionMessage[];
  }