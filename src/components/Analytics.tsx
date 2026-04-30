import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  PieChart as PieChartIcon,
  RefreshCw,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, users: 2400 },
  { name: 'Feb', revenue: 3000, users: 1398 },
  { name: 'Mar', revenue: 2000, users: 9800 },
  { name: 'Apr', revenue: 2780, users: 3908 },
  { name: 'May', revenue: 1890, users: 4800 },
  { name: 'Jun', revenue: 2390, users: 3800 },
  { name: 'Jul', revenue: 3490, users: 4300 },
];

const clusterShare = [
  { name: 'Mining', value: 45, color: '#C5A059' },
  { name: 'Real Estate', value: 25, color: '#10b981' },
  { name: 'Trade', value: 15, color: '#3b82f6' },
  { name: 'Other', value: 15, color: '#6b7280' },
];

interface Metrics {
  mrr: number;
  mrrTrend: string;
  users: number;
  usersTrend: string;
  conversion: number;
  conversionTrend: string;
  churn: number;
  churnTrend: string;
}

export default function Analytics({ user }: { user: any }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch('/api/analytics/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data));
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C5A059]/20 rounded-xl">
              <BarChart3 className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase">Corporate Analytics</h1>
          </div>
          <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">Global Performance Ledger // Level 4 Access</p>
        </div>
        <Badge variant="outline" className="border-white/10 px-4 py-2 font-mono text-xs text-gray-500">
          LAST_SYNC: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total MRR" 
          value={`$${(metrics.mrr / 1000000).toFixed(1)}M`} 
          trend={metrics.mrrTrend} 
          icon={DollarSign} 
        />
        <MetricCard 
          label="Active Node Users" 
          value={metrics.users.toLocaleString()} 
          trend={metrics.usersTrend} 
          icon={Users} 
        />
        <MetricCard 
          label="Conv. Velocity" 
          value={`${metrics.conversion}%`} 
          trend={metrics.conversionTrend} 
          icon={TrendingUp} 
        />
        <MetricCard 
          label="Churn Deflection" 
          value={`${metrics.churn}%`} 
          trend={metrics.churnTrend} 
          icon={Activity} 
          inverse 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0a0a0a] border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C5A059]" />
              Revenue Growth Vector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C5A059" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-500" />
              Cluster Yield Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clusterShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clusterShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {clusterShare.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-400 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-mono text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0a0a0a] border-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Regional Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RegionStat country="Ethiopia" users="12.4k" growth="+22%" roas="4.2x" />
            <RegionStat country="Nigeria" users="8.2k" growth="+15%" roas="3.8x" />
            <RegionStat country="Kenya" users="6.1k" growth="+18%" roas="3.5x" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, trend, icon: Icon, inverse = false }: any) {
  const isPositive = trend.startsWith('+');
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <Card className="bg-[#0a0a0a] border-white/5 hover:border-white/10 transition-all group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#C5A059]/10 transition-colors">
            <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" />
          </div>
          <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isGood ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isGood ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">{label}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function RegionStat({ country, users, growth, roas }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xl font-bold text-white">{country}</h4>
        <Badge className="bg-green-500/20 text-green-500 border-none font-mono text-[10px]">{growth}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-mono text-gray-600 uppercase">Users</p>
          <p className="text-lg font-bold text-white">{users}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-gray-600 uppercase">Ad ROAS</p>
          <p className="text-lg font-bold text-white">{roas}</p>
        </div>
      </div>
    </div>
  );
}
