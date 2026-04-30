import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Brain, 
  Globe, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  Shield,
  Gem,
  Play,
  Pause,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NeuralMoment {
  id: string;
  title: string;
  creator: {
    name: string;
    role: string;
    avatar: string;
  };
  metrics: {
    val: string;
    label: string;
    trend: 'up' | 'down';
  };
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  type: 'STRATEGIC' | 'ALPHA' | 'MISSION' | 'RESULT';
  color: string;
}

const DUMMY_MOMENTS: NeuralMoment[] = [
  {
    id: '1',
    title: 'Precision Scaler: EMEA Alpha Phase',
    creator: {
      name: 'StrategyAI',
      role: 'Global Orchestrator',
      avatar: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=100&h=100&fit=crop'
    },
    metrics: { val: '+124%', label: 'Efficiency', trend: 'up' },
    description: 'Successful neural deployment across EMEA logistics nodes. Automated matchmaking reduced latency by 45ms. Scaling to secondary clusters authorized.',
    tags: ['EMEA', 'SCALING', 'AI_OPS'],
    likes: 1204,
    comments: 89,
    shares: 231,
    timestamp: '2m ago',
    type: 'RESULT',
    color: '#D4AF37'
  },
  {
    id: '2',
    title: 'New Hub Discovery: Addis Fintech Corridor',
    creator: {
      name: 'Neural Bot',
      role: 'Hub Scout',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    metrics: { val: '$200M', label: 'Potential', trend: 'up' },
    description: 'Emerging signal in Addis Ababa corridor. High-density transaction clusters detected. Recommend immediate investment node deployment.',
    tags: ['ADDIS', 'FINTECH', 'SCOUT'],
    likes: 850,
    comments: 42,
    shares: 110,
    timestamp: '15m ago',
    type: 'ALPHA',
    color: '#3b82f6'
  },
  {
    id: '3',
    title: 'Mission Authorization: Global Zero Energy',
    creator: {
      name: 'Executive Board',
      role: 'Governance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    metrics: { val: 'Net Zero', label: 'Target', trend: 'up' },
    description: 'New global directive to offset all cluster energy usage via localized renewable nodes. Strategy blueprints available for download.',
    tags: ['ZERO_ENERGY', 'GLOBAL', 'GOVERNANCE'],
    likes: 2400,
    comments: 156,
    shares: 540,
    timestamp: '1h ago',
    type: 'MISSION',
    color: '#C5A059'
  }
];

export default function NeuralDiscovery() {
  const [activeMoment, setActiveMoment] = useState(0);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});

  const handleLike = (id: string) => {
    setIsLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col items-center">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 px-4">
        <div>
          <h1 className="text-3xl font-display italic text-white tracking-tight">Global Feed</h1>
          <p className="text-[10px] font-mono text-neural-accent tracking-[0.4em] uppercase opacity-50">Discovery Node // Sync Active</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="text-[9px] font-mono border-white/10 uppercase tracking-widest text-neural-accent">Live Updates</Badge>
           <Badge variant="outline" className="text-[9px] font-mono border-white/10 uppercase tracking-widest">Global</Badge>
        </div>
      </div>

      <div className="flex-1 w-full max-w-2xl overflow-y-auto no-scrollbar snap-y snap-mandatory gap-8 flex flex-col pb-20">
        {DUMMY_MOMENTS.map((moment, idx) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="snap-start min-h-[600px] w-full relative"
          >
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              {/* Background Aesthetic */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{ 
                  background: `radial-gradient(circle at 50% 50%, ${moment.color} 0%, transparent 70%)`,
                  filter: 'blur(100px)'
                }} 
              />
              <div className="neural-grid absolute inset-0 opacity-10" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-white/10 ring-4 ring-white/5 overflow-hidden">
                        <img src={moment.creator.avatar} alt={moment.creator.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-wide">{moment.creator.name}</p>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{moment.creator.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-white/5 text-neural-accent hover:bg-white/10 font-mono text-[10px] tracking-widest uppercase py-1 px-3">
                      {moment.type}
                    </Badge>
                  </div>

                  <h2 className="text-4xl font-display italic text-white leading-tight mb-4 pr-12">
                    {moment.title}
                  </h2>
                  <div className="flex gap-2 mb-6">
                    {moment.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="glass-surface p-8 rounded-3xl border-neural-accent/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                         <TrendingUp className="w-20 h-20 text-neural-accent" />
                      </div>
                      <p className="text-[10px] font-mono text-neural-accent uppercase tracking-[0.4em] mb-2">{moment.metrics.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-display italic text-white tracking-tighter">{moment.metrics.val}</span>
                        <ArrowUpRight className="w-6 h-6 text-neural-accent" />
                      </div>
                    </div>
                  </div>

                  <p className="text-lg text-gray-400 font-light leading-relaxed max-w-lg">
                    {moment.description}
                  </p>

                  <div className="flex items-center gap-8 border-t border-white/5 pt-8">
                    <button 
                      onClick={() => handleLike(moment.id)}
                      className="flex items-center gap-3 group"
                    >
                      <div className={`p-3 rounded-full transition-all ${isLiked[moment.id] ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                        <Heart className={`w-6 h-6 ${isLiked[moment.id] ? 'fill-current' : ''}`} />
                      </div>
                      <span className={`text-sm font-bold ${isLiked[moment.id] ? 'text-red-500' : 'text-gray-400'}`}>{moment.likes + (isLiked[moment.id] ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center gap-3 group">
                      <div className="p-3 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-400">{moment.comments}</span>
                    </button>
                    <button className="flex items-center gap-3 group ml-auto">
                      <div className="p-3 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                        <Share2 className="w-6 h-6" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative side bar for verticality */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-40 w-1 flex flex-col gap-1 pr-4">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className={`flex-1 w-px ${i === idx ? 'bg-neural-accent' : 'bg-white/10'}`} />
                 ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
