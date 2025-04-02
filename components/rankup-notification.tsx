"use client"

import { motion } from "framer-motion"
import { Crown } from 'lucide-react'

interface RankUpNotificationProps {
  player: {
    name: string
    score: number
  }
  onClose?: () => void
}

export default function RankUpNotification({ player, onClose }: RankUpNotificationProps) {
  return (
    <motion.div
      className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: 5, // Increased from 2 to 5 for longer display
            repeatType: "reverse",
          }}
        >
          <Crown className="h-8 w-8 text-yellow-100" />
        </motion.div>
        <div>
          <h3 className="font-bold text-lg">New Achievement!</h3>
          <p className="text-yellow-100">
            You just surpassed <span className="font-bold">{player.name}</span>'s score of {player.score}!
          </p>
        </div>
      </div>
    </motion.div>
  )
}
