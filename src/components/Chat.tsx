"use client"
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatSession } from '@/types/chat';

interface Message {
  id: string;
  message: string;
  response: string;
  createdAt: string;
  error?: string;
}

interface ChatProps {
  userAddress: string | null;
  initialSession?: ChatSession | null;
}

export function Chat({ userAddress, initialSession }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the custom hook that connects directly to the Express server
  const { messages, isLoading, sendMessage, setInitialMessages } = useChat(userAddress);

  // If we have an initial session, use its messages
  useEffect(() => {
    if (initialSession?.messages?.length) {
      // Convert format from ChatSession message format to Chat component format
      const convertedMessages = initialSession.messages.map(msg => ({
        id: msg.id,
        message: msg.content,
        response: msg.sender === 'assistant' ? msg.content : '',
        createdAt: new Date(msg.timestamp).toISOString(),
        sessionId: msg.sessionId
      }));
      
      setInitialMessages(convertedMessages);
    }
  }, [initialSession, setInitialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userAddress) return;

    const userMessage = input;
    setInput('');

    try {
      const response = await sendMessage(userMessage, initialSession?.id);
      if (response?.error) {
        console.error('Error in response:', response.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User message */}
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 max-w-[80%]">
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
            {/* Assistant response */}
            {msg.response && (
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                </div>
              </div>
            )}
            {/* Error message if any */}
            {msg.error && (
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-red-100 dark:bg-red-900 rounded-lg p-2 max-w-[80%]">
                  <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{msg.error}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border dark:border-gray-800 p-2 bg-transparent"
            disabled={isLoading || !userAddress}
          />
          <button
            type="submit"
            disabled={isLoading || !userAddress}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
