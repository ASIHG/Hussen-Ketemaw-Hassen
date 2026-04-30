import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trackEvent } from '@/src/lib/events';

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        trackEvent('exit_intent_shown' as any);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  const handleClaim = () => {
    trackEvent('exit_intent_claimed' as any);
    window.location.href = '#'; // Redirect to offer
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="bg-[#0a0a0a] border-[#C5A059]/30 overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CardContent className="p-10 text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-[#C5A059]/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative flex items-center justify-center w-full h-full bg-[#C5A059]/10 rounded-2xl border border-[#C5A059]/30">
                    <Gift className="w-10 h-10 text-[#C5A059]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight">Wait! One Last Offer</h2>
                  <p className="text-gray-400 font-mono text-sm">Activate a 30-day Strategic AI Boost for your clusters. 100% free for first-time operators.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <Zap className="w-4 h-4 text-blue-500 mx-auto" />
                    <p className="text-xl font-bold text-white">+15% Yield</p>
                    <p className="text-[10px] text-gray-500 font-mono">Prediction Accuracy</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <Rocket className="w-4 h-4 text-purple-500 mx-auto" />
                    <p className="text-xl font-bold text-white">-30% CAC</p>
                    <p className="text-[10px] text-gray-500 font-mono">Growth Efficiency</p>
                  </div>
                </div>

                <Button 
                  onClick={handleClaim}
                  className="w-full h-14 bg-[#C5A059] text-black font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:scale-[1.02] transition-all"
                >
                  CLAIM STRATEGIC BOOST
                </Button>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors"
                >
                  No thanks, I'll scale manually
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
