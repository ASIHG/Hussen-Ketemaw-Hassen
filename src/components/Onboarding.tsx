import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  ChevronRight, 
  Globe, 
  BrainCircuit, 
  ShieldCheck, 
  Check,
  Zap,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trackEvent, EventType } from '@/src/lib/events';
import { useTranslation } from '@/src/lib/LanguageContext';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to AfroSpace 🚀',
    desc: 'The executive command center for multi-cluster growth.',
    icon: Rocket,
    color: 'text-[#C5A059]'
  },
  {
    id: 'clusters',
    title: 'Select Your Focus',
    desc: 'Which business clusters will you dominate today?',
    icon: Globe,
    color: 'text-blue-500'
  },
  {
    id: 'ai_setup',
    title: 'Neural Linkage',
    desc: 'Let AI configure your strategic oversight system.',
    icon: BrainCircuit,
    color: 'text-purple-500'
  },
  {
    id: 'complete',
    title: 'System Ready',
    desc: 'Your dashboard is primed for global operations.',
    icon: ShieldCheck,
    color: 'text-green-500'
  }
];

export default function Onboarding({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(0);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleNext = () => {
    if (step < steps.length - 1) {
      trackEvent(`onboarding_step_${steps[step].id}` as any);
      setStep(step + 1);
    } else {
      trackEvent(EventType.SIGNUP, { clusters: selectedClusters });
      onComplete({ clusters: selectedClusters });
    }
  };

  const toggleCluster = (id: string) => {
    setSelectedClusters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-xl w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-4 rounded-3xl bg-white/[0.03] border border-white/5`}>
                <currentStep.icon className={`w-12 h-12 ${currentStep.color}`} />
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="border-[#C5A059]/30 text-[#C5A059] font-mono text-[10px] tracking-widest uppercase">
                  Step {step + 1} // {currentStep.id}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  {currentStep.title}
                </h1>
                <p className="text-gray-500 font-medium">{currentStep.desc}</p>
              </div>
            </div>

            {currentStep.id === 'clusters' && (
              <div className="grid grid-cols-2 gap-3">
                {['Real Estate', 'Mining', 'Agri-Tech', 'SaaS', 'Trade', 'Services'].map((cluster) => (
                  <button
                    key={cluster}
                    onClick={() => toggleCluster(cluster)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedClusters.includes(cluster) 
                        ? 'border-[#C5A059] bg-[#C5A059]/10 text-white' 
                        : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{cluster}</span>
                      {selectedClusters.includes(cluster) && <Check className="w-4 h-4 text-[#C5A059]" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 'ai_setup' && (
              <div className="space-y-4">
                {[
                  { label: 'Neural Mapping', value: 94 },
                  { label: 'Market Prediction', value: 87 },
                  { label: 'Economic Synergy', value: 91 }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: i * 0.2, duration: 1.5 }}
                        className="h-full bg-[#C5A059]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep.id === 'complete' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <OnboardingStat icon={Zap} label="Growth" value="+28%" />
                <OnboardingStat icon={TrendingUp} label="Efficiency" value="94%" />
                <OnboardingStat icon={LayoutDashboard} label="Nodes" value="Active" />
              </div>
            )}

            <Button 
              onClick={handleNext}
              className="w-full h-14 bg-[#C5A059] text-black hover:bg-[#C5A059]/80 font-black text-lg rounded-2xl group"
            >
              {step === steps.length - 1 ? 'LAUNCH SYSTEM' : 'CONTINUE'}
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-[#C5A059]' : 'w-4 bg-white/10'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingStat({ icon: Icon, label, value }: any) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
        <Icon className="w-5 h-5 text-[#C5A059]" />
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono text-gray-500 uppercase">{label}</p>
          <p className="text-xl font-black text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
