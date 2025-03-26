"use client"
import React, { useEffect, useState } from "react";
import { Home, Users, History, Plus, Moon, Sun, RadioTower, Settings, Download, Network, MessageCircle, Info, Cog, Link2, Activity, Bot, FolderSearch, X, Play, Pause, Box, ChevronsLeftRightEllipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { Route } from "@/types/routes";
import { NewChatScreen, NewAgentScreen, BrowseAgentsScreen, ConnectionsScreen, ModelsScreen } from "./Screen";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/types/chat";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@aptos-labs/ts-sdk";
import { ChatHistory } from "@/components/ChatHistory";
import { AccountAddress } from "@aptos-labs/ts-sdk";

// Animation variants
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

// Component for the logo section
const LogoSection = () => {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className="flex items-center space-x-2 px-4 py-3"
      variants={itemVariants}
    >
      <span className="font-medium text-2xl text-gray-800 dark:text-neutral-50 flex items-center justify-center w-full">Agent-W</span>
    </motion.div>
  );
};

// Component for inference mode navigation
const InferenceModeNav = ({ 
  setActiveRoute,
  activeRoute,
  userAddress,
  currentSession,
  onSessionSelect,
  setActiveSession
}: { 
  setActiveRoute: (route: Route) => void;
  activeRoute: Route;
  userAddress: string | AccountAddress | null;
  currentSession: ChatSession | null;
  onSessionSelect: (sessionIdOrSession: string | ChatSession | null) => void;
  setActiveSession: (session: ChatSession | null) => void;
}) => {
  // Function to handle session selection at the component level
  const handleSessionSelect = (chatId: string) => {
    // Call the parent's session select handler
    onSessionSelect(chatId);
  };

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Button 
        variant="outline" 
        className={cn(
          "w-full h-10 justify-start text-[13px] rounded-xl backdrop-blur-sm",
          activeRoute === 'new-chat'
            ? "text-gray-800 dark:text-gray-100 border-gray-200 dark:border-neutral-800"
            : ""
        )}
        onClick={() => {
          setActiveRoute('new-chat');
          // Reset active session for new chat
          setActiveSession(null);
        }}
      >
        <Plus className="mr-3 h-4 w-4" />
        New chat
      </Button>

      <div className="mt-4">
        <div onClick={() => setActiveRoute('new-agent')}>
          <NavItem 
            icon={<Bot size={16} />} 
            label="New agent" 
            route="new-agent"
            currentRoute={activeRoute}
          />
        </div>
        <div onClick={() => setActiveRoute('browse-agents')}>
          <NavItem 
            icon={<FolderSearch size={16} />} 
            label="Browse agents" 
            route="browse-agents"
            currentRoute={activeRoute}
          />
        </div>
        <div onClick={() => setActiveRoute('connections')}>
          <NavItem 
            icon={<Link2 size={16} />} 
            label="Connections" 
            route="connections"
            currentRoute={activeRoute}
          />
        </div>
        <div onClick={() => setActiveRoute('models')}>
          <NavItem 
            icon={<Box size={16} />} 
            label="Models" 
            route="models"
            currentRoute={activeRoute}
          />
        </div>
        {/* Chat History */}
      {userAddress && (
        <ChatHistory
          userAddress={userAddress}
          activeChat={currentSession?.id || null}
          onChatSelect={(chatId) => {
            // Load the selected chat
            handleSessionSelect(chatId);
          }}
        />
      )}
      </div>
    </motion.div>
  );
};

const SwitcherIcon = ({ icon, isActive, onClick }: { icon: React.ReactNode; isActive: boolean; onClick: () => void }) => (
  <button
    className={cn(
      "flex items-center justify-center w-full p-2 rounded-lg transition-colors",
      isActive 
        ? "bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200" 
        : "text-gray-500 dark:text-neutral-500 hover:text-gray-800 dark:hover:text-neutral-200"
    )}
    onClick={onClick}
  >
    {icon}
  </button>
);

