import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { 
  Bell, 
  Send, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  UserPlus, 
  Radio,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const socket = io();

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  createdAt: any;
}

export default function NotificationsTab({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('INFO');

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    // Socket listener for real-time flashes
    socket.on('notification', (data) => {
      toast(data.title, {
        description: data.message,
        icon: data.type === 'CRITICAL' ? <ShieldAlert className="text-red-500" /> : <Info className="text-blue-500" />
      });
    });

    return () => {
      unsubscribe();
      socket.off('notification');
    };
  }, []);

  const handleBroadcast = async () => {
    if (user.role !== 'CEO') {
      toast.error('Privilege Escalation Required: Only CEO can dispatch group broadcasts');
      return;
    }
    if (!title || !message) return toast.error('Check broadcast parameters');
    
    try {
      // 1. Save to database for history
      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        type,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });

      // 2. Broadcast via socket for instant popups to ALL connected users
      socket.emit('broadcast', { title, message, type });
      
      toast.success('Global broadcast initiated');
      setTitle('');
      setMessage('');
    } catch (error) {
       toast.error('Strategic broadcast failed');
    }
  };

  const handleAIInsight = async () => {
    const insights = [
      { title: 'AI Strategy Alert', message: 'Your revenue increased by 12% following recent pricing adjustments.', type: 'INFO' },
      { title: 'Autonomous Action Recommended', message: 'AI recommends upgrading pricing for the Enterprise tier due to high utilization.', type: 'WARNING' },
      { title: 'Critical Infrastructure Event', message: 'Traffic spike detected in Nairobi region. Auto-scaling Kubernetes pods...', type: 'CRITICAL' },
      { title: 'Growth Optimization', message: 'Growth Agent has successfully optimized the viral referral system.', type: 'INFO' }
    ];
    
    const insight = insights[Math.floor(Math.random() * insights.length)];
    
    try {
      await addDoc(collection(db, 'notifications'), {
        ...insight,
        senderId: 'AI_AGENT',
        createdAt: serverTimestamp()
      });
      toast.success('AI Insight captured and logged');
    } catch (error) {
      toast.error('AI Insight simulation failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] shadow-[0_0_20px_rgba(197,160,89,0.05)]">
           <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#C5A059] animate-pulse" /> Global Broadcast System
              </CardTitle>
              <CardDescription>Transmit critical directives to all group nodes</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={handleAIInsight}
                  variant="outline"
                  className="w-full border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 h-10 rounded-xl flex items-center gap-2"
                >
                  <BrainCircuit className="w-4 h-4" /> Trigger AI Insight
                </Button>
                
                <Separator className="bg-[#1a1a1a]" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-mono text-gray-500 uppercase">Alert Priority</label>
                 <div className="flex gap-2">
                    {['INFO', 'WARNING', 'CRITICAL'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t as any)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-mono border transition-all ${
                          type === t 
                          ? (t === 'CRITICAL' ? 'bg-red-500/20 border-red-500 text-red-500' : t === 'WARNING' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-blue-500/20 border-blue-500 text-blue-500')
                          : 'bg-black border-[#1a1a1a] text-gray-500 hover:border-gray-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-2">
                 <Input 
                   placeholder="Directive Title" 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="bg-black border-[#1a1a1a] focus:border-[#C5A059]/50" 
                 />
              </div>
              <div className="space-y-2">
                 <textarea 
                   placeholder="Strategic Message..." 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   className="w-full min-h-[120px] bg-black border-[#1a1a1a] rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] placeholder:text-gray-700" 
                 />
              </div>
              <Button 
                onClick={handleBroadcast}
                disabled={user.role !== 'CEO'}
                className="w-full bg-[#C5A059] hover:bg-[#A6864A] text-black font-bold h-12 rounded-xl"
              >
                {user.role === 'CEO' ? 'Authorize & Broadcast' : 'Restricted Access'}
              </Button>
              {user.role !== 'CEO' && <p className="text-[10px] text-red-500 text-center font-mono uppercase">CEO CLEARANCE REQUIRED</p>}
           </CardContent>
        </Card>
      </div>

      {/* Notification Stream */}
      <div className="lg:col-span-2 flex flex-col min-h-[600px]">
        <Card className="flex-1 bg-[#050505] border-[#1a1a1a] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <CardHeader className="border-b border-[#1a1a1a] shrink-0">
             <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-400" /> Command History
                </CardTitle>
                <span className="text-[10px] font-mono text-gray-500">LAST 20 TRANSMISSIONS</span>
             </div>
          </CardHeader>
          <ScrollArea className="flex-1">
             <CardContent className="p-0">
                <div className="divide-y divide-[#1a1a1a]">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-6 hover:bg-white/5 transition-colors flex gap-4 group">
                       <div className="shrink-0 mt-1">
                         {n.type === 'CRITICAL' && <ShieldAlert className="text-red-500 w-5 h-5" />}
                         {n.type === 'WARNING' && <AlertTriangle className="text-yellow-500 w-5 h-5" />}
                         {n.type === 'INFO' && <Info className="text-blue-500 w-5 h-5" />}
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                             <h4 className={`text-sm font-bold ${n.type === 'CRITICAL' ? 'text-red-400' : n.type === 'WARNING' ? 'text-yellow-400' : 'text-blue-400'}`}>
                               {n.title}
                             </h4>
                             <span className="text-[10px] text-gray-600 font-mono">
                               {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString() : 'In Transit'}
                             </span>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed font-light">{n.message}</p>
                          <div className="flex gap-2 pt-2">
                             <Badge variant="outline" className="text-[9px] border-white/5 text-gray-600 group-hover:text-gray-400 transition-colors">
                               VERIFIED_TRANS
                             </Badge>
                             <Badge variant="outline" className="text-[9px] border-white/5 text-gray-600 group-hover:text-[#C5A059] transition-colors">
                               NODE_SYMMETRIC
                             </Badge>
                          </div>
                       </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-12 text-center text-gray-600 font-mono uppercase text-xs tracking-widest">
                       Silent Channel • No Transmissions Detected
                    </div>
                  )}
                </div>
             </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
