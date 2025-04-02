"use client"

import { motion } from "framer-motion"
import { Snowflake } from "lucide-react"

interface FreezeAnimationProps {
  show: boolean
  onComplete?: () => void
}

export default function FreezeAnimation({ show, onComplete }: FreezeAnimationProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-[#0EA5E9]/10 backdrop-blur-sm z-40 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="text-6xl font-bold text-white text-center drop-shadow-lg"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1.2, 1],
          opacity: [0, 1, 0.8],
        }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.5 }}
      >
        <div className="bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] text-transparent bg-clip-text">TIME FROZEN</div>
        <motion.div
          className="text-2xl mt-4 text-[#0EA5E9]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        >
          10 seconds
        </motion.div>
      </motion.div>

      {/* Snowflake particles */}
      {show &&
        Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              opacity: 0,
            }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [0, 1, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          >
            <Snowflake className="text-[#0EA5E9]/70" size={10 + Math.random() * 20} />
          </motion.div>
        ))}

      {/* Ice crystal effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMjUsMCBMMzAsMTAgTDI1LDIwIEwyMCwxMCBaIE00MCwyNSBMNTAsMzAgTDQwLDM1IEwzMCwzMCBaIE0yNSw0MCBMMzAsNTAgTDI1LDYwIEwyMCw1MCBaIE0xMCwyNSBMMCwzMCBMMTAsMzUgTDIwLDMwIFoiIGZpbGw9IiMwRUE1RTkiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] bg-repeat opacity-30" />
      </motion.div>
    </motion.div>
  )
}

