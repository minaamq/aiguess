"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface GameClueProps {
  clue: string;
  index: number;
}

export default function GameClue({ clue, index }: GameClueProps) {
  // Different background colors for each clue level
  const bgColors = [
    "bg-gradient-to-r from-[#FFD1D1] to-[#FFE2F0] border-[#FF9A9E]/20",
    "bg-gradient-to-r from-[#BDE0FE] to-[#CDF5F6] border-[#A1C4FD]/20",
    "bg-gradient-to-r from-[#C1FBA4] to-[#D7F8FF] border-[#84FAB0]/20",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: index * 0.1,
      }}
    >
      <Card className={`${bgColors[index]} border overflow-hidden`}>
        <CardContent className="p-3 flex items-start gap-2">
          <motion.div
            animate={{
              rotate: 15,
              scale: 1.2,
            }}
            initial={{ rotate: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: index * 0.5,
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <Lightbulb className="h-5 w-5 text-[#0EA5E9] mt-0.5 flex-shrink-0" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-[#1A73E8] rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
          <p className="text-sm text-[#1E40AF]">{clue}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
