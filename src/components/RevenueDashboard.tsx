import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  PieChart as PieChartIcon, 
  Activity,
  Zap,
  Check,
  ChevronRight,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'sonner';
import { Sparkles, RefreshCw } from 'lucide-react';

const TierVisual = ({ tierId, tierName }: { tierId: string; tierName: string }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [seed, setSeed] = useState(Math.random());

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    setTimeout(() => {
      setSeed(Math.random());
      setIsGenerating(false);
      toast.success(`AI visual synthesized for ${tierName}`);
    }, 1500);
  };

  const getTierConfig = () => {
    switch (tierId) {
      case 'starter':
        return {
          gradient: 'from-blue-600/10 to-[#C5A059]/5',
          lines: 'stroke-blue-400/20',
          accent: 'text-blue-400',
          icon: <Activity className="w-6 h-6" />,
          label: 'Starter Architecture'
        };
      case 'pro':
        return {
          gradient: 'from-[#C5A059]/20 to-purple-500/10',
          lines: 'stroke-[#C5A059]/30',
          accent: 'text-[#C5A059]',
          icon: <Brain className="w-8 h-8" />,
          label: 'Pro Orchestr8or'
        };
      case 'enterprise':
        return {
          gradient: 'from-purple-600/20 via-[#C5A059]/20 to-blue-600/20',
          lines: 'stroke-white/20',
          accent: 'text-white',
          icon: <Zap className="w-10 h-10" />,
          label: 'Enterprise Nexus'
        };
      default:
        return {
          gradient: 'from-gray-500/10 to-transparent',
          lines: 'stroke-gray-500/10',
          accent: 'text-gray-500',
          icon: <Check className="w-5 h-5" />,
          label: 'Baseline'
        };
    }
  };

  const config = getTierConfig();

  return (
    <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden border border-white/5 bg-[#050505] group transition-all hover:border-[#C5A059]/30">
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ${config.gradient}`} />
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Dynamic SVG Visuals */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {tierId === 'starter' && (
          <g className={config.lines}>
            {/* Architectural Blueprint Visual */}
            {[...Array(20)].map((_, i) => (
              <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="120" strokeWidth="0.05" opacity="0.15" />
            ))}
            {[...Array(12)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 10} x2="200" y2={i * 10} strokeWidth="0.05" opacity="0.15" />
            ))}
            {/* Structural Drawing Lines */}
            <motion.path 
              d="M20,20 L180,20 L180,100 L20,100 Z" 
              strokeWidth="0.5" fill="none" opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.path 
              d="M20,20 L180,100 M180,20 L20,100" 
              strokeWidth="0.2" opacity="0.1" 
            />
            <motion.rect 
              x="80" y="40" width="40" height="40" 
              strokeWidth="1" fill="none"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {/* Dimensions */}
            <g className="text-[4px] font-mono fill-current opacity-30">
               <text x="100" y="15" textAnchor="middle">CORE_PLAN_SCALE_1:100</text>
               <text x="185" y="60" className="rotate-90 origin-center">Z_AXIS_NODE</text>
            </g>
          </g>
        )}

        {tierId === 'pro' && (
          <g className={config.lines}>
            {/* Advanced Neural Orchestration Visual */}
            {[...Array(18)].map((_, i) => {
              const x = 100 + 60 * Math.cos(i * Math.PI / 9);
              const y = 60 + 40 * Math.sin(i * Math.PI / 9);
              return (
                <g key={i}>
                  <motion.circle 
                    cx={x} cy={y} r="1.5" 
                    fill="currentColor"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2 + Math.random(), repeat: Infinity }}
                  />
                  {[...Array(2)].map((_, j) => {
                    const nextX = 100 + 60 * Math.cos((i + j + 3) * Math.PI / 9);
                    const nextY = 60 + 40 * Math.sin((i + j + 3) * Math.PI / 9);
                    return (
                      <motion.line 
                        key={j} x1={x} y1={y} x2={nextX} y2={nextY} 
                        strokeWidth="0.15" opacity="0.1"
                        animate={{ opacity: [0.05, 0.2, 0.05] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    );
                  })}
                </g>
              );
            })}
            <motion.circle 
              cx="100" cy="60" r="25" 
              strokeWidth="0.5" fill="none" strokeDasharray="1 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            {/* Center Core */}
            <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <circle cx="100" cy="60" r="8" strokeWidth="2" fill="none" opacity="0.3" filter="url(#glow)" />
              <circle cx="100" cy="60" r="4" fill="currentColor" />
            </motion.g>
          </g>
        )}

        {tierId === 'enterprise' && (
          <g className={config.lines}>
            {/* Global Nexus Connectivity Visual */}
            <motion.circle cx="100" cy="60" r="50" strokeWidth="0.1" fill="none" opacity="0.2" />
            <motion.path 
              d="M50,60 Q100,10 150,60 Q100,110 50,60" 
              strokeWidth="0.2" fill="none" opacity="0.3"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            {[...Array(24)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 24;
              const x = 100 + 50 * Math.cos(angle);
              const y = 60 + 50 * Math.sin(angle);
              return (
                <line 
                  key={i} x1="100" y1="60" x2={x} y2={y} 
                  strokeWidth="0.05" opacity="0.05" 
                />
              );
            })}
            {/* Satellite Nodes */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 8 + seed;
              const x = 100 + 35 * Math.cos(angle);
              const y = 60 + 35 * Math.sin(angle);
              return (
                <motion.circle 
                  key={i} cx={x} cy={y} r="1" 
                  fill="white"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                />
              );
            })}
            <motion.path 
              d="M70,40 C90,30 110,30 130,40 S130,80 130,80" 
              strokeWidth="0.1" fill="none" opacity="0.1" strokeDasharray="2 2"
            />
          </g>
        )}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <RefreshCw className="w-6 h-6 text-[#C5A059] animate-spin" />
              <span className="text-[8px] font-mono text-[#C5A059] uppercase tracking-[3px] font-black">Neural Computing...</span>
            </motion.div>
          ) : (
            <motion.div
              key={seed}
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`flex flex-col items-center gap-1 ${config.accent}`}
            >
              <div className="relative">
                <div className="absolute inset-0 blur-2xl opacity-20 scale-150 bg-current" />
                {config.icon}
              </div>
              <span className="text-[7px] font-mono uppercase tracking-[2px] opacity-50">{config.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={handleRegenerate}
        className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#C5A059] hover:text-black z-20"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>

      <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
        <div className="flex gap-0.5">
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              className="w-1 h-3 bg-[#C5A059]/40 rounded-full"
              animate={{ height: [4, 12, 4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <span className="text-[8px] font-mono text-white/40 uppercase tracking-tighter">AI Vision Engine Output: {seed.toString().slice(2, 8)}</span>
      </div>
    </div>
  );
};

const REVENUE_DATA = [
  { month: 'Jan', mrr: 45000, expansion: 2000, churn: 1200 },
  { month: 'Feb', mrr: 52000, expansion: 4500, churn: 800 },
  { month: 'Mar', mrr: 58000, expansion: 3200, churn: 1500 },
  { month: 'Apr', mrr: 65000, expansion: 6100, churn: 950 },
  { month: 'May', mrr: 78000, expansion: 8400, churn: 1100 },
  { month: 'Jun', mrr: 89000, expansion: 10200, churn: 1300 },
  { month: 'Jul', mrr: 102450, expansion: 12500, churn: 1400 },
];

export default function RevenueDashboard() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<'all' | 'mrr' | 'expansion'>('all');

  useEffect(() => {
    fetch('/api/billing/tiers')
      .then(res => res.json())
      .then(setTiers);
  }, []);

  const handleSubscribe = async (tierId: string) => {
    toast.promise(
      fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId })
      }).then(res => res.json()),
      {
        loading: 'Initiating secure transaction...',
        success: (data) => {
          // In a real app: window.location.href = data.url;
          return `Simulation: Redirected to Stripe Checkout (${tierId})`;
        },
        error: 'Payment gateway error'
      }
    );
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] font-mono text-gray-400">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-white">${entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">REVENUE COMMAND</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
            Financial Liquidity • SaaS MRR Trajectory • Yield Analysis
          </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveMetric('all')}
            className={`px-4 text-[10px] font-mono uppercase tracking-widest h-8 rounded-lg ${activeMetric === 'all' ? 'bg-[#C5A059] text-black hover:bg-[#C5A059]' : 'text-gray-500'}`}
          >
            Aggregate
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveMetric('mrr')}
            className={`px-4 text-[10px] font-mono uppercase tracking-widest h-8 rounded-lg ${activeMetric === 'mrr' ? 'bg-[#C5A059] text-black hover:bg-[#C5A059]' : 'text-gray-500'}`}
          >
            Core MRR
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveMetric('expansion')}
            className={`px-4 text-[10px] font-mono uppercase tracking-widest h-8 rounded-lg ${activeMetric === 'expansion' ? 'bg-[#C5A059] text-black hover:bg-[#C5A059]' : 'text-gray-500'}`}
          >
            Expansion
          </Button>
        </div>
      </header>

      {/* Tiers / Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.id} className={`bg-[#0a0a0a] border-[#1a1a1a] relative overflow-hidden group ${tier.id === 'pro' ? 'border-[#C5A059]/40 shadow-[0_0_30px_rgba(197,160,89,0.05)]' : ''}`}>
            {tier.id === 'pro' && (
              <div className="absolute top-0 right-0 bg-[#C5A059] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                Most Popular
              </div>
            )}
            <CardHeader>
              <TierVisual tierId={tier.id} tierName={tier.name} />
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <CardDescription className="font-mono text-[#C5A059] text-lg">${tier.price}<span className="text-xs text-gray-500 tracking-normal capitalize"> / monthly</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {tier.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <Check className="w-3 h-3 text-[#C5A059]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleSubscribe(tier.id)}
                className={`w-full font-bold h-11 rounded-xl transition-all ${
                  tier.id === 'pro' || tier.id === 'enterprise' 
                  ? 'bg-[#C5A059] text-black hover:bg-[#A6864A] hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/5 text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                Scale with {tier.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Growth Chart */}
        <Card className="lg:col-span-2 bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C5A059]" />
                Growth Trajectory Matrix
              </CardTitle>
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-600">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#C5A059]" /> MRR</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Expansion</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpansion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="JetBrains Mono"
                    tick={{ dy: 10 }}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val/1000}k`}
                    fontFamily="JetBrains Mono"
                    tick={{ dx: -10 }}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area 
                    name="Core MRR"
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#C5A059" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMrr)" 
                    hide={activeMetric === 'expansion'}
                  />
                  <Area 
                    name="Expansion Revenue"
                    type="monotone" 
                    dataKey="expansion" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorExpansion)"
                    hide={activeMetric === 'mrr'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expansion Revenue / Conversion */}
        <div className="space-y-6">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-500 uppercase tracking-widest">Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3,842</div>
              <div className="flex items-center gap-1.5 mt-1 text-green-500 text-[10px] font-mono">
                <ArrowUpRight className="w-3 h-3" /> +28.5% <span className="text-gray-600 uppercase tracking-tighter ml-1">last 30 days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-gray-500 uppercase tracking-widest">Expansion Delta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_DATA.slice(-4)}>
                    <Bar dataKey="expansion" radius={[4, 4, 0, 0]}>
                      {REVENUE_DATA.slice(-4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? '#3b82f6' : '#1a1a1a'} />
                      ))}
                    </Bar>
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      content={<CustomChartTooltip />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-2xl font-bold">$12,500</div>
                <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-mono">
                  <Zap className="w-3 h-3" /> +12% <span className="text-gray-600 uppercase tracking-tighter ml-1">upsell</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-2xl bg-[#C5A059]/5 border border-[#C5A059]/20 relative group overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#C5A059] text-black">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-tighter">AI Upsell Engine</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-4 font-serif italic">
              "System identifies 142 Enterprise accounts currently under-utilized. Recommend immediate automated dispatch of Tier-3 conversion incentives to capture $7,100 additional MRR."
            </p>
            <Button variant="ghost" className="w-full text-[10px] uppercase font-mono text-[#C5A059] border border-[#C5A059]/20 hover:bg-[#C5A059]/10 transition-all hover:gap-3">
              Trigger Automation Loop <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
