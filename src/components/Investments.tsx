import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  Trash2,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Info,
  Wallet,
  Activity,
  Scale,
  Check,
  X,
  ArrowUpDown,
  Edit3,
  PieChart as PieChartIcon,
  Sparkles,
  Loader2,
  Brain,
  User as UserIcon,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIInsight } from '../lib/gemini';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Investment {
  id: string;
  title: string;
  category: string;
  amount: number;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  roi: number;
  growthRate: number;
  riskScore: number;
  ownerId: string;
  createdAt: any;
}

interface ActionItem {
  id: string;
  title: string;
  completed: boolean;
  source: 'MANUAL' | 'AI_CEO' | 'SYSTEM';
  createdAt: any;
}

export default function Investments({ user }: { user: any }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [focusedInvestment, setFocusedInvestment] = useState<Investment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const [sortBy, setSortBy] = useState<'amount' | 'roi' | 'riskScore' | 'newest'>('newest');
  
  // AI Analysis State
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action Items State
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [generatingActions, setGeneratingActions] = useState(false);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'ALL' | 'MANUAL' | 'AI_CEO' | 'SYSTEM'>('ALL');
  const [newItemSource, setNewItemSource] = useState<'MANUAL' | 'AI_CEO' | 'SYSTEM'>('MANUAL');

  // AI Prediction State
  const [prediction, setPrediction] = useState<any>(null);
  const [predictingForecast, setPredictingForecast] = useState(false);

  // New Investment State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Fintech');
  const [newROI, setNewROI] = useState('0');
  const [newGrowthRate, setNewGrowthRate] = useState('0');
  const [newRiskScore, setNewRiskScore] = useState('0');

  useEffect(() => {
    const q = query(
      collection(db, 'investments'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
      setInvestments(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'investments');
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (!focusedInvestment) {
      setActionItems([]);
      return;
    }

    const q = query(
      collection(db, 'investments', focusedInvestment.id, 'action_items'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionItem));
      const filteredDocs = selectedSourceFilter === 'ALL' 
        ? docs 
        : docs.filter(item => item.source === selectedSourceFilter);
      setActionItems(filteredDocs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `investments/${focusedInvestment.id}/action_items`);
    });

    return () => unsubscribe();
  }, [focusedInvestment?.id, selectedSourceFilter]);

  const handleAIAnalysis = async (item: Investment) => {
    if (analyzingIds.has(item.id)) return;

    setAnalyzingIds(prev => new Set(prev).add(item.id));
    
    try {
      const prompt = `Analyze this investment asset:
Title: ${item.title}
Category: ${item.category}
Amount: $${item.amount}
Current ROI: ${item.roi}%
Growth Rate: ${item.growthRate}%
Risk Score: ${item.riskScore}/100

Provide a structured strategic summary focused on performance and potential pitfalls.
Format:
ACTION: [Hold, Liquidate, Increase Stake, or Diversify]
SUMMARY: [A concise 1-2 sentence performance evaluation]
RISKS: [Identify the top 2-3 specific risks for this type of asset]
CONFIDENCE: [A number between 85-99]`;

      const insight = await getAIInsight(prompt);
      setAiInsights(prev => ({ ...prev, [item.id]: insight }));
      setExpandedInsights(prev => new Set(prev).add(item.id));
      toast.success(`Analysis complete for ${item.title}`);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast.error('Neural engine failed to generate insight');
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleGenerateAIActions = async (item: Investment) => {
    if (generatingActions) return;
    setGeneratingActions(true);
    const toastId = toast.loading('Neural engine generating strategy-aligned actions...');
    
    try {
      const prompt = `Based on this investment:
Title: ${item.title}
Category: ${item.category}
Amount: $${item.amount}
ROI: ${item.roi}%
Risk: ${item.riskScore}%

Generate exactly 3 specific, high-impact actionable tasks (max 10 words each) to optimize or secure this investment.
Return as a simple bulleted list starting with '-'.`;

      const result = await getAIInsight(prompt);
      const actions = result.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^-/, '').trim())
        .slice(0, 3);

      if (actions.length === 0) throw new Error('No actions generated');

      for (const actionTitle of actions) {
        await addDoc(collection(db, 'investments', item.id, 'action_items'), {
          title: actionTitle,
          completed: false,
          source: 'AI_CEO',
          investmentId: item.id,
          ownerId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      toast.success('AI strategic items integrated into ledger', { id: toastId });
    } catch (error) {
      console.error('AI Action Gen Error:', error);
      toast.error('AI action generation failed', { id: toastId });
    } finally {
      setGeneratingActions(false);
    }
  };

  const handleAddAction = async () => {
    if (!newActionTitle.trim() || !focusedInvestment) return;
    try {
      await addDoc(collection(db, 'investments', focusedInvestment.id, 'action_items'), {
        title: newActionTitle.trim(),
        completed: false,
        source: newItemSource,
        investmentId: focusedInvestment.id,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewActionTitle('');
      toast.success('Action item linked to asset');
    } catch (error) {
       toast.error('Failed to add action item');
    }
  };

  const handlePredictInsight = async (item: Investment) => {
    if (predictingForecast) return;
    setPredictingForecast(true);
    setPrediction(null);
    try {
      const res = await fetch("/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investmentId: item.id,
          historicalData: [] // Would pass actual data here
        })
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setPrediction(data);
      toast.success(`Predictions loaded for ${item.title}`);
    } catch (error) {
      console.error("Prediction Error:", error);
      toast.error('Prediction Engine failed to gather historical data');
    } finally {
      setPredictingForecast(false);
    }
  };

  const toggleAction = async (action: ActionItem) => {
    if (!focusedInvestment) return;
    try {
      await updateDoc(doc(db, 'investments', focusedInvestment.id, 'action_items', action.id), {
        completed: !action.completed
      });
    } catch (error) {
      toast.error('Failed to update task state');
    }
  };

  const deleteAction = async (actionId: string) => {
    if (!focusedInvestment) return;
    try {
      await deleteDoc(doc(db, 'investments', focusedInvestment.id, 'action_items', actionId));
      toast.success('Task removed');
    } catch (error) {
      toast.error('Failed to remove task');
    }
  };

  const handleCreate = async () => {
    if (!newTitle || !newAmount) return toast.error('Please fill all required fields');
    
    try {
      await addDoc(collection(db, 'investments'), {
        title: newTitle,
        amount: parseFloat(newAmount),
        category: newCategory,
        status: 'PENDING',
        roi: parseFloat(newROI) || 0,
        growthRate: parseFloat(newGrowthRate) || 0,
        riskScore: parseFloat(newRiskScore) || 0,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Investment registered in system');
      setOpen(false);
      setNewTitle('');
      setNewAmount('');
      setNewROI('0');
      setNewGrowthRate('0');
      setNewRiskScore('0');
    } catch (error) {
      toast.error('Failed to create investment');
    }
  };

  const handleDelete = async () => {
     if (!deleteId) return;
     try {
       await deleteDoc(doc(db, 'investments', deleteId));
       toast.success('Asset removed from tracking');
       setDeleteId(null);
       setSelectedIds(prev => {
         const next = new Set(prev);
         next.delete(deleteId);
         return next;
       });
     } catch (error) {
       toast.error('Permission denied for deletion');
     }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    const toastId = toast.loading(`Neural engine liquidating ${count} assets...`);
    
    try {
      const deletePromises = Array.from(selectedIds).map((id: string) => 
        deleteDoc(doc(db, 'investments', id))
      );
      
      await Promise.all(deletePromises);
      toast.success(`${count} strategic assets liquidated`, { id: toastId });
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Mass liquidation failed - check permissions', { id: toastId });
    }
  };

  const handleBulkAddToCompare = () => {
    if (selectedIds.size === 0) return;
    
    const toAdd = Array.from(selectedIds).filter(id => !comparisonIds.includes(id));
    
    if (comparisonIds.length + toAdd.length > 3) {
      toast.error('Strategic limit reached: Max 3 assets for comparison');
      return;
    }

    setComparisonIds(prev => [...prev, ...toAdd]);
    toast.success(`Integrated ${toAdd.length} assets into comparison matrix`);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map(i => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const filtered = React.useMemo(() => {
    let result = investments.filter(i => 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      i.category.toLowerCase().includes(search.toLowerCase())
    );

    switch (sortBy) {
      case 'amount':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'roi':
        result.sort((a, b) => b.roi - a.roi);
        break;
      case 'riskScore':
        result.sort((a, b) => b.riskScore - a.riskScore);
        break;
      case 'newest':
      default:
        // Default is usually already sorted by Firestore's desc order if query unchanged
        break;
    }

    return result;
  }, [investments, search, sortBy]);

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        toast.error('Maximum 3 assets can be compared side-by-side');
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleInsight = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedInsights(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedForComparison = investments.filter(i => comparisonIds.includes(i.id));

  const totalValue = investments.reduce((acc, curr) => acc + curr.amount, 0);

  const sectorData = React.useMemo(() => {
    const data: { [key: string]: number } = {};
    investments.forEach(inv => {
      data[inv.category] = (data[inv.category] || 0) + inv.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [investments]);

  const COLORS = ['#C5A059', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const trendData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let rollingValue = totalValue * 0.85; // Start at 85% of current total
    
    return months.map((month, index) => {
      // Simulate growth that leads to current totalValue
      const growth = index === 11 ? 0 : (Math.random() * 0.04) - 0.01;
      rollingValue = index === 11 ? totalValue : rollingValue * (1 + growth);
      return {
        month,
        value: Math.round(rollingValue)
      };
    });
  }, [totalValue]);

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-4 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Total Portfolio Value</p>
            <h3 className="text-2xl font-bold tracking-tighter">${totalValue.toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>+2.4% THIS MONTH</span>
            </div>
          </div>
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.slice(-6)}>
                <Area type="monotone" dataKey="value" stroke="#C5A059" fill="#C5A059" fillOpacity={0.1} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-4 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Average Asset ROI</p>
            <h3 className="text-2xl font-bold tracking-tighter">
              {investments.length > 0 ? (investments.reduce((acc, i) => acc + i.roi, 0) / investments.length).toFixed(1) : 0}%
            </h3>
            <p className="text-[10px] text-blue-400 font-mono uppercase">Optimized via AI Audit</p>
          </div>
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.map(d => ({ v: d.value * (0.9 + Math.random() * 0.2) }))}>
                <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-4 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Risk Exposure</p>
            <h3 className="text-2xl font-bold tracking-tighter">
              {investments.length > 0 ? Math.round(investments.reduce((acc, i) => acc + i.riskScore, 0) / investments.length) : 0}%
            </h3>
            <p className="text-[10px] text-yellow-500 font-mono uppercase">Moderate Profile</p>
          </div>
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{v:40}, {v:60}, {v:45}, {v:70}, {v:55}, {v:50}]}>
                <Area type="step" dataKey="v" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Portfolios</h1>
          <p className="text-gray-500 font-mono text-sm uppercase">Managing global assets for {user.displayName}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {comparisonIds.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowComparison(true)}
              className="border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10"
            >
              <Scale className="w-4 h-4 mr-2" /> Compare ({comparisonIds.length})
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search assets or category..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] focus:border-[#C5A059]/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#1a1a1a] bg-[#0a0a0a] hover:bg-white/5 text-gray-400">
                  <Filter className="w-4 h-4 mr-2" /> 
                  <span className="hidden sm:inline">Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
                <DropdownMenuLabel>Sort Parameters</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#1a1a1a]" />
                <DropdownMenuItem onClick={() => setSortBy('newest')} className="flex items-center justify-between cursor-pointer hover:bg-white/5">
                  Newest Entry {sortBy === 'newest' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount')} className="flex items-center justify-between cursor-pointer hover:bg-white/5">
                  Portfolio Value {sortBy === 'amount' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('roi')} className="flex items-center justify-between cursor-pointer hover:bg-white/5">
                  Total ROI {sortBy === 'roi' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('riskScore')} className="flex items-center justify-between cursor-pointer hover:bg-white/5">
                  Risk Spectrum {sortBy === 'riskScore' && <Check className="w-3 h-3 text-[#C5A059]" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#C5A059] hover:bg-[#A6864A] text-black font-bold h-10 px-4">
                <Plus className="w-4 h-4 mr-2" /> Register Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
              <DialogHeader>
                <DialogTitle>Register New Investment</DialogTitle>
                <DialogDescription className="text-gray-500">Add a new financial vehicle to the Afro Space portfolio.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-500">Asset Title</label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Ethiopian Tech Series A" className="bg-black border-[#1a1a1a]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-gray-500">Initial Amount ($)</label>
                    <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="500000" className="bg-black border-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-gray-500">Category</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-10 bg-black border-[#1a1a1a] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    >
                      <option>Fintech</option>
                      <option>Real Estate</option>
                      <option>Agriculture</option>
                      <option>Logistics</option>
                      <option>Energy</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-gray-500">ROI (%)</label>
                    <Input type="number" value={newROI} onChange={(e) => setNewROI(e.target.value)} placeholder="12.5" className="bg-black border-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-gray-500">Growth (%)</label>
                    <Input type="number" value={newGrowthRate} onChange={(e) => setNewGrowthRate(e.target.value)} placeholder="8" className="bg-black border-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-gray-500">Risk (0-100)</label>
                    <Input type="number" value={newRiskScore} onChange={(e) => setNewRiskScore(e.target.value)} placeholder="20" className="bg-black border-[#1a1a1a]" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} className="w-full bg-[#C5A059] hover:bg-[#A6864A] text-black font-bold">
                  Authenticate & Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0a0a0a] border border-[#C5A059]/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(197,160,89,0.1)]">
              <div className="flex items-center gap-4">
                <div className="bg-[#C5A059]/20 text-[#C5A059] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#C5A059]/30">
                  {selectedIds.size} {selectedIds.size === 1 ? 'ASSET' : 'ASSETS'} SELECTED
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={selectAll}
                    className="text-[10px] font-mono h-8 hover:bg-white/5"
                  >
                    SELECT ALL
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={deselectAll}
                    className="text-[10px] font-mono h-8 hover:bg-white/5"
                  >
                    DESELECT ALL
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkAddToCompare}
                  className="h-8 text-xs border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10"
                >
                  <Scale className="w-3.5 h-3.5 mr-2" /> ADD TO COMPARE
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> LIQUIDATE SELECTED
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
                    <DialogHeader>
                      <DialogTitle>Confirm Mass Liquidation</DialogTitle>
                      <DialogDescription className="text-gray-500">
                        You are about to liquidate {selectedIds.size} investment assets. This action is irreversible and will remove all associated telemetry.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                      <DialogClose asChild>
                        <Button variant="ghost" className="text-gray-400 hover:bg-white/5 h-10 px-4">CANCEL</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold h-10 px-4">
                          EXECUTE LIQUIDATION
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-48 bg-[#0a0a0a] rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-[#1a1a1a] rounded-3xl text-center p-8">
           <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
             <Wallet className="w-8 h-8 text-gray-600" />
           </div>
           <h3 className="text-xl font-bold mb-2">No Global Assets Found</h3>
           <p className="text-gray-500 max-w-sm mb-6">Start by registering your first investment to activate the tracking and AI intelligence engine.</p>
           <Button variant="outline" onClick={() => setOpen(true)} className="border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10">Register First Asset</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02, translateY: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFocusedInvestment(item)}
                className="cursor-pointer"
              >
                <Card className={`bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#C5A059]/40 hover:shadow-[0_0_40px_rgba(197,160,89,0.08)] transition-all duration-500 group relative overflow-visible h-full ${comparisonIds.includes(item.id) ? 'border-[#C5A059]/50 bg-[#C5A059]/5' : ''}`}>
                {/* Enhanced Metric Tooltip - Hover Only */}
                <div className="absolute inset-x-0 -top-16 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 pointer-events-none px-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/90 border border-[#C5A059]/50 rounded-2xl p-4 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center justify-between gap-4 ring-1 ring-white/10"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Net Value</p>
                      <p className="text-sm font-bold text-white tracking-tight">${Math.round(item.amount * (1 + (item.roi / 100))).toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Growth</p>
                      <p className={`text-sm font-bold ${item.roi >= 0 ? 'text-[#10b981]' : 'text-red-500'} tracking-tight`}>
                        {item.roi >= 0 ? '+' : ''}{item.roi}%
                      </p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Risk</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className={`text-sm font-bold tracking-tight ${item.riskScore > 70 ? 'text-red-500' : 'text-blue-400'}`}>{item.riskScore}%</span>
                      </div>
                    </div>
                  </motion.div>
                  {/* Tooltip Arrow */}
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-black/90 border-r border-b border-[#C5A059]/50 rotate-45" />
                </div>

                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <div 
                    onClick={(e) => toggleComparison(item.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                      comparisonIds.includes(item.id) 
                      ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-[0_0_15px_rgba(197,160,89,0.5)]' 
                      : 'bg-black/50 border-white/20 text-transparent opacity-0 group-hover:opacity-100 hover:border-[#C5A059]/50'
                    }`}
                  >
                    <Scale className="w-3 h-3" strokeWidth={3} />
                  </div>
                  
                  <div 
                    onClick={(e) => toggleSelection(item.id, e)}
                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all border ${
                      selectedIds.has(item.id)
                      ? 'bg-[#10b981] border-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-black/50 border-white/20 text-transparent opacity-0 group-hover:opacity-100 hover:border-[#10b981]/50'
                    }`}
                  >
                    <Check className="w-3 h-3" strokeWidth={4} />
                  </div>
                </div>

                {/* AI Analysis FAB */}
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIAnalysis(item);
                  }}
                  disabled={analyzingIds.has(item.id)}
                  className={`absolute bottom-24 right-4 z-20 rounded-full w-10 h-10 shadow-2xl transition-all duration-300 transform scale-0 group-hover:scale-100 active:scale-95 border ${
                    analyzingIds.has(item.id) ? 'bg-black/50 border-white/10' :
                    aiInsights[item.id] ? 'bg-[#10b981] text-white border-[#10b981]/50 hover:bg-[#059669]' : 
                    'bg-[#C5A059] text-black border-[#C5A059]/50 hover:bg-[#A6864A] hover:shadow-[#C5A059]/20'
                  }`}
                >
                  {analyzingIds.has(item.id) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span className="sr-only">Analyze Performance</span>
                </Button>

                <CardHeader className="flex flex-row items-start justify-between pb-2 pl-12">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-[10px] uppercase font-mono">{item.category}</Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] uppercase font-bold px-1.5 py-0 h-auto border ${
                          item.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          item.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-[#C5A059] transition-colors">{item.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/5">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
                      <DropdownMenuLabel>Asset Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5"><ExternalLink className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5"><TrendingUp className="w-4 h-4 mr-2" /> Growth Analysis</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#1a1a1a]" />
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(item.id)}
                        className="cursor-pointer text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Liquidate / Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                     <div className="flex-1">
                       <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Initial Investment</p>
                       <p className="text-2xl font-bold">${item.amount.toLocaleString()}</p>
                       <div className="flex items-center gap-2 mt-1">
                         <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[9px] font-mono text-gray-400">
                           <PieChartIcon className="w-2.5 h-2.5 text-[#C5A059]" />
                           {totalValue > 0 ? ((item.amount / totalValue) * 100).toFixed(1) : '0.0'}% ALLOCATION
                         </div>
                       </div>
                     </div>
                     <div className="w-16 h-16 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { value: item.amount },
                                { value: Math.max(0, totalValue - item.amount) }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={28}
                              stroke="none"
                              dataKey="value"
                              startAngle={90}
                              endAngle={450}
                            >
                              <Cell fill="#C5A059" fillOpacity={0.8} />
                              <Cell fill="rgba(255,255,255,0.03)" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[8px] font-bold text-white/40 font-mono">PORTFOLIO</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-16 w-full relative group/sparkline bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden p-0 cursor-crosshair">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { v: item.roi * (0.8 + Math.random() * 0.4) },
                          { v: item.roi * (0.7 + Math.random() * 0.4) },
                          { v: item.roi * (0.9 + Math.random() * 0.4) },
                          { v: item.roi * (0.8 + Math.random() * 0.4) },
                          { v: item.roi * (1.1 + Math.random() * 0.4) },
                          { v: item.roi * (1.0 + Math.random() * 0.3) },
                          { v: item.roi * (1.2 + Math.random() * 0.4) },
                          { v: item.roi }
                        ]}>
                          <defs>
                            <linearGradient id={`trend-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={item.roi >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={item.roi >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area 
                            type="monotone" 
                            dataKey="v" 
                            stroke={item.roi >= 0 ? '#10b981' : '#ef4444'} 
                            fill={`url(#trend-${item.id})`}
                            strokeWidth={2}
                            dot={false}
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      
                      {/* Integrated ROI Overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.roi >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-[11px] font-bold font-mono ${item.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.roi >= 0 ? '+' : ''}{item.roi}%
                        </span>
                      </div>
                      
                      <div className="absolute bottom-1 left-2">
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">30D PERFORMANCE TRAJECTORY</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#1a1a1a] relative group/metrics">
                    {/* Metrics Footer Tooltip - Displays title and ROI on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 opacity-0 invisible group-hover/metrics:opacity-100 group-hover/metrics:visible transition-all duration-300 transform translate-y-2 group-hover/metrics:translate-y-0 pointer-events-none w-max">
                      <motion.div 
                        className="bg-black/95 border border-[#C5A059]/50 text-[#C5A059] text-[10px] font-bold px-3 py-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-center gap-3"
                      >
                        <span className="text-gray-400 font-mono">{item.title}</span>
                        <div className="w-px h-3 bg-white/10" />
                        <span className="flex items-center gap-1">
                          ROI: <span className={item.roi >= 0 ? 'text-green-500' : 'text-red-500'}>{item.roi}%</span>
                        </span>
                      </motion.div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-b border-r border-[#C5A059]/50 rotate-45" />
                    </div>

                     <div className="space-y-1">
                        <p className="text-[9px] text-gray-600 uppercase font-mono">Status</p>
                        <div className="flex items-center gap-1.5 text-white">
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             item.status === 'ACTIVE' ? 'bg-green-500' : 
                             item.status === 'COMPLETED' ? 'bg-blue-500' : 
                             'bg-yellow-500'
                           }`} />
                           <span className="text-[10px] font-medium uppercase font-mono">{item.status}</span>
                        </div>
                     </div>
                     <div className="space-y-1 px-2 border-x border-white/5">
                        <p className="text-[9px] text-gray-600 uppercase font-mono">Risk Profile</p>
                        <div className="space-y-1.5">
                           <div className="flex items-center justify-between text-[10px] font-mono text-white">
                              <div className="flex items-center gap-1">
                                 <div className={`w-1 h-1 rounded-full ${
                                    item.riskScore < 30 ? 'bg-green-500' : 
                                    item.riskScore <= 70 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                 }`} />
                                 <span className="uppercase">{item.riskScore < 30 ? 'Low' : item.riskScore <= 70 ? 'Med' : 'High'}</span>
                              </div>
                              <span className="opacity-50">{item.riskScore}%</span>
                           </div>
                           <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${item.riskScore}%` }}
                                 className={`h-full ${
                                    item.riskScore < 30 ? 'bg-green-500/50' : 
                                    item.riskScore <= 70 ? 'bg-yellow-500/50' : 
                                    'bg-red-500/50'
                                 }`}
                              />
                           </div>
                        </div>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[9px] text-gray-600 uppercase font-mono">Audit</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAIAnalysis(item);
                          }}
                          disabled={analyzingIds.has(item.id)}
                          className="flex items-center justify-end gap-1.5 w-full text-left group/btn"
                        >
                          <span className="text-[10px] font-medium uppercase font-mono text-[#C5A059] group-hover/btn:underline">
                            {analyzingIds.has(item.id) ? 'WAIT...' : 'ANALYZE'}
                          </span>
                          {analyzingIds.has(item.id) ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-[#C5A059]" />
                          ) : (
                            <Sparkles className="w-2.5 h-2.5 text-[#C5A059]" />
                          )}
                        </button>
                     </div>
                  </div>

                  {aiInsights[item.id] && (
                    <div className="mt-4 space-y-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={(e) => toggleInsight(item.id, e)}
                         className="w-full justify-between h-8 text-[10px] font-mono text-[#C5A059] border border-[#C5A059]/10 bg-[#C5A059]/5 hover:bg-[#C5A059]/10 transition-all rounded-lg"
                       >
                         <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Global Insight Node
                         </div>
                         <div className={`transition-transform duration-300 ${expandedInsights.has(item.id) ? 'rotate-180' : ''}`}>
                            <TrendingDown className="w-3 h-3" />
                         </div>
                       </Button>

                       <AnimatePresence>
                         {expandedInsights.has(item.id) && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             exit={{ opacity: 0, height: 0 }}
                             className="overflow-hidden"
                           >
                             <div className="p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/10 space-y-4 shadow-inner">
                               <div className="flex items-center justify-between">
                                 <span className="text-[9px] font-mono font-bold uppercase text-gray-500 tracking-widest">Protocol Response</span>
                                 {aiInsights[item.id].includes('ACTION:') && (
                                   <Badge className="bg-[#C5A059] text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                                     {aiInsights[item.id].split('ACTION:')[1]?.split('\n')[0].trim()}
                                   </Badge>
                                 )}
                               </div>
                               
                               <div className="space-y-3">
                                 <div className="space-y-1">
                                    <p className="text-[9px] font-mono text-[#C5A059]/50 uppercase tracking-tighter">Strategic Summary</p>
                                    <p className="text-[11px] text-gray-200 leading-relaxed font-serif italic">
                                      "{aiInsights[item.id].includes('SUMMARY:') ? aiInsights[item.id].split('SUMMARY:')[1]?.split('\n')[0].trim() : aiInsights[item.id]}"
                                    </p>
                                 </div>
                                 
                                 {aiInsights[item.id].includes('RISKS:') && (
                                   <div className="space-y-1">
                                      <p className="text-[9px] font-mono text-red-500/50 uppercase tracking-tighter flex items-center gap-1">
                                        <ShieldAlert className="w-2 h-2" /> Potential Risks
                                      </p>
                                      <p className="text-[10px] text-gray-400 leading-tight">
                                        {aiInsights[item.id].split('RISKS:')[1]?.split('CONFIDENCE:')[0]?.trim()}
                                      </p>
                                   </div>
                                 )}
                                 
                                 {aiInsights[item.id].includes('CONFIDENCE:') && (
                                   <div className="space-y-1.5 pt-1">
                                     <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-tighter">
                                        <span className="text-gray-500">Neural Confidence</span>
                                        <span className="text-[#C5A059]">{aiInsights[item.id].split('CONFIDENCE:')[1]?.trim()}%</span>
                                     </div>
                                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                       <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${aiInsights[item.id].split('CONFIDENCE:')[1]?.trim()}%` }}
                                         className="h-full bg-gradient-to-r from-[#C5A059]/50 to-[#C5A059]"
                                       />
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAIAnalysis(item);
                      }}
                      disabled={analyzingIds.has(item.id)}
                      className={`flex-1 h-9 text-[10px] font-mono uppercase tracking-tight border-white/5 hover:bg-[#C5A059]/10 hover:text-[#C5A059] hover:border-[#C5A059]/30 transition-all ${
                        aiInsights[item.id] ? 'border-[#C5A059]/50 text-[#C5A059] bg-[#C5A059]/5' : ''
                      }`}
                    >
                      {analyzingIds.has(item.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <Sparkles className={`w-3 h-3 mr-2 ${aiInsights[item.id] ? 'fill-current' : ''}`} />
                      )}
                      {aiInsights[item.id] ? 'Refresh' : 'AI Review'}
                    </Button>
                    <Button variant="ghost" className="flex-1 justify-between h-9 text-[10px] font-mono uppercase tracking-tight group-hover:bg-[#C5A059] group-hover:text-black transition-all rounded-lg">
                         Strategic View <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>

                {/* Floating Quick Actions Overlay */}
                <div className="absolute inset-x-4 bottom-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2">
                  <div className="bg-black/90 backdrop-blur-xl border border-[#C5A059]/40 rounded-xl p-1.5 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => { e.stopPropagation(); handleAIAnalysis(item); }}
                      className="h-8 text-[10px] gap-1.5 px-3 hover:bg-[#C5A059] hover:text-black font-mono transition-all"
                    >
                      <Sparkles className="w-3 h-3" /> ANALYZE
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => { e.stopPropagation(); setFocusedInvestment(item); }}
                      className="h-8 text-[10px] gap-1.5 px-3 hover:bg-[#C5A059] hover:text-black font-mono transition-all"
                    >
                      <ListTodo className="w-3 h-3" /> TASKS
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => { e.stopPropagation(); toggleComparison(item.id); }}
                      className={`h-8 text-[10px] gap-1.5 px-3 font-mono transition-all ${comparisonIds.includes(item.id) ? 'bg-[#C5A059] text-black' : 'hover:bg-[#C5A059] hover:text-black'}`}
                    >
                      <ArrowUpDown className="w-3 h-3" /> COMPARE
                    </Button>
                  </div>
                </div>
              </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#C5A059]" />
                      Portfolio Performance
                    </CardTitle>
                    <CardDescription className="font-mono text-xs uppercase text-gray-600">Simulated historical valuation matrix</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-600 font-mono">TOTAL ESTIMATED VALUE</p>
                    <p className="text-2xl font-bold text-[#C5A059] tracking-tight">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#374151" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                        fontFamily="JetBrains Mono"
                      />
                      <YAxis 
                        stroke="#374151" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                        fontFamily="JetBrains Mono"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                        itemStyle={{ color: '#C5A059', fontSize: '12px' }}
                        labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'PORTFOLIO VALUE']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#C5A059" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-400" />
                  Asset Diversification
                </CardTitle>
                <CardDescription className="font-mono text-xs uppercase text-gray-600">Distribution analysis by industrial sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'ALLOCATION']}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-mono text-gray-400 uppercase">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={!!focusedInvestment} onOpenChange={(open) => !open && setFocusedInvestment(null)}>
            <DialogContent className="max-w-2xl bg-[#0a0a0a] border-[#1a1a1a] text-white p-0 overflow-hidden">
              {focusedInvestment && (
                <>
                  <div className="p-8 border-b border-white/5 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20 uppercase font-mono py-1">
                            {focusedInvestment.category}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-gray-500 uppercase font-mono py-1">
                            {focusedInvestment.status}
                          </Badge>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tighter">{focusedInvestment.title}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Portfolio Allocation</p>
                        <p className="text-3xl font-bold text-[#C5A059]">${focusedInvestment.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Performance</p>
                        <p className={`text-2xl font-bold ${focusedInvestment.roi >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                          {focusedInvestment.roi >= 0 ? '+' : ''}{focusedInvestment.roi}%
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Growth Rate</p>
                        <p className="text-2xl font-bold text-blue-400">{focusedInvestment.growthRate}%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Risk Index</p>
                        <p className={`text-2xl font-bold ${focusedInvestment.riskScore > 70 ? 'text-red-500' : 'text-gray-200'}`}>
                          {focusedInvestment.riskScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Detailed Sparkline */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-[#C5A059]">Trajectory Analysis</h3>
                        <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600">
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> ROI</div>
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> RISK</div>
                        </div>
                      </div>
                      <div className="h-40 w-full mt-4 bg-white/[0.02] rounded-3xl p-6 border border-white/5 shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { v: focusedInvestment.roi * 0.72, r: focusedInvestment.riskScore * 1.1 },
                            { v: focusedInvestment.roi * 0.85, r: focusedInvestment.riskScore * 1.05 },
                            { v: focusedInvestment.roi * 1.05, r: focusedInvestment.riskScore * 0.95 },
                            { v: focusedInvestment.roi * 0.95, r: focusedInvestment.riskScore * 1.0 },
                            { v: focusedInvestment.roi * 1.15, r: focusedInvestment.riskScore * 0.9 },
                            { v: focusedInvestment.roi, r: focusedInvestment.riskScore }
                          ]}>
                            <defs>
                              <linearGradient id="focusedRoi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#focusedRoi)" strokeWidth={3} animationDuration={2000} />
                            <Area type="monotone" dataKey="r" stroke="#3b82f6" fill="transparent" strokeWidth={1} strokeDasharray="5 5" animationDuration={2500} />
                            <Tooltip content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-black/90 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-mono shadow-2xl backdrop-blur-md">
                                    <p className="text-white mb-1">ROI: {payload[0].value?.toFixed(2)}%</p>
                                    <p className="text-blue-400">RISK: {payload[1].value?.toFixed(2)}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Wisdom Section */}
                    {aiInsights[focusedInvestment.id] ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#C5A059]" />
                          <h3 className="text-xs font-mono uppercase tracking-widest text-[#C5A059]">Neural Strategic Protocol</h3>
                        </div>
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#C5A059]/10 to-transparent border border-[#C5A059]/20 space-y-4 shadow-[0_0_50px_rgba(197,160,89,0.05)]">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-[#C5A059] text-black font-bold px-3 py-1 text-[10px]">
                              {aiInsights[focusedInvestment.id].split('ACTION:')[1]?.split('\n')[0].trim() || 'HOLD'}
                            </Badge>
                            <span className="text-[10px] font-mono text-[#C5A059]">
                              CONFIDENCE: {aiInsights[focusedInvestment.id].split('CONFIDENCE:')[1]?.trim() || '94'}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed font-serif italic text-lg pr-4">
                            "{aiInsights[focusedInvestment.id].includes('SUMMARY:') ? aiInsights[focusedInvestment.id].split('SUMMARY:')[1]?.split('\n')[0].trim() : aiInsights[focusedInvestment.id]}"
                          </p>
                          
                          {aiInsights[focusedInvestment.id].includes('RISKS:') && (
                            <div className="pt-4 border-t border-[#C5A059]/10 space-y-2">
                              <h4 className="text-[10px] font-mono uppercase text-red-500/70 tracking-widest flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3" /> Potential Risk Factors
                              </h4>
                              <p className="text-xs text-gray-400 leading-tight">
                                {aiInsights[focusedInvestment.id].split('RISKS:')[1]?.split('CONFIDENCE:')[0]?.trim()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <Activity className="w-8 h-8 text-white/10 mb-4 animate-pulse" />
                        <p className="text-xs text-gray-600 font-mono text-center uppercase tracking-widest">Awaiting Neural Evaluation...</p>
                        <Button 
                          onClick={() => handleAIAnalysis(focusedInvestment)}
                          disabled={analyzingIds.has(focusedInvestment.id)}
                          variant="ghost" 
                          className="mt-6 text-[#C5A059] hover:bg-[#C5A059]/10"
                        >
                          {analyzingIds.has(focusedInvestment.id) ? 'Analyzing Path...' : 'Initiate AI Audit'}
                        </Button>
                      </div>
                    )}

                    {/* AI Prediction & Forecasting Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-400" />
                          <h3 className="text-xs font-mono uppercase tracking-widest text-blue-400">Predictive Forecasting</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePredictInsight(focusedInvestment)}
                          disabled={predictingForecast}
                          className="text-[10px] h-7 font-mono text-blue-400 hover:bg-blue-400/10"
                        >
                          {predictingForecast ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <TrendingUp className="w-3 h-3 mr-2" />}
                          GENERATE FORECAST
                        </Button>
                      </div>

                      {prediction ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                              <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Projected Trend</p>
                              <p className="text-lg font-bold text-white uppercase">{prediction.trend}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                              <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Expected Growth</p>
                              <p className="text-lg font-bold text-[#10b981] capitalize">+{(prediction.expected_growth * 100).toFixed(0)}% APY</p>
                            </div>
                          </div>
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                            <h4 className="text-[10px] font-mono uppercase text-gray-500">6-Month Valuation Forecast</h4>
                            <div className="h-40 w-full mt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prediction.forecast}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                  <XAxis 
                                    dataKey="ds" 
                                    stroke="#374151" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(val) => {
                                      const d = new Date(val);
                                      return d.toLocaleDateString(undefined, { month: 'short' });
                                    }}
                                  />
                                  <YAxis 
                                    stroke="#374151" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                  />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', color: '#10b981' }}
                                    labelStyle={{ color: '#6b7280', fontSize: '10px' }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="yhat" 
                                    name="Predicted"
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                                    activeDot={{ r: 6 }} 
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="yhat_lower" 
                                    name="Lower Bound"
                                    stroke="#10b981" 
                                    strokeWidth={1} 
                                    strokeDasharray="3 3" 
                                    dot={false} 
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="yhat_upper" 
                                    name="Upper Bound"
                                    stroke="#C5A059" 
                                    strokeWidth={1} 
                                    strokeDasharray="3 3" 
                                    dot={false} 
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-400 font-mono italic leading-relaxed pt-2">
                              System Recommendation: {prediction.recommendation}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center border border-dashed border-blue-500/20 rounded-3xl bg-blue-500/5">
                           <Activity className="w-6 h-6 text-blue-500/50 mb-2" />
                           <p className="text-[10px] text-blue-500/70 font-mono uppercase tracking-widest">Model Offline - Awaiting Execution</p>
                        </div>
                      )}
                    </div>

                    {/* Action Items Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#C5A059]" />
                          <h3 className="text-xs font-mono uppercase tracking-widest text-[#C5A059]">Strategic Action Items</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                            {(['ALL', 'MANUAL', 'AI_CEO', 'SYSTEM'] as const).map((source) => (
                              <button
                                key={source}
                                onClick={() => setSelectedSourceFilter(source)}
                                className={`text-[9px] px-2 py-0.5 rounded-md font-mono transition-all ${
                                  selectedSourceFilter === source 
                                    ? 'bg-[#C5A059] text-black font-bold' 
                                    : 'text-gray-500 hover:text-white'
                                }`}
                              >
                                {source}
                              </button>
                            ))}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleGenerateAIActions(focusedInvestment)}
                            disabled={generatingActions}
                            className="text-[10px] h-7 font-mono text-[#C5A059] hover:bg-[#C5A059]/10"
                          >
                            {generatingActions ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                            AI GEN
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                        <div className="space-y-3 mb-4">
                          <div className="flex gap-2">
                            <Input 
                              value={newActionTitle}
                              onChange={(e) => setNewActionTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddAction()}
                              placeholder="Add strategic requirement..."
                              className="bg-black/50 border-white/10 h-9 text-xs"
                            />
                            <Button 
                              onClick={handleAddAction}
                              className="bg-[#C5A059] hover:bg-[#A6864A] text-black h-9 px-3"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 px-1">
                            <span className="text-[9px] font-mono text-gray-500 uppercase">Source:</span>
                            {(['MANUAL', 'AI_CEO', 'SYSTEM'] as const).map((source) => (
                              <button
                                key={source}
                                onClick={() => setNewItemSource(source)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all ${
                                  newItemSource === source
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-transparent border-transparent text-gray-600 hover:text-gray-400'
                                }`}
                              >
                                {source === 'AI_CEO' && <Brain className="w-3 h-3" />}
                                {source === 'SYSTEM' && <Activity className="w-3 h-3" />}
                                {source === 'MANUAL' && <UserIcon className="w-3 h-3" />}
                                <span className="text-[9px] font-mono font-bold">{source}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <ScrollArea className="h-[200px] pr-4">
                          <AnimatePresence mode="popLayout">
                            {actionItems.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center py-8 text-gray-600">
                                <p className="text-[10px] font-mono uppercase">Ledger Clear</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {actionItems.map((action) => (
                                  <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border transition-all ${
                                      action.completed ? 'border-transparent opacity-60' : 'border-white/5 hover:border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => toggleAction(action)}
                                        className={`w-5 h-5 rounded flex items-center justify-center transition-all border ${
                                          action.completed 
                                          ? 'bg-[#C5A059] border-[#C5A059] text-black' 
                                          : 'bg-black/40 border-white/20 text-transparent hover:border-[#C5A059]/50'
                                        }`}
                                      >
                                        <Check className="w-3 h-3" strokeWidth={4} />
                                      </button>
                                      <div className="space-y-0.5">
                                        <p className={`text-sm tracking-tight ${action.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                                          {action.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <div className={`flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                            action.source === 'AI_CEO' ? 'text-purple-400 bg-purple-400/5' :
                                            action.source === 'SYSTEM' ? 'text-blue-400 bg-blue-400/5' :
                                            'text-gray-500 bg-gray-500/5'
                                          }`}>
                                            {action.source === 'AI_CEO' && <Brain className="w-2 h-2" />}
                                            {action.source === 'SYSTEM' && <Activity className="w-2 h-2" />}
                                            {action.source === 'MANUAL' && <UserIcon className="w-2 h-2" />}
                                            {action.source}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => deleteAction(action.id)}
                                      className="w-8 h-8 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </AnimatePresence>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="p-8 pt-0 flex justify-between gap-4">
                    <Button variant="ghost" onClick={() => setFocusedInvestment(null)} className="flex-1 border-white/5 hover:bg-white/5 uppercase font-mono text-[10px]">Close Terminal</Button>
                    <Button className="flex-1 bg-white text-black hover:bg-gray-200 font-bold uppercase font-mono text-[10px]">Deploy Full Capital</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
            <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-500">
                  <ShieldAlert className="w-5 h-5" />
                  Confirm Asset Liquidation
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Are you sure you want to remove this asset from the Afro Space Global Ledger? This action is irreversible and will purge all associated performance tracking data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6 flex gap-3">
                <Button variant="ghost" onClick={() => setDeleteId(null)} className="flex-1 border-[#1a1a1a] hover:bg-white/5">
                  Abort Mission
                </Button>
                <Button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold">
                  Confirm Liquidation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showComparison} onOpenChange={setShowComparison}>
            <DialogContent className="max-w-4xl bg-[#0a0a0a] border-[#1a1a1a] text-white p-0 overflow-hidden">
              <DialogHeader className="p-6 border-b border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Scale className="w-6 h-6 text-[#C5A059]" />
                      Asset Intelligence Comparison
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">Cross-referencing performance metrics for strategic selection.</DialogDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setComparisonIds([])} className="text-xs text-gray-500 hover:text-red-500">
                    <Trash2 className="w-3 h-3 mr-1" /> Clear Selection
                  </Button>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1a1a1a]">
                {selectedForComparison.map((asset) => (
                  <div key={asset.id} className="p-6 space-y-6 bg-black/20">
                    <div>
                      <Badge className="bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20 mb-2">{asset.category}</Badge>
                      <h3 className="text-xl font-bold truncate">{asset.title}</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Metric: ROI with Enhanced Detailed Sparkline */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block">Performance (ROI)</span>
                            <span className={`text-2xl font-bold tracking-tighter flex items-center ${asset.roi >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                              {asset.roi >= 0 ? '+' : ''}{asset.roi}%
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            30D Trend
                          </div>
                        </div>
                        <div className="h-20 w-full relative group/sparkline">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { v: asset.roi * 0.72 }, { v: asset.roi * 0.85 }, { v: asset.roi * 0.78 }, 
                              { v: asset.roi * 0.92 }, { v: asset.roi * 1.05 }, { v: asset.roi * 0.88 },
                              { v: asset.roi * 0.95 }, { v: asset.roi * 1.12 }, { v: asset.roi * 1.02 },
                              { v: asset.roi * 1.18 }, { v: asset.roi * 1.08 }, { v: asset.roi }
                            ]}>
                              <defs>
                                <linearGradient id={`colorRoi-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={asset.roi >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={asset.roi >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area 
                                type="monotone" 
                                dataKey="v" 
                                stroke={asset.roi >= 0 ? '#10b981' : '#ef4444'} 
                                fill={`url(#colorRoi-${asset.id})`}
                                strokeWidth={2}
                                animationDuration={2000}
                              />
                              <Tooltip 
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-[#050505] border border-white/10 px-2 py-1 rounded text-[10px] font-mono">
                                        {payload[0].value?.toFixed(1)}%
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Metric: Risk Score with Enhanced Detailed Sparkline */}
                      <div className="space-y-3 pb-4 border-b border-white/5">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block">Risk Sensitivity</span>
                            <span className={`text-2xl font-bold tracking-tighter ${asset.riskScore > 70 ? 'text-red-500' : asset.riskScore > 40 ? 'text-yellow-500' : 'text-blue-400'}`}>
                              {asset.riskScore}%
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            Stability
                          </div>
                        </div>
                        <div className="h-16 w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { v: asset.riskScore * 1.15 }, { v: asset.riskScore * 1.12 }, { v: asset.riskScore * 1.18 },
                              { v: asset.riskScore * 1.10 }, { v: asset.riskScore * 1.22 }, { v: asset.riskScore * 1.08 },
                              { v: asset.riskScore * 1.12 }, { v: asset.riskScore * 1.05 }, { v: asset.riskScore * 1.08 },
                              { v: asset.riskScore * 1.02 }, { v: asset.riskScore * 1.05 }, { v: asset.riskScore }
                            ]}>
                              <Line 
                                type="step" 
                                dataKey="v" 
                                stroke={asset.riskScore > 70 ? '#ef4444' : asset.riskScore > 40 ? '#f59e0b' : '#3b82f6'} 
                                strokeWidth={2}
                                dot={false}
                                animationDuration={2500}
                              />
                              <Tooltip 
                                cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-[#050505] border border-white/10 px-2 py-1 rounded text-[10px] font-mono">
                                        Risk: {payload[0].value?.toFixed(1)}%
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-mono text-[10px] uppercase">Initial Allocation</span>
                        <span className="font-bold">${asset.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-mono text-[10px] uppercase">Est. Current Value</span>
                        <span className="font-bold">${Math.round(asset.amount * (1 + (asset.roi / 100))).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-mono text-[10px] uppercase">Annual Growth</span>
                        <span className="text-blue-400 font-bold">{asset.growthRate}%</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#1a1a1a]">
                      <Button variant="outline" className="w-full text-xs border-white/10 hover:bg-[#C5A059] hover:text-black hover:border-[#C5A059]">
                        Full Asset Ledger
                      </Button>
                    </div>
                  </div>
                ))}
                
                {Array.from({ length: 3 - selectedForComparison.length }).map((_, i) => (
                  <div key={i} className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] border-dashed border-2 border-[#1a1a1a]/50 m-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full border border-[#1a1a1a] flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-700" />
                    </div>
                    <p className="text-xs text-gray-600 font-mono uppercase">Empty Slot</p>
                    <p className="text-[10px] text-gray-700 max-w-[150px]">Select another asset from your portfolio to compare performance analytics.</p>
                  </div>
                ))}
              </div>

              <DialogFooter className="p-6 bg-black/40 border-t border-[#1a1a1a]">
                <Button variant="ghost" onClick={() => setShowComparison(false)}>Close View</Button>
                <Button className="bg-[#C5A059] hover:bg-[#A6864A] text-black font-bold">
                  Export Strategic Summary
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
