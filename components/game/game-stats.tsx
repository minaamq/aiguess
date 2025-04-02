"use client"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Star } from "lucide-react";

interface GameStatsProps {
  score: number;
  consecutiveCorrect: number;
  currentTier: {
    name: string;
    color: string;
  };
  effectiveDifficulty: string;
  freezeTimeUsed: boolean;
  isTimeFrozen: boolean;
  gameState: string;
  handleFreezeTime: () => void;
}

export default function GameStats({
  score,
  consecutiveCorrect,
  currentTier,
  effectiveDifficulty,
  freezeTimeUsed,
  isTimeFrozen,
  gameState,
  handleFreezeTime,
}: GameStatsProps) {
  // Client-side state for star positions
  const [starPositions, setStarPositions] = useState<{top: string, left: string}[]>([]);
  
  // Generate star positions on the client side only
  useEffect(() => {
    const positions = Array(5).fill(0).map((_, i) => ({
      top: `${Math.floor(Math.random() * 60)}%`,
      left: `${20 * i}%`
    }));
    setStarPositions(positions);
  }, []);

  // Star size classes - fixed instead of dynamically calculated
  const starSizes = ["h-4 w-4", "h-4 w-4", "h-5 w-5", "h-5 w-5", "h-6 w-6"];

  return (
    <motion.div
      className="hidden md:flex flex-col w-72 mr-6 space-y-4"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="wizard-card">
        <CardHeader className="bg-gradient-to-r from-wizard-primary/10 to-wizard-muted/30 pb-2">
          <CardTitle className="text-lg wizard-gradient-text flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-wizard-secondary" />
            Game Stats
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Score:</span>
            <motion.span 
              className="font-bold text-wizard-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {score}
            </motion.span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Streak:</span>
            <span className="font-bold text-wizard-secondary">{consecutiveCorrect}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Tier:</span>
            <span className={`font-bold bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent`}>
              {currentTier.name}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Difficulty:</span>
            <span className="font-bold text-wizard-primary">{effectiveDifficulty}</span>
          </div>

          {/* Freeze time button */}
          <motion.div
            className="pt-2"
            whileHover={{ scale: freezeTimeUsed ? 1 : 1.05 }}
            whileTap={{ scale: freezeTimeUsed ? 1 : 0.95 }}
          >
            <Button
              onClick={handleFreezeTime}
              disabled={freezeTimeUsed || gameState !== "playing"}
              className={`w-full flex items-center justify-center gap-2 ${
                !freezeTimeUsed && gameState === "playing"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              <Clock className="h-4 w-4" />
              {isTimeFrozen ? "Frozen (10s)" : freezeTimeUsed ? "Used" : "Freeze Time"}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Rank card with stars animation */}
      <motion.div
        className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 shadow-sm"
        animate={{
          boxShadow: [
            "0 0 0 rgba(139, 92, 246, 0.3)",
            "0 0 10px rgba(139, 92, 246, 0.6)",
            "0 0 0 rgba(139, 92, 246, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="p-4">
          <h3 className={`text-lg font-bold bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent text-center mb-2`}>
            {currentTier.name} Tier
          </h3>
          
          <div className="bg-white/80 rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm text-slate-600">Your Score</span>
            <span className="font-bold text-wizard-primary">{score}</span>
          </div>
          
          {/* Stars animation - client-side only */}
          <div className="relative h-24 mt-3">
            {starPositions.length > 0 && [...Array(5)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute"
                style={{
                  left: starPositions[i].left,
                  top: starPositions[i].top,
                }}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2 + i * 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.3,
                }}
              >
                <Star 
                  className={`${starSizes[i]} ${i < consecutiveCorrect % 6 ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}