"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Medal, Crown, Star, Shield, Sparkles, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScoreEntry {
  name: string
  score: number | string
  word: string
  date: string
  difficulty?: string
  consecutiveCorrect?: number
}

interface PlayerScore {
  name: string
  highestScore: number
  totalScore: number
  gamesPlayed: number
  lastWord: string
  lastDate: string
  tier: string
  consecutiveCorrect?: number
}

// Define tier thresholds and names
const TIERS = [
  {
    name: "Bronze",
    threshold: 0,
    color: "bg-gradient-to-r from-amber-700/20 to-amber-500/20 text-amber-700",
    gradient: "from-amber-700 to-amber-500",
  },
  {
    name: "Silver",
    threshold: 200,
    color: "bg-gradient-to-r from-gray-400/20 to-gray-300/20 text-gray-500",
    gradient: "from-gray-400 to-gray-300",
  },
  {
    name: "Gold",
    threshold: 500,
    color: "bg-gradient-to-r from-yellow-500/20 to-yellow-300/20 text-yellow-600",
    gradient: "from-yellow-500 to-yellow-300",
  },
  {
    name: "Platinum",
    threshold: 1000,
    color: "bg-gradient-to-r from-cyan-500/20 to-cyan-300/20 text-cyan-600",
    gradient: "from-cyan-500 to-cyan-300",
  },
  {
    name: "Diamond",
    threshold: 2000,
    color: "bg-gradient-to-r from-blue-500/20 to-blue-300/20 text-blue-600",
    gradient: "from-blue-500 to-blue-300",
  },
  {
    name: "Master",
    threshold: 3500,
    color: "bg-gradient-to-r from-purple-600/20 to-purple-400/20 text-purple-600",
    gradient: "from-purple-600 to-purple-400",
  },
  {
    name: "Grandmaster",
    threshold: 5000,
    color: "bg-gradient-to-r from-red-600/20 to-red-400/20 text-red-600",
    gradient: "from-red-600 to-red-400",
  },
  {
    name: "Legend",
    threshold: 7500,
    color: "bg-gradient-to-r from-emerald-600/20 to-emerald-400/20 text-emerald-600",
    gradient: "from-emerald-600 to-emerald-400",
  },
]

