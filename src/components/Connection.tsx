"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wifi, WifiOff, AlertCircle, ArrowUpCircle, Database, Wallet, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data - replace with actual API calls
const mockData = {
  isConnected: true,
  quotaUsed: 65,
  quotaTotal: 100,
  connectionType: "mainnet", // "mainnet", "testnet", "devnet"
  balance: 5,
  promptsRemaining: 35,
  costPerPrompt: 0.3, // Aptos per prompt
}

export default function ConnectionDetails() {
  const [data, setData] = useState<null | typeof mockData>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true)
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setData(mockData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2 text-gray-100">Connection Status</h1>
          <p className="text-gray-400 mb-8">Monitor your AI agent connection and resource usage</p>

          {isLoading ? <LoadingState /> : data ? <StatusDisplay data={data} /> : <ErrorState />}
        </motion.div>
      </div>
    </div>
  )
}

function StatusDisplay({ data }: { data: typeof mockData }) {
  const connectionTypeColor =
    {
      mainnet: "text-blue-400 border-emerald-800",
      testnet: "text-amber-400 border-amber-800",
      devnet: "text-blue-400 border-blue-800",
    }[data.connectionType] || "text-gray-400 border-gray-700"

  const quotaPercentage = (data.quotaUsed / data.quotaTotal) * 100
  const quotaColor = quotaPercentage > 80 ? "text-red-400" : quotaPercentage > 50 ? "text-amber-400" : "text-emerald-400"

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="border-b border-gray-800 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {data.isConnected ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="h-12 w-12 rounded-full flex items-center justify-center"
              >
                <Wifi className="h-6 w-6 text-emerald-400" />
              </motion.div>
            ) : (
              <div className="h-12 w-12 rounded-full flex items-center justify-center">
                <WifiOff className="h-6 w-6 text-red-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-100">
                {data.isConnected ? 'Connected' : 'Disconnected'}
              </h2>
              <p className="text-gray-400 text-sm">Last updated: just now</p>
            </div>
          </div>
          <Badge className={`text-xs px-3 py-1 border ${connectionTypeColor}`}>
            {data.connectionType.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="rounded-xl p-5 border border-gray-800 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full flex items-center justify-center">
              <Database className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-200">Quota Usage</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className={quotaColor}>
                {data.quotaUsed}/{data.quotaTotal}
              </span>
              <span className={quotaColor}>{quotaPercentage.toFixed(0)}%</span>
            </div>
            <Progress 
              value={quotaPercentage} 
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-blue-400" 
            />
          </div>
          <div className="text-sm text-gray-400 mt-2">
            <span className="font-medium text-gray-300">{data.promptsRemaining}</span> prompts remaining
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="rounded-xl p-5 border border-gray-800 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full flex items-center justify-center">
              <Wallet className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-200">Credit Balance</h3>
          </div>
          <div className="text-3xl font-bold mb-2 text-gray-100">{data.balance.toFixed(2)} <span className="text-sm text-blue-400">USD</span></div>
          <div className="text-sm text-gray-400">
            ~{(data.balance / data.costPerPrompt).toFixed(0)} prompts at current rate
          </div>
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="rounded-xl p-5 border border-gray-800 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-900/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="font-medium text-gray-200">Security & Usage</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-3 rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Cost per prompt</div>
            <div className="font-medium text-gray-300">{data.costPerPrompt} USD</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Prompts remaining</div>
            <div className="font-medium text-gray-300">{data.promptsRemaining}</div>
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }} 
        className="pt-4"
      >
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-xl shadow-lg"
          size="lg"
        >
          <ArrowUpCircle className="mr-2 h-5 w-5" />
          Top Up Balance
        </Button>
      </motion.div>
    </motion.div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
          <div>
            <Skeleton className="h-6 w-32 mb-2 bg-gray-800" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-5 border border-gray-800 shadow-md">
          <Skeleton className="h-8 w-32 mb-4 bg-gray-800" />
          <Skeleton className="h-2 w-full mb-4 bg-gray-800" />
          <Skeleton className="h-4 w-24 bg-gray-800" />
        </div>
        <div className="rounded-xl p-5 border border-gray-800 shadow-md">
          <Skeleton className="h-8 w-32 mb-4 bg-gray-800" />
          <Skeleton className="h-8 w-40 mb-4 bg-gray-800" />
          <Skeleton className="h-4 w-36 bg-gray-800" />
        </div>
      </div>

      <div className="rounded-xl p-5 border border-gray-800 shadow-md">
        <Skeleton className="h-8 w-40 mb-4 bg-gray-800" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-16 w-full bg-gray-800" />
          <Skeleton className="h-16 w-full bg-gray-800" />
        </div>
      </div>

      <Skeleton className="h-14 w-full rounded-xl bg-gray-800" />
    </div>
  )
}

function ErrorState() {
  return (
    <div className="rounded-xl border border-red-900 p-6 shadow-xl">
      <div className="border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-xl font-bold">Connection Error</h2>
        </div>
        <p className="text-gray-400 mt-2">Unable to fetch connection status. Please try again later.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="h-20 w-20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-500/70" />
          </div>
        </motion.div>
        <p className="text-center text-gray-400 max-w-md">
          There was an error connecting to the server. Check your network connection and try again.
        </p>
      </div>

      <Button 
        className="w-full mt-6 text-gray-200 border border-gray-700 rounded-xl py-5"
        variant="outline"
      >
        Retry Connection
      </Button>
    </div>
  )
}