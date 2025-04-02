"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Link from "next/link";

interface LeaderboardPreviewProps {
  leaderboard: { name: string; score: number }[];
}

export default function LeaderboardPreview({ leaderboard }: LeaderboardPreviewProps) {
  // Client-side state for trophy animations
  const [trophies, setTrophies] = useState<{ left: string; top: string; delay: number; duration: number; xOffset: number }[]>([]);
  
  // Generate trophy positions on the client side only
  useEffect(() => {
    const trophyPositions = [...Array(5)].map(() => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      xOffset: Math.random() * 10 - 5
    }));
    setTrophies(trophyPositions);
  }, []);

  return (
    <motion.div
      className="hidden md:flex flex-col w-72 ml-6 space-y-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="wizard-card">
        <CardHeader className="bg-gradient-to-r from-wizard-secondary/10 to-wizard-primary/10 pb-2">
          <CardTitle className="text-lg wizard-gradient-text flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-wizard-secondary" />
            Top Wizards
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          {leaderboard.slice(0, 5).map((player, index) => (
            <motion.div
              key={player.name}
              className={`flex justify-between items-center p-2 rounded-lg ${
                index === 0
                  ? "bg-yellow-100 border border-yellow-200"
                  : index === 1
                    ? "bg-gray-100 border border-gray-200"
                    : index === 2
                      ? "bg-amber-100 border border-amber-200"
                      : "bg-white/50"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-400 to-amber-600"
                    : index === 1
                      ? "bg-gradient-to-br from-gray-400 to-gray-600"
                      : index === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-800"
                        : "bg-gradient-to-br from-wizard-primary to-wizard-secondary"
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm text-slate-700 truncate max-w-[100px]">{player.name}</span>
              </div>
              <span className="font-bold wizard-gradient-text">{player.score}</span>
            </motion.div>
          ))}
          
          {leaderboard.length === 0 && (
            <div className="text-center py-6 text-slate-500">
              <p className="font-medium">No scores yet!</p>
              <p className="text-sm mt-1">Be the first wizard to score</p>
            </div>
          )}
          
          <Link href="/leaderboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                className="w-full mt-2 border-wizard-primary text-wizard-primary hover:bg-wizard-primary/10"
              >
                View Full Leaderboard
              </Button>
            </motion.div>
          </Link>
        </CardContent>
      </Card>

      {/* Container for floating trophies */}
      <div className="relative h-32  p-4">

        
        {/* Floating trophies - client-side only */}
        {trophies.map((trophy, i) => (
          <motion.div
            key={`trophy-${i}`}
            className="absolute"
            style={{
              left: trophy.left,
              top: trophy.top,
            }}
            animate={{
              y: [0, -10, 0],
              x: [0, trophy.xOffset, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: trophy.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: trophy.delay,
            }}
          >
            <Trophy 
              className="h-4 w-4 text-yellow-300/40" 
              style={{ filter: "drop-shadow(0 0 2px rgba(250, 204, 21, 0.5))" }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}