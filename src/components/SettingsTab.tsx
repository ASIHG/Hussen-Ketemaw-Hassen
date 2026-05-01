import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Shield, 
  Globe, 
  Bell, 
  CreditCard, 
  Trash2, 
  LogOut,
  AppWindow,
  Key,
  Languages,
  ArrowRight,
  Eye,
  Rocket,
  Zap,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/src/lib/LanguageContext';
import { translations, Language } from '@/src/lib/i18n';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Input } from '@/components/ui/input';

export default function SettingsTab({ user }: { user: any }) {
  const { language, setLanguage, t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for profile editing
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    role: user?.role || 'CEO',
    phoneNumber: user?.phoneNumber || ''
  });

  const handleLanguageChange = () => {
    if (selectedLang !== language) {
      setLanguage(selectedLang);
      toast.success(`Language updated to ${selectedLang === 'en' ? 'English' : 'Amharic'}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        bio: profileData.bio,
        role: profileData.role,
        phoneNumber: profileData.phoneNumber,
        updatedAt: new Date().toISOString()
      });
      toast.success('Sovereign Identity Synchronized');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Identity sync failed. Please check network uplink.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-gray-500 font-mono text-sm uppercase">NEXUS UNIVERSE SOVEREIGN COMMAND • User UID: {user.uid.slice(0, 8)}...</p>
        </div>
        <Badge className="bg-[#C5A059] text-black font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest border-0">
          PRO ACCOUNT
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {[
            { label: 'Profile', icon: User, active: true },
            { label: 'Security', icon: Shield },
            { label: 'Billing', icon: CreditCard },
            { label: 'Notifications', icon: Bell },
            { label: 'Language', icon: Languages },
            { label: 'Global Publish', icon: Globe },
            { label: 'System Recovery', icon: Zap },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                item.active ? 'bg-[#C5A059]/10 text-[#C5A059] font-bold' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* User Profile */}
          <Card className="bg-[#0a0a0a] border-[#1a1a1a] overflow-hidden">
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Global Identity</CardTitle>
                  <CardDescription>Configure how you appear across the Afro Space ecosystem.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`border-neural-accent/20 ${isEditing ? 'bg-neural-accent text-black' : 'hover:bg-neural-accent/10'}`}
                >
                  {isEditing ? 'Discard Changes' : 'Update Identity'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-[#111] border-2 border-dashed border-[#C5A059]/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#C5A059]">
                     {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-700" />}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-neural-accent text-black p-1.5 rounded-xl border-4 border-black">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-white tracking-tight">{user.displayName}</p>
                  <p className="text-xs text-[#C5A059] font-mono uppercase tracking-[0.2em]">{user.role || 'CEO'}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">{user.email}</p>
                </div>
              </div>
              
              <Separator className="bg-[#1a1a1a]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono text-gray-600 tracking-widest block">Full Legal Name</label>
                    {isEditing ? (
                      <Input 
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="bg-black border-[#1a1a1a] focus:border-neural-accent"
                      />
                    ) : (
                      <p className="text-sm border-b border-transparent pb-1 text-white font-medium">{user.displayName || 'Not Set'}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono text-gray-600 tracking-widest block">Professional Bio</label>
                    {isEditing ? (
                      <textarea 
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full bg-black border border-[#1a1a1a] rounded-lg p-3 text-sm outline-none focus:border-neural-accent min-h-[42px]"
                        placeholder="Visionary Leader at Nexus..."
                      />
                    ) : (
                      <p className="text-sm border-b border-transparent pb-1 text-gray-400 italic">"{user.bio || 'Architect of the future.'}"</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono text-gray-600 tracking-widest block">Administrative Role</label>
                    {isEditing ? (
                      <select 
                        value={profileData.role}
                        onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                        className="w-full bg-black border border-[#1a1a1a] rounded-lg h-10 px-3 text-sm outline-none focus:border-neural-accent"
                      >
                        <option value="CEO">CHIEF EXECUTIVE OFFICER</option>
                        <option value="MANAGER">PLANETARY MANAGER</option>
                        <option value="STAFF">PROTOCOL OPERATIVE</option>
                        <option value="ADMIN">SYSTEM OVERSEER</option>
                      </select>
                    ) : (
                      <p className="text-sm border-b border-transparent pb-1 text-[#C5A059] font-black uppercase tracking-wider">{user.role || 'CEO'}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono text-gray-600 tracking-widest block">Communication Link</label>
                    {isEditing ? (
                      <Input 
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        className="bg-black border-[#1a1a1a] focus:border-neural-accent"
                        placeholder="+251 ..."
                      />
                    ) : (
                      <p className="text-sm border-b border-transparent pb-1 font-mono">{user.phoneNumber || 'Node not linked'}</p>
                    )}
                  </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-[#1a1a1a] flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-neural-accent hover:bg-white text-black font-black px-8 h-12 rounded-2xl transition-all"
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>RECODING...</span>
                      </div>
                    ) : (
                      'SYNCHRONIZE IDENTITY'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Localized settings and interface behaviors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Primary Interface Language</p>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-tighter">Current: {language === 'en' ? 'English' : 'Amharic'}</p>
                    </div>
                  </div>
                  <select 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value as Language)}
                    className="bg-black border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#C5A059] transition-colors"
                  >
                    <option value="en">English (US)</option>
                    <option value="am">Amharic (አማርኛ)</option>
                  </select>
                </div>

                {/* Translation Preview */}
                <div className={`p-4 rounded-2xl border transition-all duration-500 ${
                  selectedLang !== language 
                  ? 'bg-[#C5A059]/5 border-[#C5A059]/20' 
                  : 'bg-white/[0.02] border-white/5 opacity-40 grayscale'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Translation Preview: {selectedLang === 'en' ? 'English' : 'Amharic'}</span>
                    </div>
                    {selectedLang !== language && (
                      <Badge variant="outline" className="text-[8px] bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20 font-mono">PENDING CHANGE</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'dashboard', val: translations[selectedLang].dashboard },
                      { key: 'ai_ceo', val: translations[selectedLang].ai_ceo },
                      { key: 'investments', val: translations[selectedLang].investments },
                      { key: 'admin_panel', val: translations[selectedLang].admin_panel },
                      { key: 'revenue', val: translations[selectedLang].revenue },
                      { key: 'mission_archive', val: translations[selectedLang].mission_archive }
                    ].map((item) => (
                      <div key={item.key} className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                        <p className="text-[8px] font-mono text-gray-600 uppercase">{item.key.replace('_', ' ')}</p>
                        <p className="text-xs font-bold text-white truncate">{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {selectedLang !== language && (
                    <div className="mt-4 pt-4 border-t border-[#C5A059]/10">
                      <Button 
                        onClick={handleLanguageChange}
                        className="w-full bg-[#C5A059] hover:bg-[#A6864A] text-black font-bold h-10 rounded-xl flex items-center justify-center gap-2"
                      >
                        Confirm Language Shift <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-[#1a1a1a]" />
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium">Biometric Authentication</p>
                   <p className="text-xs text-gray-500">Require fingerprint/faceID for high-value transactions.</p>
                </div>
                <div className="w-10 h-5 bg-blue-500 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <Separator className="bg-[#1a1a1a]" />
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium">Real-time Data Stream</p>
                   <p className="text-xs text-gray-500">Keep analytics nodes synced in background.</p>
                </div>
                <div className="w-10 h-5 bg-green-500 rounded-full relative">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Publish & Deployment */}
          <Card className="bg-[#0a0a0a] border-neural-accent/20 border">
            <CardHeader>
              <CardTitle className="text-neural-accent">Global Publish & Deployment</CardTitle>
              <CardDescription>Deploy your sovereign instance to the world market.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-2xl bg-neural-accent/5 border border-neural-accent/10 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-neural-accent/10 text-neural-accent">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-lg">PWA Installation Protocol</p>
                    <p className="text-sm text-gray-400">NEXUS UNIVERSE is built as a high-fidelity Progressive Web App. You don't need an App Store to "download" it.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> IOS INSTALL
                    </div>
                    <p className="text-[11px] text-gray-400">Open in Safari → Share Icon → <span className="text-white font-bold">Add to Home Screen</span></p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> ANDROID INSTALL
                    </div>
                    <p className="text-[11px] text-gray-400">Open in Chrome → Tap Menu (⋮) → <span className="text-white font-bold">Install App</span></p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Production Access Link</p>
                  <p className="text-[10px] font-mono text-neural-accent truncate max-w-[200px] md:max-w-md">
                    {window.location.origin}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs border-neural-accent/20 hover:bg-neural-accent hover:text-black shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    toast.success('Live link copied to clipboard');
                  }}
                >
                  Copy Link
                </Button>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs text-blue-400 font-medium mb-2">Pro Tip for Samsung & Android Users:</p>
                <ul className="text-[10px] text-gray-500 space-y-1 list-disc pl-4">
                  <li>Open the copied link in <strong>Chrome</strong> on your phone.</li>
                  <li>Tap the <strong>three dots (⋮)</strong> in the top right corner.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>The app will now appear on your phone's home screen for permanent use.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Logout & Identity Security */}
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
               <div>
                  <CardTitle>Session Control</CardTitle>
                  <CardDescription>Manage your current access terminal state.</CardDescription>
               </div>
               <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-mono text-[10px]">ACTIVE SESSION</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                        <LogOut className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-sm font-bold">Terminal Logout</p>
                        <p className="text-xs text-gray-500">Disconnect this node from the Nexus.</p>
                     </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => {
                        toast.info('Closing Sovereign Tunnel...', {
                            onAutoClose: () => window.location.reload()
                        });
                        import('@/src/lib/firebase').then(m => m.auth.signOut());
                    }}
                  >
                    DISCONNECT
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* Master Reset / New Organization */}
          <Card className="bg-red-500/5 border-red-500/20 overflow-hidden relative">
            <div className="absolute inset-0 neural-grid opacity-5" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                    <ShieldAlert className="w-5 h-5" />
                 </div>
                 <CardTitle className="text-red-500 font-black tracking-tighter uppercase italic">SOVEREIGN PROTOCOL WIPE</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Wipe all records and reset the Nexus to its Zero-Discovery state. 
                This action is irreversible and prepares the terminal for a new global dynasty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full h-16 rounded-2xl font-black text-lg bg-red-600 hover:bg-white hover:text-red-600 transition-all shadow-xl shadow-red-900/20 group relative overflow-hidden"
                onClick={() => {
                  const confirmLabel = 'PURGE_NEXUS_ROOT';
                  const userInput = window.prompt(`Type "${confirmLabel}" to confirm total protocol dissolution.`);
                  if (userInput === confirmLabel) {
                    const purge = async () => {
                      if (user?.uid) {
                        const userRef = doc(db, 'users', user.uid);
                        await updateDoc(userRef, {
                          displayName: '',
                          bio: '',
                          role: 'CEO',
                          phoneNumber: '',
                          hasCompletedOnboarding: false,
                          selectedClusters: [],
                          updatedAt: new Date().toISOString()
                        });
                      }
                      return new Promise(resolve => setTimeout(resolve, 3000));
                    };

                    toast.promise(
                      purge(),
                      {
                        loading: 'Dissolving Neural Clusters and Purging Ledgers...',
                        success: 'Nexus Restored to Zero. Application will reboot in Sovereign Mode.',
                        error: 'Purge Failed.'
                      }
                    );
                    setTimeout(() => window.location.reload(), 5000);
                  }
                }}
              >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <Trash2 className="w-6 h-6 mr-3" /> INITIATE TOTAL PROTOCOL WIPE
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
