"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { motion } from "framer-motion"

interface MobileStatsBarProps {
  score: number
  consecutiveCorrect: number
  currentTier: {
    name: string
  }
  effectiveDifficulty: string
  freezeTimeUsed: boolean
  isTimeFrozen: boolean
  gameState: string
  handleFreezeTime: () => void
}

export default function MobileStatsBar({
  score,
  consecutiveCorrect,
  currentTier,
  effectiveDifficulty,
  freezeTimeUsed,
  isTimeFrozen,
  gameState,
  handleFreezeTime,
}: MobileStatsBarProps) {
  return (
    <motion.div
      className="md:hidden w-full mt-4  p-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
         <motion.div whileHover={{ scale: freezeTimeUsed ? 1 : 1.02 }} whileTap={{ scale: freezeTimeUsed ? 1 : 0.98 }}>
        <Button
          onClick={handleFreezeTime}
          disabled={freezeTimeUsed || gameState !== "playing"}
          className={`w-full flex items-center justify-center gap-2 text-sm h-9 ${
            !freezeTimeUsed && gameState === "playing"
              ? "bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] hover:from-[#0D8ECF] hover:to-[#2563EB]"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          <Clock className="h-4 w-4" />
          {isTimeFrozen ? "Frozen (10s)" : freezeTimeUsed ? "Used" : "Freeze Time"}
        </Button>
      </motion.div>
    </motion.div>
  )
}

