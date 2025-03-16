import { useState } from 'react';
import axios from 'axios';

const CLIENT_TOPIC = '/chat/client-message/agent';
const RESPONSE_TOPIC = '/chat/server-message/agent';
interface Message {
    payload: string;
    timestamp: number;
    contentTopic: string;
    isResponse: boolean;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  //subscribe to messages
  const subscribeToMessages = async () => {
    try {
      const response = await axios.post('/api/auto/subscriptions');
      setMessages(response.data);
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get('/api/auto/responses');
      if (response.data && response.data.length > 0) {
        setMessages(prevMessages => {
            const newMessages = response.data.filter(
              (newMsg: Message) => !prevMessages.some(
                prevMsg => prevMsg.timestamp === newMsg.timestamp
              )
            ).map((msg: Message) => ({
              ...msg,
              isResponse: true
            }));
            return [...prevMessages, ...newMessages];
          });
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };
  
  
  const sendMessage = async (message: string) => {
   if(!message) return;
   try{
    const encodedMessage=btoa(message);
   const response = await axios.post('/api/auto/messages', { message });
   setMessages(prev => [...prev, {
    payload: encodedMessage,
    timestamp: Date.now(),
    contentTopic: CLIENT_TOPIC,
    isResponse: false
  }]);
  return true;
   } catch (error) {
    console.error('Error sending message:', error);
    return false;
   }
  };

  return { messages, sendMessage, clearMessages: () => setMessages([]) };
};
