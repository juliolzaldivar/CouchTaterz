/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Tv, 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clapperboard, 
  Smartphone, 
  Star, 
  Clock, 
  TrendingUp, 
  Share2, 
  Lock,
  ChevronRight,
  Info,
  Compass,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onGuestLogin: (options?: { startTour?: boolean }) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onSelectUser: (user: User) => void;
  registeredUsers: User[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGuestLogin,
  onOpenLogin,
  onOpenSignup,
  onSelectUser,
  registeredUsers
}) => {
  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Interactive Demo State inside Landing Page
  const [demoEpisode, setDemoEpisode] = useState(7);
  const [demoStatus, setDemoStatus] = useState<'Watching' | 'Backlog' | 'Completed'>('Watching');
  const [showAiRecapDemo, setShowAiRecapDemo] = useState(false);
  const [showGuestChoiceModal, setShowGuestChoiceModal] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIos(ios);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-violet-600/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Floating Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Top Row on Mobile: Logo on Left, Sign In on Top Right */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowGuestChoiceModal(true)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/25 text-white shrink-0">
                <Tv className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-black text-lg sm:text-xl tracking-tight uppercase leading-none">
                  <span className="text-blue-500">COUCH</span>
                  <span className="text-white">TATERZ</span>
                </span>
                <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mt-1 leading-none whitespace-nowrap">
                  YOUR BINGE BUDDY
                </p>
              </div>
            </div>

            {/* Top Right Mobile Controls */}
            {(isInstallable || isIos) && (
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 text-slate-200 text-xs font-semibold border border-slate-700"
                  title="Install App to Home Screen"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Controls / Mobile Row 2 (Centered 1-Click Guest Preview) */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-center sm:justify-end">
            {(isInstallable || isIos) && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
                title="Install App to Home Screen"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => setShowGuestChoiceModal(true)}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>1-Click Guest Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] sm:text-xs font-medium shadow-inner"
          >
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-200 font-semibold hidden sm:inline">Powered by AskTaterz &amp; Live TV Calendar</span>
            <span className="text-slate-200 font-semibold sm:hidden">AskTaterz</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-medium">100% Spoiler-Free</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.18] sm:leading-[1.12]"
          >
            <span className="block sm:inline">Track Shows. </span>
            <span className="block sm:inline">Borrow Recs. </span>
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">Binge Together.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Stop scrolling Netflix for 45 minutes just to end up rewatching <span className="text-slate-200 font-medium">The Office</span> again. Track what you're actually watching, borrow top picks straight from your friends' queues, and catch up with spoiler-free AI recaps.
          </motion.p>

          {/* Main Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex items-center justify-center"
          >
            <button
              onClick={onOpenSignup}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 group"
            >
              <Sparkles className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Quick Family Avatar Login Chips (If registered users exist) */}
          {registeredUsers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4 border-t border-slate-900/80 max-w-lg mx-auto"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Or jump right into a Binge Buddy profile:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {registeredUsers.map((u, idx) => {
                  const isJulio = u.id === 'default' || u.id === 'user-julio' || u.name?.toLowerCase().trim() === 'julio' || u.email?.toLowerCase().trim() === 'juliozaldivar@gmail.com';
                  return (
                    <button
                      key={`reguser-${u.id}-${idx}`}
                      onClick={() => onSelectUser(u)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 hover:text-white transition-all shadow-sm group"
                    >
                      <img 
                        src={u.avatarUrl} 
                        alt={u.name} 
                        className="w-5 h-5 rounded-full bg-slate-800 group-hover:scale-105 transition-transform" 
                      />
                      <span className="font-semibold">{u.name}</span>
                      {isJulio && (
                        <span title="Admin Account - Google Auth Required">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Trust badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Borrow top picks from Binge Buddies
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sync queues across your household
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Live premiere dates &amp; episode countdowns
            </span>
          </div>

        </div>

        {/* Live Interactive Component Demo Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl overflow-hidden p-6 md:p-8 relative"
        >
          {/* Subtle Top Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Try It Live Right Here</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
              <span>Status:</span>
              <span className={`font-semibold ${
                demoStatus === 'Completed' ? 'text-emerald-400' : demoStatus === 'Backlog' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {demoStatus === 'Backlog' ? 'Up Next' : demoStatus === 'Completed' ? 'Watched' : 'Watching'}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            
            {/* Show Poster & Details */}
            <div className="md:col-span-5 flex gap-4 items-start">
              <div className="relative group rounded-xl overflow-hidden shadow-lg border border-slate-800 w-28 shrink-0">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10" 
                  alt="Severance" 
                  className="w-full h-36 object-cover"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-black text-white">
                  Apple TV+
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/20">
                  Sci-Fi • Thriller
                </span>
                <h3 className="text-lg font-bold text-white">Severance</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.
                </p>

                {/* Status Switcher Demo Buttons */}
                <div className="flex items-center gap-1 pt-1">
                  {(['Watching', 'Backlog', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setDemoStatus(st)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                        demoStatus === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : st === 'Backlog'
                              ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                              : 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'Backlog' ? 'Up Next' : st === 'Completed' ? 'Watched' : 'Watching'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Controls & AI Recap Demo */}
            <div className="md:col-span-7 bg-slate-950/80 rounded-2xl p-4 md:p-5 border border-slate-800/80 space-y-4">
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Watched Episode Progress:</span>
                <span className="text-white font-bold font-mono">Season 2 • Ep {demoEpisode} / 10</span>
              </div>

              {/* Episode Progress Bar Slider */}
              <div className="space-y-2">
                <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                      demoStatus === 'Completed'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                        : demoStatus === 'Backlog'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-500'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                    }`}
                    style={{ width: `${(demoEpisode / 10) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 3, 5, 7, 10].map((ep) => (
                      <button
                        key={ep}
                        onClick={() => setDemoEpisode(ep)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          demoEpisode === ep
                            ? demoStatus === 'Completed'
                              ? 'bg-emerald-500 text-white font-bold'
                              : demoStatus === 'Backlog'
                                ? 'bg-amber-500 text-white font-bold'
                                : 'bg-blue-500 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        Ep {ep}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAiRecapDemo(!showAiRecapDemo)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>{showAiRecapDemo ? 'Hide AskTaterz' : '✨ Try AskTaterz Recap'}</span>
                  </button>
                </div>
              </div>

              {/* AI Recap Box Demo */}
              <AnimatePresence>
                {showAiRecapDemo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-3 text-xs space-y-1.5 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AskTaterz Spoiler-Free Catchup (S2 Ep {demoEpisode}):</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      "Mark and the Lumon severed team uncover encrypted keycards in the macrodata department. High narrative tension develops without revealing future unreleased plot points!"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Tap any episode button or hit 'AskTaterz' above to test the live mechanics!</span>
              </div>

            </div>

          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Built Specifically for TV Lovers &amp; Couch Potatoes
            </h2>
            <p className="text-sm text-slate-400">
              Everything you need to track, discover, borrow recommendations, and catch up on TV shows without clutter or spoilers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Clapperboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">No More "Which Episode Were We On?"</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log exact season and episode progress across every streaming service. Settle household TV debates before you press play.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Borrow Your Buddies' Best Picks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                See what your Binge Buddies are raving about and swipe top-rated picks straight into your watchlist with 1 tap.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Spoiler Catchup Recaps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Haven't watched in 6 months? AskTaterz gives you a quick refresher on strictly what happened up to your last episode—without spoiling what comes next.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Season Premiere Radar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live release dates and countdown timers so you never miss a surprise drop or weekly episode premiere again.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Save Right to Your Phone</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add CouchTaterz to your iPhone or Android home screen for instant, 1-tap TV tracking right from the couch.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Pretty Links When You Text Recs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Texting a show recommendation to a friend? Your watchlist links automatically generate rich preview cards with artwork and stats.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Footer Call to Action */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/20 text-white shrink-0">
                <Tv className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-black text-lg tracking-tight uppercase leading-none">
                  <span className="text-blue-500">COUCH</span>
                  <span className="text-white">TATERZ</span>
                </span>
                <p className="text-[10px] font-extrabold tracking-[0.2em] text-slate-500 uppercase mt-1 leading-none whitespace-nowrap">
                  YOUR BINGE BUDDY
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
            <button onClick={() => setShowGuestChoiceModal(true)} className="hover:text-white transition-colors cursor-pointer">Guest Demo</button>
            <span>•</span>
            <button onClick={onOpenLogin} className="hover:text-white transition-colors cursor-pointer">Sign In</button>
            <span>•</span>
            <button onClick={onOpenSignup} className="hover:text-white transition-colors cursor-pointer">Create Account</button>
          </div>
        </div>
      </footer>

      {/* GUEST DEMO CHOICE MODAL */}
      <AnimatePresence>
        {showGuestChoiceModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowGuestChoiceModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 text-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Glow Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />

              {/* Header & Close */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 shrink-0">
                    <Tv className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase leading-snug">
                      Choose Demo Experience
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      How would you like to explore CouchTaterz?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuestChoiceModal(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close preview dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options Stack */}
              <div className="space-y-3.5 relative z-10">
                {/* Option 1: Guided Tour */}
                <button
                  onClick={() => {
                    setShowGuestChoiceModal(false);
                    onGuestLogin({ startTour: true });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-blue-950/40 hover:from-blue-900/50 hover:to-indigo-900/50 border border-blue-500/40 hover:border-blue-400 transition-all duration-200 group cursor-pointer shadow-md hover:shadow-blue-500/10 relative overflow-hidden active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                          Take the Guided Tour
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        Follow a step-by-step interactive walkthrough highlighting watchlist pipelines, episode progress, and AI spoiler-free recaps.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option 2: Free Exploration */}
                <button
                  onClick={() => {
                    setShowGuestChoiceModal(false);
                    onGuestLogin({ startTour: false });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                          Free Playground Mode
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          Direct Access
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        Jump straight into a pre-populated watchlist without guided overlays. Click around and test features completely on your own.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer Note */}
              <div className="pt-2 border-t border-slate-800/80 text-center relative z-10">
                <p className="text-[11px] text-slate-500 font-medium">
                  You can restart or exit the guided tour anytime inside the app.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS Installation Instructions Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">Add to iOS Home Screen</h3>
              
              <div className="text-xs text-slate-300 space-y-2 text-left bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">1.</span>
                  <span>Tap the <strong className="text-white">Share</strong> button in your Safari browser navigation bar.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">2.</span>
                  <span>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">3.</span>
                  <span>Launch CouchTaterz full-screen right from your home screen!</span>
                </p>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
