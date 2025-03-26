"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecentPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { address } = useWallet();

  // Fetch chat sessions directly from the server
  useEffect(() => {
    if (!address) return;
    
    const fetchChatSessions = async () => {
      setIsLoading(true);
      try {
        // Convert to string if it's an AccountAddress
        const addressStr = address.toString();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/sessions?userAddress=${addressStr}`);
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatSessions();
  }, [address]);

  // Sort sessions by most recent first
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleChatSelect = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-white/20 dark:border-neutral-800/50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-medium text-gray-800 dark:text-neutral-200">All Chat History</h1>
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading chat history...</div>
          ) : sortedSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No chat history found</div>
          ) : (
            sortedSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => handleChatSelect(session.id)}
                  className="w-full flex items-center gap-3 p-4 text-left rounded-lg hover:bg-white/10 dark:hover:bg-neutral-800/50 transition-colors border border-white/10 dark:border-neutral-800/50"
                >
                  <div className="flex-shrink-0 bg-white/10 dark:bg-neutral-800/50 rounded-full p-2">
                    <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-white truncate">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Last updated: {new Date(session.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}