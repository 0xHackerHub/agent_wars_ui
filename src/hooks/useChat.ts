import { useState, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  message: string;
  response: string;
  createdAt: string;
}

export const useChat = (userAddress: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userAddress) {
      fetchChatHistory();
    }
  }, [userAddress]);

  const fetchChatHistory = async () => {
    if (!userAddress) return;
    
    try {
      const response = await axios.get(`/api/chat?userAddress=${userAddress}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!userAddress || !message.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat', {
        message,
        userAddress,
      });

      const newMessage: Message = {
        id: response.data.id,
        message,
        response: response.data.response,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    fetchChatHistory,
  };
};
