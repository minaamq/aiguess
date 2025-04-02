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
  const [clues, setClues] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [playeruserid, setPlayeruserid] = useState("")
  const [difficulty, setDifficulty] = useState("easy")
  const [wrongGuess, setWrongGuess] = useState("")
  const [showWrongGuess, setShowWrongGuess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null);
  const [allClues, setAllClues] = useState<string[]>([])
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [showRankUp, setShowRankUp] = useState(false)
  const [showTierUp, setShowTierUp] = useState(false)
  const [beatenPlayer, setBeatenPlayer] = useState<{ name: string; score: number } | null>(null)
  const [percentileRank, setPercentileRank] = useState<number | null>(null)
  const [currentTier, setCurrentTier] = useState(TIERS[0])
  const [prevTier, setPrevTier] = useState(TIERS[0])
  const [roundCounter, setRoundCounter] = useState(0)
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([])
  const [freezeTimeUsed, setFreezeTimeUsed] = useState(false)
  const [isTimeFrozen, setIsTimeFrozen] = useState(false)
  const [showFreezeAnimation, setShowFreezeAnimation] = useState(false)
  const [isGeneratingNewWord, setIsGeneratingNewWord] = useState(false)
  const [riddle, setRiddle] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize game
  useEffect(() => {
    async function initializeGame() {
      try {
        // Get player name from cookie
        const name = getCookie("playerName")
        const userr = getCookie("userId")
        
        if (!name) {
          router.push("/")
          return
        }

        setPlayerName(name)
        setPlayeruserid(userr ?? "")
        console.log(name)
        console.log(userr)
        // Get player stats from Redis
        // const response = await fetch(`/api/player-stats?name=${encodeURIComponent(userr??"")}`)
        // if (response.ok) {
        //   const stats = await response.json()
          
        //   // Set initial game state from Redis data
        //   if (stats.difficulty) setDifficulty(stats.difficulty)
        //   if (stats.score) setScore(Number.parseInt(stats.score))
        //   if (stats.consecutiveCorrect) setConsecutiveCorrect(Number.parseInt(stats.consecutiveCorrect))
        // }

        setRoundCounter(1)
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing game:", error)
        toast({
          title: "Error",
          description: "Failed to initialize game. Please try again.",
          variant: "destructive",
        })
      }
    }

    initializeGame()
  }, [router])

  // Timer effect
  useEffect(() => {
    if (!isLoading && isInitialized) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          // Don't decrease time if it's frozen or the game isn't playing
          if (isTimeFrozen || gameState !== "playing") return prev

          if (prev <= 1) {
            clearInterval(timer)
            if (gameState === "playing") {
              setGameState("lost")
            }
            return 0
          }

          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState, isTimeFrozen, isLoading, isInitialized])

  // Fetch new word when round counter changes
  useEffect(() => {
    if (roundCounter > 0 && !isGeneratingNewWord && isInitialized) {
      fetchNewWord()
    }
  }, [roundCounter, isInitialized])

  // Load leaderboard data
  useEffect(() => {
    if (isInitialized) {
      loadLeaderboard()
    }
  }, [isInitialized])

  // Update current tier based on score
  useEffect(() => {
    updateTier()
  }, [score])

  // Get a new clue every 15 seconds if still playing
  useEffect(() => {
    if (gameState !== "playing") return

    const clueIntervals = [10, 20, 30, 40, 50] // Start showing clues after 10 seconds
    const currentTime = 60 - timeLeft
    const cluesToShow = clueIntervals.filter((interval) => currentTime >= interval).length

    if (cluesToShow > clues.length && cluesToShow <= allClues.length) {
      displayNextClue()
    }
  }, [timeLeft, gameState, clues, allClues])

  // Focus input when game state changes
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState, clues])

  // Hide wrong guess message after 2 seconds
  useEffect(() => {
    if (showWrongGuess) {
      const timer = setTimeout(() => {
        setShowWrongGuess(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [showWrongGuess])

  const fetchNewWord = async () => {
    setIsLoading(true)
    setIsGeneratingNewWord(true)

    try {
      // Reset game state
      setGuess("")
      setClues([])
      setTimeLeft(60)
      setAttempts(0)
      setGameState("playing")
      setShowConfetti(false)
      setWrongGuess("")
      setShowWrongGuess(false)
      setWrongAttempts(0)

      // Determine difficulty based on consecutive correct answers
      let dynamicDifficulty = difficulty
      if (consecutiveCorrect >= 10) {
        dynamicDifficulty = "expert"
      } else if (consecutiveCorrect >= 6) {
        dynamicDifficulty = "hard"
      } else if (consecutiveCorrect >= 3) {
        dynamicDifficulty = "medium"
      }

      const { word, clues: generatedClues, riddle: generatedRiddle } = await generateWordAndClues(dynamicDifficulty)

      // Store the word, all clues, and riddle
      setCurrentWord(word)
      setAllClues(generatedClues)
      setRiddle(generatedRiddle)

      // Start with no clues - they'll appear based on the timer
      setClues([])
    } catch (error) {
      console.error("Error starting new round:", error)
      toast({
        title: "Error",
        description: "Failed to generate a new word. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsGeneratingNewWord(false)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/scores")
      if (response.ok) {
        const data = await response.json()

        // Process leaderboard data
        const playerMap = new Map<string, number>()

        data.forEach((entry: { name: string; score: string | number }) => {
          const scoreNum = Number(entry.score)
          if (!playerMap.has(entry.name) || scoreNum > playerMap.get(entry.name)!) {
            playerMap.set(entry.name, scoreNum)
          }
        })

        const sortedLeaderboard = Array.from(playerMap.entries())
          .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
          .map(([name, score]) => ({ name, score }))

        setLeaderboard(sortedLeaderboard)
      } else {
        console.error("Failed to load leaderboard")
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
  }

  const updateTier = () => {
    const newTier = TIERS.reduce((highest, tier) => {
      if (score >= tier.threshold && tier.threshold >= highest.threshold) {
        return tier
      }
      return highest
    }, TIERS[0])

    if (newTier.name !== currentTier.name) {
      setPrevTier(currentTier)
      setCurrentTier(newTier)

      if (score > 0 && roundCounter > 1) {
        setShowTierUp(true)
        toast({
          title: "Tier Up!",
          description: `You've reached ${newTier.name} tier!`,
          variant: "default",
        })

        setTimeout(() => setShowTierUp(false), 4000)
      }
    }
  }

  function startNewRound() {
    setClues([])
    setAllClues([])
    setRiddle("")
    setRoundCounter((prev) => prev + 1)
    setFreezeTimeUsed(false)
    setIsTimeFrozen(false)
  }

  function displayNextClue() {
    if (clues.length < allClues.length) {
      setClues((prev) => [...prev, allClues[prev.length]])
    }
  }

  async function handleSubmitGuess() {
    if (!guess.trim()) return

    setAttempts((prev) => prev + 1)

    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      const timeBonus = Math.floor(timeLeft / 5)
      const difficultyBonus = getDifficultyBonus()
      const cluesPenalty = clues.length * 15
      const attemptsPenalty = wrongAttempts * 10
      const streakBonus = Math.min(consecutiveCorrect * 5, 50)
      const newPoints = 100 + timeBonus + difficultyBonus + streakBonus - cluesPenalty - attemptsPenalty
      const pointsToAdd = Math.max(10, newPoints)

      const newScore = score + pointsToAdd
      setScore(newScore)
      setGameState("won")
      setShowConfetti(true)
      setConsecutiveCorrect((prev) => prev + 1)

      toast({
        title: "Correct!",
        description: `You earned ${pointsToAdd} points!`,
        variant: "default",
      })

      await saveScore(pointsToAdd)
      checkLeaderboardRanking(newScore)
      calculatePercentileRank(newScore)

      // Save player stats to Redis
      await updatePlayerStats(newScore)
    } else {
      setWrongGuess(guess)
      setShowWrongGuess(true)
      setWrongAttempts((prev) => prev + 1)

      toast({
        title: "Not quite right",
        description: "Try again with the clues!",
        variant: "destructive",
      })
    }

    setGuess("")
  }

  function getDifficultyBonus() {
    // Dynamic difficulty based on consecutive correct answers
    const effectiveDifficulty =
      consecutiveCorrect >= 10
        ? "expert"
        : consecutiveCorrect >= 6
          ? "hard"
          : consecutiveCorrect >= 3
            ? "medium"
            : difficulty

    switch (effectiveDifficulty) {
      case "easy":
        return 0
      case "medium":
        return 30
      case "hard":
        return 60
      case "expert":
        return 100
      default:
        return 0
    }
  }

  async function saveScore(pointsToAdd: number) {
    try {
      // Determine effective difficulty based on consecutive correct answers
      const effectiveDifficulty =
        consecutiveCorrect >= 10
          ? "expert"
          : consecutiveCorrect >= 6
            ? "hard"
            : consecutiveCorrect >= 3
              ? "medium"
              : difficulty

      const newScore = {
        name: playerName,
        score: score + pointsToAdd,
        word: currentWord,
        date: new Date().toISOString(),
        difficulty: effectiveDifficulty,
        consecutiveCorrect: consecutiveCorrect + 1,
      }

      // Save score to Redis
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newScore),
      })

      if (!response.ok) {
        throw new Error("Failed to save score")
      }

      // Reload leaderboard
      loadLeaderboard()
    } catch (error) {
      console.error("Error saving score:", error)
    }
  }

  async function updatePlayerStats(newTotalScore: number) {
    try {
      const stats = {
        score: newTotalScore,
        userId: playeruserid,
        consecutiveCorrect: consecutiveCorrect + 1,
        difficulty,
        lastWord: currentWord,
        lastPlayed: new Date().toISOString(),
        tier: currentTier.name,
      }
      // Store in Redis without expiration for permanent persistence
      await fetch("/api/player-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playeruserid,
          stats,
        }),
      })
    } catch (error) {
      console.error("Error updating player stats:", error)
    }
  }

  function checkLeaderboardRanking(newTotalScore: number) {
    // Group by player name and find highest score for each player
    const playerMap = new Map()
    leaderboard.forEach((entry) => {
      if (entry.name !== playerName) {
        playerMap.set(entry.name, { name: entry.name, score: entry.score })
      }
    })

    // Convert to array and sort by score (descending)
    const topPlayers = Array.from(playerMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Get top 3

    // Check if current score beats any top player
    for (const player of topPlayers) {
      if (newTotalScore > player.score) {
        setBeatenPlayer(player)
        setShowRankUp(true)
        setTimeout(() => setShowRankUp(false), 5000)
        break
      }
    }
  }

  function calculatePercentileRank(newTotalScore: number) {
    if (leaderboard.length === 0) {
      setPercentileRank(100) // First player is in the 100th percentile
      return
    }

    // Count how many scores are lower than current score
    const lowerScores = leaderboard.filter((entry) => entry.score < newTotalScore).length

    // Calculate percentile (percentage of players with lower scores)
    const percentile = Math.round((lowerScores / leaderboard.length) * 100)
    setPercentileRank(percentile)
  }

  function getDifficultyColor() {
    // Dynamic difficulty based on consecutive correct answers
    const effectiveDifficulty =
      consecutiveCorrect >= 10
        ? "expert"
        : consecutiveCorrect >= 6
          ? "hard"
          : consecutiveCorrect >= 3
            ? "medium"
            : difficulty

    switch (effectiveDifficulty) {
      case "easy":
        return "from-indigo-300 to-purple-300"
      case "medium":
        return "from-blue-300 to-cyan-300"
      case "hard":
        return "from-emerald-300 to-teal-300"
      case "expert":
        return "from-amber-300 to-yellow-300"
      default:
        return "from-violet-300 to-fuchsia-300"
    }
  }

  // Get effective difficulty label
  function getEffectiveDifficulty() {
    if (consecutiveCorrect >= 10) return "Expert"
    if (consecutiveCorrect >= 6) return "Hard"
    if (consecutiveCorrect >= 3) return "Medium"
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }

  // Handle freezing the timer
  function handleFreezeTime() {
    if (!freezeTimeUsed && gameState === "playing") {
      setFreezeTimeUsed(true)
      setIsTimeFrozen(true)
      setShowFreezeAnimation(true)

      // Show animation for 2 seconds
      setTimeout(() => {
        setShowFreezeAnimation(false)
      }, 2000)

      // Keep time frozen for 10 seconds
      setTimeout(() => {
        setIsTimeFrozen(false)
      }, 10000)

      toast({
        title: "Time Frozen!",
        description: "You've frozen time for 10 seconds!",
        variant: "default",
      })
    }
  }

  // Component to display the riddle
  const RiddleDisplay = () => (
    <div className="bg-violet-200 p-4 rounded-md">
      <h4 className="font-semibold text-violet-800 mb-2">Riddle:</h4>
      <p className="text-sm text-slate-800 italic">{riddle || "Thinking of a riddle..."}</p>
    </div>
  )

  async function resetGameSession() {
    // Reset all game progression states
    setConsecutiveCorrect(0)
    setWrongAttempts(0)
    setRoundCounter(1)
    setScore(0)
    // Reset other states
    setClues([])
    setAllClues([])
    setRiddle("")
    setFreezeTimeUsed(false)
    setIsTimeFrozen(false)

    // Update player stats in Redis
    await updatePlayerStats(0)

    // Fetch a new word to start the session fresh
    fetchNewWord()
  }

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

