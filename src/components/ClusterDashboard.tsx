import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  HardHat, 
  Pickaxe, 
  Factory, 
  Building2, 
  ShoppingCart, 
  Sprout,
  ArrowUpRight,
  Target,
  BarChart as BarChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/src/lib/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';

const clusters = [
  { id: 'service', name: 'cluster_service', desc: 'cluster_service_desc', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', revenue: 4500000, growth: 12.4 },
  { id: 'construction', name: 'cluster_construction', desc: 'cluster_construction_desc', icon: HardHat, color: 'text-orange-500', bg: 'bg-orange-500/10', revenue: 2800000, growth: 8.2 },
  { id: 'mining', name: 'cluster_mining', desc: 'cluster_mining_desc', icon: Pickaxe, color: 'text-stone-500', bg: 'bg-stone-500/10', revenue: 3200000, growth: 5.1 },
  { id: 'manufacturing', name: 'cluster_manufacturing', desc: 'cluster_manufacturing_desc', icon: Factory, color: 'text-purple-500', bg: 'bg-purple-500/10', revenue: 5100000, growth: 15.3 },
  { id: 'real_estate', name: 'cluster_real_estate', desc: 'cluster_real_estate_desc', icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', revenue: 6400000, growth: 22.0 },
  { id: 'trade', name: 'cluster_trade', desc: 'cluster_trade_desc', icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-500/10', revenue: 3900000, growth: 10.5 },
  { id: 'agriculture', name: 'cluster_agriculture', desc: 'cluster_agriculture_desc', icon: Sprout, color: 'text-green-500', bg: 'bg-green-500/10', revenue: 1200000, growth: 4.8 },
];

export default function ClusterDashboard({ onSelect }: { onSelect: (id: string) => void }) {
  const { t } = useTranslation();

  const chartData = clusters.map(c => ({
    name: t(c.name as any),
    revenue: c.revenue,
    growth: c.growth,
    color: c.color.replace('text-', '').replace('-500', '')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const efficiency = (80 + Math.random() * 15).toFixed(1);
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-2">
            <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <p className="text-white font-bold tracking-tight">{label}</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center gap-8">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Revenue</span>
              <span className="text-xs font-bold text-blue-400">${(payload[0].value / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center gap-8">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Growth</span>
              <span className="text-xs font-bold text-green-400">+{payload[1].value}%</span>
            </div>
            <div className="flex justify-between items-center gap-8 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Efficiency</span>
              <span className="text-xs font-bold text-[#C5A059]">{efficiency}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white">{t('clusters')}</h1>
        <p className="text-gray-500 font-mono text-sm tracking-wider uppercase">Strategic Multi-Cluster Overview</p>
      </div>

      {/* Cluster Performance Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C5A059]/10 rounded-lg">
                <BarChartIcon className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Cluster Performance Matrix</CardTitle>
                <CardDescription className="text-xs text-gray-500 font-mono">Revenue & Growth Optimization Analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    wrapperStyle={{ paddingTop: '0', paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#colorRevenue)`} />
                    ))}
                  </Bar>
                  <Bar 
                    yAxisId="right"
                    dataKey="growth" 
                    name="Growth %" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clusters.map((cluster, index) => (
          <motion.div
            key={cluster.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="bg-[#0a0a0a] border-white/10 hover:border-[#C5A059]/50 transition-all cursor-pointer group group-hover:shadow-[0_0_30px_rgba(197,160,89,0.1)]"
              onClick={() => onSelect(cluster.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className={`p-3 rounded-2xl ${cluster.bg}`}>
                  <cluster.icon className={`w-6 h-6 ${cluster.color}`} />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-gray-500 uppercase tracking-widest">
                  Active
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-1 mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#C5A059] transition-colors">
                    {t(cluster.name as any)}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono line-clamp-2 min-h-[30px]">
                    {t(cluster.desc as any)}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-tighter">
                    <Target className="w-3 h-3" />
                    Strategic Asset
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Revenue</p>
                      <p className="text-xl font-bold text-white">${(cluster.revenue / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#C5A059] uppercase tracking-widest mb-1">Growth</p>
                      <div className="flex items-center justify-end text-green-500 font-bold">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        {cluster.growth}%
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={88} className="h-1 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
