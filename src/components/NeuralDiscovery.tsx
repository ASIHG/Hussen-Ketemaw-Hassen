import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
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
  Repeat,
  Sparkles,
  Check,
  X,
  Network,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAIInsight } from '../lib/gemini';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'sonner';

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
  mediaUrl?: string;
}

interface OpportunitySuggestion {
  id: string;
  title: string;
  sector: string;
  description: string;
  potential: string;
  risk: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  suggestedAt: any;
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
    color: '#D4AF37',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000'
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
    color: '#3b82f6',
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000'
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
    color: '#C5A059',
    mediaUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000'
  }
];

export default function NeuralDiscovery() {
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<OpportunitySuggestion[]>([]);
  const [showOpportunities, setShowOpportunities] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'suggested_opportunities'), orderBy('suggestedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OpportunitySuggestion));
      setSuggestions(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleLike = (id: string) => {
    setIsLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStrategicDiscovery = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    const toastId = toast.loading('Neural engine scanning global economic telemetry...');

    try {
      const prompt = `Analyze current global economic data, emerging markets, and technological shifts. Suggest 3 high-impact new 'investment clusters' that Afro Space Holding Group should consider. Format exactly with prefixes CLUSTER, SECTOR, DESC, POTENTIAL, RISK and use --- separator.`;
      const result = await getAIInsight(prompt);
      const blocks = result.split('---').filter(b => b.trim().includes('CLUSTER:'));

      for (const block of blocks) {
        const lines = block.trim().split('\n');
        const getVal = (prefix: string) => {
          const line = lines.find(l => l.toUpperCase().startsWith(prefix));
          return line ? line.split(':')[1]?.trim() : 'N/A';
        };
        
        await addDoc(collection(db, 'suggested_opportunities'), {
          title: getVal('CLUSTER'),
          sector: getVal('SECTOR'),
          description: getVal('DESC'),
          potential: getVal('POTENTIAL'),
          risk: getVal('RISK'),
          status: 'PENDING',
          suggestedAt: serverTimestamp()
        });
      }

      toast.success('Strategic opportunities identified.', { id: toastId });
      setShowOpportunities(true);
    } catch (error) {
       toast.error('Strategic scan interrupted.', { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative h-screen md:h-[calc(100vh-64px)] w-full overflow-hidden bg-black select-none">
      {/* Immersive Scroll Container */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {DUMMY_MOMENTS.map((moment) => (
          <section 
            key={moment.id}
            className="h-full w-full snap-start relative flex items-center justify-center overflow-hidden"
          >
            {/* Immersive Media / Background */}
            <div className="absolute inset-0 z-0">
               <img 
                 src={moment.mediaUrl} 
                 alt={moment.title} 
                 className="w-full h-full object-cover transform scale-105 blur-[2px] opacity-60 transition-transform duration-[10s] animate-pulse" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
               <div className="absolute inset-0 bg-radial-at-c from-transparent to-black/80" />
               <div className="neural-grid absolute inset-0 opacity-10" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end p-6 md:p-12 pb-24 md:pb-12 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-16">
                
                {/* Left Side: Info */}
                <div className="flex-1 space-y-6 max-w-2xl">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl border-2 border-[#C5A059] p-0.5 overflow-hidden shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                      <img src={moment.creator.avatar} alt={moment.creator.name} className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        {moment.creator.name}
                        <Check className="w-3 h-3 bg-[#C5A059] text-black rounded-full" />
                      </h3>
                      <p className="text-[10px] font-mono text-neural-accent uppercase tracking-widest">{moment.creator.role}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="text-4xl md:text-6xl font-display italic text-white leading-tight mb-4 drop-shadow-2xl">
                      {moment.title}
                    </h2>
                    <p className="text-gray-300 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none font-light">
                      {moment.description}
                    </p>
                  </motion.div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {moment.tags.map(tag => (
                      <Badge key={tag} className="bg-white/10 hover:bg-white/20 text-white font-mono text-[9px] border-white/10 tracking-widest px-3 py-1">
                        #{tag}
                      </Badge>
                    ))}
                    <Badge className="bg-neural-accent text-black font-black text-[9px] tracking-widest px-3 py-1 uppercase">
                      {moment.type}
                    </Badge>
                  </div>
                </div>

                {/* Right Side: Interaction Hub */}
                <div className="flex md:flex-col items-center justify-center gap-6 md:gap-8 order-first md:order-last">
                  <div className="flex flex-col items-center gap-1">
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleLike(moment.id)}
                      className={`p-4 md:p-5 rounded-full transition-all backdrop-blur-xl border ${
                        isLiked[moment.id] 
                        ? 'bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Heart className={`w-6 h-6 md:w-8 md:h-8 ${isLiked[moment.id] ? 'fill-white text-white' : 'text-white'}`} />
                    </motion.button>
                    <span className="text-xs font-bold text-white/80 tabular-nums">{moment.likes + (isLiked[moment.id] ? 1 : 0)}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button className="p-4 md:p-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
                      <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </button>
                    <span className="text-xs font-bold text-white/80 tabular-nums">{moment.comments}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button className="p-4 md:p-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
                      <Share2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button 
                      onClick={() => setShowOpportunities(!showOpportunities)}
                      className="p-4 md:p-5 rounded-full bg-neural-accent/20 border border-neural-accent/40 backdrop-blur-xl hover:bg-neural-accent/40 transition-all relative group"
                    >
                      <Brain className="w-6 h-6 md:w-8 md:h-8 text-neural-accent animate-pulse" />
                      {suggestions.some(s => s.status === 'PENDING') && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-bounce" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Metric Floating Card */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="absolute top-10 right-10 hidden lg:block"
            >
              <div className="glass-surface p-6 rounded-3xl border-[#C5A059]/30 border shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-neural-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <p className="text-[10px] font-mono text-neural-accent uppercase tracking-widest mb-2">{moment.metrics.label}</p>
                 <div className="flex items-center gap-3">
                   <h4 className="text-4xl font-display italic text-white">{moment.metrics.val}</h4>
                   <TrendingUp className="w-5 h-5 text-green-500" />
                 </div>
              </div>
            </motion.div>
          </section>
        ))}
      </div>

      {/* Navigation Overlay Hints */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-4 z-20 pointer-events-none opacity-40">
         <ChevronUp className="w-4 h-4 text-white animate-bounce" />
         <div className="h-20 w-px bg-white/10 mx-auto" />
         <ChevronDown className="w-4 h-4 text-white animate-bounce" />
      </div>

      {/* AI Discovery Button */}
      <div className="absolute top-8 left-8 z-30 flex items-center gap-4">
        <Button 
          onClick={handleStrategicDiscovery}
          disabled={isAnalyzing}
          className="bg-neural-accent hover:bg-white text-black font-black text-[10px] h-12 px-6 rounded-2xl tracking-widest gap-2"
        >
          {isAnalyzing ? <Repeat className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? 'SYNCHRONIZING TELEMETRY...' : 'INITIATE NEURAL SCAN'}
        </Button>
      </div>

      {/* Opportunities Overlay Drawer */}
      <AnimatePresence>
        {showOpportunities && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOpportunities(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-[#050505] border-l border-white/10 z-50 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display italic text-white">Neural Insights</h2>
                  <p className="text-[10px] font-mono text-neural-accent uppercase tracking-[0.3em]">Strategic Potential Matrix</p>
                </div>
                <button 
                  onClick={() => setShowOpportunities(false)}
                  className="p-3 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <ScrollArea className="h-[calc(100vh-200px)] px-2">
                <div className="space-y-6">
                  {suggestions.filter(s => s.status === 'PENDING').map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      layout
                      className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-neural-accent/50 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="text-[9px] border-neural-accent/30 text-neural-accent px-3 py-1">
                          {suggestion.sector}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              toast.success(`Strategy Authorized: ${suggestion.title}`);
                              updateDoc(doc(db, 'suggested_opportunities', suggestion.id), { status: 'ACCEPTED' });
                            }} 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full border-green-500/20 text-green-500"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={() => updateDoc(doc(db, 'suggested_opportunities', suggestion.id), { status: 'DECLINED' })}
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full border-red-500/20 text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{suggestion.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed mb-6">{suggestion.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                          <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">ROI Potential</p>
                          <p className="text-lg font-bold text-white">{suggestion.potential}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                          <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Volatility</p>
                          <p className="text-lg font-bold text-red-400">{suggestion.risk}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {suggestions.filter(s => s.status === 'PENDING').length === 0 && (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                         <Network className="w-8 h-8 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500 italic">No new signals captured.</p>
                      <button 
                        onClick={handleStrategicDiscovery}
                        className="mt-6 text-xs text-neural-accent underline underline-offset-4 font-bold"
                      >
                        RESCAN GLOBAL TELEMETRY
                      </button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
