import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  TrendingUp, 
  Target, 
  Users, 
  Zap, 
  ChevronRight, 
  AlertCircle,
  BarChart3,
  RefreshCw,
  Cpu,
  Share2,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { trackEvent } from '../lib/events';

interface GrowthInsight {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'ACQUISITION' | 'CONVERSION' | 'RETENTION' | 'VIRALITY';
  status: string;
}

const InsightCard: React.FC<{ insight: GrowthInsight }> = ({ insight }) => {
  const priorityColor = {
    CRITICAL: 'text-red-500 border-red-500/20 bg-red-500/5',
    HIGH: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    MEDIUM: 'text-[#C5A059] border-[#C5A059]/20 bg-[#C5A059]/5',
    LOW: 'text-blue-500 border-blue-500/20 bg-blue-500/5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-[#0a0a0a] border-white/5 hover:border-white/10 transition-all">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className={`text-[10px] font-mono tracking-widest ${priorityColor[insight.priority]}`}>
              {insight.priority} // {insight.category}
            </Badge>
            <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-gray-500">
              {insight.status}
            </Badge>
          </div>
          <CardTitle className="text-lg font-bold text-white">{insight.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">{insight.description}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C5A059] text-black hover:bg-[#C5A059]/80 font-bold text-xs h-8 px-4 rounded-lg">
              APPROVE & EXECUTE
            </Button>
            <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white h-8 text-xs px-4 rounded-lg">
              VIEW ANALYSIS
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AgentStatusCard = ({ title, status, metric, icon: Icon, color, desc }: any) => (
  <Card className="bg-[#0a0a0a] border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 pointer-events-none transition-all group-hover:opacity-20 ${color.replace('text-', 'bg-')}`} />
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center mb-2">
        <Badge variant="outline" className={`text-[9px] font-mono border-none bg-white/5 ${color}`}>{status}</Badge>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <CardTitle className="text-sm font-black text-white uppercase tracking-tight">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-black text-white mb-2">{metric}</div>
      <p className="text-[10px] text-gray-500 leading-tight font-medium">{desc}</p>
    </CardContent>
  </Card>
);

export default function GrowthEngine() {
  const [insights, setInsights] = useState<GrowthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/growth/insights')
      .then(res => res.json())
      .then(data => {
        setInsights(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C5A059]/20 rounded-xl">
            <Rocket className="w-8 h-8 text-[#C5A059]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none">Growth Engine</h1>
            <Badge variant="outline" className="w-fit mt-1 border-[#C5A059]/30 text-[#C5A059] px-2 py-0 text-[10px] font-mono bg-[#C5A059]/5">
              AUTONOMOUS_OPTIMIZATION_ACTIVE
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AgentStatusCard 
          title="Ads Engine" 
          status="RUNNING" 
          metric="4.2x ROAS" 
          icon={TrendingUp} 
          color="text-blue-500" 
          desc="Meta + Google Ads automation active. Adjusting benchmarks every 6 hrs."
        />
        <AgentStatusCard 
          title="Email Engine" 
          status="OPTIMIZING" 
          metric="24% CTR" 
          icon={Zap} 
          color="text-purple-500" 
          desc="Personalized sequences active for 12 cohorts. AI-subject line A/B testing live."
        />
        <AgentStatusCard 
          title="Referral Loop" 
          status="ACTIVE" 
          metric="1.8x Growth" 
          icon={Share2} 
          color="text-[#C5A059]" 
          desc="Viral coefficient exceeding target. Dynamic reward structures being deployed."
        />
        <AgentStatusCard 
          title="Brain Orchestrator" 
          status="SYNCED" 
          metric="High Conf." 
          icon={Cpu} 
          color="text-green-500" 
          desc="Meta-decision layer synchronizing all acquisition channels for max LTV."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0a0a0a] border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#C5A059]" />
              Strategic Brain Actions
            </CardTitle>
            <CardDescription className="text-xs font-mono text-gray-500 uppercase tracking-widest">REAL-TIME DECISION QUEUE</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin" />
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Processing Data Streams...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#0a0a0a] border-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Growth KPI Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500">
                  <span>Activation Rate</span>
                  <span className="text-green-500">+12.4%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500">
                  <span>Viral Coefficient</span>
                  <span className="text-[#C5A059]">1.2x Target</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    className="h-full bg-[#C5A059]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#C5A059]/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/10 to-transparent pointer-events-none" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-[#C5A059]/20 rounded-lg">
                  <Share2 className="w-4 h-4 text-[#C5A059]" />
                </div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-[0.3em]">VIRALITY CORE</span>
              </div>
              <CardTitle className="text-lg font-bold">Referral Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed">
                AI has identified high-LTV cohorts in Nigeria. Ready to deploy hyper-targeted referral credits.
              </p>
              <Button className="w-full bg-[#C5A059] text-black font-bold h-10 rounded-xl group-hover:scale-[1.02] transition-transform">
                ACTIVATE VIRAL LOOP
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0a0a] border-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Growth Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Meta Ads Manager', status: 'SYNCED', spend: '$12.4k' },
                  { name: 'Google Ads Console', status: 'SYNCED', spend: '$8.2k' },
                  { name: 'Resend Email API', status: 'ACTIVE', volume: '124k' },
                ].map((channel, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{channel.name}</span>
                      <span className="text-[8px] font-mono text-gray-600 uppercase">Status: {channel.status}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-400 border-none">
                      {channel.spend || channel.volume}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => {
                  toast.success('Channel Synchronization Initiated');
                  trackEvent('channel_sync_start' as any);
                }}
                variant="outline" 
                className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-mono rounded-xl"
              >
                SYNC ALL CHANNELS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
