import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Target, 
  Users, 
  Activity,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Cpu,
  Layers,
  Globe,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface AIDecision {
  agent: string;
  timestamp: string;
  decision: any;
  meta: {
    engine: string;
    confidence: number;
  };
}

import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AICEOControl() {
  const [activeAgent, setActiveAgent] = useState<'CEO' | 'CFO' | 'CTO' | 'Growth'>('CEO');
  const [decision, setDecision] = useState<AIDecision | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDecision = async (agent: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, context: 'Strategic Q3 Planning' })
      });
      const data = await res.json();
      setDecision(data);

      // Persist to Firestore for global system logs
      await addDoc(collection(db, 'ai_decisions'), {
        agent: data.agent,
        decision: data.decision,
        confidence: data.meta.confidence,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      toast.error('Failed to communicate with AI core');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecision(activeAgent);
  }, [activeAgent]);

  const agents = [
    { 
      id: 'CEO', 
      label: 'Strategy Core', 
      icon: Target, 
      color: 'text-[#C5A059]', 
      desc: 'Executive decisions & overall strategy.',
      subProcesses: [
        { id: 'market_research', label: 'Initiate Market Research', icon: Globe },
        { id: 'partnership_dev', label: 'Partner Outreach Alpha', icon: Users },
      ]
    },
    { 
      id: 'CFO', 
      label: 'Revenue Engine', 
      icon: TrendingUp, 
      color: 'text-green-400', 
      desc: 'Financial optimization & yield analysis.',
      subProcesses: [
        { id: 'revenue_model', label: 'Run Revenue Projection', icon: BarChart3 },
        { id: 'cost_audit', label: 'Cloud Cost Optimization', icon: ShieldCheck },
      ]
    },
    { 
      id: 'CTO', 
      label: 'Tech Command', 
      icon: Cpu, 
      color: 'text-blue-400', 
      desc: 'Infrastructure scaling & security.',
      subProcesses: [
        { id: 'k8s_scale', label: 'Scale K8s Clusters', icon: Layers },
        { id: 'security_sweep', icon: ShieldCheck, label: 'Run Vulnerability Scan' },
      ]
    },
    { 
      id: 'Growth', 
      label: 'Velocity Unit', 
      icon: Zap, 
      color: 'text-purple-400', 
      desc: 'Acquisition & market retention.',
      subProcesses: [
        { id: 'ads_optimizer', label: 'Rebalance Ad Spend', icon: Sparkles },
        { id: 'seo_indexing', label: 'Trigger SEO Re-index', icon: Search },
      ]
    },
  ];

  const triggerSubProcess = async (subProcessId: string, label: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Orchestrating ${label}...`,
        success: () => {
          // Log to system
          addDoc(collection(db, 'ai_decisions'), {
            agent: activeAgent,
            decision: { action: `Manual trigger: ${label}` },
            confidence: 1.0,
            timestamp: serverTimestamp()
          });
          return `${label} successfully initiated.`;
        },
        error: 'Engine timeout'
      }
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI CEO CONTROL CENTER</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
            Autonomous Strategic Node • Multi-Agent Orchestration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20 font-mono">NEURAL STATUS: OPTIMAL</Badge>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-gray-800 flex items-center justify-center">
                <BrainCircuit className="w-3 h-3 text-[#C5A059]" />
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Selection Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id as any)}
              className={`w-full p-4 rounded-2xl border transition-all duration-300 text-left group ${
                activeAgent === agent.id 
                ? 'bg-[#C5A059]/10 border-[#C5A059]/30' 
                : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${activeAgent === agent.id ? 'bg-[#C5A059] text-black' : 'bg-white/5 text-gray-400'}`}>
                  <agent.icon className="w-5 h-5 flex-shrink-0" />
                </div>
                <span className={`font-bold ${activeAgent === agent.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {agent.label}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono leading-tight uppercase tracking-tighter">
                {agent.desc}
              </p>
            </button>
          ))}
          
          <div className="p-4 rounded-2xl border border-dashed border-[#C5A059]/20 bg-[#C5A059]/5 mt-6">
            <h4 className="text-[10px] font-mono text-[#C5A059] uppercase mb-2">System Health</h4>
            <div className="space-y-2">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: '94%' }} className="h-full bg-[#C5A059]" />
              </div>
              <p className="text-[9px] text-gray-600 font-mono">CONFIDENCE THRESHOLD: 0.94</p>
            </div>
          </div>
        </div>

        {/* Main Decision Content */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[400px] flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] rounded-3xl border border-[#1a1a1a]"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#C5A059] animate-pulse" />
                </div>
                <p className="font-mono text-xs text-gray-500 animate-pulse">SYNCHRONIZING WITH {activeAgent} AGENT...</p>
              </motion.div>
            ) : decision && (
              <motion.div
                key={activeAgent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-[#0a0a0a] border-[#1a1a1a] overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 blur-[80px] pointer-events-none group-hover:bg-[#C5A059]/10 transition-all" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono border-[#C5A059]/20 text-[#C5A059]">
                          {decision.agent} v2.0.4
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono border-green-500/20 text-green-500">
                          Execution Ready
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">Autonomous Decision Matrix</CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-600 font-mono">TIMESTAMP</p>
                      <p className="text-xs font-mono">{new Date(decision.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
                      <p className="text-xl font-medium leading-relaxed italic text-gray-200">
                        "{Object.values(decision.decision)[0]}"
                      </p>
                      
                      {/* Integrated Action Extraction */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {agents.flatMap(a => a.subProcesses).filter(sub => 
                          Object.values(decision.decision).some((val: any) => 
                            typeof val === 'string' && val.toLowerCase().includes(sub.label.toLowerCase().split(' ').slice(-1)[0].toLowerCase())
                          )
                        ).map(sub => (
                          <Button
                            key={`action-${sub.id}`}
                            size="sm"
                            variant="secondary"
                            onClick={() => triggerSubProcess(sub.id, sub.label)}
                            className="bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/30 hover:bg-[#C5A059] hover:text-black h-7 text-[10px] gap-1.5"
                          >
                            <sub.icon className="w-3 h-3" />
                            ACTIVATE: {sub.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(decision.decision).map(([key, val]: any, i) => {
                        if (i === 0) return null; // Skip main highlight
                        return (
                          <div key={key} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                            <p className="text-[10px] text-gray-600 font-mono uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-bold text-lg text-white">
                              {typeof val === 'number' ? `$${val.toLocaleString()}` : Array.isArray(val) ? val.join(', ') : val}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2 bg-[#0a0a0a] border-[#1a1a1a]">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        Sub-Process Orchestration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {agents.find(a => a.id === activeAgent)?.subProcesses.map((sub: any) => (
                          <Button
                            key={sub.id}
                            variant="outline"
                            onClick={() => triggerSubProcess(sub.id, sub.label)}
                            className="h-14 bg-white/[0.02] border-white/5 hover:bg-white/10 hover:border-[#C5A059]/30 flex items-center justify-start gap-3 px-4 group"
                          >
                            <div className="p-2 rounded-lg bg-white/5 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all">
                              <sub.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{sub.label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#C5A059]/5 border-[#C5A059]/20 flex flex-col items-center justify-center text-center p-6 gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059] flex items-center justify-center">
                      <Zap className="text-black w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Execute Strategy</h4>
                      <p className="text-[10px] text-gray-500 font-mono uppercase">Trigger autonomous operations based on current matrix</p>
                    </div>
                    <Button className="w-full bg-[#C5A059] hover:bg-[#A6864A] text-black font-bold h-12 rounded-xl">
                      Deploy Decision
                    </Button>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
