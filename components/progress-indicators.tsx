"use client";

import { Users } from 'lucide-react';
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  percentile: number;
  tier: string;
}

export default function ProgressIndicator({ percentile, tier }: ProgressIndicatorProps) {
  // Get color based on percentile
  const getColor = () => {
    if (percentile >= 90) return "bg-gradient-to-r from-emerald-500 to-emerald-300";
    if (percentile >= 75) return "bg-gradient-to-r from-blue-500 to-blue-300";
    if (percentile >= 50) return "bg-gradient-to-r from-yellow-500 to-yellow-300";
    if (percentile >= 25) return "bg-gradient-to-r from-orange-500 to-orange-300";
    return "bg-gradient-to-r from-red-500 to-red-300";
  };

  return (
    <motion.div
      className="w-full rounded-lg bg-white/50 p-3 border border-[#E5DEFF]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 text-xs text-[#1E40AF]">
          <Users className="h-3 w-3" />
          <span>Player Ranking</span>
        </div>
        <div className="text-xs font-medium text-[#8B5CF6]">
          {tier} Tier
        </div>
      </div>

      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold inline-block text-[#1E40AF]">
            {percentile}%
          </div>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentile}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Progress value={percentile} className="h-2" indicatorClassName={getColor()} />
        </motion.div>
        <div className="text-xs text-[#6B7280] mt-1">
          You're beating {percentile}% of all players!
        </div>
      </div>
    </motion.div>
  );
}
