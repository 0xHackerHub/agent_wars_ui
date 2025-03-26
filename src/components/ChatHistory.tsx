import { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { Button } from '@/components/ui/button';

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
  
  // Number of chats to show in the sidebar
  const MAX_VISIBLE_CHATS = 10;

  // Fetch chat sessions directly from the server
  useEffect(() => {
    if (!userAddress) return;
    
    const fetchChatSessions = async () => {
      setIsLoading(true);
      try {
        // Convert to string if it's an AccountAddress
        const addressStr = typeof userAddress === 'string' ? userAddress : userAddress.toString();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/sessions?userAddress=${addressStr}`);
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
  
  // Only show the most recent MAX_VISIBLE_CHATS chats
  const visibleSessions = sortedSessions.slice(0, MAX_VISIBLE_CHATS);
  
  if (sortedSessions.length === 0 && !isLoading) {
    return null;
  }

  const handleChatSelect = (sessionId: string) => {
    onChatSelect(sessionId);
  };
  
  const handleViewAll = () => {
    router.push('/recent');
  };

  return (
    <motion.div
      className="space-y-1 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ height: 'auto' }} // Keep height stable
    >
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 pb-2 pt-4">
        Chat History
      </div>
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="text-xs text-gray-400 px-3 py-2">Loading sessions...</div>
        ) : (
          visibleSessions.map((session) => (
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
        
        {/* View All button when there are more than MAX_VISIBLE_CHATS sessions */}
        {sortedSessions.length > MAX_VISIBLE_CHATS && (
          <Button
            variant="ghost"
            onClick={handleViewAll}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <span>View all chats</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}