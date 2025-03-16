"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wifi, WifiOff, AlertCircle, ArrowUpCircle, Database, BarChart3, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data - replace with actual API calls
const mockData = {
  isConnected: true,
  quotaUsed: 65,
  quotaTotal: 100,
  connectionType: "mainnet", // "mainnet", "testnet", "devnet"
  balance: 245.75,
  promptsRemaining: 35,
  costPerPrompt: 1, // Aptos per prompt
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

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case "mainnet":
        return "bg-green-500"
      case "testnet":
        return "bg-yellow-500"
      case "devnet":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-2">Connection Status</h1>
        <p className="text-muted-foreground mb-8">Monitor your AI agent connection and resource usage</p>

        {isLoading ? <LoadingState /> : data ? <StatusCard data={data} /> : <ErrorState />}
      </motion.div>
    </div>
  )
}

function StatusCard({ data }: { data: typeof mockData;}) {
  const connectionTypeColor =
    {
      mainnet: "bg-blue-100 text-blue-600 border-blue-200",
      testnet: "bg-blue-50 text-blue-500 border-blue-100",
      devnet: "bg-sky-50 text-sky-500 border-sky-100",
    }[data.connectionType] || "bg-gray-100 text-gray-500 border-gray-200"

  const quotaPercentage = (data.quotaUsed / data.quotaTotal) * 100
  const quotaColor = quotaPercentage > 80 ? "text-red-500" : quotaPercentage > 50 ? "text-blue-500" : "text-blue-600"

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="border-2 border-blue-100 shadow-lg bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {data.isConnected ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Wifi className="h-5 w-5 text-green-500" />
                  </motion.div>
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                Connection Status
              </CardTitle>
              <CardDescription>
                {data.isConnected ? "Your AI agent is online and ready" : "Your AI agent is offline"}
              </CardDescription>
            </div>
            <Badge className={`text-xs px-3 py-1 border ${connectionTypeColor}`}>
              {data.connectionType.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Quota Usage</h3>
              </div>
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className={quotaColor}>
                    {data.quotaUsed}/{data.quotaTotal}
                  </span>
                  <span className={quotaColor}>{quotaPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={quotaPercentage} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{data.promptsRemaining}</span> prompts remaining
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Aptos Balance</h3>
              </div>
              <div className="text-2xl font-bold mb-1">{data.balance.toFixed(2)} APT</div>
              <div className="text-sm text-muted-foreground">
                ~{(data.balance / data.costPerPrompt).toFixed(0)} prompts at current rate
              </div>
            </motion.div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Usage Statistics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Cost per prompt</div>
                <div className="font-medium">{data.costPerPrompt} APT</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Prompts remaining</div>
                <div className="font-medium">{data.promptsRemaining}</div>
              </div>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500"
              size="lg"
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Top Up Balance
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function LoadingState() {
  return (
    <Card className="border-2 border-blue-100 shadow-lg bg-white">
      <CardHeader>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

function ErrorState() {
  return (
    <Card className="border-2 border-red-100 shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          Connection Error
        </CardTitle>
        <CardDescription>Unable to fetch connection status. Please try again later.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle className="h-16 w-16 text-red-500/50 mb-4" />
        </motion.div>
        <p className="text-center text-muted-foreground">
          There was an error connecting to the server. Check your network connection and try again.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">
          Retry Connection
        </Button>
      </CardFooter>
    </Card>
  )
}

