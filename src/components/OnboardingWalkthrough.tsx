import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, ChevronRight, Check } from 'lucide-react';

export interface OnboardingWalkthroughProps {
  step: number;
  setStep: (step: number | null) => void;
  userName: string;
  targetShowTitle: string | null;
  onSkip: () => void;
  activeTab: 'all' | 'active' | 'library' | 'queue';
  setActiveTab: (tab: 'all' | 'active' | 'library' | 'queue') => void;
  searchFamily: boolean;
  setSearchFamily: (val: boolean) => void;
  onKeepTargetShow: () => void;
  onDeleteTargetShow: () => void;
  autoDeleteShow: boolean;
  setAutoDeleteShow: (val: boolean) => void;
}

export const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({
  step,
  setStep,
  userName,
  targetShowTitle,
  onSkip,
  activeTab,
  setActiveTab,
  searchFamily,
  setSearchFamily,
  onKeepTargetShow,
  onDeleteTargetShow,
  autoDeleteShow,
  setAutoDeleteShow
}) => {
  const getStepText = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-2">
              <p>
                👉 <strong className="text-white">Step 1/9: Start a show!</strong> Tap <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Watching</span> on the first show card in the list below to move it to your active watchlist.
              </p>
              <label className="flex items-center gap-2 mt-1.5 p-2 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-slate-900/80 transition-all select-none">
                <input
                  type="checkbox"
                  checked={autoDeleteShow}
                  onChange={(e) => setAutoDeleteShow(e.target.checked)}
                  className="accent-purple-500 rounded border-white/10 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Auto-delete this show when tutorial ends</span>
              </label>
            </div>
          </>
        );
      case 2:
        return (
          <>
            🎉 <strong className="text-white">Nice work! Step 2/9: Go to active list.</strong> Now highlight the main tab bar at the top of the workspace. Tap the <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Watching</span> tab to see where it went.
          </>
        );
      case 3:
        return (
          <>
            👉 <strong className="text-white">Step 3/9: Track progress & Banners!</strong> Tap the <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[11px] font-black shadow-sm">+</span> button next to the episode number on <strong className="text-purple-300">{targetShowTitle || 'your show'}</strong> to log an episode. Moving a show into Active automatically creates a billboard banner at the top of the screen!
          </>
        );
      case 4:
        return (
          <>
            🚀 <strong className="text-white">Incredible, {userName}!</strong> See that amazing carousel banner at the top of the screen? Now tap the <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">+ Add Show</span> button at the top of the page.
          </>
        );
      case 5:
        return (
          <>
            🔍 <strong className="text-white">Step 5/9: Manual Add!</strong> Search for a show like <span className="text-blue-300 font-bold">The Simpsons</span>, select its status, and then click the blue <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Add to Watchlist</span> button!
          </>
        );
      case 6:
        return (
          <>
            👀 <strong className="text-white">Step 6/9: Peek at friends!</strong> Scroll down below your tab bar and tap the purple <span className="text-purple-300 font-extrabold uppercase bg-purple-950/50 px-1.5 py-0.5 rounded">Buddy Picks</span> scope filter. (Julio is your first watch buddy!)
          </>
        );
      case 7:
        return (
          <>
            🍿 <strong className="text-white">Step 7/9: Steal a show!</strong> Scroll down Julio's list and click <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">Add to Up Next</span> on any show to copy it to your queue!
          </>
        );
      case 8:
        return (
          <>
            🔙 <strong className="text-white">Step 8/9: Head back!</strong> Tap the <span className="text-slate-200 font-extrabold bg-[#2E333F] px-1.5 py-0.5 rounded">My Board</span> scope switch under filters to return to your board.
          </>
        );
      case 9:
        return (
          <>
            ✨ <strong className="text-white">Step 9/9: Ready to go!</strong> You are officially set to track like a master. Wash, rinse, repeat! Do you want to keep that first show we started, or delete it?
          </>
        );
      default:
        return null;
    }
  };

  const pct = Math.min(100, Math.round((step / 9) * 100));
  const isStep6 = step === 5;

  return (
    <div className={`fixed ${
      isStep6 
        ? 'top-4 bottom-auto left-1/2 -translate-x-1/2 md:top-auto md:bottom-6 md:right-6 md:left-auto md:translate-x-0' 
        : 'bottom-6 left-1/2 -translate-x-1/2 md:bottom-6 md:right-6 md:left-auto md:translate-x-0'
    } w-[92%] max-w-lg bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500 p-4 rounded-2xl shadow-2xl shadow-purple-950/40 z-50 flex flex-col gap-3 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/15 rounded-lg text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-purple-100 tracking-wider">Interactive Tutorial</span>
            <div className="text-[9px] font-bold text-purple-200">Step {step} of 10 ({pct}%)</div>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="text-[10px] font-extrabold uppercase tracking-widest text-purple-200 hover:text-white px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl cursor-pointer transition-all duration-200"
          title="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-purple-950/40 rounded-full overflow-hidden border border-purple-500/10">
        <motion.div
          animate={{ width: `${pct}%` }}
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>

      {/* Instructions */}
      <div className="text-[11px] sm:text-xs text-purple-100 leading-relaxed font-medium bg-black/20 p-3.5 rounded-xl border border-white/5">
        {getStepText()}
      </div>

      {/* Action choices for Step 9 */}
      {step === 9 && (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={onKeepTargetShow}
            className="py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] transition-all text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer border border-amber-400/35"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Keep Show & Finish!
          </button>
          <button
            onClick={onDeleteTargetShow}
            className="py-2 px-3 bg-white/10 hover:bg-white/25 active:scale-[0.98] transition-all text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer border border-white/10"
          >
            Delete Show & Finish
          </button>
        </div>
      )}
    </div>
  );
};
