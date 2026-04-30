import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  BrainCircuit, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Zap,
  Activity,
  ShieldCheck,
  Briefcase,
  HardHat,
  Pickaxe,
  Factory,
  Building2,
  ShoppingCart,
  Sprout,
  Terminal,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRealtime } from '@/src/lib/socket';
import { getDashboard } from '@/src/services/api';
import { getGrowthStatus, trackEvent } from '@/src/services/growth';
import { Logo } from './Logo';

const data = [
  { name: 'Jan', value: 4000, grow: 2400 },
  { name: 'Feb', value: 3000, grow: 1398 },
  { name: 'Mar', value: 2000, grow: 9800 },
  { name: 'Apr', value: 2780, grow: 3908 },
  { name: 'May', value: 1890, grow: 4800 },
  { name: 'Jun', value: 2390, grow: 3800 },
  { name: 'Jul', value: 3490, grow: 4300 },
];

export default function Dashboard({ user }: { user: any }) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any>(null);
  const [aiEvents, setAiEvents] = useState<any[]>([]);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    getDashboard().then(setDashboardData).catch(console.error);
    getGrowthStatus().then(setGrowthData).catch(console.error);
    trackEvent('dashboard_view', { userId: user.uid });

    const cleanup = useRealtime((update) => {
      setAiEvents((prev) => [update, ...prev].slice(0, 5));
      getDashboard().then(setDashboardData);
      getGrowthStatus().then(setGrowthData);
    });

    return cleanup;
  }, []);

  const isZeroState = !dashboardData || (
    parseFloat(String(dashboardData?.revenue).replace(/[^0-9.]/g, '')) === 0 && 
    parseInt(dashboardData?.users || '0') === 0
  );

  if (isZeroState) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 pb-20">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-20 bg-neural-accent rounded-full animate-pulse" />
          <Logo className="w-48 h-48 relative z-10" />
        </div>
        
        <div className="text-center space-y-4 max-w-2xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-surface border-neural-accent/20"
          >
            <ShieldCheck className="w-4 h-4 text-neural-accent" />
            <span className="text-[10px] font-mono text-neural-accent uppercase tracking-[0.4em]">Node Connection Ready</span>
          </motion.div>
          
          <h1 className="text-5xl lg:text-7xl font-display italic text-white tracking-tight leading-none">
            Neural <span className="text-neural-accent italic decoration-1 underline-offset-8">Zero</span>
          </h1>
          
          <p className="text-lg text-gray-500 font-light leading-relaxed">
            The orchestrator is online. Your global footprint is currently at Zero.
            This is the point of origin. Initialize your first strategic hub to begin expansion.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-6">
          <Button 
            className="flex-1 bg-neural-accent hover:bg-white text-black font-black h-16 rounded-2xl text-lg transition-all active:scale-95 shadow-xl shadow-neural-accent/10"
            onClick={() => window.location.href = '#/clusters'} // Hypothetical navigation
          >
            CREATE FIRST HUB
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 glass-surface border-white/10 text-white font-bold h-16 rounded-2xl text-lg hover:bg-white/5"
          >
            VIEW BLUEPRINTS
          </Button>
        </div>

        <div className="pt-12 grid grid-cols-3 gap-12 opacity-30">
          <div className="flex flex-col items-center gap-2">
            <Globe className="w-6 h-6" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Global Sync</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-neural-accent">
            <Zap className="w-6 h-6" />
            <span className="text-[9px] font-mono uppercase tracking-widest ">Neural Alpha</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-6 h-6" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Pure Data</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-12 pb-32">
      <div className="neural-atmosphere" />
      
      {/* High-End Hero Header */}
      <section className="relative overflow-hidden rounded-[3.5rem] p-12 lg:p-20 glass-surface border-white/5 shadow-2xl">
        <div className="neural-grid absolute inset-0 opacity-5" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neural-accent/5 blur-[150px] rounded-full -mr-64 -mt-64" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
          <div className="space-y-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <Badge variant="outline" className="px-5 py-2 border-neural-accent/30 text-neural-accent font-mono text-[10px] tracking-[0.5em] uppercase bg-neural-accent/5 rounded-full">
                Protocol: NEURALIS-ORCHESTRA
              </Badge>
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-6xl lg:text-8xl font-display italic tracking-tighter text-white leading-none">
                Global <span className="text-neural-accent font-sans not-italic font-black tracking-normal">HUB</span>
              </h1>
              <p className="text-lg text-gray-400 font-light max-w-xl">
                Real-time neural synchronization of global assets and strategic revenue nodes.
              </p>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em]">Status Indicator</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }} 
                      className="w-1.5 h-4 bg-neural-accent rounded-full" 
                    />
                  ))}
                </div>
              </div>
              <Separator orientation="vertical" className="h-10 bg-white/10" />
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                Nodes Active: 24 // Latency: 12ms // Auth: Root
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 group">
            <div className="glass-surface p-8 rounded-[2.5rem] border-neural-accent/20 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-500">
               <Globe className="w-8 h-8 text-neural-accent animate-spin-slow" />
               <span className="text-[10px] font-mono text-neural-accent tracking-widest uppercase">Global View</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Global Liquidity', value: dashboardData?.revenue || '$0', change: '+12.5%', icon: Wallet, color: '#C5A059' },
          { title: 'Neural Nodes', value: dashboardData?.users || '0', change: '+8.2%', icon: Users, color: '#3b82f6' },
          { title: 'Alpha Output', value: dashboardData?.aiStatus || 'Active', change: 'Optimal', icon: BrainCircuit, color: '#10b981' },
          { title: 'Processing Load', value: '42.8%', change: 'Steady', icon: Cpu, color: '#ef4444' }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className="glass-surface hover:border-neural-accent/40 transition-all duration-500 group overflow-hidden relative rounded-[2rem]">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-700">
                <stat.icon className="w-16 h-16" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-display italic text-white mb-2">{stat.value}</div>
                <div className={`text-[10px] font-mono flex items-center tracking-widest ${stat.change.startsWith('+') ? 'text-green-500' : 'text-neural-accent'}`}>
                  <Zap className="w-3 h-3 mr-2" />
                  {stat.change} // REAL-TIME SYNC
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 bg-[#0a0a0a] border-[#1a1a1a] overflow-hidden relative">
          <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Growth Architecture</CardTitle>
              <p className="text-sm text-gray-500">Global SaaS expansion metrics</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> REVENUE
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> PROJECTION
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" />
                <Area type="monotone" dataKey="grow" stroke="#3b82f6" fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insight Sidebar (Real-time) */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-400">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              <CardTitle className="text-xl">AI Engine Live</CardTitle>
            </div>
            <p className="text-sm text-gray-500 uppercase font-mono tracking-tighter text-[10px]">Real-time Decision Stream</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex-1 space-y-3">
                <AnimatePresence mode="popLayout">
                  {aiEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 border border-dashed border-[#1a1a1a] rounded-xl opacity-50">
                      <Terminal className="w-8 h-8 mb-2" />
                      <p className="text-[10px] uppercase font-mono">Waiting for AI events...</p>
                    </div>
                  ) : (
                    aiEvents.map((event, idx) => (
                      <motion.div
                        key={event.timestamp}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 shadow-lg"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-[11px] font-bold text-indigo-300 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-indigo-500" /> {event.action}
                          </h4>
                          <span className="text-[9px] font-mono text-gray-600">{new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400">Projected Impact</p>
                          <span className="text-[10px] font-mono text-green-400 bg-green-400/10 px-1.5 rounded">{event.impact}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
              
              <div className="pt-4 border-t border-[#1a1a1a] mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Worker Health</span>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] animate-pulse">OPTIMIZED</Badge>
                </div>
                <Button variant="outline" className="w-full border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500 hover:text-white transition-all text-indigo-400">
                  Configure Constraints
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Infrastructure Nodes Table */}
      <Card className="bg-[#050505] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-xl">Infrastructure Mesh</CardTitle>
          <p className="text-sm text-gray-500">Connected AWS Elastic Container Service (ECS) nodes</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-left">
                  <th className="pb-4 pt-2 font-mono text-[10px] uppercase text-gray-500 tracking-widest px-4">Node ID</th>
                  <th className="pb-4 pt-2 font-mono text-[10px] uppercase text-gray-500 tracking-widest px-4">Region</th>
                  <th className="pb-4 pt-2 font-mono text-[10px] uppercase text-gray-500 tracking-widest px-4">Type</th>
                  <th className="pb-4 pt-2 font-mono text-[10px] uppercase text-gray-500 tracking-widest px-4 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'node-us-east-1a', region: 'us-east-1', type: 't3.xlarge', load: '42%' },
                  { id: 'node-eu-west-1c', region: 'eu-west-1', type: 'c5.2xlarge', load: '18%' },
                  { id: 'node-ap-south-1a', region: 'ap-south-1', type: 'm5.large', load: '67%' },
                  { id: 'node-local-edge', region: 'edge', type: 'dedicated', load: '4%' },
                ].map((node) => (
                  <tr key={node.id} className="border-b border-[#0f0f0f] hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs text-indigo-400">{node.id}</td>
                    <td className="py-4 px-4 text-xs text-gray-400">{node.region}</td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-500">{node.type}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs font-mono">{node.load}</span>
                        <div className="w-20 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: node.load }}
                            className="h-full bg-indigo-500"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Autonomous Growth Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-gray-500">AfroSpace Autonomous Growth Metrics</h3>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono text-[10px]">REVENUE_REINVESTMENT: ENABLED</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Conversion Rate', value: `${(growthData?.conversion * 100 || 0).toFixed(2)}%`, sub: 'Target: >5%', color: 'indigo' },
            { label: 'Monthly Churn', value: `${(growthData?.churn * 100 || 0).toFixed(2)}%`, sub: 'Target: <4%', color: 'red' },
            { label: 'ROAS (Ad Spend)', value: `${growthData?.roas || 0}x`, sub: 'Current Scaling', color: 'green' }
          ].map((m) => (
            <div key={m.label} className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 relative group overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-${m.color}-500/50`} />
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
              <div className="text-3xl font-bold text-white mb-1">{m.value}</div>
              <p className="text-[10px] text-gray-500">{m.sub}</p>
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className={`h-full bg-${m.color}-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


