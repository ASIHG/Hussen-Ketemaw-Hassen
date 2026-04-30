import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit } from 'lucide-react';

export const Logo = ({ className = "w-10 h-10", iconOnly = false, light = false }: { className?: string, iconOnly?: boolean, light?: boolean }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="relative">
      <div className={`absolute inset-0 blur-xl opacity-60 bg-neural-accent rounded-full animate-pulse`} />
      <BrainCircuit className={`relative w-full h-full text-neural-accent ${light ? 'text-white' : ''}`} />
    </div>
    {!iconOnly && (
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-neural-accent/20 rounded-full scale-125 pointer-events-none"
      />
    )}
  </div>
);

export default Logo;
