"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  rotation: number;
  size: number;
  color: string;
}

export default function Confetti() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    const colors = ['#FCD34D', '#F472B6', '#60A5FA', '#34D399', '#A78BFA', '#FCA5A5'];
    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position
        delay: Math.random() * 0.5, // Random delay
        rotation: Math.random() * 360, // Random rotation
        size: Math.random() * 8 + 5, // Random size
        color: colors[Math.floor(Math.random() * colors.length)] // Random color
      });
    }
    
    setConfetti(pieces);
    
    // Clean up after animation
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.6}px`,
            backgroundColor: piece.color,
            borderRadius: '2px',
            zIndex: 999
          }}
          initial={{ 
            y: -20, 
            rotate: piece.rotation,
            opacity: 1
          }}
          animate={{
            y: ['0vh', '100vh'],
            rotate: [piece.rotation, piece.rotation + 360],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: piece.delay,
            ease: "easeIn"
          }}
        />
      ))}
    </div>
  );
}
