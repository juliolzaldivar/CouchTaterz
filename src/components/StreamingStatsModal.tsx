/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Tv, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Info,
  Clock,
  Flame,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { TvShow, StreamingService } from '../types';

interface StreamingStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shows: TvShow[];
  theme: 'dark' | 'light';
}

const SERVICE_COSTS: Record<StreamingService, number> = {
  'HBO': 16.99,
  'Netflix': 15.49,
  'Disney+': 15.99,
  'Prime Video': 14.99,
  'Hulu': 14.99,
  'Apple TV': 9.99,
  'Paramount+': 11.99,
  'Peacock': 7.99,
  'AMC+': 8.99,
  'Other': 0.00
};

const SERVICE_COLORS: Record<StreamingService, string> = {
  'HBO': '#6366f1', // Indigo
  'Netflix': '#ef4444', // Red
  'Disney+': '#3b82f6', // Blue
  'Prime Video': '#06b6d4', // Cyan
  'Hulu': '#10b981', // Emerald
  'Paramount+': '#0ea5e9', // Sky
  'Apple TV': '#e2e8f0', // Neutral/Slate
  'Peacock': '#f59e0b', // Amber
  'AMC+': '#eab308', // Yellow
  'Other': '#6b7280' // Gray
};

export function StreamingStatsModal({ isOpen, onClose, shows, theme }: StreamingStatsModalProps) {
  const epsPerWeek = 3; // Steady average pace of 3 episodes per show/week

  // Initialize subscription states. Default to subscribed if they have at least 1 show on that service,
  // except for 'Other' which is free/local files.
  const [subscribedServices, setSubscribedServices] = useState<Record<StreamingService, boolean>>(() => {
    const initial: Record<StreamingService, boolean> = {
      'HBO': false,
      'Netflix': false,
      'Disney+': false,
      'Prime Video': false,
      'Hulu': false,
      'Apple TV': false,
      'Paramount+': false,
      'Peacock': false,
      'AMC+': false,
      'Other': false
    };
    shows.forEach(show => {
      if (show.streamingService in initial) {
        initial[show.streamingService] = true;
      }
    });
    return initial;
  });

  const toggleSubscription = (service: StreamingService) => {
    if (service === 'Other') return;
    setSubscribedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  // Calculate estimated weekly/monthly hours based on active shows ('Watching')
  const watchTimeStats = useMemo(() => {
    const activeShows = shows.filter(s => s.status === 'Watching');
    
    let totalWeeklyMinutes = 0;
    const serviceMinutes: Record<StreamingService, number> = {
      'HBO': 0, 'Netflix': 0, 'Disney+': 0, 'Prime Video': 0, 'Hulu': 0,
      'Apple TV': 0, 'Paramount+': 0, 'Peacock': 0, 'AMC+': 0, 'Other': 0
    };

    activeShows.forEach(show => {
      const genres = show.genres.map(g => g.toLowerCase());
      let runtime = 45; // Default standard runtime
      if (genres.includes('comedy') || genres.includes('animation') || genres.includes('sitcom') || genres.includes('anime')) {
        runtime = 25; // 25 min average
      } else if (genres.includes('drama') || genres.includes('sci-fi') || genres.includes('thriller') || genres.includes('mystery')) {
        runtime = 50; // 50 min average
      }
      
      const showMinutes = runtime * epsPerWeek;
      totalWeeklyMinutes += showMinutes;
      if (show.streamingService in serviceMinutes) {
        serviceMinutes[show.streamingService] += showMinutes;
      } else {
        serviceMinutes['Other'] += showMinutes;
      }
    });

    const totalWeeklyHours = totalWeeklyMinutes / 60;
    const totalMonthlyHours = totalWeeklyHours * 4.33; // avg weeks in a month

    return {
      activeShows,
      activeShowsCount: activeShows.length,
      totalWeeklyHours,
      totalMonthlyHours,
      serviceMinutes
    };
  }, [shows, epsPerWeek]);

  // Compile statistics per streaming service
  const serviceStats = useMemo(() => {
    const services = Object.keys(SERVICE_COSTS) as StreamingService[];
    
    return services.map(service => {
      const serviceShows = shows.filter(s => s.streamingService === service);
      const totalCount = serviceShows.length;
      const activeCount = serviceShows.filter(s => s.status === 'Watching').length;
      const queueCount = serviceShows.filter(s => s.status === 'Backlog').length;
      const completedCount = serviceShows.filter(s => s.status === 'Completed').length;
      const droppedCount = serviceShows.filter(s => s.status === 'Dropped').length;

      // Calculate value/efficiency score
      const cost = SERVICE_COSTS[service];
      const isSubscribed = subscribedServices[service];
      let valueRating: 'excellent' | 'good' | 'poor' | 'unused' = 'unused';
      let valueExplanation = 'No shows tracked.';

      if (isSubscribed && cost > 0) {
        if (activeCount > 2) {
          valueRating = 'excellent';
          valueExplanation = `${activeCount} active shows. Highly cost-effective!`;
        } else if (activeCount > 0 || queueCount > 1) {
          valueRating = 'good';
          valueExplanation = 'Active watchlist coverage is steady.';
        } else if (totalCount > 0) {
          valueRating = 'poor';
          valueExplanation = 'Paying but no active shows right now. Consider pausing!';
        } else {
          valueRating = 'unused';
          valueExplanation = 'Subscribed with 0 shows on your tracker.';
        }
      }

      return {
        service,
        totalCount,
        activeCount,
        queueCount,
        completedCount,
        droppedCount,
        cost,
        isSubscribed,
        valueRating,
        valueExplanation
      };
    }).sort((a, b) => b.totalCount - a.totalCount); // Sort by footprint size
  }, [shows, subscribedServices]);

  // General aggregates
  const totals = useMemo(() => {
    let totalMonthlyCost = 0;
    let potentialSavings = 0;
    let activeSubscriptionsCount = 0;

    serviceStats.forEach(stat => {
      if (stat.service !== 'Other' && stat.isSubscribed) {
        totalMonthlyCost += stat.cost;
        activeSubscriptionsCount++;
        if (stat.valueRating === 'poor' || stat.valueRating === 'unused') {
          potentialSavings += stat.cost;
        }
      }
    });

    const activeShowsCount = shows.filter(s => s.status === 'Watching').length;
    const totalShowsCount = shows.length;

    return {
      totalMonthlyCost,
      potentialSavings,
      activeSubscriptionsCount,
      activeShowsCount,
      totalShowsCount
    };
  }, [serviceStats, shows]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-5xl h-[85vh] max-h-[850px] overflow-hidden rounded-3xl border flex flex-col ${
            theme === 'dark' 
              ? 'bg-[#12141A] border-white/5 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]' 
              : 'bg-white border-neutral-200 text-neutral-800 shadow-[0_15px_40px_rgba(0,0,0,0.15)]'
          }`}
          id="streaming-stats-modal"
        >
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-white/5 bg-[#171A21]' : 'border-neutral-100 bg-neutral-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Entertainment Time & Insights</h2>
                <p className="text-xs text-slate-400">Analyze your weekly screen-time, viewing pace, and service footprint</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                theme === 'dark' 
                  ? 'bg-[#1F222B] hover:bg-[#2A2E3B] text-slate-400 hover:text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Aggregates Ribbon (Primary focus on Screen Time) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Weekly Screen Time KPI */}
              <div className={`p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden ${
                theme === 'dark' ? 'bg-[#181B22] border-white/5' : 'bg-neutral-50 border-neutral-100'
              }`}>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Weekly Screen Time</span>
                  <div className="text-2xl font-black text-blue-400">
                    {watchTimeStats.totalWeeklyHours.toFixed(1)} <span className="text-xs text-slate-500 font-medium">hrs</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                    Estimated enjoyment
                  </span>
                </div>
                <div className="absolute top-2 right-2 text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Weekly
                </div>
              </div>

              {/* Monthly Screen Time KPI */}
              <div className={`p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden ${
                theme === 'dark' ? 'bg-[#181B22] border-white/5' : 'bg-neutral-50 border-neutral-100'
              }`}>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'
                }`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Monthly Screen Time</span>
                  <div className="text-2xl font-black text-orange-400">
                    {watchTimeStats.totalMonthlyHours.toFixed(1)} <span className="text-xs text-slate-500 font-medium">hrs</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                    ~{Math.round(watchTimeStats.totalMonthlyHours * 60).toLocaleString()} total mins
                  </span>
                </div>
                <div className="absolute top-2 right-2 text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Monthly
                </div>
              </div>

              {/* Active Watchlist size */}
              <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
                theme === 'dark' ? 'bg-[#181B22] border-white/5' : 'bg-neutral-50 border-neutral-100'
              }`}>
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'
                }`}>
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Active Series</span>
                  <div className="text-2xl font-black">
                    {totals.activeShowsCount} <span className="text-xs text-slate-500 font-medium">watching</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                    {totals.totalShowsCount} total series tracked
                  </span>
                </div>
              </div>

              {/* Subscription Spend (Relegated/Secondary Importance) */}
              <div className={`p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden opacity-90 ${
                theme === 'dark' ? 'bg-[#181B22]/60 border-white/5' : 'bg-neutral-50/60 border-neutral-100'
              }`}>
                <div className="p-3 rounded-xl bg-slate-500/10 text-slate-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Subscription Spend</span>
                  <div className="text-xl font-black text-slate-300">
                    ${totals.totalMonthlyCost.toFixed(2)}<span className="text-[10px] text-slate-500 font-medium">/mo</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                    For {totals.activeSubscriptionsCount} active services
                  </span>
                </div>
              </div>

            </div>

            {/* Main Segment: Left (Weekly Fun Hub) / Right (Subscriptions & Catalog Spread) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Engagement & Watch Speed Breakdown (8 cols) */}
              <div className="lg:col-span-8 flex flex-col space-y-4">

                {/* Entertainment Hours Distribution Breakdown */}
                <div className={`p-5 rounded-3xl border flex-1 flex flex-col ${
                  theme === 'dark' ? 'bg-[#181B22] border-white/5' : 'bg-white border-neutral-200'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Engagement & Active Shows</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Estimated by Service</span>
                  </div>

                  {watchTimeStats.activeShowsCount === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0F1115] rounded-2xl border border-white/5">
                      <Tv className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-slate-400">No active watchlists found</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Change any tracked show's status to "Watching" to start compiling visual entertainment metrics!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[420px] scrollbar-thin">
                      {Object.entries(watchTimeStats.serviceMinutes)
                        .filter(([_, mins]) => mins > 0)
                        .sort((a, b) => b[1] - a[1]) // Sort by highest watchtime
                        .map(([service, mins]) => {
                          const hrs = mins / 60;
                          const serviceColor = SERVICE_COLORS[service as StreamingService] || '#6b7280';
                          const pct = (mins / (watchTimeStats.totalWeeklyHours * 60)) * 100;

                          // Gather the active shows for this specific service
                          const activeShowsInService = watchTimeStats.activeShows.filter(
                            s => s.streamingService === service
                          );

                          return (
                            <div 
                              key={service} 
                              className={`p-4 rounded-2xl border transition-all duration-200 ${
                                theme === 'dark' 
                                  ? 'bg-[#14161E] border-white/5 hover:border-white/10' 
                                  : 'bg-neutral-50 border-neutral-100 hover:border-neutral-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: serviceColor }} />
                                  <span className="text-xs font-black text-slate-200">{service}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-slate-100">{hrs.toFixed(1)} hrs/wk</span>
                                  <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-bold ml-2">
                                    {Math.round(pct)}% of total
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="h-2 w-full bg-[#0F1115] rounded-full overflow-hidden mb-3">
                                <div 
                                  className="h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${pct}%`, backgroundColor: serviceColor }}
                                />
                              </div>

                              {/* Nested Active Shows List */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Active Content:</span>
                                {activeShowsInService.map(show => (
                                  <span 
                                    key={show.id} 
                                    className="text-[10px] bg-[#0F1115] text-slate-300 border border-white/5 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: serviceColor }} />
                                    {show.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                </div>

              </div>

              {/* Right Column: Catalog Footprint Spread & Subscriptions Manager (4 cols) */}
              <div className="lg:col-span-4 flex flex-col space-y-4">
                
                {/* Catalog Distribution (Replaces Donut with super readable Segmented bar distribution) */}
                <div className={`p-5 rounded-3xl border flex flex-col ${
                  theme === 'dark' ? 'bg-[#181B22] border-white/5' : 'bg-white border-neutral-200'
                }`}>
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-3">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Show Catalog Spread</span>
                  </div>

                  <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 scrollbar-none">
                    {serviceStats
                      .filter(stat => stat.totalCount > 0)
                      .map((stat) => {
                        const total = stat.totalCount;
                        const active = stat.activeCount;
                        const queue = stat.queueCount;
                        const finished = stat.completedCount;
                        
                        const activePct = (active / total) * 100;
                        const queuePct = (queue / total) * 100;
                        const finishedPct = (finished / total) * 100;

                        return (
                          <div key={stat.service} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SERVICE_COLORS[stat.service] }} />
                                <span className="font-bold text-slate-300">{stat.service}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold">{total} shows</span>
                            </div>
                            
                            {/* Visual stacked progress bar */}
                            <div className="h-1.5 w-full bg-[#0F1115] rounded-full overflow-hidden flex">
                              {active > 0 && (
                                <div 
                                  className="h-full bg-blue-500 transition-all"
                                  style={{ width: `${activePct}%` }}
                                  title={`${active} active`}
                                />
                              )}
                              {queue > 0 && (
                                <div 
                                  className="h-full bg-amber-500 transition-all"
                                  style={{ width: `${queuePct}%` }}
                                  title={`${queue} backlog`}
                                />
                              )}
                              {finished > 0 && (
                                <div 
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${finishedPct}%` }}
                                  title={`${finished} completed`}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider pt-2 mt-2 border-t border-white/5">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Active</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Queue</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Done</span>
                  </div>
                </div>

                {/* Subscription Manager card (Compact/Relegated) */}
                <div className={`p-5 rounded-3xl border flex-1 flex flex-col ${
                  theme === 'dark' ? 'bg-[#181B22] border-white/5' : 'bg-white border-neutral-200'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription footPrint</span>
                    <span className="text-[9px] text-slate-500 font-bold">Manage spend</span>
                  </div>

                  {/* Scrollable list of services */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin max-h-[290px]">
                    {serviceStats.map((stat) => {
                      if (stat.service === 'Other') return null; // We omit other because it's local/free

                      return (
                        <div 
                          key={stat.service}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                            stat.isSubscribed
                              ? stat.valueRating === 'poor' || stat.valueRating === 'unused'
                                ? theme === 'dark' ? 'bg-[#1D212A] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'bg-amber-50/40 border-amber-200'
                                : theme === 'dark' ? 'bg-[#1D212A] border-blue-500/20' : 'bg-blue-50/50 border-blue-100'
                              : theme === 'dark' ? 'bg-[#13151D] border-white/5 hover:border-white/10' : 'bg-white border-neutral-100 hover:border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Toggle Subscription Button */}
                            <button
                              onClick={() => toggleSubscription(stat.service)}
                              className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                stat.isSubscribed
                                  ? stat.valueRating === 'poor' || stat.valueRating === 'unused'
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : 'bg-blue-500 border-blue-500 text-white'
                                  : 'border-slate-500 bg-transparent hover:border-slate-400'
                              }`}
                              title={`Toggle subscription for ${stat.service}`}
                            >
                              {stat.isSubscribed && (
                                <CheckCircle2 className={`w-3.5 h-3.5 text-white ${
                                  stat.valueRating === 'poor' || stat.valueRating === 'unused'
                                    ? 'fill-amber-500 text-amber-950'
                                    : 'fill-blue-500 text-blue-950'
                                }`} />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[11px] font-black ${
                                  stat.isSubscribed && (stat.valueRating === 'poor' || stat.valueRating === 'unused')
                                    ? 'text-amber-200'
                                    : 'text-slate-100'
                                }`}>{stat.service}</span>
                                {stat.isSubscribed && (stat.valueRating === 'poor' || stat.valueRating === 'unused') && (
                                  <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                    Optimize
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-500 block mt-0.5">
                                {stat.activeCount > 0 ? `${stat.activeCount} watching` : 'No active watchlists'}
                              </span>
                            </div>
                          </div>

                          {/* Price Tag */}
                          <div className="text-right">
                            <span className={`text-xs font-black block ${
                              stat.isSubscribed && (stat.valueRating === 'poor' || stat.valueRating === 'unused')
                                ? 'text-amber-400'
                                : 'text-blue-400'
                            }`}>${stat.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Underutilized helper notification */}
                  {serviceStats.some(s => s.isSubscribed && (s.valueRating === 'poor' || s.valueRating === 'unused')) && (
                    <div className="mt-3 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-slate-400 leading-normal">
                        Some services are subscribed but have 0 active content watchlists. Look for the <span className="text-amber-400 font-bold">Optimize</span> items above!
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
