"use client"
import React, { useEffect, useState } from "react";
import { Home, Users, History, Plus, Moon, Sun, RadioTower, Settings, Download, Network, MessageCircle, Info, Cog, Link2, Activity, Bot, FolderSearch, X, Play, Pause, Box, ChevronsLeftRightEllipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { Route } from "@/types/routes";
import { NewChatScreen, NewAgentScreen, BrowseAgentsScreen, ConnectionsScreen, OperatorWelcomeScreen, ModelsScreen } from "./Screen";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/types/chat";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@aptos-labs/ts-sdk";
import { ChatHistory } from "@/components/ChatHistory";

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
  onSessionCreate
}: { 
  setActiveRoute: (route: Route) => void;
  activeRoute: Route;
  userAddress: string | null;
  currentSession: ChatSession | null;
  onSessionCreate: (session: ChatSession) => void;
}) => {
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
        onClick={() => setActiveRoute('new-chat')}
      >
        <Plus className="mr-3 h-4 w-4" />
        New chat
      </Button>

      {/* Chat History */}
      {userAddress && (
        <ChatHistory
          userAddress={userAddress}
          activeChat={currentSession?.id || null}
          onChatSelect={(chatId) => {
            // Load the selected chat
            setActiveRoute('new-chat');
            onSessionCreate({ id: chatId, messages: [], title: '', createdAt: new Date().getTime(), updatedAt: new Date().getTime() });
          }}
        />
      )}

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
  const handleSessionSelect = (session: ChatSession) => {
    setActiveSession(session);
    setActiveRoute('new-chat');
  };

  // Function to handle new chat
  const handleNewChat = () => {
    setActiveSession(null);
    setActiveRoute('new-chat');
  };

  const renderActiveScreen = () => {
    if (isNetwork && activeRoute === 'new-chat') {
      return <OperatorWelcomeScreen onStart={() => {
        setIsRunning(true);
        setActiveRoute('status');
      }} />;
    }
    switch (activeRoute) {
      case 'new-chat':
        return <NewChatScreen 
        currentSession={activeSession} 
        onSessionCreate={handleSessionSelect}
        isNetwork={isNetwork}
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
            onSessionCreate={handleSessionSelect}
            isNetwork={isNetwork}
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
            <InferenceModeNav 
              setActiveRoute={setActiveRoute}
              activeRoute={activeRoute}
              userAddress={address?.toString() ?? null}
              currentSession={activeSession}
              onSessionCreate={handleSessionSelect}
            />
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
                        hasIndicator
                        indicatorColor={"bg-blue-500"}
                        iconColor={"text-neutral-400"}
                      />
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[540px] border-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.1)]">
                    <SheetHeader className="px-6 pt-6">
                      <SheetTitle className="text-xl font-medium text-gray-800 dark:text-neutral-200">Logs</SheetTitle>
                    </SheetHeader>
                    <div className="px-6">
                      <div className="h-[1px] bg-white/20 dark:bg-neutral-800/50 my-6" />
                      <div className="space-y-6">
                        {/* Settings content will go here */}
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