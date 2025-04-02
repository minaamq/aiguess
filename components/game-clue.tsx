"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GameClueProps {
  clues: string[];
  isLoading: boolean;
}

export default function GameClue({ clues, isLoading }: GameClueProps) {
  // Instead of an array of clues, we maintain a single string for the displayed text.
  const [displayedClue, setDisplayedClue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // When new clues are added, compute the full combined text.
  // If it differs from what's already displayed, start the typing effect.
  useEffect(() => {
    if (clues.length > 0) {
      const fullText = clues.join(" ");
      if (displayedClue !== fullText) {
        setIsTyping(true);
      }
    }
  }, [clues, displayedClue]);

  // Animate typing effect: append one character at a time until the full text is reached.
  useEffect(() => {
    if (isTyping) {
      const fullText = clues.join(" ");
      if (displayedClue.length < fullText.length) {
        const timer = setTimeout(() => {
          setDisplayedClue(fullText.substring(0, displayedClue.length + 1));
        }, 25); // Speed of typing

        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
      }
    }
  }, [isTyping, displayedClue, clues]);

  // Scroll to bottom when new text is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedClue]);

  return (
    <div
      ref={containerRef}
      className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#E5DEFF] scrollbar-track-transparent"
    >
      <AnimatePresence>
        <motion.div
          key="clue"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-2"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#0EA5E9]/20 flex items-center justify-center mt-1">
            <Lightbulb className="h-4 w-4 text-[#0EA5E9]" />
          </div>
          <div className="flex-1">
            <Card className="bg-white/80 border border-[#E5DEFF] shadow-sm p-3">
              <p className="text-[#1E40AF] text-sm leading-relaxed">
                {displayedClue}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                    className="inline-block ml-0.5 w-1.5 h-4 bg-[#0EA5E9]"
                  />
                )}
              </p>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#0EA5E9]/20 flex items-center justify-center mt-1">
            <Sparkles className="h-4 w-4 text-[#0EA5E9]" />
          </div>
          <div className="flex-1">
            <Card className="bg-white/80 border border-[#E5DEFF] shadow-sm p-3">
              <div className="flex space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                  className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: 0.2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-2 h-2 rounded-full bg-[#0EA5E9]"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: 0.4, repeat: Number.POSITIVE_INFINITY }}
                  className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                />
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
