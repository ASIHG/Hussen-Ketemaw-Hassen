import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = "w-10 h-10", iconOnly = false }: { className?: string, iconOnly?: boolean }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    {/* Fractal Geometry Core */}
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full fill-none overflow-visible">
        <defs>
          <linearGradient id="nexusGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#8A6D3B" />
          </linearGradient>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Orbit Layers - Representation of Global Connectivity */}
        {[0, 45, 90, 135].map((rotation, i) => (
          <motion.ellipse
            key={i}
            cx="50" cy="50" rx="48" ry="18"
            stroke="url(#nexusGold)"
            strokeWidth="0.2"
            strokeOpacity="0.3"
            initial={{ rotate: rotation }}
            animate={{ rotate: rotation + 360 }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* The Sovereign Shield / Hexagon Grid */}
        <motion.path
          d="M 50,15 L 80,30 L 80,70 L 50,85 L 20,70 L 20,30 Z"
          stroke="url(#nexusGold)"
          strokeWidth="1.5"
          fill="rgba(197, 160, 89, 0.05)"
          animate={{ strokeWidth: [1.5, 2, 1.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Global Connection Nodes */}
        <motion.circle cx="50" cy="15" r="3" fill="url(#nexusGold)" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="80" cy="30" r="2" fill="url(#nexusGold)" />
        <motion.circle cx="80" cy="70" r="2" fill="url(#nexusGold)" />
        <motion.circle cx="50" cy="85" r="3" fill="url(#nexusGold)" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
        <motion.circle cx="20" cy="70" r="2" fill="url(#nexusGold)" />
        <motion.circle cx="20" cy="30" r="2" fill="url(#nexusGold)" />

        {/* Central Intelligence Core */}
        <motion.circle
          cx="50" cy="50" r="12"
          fill="url(#nexusGold)"
          animate={{
            boxShadow: ["0 0 10px #C5A059", "0 0 20px #C5A059", "0 0 10px #C5A059"]
          }}
        />
        <motion.path
          d="M 45,50 L 50,45 L 55,50 L 50,55 Z"
          fill="white"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </svg>
    </div>

    {/* Quantum Aura Effect */}
    <div className="absolute inset-0 bg-[#C5A059]/10 blur-[40px] rounded-full scale-150 opacity-30 group-hover:opacity-60 transition-opacity" />
    <div className="absolute inset-0 w-full h-full border border-white/5 rounded-full animate-ping opacity-10" />
  </div>
);

export default Logo;
