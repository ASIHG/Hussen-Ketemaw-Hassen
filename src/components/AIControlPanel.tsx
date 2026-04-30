import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  MessageSquare,
  Network,
  Cpu,
  BarChart3,
  Globe,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/src/lib/LanguageContext';

interface AgentDecision {
  agent: string;
  instruction: string;
  decisions: string[];
  status: string;
}

const AgentCard = ({ id, data, color }: { id: string, data: AgentDecision, color: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${color} rounded-full`} />
      <Card className="bg-[#0a0a0a] border-white/5 pl-4 hover:border-white/20 transition-all">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className={`text-[10px] font-mono ${color.replace('bg-', 'text-')} border-none bg-white/5`}>
              {id} AGENT // ACTIVE
            </Badge>
            <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-gray-500 uppercase tracking-widest">
              {data.status}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-white">{data.agent}</CardTitle>
          <CardDescription className="text-xs font-mono text-gray-500">{data.instruction}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.decisions.map((decision, i) => (
            <div key={i} className="flex gap-3 items-start group">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${color} shrink-0 group-hover:scale-150 transition-transform`} />
              <p className="text-sm text-gray-400 group-hover:text-white transition-colors">{decision}</p>
            </div>
          ))}
          <Button variant="ghost" className="w-full mt-2 text-xs font-mono text-gray-500 hover:text-[#C5A059] hover:bg-[#C5A059]/5 border border-white/5">
            EXECUTE AGENT PROTOCOL <ChevronRight className="w-3 h-3 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AIControlPanel() {
  const { t } = useTranslation();
  const [decisions, setDecisions] = useState<Record<string, AgentDecision> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/ai/decisions');
      if (!res.ok) throw new Error('API_SYNC_FAILED');
      const data = await res.json();
      setDecisions(data);
    } catch (error) {
      console.error('Error fetching AI decisions:', error);
      setError('Failed to load AI decisions. Neural link unstable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BrainCircuit className="w-12 h-12 text-[#C5A059] opacity-50" />
        </motion.div>
        <p className="text-[#C5A059] font-mono text-sm animate-pulse tracking-widest uppercase">Synchronizing Neural Core...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 relative">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 max-w-md w-full"
          >
            <Card className="bg-red-950/20 border-red-500/30 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-white">{error}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={fetchDecisions}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 font-mono text-[10px] h-7"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" /> RETRY UPLINK
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setError(null)}
                      className="text-gray-400 hover:text-white h-7 text-[10px]"
                    >
                      DISMISS
                    </Button>
                  </div>
                </div>
                <button onClick={() => setError(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C5A059]/20 rounded-xl">
              <BrainCircuit className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none">AI COMMAND CORE</h1>
          </div>
          <p className="text-gray-500 font-mono text-sm tracking-wider uppercase">Multi-Agent Strategic Intelligence System</p>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Orchestrator Integrity</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div 
                  key={i} 
                  animate={{ opacity: [0.3, 1, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} 
                  className="w-3 h-1 bg-green-500 rounded-full" 
                />
              ))}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <Badge className="bg-[#C5A059]/20 text-[#C5A059] border-none font-mono text-[10px] py-1.5 px-3">
            AUTONOMOUS_MODE: ON
          </Badge>
        </div>
      </div>

      {!decisions ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 shrink-0">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 bg-red-500/5 rounded-full border border-red-500/10">
              <Zap className="w-12 h-12 text-red-500/50" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold">Neural Nodes Offline</p>
              <p className="text-gray-500 font-mono text-xs">System connection could not be established.</p>
            </div>
            <Button onClick={fetchDecisions} variant="outline" className="mt-4 border-[#C5A059] text-[#C5A059] group">
              <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Reset Connection
            </Button>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentCard id="CEO" data={decisions.CEO} color="bg-[#C5A059]" />
            <AgentCard id="CFO" data={decisions.CFO} color="bg-blue-500" />
            <AgentCard id="CTO" data={decisions.CTO} color="bg-purple-500" />
            <AgentCard id="GROWTH" data={decisions.GROWTH} color="bg-green-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#0a0a0a] border-white/5 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <Network className="w-5 h-5 text-[#C5A059]" />
                  Global Compute Synergy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/5 via-transparent to-transparent" />
                  <div className="flex items-center gap-8 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: i * 0.5 
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full border border-[#C5A059]/30 flex items-center justify-center bg-[#C5A059]/5">
                          <Cpu className="w-6 h-6 text-[#C5A059]" />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase">NODE_{i+1}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Target Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BenchmarkStat label="Revenue Target" current="124.5k" target="200k" unit="$" />
                <BenchmarkStat label="Growth Vector" current="12.4" target="15.0" unit="%" />
                <BenchmarkStat label="Conversion" current="4.2" target="5.0" unit="%" />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function BenchmarkStat({ label, current, target, unit }: any) {
  const percentage = (parseFloat(current) / parseFloat(target)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span className="text-indigo-400">Target: {unit}{target}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <h4 className="text-2xl font-black text-white">{unit}{current}</h4>
        <span className="text-xs font-mono text-gray-500">/ {unit}{target}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className="h-full bg-indigo-500"
        />
      </div>
    </div>
  );
}

function ImpactStat({ label, value, unit, trend }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span className="text-green-500">{trend}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <h4 className="text-2xl font-black text-white">{value}</h4>
        {unit && <span className="text-xs font-mono text-gray-500">{unit}</span>}
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${parseFloat(value)}%` }}
          className="h-full bg-[#C5A059]"
        />
      </div>
    </div>
  );
}
