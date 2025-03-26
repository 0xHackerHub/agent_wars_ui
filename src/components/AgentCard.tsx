import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AgentCardProps {
  name: string;
  description: string;
  gradient: string;
  icon: ReactNode;
}

export default function AgentCard({ name, description, gradient, icon }: AgentCardProps): JSX.Element {
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
}