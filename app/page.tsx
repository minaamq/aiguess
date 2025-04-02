"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wand2, Sparkles, ArrowRight, BookOpen, Trophy, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function Home() {
  const { toast } = useToast()
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [userId, setUserid] = useState("")
  const [isStartEnabled, setIsStartEnabled] = useState(false)
  const [showMagic, setShowMagic] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start as loading to check for existing player
  const [existingPlayer, setExistingPlayer] = useState(false)

  useEffect(() => {
    // Check if player already exists in Redis
    const checkExistingPlayer = async () => {
      try {
        const response = await fetch("/api/get-player", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.playerName) {
            setPlayerName(data.playerName)
            setUserid(data.userId)
            setExistingPlayer(true)
            setIsStartEnabled(true)
          }
        }
      } catch (error) {
        console.error("Error checking for existing player:", error)
      } finally {
        // Slight delay to ensure smooth transition
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }

    checkExistingPlayer()

    // Show magic animation after a delay
    const timer = setTimeout(() => {
      setShowMagic(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Update start button state when player name changes
  useEffect(() => {
    setIsStartEnabled(playerName.trim().length > 0)
  }, [playerName])

  const handleStartGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to start the game",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Save player name via API endpoint
      const response = await fetch("/api/save-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerName, userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to save player name")
      }

      // Navigate to the game page
      router.push("/game")
    } catch (error) {
      const err = error as Error
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Sparkle particle effect component
// Sparkle particle effect component
const SparkleParticles = () => {
  // Define the type for each particle
  type Particle = {
    x: string;
    size: string;
    opacity: number;
    delay: number;
  };

  // Initialize state with the correct type
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particle data only on the client
    const newParticles = [...Array(8)].map((_, i) => ({
      x: `${Math.random() * 100}%`,
      size: `${8 + Math.random() * 8}px`,
      opacity: 0.6 + Math.random() * 0.4,
      delay: i * 0.8,
    }));
    setParticles(newParticles);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: particle.x, 
            y: "100%", 
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            y: "0%", 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: particle.x
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeOut"
          }}
        >
          <Sparkles 
            className="text-[#0EA5E9]" 
            style={{ 
              width: particle.size, 
              height: particle.size,
              opacity: particle.opacity
            }} 
          />
        </motion.div>
      ))}
    </div>
  );
};

  // Animation variants for smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.5,
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    }
  }

  // Magic wand wave path for animation
  const wandPath = {
    rotate: [0, 5, -5, 8, -8, 5, -5, 0],
    x: [0, 2, -2, 4, -4, 2, -2, 0],
    y: [0, -2, 2, -4, 4, -2, 2, 0]
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-[#F8FAFC] via-[#F1F0FB] to-[#EDE9FE]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center h-screen w-full fixed inset-0 z-50 bg-gradient-to-br from-[#F8FAFC]/90 via-[#F1F0FB]/90 to-[#EDE9FE]/90 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            key="loader"
          >
            {/* Sparkle particles background effect */}
            <SparkleParticles />
            
            <motion.div
              className="relative"
              variants={itemVariants}
            >
              <motion.div
                animate={wandPath}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Wand2 className="h-20 w-20 text-[#8B5CF6]" />
                </motion.div>
              </motion.div>
              
              {/* Magical glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(14,165,233,0.2) 50%, rgba(139,92,246,0) 70%)",
                  zIndex: -1
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
              
              {/* Magic sparkles around wand */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${50 - Math.sin(i / 5 * Math.PI * 2) * 30}%`,
                    left: `${50 - Math.cos(i / 5 * Math.PI * 2) * 30}%`,
                  }}
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.3, 1, 0.3],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-6 w-6 text-[#0EA5E9]" />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Loading dots with smooth wave motion */}
            <motion.div
              className="flex space-x-2 mt-8"
              variants={itemVariants}
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.div 
                  key={index}
                  className="h-3 w-3 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9]"
                  animate={{
                    y: ["0%", "-100%", "0%"],
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smoother motion
                  }}
                />
              ))}
            </motion.div>
            
            <motion.p 
              className="text-[#6B7280] mt-6 text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9]"
              variants={itemVariants}
            >
              Summoning your magic powers...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="max-w-md w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            key="content"
          >
            <motion.div
              className="text-center relative mb-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            >
              <AnimatePresence>
                {showMagic && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.div
                      animate={{
                        y: [-5, 5],
                        rotate: [0, 3, -3, 0],
                        filter: ["drop-shadow(0 0 5px rgba(139,92,246,0.3))", "drop-shadow(0 0 10px rgba(139,92,246,0.6))", "drop-shadow(0 0 5px rgba(139,92,246,0.3))"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-12 w-12 text-[#8B5CF6]" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] mb-1 flex items-center justify-center">
                Word Wizard
                <motion.div
                  animate={{
                    rotate: [0, 8, 0],
                    scale: [1, 1.08, 1],
                    filter: ["drop-shadow(0 0 4px rgba(14,165,233,0.4))", "drop-shadow(0 0 8px rgba(14,165,233,0.7))", "drop-shadow(0 0 4px rgba(14,165,233,0.4))"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="ml-2"
                >
                  <Wand2 className="text-[#0EA5E9]" />
                </motion.div>
              </h1>
              <motion.p
                className="text-sm text-[#6B7280]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                The magical AI word guessing game!
              </motion.p>

              <motion.div
                className="mt-2 flex justify-center gap-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier, index) => (
                  <motion.div
                    key={tier}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: `var(--${tier.toLowerCase()}-gradient, ${
                        ["#CD7F32", "#C0C0C0", "#FFD700", "#E5E4E2", "#B9F2FF"][index]
                      })`,
                      boxShadow: "0 0 6px rgba(139, 92, 246, 0.4)",
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      boxShadow: ["0 0 4px rgba(139,92,246,0.3)", "0 0 8px rgba(139,92,246,0.6)", "0 0 4px rgba(139,92,246,0.3)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="border border-[#E5DEFF] shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
                <CardHeader className="py-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30">
                  <CardTitle className="text-xl text-center text-[#1E40AF]">
                    {existingPlayer ? `Welcome Back, ${playerName}!` : "Welcome, Wizard!"}
                  </CardTitle>
                  <CardDescription className="text-center text-sm">
                    {existingPlayer 
                      ? "Ready to continue your magical journey?" 
                      : "Enter your name to begin your magical journey"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {!existingPlayer && (
                    <div className="space-y-2">
                      <Label htmlFor="playerName" className="text-[#1E40AF] text-sm">
                        Your Wizard Name
                      </Label>
                      <motion.div 
                        whileHover={{ scale: 1.01, boxShadow: "0 0 8px rgba(139,92,246,0.2)" }} 
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Input
                          id="playerName"
                          placeholder="Enter your name"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          className="border-[#8B5CF6]/30 focus-visible:ring-[#8B5CF6] transition-all duration-300"
                        />
                      </motion.div>
                    </div>
                  )}

                  <motion.div
                    className="bg-gradient-to-r from-[#E5DEFF] to-[#EFF6FF] p-3 rounded-lg"
                    whileHover={{ scale: 1.01, boxShadow: "0 0 10px rgba(139,92,246,0.15)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <h3 className="font-bold text-sm mb-1 text-[#1E40AF] flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 text-[#8B5CF6]" />
                      Dynamic Difficulty
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      As you guess correctly, the difficulty increases automatically!
                    </p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF9A9E]"></span>
                        <span>Simple words</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#A1C4FD]"></span>
                        <span>Medium (3 correct)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#84FAB0]"></span>
                        <span>Hard (6 correct)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#D4FC79]"></span>
                        <span>Expert (10 correct)</span>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex justify-center bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30 py-3">
                  <motion.div
                    whileHover={isStartEnabled ? { 
                      scale: 1.03, 
                      boxShadow: "0 4px 12px rgba(139,92,246,0.25)" 
                    } : {}}
                    whileTap={isStartEnabled ? { scale: 0.97 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      size="default"
                      className={`
                        flex items-center gap-2 h-9
                        ${
                          isStartEnabled
                            ? "bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:from-[#7C3AED] hover:to-[#0D8ECF] text-white shadow-md transition-all duration-300"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
                      `}
                      disabled={!isStartEnabled || isLoading}
                      onClick={handleStartGame}
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="h-4 w-4 mr-1" />
                          </motion.div>
                          Loading...
                        </>
                      ) : (existingPlayer ? "Continue Game" : "Start Game")}
                      {!isLoading && (
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              className="flex justify-center space-x-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="/leaderboard">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 flex items-center gap-1 transition-all duration-300"
                  >
                    <Trophy className="h-3 w-3" />
                    Leaderboard
                  </Button>
                </motion.div>
              </Link>
              <Link href="/how-to-play">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -2 }} 
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 flex items-center gap-1 transition-all duration-300"
                  >
                    <BookOpen className="h-3 w-3" />
                    How to Play
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}