"use client"
import React, { useEffect, useState } from "react";
import { Home, Users, History, Plus, Moon, Sun, RadioTower, Settings, Download, Network, MessageCircle, Info, Cog, Link2, Activity, Bot, FolderSearch, X, Play, Pause, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Route } from "@/types/routes";
import { NewChatScreen, NewAgentScreen, BrowseAgentsScreen, ConnectionsScreen, OperatorWelcomeScreen, ModelsScreen } from "./Screen";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/types/chat";

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
      <span className="font-medium text-2xl text-gray-800 dark:text-neutral-50 flex items-center justify-center w-full">AgentWars</span>
    </motion.div>
  );
};

// Component for inference mode navigation
const InferenceModeNav = ({ 
  setActiveRoute,
  activeRoute
}: { 
  setActiveRoute: (route: Route) => void;
  activeRoute: Route;
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
    </motion.div>
  );
};

// Component for operator mode navigation
const OperatorModeNav = ({ 
  setActiveRoute, 
  activeRoute,
}: { 
  setActiveRoute: (route: Route) => void; 
  activeRoute: Route;
}) => {
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
    </motion.div>
  );
};

// Mode switcher components
const ModeSwitcher = ({ isNetwork, setIsNetwork }: { isNetwork: boolean; setIsNetwork: (value: boolean) => void }) => (
  <div className="px-3 py-2">
    <div className="flex items-center justify-between space-x-2 rounded-xl bg-gray-100/50 dark:bg-neutral-900/50 p-1">
      <SwitcherIcon 
        icon={<MessageCircle size={16} />} 
        isActive={!isNetwork} 
        onClick={() => setIsNetwork(false)} 
      />
      <SwitcherIcon 
        icon={<RadioTower size={16} />} 
        isActive={isNetwork} 
        onClick={() => setIsNetwork(true)} 
      />
    </div>
  </div>
);

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

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const [activeRoute, setActiveRoute] = useState<Route>('new-chat');
  const [isNetwork, setIsNetwork] = useState(false);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Reset session and route when mode changes
    setActiveSession(null);
    setActiveRoute(isNetwork ? 'configuration' : 'new-chat');
  }, [isNetwork]);

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
      {/* Sidebar */}
      <motion.div 
        className="w-[280px] h-full border-r border-gray-200 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col"
        variants={sidebarVariants}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <LogoSection />
        
        {/* Navigation */}
        <div className="flex-1 px-3 py-3 space-y-6 overflow-y-auto">
          {/* Mode Switcher */}
          <ModeSwitcher isNetwork={isNetwork} setIsNetwork={setIsNetwork} />
          
          {/* Navigation Items */}
          {isNetwork ? (
            <OperatorModeNav 
              setActiveRoute={setActiveRoute} 
              activeRoute={activeRoute}
            />
          ) : (
            <InferenceModeNav 
              setActiveRoute={setActiveRoute}
              activeRoute={activeRoute}
            />
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 via-gray-100/25 to-gray-50/0 dark:from-neutral-900/50 dark:via-neutral-900/25 dark:to-neutral-950/0" />
        <div className="absolute inset-0">
          {renderActiveScreen()}
        </div>
      </main>
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