"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ScoreEntry {
  name: string;
  score: number | string;
  word: string;
  date: string;
  difficulty?: string;
}

interface PlayerScore {
  name: string;
  highestScore: number;
  totalScore: number;
  gamesPlayed: number;
  lastWord: string;
  lastDate: string;
  difficulty?: string;
}

export default function LeaderboardPage() {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  // Function to load and aggregate scores from localStorage
  const loadScores = () => {
    try {
      const savedScores: ScoreEntry[] = JSON.parse(localStorage.getItem("leaderboard") || "[]");

      // Filter valid entries (allow score to be number or numeric string)
      const validScores = savedScores.filter(
        entry =>
          entry &&
          typeof entry.name === "string" &&
          !isNaN(Number(entry.score)) &&
          typeof entry.word === "string" &&
          typeof entry.date === "string"
      );

      // Group scores by player name and compute aggregates
      const playerMap = new Map<string, PlayerScore>();
      validScores.forEach(entry => {
        const entryScore = Number(entry.score);
        if (!playerMap.has(entry.name)) {
          playerMap.set(entry.name, {
            name: entry.name,
            highestScore: entryScore,
            totalScore: entryScore,
            gamesPlayed: 1,
            lastWord: entry.word,
            lastDate: entry.date,
            difficulty: entry.difficulty,
          });
        } else {
          const playerData = playerMap.get(entry.name)!;
          playerData.highestScore = Math.max(playerData.highestScore, entryScore);
          playerData.totalScore += entryScore;
          playerData.gamesPlayed += 1;
          const currentDate = new Date(playerData.lastDate);
          const entryDate = new Date(entry.date);
          if (!isNaN(entryDate.getTime()) && entryDate > currentDate) {
            playerData.lastWord = entry.word;
            playerData.lastDate = entry.date;
            playerData.difficulty = entry.difficulty;
          }
        }
      });
      
      const sortedScores = Array.from(playerMap.values()).sort((a, b) => b.totalScore - a.totalScore);
      setPlayerScores(sortedScores);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setPlayerScores([]);
    }
  };

  useEffect(() => {
    loadScores();
    // Listen for "scoreUpdated" events to refresh the leaderboard immediately
    const handleScoreUpdated = () => loadScores();
    window.addEventListener("scoreUpdated", handleScoreUpdated);
    return () => window.removeEventListener("scoreUpdated", handleScoreUpdated);
  }, []);

  // Function to get difficulty color for styling
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-gradient-to-r from-[#FF9A9E]/20 to-[#FECFEF]/20 text-[#FF9A9E]";
      case "medium":
        return "bg-gradient-to-r from-[#A1C4FD]/20 to-[#C2E9FB]/20 text-[#A1C4FD]";
      case "hard":
        return "bg-gradient-to-r from-[#84FAB0]/20 to-[#8FD3F4]/20 text-[#84FAB0]";
      case "expert":
        return "bg-gradient-to-r from-[#D4FC79]/20 to-[#96E6A1]/20 text-[#D4FC79]";
      default:
        return "bg-gradient-to-r from-[#8B5CF6]/20 to-[#0EA5E9]/20 text-[#8B5CF6]";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#F8FAFC] to-[#F1F0FB]">
      <motion.div
        className="max-w-md w-full space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" className="p-2 text-[#1E40AF]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
          <motion.h1
            className="text-2xl font-bold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Leaderboard <Trophy className="ml-2 h-5 w-5 text-[#0EA5E9]" />
          </motion.h1>
          <div className="w-10"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border-2 border-[#E5DEFF] shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30">
              <CardTitle className="text-center text-[#1E40AF] flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                Top Wizards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {playerScores.length > 0 ? (
                <div className="space-y-3">
                  {playerScores.slice(0, 10).map((player, index) => (
                    <motion.div
                      key={player.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`flex flex-col p-4 rounded-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300"
                          : index === 2
                          ? "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
                          : "bg-white border border-[#E5DEFF]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0
                                ? "bg-yellow-100"
                                : index === 1
                                ? "bg-gray-100"
                                : index === 2
                                ? "bg-amber-100"
                                : "bg-[#E5DEFF]"
                            }`}
                            whileHover={{ rotate: 10 }}
                          >
                            {index < 3 ? (
                              <Medal
                                className={`h-4 w-4 ${
                                  index === 0
                                    ? "text-yellow-500"
                                    : index === 1
                                    ? "text-gray-500"
                                    : "text-amber-700"
                                }`}
                              />
                            ) : (
                              <span className="text-sm font-bold text-[#1E40AF]">{index + 1}</span>
                            )}
                          </motion.div>
                          <div>
                            <p className="font-medium text-[#1E40AF]">{player.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <p className="text-xs text-[#6B7280]">
                                {player.gamesPlayed} {player.gamesPlayed === 1 ? "game" : "games"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9]">
                            {player.highestScore}
                          </div>
                          <p className="text-xs text-[#6B7280]">Total: {player.totalScore}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <p className="text-[#6B7280]">
                          Last word: <span className="font-medium">{player.lastWord}</span>
                        </p>
                        {player.difficulty && (
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(player.difficulty)}`}>
                            {player.difficulty}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="text-center py-8 text-[#6B7280]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p>No scores yet. Start playing to be the first!</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  );
}
