"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Clock, ArrowLeft, Trophy, XCircle, ChevronUp, Brain } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import GameClue from "@/components/game-clue"
import GameResult from "@/components/game-result"
import RankUpNotification from "@/components/rankup-notification"
import TierUpAnimation from "@/components/tierup"
import GameStats from "@/components/game/game-stats"
import GameBackground from "@/components/game/game-background"
import LeaderboardPreview from "@/components/game/leaderboard"
import MobileStatsBar from "@/components/game/mobile-stats"
import { generateWordAndClues } from "@/lib/game-actions"
import { getCookie } from "@/lib/cookies"

// Define tier thresholds and names
const TIERS = [
  { name: "Bronze", threshold: 0, color: "from-amber-700 to-amber-500" },
  { name: "Silver", threshold: 200, color: "from-gray-400 to-gray-300" },
  { name: "Gold", threshold: 500, color: "from-yellow-500 to-yellow-300" },
  { name: "Platinum", threshold: 1000, color: "from-cyan-500 to-cyan-300" },
  { name: "Diamond", threshold: 2000, color: "from-blue-500 to-blue-300" },
  { name: "Master", threshold: 3500, color: "from-purple-600 to-purple-400" },
  { name: "Grandmaster", threshold: 5000, color: "from-red-600 to-red-400" },
  { name: "Legend", threshold: 7500, color: "from-emerald-600 to-emerald-400" },
]

