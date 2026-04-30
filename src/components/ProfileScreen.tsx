import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Save, CheckCircle, Camera } from 'lucide-react';
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

export default function ProfileScreen({ user }: { user: any }) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      // 1. Update Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });

      // 2. Update Firestore Document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      trackEvent('update_profile' as any, { success: true });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      trackEvent('update_profile' as any, { success: false, error: String(error) });
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
            <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none">{t('profile')}</h1>
            <Badge variant="outline" className="w-fit mt-1 border-[#C5A059]/30 text-[#C5A059] px-2 py-0 text-[10px] font-mono bg-[#C5A059]/5">
              SECURE_IDENTITY_NODE
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-[#0a0a0a] border-white/5 lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto w-32 h-32 mb-4 group">
              <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-[#C5A059]/30 bg-[#111]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <User className="w-16 h-16 text-gray-700" />
                  </div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-[#C5A059] text-black rounded-xl hover:scale-110 transition-transform shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <CardTitle className="text-2xl font-black text-white">{user.displayName || 'Unnamed User'}</CardTitle>
            <CardDescription className="text-gray-500 font-mono text-xs uppercase tracking-widest">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{t('role')}</span>
              </div>
              <Badge className="bg-[#C5A059]/20 text-[#C5A059] border-none font-mono text-[10px]">{user.role || 'MEMBER'}</Badge>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">Account Verified</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-white">Identity Confirmed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Save className="w-5 h-5 text-[#C5A059]" />
              {t('edit_profile')}
            </CardTitle>
            <CardDescription className="text-xs font-mono text-gray-500 uppercase tracking-widest">Update your public identity on Afro Space</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t('display_name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 rounded-xl focus:border-[#C5A059]/50 transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t('email_address')}</Label>
                  <div className="relative opacity-50">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-white/[0.03] border-white/10 pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono">Email cannot be changed manually for security reasons.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || displayName === user.displayName}
                  className="bg-[#C5A059] text-black hover:bg-[#C5A059]/80 font-bold h-12 px-8 rounded-xl flex items-center gap-2 group transition-all"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                    />
                  ) : <Save className="w-4 h-4" />}
                  {t('save_changes')}
                </Button>
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-500 font-mono text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('profile_updated')}
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
