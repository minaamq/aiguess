import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, ChevronUp, XCircle, Brain } from "lucide-react";

interface GameResultProps {
  gameState: "playing" | "won" | "lost";
  word: string;
  score: number;
  attempts: number;
  showConfetti: boolean;
  playerName: string;
  difficulty: string;
  streak: number;
  percentileRank: number | null;
  tier: string;
}

export default function GameResult({
  gameState,
  word,
  score,
  attempts,
  showConfetti,
  playerName,
  difficulty,
  streak,
  percentileRank,
  tier,
}: GameResultProps) {
  const [pointAnimation, setPointAnimation] = useState(false);

  // Launch confetti effect when player wins
  useEffect(() => {
    if (showConfetti && gameState === "won") {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const colors = ["#8B5CF6", "#0EA5E9", "#F472B6"];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Trigger point animation
      setPointAnimation(true);
      setTimeout(() => setPointAnimation(false), 1000);
    }
  }, [showConfetti, gameState]);

  return (
    <div className="text-center space-y-6 py-2">
      {gameState === "won" ? (
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
          >
            <Trophy className="h-10 w-10 text-yellow-500" />
          </motion.div>
          
          <motion.h3
            className="text-2xl font-bold text-green-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Great job, Wizard!
          </motion.h3>
          
          <motion.div
            className="text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>
              The word was:{" "}
              <span className="font-bold text-xl wizard-gradient-text">{word}</span>
            </p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-4 "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-wizard-muted/40 p-3 rounded-lg">
              <div className="text-sm text-slate-500">Attempts</div>
              <div className="font-bold text-lg text-wizard-primary">{attempts}</div>
            </div>
            
            <div className="bg-wizard-muted/40 p-3 rounded-lg relative overflow-hidden">
              <div className="text-sm text-slate-500">Score</div>
              <motion.div
                className="font-bold text-lg text-wizard-secondary"
                animate={pointAnimation ? 
                  { scale: [1, 1.3, 1], color: ["#0EA5E9", "#F472B6", "#0EA5E9"] } : 
                  {}
                }
                transition={{ duration: 0.5 }}
              >
                {score}
              </motion.div>
              
              {pointAnimation && (
                <motion.div
                  className="absolute -right-1 -top-1 bg-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                >
                  +100
                </motion.div>
              )}
            </div>
            
            <div className="bg-wizard-muted/40 p-3 rounded-lg">
              <div className="text-sm text-slate-500">Streak</div>
              <div className="font-bold text-lg text-wizard-primary flex items-center justify-center">
                {streak} <ChevronUp className="h-4 w-4 ml-1 text-green-500" />
              </div>
            </div>
            
            <div className="bg-wizard-muted/40 p-3 rounded-lg">
              <div className="text-sm text-slate-500">Tier</div>
              <div className="font-bold text-lg text-wizard-secondary">{tier}</div>
            </div>
          </motion.div>
          
          {percentileRank !== null && (
            <motion.div
              className=" bg-gradient-to-r from-wizard-primary/10 to-wizard-secondary/10 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm">
                You're better than <span className="font-bold text-wizard-primary">{percentileRank}%</span> of all players!
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
          >
            <XCircle className="h-10 w-10 text-red-500" />
          </motion.div>
          
          <motion.h3
            className="text-2xl font-bold text-red-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Time's Up!
          </motion.h3>
          
          <motion.div
            className="text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>
              The word was:{" "}
              <span className="font-bold text-xl wizard-gradient-text">{word}</span>
            </p>
            
          </motion.div>
          {percentileRank !== null && (
              <motion.div
                className="mt-1 m-20"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 ">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-orange-400 h-2.5 rounded-full" 
                      style={{ width: `${percentileRank}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    You're still better than <span className="font-bold text-red-500">{percentileRank}%</span> of players
                  </p>
                </div>
              </motion.div>
            )}
       
          <motion.div
            className=" bg-wizard-muted/30 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            
            <div className="flex items-center justify-center">
              <Brain className="h-5 w-5 mr-2 text-wizard-primary" />
              
              <p className="text-slate-700">Don't worry, try the next word!</p>
              
            </div>
            
          </motion.div>
        </div>
      )}
    </div>
  );
}
