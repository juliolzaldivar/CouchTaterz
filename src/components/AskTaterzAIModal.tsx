import React, { useState, useRef, useEffect } from 'react';
import { TvShow, UserPreferences, TaterzAIGroupBuddy, TaterzAIIntent } from '../types';
import { useTaterzAI } from '../hooks/useTaterzAI';
import {
  Sparkles,
  Send,
  Zap,
  Users,
  Search,
  BookOpen,
  X,
  RefreshCw,
  Crown,
  AlertCircle,
  Database,
  Trash2,
  CheckCircle2,
  Bot,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

export interface AskTaterzAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  shows?: TvShow[];
  preferences?: UserPreferences;
  buddies?: TaterzAIGroupBuddy[];
  initialIntent?: TaterzAIIntent;
  initialShowForRecap?: TvShow;
  theme?: 'dark' | 'light';
}

export const AskTaterzAIModal: React.FC<AskTaterzAIModalProps> = ({
  isOpen,
  onClose,
  shows = [],
  preferences,
  buddies = [],
  initialIntent,
  initialShowForRecap,
  theme = 'dark'
}) => {
  const {
    messages,
    isLoading,
    error,
    freeCreditsUsed,
    isPro,
    creditLimit,
    isLimitReached,
    executeIntent,
    toggleProMode,
    resetCredits,
    clearMessages
  } = useTaterzAI({ shows, preferences, buddies, initialShowForRecap });

  const [input, setInput] = useState('');
  const [selectedShow, setSelectedShow] = useState<TvShow | null>(initialShowForRecap || null);
  const [targetSeason, setTargetSeason] = useState<number>(initialShowForRecap?.latestWatched?.season || 1);
  const [targetEpisode, setTargetEpisode] = useState<number>(initialShowForRecap?.latestWatched?.episode || 1);
  const [activeIntentTab, setActiveIntentTab] = useState<TaterzAIIntent>(initialIntent || 'general_chat');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  // Handle initial trigger props if passed
  useEffect(() => {
    if (initialShowForRecap) {
      setSelectedShow(initialShowForRecap);
      setTargetSeason(initialShowForRecap.latestWatched?.season || 1);
      setTargetEpisode(initialShowForRecap.latestWatched?.episode || 1);
      setActiveIntentTab('recap');
    } else if (initialIntent) {
      setActiveIntentTab(initialIntent);
    }
  }, [initialShowForRecap, initialIntent]);

  if (!isOpen) return null;

  const handleSendCustomPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isLimitReached) return;

    if (activeIntentTab === 'natural_search') {
      executeIntent({ intent: 'natural_search', userPrompt: input });
    } else {
      executeIntent({ intent: 'general_chat', userPrompt: input });
    }
    setInput('');
  };

  const handleTriggerRecap = () => {
    if (!selectedShow || isLoading) return;

    executeIntent({
      intent: 'recap',
      showTitle: selectedShow.title,
      showStatus: selectedShow.status,
      season: targetSeason,
      episode: targetEpisode,
      overview: selectedShow.overview
    });
  };

  const handleTriggerGroupRecs = () => {
    if (isLoading) return;
    executeIntent({
      intent: 'group_recommendation',
      buddiesOverride: buddies.length > 0 ? buddies : [
        { id: 'julio-1', name: 'Julio', topShows: [{ title: 'Shogun', rating: 10, streamingService: 'Hulu' }, { title: 'The Bear', rating: 9, streamingService: 'Hulu' }] },
        { id: 'annadee-2', name: 'AnnaDee', topShows: [{ title: 'White Lotus', rating: 10, streamingService: 'HBO' }, { title: 'Severance', rating: 9, streamingService: 'Apple TV' }] },
        { id: 'kris-3', name: 'Kris', topShows: [{ title: 'Slow Horses', rating: 9, streamingService: 'Apple TV' }, { title: 'Fallout', rating: 9, streamingService: 'Prime Video' }] }
      ]
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div key="ask-taterz-ai-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          key="ask-taterz-ai-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-4xl h-[100dvh] sm:h-[88vh] sm:max-h-[850px] flex flex-col sm:rounded-3xl border shadow-2xl overflow-hidden relative ${
            theme === 'dark' ? 'bg-[#12141a] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-1.5 shrink-0 sm:hidden" />

          {/* Header */}
          <div className={`p-2.5 sm:p-5 border-b flex items-center justify-between shrink-0 gap-2 sm:gap-3 ${
            theme === 'dark' ? 'bg-[#181a22] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0 ring-2 ring-amber-400/30">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="font-black text-base sm:text-xl tracking-tight truncate flex items-center gap-1.5 uppercase">
                    <span>
                      <span className="text-amber-400">ASK </span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>SPUDZ</span>
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 hidden xs:inline shrink-0" />
                  </h2>
                  {isPro ? (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-sm flex items-center gap-1 shrink-0">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> Pro
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-extrabold text-[9px] sm:text-[10px] tracking-wider uppercase flex items-center gap-1 shrink-0">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-current" /> {creditLimit - freeCreditsUsed}/{creditLimit} Free
                    </span>
                  )}
                </div>
                <p className={`text-[11px] sm:text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your TV & Binge Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={toggleProMode}
                className={`flex sm:hidden p-1.5 rounded-xl border text-xs font-bold transition items-center gap-1 ${
                  isPro
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
                title="Toggle Pro"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                onClick={toggleProMode}
                className={`hidden sm:flex px-3 py-1.5 rounded-xl border text-xs font-bold transition items-center gap-1.5 ${
                  isPro
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title="Toggle Taterz Pro membership mode"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isPro ? 'Pro Active' : 'Test Pro Tier'}</span>
              </button>

              <button
                onClick={clearMessages}
                className={`p-1.5 sm:p-2 rounded-xl transition ${
                  theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-xl transition ${
                  theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Capability Mode Bar */}
          <div className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 border-b flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none shrink-0 ${
            theme === 'dark' ? 'bg-[#151720]/90 border-white/5' : 'bg-slate-100/90 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveIntentTab('general_chat')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeIntentTab === 'general_chat'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveIntentTab('recap')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeIntentTab === 'recap'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Zero-Spoiler Recap</span>
              <span className="sm:hidden">Recap</span>
            </button>

            <button
              onClick={() => setActiveIntentTab('group_recommendation')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeIntentTab === 'group_recommendation'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Group Picks</span>
              <span className="sm:hidden">Group</span>
            </button>

            <button
              onClick={() => setActiveIntentTab('natural_search')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-xs transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeIntentTab === 'natural_search'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Natural Search</span>
              <span className="sm:hidden">Search</span>
            </button>
          </div>

          {/* Contextual Action Builder Area */}
          <AnimatePresence mode="wait">
            {activeIntentTab === 'recap' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-2.5 sm:p-4 border-b flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 sm:gap-3 shrink-0 ${
                  theme === 'dark' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 tracking-wider block mb-1">
                    Select Show for AI Intelligence:
                  </label>
                  <select
                    value={selectedShow?.id || ''}
                    onChange={(e) => {
                      const found = shows.find((s) => s.id === e.target.value);
                      if (found) {
                        setSelectedShow(found);
                        setTargetSeason(found.latestWatched?.season || 1);
                        setTargetEpisode(found.latestWatched?.episode || 1);
                      }
                    }}
                    className={`w-full h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border text-xs font-bold outline-none ${
                      theme === 'dark' ? 'bg-[#181a22] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">-- Choose Show --</option>
                    {shows.map((s, idx) => (
                      <option key={`${s.id}-${idx}`} value={s.id}>
                        {s.title} ({s.status === 'Backlog' ? 'Up Next' : s.status === 'Completed' ? 'Completed' : `S${s.latestWatched?.season || 1}E${s.latestWatched?.episode || 1}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-between sm:justify-start gap-2 shrink-0">
                  {selectedShow?.status === 'Backlog' ? (
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400/80 tracking-wider block mb-1">
                        Mode:
                      </label>
                      <div className="h-9 sm:h-10 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Season Update</span>
                      </div>
                    </div>
                  ) : selectedShow?.status === 'Completed' ? (
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400/80 tracking-wider block mb-1">
                        Mode:
                      </label>
                      <div className="h-9 sm:h-10 px-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                        <span>Full Series Refresher</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400/80 tracking-wider block mb-1">
                        Up To:
                      </label>
                      <div className="flex items-center gap-1.5 h-9 sm:h-10">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-extrabold text-amber-400/80 uppercase">S</span>
                          <input
                            type="number"
                            min={1}
                            max={selectedShow?.totalSeasons || 20}
                            value={targetSeason}
                            onChange={(e) => setTargetSeason(parseInt(e.target.value, 10) || 1)}
                            className={`w-12 sm:w-14 h-9 sm:h-10 text-center rounded-xl border text-xs font-bold ${
                              theme === 'dark' ? 'bg-[#181a22] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-extrabold text-amber-400/80 uppercase">E</span>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={targetEpisode}
                            onChange={(e) => setTargetEpisode(parseInt(e.target.value, 10) || 1)}
                            className={`w-12 sm:w-14 h-9 sm:h-10 text-center rounded-xl border text-xs font-bold ${
                              theme === 'dark' ? 'bg-[#181a22] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleTriggerRecap}
                    disabled={!selectedShow || isLoading || isLimitReached}
                    className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    {selectedShow?.status === 'Backlog'
                      ? 'Get Briefing'
                      : selectedShow?.status === 'Completed'
                      ? 'Get Refresher'
                      : 'Generate Recap'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeIntentTab === 'group_recommendation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-2.5 sm:p-4 border-b flex items-center justify-between gap-2 shrink-0 ${
                  theme === 'dark' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-xs text-purple-300">
                    Group Recommendation Engine
                  </h4>
                  <p className={`hidden sm:block text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Analyses taste overlap across your connected Binge Buddies to find top 3 consensus shows.
                  </p>
                </div>

                <button
                  onClick={handleTriggerGroupRecs}
                  disabled={isLoading || isLimitReached}
                  className="py-1.5 px-3 sm:py-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-900/30 disabled:opacity-50 transition shrink-0 cursor-pointer"
                >
                  Ask What to Watch
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.length === 0 && (
              <div className="py-4 sm:py-8 px-2 flex flex-col items-center justify-center text-center my-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 p-0.5 shadow-xl shadow-amber-500/20 mb-3.5 ring-4 ring-amber-500/10 animate-bounce-subtle">
                  <div className="w-full h-full bg-[#181a22] rounded-[22px] flex items-center justify-center">
                    <Bot className="w-7 h-7 text-amber-400" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Spudz AI Concierge</span>
                </div>

                <h3 className="text-base sm:text-2xl font-black tracking-tight text-white mb-1.5">
                  What are we watching today, couch potato?
                </h3>
                <p className={`text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Ask for zero-spoiler episode recaps, group picks with your Binge Buddies, or recommendations tailored to your mood.
                </p>

                {/* Quick Starter Prompt Chips */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full max-w-lg">
                  <button
                    onClick={handleTriggerGroupRecs}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 group ${
                      theme === 'dark'
                        ? 'bg-[#181a22]/80 border-white/10 hover:border-purple-500/50 hover:bg-purple-950/20'
                        : 'bg-slate-50 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition truncate">
                        Group Watch Picks
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Overlapping taste with buddies
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveIntentTab('recap');
                      if (shows.length > 0) {
                        const activeShow = shows.find(s => s.status === 'Watching') || shows[0];
                        setSelectedShow(activeShow);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 group ${
                      theme === 'dark'
                        ? 'bg-[#181a22]/80 border-white/10 hover:border-amber-500/50 hover:bg-amber-950/20'
                        : 'bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition truncate">
                        Zero-Spoiler Recap
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Catch up to your exact episode
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveIntentTab('natural_search');
                      setInput('Dark comedy series under 30 mins with high rating');
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 group ${
                      theme === 'dark'
                        ? 'bg-[#181a22]/80 border-white/10 hover:border-blue-500/50 hover:bg-blue-950/20'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition truncate">
                        Natural Language Search
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        "Comedies under 30 mins"
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveIntentTab('general_chat');
                      executeIntent({ intent: 'general_chat', userPrompt: 'What are the top 3 trending TV shows this week across streaming platforms?' });
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 group ${
                      theme === 'dark'
                        ? 'bg-[#181a22]/80 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition truncate">
                        Trending This Week
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Popular across platforms
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={`${m.id}-${idx}`}
                className={`flex gap-2 sm:gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[78%] rounded-2xl p-3 sm:p-4 shadow-md text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold'
                      : theme === 'dark'
                      ? 'bg-[#1a1d26] border border-white/10 text-slate-100'
                      : 'bg-slate-100 border border-slate-200 text-slate-800'
                  }`}
                >
                  {m.cached && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider mb-2">
                      <Database className="w-2.5 h-2.5" /> Cache Hit ($0 Cost)
                    </div>
                  )}

                  <div className="markdown-body">
                    <Markdown>{m.content}</Markdown>
                  </div>

                  <div
                    className={`text-[9px] sm:text-[10px] mt-2 opacity-60 text-right ${
                      m.role === 'user' ? 'text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-slate-700 text-white font-black text-[10px] sm:text-xs flex items-center justify-center shrink-0 shadow-md">
                    YOU
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-amber-400 text-xs font-bold">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <span>Spudz is processing query...</span>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* In-Line Conversion Banner for Tier Limit */}
          <AnimatePresence>
            {isLimitReached && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-3 sm:mx-4 mb-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 shrink-0 shadow-xl"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-amber-300">
                      You've used your 3 free credits this week.
                    </p>
                    <p className={`hidden sm:block text-[11px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      Upgrade to Taterz Pro for unlimited zero-spoiler recaps & group picks.
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleProMode}
                  className="py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Upgrade to Pro</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Input Bar */}
          <form
            onSubmit={handleSendCustomPrompt}
            className={`p-2.5 sm:p-4 border-t flex items-center gap-2 shrink-0 ${
              theme === 'dark' ? 'bg-[#181a22] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isLimitReached}
              placeholder={
                isLimitReached
                  ? 'Limit reached. Upgrade to Pro...'
                  : activeIntentTab === 'natural_search'
                  ? 'e.g. "Dark comedy under 30-min..."'
                  : 'Ask Spudz anything about TV...'
              }
              className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium outline-none transition disabled:opacity-50 ${
                theme === 'dark'
                  ? 'bg-[#12141a] border-white/10 text-white focus:border-amber-500/50'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
              }`}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading || isLimitReached}
              className="py-2.5 px-3.5 sm:py-3 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 disabled:opacity-40 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="hidden xs:inline">Send</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