export default function LeaderboardPage() {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([])
  const [activeTab, setActiveTab] = useState("highest")
  const [showAnimation, setShowAnimation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Function to load and aggregate scores from Redis
  const loadScores = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/scores")
      if (!response.ok) {
        throw new Error("Failed to fetch scores")
      }

      const savedScores: ScoreEntry[] = await response.json()

      // Filter valid entries (allow score to be number or numeric string)
      const validScores = savedScores.filter(
        (entry) =>
          entry &&
          typeof entry.name === "string" &&
          !isNaN(Number(entry.score)) &&
          typeof entry.word === "string" &&
          typeof entry.date === "string",
      )

      // Group scores by player name and compute aggregates
      const playerMap = new Map<string, PlayerScore>()

      // First pass: initialize player data
      validScores.forEach((entry: ScoreEntry) => {
        const entryScore = Number(entry.score)
        if (!playerMap.has(entry.name)) {
          // Determine tier based on score
          const tier = TIERS.reduce((highest, tier) => {
            if (entryScore >= tier.threshold && tier.threshold >= highest.threshold) {
              return tier
            }
            return highest
          }, TIERS[0])

          playerMap.set(entry.name, {
            name: entry.name,
            highestScore: entryScore,
            totalScore: entryScore,
            gamesPlayed: 1,
            lastWord: entry.word,
            lastDate: entry.date,
            tier: tier.name,
            consecutiveCorrect: entry.consecutiveCorrect || 0,
          })
        } else {
          const playerData = playerMap.get(entry.name)!

          // Update highest score if this entry has a higher score
          if (entryScore > playerData.highestScore) {
            playerData.highestScore = entryScore

            // Update tier based on new highest score
            const newTier = TIERS.reduce((highest, tier) => {
              if (entryScore >= tier.threshold && tier.threshold >= highest.threshold) {
                return tier
              }
              return highest
            }, TIERS[0])

            playerData.tier = newTier.name
          }

          playerData.totalScore += entryScore
          playerData.gamesPlayed += 1

          // Update consecutive correct if higher
          if ((entry.consecutiveCorrect || 0) > (playerData.consecutiveCorrect || 0)) {
            playerData.consecutiveCorrect = entry.consecutiveCorrect
          }

          const currentDate = new Date(playerData.lastDate)
          const entryDate = new Date(entry.date)
          if (!isNaN(entryDate.getTime()) && entryDate > currentDate) {
            playerData.lastWord = entry.word
            playerData.lastDate = entry.date
          }
        }
      })

      let sortedScores: PlayerScore[]

      if (activeTab === "highest") {
        sortedScores = Array.from(playerMap.values()).sort((a, b) => b.highestScore - a.highestScore)
      } else {
        sortedScores = Array.from(playerMap.values()).sort((a, b) => b.totalScore - a.totalScore)
      }

      setPlayerScores(sortedScores)

      // Trigger animation after data is loaded
      setTimeout(() => {
        setShowAnimation(true)
      }, 500)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      setPlayerScores([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadScores()
  }, [activeTab])

  // Function to get tier color
  const getTierColor = (tierName: string) => {
    const tier = TIERS.find((t) => t.name === tierName)
    return tier ? tier.color : TIERS[0].color
  }

  // Function to get tier gradient
  const getTierGradient = (tierName: string) => {
    const tier = TIERS.find((t) => t.name === tierName)
    return tier ? tier.gradient : TIERS[0].gradient
  }

  // Function to get medal for top 3 players
  const getMedal = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />
    return <Shield className="h-5 w-5 text-[#8B5CF6]" />
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
          <Card className="border-2 border-[#E5DEFF] shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30">
              <CardTitle className="text-center text-[#1E40AF] flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                Top Wizards
              </CardTitle>

              <Tabs defaultValue="highest" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="highest">Highest Score</TabsTrigger>
                  <TabsTrigger value="total">Total Score</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-6 max-h-[500px] overflow-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Sparkles className="h-8 w-8 text-[#8B5CF6]" />
                  </motion.div>
                </div>
              ) : playerScores.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {showAnimation && (
                      <motion.div
                        className="absolute top-20 right-4 z-10"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          animate={{
                            y: [-10, 10],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                        >
                          <Sparkles className="h-10 w-10 text-yellow-500" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                            animate={index < 3 ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                          >
                            {getMedal(index)}
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
                            {activeTab === "highest" ? player.highestScore : player.totalScore}
                          </div>
                          {activeTab === "highest" && (
                            <p className="text-xs text-[#6B7280]">Total: {player.totalScore}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <p className="text-[#6B7280]">
                          Last word: <span className="font-medium">{player.lastWord}</span>
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`px-2 py-1 rounded-full bg-gradient-to-r ${getTierGradient(player.tier)} text-white font-medium text-xs flex items-center gap-1`}
                        >
                          <Sparkles className="h-3 w-3" />
                          {player.tier}
                        </motion.div>
                      </div>
                      {player.consecutiveCorrect && player.consecutiveCorrect > 2 && (
                        <motion.div
                          className="mt-1 text-xs flex items-center"
                          animate={{ x: [0, 2, 0] }}
                          transition={{ repeat: 5, duration: 0.3, delay: index * 0.2 }}
                        >
                          <span className="text-[#0EA5E9] flex items-center">
                            <span className="mr-1">🔥</span>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Best streak: {player.consecutiveCorrect} words
                          </span>
                        </motion.div>
                      )}
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
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="flex justify-center mb-4"
                  >
                    <Trophy className="h-12 w-12 text-[#8B5CF6]/50" />
                  </motion.div>
                  <p>No scores yet. Start playing to be the first!</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  )
}

