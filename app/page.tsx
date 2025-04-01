"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isStartEnabled, setIsStartEnabled] = useState(false);

  useEffect(() => {
    // Check if both name and difficulty are selected
    setIsStartEnabled(playerName.trim().length > 0 && selectedDifficulty !== null);
  }, [playerName, selectedDifficulty]);

  const handleStartGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to start the game",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedDifficulty) {
      toast({
        title: "Select Difficulty",
        description: "Please select a difficulty level",
        variant: "destructive",
      });
      return;
    }
    
    // Save player name and difficulty to localStorage
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("gameDifficulty", selectedDifficulty);
  };

  const difficultyCards = [
    { 
      id: "easy", 
      name: "Easy", 
      ages: "Ages 4-7", 
      color: "from-[#FF9A9E] to-[#FECFEF]",
      hoverColor: "from-[#FECFEF] to-[#FF9A9E]",
      words: "Simple 3-5 letter words"
    },
    { 
      id: "medium", 
      name: "Medium", 
      ages: "Ages 8-10", 
      color: "from-[#A1C4FD] to-[#C2E9FB]",
      hoverColor: "from-[#C2E9FB] to-[#A1C4FD]",
      words: "Common 4-6 letter words"
    },
    { 
      id: "hard", 
      name: "Hard", 
      ages: "Ages 11-12", 
      color: "from-[#84FAB0] to-[#8FD3F4]",
      hoverColor: "from-[#8FD3F4] to-[#84FAB0]",
      words: "Challenging 5-8 letter words"
    },
    { 
      id: "expert", 
      name: "Expert", 
      ages: "Ages 13-14", 
      color: "from-[#D4FC79] to-[#96E6A1]",
      hoverColor: "from-[#96E6A1] to-[#D4FC79]",
      words: "Advanced vocabulary"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#F8FAFC] to-[#F1F0FB]">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] mb-2 flex items-center justify-center">
            Word Wizard 
            {/* <span className="text-xs ml-1 bg-[#1A73E8] text-white px-1 rounded-sm">Gemini</span> */}
            <motion.div
              animate={{ 
                rotate: 10,
                scale: 1.1
              }}
              initial={{ rotate: 0, scale: 1 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="ml-2"
            >
              <Wand2 className="text-[#0EA5E9]" />
            </motion.div>
          </h1>
          <motion.p 
            className="text-lg text-[#6B7280]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            The magical AI word guessing game!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-2 border-[#E5DEFF] shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30">
              <CardTitle className="text-2xl text-center text-[#1E40AF]">Welcome, Wizard!</CardTitle>
              <CardDescription className="text-center">
                Enter your name and choose a difficulty level to start
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-[#1E40AF]">Your Name</Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="border-[#8B5CF6]/30 focus-visible:ring-[#8B5CF6]"
                  />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#1E40AF]">Select Difficulty</Label>
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {difficultyCards.map((card) => (
                    <motion.div 
                      key={card.id} 
                      variants={item} 
                      whileHover={{ scale: 1.05, y: -5 }} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDifficulty(card.id)}
                    >
                      <Card 
                        className={`
                          transition-all duration-300 border-0 shadow-sm hover:shadow-md cursor-pointer
                          bg-gradient-to-br ${card.color} hover:bg-gradient-to-br ${card.hoverColor}
                          ${selectedDifficulty === card.id ? 'ring-2 ring-[#8B5CF6] ring-offset-2' : ''}
                        `}
                      >
                        <CardContent className="p-4 text-center">
                          <p className="font-bold text-[#1E40AF]">{card.name}</p>
                          <p className="text-xs text-[#6B7280]">{card.ages}</p>
                          <p className="text-xs text-[#6B7280] mt-1">{card.words}</p>
                          {selectedDifficulty === card.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                              className="absolute top-2 right-2"
                            >
                              <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30 p-4">
              <Link href={isStartEnabled ? "/game" : "#"} onClick={handleStartGame}>
                <motion.div 
                  whileHover={isStartEnabled ? { scale: 1.05 } : {}} 
                  whileTap={isStartEnabled ? { scale: 0.95 } : {}}
                >
                  <Button 
                    size="lg" 
                    className={`
                      flex items-center gap-2
                      ${isStartEnabled 
                        ? "bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:from-[#7C3AED] hover:to-[#0D8ECF] text-white" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                    `}
                    disabled={!isStartEnabled}
                  >
                    Start Game
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div 
          className="flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/leaderboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10">
                Leaderboard
              </Button>
            </motion.div>
          </Link>
          <Link href="/how-to-play">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10">
                How to Play
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
