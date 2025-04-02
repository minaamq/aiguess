"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Clock, Trophy, Wand2 } from "lucide-react"
import { motion } from "framer-motion"

export default function HowToPlayPage() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
            className="text-2xl font-bold flex items-center text-[#8B5CF6]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            How To Play <Wand2 className="ml-2 h-5 w-5 text-[#0EA5E9]" />
          </motion.h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border-2 border-[#E5DEFF] shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#E5DEFF]/30">
              <CardTitle className="text-center text-[#1E40AF]">Game Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <motion.div className="space-y-6" variants={container} initial="hidden" animate="visible">
                <motion.div className="space-y-4" variants={item}>
                  <motion.div
                    className="flex items-start gap-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{
                        rotate: 15,
                        scale: 1.2,
                      }}
                      initial={{ rotate: 0, scale: 1 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        repeatDelay: 5,
                        ease: "easeInOut",
                      }}
                    >
                      <Lightbulb className="h-5 w-5 text-[#0EA5E9] mt-1 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-[#1E40AF]">Clues</h3>
                      <p className="text-sm text-[#6B7280]">
                        Our AI wizard will give you clues about a secret word. New clues appear every 15 seconds!
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 5,
                      }}
                    >
                      <Clock className="h-5 w-5 text-[#EF4444] mt-1 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-[#1E40AF]">Time Limit</h3>
                      <p className="text-sm text-[#6B7280]">
                        You have 60 seconds to guess each word. The faster you guess, the more points you earn!
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{
                        y: -5,
                      }}
                      initial={{ y: 0 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    >
                      <Trophy className="h-5 w-5 text-[#0EA5E9] mt-1 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-[#1E40AF]">Scoring</h3>
                      <p className="text-sm text-[#6B7280]">
                        Base score: 100 points
                        <br />
                        Time bonus: +1 point for every 5 seconds left
                        <br />
                        Penalty: -10 points for each wrong guess
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-r from-[#E5DEFF] to-[#EFF6FF] p-4 rounded-lg"
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-bold mb-2 text-[#1E40AF]">Difficulty Levels</h3>
                  <ul className="space-y-3 text-sm">
                    <motion.li className="flex items-center gap-2" whileHover={{ x: 5 }}>
                      <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                      <span className="text-[#6B7280]">
                        <strong className="text-[#1E40AF]">Easy:</strong> Simple 3-5 letter words (Ages 4-7)
                      </span>
                    </motion.li>
                    <motion.li className="flex items-center gap-2" whileHover={{ x: 5 }}>
                      <div className="w-3 h-3 rounded-full bg-[#1E40AF]"></div>
                      <span className="text-[#6B7280]">
                        <strong className="text-[#1E40AF]">Medium:</strong> Common 4-6 letter words (Ages 8-10)
                      </span>
                    </motion.li>
                    <motion.li className="flex items-center gap-2" whileHover={{ x: 5 }}>
                      <div className="w-3 h-3 rounded-full bg-[#0EA5E9]"></div>
                      <span className="text-[#6B7280]">
                        <strong className="text-[#1E40AF]">Hard:</strong> Challenging 5-8 letter words (Ages 11-12)
                      </span>
                    </motion.li>
                    <motion.li className="flex items-center gap-2" whileHover={{ x: 5 }}>
                      <div className="w-3 h-3 rounded-full bg-[#6366F1]"></div>
                      <span className="text-[#6B7280]">
                        <strong className="text-[#1E40AF]">Expert:</strong> Advanced vocabulary (Ages 13-14)
                      </span>
                    </motion.li>
                  </ul>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  )
}

