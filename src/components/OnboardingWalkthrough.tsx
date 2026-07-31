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
  const [isMinimized, setIsMinimized] = React.useState(false);

  const getStepText = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-2">
              <p>
                👉 <strong className="text-white">Step 1/4: Start a show!</strong> Tap <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Watching</span> on the first show card below to move it to your Active board.
              </p>
              <label className="flex items-center gap-2 mt-1.5 p-2 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:border-purple-500/35 hover:bg-slate-900/80 transition-all select-none">
                <input
                  type="checkbox"
                  checked={autoDeleteShow}
                  onChange={(e) => setAutoDeleteShow(e.target.checked)}
                  className="accent-purple-500 rounded border-white/10 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Auto-delete test show when tutorial ends</span>
              </label>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="space-y-1.5">
              <p>
                🍿 <strong className="text-white">Step 2/4: Switched to Watching!</strong> Notice your show moved from <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Up Next</span> (orange) to <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Watching</span> (blue) at the top!
              </p>
              <p className="text-[11px] text-purple-100/90 leading-relaxed">
                Tap the <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[11px] font-black shadow-sm">+</span> button next to the episode count on <strong className="text-amber-300">{targetShowTitle || 'your show'}</strong> below to log an episode. Shows in Watching also feature in your top hero billboard!
              </p>
            </div>
          </>
        );
      case 3:
        return (
          <>
            🔍 <strong className="text-white">Step 3/4: Add & Discover!</strong> Tap <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase">+ Add Show</span> at the top to search any title, or switch to <span className="text-purple-300 font-extrabold uppercase bg-purple-950/60 px-1.5 py-0.5 rounded">Buddy Picks</span> inside the modal to borrow a show from friends!
          </>
        );
      case 4:
        return (
          <>
            ✨ <strong className="text-white">Step 4/4: You're all set!</strong> You now know how to track status, log progress, showcase hero banners, and discover recommendations. Ready to dive in?
          </>
        );
      default:
        return null;
    }
  };

  const pct = Math.min(100, Math.round((step / 4) * 100));

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 md:bottom-4 md:left-6 md:right-auto md:translate-x-0 bg-gradient-to-r from-purple-700 to-indigo-700 border border-purple-400/50 px-4 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-3 backdrop-blur-md animate-fade-in">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span className="text-xs font-black text-white">Step {step}/4 ({pct}%)</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all"
        >
          Expand
        </button>
      </div>
    );
  }

  const isLowProfile = step === 1 || step === 2;

  return (
    <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 md:bottom-4 md:left-6 md:right-auto md:translate-x-0 w-[calc(100%-1.5rem)] sm:w-[92%] max-w-lg bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 border border-purple-400/60 rounded-2xl shadow-2xl shadow-purple-950/60 z-50 flex flex-col transition-all duration-300 ${
      isLowProfile ? 'p-3 gap-2 backdrop-blur-md' : 'p-4 gap-3'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/15 rounded-lg text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-purple-100 tracking-wider">Interactive Tutorial</span>
            <span className="text-[9px] font-extrabold text-amber-300 ml-2">Step {step} of 4 ({pct}%)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 hover:text-white px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-lg cursor-pointer transition-all duration-200"
            title="Minimize tutorial card"
          >
            Minimize
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 hover:text-white px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-lg cursor-pointer transition-all duration-200"
            title="Skip onboarding"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-purple-950/50 rounded-full overflow-hidden border border-purple-500/20">
        <motion.div
          animate={{ width: `${pct}%` }}
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>

      {/* Instructions */}
      <div className={`text-[11px] sm:text-xs text-purple-100 leading-relaxed font-medium bg-black/25 rounded-xl border border-white/10 ${
        isLowProfile ? 'p-2.5' : 'p-3.5'
      }`}>
        {getStepText()}
      </div>

      {/* Action choices for Step 4 */}
      {step === 4 && (
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
