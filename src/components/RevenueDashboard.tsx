import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  ShieldCheck
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
