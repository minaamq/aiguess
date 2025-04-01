"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    const colors = [
      '#FF9A9E', '#FECFEF', '#A1C4FD', '#C2E9FB', 
      '#84FAB0', '#8FD3F4', '#D4FC79', '#96E6A1',
      '#8B5CF6', '#0EA5E9', '#F8FAFC', '#1E40AF'
    ];
    const newPieces: ConfettiPiece[] = [];
    
    // Create 100 confetti pieces for more density
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // random x position (0-100%)
        y: -20 - Math.random() * 10, // start above the viewport
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 15, // random size between 5-20px
        rotation: Math.random() * 360, // random initial rotation
      });
    }
    
    setPieces(newPieces);
    
    // Clean up after animation
    const timer = setTimeout(() => {
      setPieces([]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
          }}
          initial={{ 
            y: piece.y, 
            x: piece.x, 
            rotate: piece.rotation,
            opacity: 1
          }}
          animate={{ 
            y: '120%', 
            x: [
              piece.x - 20,
              piece.x + 20,
              piece.x - 10,
              piece.x + 10,
              piece.x
            ],
            rotate: piece.rotation + 360 * 3,
            opacity: [1, 1, 1, 0.8, 0]
          }}
          transition={{ 
            type: "tween",
            duration: 3 + Math.random() * 3,
            ease: "easeOut",
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
      ))}
    </div>
  );
}
