import OpenAI from 'openai';
import { config } from 'dotenv';
config();

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class ChatService {
  async generateResponse(message: string): Promise<string> {
    try {
      console.log('Generating AI response for message:', message);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for Move language and blockchain.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      console.log('Generated response:', response);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Sorry, there was an error generating a response. Please try again.';
    }
  }
}

export const chatService = new ChatService(); 