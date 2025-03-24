import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  response: string;
  createdAt: string;
}

interface ChatProps {
  userAddress: string | null;
}

export function Chat({ userAddress }: ChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userAddress) {
      fetchChatHistory();
    }
  }, [userAddress]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history?userAddress=${userAddress}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userAddress) return;

    setIsLoading(true);
    const userMessage = input;
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userAddress,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: data.id,
        message: userMessage,
        response: data.response,
        createdAt: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 max-w-[80%]">
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 max-w-[80%]">
                <p className="text-sm">{msg.response}</p>
              </div>
            </div>
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
