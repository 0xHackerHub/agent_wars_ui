import { useChat } from '@/hooks/useChat';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  userAddress: string | null;
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
}

export function ChatHistory({ userAddress, activeChat, onChatSelect }: ChatHistoryProps) {
  const { messages } = useChat(userAddress);

  // Group messages by chat ID to show unique chats
  const uniqueChats = messages.reduce((acc, msg) => {
    if (!acc.find(chat => chat.id === msg.id)) {
      acc.push({
        id: msg.id,
        message: msg.message,
        timestamp: new Date(msg.createdAt),
      });
    }
    return acc;
  }, [] as Array<{ id: string; message: string; timestamp: Date }>);

  // Sort chats by most recent first
  const sortedChats = uniqueChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <motion.div
      className="space-y-1 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="space-y-1">
        {sortedChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/50 transition-colors",
              activeChat === chat.id && "bg-gray-100 dark:bg-neutral-800/50"
            )}
          >
            <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="truncate text-gray-700 dark:text-gray-300">
              {chat.message}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              {chat.timestamp.toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