// Component for the control buttons
const ControlButton = ({ 
  icon, 
  onClick, 
  hasIndicator, 
  indicatorColor,
  iconColor 
}: { 
  icon: React.ReactNode; 
  onClick?: () => void; 
  hasIndicator?: boolean;
  indicatorColor?: string;
  iconColor?: string;
}) => (
  <motion.div 
    whileHover={{ scale: 1.1 }} 
    whileTap={{ scale: 0.9 }}
    className="w-9 h-9 rounded-full bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-center justify-center cursor-pointer relative"
    onClick={onClick}
  >
    {hasIndicator && (
      <div className={`absolute w-[6px] h-[6px] rounded-full ${indicatorColor} right-[2px] top-[2px]`}>
        <div className={`absolute inset-0 rounded-full ${indicatorColor} animate-ping`} />
      </div>
    )}
    <div className={iconColor}>{icon}</div>
  </motion.div>
);

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, address, balance, tokens } = useWallet();
  const [activeRoute, setActiveRoute] = useState<Route>('new-chat');
  const [isNetwork, setIsNetwork] = useState(false);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<{message: string, type: 'info' | 'user' | 'agent' | 'error'}[]>([]); // Track logs with type
  const [hasNewLogs, setHasNewLogs] = useState(false); // Track if there are unread logs
  
  // Log an event to the session logs
  const logEvent = (message: string, type: 'info' | 'user' | 'agent' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = type === 'user' ? `User: ${message}` : 
                            type === 'agent' ? `Agent-w: ${message}` : 
                            type === 'error' ? `Error: ${message}` : message;
    
    setSessionLogs(prev => [...prev, {
      message: `[${timestamp}] ${formattedMessage}`,
      type
    }]);
    
    // Indicate there are new logs
    setHasNewLogs(true);
  };
  
  // Add initialization log when session changes
  useEffect(() => {
    if (activeSession) {
      setSessionLogs([]); // Clear logs when session changes
      logEvent('Agent initialized and ready to assist with Move operations.');
    }
  }, [activeSession?.id]);

  useEffect(() => {
    // Reset session and route when mode changes
    setActiveSession(null);
    setActiveRoute(isNetwork ? 'configuration' : 'new-chat');
  }, [isNetwork]);

  useEffect(() => {
    // Try to connect with private key from environment variable if available
    const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
    if (privateKey && !isConnected) {
      // Removed manual connection logic
    }
  }, []);

  // Function to handle session selection
  const handleSessionSelect = (sessionIdOrSession: string | ChatSession | null) => {
    // If null is passed, create a new chat
    if (sessionIdOrSession === null) {
      setActiveSession(null);
      setActiveRoute('new-chat');
      return;
    }
    
    // If we received a ChatSession object directly, use it
    if (typeof sessionIdOrSession !== 'string') {
      setActiveSession(sessionIdOrSession);
      setActiveRoute('new-chat');
      return;
    }
    
    // Otherwise, fetch the session by ID
    const sessionId = sessionIdOrSession;
    
    // Format address to string if it's an AccountAddress
    const addressStr = address ? address.toString() : null;
    
    // Fetch the session details and associated messages
    const fetchSession = async () => {
      try {
        // First, fetch the session details
        const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/sessions?userAddress=${addressStr}`);
        const sessions = await sessionResponse.json();
        const selectedSession = sessions.find((s: any) => s.id === sessionId);
        
        if (selectedSession) {
          // Create a session object with the required properties
          const session: ChatSession = {
            id: selectedSession.id,
            title: selectedSession.title,
            messages: [], // Will be populated below
            createdAt: new Date(selectedSession.createdAt).getTime(),
            updatedAt: new Date(selectedSession.updatedAt).getTime()
          };
          
          // Then fetch the messages for this session
          const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat?userAddress=${addressStr}&sessionId=${sessionId}`);
          const messages = await messagesResponse.json();
          
          // Set the active session with its messages
          setActiveSession({
            ...session,
            messages: messages.map((msg: any) => ({
              id: msg.id,
              content: msg.message,
              sender: msg.response === msg.message ? 'assistant' : 'user',
              timestamp: new Date(msg.createdAt).getTime()
            }))
          });
          
          // Set the active route to chat
          setActiveRoute('new-chat');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    fetchSession();
  };

  // Function to handle new chat
  const handleNewChat = () => {
    setActiveSession(null);
    setActiveRoute('new-chat');
  };

  const renderActiveScreen = () => {
    switch (activeRoute) {
      case 'new-chat':
        return <NewChatScreen 
        currentSession={activeSession} 
        onSessionCreate={setActiveSession}
        isNetwork={isNetwork}
        logEvent={logEvent}
      />;
      case 'new-agent':
        return <NewAgentScreen />;
      case 'browse-agents':
        return <BrowseAgentsScreen />;
      case 'connections':
        return <ConnectionsScreen />;
      case 'models':
        return <ModelsScreen />;
        default:
          return <NewChatScreen 
            currentSession={activeSession} 
            onSessionCreate={setActiveSession}
            isNetwork={isNetwork}
            logEvent={logEvent}
          />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="relative flex w-full h-full z-10 p-4 sm:p-6 md:p-8">
        <div className="flex w-full h-full gap-4 sm:gap-6 md:gap-8">
          {/* Sidebar */}
          <motion.div 
            className="w-[240px] flex-shrink-0 flex flex-col"
            variants={sidebarVariants}
            initial="hidden"
            animate="show"
          >
            {/* Logo */}
            <div className="h-8" />
            <LogoSection />
        
            {/* Navigation */}
            <motion.div className="flex-1 px-2 mt-4 space-y-1" variants={itemVariants}>
          {/* Navigation Items */}
            {/* Show the correct navigation based on the mode */}
            {isNetwork ? (
              <InferenceModeNav
                setActiveRoute={setActiveRoute} 
                activeRoute={activeRoute}
                userAddress={address ? address.toString() : null}
                currentSession={activeSession}
                onSessionSelect={handleSessionSelect}
                setActiveSession={setActiveSession}
              />
            ) : (
              <InferenceModeNav
                setActiveRoute={setActiveRoute} 
                activeRoute={activeRoute}
                userAddress={address ? address.toString() : null}
                currentSession={activeSession}
                onSessionSelect={handleSessionSelect}
                setActiveSession={setActiveSession}
              />
            )}
            </motion.div>
          </motion.div>

          {/* Main Content area */}
          <div className="flex-1 flex">
            <motion.div 
              className="flex-1 flex flex-col min-w-0 bg-white/10 dark:bg-neutral-900/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-neutral-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.1)] m-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <div className="h-8" />
              <main className="flex-1 overflow-auto">
                {renderActiveScreen()}
              </main>
            </motion.div>

            {/* Side controls */}
            <motion.div 
              className="flex flex-col ml-2 sm:ml-3 md:ml-4 h-full py-1"
              variants={itemVariants}
            >
              {/* Top controls */}
              <div className="space-y-3 mt-8">
                <Sheet>
                  <SheetTrigger asChild>
                    <div>
                      <ControlButton 
                        icon={<RadioTower className="w-4 h-4" />}
                        hasIndicator
                        indicatorColor={"bg-blue-500"}
                        iconColor={"text-neutral-400"}
                      />
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[540px] border-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.1)]">
                    <SheetHeader className="px-6 pt-6">
                      <SheetTitle className="text-xl font-medium text-gray-800 dark:text-neutral-200">Server Status</SheetTitle>
                    </SheetHeader>
                    <div className="px-6">
                      <div className="h-[1px] bg-white/20 dark:bg-neutral-800/50 my-6" />
                      <div className="space-y-6">

                        {/* Network Stats */}
                        <div>
                          {/* Status Indicator */}
                          <div className="flex items-center justify-center my-16">
                            <div 
                              className={cn(
                                "rounded-full w-10 h-10",
                                "bg-neutral-400 animate-pulse"
                              )}
                            />
                          </div>

                          {/* Network Stats Content */}
                          <div className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-neutral-400">Server Status</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">{'Live'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-neutral-400">Server Latency</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">{'10ms'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-neutral-400">Logs</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">{'Operational'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-neutral-400">Total Requests</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">{'100'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <div>
                      <ControlButton icon={
                        <ChevronsLeftRightEllipsis className="w-4 h-4 text-gray-600 dark:text-neutral-400" />}
                        hasIndicator={hasNewLogs}
                        indicatorColor={"bg-red-500"}
                        iconColor={"text-neutral-400"}
                        onClick={() => setHasNewLogs(false)}
                      />
                    </div>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className="w-[400px] sm:w-[540px] border-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.1)]"
                  >
                    <SheetHeader className="px-6 pt-6">
                      <SheetTitle className="text-xl font-medium text-gray-800 dark:text-neutral-200">Logs</SheetTitle>
                    </SheetHeader>
                    <div className="px-6">
                      <div className="h-[1px] bg-white/20 dark:bg-neutral-800/50 my-6" />
                      <div className="space-y-4">
                        {/* Logs panel */}
                        <div className="h-[600px] overflow-y-auto rounded-lg p-4 text-sm font-mono">
                          {activeSession?.messages?.length || sessionLogs.length ? (
                            <>
                              <div className="text-white mb-4">[{new Date(activeSession?.createdAt || Date.now()).toLocaleTimeString()}] Agent initialized and ready to assist with Move operations.</div>
                              
                              {/* Show session logs */}
                              {sessionLogs.map((log, index) => {
                                // Set different colors based on log type
                                const colorClass = 
                                  log.type === 'user' ? 'text-blue-300' : 
                                  log.type === 'agent' ? 'text-green-300' : 
                                  log.type === 'error' ? 'text-red-400' : 'text-white';
                                
                                // Add border for errors
                                const errorClass = log.type === 'error' ? 'border border-red-800 p-2 rounded' : '';
                                
                                return (
                                  <div key={`log-${index}`} className={`${colorClass} ${errorClass} mb-2`}>
                                    {log.message}
                                  </div>
                                );
                              })}
                              
                              {/* Show message logs */}
                              {activeSession?.messages?.map((msg, idx) => {
                                const timestamp = new Date(msg.timestamp).toLocaleTimeString();
                                
                                // Check for error messages
                                if (msg.error) {
                                  return (
                                    <div key={`${msg.id}-error`} className="text-red-400 mb-2 border border-red-800 p-2 rounded">
                                      [{timestamp}] Error: {msg.error}
                                    </div>
                                  );
                                }
                                
                                // User message
                                if (msg.sender === 'user') {
                                  return (
                                    <div key={`${msg.id}-user`} className="text-blue-300 mb-2">
                                      [{timestamp}] User: {msg.content}
                                    </div>
                                  );
                                }
                                // System message before assistant response
                                const prevMsg = idx > 0 ? activeSession.messages[idx - 1] : null;
                                if (prevMsg && prevMsg.sender === 'user') {
                                  return (
                                    <React.Fragment key={`${msg.id}-full`}>
                                      <div className="text-white mb-2">
                                        [{timestamp}] Sending request to agent...
                                      </div>
                                      <div className="text-green-300 mb-4">
                                        [{timestamp}] Agent-w: {msg.content}
                                      </div>
                                    </React.Fragment>
                                  );
                                }
                                // Just assistant message without the sending step
                                return (
                                  <div key={`${msg.id}-assistant`} className="text-green-300 mb-4">
                                    [{timestamp}] Agent-w: {msg.content}
                                  </div>
                                );
                              })}
                            </>
                          ) : (
                            <div className="text-gray-400 italic">No logs available for this session</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex-1" />

              {/* Bottom controls */}
              <div className="space-y-3 mb-8">
                <Sheet>
                  <SheetTrigger asChild>
                    <div className="w-9 h-9 rounded-full bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                      <img src="https://api.dicebear.com/9.x/glass/svg?seed=7" alt="avatar" className="w-full h-full" />
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[540px] border-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.1)]">
                    <SheetHeader className="px-6 pt-6">
                      <SheetTitle className="text-xl font-medium text-gray-800 dark:text-neutral-200">Profile</SheetTitle>
                    </SheetHeader>
                    <div className="px-6">
                      <div className="h-[1px] bg-white/20 dark:bg-neutral-800/50 my-6" />
                      
                      {/* Profile Content */}
                      <div className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-white/40 dark:bg-neutral-900/40 border-2 border-white/20 dark:border-neutral-800/50 backdrop-blur-xl overflow-hidden">
                            <img src="https://api.dicebear.com/9.x/glass/svg?seed=7" alt="avatar" className="w-full h-full" />
                          </div>
                          <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-neutral-800/20 rounded-full backdrop-blur-sm">
                            {isConnected ? (
                              <>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-emerald-500">Connected</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm font-medium text-red-500">Private Key Required</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Wallet Info */}
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-2">
                            <span className="text-sm text-gray-600 dark:text-neutral-400">Connected Wallet</span>
                            <div className="group relative flex items-center space-x-2 p-4 bg-white/20 dark:bg-neutral-800/20 rounded-xl backdrop-blur-sm">
                              <span className="text-sm font-medium text-gray-800 dark:text-neutral-200 font-mono truncate">
                                {/* Show different lengths based on screen size */}
                                <span className="hidden sm:inline">{address ? `${truncateAddress(address.toString(), 4)}` : "Not Connected"}</span>
                                <span className="sm:hidden">{address ? `${truncateAddress(address.toString(), 10)}` : "Not Connected"}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Network Info */}
                          <div className="flex flex-col space-y-2">
                            <span className="text-sm text-gray-600 dark:text-neutral-400">Network</span>
                            <div className="flex items-center justify-between p-4 bg-white/20 dark:bg-neutral-800/20 rounded-xl backdrop-blur-sm">
                              <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">Aptos Mainnet</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-emerald-500">{isConnected ? "Connected" : "Not Connected"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Token List */}
                          <div className="flex flex-col space-y-2">
                            <span className="text-sm text-gray-600 dark:text-neutral-400">Token List</span>
                            <div className="space-y-2">
                              {tokens.length > 0 ? (
                                tokens.slice(0, 3).map((token, index) => (
                                  <div key={index} className="flex items-center justify-between p-4 bg-white/20 dark:bg-neutral-800/20 rounded-xl backdrop-blur-sm">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">{token.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-neutral-400">{token.balance}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center justify-between p-4 bg-white/20 dark:bg-neutral-800/20 rounded-xl backdrop-blur-sm">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">APT</span>
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-neutral-400">0</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Wallet Status Button */}
                        <Button
                          variant="ghost"
                          className="w-full rounded-xl bg-blue-500/80 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20"
                        >
                          {`Aptos Balance: ${balance} APT`}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  route,
  currentRoute,
}: { 
  icon: React.ReactNode; 
  label: string; 
  route: Route;
  currentRoute: Route;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-10 justify-start text-[13px] rounded-xl",
        route === currentRoute
          ? "bg-gray-100/70 dark:bg-white/10 text-gray-800 dark:text-gray-100"
          : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100/50 dark:hover:bg-neutral-800/50"
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Button>
  );
}