import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  LayoutDashboard, 
  PieChart, 
  Bell, 
  Settings, 
  User, 
  BrainCircuit, 
  Globe, 
  Wallet,
  Menu,
  X,
  TrendingUp,
  Rocket,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Sub-components
import NotificationsTab from './components/NotificationsTab';
import SettingsTab from './components/SettingsTab';
import { useTranslation } from './lib/LanguageContext';
import { trackEvent, EventType } from './lib/events';

import { Logo } from './components/Logo';

enum View {
  NEURAL_DISCOVERY = 'neural_discovery',
  DASHBOARD = 'dashboard',
  CLUSTERS = 'clusters',
  AI_COMMAND = 'ai_command',
  INVESTMENTS = 'investments',
  REVENUE = 'revenue',
  GROWTH = 'growth',
  SAAS_OPS = 'saas_ops',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings',
  ADMIN = 'admin',
  ANALYTICS = 'analytics',
  PROFILE = 'profile'
}

const NeuralDiscovery = React.lazy(() => import('./components/NeuralDiscovery'));
const ClusterDashboard = React.lazy(() => import('./components/ClusterDashboard'));
const ClusterDetail = React.lazy(() => import('./components/ClusterDetail'));
const AIControlPanel = React.lazy(() => import('./components/AIControlPanel'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Investments = React.lazy(() => import('./components/Investments'));
const RevenueDashboard = React.lazy(() => import('./components/RevenueDashboard'));
const GrowthEngine = React.lazy(() => import('./components/GrowthEngine'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const SaaSOperations = React.lazy(() => import('./components/SaaSOperations'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const ProfileScreen = React.lazy(() => import('./components/ProfileScreen'));
const Onboarding = React.lazy(() => import('./components/Onboarding'));
const ExitIntentModal = React.lazy(() => import('./components/ExitIntentModal'));

export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    trackEvent(EventType.NAVIGATE, { view: currentView });
  }, [currentView]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'CEO',
            plan: 'free',
            hasCompletedOnboarding: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        } else {
          setUser(userSnap.data());
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleLogout = () => signOut(auth);

  const completeOnboarding = async (data: any) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const updatedUser = { 
      ...user, 
      hasCompletedOnboarding: true,
      selectedClusters: data.clusters 
    };
    await setDoc(userRef, updatedUser);
    setUser(updatedUser);
    toast.success('System Initialized');
  };

  const isPro = user?.plan === 'pro' || user?.plan === 'growth' || user?.plan === 'enterprise';

  if (loading) {
    return (
      <div className="h-screen w-screen bg-neural-bg flex items-center justify-center overflow-hidden">
        <div className="neural-atmosphere" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-8 relative z-10"
        >
          <Logo className="w-32 h-32" />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-display italic tracking-[0.3em] text-white uppercase">NEURALIS</h1>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 h-1 rounded-full bg-neural-accent"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-neural-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="neural-atmosphere" />
        <div className="neural-grid absolute inset-0 opacity-10" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full glass-surface p-12 border border-white/10 flex flex-col items-center text-center gap-10 rounded-[3rem] relative z-10 shadow-2xl"
        >
          <div className="relative group">
            <Logo className="w-40 h-40" />
          </div>
          <div>
            <h1 className="text-5xl font-display italic text-white mb-2 tracking-tight">NEURALIS</h1>
            <p className="text-neural-accent font-mono text-[10px] tracking-[0.6em] uppercase font-bold opacity-70">Global Neural Orchestrator</p>
          </div>
          
          <div className="w-full space-y-6">
            <Button 
              onClick={handleLogin}
              className="w-full bg-neural-accent hover:bg-white text-black font-black h-16 rounded-2xl text-xl transition-all active:scale-95 shadow-xl shadow-neural-accent/10"
            >
              INITIALIZE SYNC
            </Button>
            <div className="flex flex-col gap-1 items-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-medium">Neural Matchmaking • Strategic Hub</p>
              <div className="w-12 h-px bg-white/5" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user && !user.hasCompletedOnboarding) {
    return (
      <React.Suspense fallback={<div className="h-screen w-screen bg-black" />}>
        <Onboarding onComplete={completeOnboarding} />
      </React.Suspense>
    );
  }

  const navItems = [
    { id: View.NEURAL_DISCOVERY, label: 'GLOBAL FEED', icon: Globe, roles: ['CEO', 'MANAGER', 'STAFF'] },
    { id: View.DASHBOARD, label: t('dashboard'), icon: LayoutDashboard, roles: ['CEO', 'MANAGER', 'STAFF'] },
    { id: View.CLUSTERS, label: t('clusters'), icon: Zap, roles: ['CEO', 'MANAGER'] },
    { id: View.AI_COMMAND, label: 'AI COMMAND', icon: BrainCircuit, roles: ['CEO', 'MANAGER'] },
    { id: View.GROWTH, label: 'GROWTH ENGINE', icon: Rocket, roles: ['CEO', 'MANAGER'] },
    { id: View.REVENUE, label: t('revenue_dashboard'), icon: TrendingUp, roles: ['CEO', 'MANAGER'] },
    { id: View.INVESTMENTS, label: 'PORTFOLIO', icon: Wallet, roles: ['CEO', 'MANAGER'] },
    { id: View.ADMIN, label: 'NEURAL OPS', icon: ShieldCheck, roles: ['CEO'] },
    { id: View.PROFILE, label: t('profile'), icon: User, roles: ['CEO', 'MANAGER', 'STAFF'] },
    { id: View.SETTINGS, label: t('settings'), icon: Settings, roles: ['CEO', 'MANAGER', 'STAFF'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="h-screen w-screen bg-neural-bg text-white flex overflow-hidden font-sans selection:bg-neural-accent selection:text-black">
      <Toaster position="top-right" theme="dark" />
      <div className="neural-atmosphere" />
      
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-neural-bg/50 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-20"
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <Logo className="w-12 h-12 shrink-0" iconOnly />
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display italic text-2xl leading-tight truncate text-white">NEURALIS</h2>
                <p className="text-[9px] text-neural-accent font-mono tracking-[0.3em] uppercase truncate opacity-50">Global Orchestrator</p>
              </motion.div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[2rem] transition-all duration-300 group ${
                  currentView === item.id 
                  ? 'glass-surface text-neural-accent shadow-lg shadow-neural-accent/5' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${currentView === item.id ? 'text-neural-accent' : 'group-hover:text-white opacity-50 group-hover:opacity-100'}`} />
                {sidebarOpen && <span className="font-medium text-sm tracking-wide whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#1a1a1a]">
          <button 
            onClick={() => setCurrentView(View.PROFILE)}
            className="w-full flex items-center gap-4 mb-4 overflow-hidden text-left hover:bg-white/5 p-2 rounded-xl transition-all group"
          >
            <div className="min-w-[40px] w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#333] border border-white/10 overflow-hidden shrink-0 group-hover:border-[#C5A059]/50 transition-colors">
              {user.photoURL && <img src={user.photoURL} alt="User" />}
            </div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-[#C5A059] transition-colors">{user.displayName}</p>
                <p className="text-xs text-gray-500 truncate uppercase tracking-tighter">{user.role}</p>
              </motion.div>
            )}
          </button>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={`w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 ${!sidebarOpen && 'px-0 justify-center'}`}
          >
            {sidebarOpen ? 'Terminal Logout' : <X className="w-5 h-5" />}
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-[#1a1a1a] bg-[#050505]/50 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <Separator orientation="vertical" className="h-4 bg-[#1a1a1a]" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-[#C5A059]">
              {navItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className={`hidden md:flex items-center gap-2 text-xs font-mono ${isOffline ? 'text-red-500' : 'text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isOffline ? 'bg-red-500' : 'bg-green-500'}`} />
              {isOffline ? 'SYSTEM OFFLINE // LOCAL CACHE' : 'SYSTEM ONLINE // SECURE NODE'}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'en' ? 'bg-[#C5A059] text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('am')}
                  className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'am' ? 'bg-[#C5A059] text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  አማ
                </button>
              </div>
              <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C5A059] rounded-full border-2 border-[#050505]" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/5 blur-[120px] -z-1" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] -z-1" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto w-full"
            >
              <React.Suspense fallback={<div className="text-neural-accent font-mono animate-pulse">{t('loading_module')}</div>}>
                {currentView === View.NEURAL_DISCOVERY && <NeuralDiscovery />}
                {currentView === View.DASHBOARD && <Dashboard user={user} />}
                {currentView === View.CLUSTERS && (
                  selectedCluster ? (
                    <ClusterDetail clusterId={selectedCluster} onBack={() => setSelectedCluster(null)} />
                  ) : (
                    <ClusterDashboard onSelect={(id) => setSelectedCluster(id)} />
                  )
                )}
                {currentView === View.AI_COMMAND && (
                  isPro ? <AIControlPanel /> : <SaaSOperations user={user} mode="upgrade" />
                )}
                {currentView === View.INVESTMENTS && (
                  isPro ? <Investments user={user} /> : <SaaSOperations user={user} mode="upgrade" />
                )}
                {currentView === View.REVENUE && <RevenueDashboard />}
                {currentView === View.GROWTH && (
                  isPro ? <GrowthEngine /> : <SaaSOperations user={user} mode="upgrade" />
                )}
                {currentView === View.ADMIN && <AdminPanel user={user} />}
                {currentView === View.SAAS_OPS && <SaaSOperations user={user} />}
                {currentView === View.ANALYTICS && <Analytics user={user} />}
                {currentView === View.NOTIFICATIONS && <NotificationsTab user={user} />}
                {currentView === View.SETTINGS && <SettingsTab user={user} />}
                {currentView === View.PROFILE && <ProfileScreen user={user} />}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Glass Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 z-50">
        {[
          { id: View.DASHBOARD, icon: LayoutDashboard },
          { id: View.CLUSTERS, icon: Globe },
          { id: View.AI_COMMAND, icon: BrainCircuit },
          { id: View.REVENUE, icon: TrendingUp },
          { id: View.SETTINGS, icon: Settings }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`transition-all duration-300 ${currentView === item.id ? 'text-[#C5A059] scale-125' : 'text-gray-500'}`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      <React.Suspense fallback={null}>
        <ExitIntentModal />
      </React.Suspense>
    </div>
  );
}
