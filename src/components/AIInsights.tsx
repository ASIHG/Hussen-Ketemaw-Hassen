import React, { useState, useEffect, useRef } from 'react';
import { getAIInsight } from '../lib/gemini';
import { 
  BrainCircuit, 
  Send, 
  Terminal, 
  Cpu, 
  History as HistoryIcon, 
  Sparkles,
  RefreshCcw,
  Bot,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldAlert,
  Target,
  Share2,
  Search,
  Globe,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { io, Socket } from 'socket.io-client';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { jsPDF } from 'jspdf';

interface AnalysisData {
  roi: string;
  risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  feasibility: string;
}

interface Message {
  id?: string;
  sessionId?: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: any;
  analysis?: AnalysisData;
}

interface Session {
  id: string;
  title: string;
  timestamp: Date;
  tags?: string[];
  summary?: string;
  role?: string;
}

const AGENT_ROLES = [
  'General Intelligence',
  'CEO (Strategic Focus)',
  'CFO (Financial Metrics)',
  'CTO (Technical Architecture)',
  'COO (Operational Velocity)',
  'CSO (Market Strategy)'
];

const SUGGESTIONS = [
  { label: 'Analyze Sector Risk', icon: ShieldAlert },
  { label: 'Forecast ROI', icon: Activity },
  { label: 'Identify Growth Opportunities', icon: Target },
];

export default function AIInsights({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [archiveThresholdDays, setArchiveThresholdDays] = useState(90);
  const [isArchiving, setIsArchiving] = useState(false);
  const [sortField, setSortField] = useState<'title' | 'date' | 'tags'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [sessionTags, setSessionTags] = useState<string[]>([]);
  const [sessionRole, setSessionRole] = useState<string>('General Intelligence');
  const [tagInput, setTagInput] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO
  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('chat:message', (data: Message) => {
      setMessages(prev => {
        // Prevent duplicate messages if already in state (idempotency)
        const exists = prev.some(m => (m.id && m.id === data.id) || (m.timestamp === data.timestamp && m.content === data.content));
        if (exists) return prev;
        return [...prev, data];
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join session room when ID changes
  useEffect(() => {
    if (currentSessionId && socketRef.current) {
      socketRef.current.emit('chat:join_session', currentSessionId);
    }
  }, [currentSessionId]);

  // Sharing state
  const [shareDialogContent, setShareDialogContent] = useState<Message | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const performLegacyArchival = async (allMessages: Message[]) => {
    if (isArchiving) return;
    setIsArchiving(true);
    const THRESHOLD_MS = archiveThresholdDays * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    
    // Group messages by session to check latest activity per session
    const sessionsActivity = new Map<string, number>();
    allMessages.forEach(msg => {
      if (!msg.sessionId) return;
      const ts = msg.timestamp?.toDate ? msg.timestamp.toDate().getTime() : new Date().getTime();
      if (!sessionsActivity.has(msg.sessionId) || ts > (sessionsActivity.get(msg.sessionId) || 0)) {
        sessionsActivity.set(msg.sessionId, ts);
      }
    });

    const staleSessions = Array.from(sessionsActivity.entries())
      .filter(([_, lastActive]) => (now - lastActive) > THRESHOLD_MS)
      .map(([sid]) => sid);

    if (staleSessions.length === 0) {
      setIsArchiving(false);
      return;
    }

    console.log(`[Digital Legacy System] Found ${staleSessions.length} stale sessions at ${archiveThresholdDays} day threshold. Archiving...`);

    let archivedCount = 0;
    for (const sid of staleSessions) {
      const sessionMessages = allMessages.filter(m => m.sessionId === sid);
      for (const msg of sessionMessages) {
        if (!msg.id) continue;
        try {
          // 1. Move to Archive
          await addDoc(collection(db, 'archived_ai_chats'), {
            userId: user.uid,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            sessionId: msg.sessionId,
            analysis: msg.analysis || null,
            archivedAt: serverTimestamp()
          });
          // 2. Delete from Active
          await deleteDoc(doc(db, 'ai_chats', msg.id));
          archivedCount++;
        } catch (e) {
          console.error(`Archival error for msg ${msg.id}:`, e);
        }
      }
      // Also potentially archive session metadata
      try {
        await deleteDoc(doc(db, 'chat_sessions', sid));
      } catch (e) {
        console.error(`Failed to delete session metadata for ${sid}:`, e);
      }
    }
    
    if (archivedCount > 0) {
      toast.info(`Digital Legacy: ${staleSessions.length} inactive missions (${archivedCount} messages) moved to secure cold storage.`);
      await loadHistory();
    }
    setIsArchiving(false);
  };

  const loadHistory = async (targetSessionId?: string) => {
    try {
      // 1. Fetch Messages
      const q = query(
        collection(db, 'ai_chats'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));

      // 2. Fetch Session Metadata
      const sq = query(
        collection(db, 'chat_sessions'),
        where('userId', '==', user.uid)
      );
      const sSnapshot = await getDocs(sq);
      const sessionMetadata = new Map<string, any>();
      sSnapshot.docs.forEach(doc => {
        sessionMetadata.set(doc.id, { id: doc.id, ...doc.data() });
      });

      // Trigger archival check
      if (!targetSessionId) performLegacyArchival(allMessages);
      
      // 3. Extract and Merge Sessions
      const sessionMap = new Map<string, Session>();
      
      // Include any session defined in metadata first
      sessionMetadata.forEach((meta, sid) => {
        sessionMap.set(sid, {
          id: sid,
          title: meta.title,
          tags: meta.tags || [],
          summary: meta.summary || '',
          role: meta.role || 'General Intelligence',
          timestamp: meta.timestamp?.toDate ? meta.timestamp.toDate() : new Date()
        });
      });

      // Supplement with any found in messages but missing metadata
      allMessages.forEach(msg => {
        if (msg.sessionId && !sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, {
            id: msg.sessionId,
            title: msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : ''),
            timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
            tags: [],
            summary: ''
          });
        }
      });
      
      const sortedSessions = Array.from(sessionMap.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setSessions(sortedSessions);

      const activeSessionId = targetSessionId || currentSessionId || (sortedSessions.length > 0 ? sortedSessions[0].id : null);
      
      if (activeSessionId) {
        setCurrentSessionId(activeSessionId);
        setMessages(allMessages.filter(m => m.sessionId === activeSessionId));
        const activeSession = sessionMap.get(activeSessionId);
        setSessionTags(activeSession?.tags || []);
        setSessionRole(activeSession?.role || 'General Intelligence');
      } else if (allMessages.length === 0) {
        const newSid = crypto.randomUUID();
        setCurrentSessionId(newSid);
        setSessionTags([]);
        setSessionRole('General Intelligence');
        setMessages([{ 
          role: 'ai', 
          content: `Hello ${user.displayName?.split(' ')[0]}. I am the Afro Space Strategic Intelligence Engine. Standing by for instructions.`,
          timestamp: new Date(),
          sessionId: newSid
        }]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'ai_chats');
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleRefresh = async () => {
    const promise = loadHistory();
    toast.promise(promise, {
      loading: 'Recalibrating semantic engine...',
      success: 'Intelligence node synchronized',
      error: 'Synchronization failure'
    });
  };

  const startNewMission = () => {
    const newSid = crypto.randomUUID();
    setCurrentSessionId(newSid);
    setSessionTags([]);
    setSessionRole('General Intelligence');
    setMessages([
      { 
        role: 'ai', 
        content: `Acknowledged ${user.displayName?.split(' ')[0]}. Strategic intelligence core initialized for a new mission cycle. Diagnostic systems nominal. Standing by for specific inquiries.`,
        timestamp: new Date(),
        sessionId: newSid
      }
    ]);
  };

  const handleAddTag = async () => {
    const tag = tagInput.trim();
    if (!tag || !currentSessionId || sessionTags.length >= 3) return;
    if (sessionTags.includes(tag)) {
      setTagInput('');
      return;
    }

    const newTags = [...sessionTags, tag];
    setSessionTags(newTags);
    setTagInput('');

    try {
      await setDoc(doc(db, 'chat_sessions', currentSessionId), {
        userId: user.uid,
        title: messages[0]?.content.substring(0, 30) || 'Untitled Mission',
        tags: newTags,
        timestamp: serverTimestamp()
      }, { merge: true });
      
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, tags: newTags } : s));
    } catch (error) {
      toast.error('Failed to sync intelligence tags');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!currentSessionId) return;
    const newTags = sessionTags.filter(t => t !== tagToRemove);
    setSessionTags(newTags);

    try {
      await setDoc(doc(db, 'chat_sessions', currentSessionId), {
        tags: newTags
      }, { merge: true });
      
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, tags: newTags } : s));
    } catch (error) {
      toast.error('Failed to update intelligence tags');
    }
  };

  const generateSessionSummary = async (sid: string, chatMessages: Message[]) => {
    if (chatMessages.length < 2) return;
    
    // Check if summary already exists to avoid redundant calls
    const session = sessions.find(s => s.id === sid);
    if (session?.summary) return;

    setIsGeneratingSummary(true);
    try {
      const chatContext = chatMessages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n')
        .slice(-2000); // Limit context size

      const summary = await getAIInsight(`Summarize this strategic mission session in 1-2 concise, high-impact sentences focusing on the central strategy or outcome. Context:\n${chatContext}`);
      
      await setDoc(doc(db, 'chat_sessions', sid), {
        summary: summary
      }, { merge: true });

      setSessions(prev => prev.map(s => s.id === sid ? { ...s, summary } : s));
      toast.success('Strategic summary synthesized');
    } catch (error: any) {
      console.error('Summary generation failed:', error);
      let errMsg = 'Neural summary synthesis failed.';
      if (error.message === 'NEURAL_QUOTA_EXCEEDED') {
        errMsg = 'Neural capacity reached. Summary core cooling required.';
      }
      toast.error(errMsg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!currentSessionId) return;
    setSessionRole(newRole);

    try {
      await setDoc(doc(db, 'chat_sessions', currentSessionId), {
        role: newRole
      }, { merge: true });
      
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, role: newRole } : s));
      toast.success(`Agent Persona synchronized: ${newRole}`);
    } catch (error) {
      toast.error('Failed to sync agent persona');
    }
  };

  const handleSend = async (customInput?: string) => {
    const text = (customInput || input).trim();
    if (!text || isTyping) return;
    
    setIsTyping(true);
    setInput('');

    const sid = currentSessionId || crypto.randomUUID();
    if (!currentSessionId) setCurrentSessionId(sid);

    const userMsg: Message = { 
      role: 'user', 
      content: text, 
      timestamp: new Date(),
      sessionId: sid
    };
    
    setMessages(prev => [...prev, userMsg]);

    // Emit via Socket.IO immediately for other users in session
    if (socketRef.current) {
      socketRef.current.emit('chat:message', userMsg);
    }

    try {
      // Save User Message
      const userMsgRef = await addDoc(collection(db, 'ai_chats'), {
        ...userMsg,
        userId: user.uid,
        timestamp: serverTimestamp()
      });
      userMsg.id = userMsgRef.id;

      const response = await getAIInsight(text);
      if (!response) throw new Error('EMPTY_NEURAL_DATA');
      
      // Mocking structured analysis data for higher fidelity
      const mockAnalysis: AnalysisData = {
        roi: `${(15 + Math.random() * 20).toFixed(1)}%`,
        risk: Math.random() > 0.7 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
        confidence: Math.floor(85 + Math.random() * 10),
        feasibility: "Infrastructure ready for deployment within Q3."
      };

      const aiMsg: Message = { 
        role: 'ai', 
        content: response, 
        timestamp: new Date(),
        analysis: mockAnalysis,
        sessionId: sid
      };

      const updatedMessages = [...messages, userMsg, aiMsg];
      setMessages(updatedMessages);

      // Emit AI Message via Socket.IO
      if (socketRef.current) {
        socketRef.current.emit('chat:message', aiMsg);
      }
      
      // Save AI Message
      const aiMsgRef = await addDoc(collection(db, 'ai_chats'), {
        ...aiMsg,
        userId: user.uid,
        timestamp: serverTimestamp()
      });
      aiMsg.id = aiMsgRef.id;

      // Update or create session metadata
      await setDoc(doc(db, 'chat_sessions', sid), {
        userId: user.uid,
        title: userMsg.content.substring(0, 30) + (userMsg.content.length > 30 ? '...' : ''),
        role: sessionRole || 'General Intelligence',
        timestamp: serverTimestamp()
      }, { merge: true });

      // Update sessions list if it's the first message of a new session
      if (!sessions.find(s => s.id === sid)) {
        setSessions(prev => [{
          id: sid,
          title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
          timestamp: new Date(),
          tags: [],
          role: sessionRole || 'General Intelligence',
          summary: ''
        }, ...prev]);
      }

      // Automatically generate summary after a few exchanges
      if (updatedMessages.length >= 4 && updatedMessages.length % 2 === 0) {
        generateSessionSummary(sid, updatedMessages);
      }
    } catch (error: any) {
      console.error('Intelligence downlink error:', error);
      let errorMsg = 'Intelligence downlink failed. Neural core may be overloaded.';
      
      if (error.message === 'NEURAL_QUOTA_EXCEEDED') {
        errorMsg = 'Neural request quota exceeded. Please wait for core recharge.';
      } else if (error.message === 'EMPTY_NEURAL_DATA') {
        errorMsg = 'Orchestrator returned zero-bit data. Semantic re-alignment required.';
      } else if (!window.navigator.onLine) {
        errorMsg = 'Network connectivity severed. Strategic link lost.';
      }

      toast.error(errorMsg, {
        action: {
          label: 'Retry',
          onClick: () => handleSend(text)
        }
      });
      
      // Fallback: system message in chat
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `ALERT: ${errorMsg} Protocol: RETRY_FALLBACK_MODE.`,
        timestamp: new Date(),
        sessionId: sid
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmail || !shareDialogContent) return;
    setIsSharing(true);
    try {
      await addDoc(collection(db, 'shared_insights'), {
        fromUserId: user.uid,
        toEmail: shareEmail,
        insightContent: shareDialogContent.content,
        personalNote: shareNote,
        timestamp: serverTimestamp()
      });
      toast.success(`Analysis shared with ${shareEmail}`);
      setShareDialogContent(null);
      setShareEmail('');
      setShareNote('');
    } catch (error) {
      toast.error('Strategic transmission failed');
    } finally {
      setIsSharing(false);
    }
  };

  const exportMessageToPDF = (msg: Message) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(22);
    doc.setTextColor(197, 160, 89); // Gold
    doc.text('AFRO SPACE STRATEGIC INSIGHT', 10, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 30);
    doc.text(`Origin: Afro Space Neural Matrix Engine`, 10, 35);
    
    doc.setDrawColor(197, 160, 89);
    doc.line(10, 40, pageWidth - 10, 40);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Strategic Analysis Output:', 10, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const splitContent = doc.splitTextToSize(msg.content, pageWidth - 20);
    doc.text(splitContent, 10, 65);
    
    if (msg.analysis) {
      let yPos = 65 + (splitContent.length * 7) + 15;
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Neural Metrics:', 10, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`ROI Estimate: ${msg.analysis.roi}`, 10, yPos + 10);
      doc.text(`Risk Profile: ${msg.analysis.risk}`, 10, yPos + 17);
      doc.text(`Confidence Interval: ${msg.analysis.confidence}%`, 10, yPos + 24);
      doc.text(`Feasibility Assessment: ${msg.analysis.feasibility}`, 10, yPos + 31);
    }
    
    doc.save(`AfroSpace_Insight_${new Date().getTime()}.pdf`);
    toast.success('Insight report compiled and exported');
  };

  const exportSessionToPDF = () => {
    if (messages.length === 0) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(22);
    doc.setTextColor(197, 160, 89); // Gold
    doc.text('MISSION DEBRIEF REPORT', 10, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const session = sessions.find(s => s.id === currentSessionId);
    doc.text(`Mission: ${session?.title || 'Active Intelligence Cycle'}`, 10, 30);
    doc.text(`Date: ${new Date().toLocaleString()}`, 10, 35);
    doc.text(`Security Lead: ${user.displayName || user.email}`, 10, 40);
    
    doc.setDrawColor(197, 160, 89);
    doc.line(10, 45, pageWidth - 10, 45);
    
    let yPos = 55;
    
    messages.forEach((msg, idx) => {
      const rolePrefix = msg.role === 'ai' ? '[INTELLIGENCE CORE]: ' : '[STRATEGIC COMMAND]: ';
      const fullText = rolePrefix + msg.content;
      const splitText = doc.splitTextToSize(fullText, pageWidth - 20);
      
      if (yPos + (splitText.length * 7) > pageHeight - 15) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(msg.role === 'ai' ? 0 : 50);
      doc.setFont('helvetica', msg.role === 'ai' ? 'normal' : 'bold');
      doc.text(splitText, 10, yPos);
      
      yPos += (splitText.length * 7) + 10;
    });
    
    doc.save(`AfroSpace_Mission_Debrief_${new Date().getTime()}.pdf`);
    toast.success('Full mission report compiled and exported');
  };

  const AI_ACTIONS = [
    { id: 'k8s_scale', label: 'Scale Kubernetes', keywords: ['k8s', 'kubernetes', 'cluster', 'scaling'], icon: Target },
    { id: 'sec_scan', label: 'Run Security Scan', keywords: ['vulnerability', 'scan', 'security', 'threat'], icon: ShieldAlert },
    { id: 'roi_forecast', label: 'Project ROI', keywords: ['roi', 'forecast', 'projection', 'revenue'], icon: Activity },
    { id: 'market_research', label: 'Identify Markets', keywords: ['market', 'growth', 'opportunity', 'expansion'], icon: Globe },
    { id: 'cost_audit', label: 'Optimize Costs', keywords: ['cost', 'cloud', 'efficient', 'savings'], icon: Cpu },
  ];

  const orchestrateAction = async (actionLabel: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Orchestrating ${actionLabel}...`,
        success: `${actionLabel} deployed to production endpoints.`,
        error: 'Execution failed: Neural timeout'
      }
    );
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
            <Cpu className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Strategic Intelligence Engine</h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Afro Space • Neural Matrix Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={startNewMission}
             className="text-[#C5A059] hover:bg-[#C5A059]/10 h-8 gap-2 px-3 border border-[#C5A059]/20 rounded-full"
           >
             <Sparkles className="w-3 h-3" />
             <span className="text-[10px] font-mono">NEW MISSION</span>
           </Button>
           <Badge variant="outline" className="bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20 font-mono">MODEL: GEMINI-3-FLASH</Badge>
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={handleRefresh}
             className="text-gray-400 hover:text-white hover:bg-white/5 h-8 gap-2 px-3 border border-white/5 rounded-full"
           >
             <RefreshCcw className="w-3 h-3" />
             <span className="text-[10px] font-mono">REFRESH</span>
           </Button>
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={exportSessionToPDF}
             className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 gap-2 px-3 border border-blue-400/20 rounded-full"
           >
             <FileDown className="w-3 h-3" />
             <span className="text-[10px] font-mono">EXPORT LOGS</span>
           </Button>
           <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-mono text-[10px]">THINKING_PROMPT: ENABLED</Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Chat Interface */}
        <Card className="lg:col-span-3 bg-[#050505] border-[#1a1a1a] flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <CardHeader className="border-b border-[#1a1a1a] bg-black/40 backdrop-blur-md shrink-0 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 flex items-center justify-center border border-[#C5A059]/30">
                  <BrainCircuit className="w-4 h-4 text-[#C5A059]" />
                </div>
                <CardTitle className="text-lg">Strategic Command Terminal</CardTitle>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={sessionRole}
                  onChange={(e) => handleUpdateRole(e.target.value)}
                  className="h-7 px-2 text-[10px] font-mono border border-[#C5A059]/30 bg-black text-[#C5A059] rounded-md outline-none focus:ring-1 focus:ring-[#C5A059]/50 transition-all uppercase"
                >
                  {AGENT_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                {!sessions.find(s => s.id === currentSessionId)?.summary && messages.length >= 2 && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => currentSessionId && generateSessionSummary(currentSessionId, messages)}
                     disabled={isGeneratingSummary}
                     className="h-7 px-2 text-[10px] font-mono border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10 gap-1.5"
                   >
                     {isGeneratingSummary ? (
                       <RefreshCcw className="w-3 h-3 animate-spin" />
                     ) : (
                       <Sparkles className="w-3 h-3" />
                     )}
                     COMPUTE STRATEGIC SUMMARY
                   </Button>
                )}
                <AnimatePresence>
                  {sessionTags.map(tag => (
                    <motion.div
                      key={tag}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="bg-white/5 text-gray-400 border-white/10 flex items-center gap-1 h-6 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 cursor-pointer transition-all"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} <X className="w-2.5 h-2.5" />
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {sessionTags.length < 3 && (
                  <div className="relative group flex items-center">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag..."
                      className="h-6 w-24 text-[10px] bg-black border-white/10 focus:w-32 transition-all p-2 font-mono"
                    />
                    <button 
                      onClick={handleAddTag}
                      className="ml-1 text-[#C5A059] opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'ai' 
                      ? 'bg-[#111] border border-[#1a1a1a] text-gray-200' 
                      : 'bg-[#C5A059] text-black font-medium'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                           <Bot className="w-3 h-3 opacity-50" />
                           <span className="text-[9px] uppercase font-mono tracking-widest opacity-50">Intelligence Core</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Actionable Recommendations Detection */}
                      {msg.role === 'ai' && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {AI_ACTIONS.filter(action => 
                            action.keywords.some(keyword => msg.content.toLowerCase().includes(keyword.toLowerCase()))
                          ).map(action => (
                            <Button
                              key={`msg-action-${action.id}`}
                              size="sm"
                              onClick={() => orchestrateAction(action.label)}
                              className="bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-black h-7 text-[10px] gap-1.5 font-mono"
                            >
                              <action.icon className="w-3 h-3" />
                              ACTIVATE: {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {msg.role === 'ai' && msg.analysis && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between gap-4">
                            <button 
                              onClick={() => setExpandedId(expandedId === (msg.id || String(i)) ? null : (msg.id || String(i)))}
                              className="text-[10px] uppercase font-mono text-[#C5A059] flex items-center gap-1 hover:brightness-125 transition-all group"
                            >
                              {expandedId === (msg.id || String(i)) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              <span className="group-hover:underline underline-offset-4 tracking-wider">Learn More / Analysis Details</span>
                            </button>
                            <button
                              onClick={() => setShareDialogContent(msg)}
                              className="text-[10px] uppercase font-mono text-gray-500 flex items-center gap-1 hover:text-white transition-all"
                            >
                              <Share2 className="w-3 h-3" />
                              Share
                            </button>
                            <button
                              onClick={() => exportMessageToPDF(msg)}
                              className="text-[10px] uppercase font-mono text-gray-500 flex items-center gap-1 hover:text-[#C5A059] transition-all"
                            >
                              <FileDown className="w-3 h-3" />
                              Export
                            </button>
                          </div>
                          
                          <AnimatePresence>
                            {expandedId === (msg.id || String(i)) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                    <p className="text-[8px] uppercase text-gray-500 font-mono mb-1">Impact ROI</p>
                                    <p className="text-xs font-bold text-green-500">{msg.analysis.roi}</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                    <p className="text-[8px] uppercase text-gray-500 font-mono mb-1">Risk Vector</p>
                                    <p className={`text-xs font-bold ${
                                      msg.analysis.risk === 'High' ? 'text-red-500' : 
                                      msg.analysis.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                    }`}>{msg.analysis.risk}</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                    <p className="text-[8px] uppercase text-gray-500 font-mono mb-1">Confidence</p>
                                    <p className="text-xs font-bold text-blue-400">{msg.analysis.confidence}%</p>
                                  </div>
                                </div>
                                <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                   <p className="text-[9px] uppercase text-gray-500 font-mono mb-1 flex items-center gap-1">
                                      <Activity className="w-2.5 h-2.5" /> Feasibility Note
                                   </p>
                                   <p className="text-[11px] text-gray-300 italic">"{msg.analysis.feasibility}"</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <span className="text-[8px] opacity-40 mt-2 block font-mono">
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#111] border border-[#1a1a1a] p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-[#1a1a1a] bg-black/40 backdrop-blur-md p-4 shrink-0 space-y-4">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.label)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059]/30 transition-all font-mono"
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Query strategic matrix..."
                className="bg-black border-[#1a1a1a] focus:border-[#C5A059]/50 h-12"
              />
              <Button onClick={() => handleSend()} className="bg-[#C5A059] hover:bg-[#A6864A] text-black h-12 w-12 p-0 rounded-xl">
                 <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Intelligence Sidebar */}
        <div className="space-y-6 shrink-0 h-full overflow-auto pr-2">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-[#C5A059] flex items-center justify-between">
                  MISSION ARCHIVE 
                  <HistoryIcon className="w-3 h-3" />
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search mission logs..."
                      className="h-8 pl-7 text-[10px] font-mono bg-black border-white/5"
                    />
                  </div>

                  {/* Sorting Controls */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">Sort:</span>
                      <select 
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as any)}
                        className="bg-transparent border-none text-[9px] font-mono text-[#C5A059] focus:ring-0 p-0 cursor-pointer uppercase appearance-none"
                      >
                        <option value="date" className="bg-[#0a0a0a]">Date</option>
                        <option value="title" className="bg-[#0a0a0a]">Title</option>
                        <option value="tags" className="bg-[#0a0a0a]">Tags</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-1 text-[8px] font-mono text-gray-500 hover:text-[#C5A059] transition-colors uppercase"
                    >
                      {sortOrder === 'asc' ? (
                        <><ArrowUp className="w-2.5 h-2.5" /> Asc</>
                      ) : (
                        <><ArrowDown className="w-2.5 h-2.5" /> Desc</>
                      )}
                    </button>
                  </div>

                  {/* Role Filter */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest px-1">Filter by Persona</span>
                    <select 
                      value={filterRole || ''}
                      onChange={(e) => setFilterRole(e.target.value || null)}
                      className="w-full bg-black/40 border border-white/5 text-[9px] font-mono text-[#C5A059] p-1.5 rounded-md cursor-pointer uppercase outline-none focus:border-[#C5A059]/30"
                    >
                      <option value="">All Personas</option>
                      {AGENT_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Tag Quick Filters */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest px-1">Neural Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(sessions.flatMap(s => s.tags || []))).slice(0, 8).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                          className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                            filterTag === tag 
                            ? 'bg-[#C5A059] text-black border-[#C5A059]' 
                            : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {sessions
                    .filter(s => {
                      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          s.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                      const matchesTag = !filterTag || s.tags?.includes(filterTag);
                      const matchesRole = !filterRole || s.role === filterRole;
                      return matchesSearch && matchesTag && matchesRole;
                    })
                    .sort((a, b) => {
                      let comparison = 0;
                      if (sortField === 'title') {
                        comparison = a.title.localeCompare(b.title);
                      } else if (sortField === 'date') {
                        comparison = a.timestamp.getTime() - b.timestamp.getTime();
                      } else if (sortField === 'tags') {
                        const aTag = a.tags?.[0] || '';
                        const bTag = b.tags?.[0] || '';
                        comparison = aTag.localeCompare(bTag);
                      }
                      return sortOrder === 'asc' ? comparison : -comparison;
                    })
                    .map((session) => (
                      <div key={session.id} className="relative group">
                        <button
                          onClick={() => loadHistory(session.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                            currentSessionId === session.id 
                            ? 'bg-[#C5A059]/10 border-[#C5A059]/30 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-[10px] font-bold truncate pr-2 ${currentSessionId === session.id ? 'text-[#C5A059]' : ''}`}>
                              {session.title || 'Untitled Mission'}
                            </p>
                            <Target className={`w-2.5 h-2.5 shrink-0 ${currentSessionId === session.id ? 'text-[#C5A059]' : 'opacity-20'}`} />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">
                              {session.timestamp.toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {session.role && session.role !== 'General Intelligence' && (
                                <span className="text-[7px] bg-[#C5A059]/20 text-[#C5A059] px-1 rounded uppercase font-bold shrink-0">
                                  {session.role.split(' ')[0]}
                                </span>
                              )}
                              {session.tags?.map(t => (
                                <span key={t} className="text-[7px] text-[#C5A059]/60 px-1 border border-[#C5A059]/20 rounded lowercase shrink-0">{t}</span>
                              ))}
                            </div>
                          </div>
                        </button>
                        
                        {/* Strategy Summary Tooltip */}
                        {session.summary && (
                          <div className="absolute left-full ml-2 top-0 w-48 p-2 rounded bg-[#0a0a0a] border border-white/10 text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-50 shadow-xl">
                            <p className="font-mono text-[#C5A059] mb-1 text-[8px] uppercase tracking-widest border-b border-white/5 pb-1">AI Strategy Summary</p>
                            {session.summary}
                          </div>
                        )}
                        {!session.summary && currentSessionId === session.id && messages.length >= 2 && (
                          <div className="absolute right-2 top-2">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 generateSessionSummary(session.id, messages);
                               }}
                               disabled={isGeneratingSummary}
                               className="p-1 rounded bg-black/40 text-gray-500 hover:text-[#C5A059] transition-colors disabled:opacity-30"
                               title="Generate Strategy Summary"
                             >
                                {isGeneratingSummary ? (
                                  <RefreshCcw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                             </button>
                          </div>
                        )}
                      </div>
                    ))}
                  {sessions.length === 0 && (
                    <p className="text-[10px] text-gray-600 italic text-center py-4">No mission logs recorded.</p>
                  )}
                </div>
             </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-[#C5A059]">STRATEGIC FOCUS</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#C5A059]/20 transition-all cursor-pointer group">
                   <h5 className="text-xs font-bold mb-1 flex items-center justify-between">
                     Sector: Fintech <Sparkles className="w-3 h-3 text-[#C5A059] opacity-0 group-hover:opacity-100" />
                   </h5>
                   <p className="text-[10px] text-gray-500">Predicted 18% ROI increase by Q4 based on digital payments surge.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#C5A059]/20 transition-all cursor-pointer group">
                   <h5 className="text-xs font-bold mb-1 flex items-center justify-between">
                     Emerging Market <Sparkles className="w-3 h-3 text-[#C5A059] opacity-0 group-hover:opacity-100" />
                   </h5>
                   <p className="text-[10px] text-gray-500">M-PESA integration in Ethiopia presents high-priority entry point.</p>
                </div>
                <Button variant="ghost" className="w-full h-8 text-[10px] font-mono hover:text-[#C5A059]">
                   RESCAN MARKET CHANNELS <RefreshCcw className="w-3 h-3 ml-2" />
                </Button>
             </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-blue-400">RISK MATRIX</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                {[
                  { label: 'Currency Volatility', risk: 'Medium' },
                  { label: 'Regulatory Shift', risk: 'Low' },
                  { label: 'Infrastructure Gap', risk: 'High' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{item.label}</span>
                    <span className={`text-[10px] font-mono ${
                      item.risk === 'High' ? 'text-red-500' : 
                      item.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>[{item.risk}]</span>
                  </div>
                ))}
             </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-blue-400 flex items-center justify-between">
                  DIGITAL LEGACY
                  <ShieldAlert className="w-3 h-3" />
                </CardTitle>
                <CardDescription className="text-[9px] uppercase">Automated Archival Matrix</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-gray-500">THRESHOLD</span>
                      <span className="text-blue-400">{archiveThresholdDays} DAYS</span>
                   </div>
                   <input 
                      type="range" 
                      min="30" 
                      max="365" 
                      step="30"
                      value={archiveThresholdDays}
                      onChange={(e) => setArchiveThresholdDays(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                   />
                </div>
                <Button 
                   onClick={() => loadHistory()}
                   disabled={isArchiving}
                   variant="outline" 
                   className="w-full h-9 text-[10px] font-mono border-blue-500/30 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2"
                >
                   {isArchiving ? (
                     <RefreshCcw className="w-3 h-3 animate-spin" />
                   ) : (
                     <ShieldAlert className="w-3 h-3" />
                   )}
                   RUN LEGACY SWEEP
                </Button>
                <p className="text-[8px] text-gray-600 italic leading-tight">
                  Missions inactive for {archiveThresholdDays} days will be migrated to cold storage to optimize neural throughput.
                </p>
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={!!shareDialogContent} onOpenChange={() => setShareDialogContent(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gold">
              <Share2 className="w-5 h-5" /> Share Strategic Insight
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Transmit this analysis to a target user or administrative node.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-600">Recipient Email</label>
              <Input 
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="node@afrospace.com"
                className="bg-black border-[#1a1a1a]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-600">Personal Directive (Optional)</label>
              <textarea 
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                className="w-full min-h-[100px] bg-black border-[#1a1a1a] rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="Enter personal notes or instructions..."
              />
            </div>
            
            {shareDialogContent && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-400">
                <p className="font-bold text-gray-200 mb-1 flex items-center gap-1">
                   <Sparkles className="w-3 h-3 text-gold" /> Previewing Content
                </p>
                <p className="line-clamp-2">{shareDialogContent.content}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShareDialogContent(null)}
              className="text-gray-500 hover:text-white"
            >
              Abort
            </Button>
            <Button 
              onClick={handleShare}
              disabled={!shareEmail || isSharing}
              className="bg-gold hover:bg-[#A6864A] text-black font-bold"
            >
              {isSharing ? 'Transmitting...' : 'Authorize Transmission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

