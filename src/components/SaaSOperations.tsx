import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Zap,
  Globe,
  PieChart as PieChartIcon,
  MousePointer2,
  Lock,
  Brain,
  Trash2,
  AlertTriangle,
  RefreshCcw,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, updateDoc, collection, getDocs, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { toast } from 'sonner';
import { trackEvent } from '@/src/lib/events';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, users: 1200 },
  { month: 'Feb', revenue: 52000, users: 1450 },
  { month: 'Mar', revenue: 48000, users: 1600 },
  { month: 'Apr', revenue: 61000, users: 1900 },
  { month: 'May', revenue: 75000, users: 2400 },
  { month: 'Jun', revenue: 89000, users: 3100 },
  { month: 'Jul', revenue: 102000, users: 3800 },
];

const SUBSCRIPTION_DATA = [
  { plan: 'Free', count: 1200, color: '#C5A059' },
  { plan: 'Pro', count: 850, color: '#3b82f6' },
  { plan: 'Enterprise', count: 120, color: '#10b981' },
];

interface SaaSOperationsProps {
  user: any;
  mode?: 'full' | 'upgrade';
}

export default function SaaSOperations({ user, mode = 'full' }: SaaSOperationsProps) {
  const [tiers, setTiers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isResetting, setIsResetting] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch('/api/billing/tiers')
      .then(async res => {
        if (!res.ok) throw new Error('CORE_BILLING_UNREACHABLE');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('MALFORMED_TIER_DATA');
        setTiers(data);
      })
      .catch(error => {
        console.error('Tier fetch failed:', error);
        toast.error('Failed to synchronize pricing tiers from central command');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async (tierId: string) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const toastId = toast.loading(`Initiating ${tierId.toUpperCase()} protocol...`);
    
    try {
      await updateDoc(userRef, { plan: tierId });
      toast.success(`SYSTEM UPDATED: ${tierId.toUpperCase()} ARCHITECTURE ACTIVE`, { id: toastId });
      trackEvent('subscription_upgrade' as any, { plan: tierId });
      
      // Clear cache and forced re-sync
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error('Initialization failed: Privilege escalation denied', { id: toastId });
    }
  };

  const handleGlobalZero = async () => {
    if (user.role !== 'CEO') {
      toast.error('Privilege Insufficient: Only CEO can trigger Zero Protocol');
      return;
    }

    const confirm = window.confirm('DANGER: This will wipe all your strategic data and reset your ledger to zero. This action is irreversible. Proceed?');
    if (!confirm) return;

    setIsResetting(true);
    const toastId = toast.loading('Initiating Global Zero Protocol...');

    try {
      const batch = writeBatch(db);
      
      // Clear Investments
      const invQuery = query(collection(db, 'investments'), where('ownerId', '==', user.uid));
      const invSnap = await getDocs(invQuery);
      invSnap.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
      
      toast.success('SYSTEM ZEROED: Neural matrix reset to baseline architecture', { id: toastId });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Reset failed:', error);
      toast.error('Zero Protocol failed: Integrity check rejection', { id: toastId });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {mode === 'upgrade' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="p-4 bg-[#C5A059]/10 rounded-full border border-[#C5A059]/20 animate-pulse">
            <Lock className="w-12 h-12 text-[#C5A059]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Access Restricted</h1>
            <p className="text-gray-500 max-w-md mx-auto text-sm font-mono">This neural module requires a Pro-tier architecture. Upgrade your account to activate strategic AI oversight.</p>
          </div>
        </div>
      ) : (
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">SaaS Operations</h1>
          <p className="text-[#C5A059] font-mono text-xs uppercase tracking-widest mt-1">
            Strategic Monitoring & Performance Matrix
          </p>
        </header>
      )}

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total MRR', value: '$102,450', growth: '+14.2%', icon: CreditCard, color: 'text-[#C5A059]' },
          { label: 'Active Users', value: '3,842', growth: '+28.5%', icon: Users, color: 'text-blue-400' },
          { label: 'Sub. Growth', value: '18.1%', growth: '+2.4%', icon: TrendingUp, color: 'text-green-400' },
          { label: 'LTV/CAC', value: '4.2x', growth: 'Optimal', icon: Activity, color: 'text-purple-400' },
        ].map((metric, i) => (
          <Card key={i} className="bg-[#0a0a0a] border-[#1a1a1a] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 pointer-events-none transition-all group-hover:opacity-20 ${metric.color.replace('text-', 'bg-')}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{metric.label}</CardTitle>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {metric.growth.startsWith('+') ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <Zap className="w-3 h-3 text-blue-500" />
                )}
                <span className={`text-[10px] font-mono ${metric.growth.startsWith('+') ? 'text-green-500' : 'text-blue-500'}`}>
                  {metric.growth}
                </span>
                <span className="text-[8px] text-gray-600 uppercase">vs last cycle</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <Card className="lg:col-span-2 bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C5A059]" />
              Revenue Growth Trajectory
            </CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase">Strategic accumulation metrics over 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                    fontFamily="JetBrains Mono"
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    fontFamily="JetBrains Mono"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                    itemStyle={{ color: '#C5A059', fontSize: '12px' }}
                    labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                    cursor={{ stroke: '#C5A059', strokeWidth: 1, strokeDasharray: '4 4' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'REVENUE']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C5A059" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Acquisition Split */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Segmentation Matrix
            </CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase">Acquisition by plan type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[220px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUBSCRIPTION_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="plan" 
                    type="category" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                    fontFamily="JetBrains Mono"
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                    formatter={(value: any) => [value, 'USERS']}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]} 
                    fill="#C5A059" 
                    barSize={20}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-gray-500 uppercase">Retention Rate</span>
                <span className="text-green-500">92.4%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92.4%' }}
                  className="bg-green-500/50 h-full"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono mt-4">
                <span className="text-gray-500 uppercase">Avg. Expansion MRR</span>
                <span className="text-blue-500">12.5%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '12.5%' }}
                  className="bg-blue-500/50 h-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C5A059]" />
              Cluster Energy & Compute Allocation
            </CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase">Strategic resource distribution across all nodes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { id: 'service', val: 12 },
              { id: 'construction', val: 28 },
              { id: 'mining', val: 42 },
              { id: 'manufacturing', val: 56 },
              { id: 'real_estate', val: 82 },
              { id: 'trade', val: 65 },
              { id: 'agriculture', val: 34 }
            ].map((node) => (
              <div key={node.id} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono uppercase">
                  <span className="text-gray-500">{node.id} cluster</span>
                  <span className="text-[#C5A059]">{node.val}% Capacity</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${node.val}%` }}
                    className="bg-[#C5A059] h-full"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Global Access Logs */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Global Access Logs
              </CardTitle>
              <CardDescription className="text-[10px] font-mono uppercase">Strategic deployment monitoring</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-mono text-[#C5A059]">View Full Ledger</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-4">
                {[
                  { user: 'Enterprise_Alpha', action: 'Provisioned 50 new seats', time: '12m AGO', loc: 'Lagos, NG', type: 'SUCCESS' },
                  { user: 'Growth_System_2', action: 'Automated Tier Upgrade', time: '45m AGO', loc: 'Nairobi, KE', type: 'SUCCESS' },
                  { user: 'Security_Admin', action: 'Global Policy Refresh', time: '1h AGO', loc: 'Johannesburg, ZA', type: 'SYSTEM' },
                  { user: 'User_4921', action: 'Subscription Cancellation', time: '2h AGO', loc: 'London, UK', type: 'ALERT' },
                  { user: 'Investor_Portal', action: 'Batch Dividend Run', time: '4h AGO', loc: 'New York, US', type: 'SUCCESS' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        log.type === 'SUCCESS' ? 'bg-green-500' : 
                        log.type === 'SYSTEM' ? 'bg-blue-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-[11px] font-bold text-white mb-0.5">{log.action}</div>
                        <div className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter">
                          {log.user} • {log.loc}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-gray-400">{log.time}</div>
                      <Badge variant="outline" className={`text-[8px] h-4 mt-1 border-white/5 ${
                        log.type === 'SUCCESS' ? 'text-green-500' : 
                        log.type === 'SYSTEM' ? 'text-blue-500' : 'text-red-500'
                      }`}>
                        {log.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-[#050505] border-[#C5A059]/20 border-dashed relative overflow-hidden group">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C5A059]" />
              AI Intelligence Probe
            </CardTitle>
            <CardDescription className="text-[10px] font-mono uppercase">Predictive Operational Insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/10 relative">
              <Sparkles className="absolute top-2 right-2 w-3 h-3 text-[#C5A059] opacity-30" />
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "Operational metrics indicate an inflection point in the Enterprise Tier. Recommend pivoting 15% of acquisition focus toward Sub-Saharan tech hubs for maximum Q4 LTV yield."
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-gray-500 uppercase">Growth Confidence</span>
                <span className="text-[#C5A059]">88%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-[#C5A059] h-full w-[88%]" />
              </div>
            </div>

            <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] uppercase border border-white/10 h-12">
              Generate Strategic Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Enterprise Tiers</h2>
          <p className="text-xs text-gray-500 font-mono">Select a performance architecture for your global operations.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.id} className={`bg-[#0a0a0a] border-white/5 relative overflow-hidden group hover:border-[#C5A059]/30 transition-all ${user.plan === tier.id.toLowerCase() ? 'border-[#C5A059] bg-[#C5A059]/5' : ''}`}>
              {user.plan === tier.id.toLowerCase() && (
                <div className="absolute top-0 right-0 bg-[#C5A059] text-black text-[8px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-xl">
                  Current Plan
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-end mb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">{tier.id}</p>
                    <CardTitle className="text-2xl font-black text-white">{tier.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#C5A059]">${tier.price}</span>
                    <span className="text-[10px] text-gray-600 font-mono">/mo</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {tier.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1 h-1 rounded-full bg-[#C5A059]" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  className={`w-full font-bold h-10 rounded-xl transition-all ${user.plan === tier.id.toLowerCase() ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-[#C5A059] text-black hover:scale-[1.02]'}`}
                  disabled={user.plan === tier.id.toLowerCase()}
                  onClick={() => handleUpgrade(tier.id.toLowerCase())}
                >
                  {user.plan === tier.id.toLowerCase() ? 'ACTIVE' : 'SELECT ARCHITECTURE'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {user.role === 'CEO' && (
        <div className="pt-12 mt-12 border-t border-red-900/20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-red-500 uppercase flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Strategic Command Center
            </h2>
            <p className="text-xs text-gray-600 font-mono mt-1">High-privilege system overrides and global distribution parameters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-red-950/5 border-red-900/20">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase text-red-500 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Protocol: Global Zero
                </CardTitle>
                <CardDescription className="text-[10px] text-gray-500">Wipe all current operational data and reset to fresh installation state.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 leading-relaxed italic mb-4">
                  "This action purges the entire neural ledger, including all investments, analysis, and strategic action plans associated with your UID. Required for fresh organizational deployment."
                </p>
                <Button 
                  onClick={handleGlobalZero}
                  disabled={isResetting}
                  variant="destructive" 
                  className="w-full h-11 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 font-black text-xs uppercase tracking-[0.2em]"
                >
                  {isResetting ? (
                    <RefreshCcw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  {isResetting ? 'EXECUTING PURGE...' : 'EXECUTE GLOBAL ZERO'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#C5A059]/5 border-[#C5A059]/10">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase text-[#C5A059] flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Market Distribution
                </CardTitle>
                <CardDescription className="text-[10px] text-gray-500">Configure global availability and subscription licensing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#C5A059]/10 bg-black/40">
                  <span className="text-[10px] font-mono uppercase text-gray-400">Public Marketplace</span>
                  <Badge className="bg-green-500 text-black font-black text-[8px]">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#C5A059]/10 bg-black/40">
                  <span className="text-[10px] font-mono uppercase text-gray-400">Global API Gateway</span>
                  <Badge className="bg-blue-500 text-white font-black text-[8px]">PROVISIONED</Badge>
                </div>
                <Button className="w-full h-11 bg-[#C5A059] hover:bg-[#A6864A] text-black font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#C5A059]/10 group">
                  Deploy Global Modules <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
