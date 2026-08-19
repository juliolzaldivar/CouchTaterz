/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Plus, Check, ArrowRight, X, Tv, Eye, Star, Compass, Users, ChevronDown, Bot } from 'lucide-react';

interface QueueOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasRecommendations?: boolean;
  theme?: 'dark' | 'light';
}

export const QueueOnboardingModal: React.FC<QueueOnboardingModalProps> = ({ isOpen, onClose, hasRecommendations = true, theme = 'dark' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  // Header and Dot helpers to match steps by title
  const getHeaderGradient = (title: string) => {
    if (title === "Discover Your Next Binge") return 'from-purple-600 to-indigo-600';
    if (title === "Organize Your Lists" || title === "Streamline Your Shows") return 'from-amber-500 to-yellow-600';
    if (title === "Track, Rate & Recap" || title === "Never Miss a Beat") return 'from-emerald-500 to-teal-500';
    return 'from-purple-600 to-indigo-600';
  };

  const getDotActiveBg = (title: string) => {
    if (title === "Discover Your Next Binge") return 'bg-purple-500';
    if (title === "Organize Your Lists" || title === "Streamline Your Shows") return 'bg-amber-500';
    if (title === "Track, Rate & Recap" || title === "Never Miss a Beat") return 'bg-emerald-500';
    return 'bg-purple-500';
  };

  const slide1 = {
    title: "Discover Your Next Binge",
    subtitle: "Find & Add Shows",
    accentColor: "text-purple-400",
    colorClass: "from-purple-500/20 to-indigo-500/5 border-purple-500/20",
    btnColor: "bg-purple-600 hover:bg-purple-500 shadow-purple-950/40 border-purple-500/20",
    description: (
      <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
        <div className="flex items-start gap-1.5">
          <span className="text-purple-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Instant Search:</strong> Tap <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white border border-blue-500/20 shadow-sm align-middle mx-1"><Plus className="w-3 h-3 stroke-[2.5]" /></span> anytime to search our huge TV database.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-purple-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Buddy Picks:</strong> Toggle the purple <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[9px] font-extrabold uppercase tracking-wider align-middle mx-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Buddy Picks</span> scope switch to browse what your Binge Buddies are watching and loving.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-purple-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Spudz AI:</strong> Get personalized recommendations from <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider align-middle mx-0.5"><Bot className="w-2.5 h-2.5 animate-pulse" /> Spudz</span>.
          </p>
        </div>
      </div>
    ),
    visual: (
      <div className="relative w-full h-44 bg-[#0F1115] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent opacity-60" />
        
        <div className="flex gap-3 w-full max-w-xs justify-center relative z-10">
          {/* Custom visually rich UI displaying Search, Buddy Picks, and Spudz AI */}
          <div className="w-24 h-36 bg-[#1A1D23] border border-purple-500/20 rounded-xl p-2.5 flex flex-col justify-between shadow-lg rotate-[-6deg] translate-y-2">
            <div className="w-full h-12 bg-purple-950/20 rounded-lg flex items-center justify-center text-purple-400 text-[10px] font-bold border border-purple-500/10">
              <Bot className="w-4 h-4 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="w-10 h-1.5 bg-slate-700 rounded mb-1" />
              <div className="w-7 h-1.5 bg-slate-800 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-black uppercase text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded">SPUDZ AI</span>
            </div>
          </div>

          <div className="w-28 h-38 bg-[#1E222B] border border-purple-500/40 rounded-xl p-2.5 flex flex-col justify-between shadow-2xl relative z-10 scale-105">
            <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-[7px] font-black uppercase text-white px-1.5 py-0.5 rounded-full border border-purple-400/30 flex items-center gap-0.5 shadow-md">
              <Users className="w-2.5 h-2.5" /> BUDDY PICK
            </span>
            <div className="w-full h-16 bg-gradient-to-br from-purple-600/20 to-indigo-600/30 rounded-lg overflow-hidden flex items-center justify-center relative border border-purple-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15),transparent_70%)]" />
              <div className="relative flex items-center justify-center">
                <Tv className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            <div className="mt-1">
              <div className="w-16 h-2 bg-slate-400 rounded mb-1" />
              <div className="w-10 h-1.5 bg-slate-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded">SCI-FI</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                <span className="text-[8px] text-slate-400 font-black">9.2</span>
              </div>
            </div>
          </div>

          <div className="w-24 h-36 bg-[#1A1D23] border border-purple-500/20 rounded-xl p-2.5 flex flex-col justify-between shadow-lg rotate-[6deg] translate-y-2">
            <div className="w-full h-12 bg-blue-950/20 rounded-lg flex items-center justify-center text-blue-400 text-[10px] font-bold border border-blue-500/10">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="w-12 h-1.5 bg-slate-800 rounded mb-1" />
              <div className="w-8 h-1.5 bg-slate-900 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-black uppercase text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">SEARCH</span>
            </div>
          </div>
        </div>
      </div>
    )
  };

  const slide2 = {
    title: "Streamline Your Shows",
    subtitle: "Select Your Status",
    accentColor: "text-amber-500",
    colorClass: "from-amber-500/20 to-yellow-500/5 border-amber-500/20",
    btnColor: "bg-amber-600 hover:bg-amber-500 shadow-amber-950/40 border-amber-500/20",
    description: (
      <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
        <div className="flex items-start gap-1.5">
          <span className="text-amber-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Watching:</strong> Shows you’re currently working through.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Up Next:</strong> Your personal queue for what to watch next.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Watched:</strong> Completed favorites, rated and archived in one place.
          </p>
        </div>
      </div>
    ),
    visual: (
      <div className="relative w-full h-44 bg-[#0F1115] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-60" />
        
        <div className="flex flex-col gap-2 w-full max-w-xs relative z-10">
          {/* Watching item */}
          <div className="bg-[#1E222B] border border-blue-500/20 p-2 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-200">Severance</span>
            </div>
            <span className="text-[8px] font-extrabold text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-500/10 uppercase tracking-wider">Watching</span>
          </div>

          {/* Up Next item */}
          <div className="bg-[#1E222B] border border-amber-500/20 p-2 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-slate-200">The Bear</span>
            </div>
            <span className="text-[8px] font-extrabold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/10 uppercase tracking-wider">Up Next</span>
          </div>

          {/* Watched item */}
          <div className="bg-[#1E222B] border border-emerald-500/20 p-2 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-200">Shogun</span>
            </div>
            <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">Watched</span>
          </div>
        </div>
      </div>
    )
  };

  const slide3 = {
    title: "Never Miss a Beat",
    subtitle: "Track, Rate & Recap",
    accentColor: "text-emerald-400",
    colorClass: "from-emerald-500/20 to-teal-500/5 border-emerald-500/20",
    btnColor: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 border-emerald-500/20",
    description: (
      <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
        <div className="flex items-start gap-1.5">
          <span className="text-emerald-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Air Date Alerts:</strong> Get countdown banners for upcoming episodes.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-emerald-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Easy Progress:</strong> Track episodes watched with a single tap or slider.
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-emerald-400 font-extrabold select-none mt-0.5">•</span>
          <p className="leading-snug">
            <strong className="text-white font-bold">Recaps & Ratings:</strong> Ask <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider align-middle mx-0.5"><Bot className="w-2.5 h-2.5 animate-pulse" /> Spudz</span> for quick season recaps, then rate shows for your buddies!
          </p>
        </div>
        <div className="pt-2 mt-1.5 border-t border-emerald-500/10">
          <p className="text-[11px] font-black text-emerald-400 leading-snug">
            Go through the rest of our picks and start tracking your shows! -- Then go through the rest of our recommendations.
          </p>
        </div>
      </div>
    ),
    visual: (
      <div className="relative w-full h-44 bg-[#0F1115] rounded-2xl border border-white/5 flex flex-col items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent opacity-60" />
        
        <div className="flex flex-col gap-2.5 w-full max-w-xs relative z-10">
          {/* Easy Progress & Air Date alert representation */}
          <div className="bg-[#1E222B] border border-emerald-500/20 p-2.5 rounded-xl space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-200">Andor</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">Airs in 3d 12h</span>
            </div>
            
            {/* Progress slider representation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[8px] text-slate-400">
                <span>EPISODE 8 / 12</span>
                <span className="font-bold text-emerald-400">66%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full relative overflow-hidden">
                <motion.div 
                  animate={{ width: ["30%", "66%", "66%"] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute top-0 left-0 bottom-0 bg-emerald-500 rounded-full" 
                />
              </div>
            </div>
          </div>
 
          {/* Quick Recap & Rating mock bubbles */}
          <div className="flex justify-between items-center bg-[#1A1D23] border border-white/5 px-2.5 py-1.5 rounded-xl text-[8px] text-slate-400 shadow-md">
            <div className="flex items-center gap-1">
              <Bot className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Ask Spudz: "Recap Season 1"</span>
            </div>
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="w-2.5 h-2.5 fill-yellow-500" />
              <Star className="w-2.5 h-2.5 fill-yellow-500" />
              <Star className="w-2.5 h-2.5 fill-yellow-500" />
              <Star className="w-2.5 h-2.5 fill-yellow-500" />
              <Star className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      </div>
    )
  };

  const steps = [slide1, slide2, slide3];

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl flex flex-col ${
          theme === 'dark' ? 'bg-[#1A1D23] border-white/5 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header Decorator */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${getHeaderGradient(step.title)}`} />

        {/* Absolute Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-1.5 rounded-xl transition cursor-pointer border ${
            theme === 'dark' ? 'text-slate-500 hover:text-white hover:bg-[#262A33] border-transparent hover:border-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 border-slate-200/50'
          }`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animate Content Area (Moved to the Top) */}
        <div className="px-6 pt-8 pb-2">
          <div className="min-h-[110px] space-y-2">
            <h2 className={`text-xl font-black leading-tight tracking-tight ${step.accentColor}`}>
              {step.subtitle}
            </h2>
            <h3 className={`text-sm font-bold leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {step.title}
            </h3>
            <div className={`text-xs leading-relaxed font-medium pt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {step.description}
            </div>
          </div>
        </div>

        {/* Visual Showcase (Pre-set Height, Moved Below Text) */}
        <div className="px-6 py-4">
          {step.visual}
        </div>

        {/* Progress dots & Actions (Always at the Bottom) */}
        <div className="px-6 pb-6 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* Progress indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep 
                    ? `w-5 ${getDotActiveBg(s.title)}` 
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white bg-[#262A33] hover:bg-[#313642] border border-white/5 rounded-xl transition cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest text-white rounded-xl transition hover:scale-[1.02] active:scale-[0.98] border cursor-pointer flex items-center gap-1 shadow-lg ${step.btnColor}`}
            >
              <span>{currentStep === totalSteps - 1 ? 'Start Tracking!' : 'Next'}</span>
              {currentStep === totalSteps - 1 ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
