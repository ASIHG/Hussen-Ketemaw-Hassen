import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Cpu, 
  Heart, 
  Mic, 
  Share2, 
  Sparkles, 
  Users, 
  History, 
  ShieldCheck,
  ArrowUpRight,
  Zap,
  Network,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from './Logo';
import { toast } from 'sonner';

interface NexusLegacy {
  name: string;
  role: string;
  contribution: string;
  impactScore: number;
}

const LEGACIES: NexusLegacy[] = [
  { name: "Abebe Kasahun", role: "Elder / Storyteller", contribution: "Preserved 400 years of oral history", impactScore: 98 },
  { name: "Sarah Chen", role: "Biotech Architect", contribution: "Shared open-source enzymatic discovery", impactScore: 85 },
  { name: "Global Harmony Node", role: "Collective", contribution: "Neural sync for cross-continental peace", impactScore: 92 }
];

export default function NexusProtocol() {
  const [pulse, setPulse] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'universal' | 'heritage' | 'sync' | 'messenger'>('universal');
  const [messages, setMessages] = useState([
    { from: "AI_CEO", text: "Global Node Alpha: Ethiopia expansion confirmed. Neural sync at 100%.", time: "14:02" },
    { from: "Nexus_System", text: "Sovereign protocol encrypted. No data leakage detected.", time: "14:05" },
    { from: "Heritage_Vault", text: "New wisdom block discovered in Lalibela node.", time: "14:10" }
  ]);

  const NEURAL_STREAM = [
    { type: 'STRATEGIC_WIN', title: 'East African Tech Corridor Online', location: 'Addis Ababa', impact: '+25% Region ROI', icon: Zap },
    { type: 'SCIENTIFIC_DISCOVERY', title: 'Neural Agriculture Yield Optimized', location: 'Nairobi Hub', impact: 'Food Security +40%', icon: Sparkles },
    { type: 'ECONOMIC_SHIFT', title: 'Decentralized Sovereign Currency Peak', location: 'Global Nexus', impact: '1.2T Transaction Volume', icon: Globe }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleHeritageRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("HERITAGE CAPTURE INITIATED: AI Listening for Ancestral Wisdom...");
    } else {
      toast.success("LEGACY ENCRYPTED: Wisdom transmitted to the Global Vault.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white p-8 font-sans selection:bg-[#C5A059] selection:text-black">
      {/* Revolutionary Header */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="max-w-2xl">
          <Badge className="bg-[#C5A059] text-black font-black text-[10px] tracking-[0.3em] uppercase mb-4 py-1 px-4">
            The Nexus Protocol // ኒክሰስ ፕሮቶኮል
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display italic tracking-tighter leading-none mb-6">
            Beyond Social Media. <br />
            <span className="text-[#C5A059]">The Era of Human Value.</span>
          </h1>
          <p className="text-lg text-gray-500 font-light max-w-lg leading-relaxed">
            Unifying the human race through a single, realistic ledger of purpose. No ads, no scrolling—only contribution and global strategic expansion.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="p-6 glass-surface border-[#C5A059]/20 flex flex-col items-end">
            <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest">Global Human Sync</span>
            <span className="text-4xl font-display italic">99.98%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* left Column: The Pulse of Humanity */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <Card className="bg-[#050505] border-white/5 overflow-hidden relative min-h-[600px]">
             <div className="absolute inset-0 neural-grid opacity-10" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
             
             <div className="relative z-20 p-10 h-full flex flex-col justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={activeTab === 'universal' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('universal')}
                    className={activeTab === 'universal' ? 'bg-[#C5A059] text-black border-none' : 'border-white/10 text-white'}
                  >
                    <Globe className="w-4 h-4 mr-2" /> Global Pulse
                  </Button>
                  <Button 
                    variant={activeTab === 'messenger' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('messenger')}
                    className={activeTab === 'messenger' ? 'bg-[#C5A059] text-black border-none' : 'border-white/10 text-white'}
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Sovereign Messenger
                  </Button>
                  <Button 
                    variant={activeTab === 'heritage' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('heritage')}
                    className={activeTab === 'heritage' ? 'bg-[#C5A059] text-black border-none' : 'border-white/10 text-white'}
                  >
                    <History className="w-4 h-4 mr-2" /> Heritage Vault
                  </Button>
                </div>

                <div className="mt-8 flex-1">
                  <AnimatePresence mode="wait">
                    {activeTab === 'universal' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                         <h2 className="text-3xl font-display italic text-[#C5A059]">Global Neural Stream</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {NEURAL_STREAM.map((item, i) => (
                              <div key={i} className="p-5 rounded-2xl glass-surface border-white/5 space-y-4 hover:border-[#C5A059]/30 transition-all cursor-pointer group">
                                <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:bg-[#C5A059]/20">
                                  <item.icon className="w-5 h-5 text-[#C5A059]" />
                                </div>
                                <div>
                                  <Badge className="bg-[#C5A059]/10 text-[#C5A059] text-[8px] uppercase tracking-widest border-0 p-0 mb-2">{item.type}</Badge>
                                  <h3 className="font-bold text-white text-sm leading-tight">{item.title}</h3>
                                  <p className="text-[10px] text-gray-500 font-mono mt-2">{item.location} • {item.impact}</p>
                                </div>
                              </div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                    {activeTab === 'messenger' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="h-[500px] flex flex-col bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 relative overflow-hidden"
                      >
                         <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#C5A059]/10 to-transparent pointer-events-none" />
                         
                         <div className="p-8 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 rounded-2xl bg-neural-accent/20 border border-neural-accent/30 flex items-center justify-center relative">
                                  <Network className="w-7 h-7 text-neural-accent" />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse" />
                               </div>
                               <div>
                                  <h3 className="text-xl font-black text-white italic tracking-tight">Sovereign Neural Stream</h3>
                                  <div className="flex items-center gap-2">
                                     <p className="text-[10px] text-neural-accent font-mono uppercase tracking-[0.3em] font-bold">Encrypted Nexus Hub</p>
                                     <div className="w-1 h-1 bg-neural-accent rounded-full animate-ping" />
                                  </div>
                               </div>
                            </div>
                            <Badge className="bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30 font-mono text-[9px] uppercase tracking-widest px-3 py-1">Root Access Authorized</Badge>
                         </div>

                         <div className="flex-1 space-y-6 overflow-y-auto mb-4 p-8 scrollbar-hide relative z-10">
                            <div className="flex flex-col items-center justify-center h-full opacity-10 space-y-4">
                               <Logo className="w-32 h-32" />
                            </div>
                            {messages.map((msg, i) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: msg.from === 'AI_CEO' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex flex-col ${msg.from === 'AI_CEO' ? 'items-end' : 'items-start'}`}
                              >
                                 <div className={`p-5 rounded-[2rem] max-w-[85%] border shadow-xl ${
                                   msg.from === 'AI_CEO' 
                                     ? 'bg-[#C5A059] border-[#A6864A] text-black font-medium' 
                                     : 'bg-white/[0.03] border-white/10 text-white'
                                 }`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-60">
                                       <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em]">{msg.from}</span>
                                       <span className="text-[8px] font-mono">• {msg.time}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                 </div>
                              </motion.div>
                            ))}
                         </div>

                         <div className="p-8 bg-black/60 border-t border-white/5 relative z-10">
                            <div className="flex gap-4">
                               <Input 
                                 placeholder="Execute Sovereign Command..." 
                                 className="flex-1 bg-white/[0.03] border-white/10 border-2 rounded-2xl h-16 px-6 text-sm font-mono focus:border-[#C5A059]/50 transition-all"
                               />
                               <Button className="bg-[#C5A059] hover:bg-white text-black h-16 w-16 rounded-2xl transition-all shadow-xl shadow-[#C5A059]/10">
                                  <Zap className="w-6 h-6" />
                               </Button>
                            </div>
                            <div className="flex items-center gap-4 mt-4 px-2">
                               <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest font-black">Cluster Operations:</p>
                               <div className="flex gap-2">
                                  {['/AI_STRATEGY', '/SYNC_LEDGER', '/NETWORK_EXPAND'].map(cmd => (
                                    <button key={cmd} className="text-[9px] font-mono text-[#C5A059] hover:text-white transition-colors bg-[#C5A059]/5 px-2 py-1 rounded border border-[#C5A059]/20">{cmd}</button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                   <h2 className="text-4xl font-display italic mb-4">The Universal Skill Bridge</h2>
                   <p className="text-gray-400 max-w-lg mb-8 italic">"Traditional social media profited from your distraction. The Nexus Protocol profits from your actual talent. A direct peer-to-peer neural marketplace."</p>
                   
                   <div className="flex gap-12">
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Humanity ROI</p>
                        <p className="text-3xl font-bold font-display text-neural-accent">+14,200%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Wisdom Blocks</p>
                        <p className="text-3xl font-bold font-display">8.4 Trillion</p>
                      </div>
                      <Button className="ml-auto bg-white/5 border border-white/10 hover:bg-white/10 h-14 px-8 rounded-2xl group transition-all">
                        Contribute Talent <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Button>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column: Heritage & Legacy Capture */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Card className="bg-[#C5A059] text-black border-none min-h-[300px] flex flex-col p-8 rounded-[2rem] relative overflow-hidden">
            <Fingerprint className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Family Legacy <br />Vault</h3>
            <p className="text-sm font-medium mb-8 opacity-80">Capture your elders' stories before they vanish. The AI transforms memory into an immortal digital heritage asset for future generations.</p>
            
            <div className="mt-auto">
              <Button 
                onClick={handleHeritageRecord}
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 transition-all ${isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-black text-white hover:bg-black/90'}`}
              >
                {isRecording ? <Mic className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                <span className="font-bold uppercase tracking-widest text-xs">
                  {isRecording ? 'Capturing Wisdom...' : 'Start Heritage Session'}
                </span>
              </Button>
            </div>
          </Card>

          <Card className="bg-[#050505] border-white/5 flex-1 p-8 rounded-[2rem] flex flex-col">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Users className="w-4 h-4 text-[#C5A059]" />
              Impact Leaders
            </h3>
            <div className="flex flex-col gap-4">
              {LEGACIES.map((legacy, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059] font-bold text-xs">
                    {legacy.impactScore}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{legacy.name}</p>
                    <p className="text-[9px] text-gray-500 font-mono uppercase truncate">{legacy.contribution}</p>
                  </div>
                  <Share2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Irreplaceable Mission Ticker */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-[#C5A059] text-black flex items-center overflow-hidden z-50">
        <motion.div 
          className="flex whitespace-nowrap gap-20 items-center px-8"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 font-black uppercase text-[10px] tracking-[0.2em]">
               <span className="flex items-center gap-2 font-mono"><Users className="w-3 h-3" /> Collective Intelligence Engine Active</span>
               <span className="flex items-center gap-2 font-mono"><ShieldCheck className="w-3 h-3" /> Sovereign Identity Verified</span>
               <span className="flex items-center gap-2 font-mono"><Cpu className="w-3 h-3" /> Neural Fabric Integration: 100%</span>
               <span className="flex items-center gap-2 font-mono"><Heart className="w-3 h-3" /> Global Empathy Index rising</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
