import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AccountAddress } from '@aptos-labs/ts-sdk';

interface ChatHistoryProps {
  userAddress: string | AccountAddress | null;
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function ChatHistory({ userAddress, activeChat, onChatSelect }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch chat sessions directly from the server
  useEffect(() => {
    if (!userAddress) return;
    
    const fetchChatSessions = async () => {
      setIsLoading(true);
      try {
        // Convert to string if it's an AccountAddress
        const addressStr = typeof userAddress === 'string' ? userAddress : userAddress.toString();
        const response = await axios.get(`http://localhost:8000/api/chat/sessions?userAddress=${addressStr}`);
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatSessions();
  }, [userAddress]);

  // Sort sessions by most recent first
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (sortedSessions.length === 0 && !isLoading) {
    return null;
  }

  const handleChatSelect = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
    onChatSelect(sessionId);
  };

  return (
    <motion.div
      className="space-y-1 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 pb-2 pt-4">
        Chat History
      </div>
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="text-xs text-gray-400 px-3 py-2">Loading sessions...</div>
        ) : (
          sortedSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleChatSelect(session.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/50 transition-colors",
                activeChat === session.id && "bg-gray-100 dark:bg-neutral-800/50"
              )}
            >
              <div className="flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="truncate text-gray-700 dark:text-gray-300">
                {session.title}
              </span>
              <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                {new Date(session.updatedAt).toLocaleDateString()}
              </span>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
