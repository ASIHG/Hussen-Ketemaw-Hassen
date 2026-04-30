import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Terminal, 
  Database, 
  Server, 
  Activity, 
  Lock,
  RefreshCw,
  Cpu,
  Globe,
  Search,
  Users,
  UserCog,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  doc,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

import { performNeuralReset } from '../lib/reset';

type LogCategory = 'SUCCESS' | 'SYSTEM' | 'ALERT' | 'AI_STRATEGY' | 'FINANCIAL_ADVICE' | 'TECH_SCALE' | 'GROWTH_HACK' | 'DANGER';

interface LogEntry {
  timestamp: string;
  category: LogCategory;
  message: string;
}

interface SystemUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'CEO' | 'MANAGER' | 'STAFF';
  createdAt: string;
}

export default function AdminPanel({ user }: { user: any }) {
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), category: 'SYSTEM', message: 'System initialized...' },
    { timestamp: new Date().toLocaleTimeString(), category: 'SYSTEM', message: 'Secure node established at 0.0.0.0:3000' },
    { timestamp: new Date().toLocaleTimeString(), category: 'SYSTEM', message: 'AI Core synchronized.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'ALL'>('ALL');

  useEffect(() => {
    fetchUsers();

    // Listen for AI Decisions and inject into logs
    const aiQuery = query(collection(db, 'ai_decisions'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(aiQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const categoryMap: Record<string, LogCategory> = {
            'CEO': 'AI_STRATEGY',
            'CFO': 'FINANCIAL_ADVICE',
            'CTO': 'TECH_SCALE',
            'Growth': 'GROWTH_HACK'
          };

          const newLog: LogEntry = {
            timestamp: data.timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString(),
            category: categoryMap[data.agent] || 'SYSTEM',
            message: `[AI ${data.agent}] decision executed: ${Object.values(data.decision)[0]}`
          };

          setLogs(prev => {
            // Avoid duplicates on initial load if needed, but onSnapshot handles docChanges
            const exists = prev.some(l => l.message === newLog.message && l.timestamp === newLog.timestamp);
            if (exists) return prev;
            return [newLog, ...prev.slice(0, 49)]; // Keep last 50 logs
          });
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as SystemUser[];
      setUsers(userList);
    } catch (error) {
      toast.error('Failed to fetch user directory');
    } finally {
      setFetchingUsers(false);
    }
  };

  const updateUserRole = async (targetUid: string, newRole: 'CEO' | 'MANAGER' | 'STAFF') => {
    if (targetUid === user.uid && newRole !== 'CEO') {
      toast.error('Cannot demote yourself from CEO status');
      return;
    }

    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
      
      setLogs(prev => [
        { 
          timestamp: new Date().toLocaleTimeString(), 
          category: 'SUCCESS', 
          message: `PRIVILEGE_UPDATE: User ${targetUid} assigned role ${newRole}` 
        }, 
        ...prev
      ]);
    } catch (error) {
      toast.error('Failed to update privileges');
    }
  };

  const triggerAction = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setLogs(prev => [
        { 
          timestamp: new Date().toLocaleTimeString(), 
          category: 'SUCCESS', 
          message: data.logs 
        }, 
        ...prev
      ]);
      toast.success(`${action} executed successfully`);
    } catch (error) {
      setLogs(prev => [
        { 
          timestamp: new Date().toLocaleTimeString(), 
          category: 'ALERT', 
          message: `Privilege escalation failed for: ${action}` 
        }, 
        ...prev
      ]);
      toast.error('Privilege escalation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-red-500" />
            ADMINISTRATOR ROOT
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
            Global Infrastructure Override • Kernel v4.2.0 • Session: {user.uid.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500 text-white font-mono">LEVEL 5 CLEARANCE</Badge>
          <Badge variant="outline" className="border-red-500/20 text-red-400 font-mono">ROOT_DEVICE: AWS_EKS_NODE_1</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Overview */}
        <Card className="bg-[#0a0a0a] border-red-900/20">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase text-gray-500">Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>CPU LOAD</span>
                <span className="text-red-500">42%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '42%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>MEMORY ALLOCATION</span>
                <span className="text-yellow-500">68%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '68%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>POSTGRES CONNECTIONS</span>
                <span className="text-green-500">12/1000</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '1.2%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Action Terminal */}
        <Card className="lg:col-span-2 bg-black border-[#1a1a1a] font-mono">
          <CardHeader className="border-b border-[#1a1a1a] flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-500" />
                <CardTitle className="text-sm uppercase tracking-widest text-green-500">Secure Terminal Logs</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 uppercase font-mono">Filter:</span>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="bg-transparent border-none text-[10px] font-mono text-[#C5A059] focus:ring-0 p-0 cursor-pointer uppercase appearance-none hover:text-white transition-colors"
                >
                  <option value="ALL" className="bg-black">ALL_TYPES</option>
                  <option value="SUCCESS" className="bg-black">SUCCESS</option>
                  <option value="SYSTEM" className="bg-black">SYSTEM</option>
                  <option value="ALERT" className="bg-black">ALERT</option>
                  <option value="AI_STRATEGY" className="bg-black">AI_STRATEGY</option>
                  <option value="FINANCIAL_ADVICE" className="bg-black">FINANCIAL_ADVICE</option>
                  <option value="TECH_SCALE" className="bg-black">TECH_SCALE</option>
                  <option value="GROWTH_HACK" className="bg-black">GROWTH_HACK</option>
                </select>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setLogs([])} className="text-[10px] text-gray-600 hover:text-white">CLEAR_SYSTEM_LOGS</Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] p-6 text-[11px] font-mono bg-black/40">
              <div className="space-y-2">
                {logs
                  .filter(l => filterCategory === 'ALL' || l.category === filterCategory)
                  .map((log, i) => (
                    <div key={i} className={`flex flex-col md:flex-row md:items-start gap-3 border-l-2 pl-4 py-3 border-b border-white/5 transition-all hover:bg-white/[0.02] last:border-b-0 ${
                      log.category === 'SUCCESS' ? 'border-green-500/50' :
                      log.category === 'ALERT' ? 'border-red-500/50' :
                      log.category === 'SYSTEM' ? 'border-blue-500/50' :
                      'border-[#C5A059]/50'
                    }`}>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-gray-600 select-none font-mono text-[10px] w-16">[{log.timestamp}]</span>
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          log.category === 'SUCCESS' ? 'bg-green-500/10 text-green-500' :
                          log.category === 'ALERT' ? 'bg-red-500/10 text-red-500' :
                          log.category === 'AI_STRATEGY' ? 'bg-[#C5A059]/10 text-[#C5A059]' :
                          log.category === 'FINANCIAL_ADVICE' ? 'bg-emerald-500/10 text-emerald-500' :
                          log.category === 'TECH_SCALE' ? 'bg-blue-500/10 text-blue-400' :
                          log.category === 'GROWTH_HACK' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {log.category === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                           log.category === 'ALERT' ? <ShieldAlert className="w-3.5 h-3.5" /> :
                           log.category === 'SYSTEM' ? <Cpu className="w-3.5 h-3.5" /> :
                           log.category === 'AI_STRATEGY' ? <Activity className="w-3.5 h-3.5" /> :
                           <Terminal className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            log.category === 'SUCCESS' ? 'text-green-500' :
                            log.category === 'ALERT' ? 'text-red-500' :
                            log.category === 'SYSTEM' ? 'text-blue-500' :
                            'text-[#C5A059]'
                          }`}>
                            {log.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed transition-colors ${i === 0 ? 'text-white' : 'text-gray-400'}`}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                ))}
                {loading && (
                  <div className="flex gap-4 animate-pulse pt-2">
                    <span className="text-green-900 select-none">{">"}</span>
                    <span className="text-[#C5A059] uppercase">EXECUTING_REMOTE_OVERRIDE...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Cloud Scaling', icon: Server, action: 'SCALE_K8S_EKS', color: 'bg-blue-600' },
          { label: 'DB Migration', icon: Database, action: 'TRIGGER_RDS_FAILOVER', color: 'bg-purple-600' },
          { label: 'Global CDN Flush', icon: Globe, action: 'PURGE_CLOUDFRONT', color: 'bg-yellow-600' },
          { label: 'Security Lock', icon: Lock, action: 'INIT_MFA_ENFORCEMENT', color: 'bg-red-600' },
        ].map((btn, i) => (
          <Button
            key={i}
            disabled={loading}
            onClick={() => triggerAction(btn.action)}
            className="h-24 bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-white/5 flex flex-col gap-2 rounded-2xl group transition-all"
          >
            <div className={`p-2 rounded-lg ${btn.color} text-white transition-transform group-hover:scale-110`}>
              <btn.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{btn.label}</span>
          </Button>
        ))}
      </div>

      {/* User Role Management */}
      <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#C5A059]" />
              Holding Cluster Oversight
            </CardTitle>
            <CardDescription className="text-xs font-mono uppercase">Control status and performance of all business units</CardDescription>
          </div>
          <Button variant="ghost" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Service', status: 'Optimal', load: 45 },
              { name: 'Construction', status: 'Heavy', load: 88 },
              { name: 'Mining', status: 'Maintenance', load: 12 },
              { name: 'Manufacturing', status: 'Optimal', load: 34 },
              { name: 'Real Estate', status: 'High Yield', load: 92 },
              { name: 'Trade', status: 'Active', load: 67 },
              { name: 'Agriculture', status: 'Seasonal', load: 22 },
            ].map((cluster) => (
              <div key={cluster.name} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] group hover:border-[#C5A059]/30 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-white group-hover:text-[#C5A059] transition-colors">{cluster.name}</span>
                  <Badge variant="outline" className={`text-[9px] border-none font-mono ${
                    cluster.status === 'Optimal' ? 'text-green-400 bg-green-400/10' :
                    cluster.status === 'High Yield' ? 'text-[#C5A059] bg-[#C5A059]/10' :
                    'text-orange-400 bg-orange-400/10'
                  }`}>
                    {cluster.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
                    <span>Active Load</span>
                    <span>{cluster.load}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C5A059]/50" style={{ width: `${cluster.load}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Role Management */}
      <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C5A059]" />
              User Directory & Privilege Management
            </CardTitle>
            <CardDescription className="text-xs font-mono uppercase">Manage global group permissions and roles</CardDescription>
          </div>
          <Button variant="ghost" onClick={fetchUsers} disabled={fetchingUsers}>
            <RefreshCw className={`w-4 h-4 ${fetchingUsers ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[10px] font-mono text-gray-500 uppercase">
                  <th className="pb-4 pl-2">User / Identity</th>
                  <th className="pb-4">Email Node</th>
                  <th className="pb-4">Current Role</th>
                  <th className="pb-4 text-right pr-2">Command Override</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {users.map((u) => (
                  <tr key={u.uid} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-2 font-bold">{u.displayName || 'Unknown Agent'}</td>
                    <td className="py-4 font-mono text-gray-500">{u.email}</td>
                    <td className="py-4">
                      <Badge className={`${
                        u.role === 'CEO' ? 'bg-[#C5A059]/20 text-[#C5A059]' :
                        u.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      } border-none font-mono text-[9px] px-2 py-0.5`}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex justify-end gap-1">
                        {(['CEO', 'MANAGER', 'STAFF'] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => updateUserRole(u.uid, role)}
                            disabled={u.role === role}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                              u.role === role 
                              ? 'bg-white/5 text-gray-600 border border-transparent opacity-50 cursor-not-allowed'
                              : 'bg-black border border-white/10 text-gray-400 hover:border-[#C5A059] hover:text-white'
                            }`}
                          >
                            SET_{role}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#050505] border-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-5 h-5" />
            DANGER ZONE: NEURAL RESET
          </CardTitle>
          <CardDescription className="text-xs font-mono uppercase">Wipe all data nodes relating to your account to start from "Zero"</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Factory Reset Intelligence</h4>
              <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                This action will permanently delete all investments, clusters, and AI history associated with your UID.
                The system will return to a pristine state for fresh enterprise data entry.
              </p>
            </div>
            <Button 
              variant="destructive" 
              disabled={loading}
              onClick={async () => {
                if (confirm('Are you absolutely sure? This will wipe your entire NEURALIS footprint.')) {
                  setLoading(true);
                  try {
                    const result = await performNeuralReset(user.uid);
                    toast.success(`Neural Reset Complete. ${result.deleted} nodes purged.`);
                    setLogs(prev => [{
                      timestamp: new Date().toLocaleTimeString(),
                      category: 'DANGER',
                      message: `SYSTEM_WIPE: Executed by ROOT. ${result.deleted} documents removed.`
                    }, ...prev]);
                  } catch (e) {
                    toast.error('Reset protocol failed');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-500 font-mono font-bold tracking-widest px-8"
            >
              EXECUTE_RESET_PROTCOL
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#050505] border-dashed border-red-900/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Infrastructure Telemetry (Simulated K8S/AWS)
          </CardTitle>
          <CardDescription className="text-xs font-mono uppercase">Live event stream from cloud controller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold font-mono text-gray-500 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> COMPUTE NODES
              </h4>
              <div className="space-y-3">
                {[
                  { id: 'aws-node-1', region: 'us-east-1', health: 'Healthy' },
                  { id: 'aws-node-2', region: 'eu-central-1', health: 'Scaling' },
                  { id: 'aws-node-3', region: 'af-south-1', health: 'Healthy' },
                ].map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="font-mono text-xs">
                      <p className="text-white font-bold">{node.id}</p>
                      <p className="text-gray-600 uppercase font-bold text-[9px]">{node.region}</p>
                    </div>
                    <Badge className={node.health === 'Healthy' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                      {node.health.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold font-mono text-gray-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> DEPLOYMENT PIPELINE
              </h4>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Deployment</span>
                  <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest">v4.2.0-STABLE</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  CICD_PIPELINE_IDLE // READY FOR SHIPMENT
                </div>
                <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono uppercase h-10">
                  <Search className="w-3 h-3 mr-2" /> View GitHub Integration
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
