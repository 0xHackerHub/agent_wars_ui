"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BaseLayout from "@/layouts/BaseLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { Chat } from "@/components/Chat";
import { useWallet } from "@/hooks/useWallet";
import { getWalletAddress } from "@/utils/getWalletAddress";
import { ChatSession } from "@/types/chat";

export default function ChatViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get chat session details
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user address
        const userAddress = address?.toString() || getWalletAddress();
        if (!userAddress) {
          setError("No wallet address found");
          setIsLoading(false);
          return;
        }
        
        // First, fetch the session details
        const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/sessions?userAddress=${userAddress}`);
        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch sessions");
        }
        
        const sessions = await sessionResponse.json();
        const selectedSession = sessions.find((s: any) => s.id === params.id);
        
        if (selectedSession) {
          // Create a session object with the required properties
          const sessionObj: ChatSession = {
            id: selectedSession.id,
            title: selectedSession.title,
            messages: [], // Will be populated below
            createdAt: new Date(selectedSession.createdAt).getTime(),
            updatedAt: new Date(selectedSession.updatedAt).getTime()
          };
          
          // Then fetch the messages for this session
          const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat?userAddress=${userAddress}&sessionId=${params.id}`);
          if (!messagesResponse.ok) {
            throw new Error("Failed to fetch messages");
          }
          
          const messages = await messagesResponse.json();
          
          // Set the active session with its messages
          setSession({
            ...sessionObj,
            messages: messages.map((msg: any) => ({
              id: msg.id,
              content: msg.message,
              sender: msg.response === msg.message ? 'assistant' : 'user',
              timestamp: new Date(msg.createdAt).getTime()
            }))
          });
        } else {
          setError("Chat session not found");
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (params.id) {
      fetchSession();
    }
  }, [params.id, address]);
  
  return (
    <ThemeProvider defaultTheme="system">
      <BaseLayout>
        <div className="h-[calc(100vh-4rem)] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => router.push('/chat')}
              >
                Back to Chat
              </button>
            </div>
          ) : (
            <Chat userAddress={getWalletAddress()} initialSession={session} />
          )}
        </div>
      </BaseLayout>
    </ThemeProvider>
  );
} 