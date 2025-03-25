import OpenAI from 'openai';
import { createAssistant } from './openai/create-assistant';
import { createThread } from './openai/create-thread';
import { createRun } from './openai/create-run';
import { performRun } from './openai/perform-run';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Assistant } from 'openai/resources/beta/assistants';
import { chatService as serverChatService } from '../../server/src/ai/openai';

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

interface ChatMessage {
  role: string;
  content: string;
}

class ChatService {
  private client: OpenAI;
  private assistant: Assistant | null = null;
  private threads: Map<string, Thread> = new Map();
  private latestResponse: ChatResponse | null = null;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getLatestResponse(): Promise<ChatResponse | null> {
    return this.latestResponse;
  }

  async getOrCreateAssistant() {
    if (!this.assistant) {
      this.assistant = await createAssistant(this.client);
    }
    return this.assistant;
  }

  async getOrCreateThread(threadId: string) {
    let thread = this.threads.get(threadId);
    if (!thread) {
      thread = await createThread(this.client);
      this.threads.set(threadId, thread);
    }
    return thread;
  }

  async processMessage(threadId: string, message: string): Promise<ChatResponse> {
    try {
      const assistant = await this.getOrCreateAssistant();
      const thread = await this.getOrCreateThread(threadId);
      await this.client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message
      });

      const runResult = await createRun(this.client, thread, assistant.id);
      const runResponse = await performRun(runResult.run, this.client, thread);

      if ('text' in runResponse) {
        const response: ChatResponse = {
          messages: [{
            id: Date.now().toString(),
            text: runResponse.text.value,
            type: 'assistant'
          }],
          sessionId: thread.id
        };
        this.latestResponse = response;
        return response;
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  async generateResponse(messages: ChatMessage[]) {
    try {
      // Ensure messages are in the correct format
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      console.log('Sending formatted messages:', formattedMessages);
      const response = await serverChatService.generateResponse(formattedMessages);
      return response;
    } catch (error) {
      console.error('Error in chat service:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'An error occurred',
          status: 'error'
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