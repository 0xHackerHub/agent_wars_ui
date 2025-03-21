import React from 'react';
import { Shuffle, Grid, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { TypeAnimation } from 'react-type-animation';

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

export default function HomePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Main scrollable content */}
      <motion.div 
        className="flex-shrink-0 relative pb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="max-w-[800px] mx-auto px-8">
          <motion.div 
            className="bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800/50 backdrop-blur-xl rounded-2xl flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] pointer-events-auto"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="flex-1 relative">
              <Input
                type="text"
                className="flex-1 bg-transparent border-0 rounded-full h-12 px-6 text-sm text-gray-800 dark:text-neutral-200 placeholder-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-500 dark:text-neutral-500">
                <TypeAnimation
                  sequence={[
                    'Ask me anything...',
                    2000,
                    'Ask me about cars...',
                    2000,
                    'Ask me about people...',
                    2000,
                    'Ask me to write code...',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </div>
            </div>
            <div className="pr-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="sm"
                  className="rounded-full w-8 h-8 bg-white dark:bg-neutral-900 hover:bg-neutral-100/50 dark:hover:bg-neutral-800"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700 dark:text-neutral-400">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}