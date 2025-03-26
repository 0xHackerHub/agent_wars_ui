import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AgentCard from "./AgentCard";

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

export default function BrowseAgentsScreen(){
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