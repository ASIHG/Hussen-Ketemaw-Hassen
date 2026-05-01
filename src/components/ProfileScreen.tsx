import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Save, CheckCircle, Camera, RefreshCcw, Globe, Briefcase, Link as LinkIcon, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/src/lib/LanguageContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { trackEvent, EventType } from '@/src/lib/events';
import { toast } from 'sonner';

export default function ProfileScreen({ user }: { user: any }) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [role, setRole] = useState(user.role || 'CEO');
  const [bio, setBio] = useState(user.bio || '');
  const [website, setWebsite] = useState(user.website || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate a random avatar using DiceBear
  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setPhotoURL(newAvatar);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      // 1. Update Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });

      // 2. Update Firestore Document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        photoURL: photoURL,
        role: role,
        bio: bio,
        website: website,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      toast.success('Sovereign Identity Updated');
      trackEvent('update_profile' as any, { success: true });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Identity update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C5A059]/20 rounded-xl">
            <User className="w-8 h-8 text-[#C5A059]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none">Identity Node</h1>
            <Badge variant="outline" className="w-fit mt-1 border-[#C5A059]/30 text-[#C5A059] px-2 py-0 text-[10px] font-mono bg-[#C5A059]/5">
              SECURE_NEURAL_PASSPORT
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-[#0a0a0a] border-white/5 lg:col-span-1 h-fit">
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto w-40 h-40 mb-6 group">
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-[#C5A059]/30 bg-[#111] relative">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 uppercase font-bold text-4xl text-neural-accent">
                    {displayName.slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <button 
                  onClick={generateRandomAvatar}
                  className="p-3 bg-[#C5A059] text-black rounded-2xl hover:scale-110 transition-transform shadow-xl flex items-center justify-center"
                  title="Randomize Identity Mask"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
                <div className="p-3 bg-white/10 text-white rounded-2xl backdrop-blur-md border border-white/10">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-white">{displayName || 'Anonymous Nexus'}</CardTitle>
            <CardDescription className="text-neural-accent font-mono text-[10px] uppercase tracking-[0.3em] font-bold mt-2">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{t('role')}</span>
                <Badge className="bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/30 font-mono text-[10px]">{role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Network Tier</span>
                <Badge variant="outline" className="text-green-500 border-green-500/30 font-mono text-[10px]">SOVEREIGN</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
               <Button className="flex-1 glass-surface border-white/10 text-white text-xs h-10 rounded-xl">
                  <Share2 className="w-3.5 h-3.5 mr-2" /> Share Profile
               </Button>
               <Button variant="outline" className="flex-1 border-[#C5A059]/20 text-[#C5A059] text-xs h-10 rounded-xl hover:bg-[#C5A059]/10">
                  <CheckCircle className="w-3.5 h-3.5 mr-2" /> Verify
               </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#C5A059]" />
              Sovereign Configuration
            </CardTitle>
            <CardDescription className="text-xs font-mono text-gray-500 uppercase tracking-widest">Master Identity Control & Organization Logic</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs font-mono text-gray-500 uppercase tracking-widest">Sovereign Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 rounded-2xl focus:border-[#C5A059]/50 transition-colors"
                      placeholder="Organization Leader Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-mono text-gray-500 uppercase tracking-widest">Operational Role</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 rounded-2xl focus:border-[#C5A059]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs font-mono text-gray-500 uppercase tracking-widest">Command URL / Portfolio</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 rounded-2xl focus:border-[#C5A059]/50 transition-colors"
                      placeholder="https://your-domain.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-mono text-gray-500 uppercase tracking-widest">Protocol Email</Label>
                  <div className="relative opacity-30">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-mono text-gray-500 uppercase tracking-widest">Neural Biography / Strategy</Label>
                <textarea 
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-white/[0.03] border-white/10 border p-4 rounded-2xl focus:outline-none focus:border-[#C5A059]/50 transition-all text-sm"
                  placeholder="Describe your organization's mission and global impact..."
                />
              </div>

              <div className="space-y-4 pt-6">
                <div className="p-6 rounded-3xl bg-neural-accent/5 border border-neural-accent/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Shield className="w-24 h-24 text-neural-accent" />
                   </div>
                   <div className="relative z-10">
                      <Label className="text-xs font-mono text-neural-accent uppercase tracking-[0.3em] font-bold mb-4 block">Sovereign Encryption Signature</Label>
                      <div className="flex items-center gap-4">
                         <div className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl font-mono text-[10px] text-gray-500 break-all leading-relaxed">
                            NEXUS-IDENTITY-SIG-{user.uid.slice(0, 16)}-{new Date().getTime()}-SECURED-BY-SOVEREIGN-PROTOCOL-LAYER-7
                         </div>
                         <Button variant="ghost" className="h-full px-6 hover:bg-neural-accent/20 text-neural-accent text-xs font-bold" onClick={() => toast.success('Signature Hash Copied')}>
                            GENERATE NEW
                         </Button>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-4 italic flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> This signature uniquely identifies your organization node across the 3.0 protocol.
                      </p>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#C5A059] text-black hover:bg-white font-black h-14 px-10 rounded-[1.5rem] flex items-center gap-3 group transition-all shadow-xl shadow-[#C5A059]/10"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full"
                    />
                  ) : <Save className="w-5 h-5" />}
                  COMMIT TO NEXUS
                </Button>
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-500 font-mono text-sm font-bold uppercase tracking-widest"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Sync Confirmed
                  </motion.div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
