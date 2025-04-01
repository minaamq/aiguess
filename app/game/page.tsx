"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, ArrowLeft, Trophy, Wand2, XCircle } from "lucide-react";
import GameClue from "@/components/game-clue";
import GameResult from "@/components/game-result";
import { motion, AnimatePresence } from "framer-motion";
import { generateWordAndClues } from "@/lib/game-actions";

export default function GamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [currentWord, setCurrentWord] = useState("");
  const [guess, setGuess] = useState("");
  const [clues, setClues] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [wrongGuess, setWrongGuess] = useState("");
  const [showWrongGuess, setShowWrongGuess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [allClues, setAllClues] = useState<string[]>([]);

  // Add a counter for round tracking to force new API calls
  const [roundCounter, setRoundCounter] = useState(0);

  // Initialize game
  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    const storedDifficulty = localStorage.getItem("gameDifficulty");

    if (!storedName) {
      // Redirect to home if no name is set
      router.push("/");
      return;
    }

    setPlayerName(storedName);
    setDifficulty(storedDifficulty || "easy");

    // Trigger initial round
    setRoundCounter(1);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (gameState === "playing") {
            setGameState("lost");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Trigger new round when roundCounter changes
  useEffect(() => {
    if (roundCounter > 0) {
      const fetchNewWord = async () => {
        setIsLoading(true);

        try {
          // Reset game state
          setGuess("");
          setClues([]);
          setTimeLeft(60);
          setAttempts(0);
          setGameState("playing");
          setShowConfetti(false);
          setWrongGuess("");
          setShowWrongGuess(false);

          // Add a timestamp to prevent caching
          const timestamp = new Date().getTime();
          const { word, clues: generatedClues } = await generateWordAndClues(
            difficulty 
          );

          // Store the word and all clues
          setCurrentWord(word);
          setAllClues(generatedClues);

          // Display only the first clue immediately
          setClues([generatedClues[0]]);


        } catch (error) {
          console.error("Error starting new round:", error);
          toast({
            title: "Error",
            description: "Failed to generate a new word. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchNewWord();
    }
  }, [roundCounter, difficulty]);

  // Get a new clue every 15 seconds if still playing
  useEffect(() => {
    if (gameState !== "playing") return;

    // First clue is already shown immediately; show additional clues every 15 seconds
    const clueIntervals = [0, 15, 30];
    const currentTime = 60 - timeLeft;
    const cluesToShow = clueIntervals.filter((interval) => currentTime >= interval).length;

    if (cluesToShow > clues.length && cluesToShow <= allClues.length) {
      displayNextClue();
    }
  }, [timeLeft, gameState]);

  // Focus input when game state changes
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, clues]);

  // Hide wrong guess message after 2 seconds
  useEffect(() => {
    if (showWrongGuess) {
      const timer = setTimeout(() => {
        setShowWrongGuess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWrongGuess]);

  // This increments the round counter to trigger a new round.
  function startNewRound() {
    setRoundCounter((prev) => prev + 1);
  }

  // Display the next clue from the pre-fetched clues
  function displayNextClue() {
    if (clues.length < allClues.length) {
      setClues((prev) => [...prev, allClues[prev.length]]);
    }
  }

  function handleSubmitGuess() {
    if (!guess.trim()) return;

    setAttempts((prev) => prev + 1);

    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      // Correct guess calculation
      const timeBonus = Math.floor(timeLeft / 5);
      const difficultyBonus = getDifficultyBonus();
      const cluesPenalty = clues.length * 15; // Penalty for each clue shown
      const attemptsPenalty = attempts * 10; // Penalty for each attempt

      const newPoints = 100 + timeBonus + difficultyBonus - cluesPenalty - attemptsPenalty;
      const pointsToAdd = Math.max(10, newPoints);

      setScore((prev) => prev + pointsToAdd);
      setGameState("won");
      setShowConfetti(true);

      toast({
        title: "Correct!",
        description: `You earned ${pointsToAdd} points!`,
        variant: "default",
      });

      // Save score to leaderboard
      saveScore(pointsToAdd);
    } else {
      // Incorrect guess handling
      setWrongGuess(guess);
      setShowWrongGuess(true);

      toast({
        title: "Not quite right",
        description: "Try again with the clues!",
        variant: "destructive",
      });
    }

    setGuess("");
  }

  function getDifficultyBonus() {
    switch (difficulty) {
      case "easy":
        return 0;
      case "medium":
        return 20;
      case "hard":
        return 40;
      case "expert":
        return 60;
      default:
        return 0;
    }
  }

  function saveScore(pointsToAdd: number) {
    const existingScores = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    const newScore = {
      name: playerName,
      score: pointsToAdd,
      word: currentWord,
      date: new Date().toISOString(),
      difficulty: difficulty,
    };

    localStorage.setItem("leaderboard", JSON.stringify([...existingScores, newScore]));
  }

  // Updated handler: clear old clue data immediately before starting a new round
  function handleNextRound() {
    setClues([]);
    setAllClues([]);
    setTimeLeft(60);
    setGameState("playing");
    startNewRound();
  }

  function getDifficultyColor() {
    switch (difficulty) {
      case "easy":
        return "from-[#FF9A9E] to-[#FECFEF]";
      case "medium":
        return "from-[#A1C4FD] to-[#C2E9FB]";
      case "hard":
        return "from-[#84FAB0] to-[#8FD3F4]";
      case "expert":
        return "from-[#D4FC79] to-[#96E6A1]";
      default:
        return "from-[#8B5CF6] to-[#0EA5E9]";
    }
  }

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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" onClick={() => router.push("/")} className="p-2 text-[#1E40AF]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Trophy className="h-5 w-5 text-[#0EA5E9]" />
            <span className="font-bold text-[#1E40AF]">{score} points</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            animate={{
              scale: timeLeft <= 10 ? [1, 1.1, 1] : 1,
              color: timeLeft <= 10 ? ["#1E40AF", "#EF4444", "#1E40AF"] : "#1E40AF",
            }}
            transition={{
              repeat: timeLeft <= 10 ? Number.POSITIVE_INFINITY : 0,
              duration: 0.5,
            }}
          >
            <Clock className="h-5 w-5 text-[#EF4444]" />
            <span className="font-bold">{timeLeft}s</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border-2 border-[#E5DEFF] shadow-lg overflow-hidden">
            <CardHeader className={`bg-gradient-to-r ${getDifficultyColor()}/30`}>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="bg-white/80 text-[#1E40AF] border-[#1E40AF]">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-white/80 text-[#1E40AF] border-[#1E40AF]">
                  {playerName}
                </Badge>
              </div>

              <CardTitle className="text-2xl text-center flex items-center justify-center text-[#1E40AF]">
                Word Wizard
                <motion.div
                  animate={{
                    rotate: 10,
                    scale: 1.1,
                  }}
                  initial={{ rotate: 0, scale: 1 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="ml-2"
                >
                  <Wand2 className="text-[#0EA5E9]" />
                </motion.div>
              </CardTitle>

              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / 60) * 100}%` }}
                transition={{ duration: 0.5 }}
              >
                <Progress
                  value={(timeLeft / 60) * 100}
                  className="h-2"
                  indicatorClassName={`${
                    timeLeft > 30 ? "bg-[#8B5CF6]" : timeLeft > 15 ? "bg-[#0EA5E9]" : "bg-[#EF4444]"
                  }`}
                />
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <AnimatePresence mode="wait">
                {gameState === "playing" && (
                  <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-center text-[#1E40AF]">Clues:</h3>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {clues.map((clue, index) => (
                            <GameClue key={`${roundCounter}-${index}`} clue={clue} index={index} />
                          ))}
                        </AnimatePresence>

                        {isLoading && (
                          <motion.div
                            className="flex justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Badge variant="outline" className="bg-[#E5DEFF] text-[#8B5CF6] border-[#8B5CF6]">
                              <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                                className="flex items-center"
                              >
                                <Wand2 className="mr-1 h-3 w-3" /> Wizard is thinking...
                              </motion.span>
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <motion.div
                      className="pt-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AnimatePresence>
                        {showWrongGuess && (
                          <motion.div
                            className="mb-3 p-2 rounded-md bg-red-100 border border-red-300 flex items-center justify-between"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex items-center">
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                              <p className="text-red-700 text-sm">
                                <span className="font-bold">{wrongGuess}</span> is not the word
                              </p>
                            </div>

                            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500"
                                onClick={() => setShowWrongGuess(false)}
                              >
                                ×
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmitGuess();
                        }}
                      >
                        <div className="flex space-x-2">
                          <Input
                            type="text"
                            placeholder="Type your guess..."
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            className="flex-1 border-[#8B5CF6]/30 focus-visible:ring-[#8B5CF6]"
                            ref={inputRef}
                            autoFocus
                          />

                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              type="submit"
                              className="bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:from-[#7C3AED] hover:to-[#0D8ECF]"
                            >
                              Guess
                            </Button>
                          </motion.div>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}

                {(gameState === "won" || gameState === "lost") && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <GameResult
                      gameState={gameState}
                      word={currentWord}
                      score={score}
                      attempts={attempts}
                      showConfetti={showConfetti}
                      playerName={playerName}
                      difficulty={difficulty}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className={`flex justify-center bg-gradient-to-r ${getDifficultyColor()}/30 p-4`}>
              {gameState !== "playing" && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleNextRound}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:from-[#7C3AED] hover:to-[#0D8ECF]"
                  >
                    Next Word
                  </Button>
                </motion.div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  );
}
