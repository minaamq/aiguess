"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

// Define a type for each particle
interface Particle {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export default function GameBackground() {
  // Properly type the state array
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Generate random positions only on the client side
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 10 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 5
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#0EA5E9]/10 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-r from-[#0EA5E9]/10 to-[#8B5CF6]/10 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-[#F472B6]/10 to-[#EC4899]/10 blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-20 w-36 h-36 rounded-full bg-gradient-to-r from-[#34D399]/10 to-[#10B981]/10 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
      
      {/* Floating magical elements */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-[#8B5CF6]/20"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    </>
  )
}