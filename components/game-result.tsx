"use client";

import { Button } from "@/components/ui/button";
import { Trophy, Frown, Star, Award } from 'lucide-react';
import Link from "next/link";
import { motion } from "framer-motion";
import Confetti from "@/components/confetti";

interface GameResultProps {
  gameState: "won" | "lost";
  word: string;
  score: number;
  attempts: number;
  showConfetti?: boolean;
  playerName: string;
  difficulty: string;
}

export default function GameResult({ 
  gameState, 
  word, 
  score, 
  attempts, 
  showConfetti = false,
  playerName,
  difficulty
}: GameResultProps) {
  
  const getDifficultyColor = () => {
    switch(difficulty) {
      case "easy": return "from-[#FF9A9E] to-[#FECFEF]";
      case "medium": return "from-[#A1C4FD] to-[#C2E9FB]";
      case "hard": return "from-[#84FAB0] to-[#8FD3F4]";
      case "expert": return "from-[#D4FC79] to-[#96E6A1]";
      default: return "from-[#8B5CF6] to-[#0EA5E9]";
    }
  };
  
  return (
    <motion.div 
      className="flex flex-col items-center space-y-4 py-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {showConfetti && <Confetti />}
      
      {gameState === "won" ? (
        <>
        <motion.div
  className={`h-24 w-24 rounded-full bg-gradient-to-br ${getDifficultyColor()} flex items-center justify-center`}
  initial={{ scale: 0 }}
  animate={{ scale: 1, rotate: [0, 10, 0] }}
  transition={{ 
    scale: { type: "spring", stiffness: 200, damping: 10, delay: 0.2 },
    rotate: { type: "tween", duration: 0.5, delay: 0.2 }
  }}
>
  <motion.div
    animate={{ 
      y: -5,
      scale: 1.2
    }}
    initial={{ y: 0, scale: 1 }}
    transition={{ 
      type: "tween",
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
  >
    <Trophy className="h-12 w-12 text-white drop-shadow-md" />
  </motion.div>
</motion.div>

          
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[...Array(Math.min(attempts, 5))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                <Star className="h-5 w-5 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.h3 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            You got it, {playerName}!
          </motion.h3>
          
          <motion.div
            className="text-center space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-[#1E40AF]">
              The word was <span className="font-bold">{word}</span>
            </p>
            <p className="text-[#1E40AF]">
              You guessed it in {attempts} {attempts === 1 ? 'try' : 'tries'}
            </p>
            <motion.p
              className="font-bold text-lg text-[#8B5CF6]"
              animate={{ 
                scale: [1, 1.1, 1],
                color: ["#8B5CF6", "#0EA5E9", "#8B5CF6"]
              }}
              transition={{ 
                duration: 2,
                repeat: 2
              }}
            >
              +{score} points!
            </motion.p>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div 
            className="h-24 w-24 rounded-full bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 10 
            }}
          >
            <motion.div
              animate={{ rotate: 10 }}
              initial={{ rotate: 0 }}
              transition={{ 
                duration: 0.5,
                delay: 0.5,
                repeat: 3,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
            >
              <Frown className="h-12 w-12 text-red-500" />
            </motion.div>
          </motion.div>
          
          <motion.h3 
            className="text-2xl font-bold text-red-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Time's up, {playerName}!
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[#1E40AF]"
          >
            The word was <span className="font-bold">{word}</span>
          </motion.p>
        </>
      )}
      
      <motion.div 
        className="flex space-x-3 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Link href="/leaderboard">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 flex gap-2 items-center"
            >
              <Award className="h-4 w-4" />
              Leaderboard
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
