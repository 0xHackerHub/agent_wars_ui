import React, { useState, useEffect } from 'react';
import { Shuffle, Grid, FileText, Activity, Pause, Network, Play, Box, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from 'react-type-animation';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { ChatSession } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import ConnectionDetails from '@/components/Connection';
import { createChatSession } from '@/utils/chatStorage';
import { getWalletAddress } from '@/utils/getWalletAddress';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  error?: boolean;
}

interface ChatResponse {
  id: string;
  response: string;
  error?: string;
  sessionId?: string;
}

interface NewChatScreenProps {
  currentSession: ChatSession | null;
  onSessionCreate: (session: ChatSession) => void;
  isNetwork: boolean;
  logEvent?: (message: string, type: 'info' | 'user' | 'agent' | 'error') => void;
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ currentSession, onSessionCreate, isNetwork, logEvent }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(currentSession?.id || null);
  const [sessionTitle, setSessionTitle] = useState<string>(currentSession?.title || 'New Chat');
  const [isNewChat, setIsNewChat] = useState<boolean>(!currentSession?.id);

  // Get wallet address on component mount
  useEffect(() => {
    // Get the wallet address on client-side only
    const address = getWalletAddress();
    console.log('Using wallet address:', address);
    setUserAddress(address);
  }, []);

  // Update session ID and title if currentSession changes
  useEffect(() => {
    if (currentSession) {
      setActiveSessionId(currentSession.id);
      setSessionTitle(currentSession.title);
      setIsNewChat(false);
      
      // If current session has messages, load them
      if (currentSession.messages && currentSession.messages.length > 0) {
        const formattedMessages = currentSession.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          type: msg.sender as 'user' | 'assistant'
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } else {
      // Reset for a new chat
      setActiveSessionId(null);
      setSessionTitle('New Chat');
      setMessages([]);
      setIsNewChat(true);
    }
  }, [currentSession]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Log user message
    logEvent?.(`User: ${inputValue}`, 'user');
    
    // If this is the first message in a new chat, update the title
    if (isNewChat) {
      // Update the title with the first few words of the message
      const newTitle = inputValue.substring(0, 30) + (inputValue.length > 30 ? '...' : '');
      setSessionTitle(newTitle);
    }
    
    setInputValue('');
    setIsLoading(true);

    try {
      const serverUrl = 'http://localhost:8000';
      console.log(`Sending message to ${serverUrl}/api/chat`);
      
      // Use the wallet address if available, otherwise fall back to session ID or anonymous
      const address = userAddress || 'anonymous';
      console.log('Using address for chat message:', address);
      
      // Log sending request
      logEvent?.('Sending request to agent...', 'info');
      
      const response = await fetch(`${serverUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          userAddress: address,
          role: 'user',
          // Only send sessionId if not a new chat
          sessionId: isNewChat ? null : activeSessionId
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        // Log error
        logEvent?.(`Error: ${data.error || 'Failed to get response'}`, 'error');
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.response) {
        // Log agent response
        logEvent?.(`Agent-w: ${data.response}`, 'agent');
        
        setMessages(prev => [...prev, {
          id: data.id || Date.now().toString(),
          text: data.response,
          type: 'assistant'
        }]);

        // Store the session ID from the response
        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
          setIsNewChat(false);
          
          // Create a new session in the UI if we don't have one yet
          if (isNewChat) {
            const newSession: ChatSession = {
              id: data.sessionId,
              title: sessionTitle !== 'New Chat' ? sessionTitle : inputValue.substring(0, 30) + (inputValue.length > 30 ? '...' : ''),
              messages: [
                {
                  id: userMessage.id,
                  content: userMessage.text,
                  sender: 'user',
                  timestamp: Date.now()
                },
                {
                  id: data.id,
                  content: data.response,
                  sender: 'assistant',
                  timestamp: Date.now()
                }
              ],
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            onSessionCreate(newSession);
          }
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Get the error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while processing your message';
      
      // Log the error
      logEvent?.(`${errorMessage}`, 'error');
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: errorMessage,
        type: 'assistant',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <h2 className="text-2xl font-bold mb-2">Hello,</h2>
              <p className="text-gray-600">How can I help you to make your Move?</p>
            </motion.div>
          )}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-lg max-w-[80%]",
                message.type === 'user' 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : message.error
                    ? "bg-red-100 text-red-800 mr-auto"
                    : "bg-muted mr-auto"
              )}
            >
              {message.text}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-muted p-4 rounded-lg max-w-[80%] mr-auto"
            >
              <TypeAnimation
                sequence={['Thinking...', 1000, 'Processing...', 1000]}
                repeat={Infinity}
                style={{ fontSize: '1em' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className={cn(
              "flex-1",
              isFocused && "ring-2 ring-primary"
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

// Feature card component
function FeatureCard({ 
  icon, 
  title, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  gradient: string;
}) {
  return (
    <motion.div 
      className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-200 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl`}
      whileHover={{ 
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div 
        className="bg-white/20 dark:bg-neutral-800/20 w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 dark:text-neutral-300 shadow-lg backdrop-blur-xl mb-[84px]"
        whileHover={{ rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-[15px] font-medium text-gray-800 dark:text-neutral-100">{title}</h3>
    </motion.div>
  );
}

const NewAgentScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 rounded-3xl">
      <h1 className="text-2xl font-semibold mb-4">New Agent</h1>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-medium">Create a New Agent</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Design and configure a new AI agent with custom capabilities and behaviors.
          </p>
        </div>
      </div>
    </div>
  );
};

const AgentCard: React.FC<{
  name: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
}> = ({ name, description, gradient, icon }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative h-[200px] p-6 rounded-2xl border border-white/20 dark:border-neutral-800/50",
        "bg-gradient-to-br backdrop-blur-xl shadow-sm cursor-pointer",
        "transition-all duration-300 ease-in-out flex flex-col",
        gradient
      )}
      tabIndex={0}
      role="button"
      aria-label={`Select ${name} agent`}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-white/80 dark:bg-neutral-900/80">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const BrowseAgentsScreen: React.FC = () => {
  const agents = [
    {
      name: "Joule agent",
      description: "Specialized agent for Joule Finance for trading and bridging",
      gradient: "from-blue-400/10 to-purple-400/10 dark:from-blue-500/10 dark:to-purple-500/10",
      icon: <Bot className="w-5 h-5 text-blue-500" />
    },
    {
      name: "Merkle agent",
      description: "Expert agent for Merkle Trade operations",
      gradient: "from-yellow-400/10 to-orange-400/10 dark:from-yellow-500/10 dark:to-orange-500/10",
      icon: <Bot className="w-5 h-5 text-yellow-500" />
    },
    {
      name: "Aptos agent",
      description: "Dedicated agent for Aptos Network operations and monitoring",
      gradient: "from-green-400/10 to-emerald-400/10 dark:from-green-500/10 dark:to-emerald-500/10",
      icon: <Bot className="w-5 h-5 text-green-500" />
    }
  ];

  return (
    <div className="flex flex-col h-full p-6 rounded-3xl">
      <h1 className="text-2xl font-semibold mb-4">Browse Agents</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Explore and connect with various AI agents available on the network.
      </p>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {agents.map((agent) => (
          <motion.div key={agent.name} variants={item} className="h-full">
            <AgentCard {...agent} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const ConnectionsScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 rounded-3xl">
      <ConnectionDetails />
    </div>
  );
};

const OperatorWelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex flex-col h-full p-6 rounded-3xl">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl mb-4">
            <Network className="w-10 h-10 text-gray-600 dark:text-neutral-400" />
          </div>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-neutral-200">Welcome to Operator Mode</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Start your node to begin processing requests and contributing to the decentralized network.
          </p>
          <div className="pt-4">
            <Button
              className="h-12 px-6 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Node
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModelsScreen: React.FC = () => {
  const mockModels = [
    {
      name: "Claude 3.5 Sonnet",
      modified_at: "2024-03-20T10:00:00Z",
      size: 4096,
      details: {
        parameter_size: "7B",
        family: "Anthropic"
      }
    },
    {
      name: "GPT-4o",
      modified_at: "2024-03-19T15:30:00Z",
      size: 8192,
      details: {
        parameter_size: "7B",
        family: "OpenAI"
      }
    }
  ];

  return (
    <div className="flex flex-col h-full p-6 rounded-3xl">
      <div className="flex items-center mb-6">
        <Box className="w-5 h-5 mr-2 text-gray-600 dark:text-neutral-400" />
        <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-200">Available Models</h2>
      </div>
      
      <div className="space-y-4">
        {mockModels.map((model) => (
          <div
            key={model.name}
            className="bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800 dark:text-neutral-200">
                  {model.name}
                </h3>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Family: {model.details.family} • Size: {model.details.parameter_size}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Modified: {new Date(model.modified_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Switch
                checked={true}
                disabled={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  NewChatScreen,
  NewAgentScreen,
  BrowseAgentsScreen,
  ConnectionsScreen,
  OperatorWelcomeScreen,
  ModelsScreen
}; 