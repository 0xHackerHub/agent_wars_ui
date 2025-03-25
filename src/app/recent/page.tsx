"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { ChatSession } from '@/types/chat';
import { useChat } from '@/hooks/useChat';

export default function RecentPage() {
  const router = useRouter();
  const { userAddress } = useChat();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!userAddress) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/sessions?userAddress=${userAddress}`
        );
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [userAddress]);

  const handleChatSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
    router.push(`/chat/${sessionId}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold mb-6">All Chat History</h1>
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border ${
                selectedSession === session.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <button
                onClick={() => handleChatSelect(session.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <MessageCircle className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium truncate">{session.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    Last updated: {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
