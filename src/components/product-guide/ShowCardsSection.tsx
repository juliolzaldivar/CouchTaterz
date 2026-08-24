import React from 'react';
import { 
  Bot, Trash2, Send, Share2, Play, Star, Check, ShieldCheck, 
  Eye, EyeOff, RefreshCw, Plus
} from 'lucide-react';
import { motion } from 'motion/react';

interface ShowCardsSectionProps {
  demoCardEpisode: number;
  setDemoCardEpisode: React.Dispatch<React.SetStateAction<number>>;
  demoCardRating: number;
  setDemoCardRating: (r: number) => void;
  demoCardTier: 'watching' | 'up_next' | 'watched';
  setDemoCardTier: (t: 'watching' | 'up_next' | 'watched') => void;
  isDemoCardSpoilerShielded: boolean;
  setIsDemoCardSpoilerShielded: (s: boolean) => void;
  demoCardActionNotice: string | null;
  showNotification: (msg: string) => void;
  spudsAiMode: 'catchup' | 'recap' | 'compromise';
  setSpudsAiMode: (m: 'catchup' | 'recap' | 'compromise') => void;
  isSpudsTyping: boolean;
  setIsSpudsTyping: (t: boolean) => void;
  handleActionClick: (target: any) => void;
}

export const ShowCardsSection: React.FC<ShowCardsSectionProps> = React.memo(({
  demoCardEpisode,
  setDemoCardEpisode,
  demoCardRating,
  setDemoCardRating,
  demoCardTier,
  setDemoCardTier,
  isDemoCardSpoilerShielded,
  setIsDemoCardSpoilerShielded,
  demoCardActionNotice,
  showNotification,
  spudsAiMode,
  setSpudsAiMode,
  isSpudsTyping,
  setIsSpudsTyping,
  handleActionClick
}) => {
  return (
    <section id="doc-section-showcards" className="space-y-8 scroll-mt-24">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-500/25">
          <Bot className="w-3.5 h-3.5 text-blue-400" />
          <span>Section 3</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          3. Show Cards & AI Spud Assistant
        </h2>
        <p className="text-base text-slate-300 font-medium max-w-3xl leading-relaxed">
          Each show card provides full tracking controls, zero-spoiler fences, episode reviews, and direct streaming shortcuts:
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SUB-SECTION 2.1: INTERACTIVE SHOW CARD */}
        <div className="lg:col-span-7 bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl shadow-blue-950/20 space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-white">
                Interactive Show Card Anatomy
              </h3>
              <p className="text-xs text-slate-400">Live, functional replica of the CouchTaterz card.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase border border-blue-500/30">
              Full Controls
            </span>
          </div>

          {/* CARD TOP ACTIONS */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 text-[10px] font-black uppercase">
                  Apple TV+
                </span>
                <span className="text-xs font-bold text-slate-300">S2E{demoCardEpisode}/10</span>
              </div>

              {/* Top Actions: Delete, Send, Social, Direct Play */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => showNotification("Show removed from queue")}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer border border-slate-800"
                  title="Quick Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => showNotification("Sent recommendation to Julio!")}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition cursor-pointer border border-slate-800"
                  title="Send Recommendation to Buddy"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => showNotification("Generated 9:16 Social Story Card!")}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition cursor-pointer border border-slate-800"
                  title="Social Story Card Export"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => showNotification("Launching Apple TV+ application...")}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 transition cursor-pointer"
                  title="Direct Play"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Play</span>
                </button>
              </div>
            </div>

            {/* Show Title & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-white">Severance (Season 2)</h4>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{demoCardRating.toFixed(1)} / 10</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  animate={{ width: `${(demoCardEpisode / 10) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* Episode Selector Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDemoCardEpisode(prev => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    -1 Ep
                  </button>
                  <button
                    onClick={() => setDemoCardEpisode(prev => Math.min(10, prev + 1))}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>+1 Episode</span>
                  </button>
                </div>

                {/* 1-Click Category Shift */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                  <button
                    onClick={() => setDemoCardTier('watching')}
                    className={`px-2 py-0.5 rounded ${demoCardTier === 'watching' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Watching
                  </button>
                  <button
                    onClick={() => setDemoCardTier('up_next')}
                    className={`px-2 py-0.5 rounded ${demoCardTier === 'up_next' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Up Next
                  </button>
                  <button
                    onClick={() => setDemoCardTier('watched')}
                    className={`px-2 py-0.5 rounded ${demoCardTier === 'watched' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Watched
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews & Ratings Section (with Spoiler Shield) */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400">
                <span>Episode Reviews & Ratings</span>
                <button
                  onClick={() => setIsDemoCardSpoilerShielded(!isDemoCardSpoilerShielded)}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isDemoCardSpoilerShielded ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{isDemoCardSpoilerShielded ? 'Reveal Take' : 'Lock Shield'}</span>
                </button>
              </div>

              <div className="relative p-3.5 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <p className={`text-xs text-slate-200 font-serif italic leading-relaxed transition-all ${
                  isDemoCardSpoilerShielded ? 'filter blur-xs select-none opacity-40' : 'filter-none opacity-100'
                }`}>
                  &ldquo;Episode 4 was breathtaking. The overtime protocol sequence with Mark and Cobel created unforgettable tension!&rdquo;
                </p>

                {isDemoCardSpoilerShielded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                    <button
                      onClick={() => setIsDemoCardSpoilerShielded(false)}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-black flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Spoiler Shield Active: Tap to Read</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {demoCardActionNotice && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold text-center"
              >
                {demoCardActionNotice}
              </motion.div>
            )}
          </div>
        </div>

        {/* SUB-SECTION 2.2: CATCH UP WITH SPUDS (AI) */}
        <div className="lg:col-span-5 bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl shadow-blue-950/20 space-y-6 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Catch Up with Spuds (AI)</h3>
                  <p className="text-[11px] text-slate-400">Zero-Spoiler AI Television Savant</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                Fenced
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Interactive assistant that provides recaps, answers plot questions safely without spoilers, and surfaces custom recommendations.
            </p>

            {/* Interactive Spuds Chat Drawer Simulator */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'catchup', label: '1. Catch Up' },
                  { id: 'recap', label: '2. Safe Recap' },
                  { id: 'compromise', label: '3. Compromise' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSpudsAiMode(mode.id as any);
                      setIsSpudsTyping(true);
                      setTimeout(() => setIsSpudsTyping(false), 300);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      spudsAiMode === mode.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Message Bubble Render */}
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-medium text-right border border-slate-800">
                  {spudsAiMode === 'catchup' && "I haven't watched in months. Catch me up ONLY through S2E3 without spoiling episode 4!"}
                  {spudsAiMode === 'recap' && "Who was the security guard Helly encountered in season 1?"}
                  {spudsAiMode === 'compromise' && "I want a witty prestige drama, partner wants fast action. What should we start?"}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-200 leading-relaxed border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black text-blue-400 uppercase">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span>Spuds AI Response</span>
                    </span>
                    <span className="text-emerald-400">✓ Zero Spoilers</span>
                  </div>

                  {isSpudsTyping ? (
                    <div className="flex items-center gap-2 py-2 text-slate-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>Consulting episode database...</span>
                    </div>
                  ) : (
                    <div>
                      {spudsAiMode === 'catchup' && (
                        <p>
                          &ldquo;Mark just bypassed the security switch while Dylan held the overtime protocol. Helly's Lumon family identity is established, and Cobel is surveilling from outside. Episode 4 begins immediately after. You are completely safe to hit play!&rdquo;
                        </p>
                      )}
                      {spudsAiMode === 'recap' && (
                        <p>
                          &ldquo;That was Graner (Doug Graner), the head of Lumon's physical security who was later confronted by Reghabi outside the testing facility.&rdquo;
                        </p>
                      )}
                      {spudsAiMode === 'compromise' && (
                        <p>
                          &ldquo;Start <strong>Slow Horses</strong> on Apple TV+. Gary Oldman delivers biting, cynical humor alongside intense British espionage shootouts and suspense.&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Persistent Floating Controls Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">
                  Persistent Floating Controls
                </span>
                <span className="text-[10px] text-blue-400 font-bold">Bottom-Right Corner</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Quick-access floating buttons on the bottom right for Spuds AI and Add Content.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleActionClick('spudz_ai')}
                  className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:scale-105 text-white shadow-lg cursor-pointer transition flex items-center gap-1.5 text-xs font-black"
                  title="Launch Spuds AI Floating Assistant"
                >
                  <Bot className="w-4 h-4" />
                  <span>Spuds AI</span>
                </button>
                <button
                  onClick={() => handleActionClick('add_show')}
                  className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:scale-105 text-white shadow-lg cursor-pointer transition flex items-center gap-1.5 text-xs font-black"
                  title="Add Content Floating Button"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Show</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>AI Television Intelligence</span>
            <span className="text-blue-400 font-bold">Always Accessible</span>
          </div>
        </div>
      </div>
    </section>
  );
});

ShowCardsSection.displayName = 'ShowCardsSection';
