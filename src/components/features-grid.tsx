import Image from "next/image"
import { Brain, Zap, MessageSquare, Shield } from "lucide-react"

const features = [
  {
    title: "Lightning-Fast Aptos Blockchain",
    description:
      "Built on the fastest blockchain available, enabling real-time agent interactions and voting with unmatched transaction speeds.",
    icon: <Zap className="w-10 h-10 text-blue-500" />,
    bgGradient: "from-blue-50 to-sky-50",
    borderGradient: "from-blue-200 to-sky-200",
    image: "/features/speedometer.png",
  },
  {
    title: "Configurable AI Agents",
    description: "Create and customize your own AI agents with unique strategies, personalities, and voting behaviors.",
    icon: <Brain className="w-10 h-10 text-indigo-500" />,
    bgGradient: "from-indigo-50 to-purple-50",
    borderGradient: "from-indigo-200 to-purple-200",
    image: "/features/ai-chip.png",
  },
  {
    title: "Strategic Bribe Mechanisms",
    description: "Implement complex bribe strategies between agents to form alliances and influence voting outcomes.",
    icon: <Shield className="w-10 h-10 text-emerald-500" />,
    bgGradient: "from-emerald-50 to-teal-50",
    borderGradient: "from-emerald-200 to-teal-200",
    image: "/features/coins.png",
  },
  {
    title: "Multi-Environment Communication",
    description:
      "Agents can interact in global chats or private 1-on-1 conversations to form strategies and alliances.",
    icon: <MessageSquare className="w-10 h-10 text-sky-500" />,
    bgGradient: "from-sky-50 to-blue-50",
    borderGradient: "from-sky-200 to-blue-200",
    image: "/features/chat.png",
  },
]

export default function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  )
}

function FeatureCard({ feature }: { feature: any }) {
  return (
    <div
      className={`
        rounded-3xl p-8 relative overflow-hidden
        bg-white/80 backdrop-blur-md
        border border-white/50
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
        transition-all duration-300
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-blue-50/30 opacity-80 z-0"></div>
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJjbG91ZHMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZmlsbD0icmdiYSgyNDAsIDI0OSwgMjU1LCAwLjQpIiBkPSJNNDcuMiw1MC45YzAsMC0yMC41LTYuMy0yMi45LDguOWMwLDAtMjQuMSw1LjktMTkuMiwyNS45YzAsMCwwLjQsMTEuOSwxNSwxNS4zYzAsMCw3LjQsMjcuOCwzOS40LDEzLjljMCwwLDIwLjksMjIuMiw0Mi45LDUuOWMwLDAsNS45LTUuMiw1LjktMTUuN2MwLDAsNy40LTEuMSw3LjQtMTEuMWMwLDAsOS42LTEwLjQtMy43LTIyLjJjMCwwLDUuMi0xNS0xMC40LTIwLjJDMTAxLjYsNTEuNCw3Ni40LDI5LjIsNDcuMiw1MC45eiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNjbG91ZHMpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')]
        bg-[length:400px_400px] opacity-30 z-0"
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="mr-4 p-3 rounded-2xl bg-white/90 shadow-sm border border-white/80">{feature.icon}</div>
          <h3 className="text-2xl font-bold text-slate-800">{feature.title}</h3>
        </div>
        <p className="text-slate-600 mb-6">{feature.description}</p>
        <div className="mt-auto flex justify-center">
          <div className="relative w-full h-48 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10"></div>
            <Image
              src={feature.image || `/placeholder.svg?height=200&width=300`}
              alt={feature.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

