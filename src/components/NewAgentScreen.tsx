"use client"

import { motion } from "framer-motion"
import { Sparkles, Clock, ChevronRight, Zap } from "lucide-react"

export default function NewAgentScreen() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center space-y-6 max-w-lg"
        >
          <div className="inline-flex mx-auto rounded-full p-3 border border-blue-500/20">
            <Zap className="w-10 h-10 text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-medium bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Agent Creation Coming Soon
          </h2>
          
          <p className="text-gray-400 text-lg">
            Design and configure new AI agents with custom capabilities, behaviors, and integrations.
          </p>
          
          <div className="pt-4 space-y-4">
            <div className="flex items-start p-3 border border-gray-800 rounded-lg text-left">
              <div className="bg-blue-400/10 rounded-full p-2 mr-4 mt-1">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                >
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-medium text-gray-200">Custom Capabilities</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Build agents with specific skills tailored to your needs
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-3 border border-gray-800 rounded-lg text-left">
              <div className="bg-indigo-400/10 rounded-full p-2 mr-4 mt-1">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                >
                  <Zap className="w-5 h-5 text-indigo-400" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-medium text-gray-200">Advanced Behaviors</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Define how your agents interact and respond to different scenarios
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center text-sm font-medium text-blue-400 border border-blue-400/30 rounded-full px-4 py-2"
            >
              Get Notified
              <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
            <p className="text-xs text-gray-500 mt-3">
              We'll let you know as soon as agent creation becomes available
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}