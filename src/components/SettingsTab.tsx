import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/src/lib/LanguageContext';
import { translations, Language } from '@/src/lib/i18n';
import { toast } from 'sonner';

export default function SettingsTab({ user }: { user: any }) {
  const { language, setLanguage, t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  const handleLanguageChange = () => {
    if (selectedLang !== language) {
      setLanguage(selectedLang);
      toast.success(`Language updated to ${selectedLang === 'en' ? 'English' : 'Amharic'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-gray-500 font-mono text-sm uppercase">Afro Space Enterprise Command • User UID: {user.uid.slice(0, 8)}...</p>
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
            { label: 'Integrations', icon: AppWindow },
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
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle>Global Identity</CardTitle>
              <CardDescription>Configure how you appear across the Afro Space ecosystem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center overflow-hidden">
                   {user.photoURL ? <img src={user.photoURL} alt="User" /> : <User className="w-10 h-10 text-gray-700" />}
                </div>
                <div className="space-y-1">
                  <Button variant="outline" className="h-8 border-[#1a1a1a] text-xs">Change Avatar</Button>
                  <p className="text-[10px] text-gray-500 uppercase font-mono">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
              <Separator className="bg-[#1a1a1a]" />
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-gray-600">Full Name</label>
                    <p className="text-sm border-b border-[#1a1a1a] pb-2">{user.displayName}</p>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-gray-600">Email Address</label>
                    <p className="text-sm border-b border-[#1a1a1a] pb-2">{user.email}</p>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-gray-600">Administrative Role</label>
                    <p className="text-sm border-b border-[#1a1a1a] pb-2 text-[#C5A059] font-bold">{user.role}</p>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-gray-600">Multi-tenant ID</label>
                    <p className="text-sm border-b border-[#1a1a1a] pb-2 font-mono">AS-GROUP-MAIN</p>
                 </div>
              </div>
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

          {/* Danger Zone */}
          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between">
                  <div className="max-w-xs">
                    <p className="text-sm font-bold">Resign Admin Clearance</p>
                    <p className="text-xs text-gray-500">This will revoke all CEO privileges and purge your local command node.</p>
                  </div>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white font-bold px-6">
                    Resign Role
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
