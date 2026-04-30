import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Settings, 
  Plus,
  Rocket,
  ShieldCheck,
  BrainCircuit,
  DollarSign,
  Activity,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/src/lib/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Project {
  id: string;
  clusterId: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
}

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

export default function ClusterDetail({ clusterId, onBack }: { clusterId: string, onBack: () => void }) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const clusterName = t(`cluster_${clusterId}` as any);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?clusterId=${clusterId}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [clusterId]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2 h-auto text-gray-400 hover:text-white hover:bg-white/5">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-[10px] font-mono border-[#C5A059]/30 text-[#C5A059] uppercase tracking-[0.2em]">
            Cluster Console // 00{clusterId.length}
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">{clusterName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Performance Index" value="94.2" unit="%" trend="+4.1" icon={Activity} />
        <StatCard title="Cluster Revenue" value="1.2" unit="M" trend="+12.4" icon={DollarSign} />
        <StatCard title="Active Projects" value={projects.length} unit="" trend="+2" icon={Rocket} />
        <StatCard title="AI Optimization" value="88" unit="%" trend="+5.2" icon={BrainCircuit} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/10 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C5A059]" />
              Revenue Growth Engine
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs border-white/10">W</Button>
              <Button size="sm" variant="outline" className="text-xs border-[#C5A059] text-[#C5A059]">M</Button>
              <Button size="sm" variant="outline" className="text-xs border-white/10">Y</Button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#C5A059' }}
                />
                <Area type="monotone" dataKey="value" stroke="#C5A059" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
              Decision Core
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              <DecisionItem 
                title="Portfolio Optimization" 
                desc="AI Hub suggests reallocating 12% of construction assets to real estate development in Region A."
                impact="HIGH" 
              />
              <DecisionItem 
                title="Resource Scaling" 
                desc="Mining output projected to increase by 8% if autonomous transport is deployed on Site 4."
                impact="MEDIUM" 
              />
              <DecisionItem 
                title="Market Entry" 
                desc="Strategic opportunity detected in regional trade cluster. Evaluation required."
                impact="NEW" 
              />
              <Button className="w-full bg-[#C5A059] hover:bg-[#D4B475] text-black font-bold h-12 rounded-xl mt-4">
                Execute AI Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#C5A059]" />
              Strategic Projects
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Active Operations & Resource Allocation</CardDescription>
          </div>
          <Button size="sm" className="bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20 border border-[#C5A059]/20">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Accessing Cluster Datacenter...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl group hover:border-[#C5A059]/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white group-hover:text-[#C5A059] transition-colors">{project.name}</h4>
                    <StatusBadge status={project.status} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase">
                      <span className="text-gray-500">Allocation</span>
                      <span className="text-white">${(project.budget / 1000000).toFixed(1)}M</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-[#C5A059]">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          className="h-full bg-gradient-to-r from-[#C5A059] to-[#D4B475]" 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <div className="flex justify-center text-gray-700">
                <AlertCircle className="w-12 h-12" />
              </div>
              <div>
                <p className="text-white font-bold">No Active Projects</p>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Initiate strategic operations to begin tracking outcomes.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-gray-400">Initialize Project Protocol</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, unit, trend, icon: Icon }: any) {
  return (
    <Card className="bg-[#0a0a0a] border-white/10 p-6 hover:border-[#C5A059]/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-[#C5A059]/10 rounded-xl">
          <Icon className="w-5 h-5 text-[#C5A059]" />
        </div>
        <Badge variant="outline" className="border-none text-green-500 font-bold bg-green-500/10">
          {trend}%
        </Badge>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-2xl font-black text-white">{value}</h4>
          <span className="text-sm font-mono text-gray-400">{unit}</span>
        </div>
      </div>
    </Card>
  );
}

function DecisionItem({ title, desc, impact }: any) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 group hover:border-[#C5A059]/30 transition-all">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors">{title}</span>
        <Badge className={`text-[9px] font-mono ${
          impact === 'HIGH' ? 'bg-red-500/20 text-red-500' : 
          impact === 'NEW' ? 'bg-blue-500/20 text-blue-500' : 
          'bg-orange-500/20 text-orange-500'
        } border-none`}>{impact}</Badge>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed font-mono">{desc}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    'IN_PROGRESS': { label: 'In Progress', icon: Clock, color: 'text-blue-400 bg-blue-400/10' },
    'COMPLETED': { label: 'Completed', icon: CheckCircle2, color: 'text-green-400 bg-green-400/10' },
    'PLANNING': { label: 'Planning', icon: AlertCircle, color: 'text-amber-400 bg-amber-400/10' },
  };

  const config = configs[status] || configs['PLANNING'];
  const Icon = config.icon;

  return (
    <Badge className={`text-[9px] font-mono ${config.color} border-none flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label.toUpperCase()}
    </Badge>
  );
}

