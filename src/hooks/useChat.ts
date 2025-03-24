import { useState, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  message: string;
  response: string;
  createdAt: string;
  error?: string;
}

// Use the server URL directly
const SERVER_URL = 'http://localhost:8000';

export const useChat = (userAddress: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (userAddress) {
      fetchChatHistory();
    }
  }, [userAddress]);

  const fetchChatHistory = async () => {
    if (!userAddress) return;
    
    console.log(`Fetching chat history from ${SERVER_URL}/api/chat for user: ${userAddress}`);
    
    try {
      const response = await axios.get(`${SERVER_URL}/api/chat?userAddress=${userAddress}`);
      console.log('Chat history response:', response.data);
      setMessages(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching chat history:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      } else {
        console.error('Unexpected error fetching chat history:', error);
      }
    }
  };

  // Add function to set initial messages
  const setInitialMessages = (initialMessages: Message[]) => {
    setMessages(initialMessages);
  };

  const sendMessage = async (message: string, sessionId?: string | null) => {
    if (!userAddress || !message.trim()) return;

    setIsLoading(true);
    console.log(`Sending message to ${SERVER_URL}/api/chat with data:`, {
      message,
      userAddress,
      role: 'user',
      sessionId
    });
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/chat`, {
        message,
        userAddress,
        role: 'user',
        sessionId: sessionId || undefined
      });

      console.log('Message response:', response.data);
      
      const newMessage: Message = {
        id: response.data.id,
        message,
        response: response.data.response || '',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      
      if (axios.isAxiosError(error)) {
        console.error('Error sending message:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        errorMessage = error.response?.data?.error || 
                      error.response?.statusText || 
                      error.message || 
                      'Network error occurred';
      } else {
        console.error('Unexpected error sending message:', error);
        errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      }
      
      // Add the error to our errors list for logging
      setErrors(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${errorMessage}`]);
      
      // Create error message in the chat
      const errorMsg: Message = {
        id: Date.now().toString(),
        message,
        response: 'Error: ' + errorMessage,
        createdAt: new Date().toISOString(),
        error: errorMessage
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
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
    setInitialMessages,
    errors
  };
};
