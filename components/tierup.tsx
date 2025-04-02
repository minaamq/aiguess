
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface TierUpAnimationProps {
  tierName: string;
  tierColor: string;
  onComplete: () => void;
}

export default function TierUpAnimation({ tierName, tierColor, onComplete }: TierUpAnimationProps) {
  useEffect(() => {
    // Set timeout to auto close the animation
    const timeout = setTimeout(() => {
      onComplete();
    }, 4000);
    
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="text-center">
            <motion.div
              className={`w-32 h-32 bg-gradient-to-r ${tierColor} rounded-full mx-auto mb-6 shadow-lg flex items-center justify-center`}
              animate={{ 
                scale: [1, 1.2, 1], 
                rotate: [0, 10, -10, 0],
                boxShadow: [
                  "0 0 0 rgba(255,255,255,0.4)",
                  "0 0 30px rgba(255,255,255,0.6)",
                  "0 0 0 rgba(255,255,255,0.4)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Trophy className="h-16 w-16 text-white" />
            </motion.div>
            
            <motion.h2
              className="text-5xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Tier Up!
            </motion.h2>
            
            <motion.div
              className="text-2xl text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              You've reached
            </motion.div>
            
            <motion.div
              className={`text-4xl font-bold bg-gradient-to-r ${tierColor} text-transparent bg-clip-text`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              {tierName} Tier
            </motion.div>
            
            <motion.div
              className="mt-6 text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              New abilities and challenges await!
            </motion.div>
          </div>
          
          <motion.div
            className="absolute -z-10 inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.2, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className={`w-full h-full rounded-full bg-gradient-to-r ${tierColor} blur-3xl`}></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}