export default function GamePage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [currentWord, setCurrentWord] = useState("")
  const [guess, setGuess] = useState("")
  const [clues, setClues] = useState<string[]>([]) // Clues currently shown
  const [allClues, setAllClues] = useState<string[]>([]) // All clues for the word
  const [riddle, setRiddle] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [attempts, setAttempts] = useState(0) // Attempts in the current round
  const [wrongAttempts, setWrongAttempts] = useState(0) // Incorrect attempts in the current round
  const [isLoading, setIsLoading] = useState(true) // Start loading initially
  const [isGeneratingNewWord, setIsGeneratingNewWord] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [playeruserid, setPlayeruserid] = useState("")
  const [difficulty, setDifficulty] = useState("easy") // Base difficulty (might be overridden)
  const [wrongGuess, setWrongGuess] = useState("") // Store the last wrong guess
  const [showWrongGuess, setShowWrongGuess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [showRankUp, setShowRankUp] = useState(false)
  const [showTierUp, setShowTierUp] = useState(false)
  const [beatenPlayer, setBeatenPlayer] = useState<{ name: string; score: number } | null>(null)
  const [percentileRank, setPercentileRank] = useState<number | null>(null)
  const [currentTier, setCurrentTier] = useState(TIERS[0])
  const [prevTier, setPrevTier] = useState(TIERS[0])
  const [roundCounter, setRoundCounter] = useState(0) // Start at 0, set to 1 on init
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([])
  const [freezeTimeUsed, setFreezeTimeUsed] = useState(false) // Freeze used in the current round
  const [isTimeFrozen, setIsTimeFrozen] = useState(false)
  const [showFreezeAnimation, setShowFreezeAnimation] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // *** STATE TO TRACK USED WORDS IN THIS SESSION ***
  const [sessionUsedWords, setSessionUsedWords] = useState<string[]>([]);

  // Initialize game state on mount
  useEffect(() => {
    async function initializeGame() {
      console.log("Initializing game...");
      setIsLoading(true);
      try {
        const name = getCookie("playerName");
        const userr = getCookie("userId");

        if (!name) {
          router.push("/"); // Redirect if no player name
          return;
        }

        setPlayerName(name);
        setPlayeruserid(userr ?? "");
        console.log("Player Name:", name, "User ID:", userr);

        // Reset session-specific states
        setScore(0);
        setConsecutiveCorrect(0);
        setSessionUsedWords([]); // Clear used words for the new session
        setCurrentTier(TIERS[0]); // Reset tier based on score 0
        setPrevTier(TIERS[0]);
        // Optionally fetch persistent stats like base difficulty, but start game state fresh
        // const response = await fetch(`/api/player-stats?userId=${encodeURIComponent(userr ?? "")}`); // Use userId
        // if (response.ok) {
        //   const stats = await response.json();
        //   if (stats.difficulty) setDifficulty(stats.difficulty); // Set base difficulty
           // Avoid setting score/consecutiveCorrect from old stats here
        // }

        setRoundCounter(1); // Signal start of the first round
        setIsInitialized(true);
        // Fetching word will happen in the effect watching roundCounter & isInitialized
      } catch (error) {
        console.error("Error initializing game:", error);
        toast({
          title: "Error",
          description: "Failed to initialize game. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
      // Loading state will be turned off in fetchNewWord's finally block
    }

    initializeGame();
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Run only once on mount

  // Timer effect
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isLoading && isInitialized && gameState === "playing") {
      const timer = setInterval(() => {
        if (isTimeFrozen) return;
  
        // Calculate elapsed time
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newTimeLeft = Math.max(60 - elapsed, 0);
        
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft === 0) {
          clearInterval(timer);
          setGameState("lost");
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [gameState, isTimeFrozen, isLoading, isInitialized]);
  

  // Fetch new word when round counter changes and game is initialized
  useEffect(() => {
    if (isInitialized && roundCounter > 0 && !isGeneratingNewWord) {
      console.log(`Triggering fetch for round ${roundCounter}`);
      fetchNewWord();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCounter, isInitialized]); // Dependencies trigger fetch

  // Load leaderboard data on initialization
  useEffect(() => {
    if (isInitialized) {
      loadLeaderboard();
    }
  }, [isInitialized]);

  // Update current tier based on score changes
  useEffect(() => {
    if(isInitialized) { // Only update tier after initialization
       updateTier();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, isInitialized]);

  // Reveal clues based on time elapsed
  useEffect(() => {
    if (gameState !== "playing" || allClues.length === 0) return;

    const clueIntervals = [10, 20, 30, 40, 50]; // Time in seconds *elapsed* (60 - timeLeft)
    const currentTimeElapsed = 60 - timeLeft;

    // Find how many clues should be visible
    const targetClueCount = clueIntervals.filter((interval) => currentTimeElapsed >= interval).length;

    // If more clues should be visible than currently are, update
    if (targetClueCount > clues.length && targetClueCount <= allClues.length) {
       setClues(allClues.slice(0, targetClueCount));
    }

  }, [timeLeft, gameState, clues.length, allClues]);

  // Focus input when it's time to play
  useEffect(() => {
    if (gameState === "playing" && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, isLoading, clues]); // Refocus when clues update too

  // Hide wrong guess message after a delay
  useEffect(() => {
    if (showWrongGuess) {
      const timer = setTimeout(() => {
        setShowWrongGuess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWrongGuess]);

  // --- Core Game Functions ---

  const fetchNewWord = async () => {
    console.log("Fetching new word. Used words passed:", sessionUsedWords);
    setIsLoading(true);
    setIsGeneratingNewWord(true); // Prevent concurrent requests

    try {
      // Reset round-specific state
      setGuess("");
      setClues([]);
      setAllClues([]);
      setRiddle("");
      setTimeLeft(60);
      setAttempts(0);
      setWrongAttempts(0);
      setGameState("playing"); // Ensure playing state
      setShowConfetti(false);
      setWrongGuess("");
      setShowWrongGuess(false);
      setFreezeTimeUsed(false); // Reset freeze availability for the round
      setIsTimeFrozen(false); // Ensure time is not frozen at start

      // Determine dynamic difficulty
      let dynamicDifficulty = difficulty; // Start with base difficulty
      if (consecutiveCorrect >= 10) dynamicDifficulty = "expert";
      else if (consecutiveCorrect >= 6) dynamicDifficulty = "hard";
      else if (consecutiveCorrect >= 3) dynamicDifficulty = "medium";

      // *** CALL SERVER ACTION WITH CURRENT SESSION'S USED WORDS ***
      const { word, clues: generatedClues, riddle: generatedRiddle } = await generateWordAndClues(
        dynamicDifficulty,
        sessionUsedWords // Pass the list
      );

      setCurrentWord(word); // word is already lowercase from server
      setAllClues(generatedClues);
      setRiddle(generatedRiddle);
      setClues([]); // Start with no clues displayed initially

    } catch (error) {
      console.error("Error fetching new word:", error);
      toast({
        title: "Error",
        description: "Could not get a new word. Trying again.",
        variant: "destructive",
      });
      // Optional: Implement retry logic or fallback
      setGameState("lost"); // Or some error state
    } finally {
      setIsLoading(false); // Done loading the word
      setIsGeneratingNewWord(false); // Allow new requests
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/scores"); // Fetch all scores
      if (response.ok) {
        const data = await response.json();
        // Process data to get unique top scores per player name
        const playerMap = new Map<string, number>();
        data.forEach((entry: { name: string; score: string | number }) => {
          const scoreNum = Number(entry.score);
          // Store the highest score found for each name
          if (!playerMap.has(entry.name) || scoreNum > playerMap.get(entry.name)!) {
            playerMap.set(entry.name, scoreNum);
          }
        });
        // Convert map to sorted array
        const sortedLeaderboard = Array.from(playerMap.entries())
          .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort descending
          .map(([name, score]) => ({ name, score }));
        setLeaderboard(sortedLeaderboard);
      } else {
        console.error("Failed to load leaderboard:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  };

  const updateTier = () => {
    const newTier = TIERS.reduce((highest, tier) => {
      return (score >= tier.threshold && tier.threshold >= highest.threshold) ? tier : highest;
    }, TIERS[0]);

    if (newTier.name !== currentTier.name) {
      console.log(`Tier Up! ${currentTier.name} -> ${newTier.name}`);
      setPrevTier(currentTier);
      setCurrentTier(newTier);
      // Only show animation/toast if it's not the initial load (score > 0)
      if (score > 0) {
        setShowTierUp(true);
        toast({
          title: "Tier Up!",
          description: `You've reached ${newTier.name} tier!`,
          variant: "default",
        });
        setTimeout(() => setShowTierUp(false), 4000); // Animation duration
      }
    }
  };

  // Increments round counter, resets round-specific things
  function startNewRound() {
     console.log("Starting new round...");
     setRoundCounter((prev) => prev + 1); // This triggers useEffect to fetch word
     // Reset things specific to a round, but not overall progress (score, streak, sessionUsedWords)
     setFreezeTimeUsed(false);
     setIsTimeFrozen(false);
     // Fetching and resetting game state (like clues, time) happens in fetchNewWord
  }

  // Handles the submission of a guess
  async function handleSubmitGuess() {
    if (!guess.trim() || gameState !== "playing" || isGeneratingNewWord) return;

    setAttempts((prev) => prev + 1);
    const guessedWordLower = guess.trim().toLowerCase();
    const currentWordLower = currentWord.toLowerCase(); // Ensure comparison is case-insensitive

    if (guessedWordLower === currentWordLower) {
      // --- Correct Guess Logic ---
      const timeBonus = Math.floor(timeLeft / 5);
      const difficultyBonus = getDifficultyBonus();
      const cluesPenalty = clues.length * 15; // Penalty for revealed clues
      const attemptsPenalty = wrongAttempts * 10; // Penalty for wrong attempts in this round
      const streakBonus = Math.min(consecutiveCorrect * 5, 50); // Capped streak bonus
      const basePoints = 100;
      const pointsToAdd = Math.max(10, basePoints + timeBonus + difficultyBonus + streakBonus - cluesPenalty - attemptsPenalty);

      const newScore = score + pointsToAdd;


      // *** ADD WORD TO SESSION LIST ***
      setSessionUsedWords(prev => [...prev, currentWordLower]);

      // Update State
      setScore(newScore);
      setGameState("won");
      setShowConfetti(true);
      setConsecutiveCorrect((prev) => prev + 1);

      toast({
        title: "Correct!",
        description: `You earned ${pointsToAdd} points!`,
        variant: "default",
      });

      // Async Operations (save score, update stats, check rank)
      try {
         await saveScore(newScore); // Pass the *new total score* for saving context
         checkLeaderboardRanking(newScore);
         calculatePercentileRank(newScore);
         await updatePlayerStats(newScore); // Update persistent stats
      } catch (error) {
         console.error("Error during post-guess updates:", error);
         // Decide how to handle this - maybe notify user?
      }

    } else {
      // --- Incorrect Guess Logic ---
      console.log(`Incorrect guess: ${guess}`);
      setWrongGuess(guess);
      setShowWrongGuess(true);
      setWrongAttempts((prev) => prev + 1);// Reset streak on wrong guess

      toast({
        title: "Not quite right",
        description: "Try again with the clues!",
        variant: "destructive",
      });
    }

    setGuess(""); // Clear input after guess processing
  }

  function getDifficultyBonus() {
    const effectiveDifficulty = getEffectiveDifficulty(); // Get current dynamic difficulty label
    switch (effectiveDifficulty.toLowerCase()) {
      case "easy": return 0;
      case "medium": return 30;
      case "hard": return 60;
      case "expert": return 100;
      default: return 0;
    }
  }

  // Saves the score record (likely including context like word, difficulty)
  async function saveScore(currentTotalScore: number) {
    try {
      const effectiveDifficulty = getEffectiveDifficulty();
      const scoreData = {
        name: playerName,
        userId: playeruserid, // Include userId
        score: currentTotalScore, // Save the total score at this point
        word: currentWord,
        date: new Date().toISOString(),
        difficulty: effectiveDifficulty,
        consecutiveCorrect: consecutiveCorrect + 1, // The streak *after* the correct guess
      };

      console.log("Saving score:", scoreData);
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save score: ${response.statusText}`);
      }
      console.log("Score saved successfully.");
      loadLeaderboard(); // Refresh leaderboard after saving
    } catch (error) {
      console.error("Error saving score:", error);
      toast({ title: "Error", description: "Could not save score.", variant: "destructive" });
    }
  }

  // Updates persistent player stats (like total score, last played time)
  async function updatePlayerStats(newTotalScore: number) {
    try {
      const stats = {
        score: newTotalScore, // The latest total score
        // userId: playeruserid, // The API route likely uses the identifier in the body/query
        consecutiveCorrect: gameState === 'won' ? consecutiveCorrect + 1 : 0, // Reflect current streak state
        difficulty: difficulty, // Base difficulty setting
        lastWord: currentWord,
        lastPlayed: new Date().toISOString(),
        tier: currentTier.name, // Current tier achieved
      };
      console.log("Updating player stats for:", playeruserid, "with:", stats);
      await fetch("/api/player-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playeruserid: playeruserid, // Changed key to match expected backend? Adjust if needed
          stats: stats,
        }),
      });
      console.log("Player stats updated.");
    } catch (error) {
      console.error("Error updating player stats:", error);
       toast({ title: "Error", description: "Could not update player stats.", variant: "destructive" });
    }
  }

  // Checks if the new score surpasses anyone in the top ranks
  function checkLeaderboardRanking(newTotalScore: number) {
    const otherPlayers = leaderboard.filter(entry => entry.name !== playerName);
    const topPlayers = otherPlayers.sort((a, b) => b.score - a.score).slice(0, 3); // Top 3 others

    for (const player of topPlayers) {
      if (newTotalScore > player.score) {
        console.log(`Rank Up! Surpassed ${player.name} (${player.score})`);
        setBeatenPlayer(player);
        setShowRankUp(true);
        setTimeout(() => setShowRankUp(false), 5000);
        break; // Only show one rank up notification per win
      }
    }
  }

  // Calculates the player's percentile rank
  function calculatePercentileRank(newTotalScore: number) {
    if (leaderboard.length === 0) {
      setPercentileRank(100); // Top percentile if leaderboard is empty
      return;
    }
    // Ensure we are comparing against unique player scores
     const uniqueScores = Array.from(new Map(leaderboard.map(p => [p.name, p.score])).values());
    const lowerScoresCount = uniqueScores.filter(score => score < newTotalScore).length;
    const percentile = Math.round((lowerScoresCount / uniqueScores.length) * 100);
    setPercentileRank(percentile);
    console.log(`Percentile rank: ${percentile}%`);
  }

  // --- UI Helpers ---

  function getDifficultyColor() {
    const effectiveDifficulty = getEffectiveDifficulty().toLowerCase();
    switch (effectiveDifficulty) {
      case "easy": return "from-indigo-300 to-purple-300";
      case "medium": return "from-blue-300 to-cyan-300";
      case "hard": return "from-emerald-300 to-teal-300";
      case "expert": return "from-amber-300 to-yellow-300";
      default: return "from-violet-300 to-fuchsia-300";
    }
  }

  function getEffectiveDifficulty() {
    if (consecutiveCorrect >= 10) return "Expert";
    if (consecutiveCorrect >= 6) return "Hard";
    if (consecutiveCorrect >= 3) return "Medium";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1); // Base difficulty
  }

  function handleFreezeTime() {
    if (!freezeTimeUsed && gameState === "playing" && !isTimeFrozen) {
      console.log("Freezing time!");
      setFreezeTimeUsed(true); // Mark as used for this round
      setIsTimeFrozen(true);
      setShowFreezeAnimation(true);

      setTimeout(() => setShowFreezeAnimation(false), 2000); // Animation duration
      setTimeout(() => {
        console.log("Unfreezing time.");
        setIsTimeFrozen(false);
      }, 10000); // Freeze duration

      toast({
        title: "Time Frozen!",
        description: "You have 10 seconds of frozen time!",
        variant: "default",
      });
    }
  }

  // Resets the entire game session back to the beginning state
  async function resetGameSession() {
    console.log("Resetting entire game session...");
    setIsLoading(true); // Show loading indicator

    // Reset all progress
    setScore(0);
    setConsecutiveCorrect(0);
    setWrongAttempts(0); // Reset round attempts too
    setAttempts(0);
    setSessionUsedWords([]); // *** Clear used words list ***
    setCurrentTier(TIERS[0]); // Reset tier
    setPrevTier(TIERS[0]);
    setPercentileRank(null); // Clear percentile
    setBeatenPlayer(null); // Clear beaten player

    // Reset current round state thoroughly
    setCurrentWord("");
    setClues([]);
    setAllClues([]);
    setRiddle("");
    setGuess("");
    setTimeLeft(60);
    setGameState("playing"); // Set back to playing
    setShowConfetti(false);
    setWrongGuess("");
    setShowWrongGuess(false);
    setFreezeTimeUsed(false);
    setIsTimeFrozen(false);

    // Update backend stats to reflect reset (optional, confirm desired behavior)
    try {
       await updatePlayerStats(0); // Update persistent score to 0
    } catch (error) {
       console.error("Failed to reset player stats on backend during full reset:", error);
    }

    // Set round counter to 1 to trigger fetching the first word via useEffect
    setRoundCounter(1);

    // Let the useEffect handle the fetch, isLoading will be set to false there
    // setIsLoading(false); // Let fetchNewWord handle this
  }

  // Component to display the riddle
  const RiddleDisplay = () => (
    <div className="bg-violet-100 p-4 rounded-lg shadow-inner">
      <h4 className="font-semibold text-violet-800 mb-2 text-center text-lg">Riddle</h4>
      <p className="text-sm text-slate-700 italic text-center">{riddle || "Generating a puzzling riddle..."}</p>
    </div>
  );


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-wizard-muted/30 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <GameBackground />

      {/* Freeze time animation */}
      <AnimatePresence>
        {showFreezeAnimation && (
          <motion.div
            className="fixed inset-0 bg-cyan-500/10 backdrop-blur-sm z-40 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                TIME FROZEN
              </div>
              <motion.div
                className="text-2xl mt-4 text-cyan-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                10 seconds
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full max-w-6xl flex-col md:flex-row">
        {/* Left sidebar with game stats - hidden on mobile */}
        <GameStats
          score={score}
          consecutiveCorrect={consecutiveCorrect}
          currentTier={currentTier}
          effectiveDifficulty={getEffectiveDifficulty()}
          freezeTimeUsed={freezeTimeUsed}
          isTimeFrozen={isTimeFrozen}
          gameState={gameState}
          handleFreezeTime={handleFreezeTime}
        />

        <div className="flex-1 flex flex-col items-center">
          {/* Main game content */}
          <motion.div
            className="w-full max-w-md space-y-4"
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
                <Button variant="ghost" onClick={() => router.push("/")} className="p-2 text-slate-700">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-slate-700">{score} points</span>
              </motion.div>

              <motion.div
                className="flex items-center gap-2"
                animate={{
                  scale: timeLeft <= 10 && !isTimeFrozen ? [1, 1.1, 1] : 1,
                  color: timeLeft <= 10 && !isTimeFrozen ? ["#1E40AF", "#EF4444", "#1E40AF"] : "#1E40AF",
                }}
                transition={{
                  repeat: timeLeft <= 10 && !isTimeFrozen ? Number.POSITIVE_INFINITY : 0,
                  duration: 0.5,
                }}
              >
                <Clock
                  className={`h-5 w-5 ${
                    isTimeFrozen ? "text-cyan-500" : timeLeft <= 10 ? "text-red-500" : "text-slate-700"
                  }`}
                />
                <span className={`font-bold ${isTimeFrozen ? "text-cyan-500" : ""}`}>
                  {timeLeft}s {isTimeFrozen && "(frozen)"}
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="wizard-card overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${getDifficultyColor()} bg-opacity-30 pb-3`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white/80 text-slate-700 border-slate-300">
                        {getEffectiveDifficulty()}
                      </Badge>

                      {consecutiveCorrect > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 bg-white/80 text-violet-500 px-2 py-1 rounded-full text-xs border border-violet-200"
                        >
                          <ChevronUp className="h-3 w-3" />
                          <span>{consecutiveCorrect} streak</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white/80 text-slate-700 border-slate-300">
                        {playerName}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`bg-gradient-to-r ${currentTier.color}/20 text-slate-700 border-slate-300`}
                      >
                        {currentTier.name}
                      </Badge>
                    </div>
                  </div>

                  <CardTitle className="text-2xl text-center flex items-center justify-center text-slate-700">
                    Word Wizard
                    <motion.div
                      className="ml-2 text-violet-500"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Brain className="h-6 w-6" />
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
                        isTimeFrozen
                          ? "bg-gradient-to-r from-cyan-300 to-blue-300"
                          : timeLeft > 30
                            ? "bg-violet-500"
                            : timeLeft > 15
                              ? "bg-blue-500"
                              : "bg-red-500"
                      }`}
                    />
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-4 p-4 max-h-[400px] overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {gameState === "playing" && (
                      <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-3 max-h-[300px] overflow-scroll">
                          {/* Display riddle first */}
                          <RiddleDisplay />

                          {/* Show clues after they appear */}
                          {clues.length > 0 && (
                            <>
                              <h3 className="font-semibold text-center text-slate-700">Clues:</h3>
                              <GameClue clues={clues} isLoading={isLoading} />
                            </>
                          )}
                        </div>

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
                          difficulty={getEffectiveDifficulty().toLowerCase()}
                          streak={consecutiveCorrect}
                          percentileRank={percentileRank}
                          tier={currentTier.name}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {gameState === "playing" && (
                    <div className="sticky-input-container p-4 rounded-lg bg-gradient-to-r from-violet-300/20 to-fuchsia-300/10">
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
                        </motion.div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSubmitGuess()
                        }}
                      >
                        <div className="flex space-x-2">
                          <Input
                            type="text"
                            placeholder="Type your guess..."
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            className="flex-1 wizard-input"
                            ref={inputRef}
                            autoFocus
                          />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button type="submit" className="wizard-button">
                              Guess
                            </Button>
                          </motion.div>
                        </div>
                      </form>
                    </div>
                  )}
                </CardContent>

                <CardFooter className={`flex justify-center bg-gradient-to-r ${getDifficultyColor()}/30 p-4`}>
                  {gameState !== "playing" && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex gap-2 w-full"
                    >
                      {gameState === "won"?(
                        <Button onClick={startNewRound} className="flex-1 wizard-button">
                          Next Word
                        </Button>
                      ):( <Button onClick={resetGameSession} className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]">
                        Start New Game
                      </Button>)}

                    </motion.div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>

            {/* Mobile Stats Bar */}
            {gameState === "won" || gameState === "lost" ? null : (
              <MobileStatsBar
                score={score}
                consecutiveCorrect={consecutiveCorrect}
                currentTier={currentTier}
                effectiveDifficulty={getEffectiveDifficulty()}
                freezeTimeUsed={freezeTimeUsed}
                isTimeFrozen={isTimeFrozen}
                gameState={gameState}
                handleFreezeTime={handleFreezeTime}
              />
            )}
          </motion.div>
        </div>

        {/* Right sidebar with leaderboard preview - hidden on mobile */}
        <LeaderboardPreview leaderboard={leaderboard} />
      </div>

      {/* Rank up notification */}
      <AnimatePresence>
        {showRankUp && beatenPlayer && (
          <RankUpNotification player={beatenPlayer} onClose={() => setShowRankUp(false)} />
        )}
      </AnimatePresence>

      {/* Tier up animation */}
      <AnimatePresence>
        {showTierUp && (
          <TierUpAnimation
            tierName={currentTier.name}
            tierColor={currentTier.color}
            onComplete={() => setShowTierUp(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

