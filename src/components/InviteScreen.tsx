import React from 'react';
import { motion } from 'motion/react';
import { Share2, Link as LinkIcon, Users, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function InviteScreen() {
  const inviteLink = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Sovereign Invitation Copied');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nexus Universe Sovereign Protocol',
          text: 'Join the world\'s first sovereign all-in-one organizational mastery protocol.',
          url: inviteLink,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neural-accent/20 rounded-xl">
            <Share2 className="w-8 h-8 text-neural-accent" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none">Nexus Spread</h1>
            <p className="text-neural-accent font-mono text-[10px] tracking-[0.5em] uppercase font-bold mt-1 opacity-60">Expand Your Global Dynasty</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#0a0a0a] border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-neural-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader>
            <div className="w-12 h-12 bg-neural-accent/20 rounded-2xl flex items-center justify-center mb-4">
               <LinkIcon className="w-6 h-6 text-neural-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Invitation Nexus</CardTitle>
            <CardDescription className="text-gray-400">Share your entry point to expand the protocol cluster.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                <span className="text-xs font-mono text-neural-accent truncate">{inviteLink}</span>
                <Button variant="ghost" className="shrink-0 hover:bg-neural-accent/20 text-neural-accent" onClick={handleCopyLink}>
                   Copy
                </Button>
             </div>
             <Button className="w-full bg-neural-accent text-black font-black h-16 rounded-2xl text-lg hover:bg-white transition-all shadow-xl shadow-neural-accent/10" onClick={handleShare}>
                <Share2 className="w-5 h-5 mr-3" /> BROADCAST INVITE
             </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
               <Gift className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Protocol Rewards</CardTitle>
            <CardDescription className="text-gray-400">Expand the network to unlock sovereign tier upgrades.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[
                  { level: 'Bronze Hub', requirement: '10 Invitations', reward: 'Advanced Analytics Node', status: 'ACTIVE' },
                  { level: 'Silver Cluster', requirement: '50 Invitations', reward: 'Neural Predictor Alpha', status: 'PENDING' },
                  { level: 'Gold Empire', requirement: '200 Invitations', reward: 'Autonomous Sovereign DAO', status: 'LOCKED' }
                ].map((tier, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${tier.status === 'ACTIVE' ? 'bg-green-500' : tier.status === 'PENDING' ? 'bg-neural-accent' : 'bg-gray-700'}`} />
                        <div>
                           <p className="text-sm font-bold">{tier.level}</p>
                           <p className="text-[10px] text-gray-500 font-mono italic">{tier.reward}</p>
                        </div>
                     </div>
                     <span className={`text-[10px] font-mono font-bold ${tier.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-600'}`}>
                        {tier.requirement}
                     </span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-12 glass-surface border-white/5 rounded-[3rem] text-center space-y-6">
         <h2 className="text-3xl font-display italic text-[#C5A059]">The Law of Network Value</h2>
         <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            "Your dynasty is only as strong as its connections. By bringing others into the Nexus, 
            you increase the sovereign value of your entire organizational cluster."
         </p>
         <div className="flex justify-center gap-12 pt-8 opacity-40">
            <div className="flex flex-col items-center gap-2">
               <Users className="w-8 h-8" />
               <span className="text-[9px] font-mono uppercase tracking-widest font-bold">12.4k Nodes</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-neural-accent">
               <ArrowRight className="w-8 h-8" />
               <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Expansion Mode</span>
            </div>
            <div className="flex flex-col items-center gap-2">
               <CheckCircle className="w-8 h-8" />
               <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Verified Reach</span>
            </div>
         </div>
      </div>
    </div>
  );
}
