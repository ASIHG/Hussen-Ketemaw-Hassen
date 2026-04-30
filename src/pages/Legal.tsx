import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';

export default function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const isPrivacy = type === 'privacy';
  
  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          {isPrivacy ? <Eye /> : <Shield />}
        </div>
        <div>
          <h1 className="text-4xl font-black">{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">AfroSpace Protocol v1.0</p>
        </div>
      </div>
      
      <div className="prose prose-invert max-w-none space-y-6 text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" /> Data Sovereignty
          </h2>
          <p>
            AfroSpace utilizes AWS-shielded infrastructure and encrypted WebSocket tunnels to ensure that your business intelligence remains private. 
            All AI decisions are processed within your VPC (Virtual Private Cloud).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
          <p>
            We collect real-time telemetry from your connected business nodes to provide the AI growth suggestions visible on your dashboard. 
            This includes revenue trends, user growth metrics, and active agent performance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">2. AI Automation Disclosure</h2>
          <p>
            AfroSpace AI agents act as "Suggestions Only" in the current protocol version. 
            Manual approval is required for any significant financial or structural changes suggested by the AI worker engine.
          </p>
        </section>
        
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-12">
          <p className="text-xs text-gray-500 italic">
            Last Updated: April 29, 2026. This document is a required legal artifact for App Store and Play Store compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
