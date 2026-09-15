/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, CheckCircle2, Clock, Tv, Film, Calendar, Shield, 
  ExternalLink, ArrowRight, AlertCircle, Play, Sparkles, Layers,
  ChevronDown, ChevronUp, Image as ImageIcon, Radio, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MetadataSyncTabProps {
  theme?: 'dark' | 'light';
  adminEmail?: string;
}

export const MetadataSyncTab: React.FC<MetadataSyncTabProps> = ({ theme = 'dark', adminEmail }) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [targetShow, setTargetShow] = useState<string>('');
  const [forceAudit, setForceAudit] = useState<boolean>(true);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/metadata-sync/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.telemetry) {
        setTelemetry(data.telemetry);
        // Expand latest run by default if available
        if (data.telemetry.recentRuns?.length > 0 && !expandedRunId) {
          setExpandedRunId(data.telemetry.recentRuns[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load metadata sync telemetry:', err);
      setError('Failed to fetch sync status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessNotice(null);
    try {
      const res = await fetch('/api/admin/metadata-sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: forceAudit,
          showTitle: targetShow.trim() || undefined
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.result) {
        setSuccessNotice(
          `Sync completed in ${data.result.durationMs}ms: ${data.result.summary.showsModified} shows updated (${data.result.summary.bannersCount} images, ${data.result.summary.airDatesCount} air dates, ${data.result.summary.channelsCount} channels, ${data.result.summary.titlesCount} titles).`
        );
      }
      await fetchTelemetry();
    } catch (err: any) {
      setError(err.message || 'Failed to run metadata sync.');
    } finally {
      setSyncing(false);
    }
  };

  const cumulative = telemetry?.cumulativeStats || {
    totalShowsAudited: 0,
    totalImagesCorrected: 0,
    totalAirDatesCorrected: 0,
    totalChannelsCorrected: 0,
    totalTitlesFinalized: 0,
    totalShowsModified: 0
  };

  const recentRuns = telemetry?.recentRuns || [];

  return (
    <div className="space-y-6">
      {/* Top Controls & Status Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${telemetry?.isRunning || syncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
            <h3 className="text-base font-bold tracking-tight">
              {telemetry?.isRunning || syncing ? 'Audit Sync Engine In Progress...' : 'Automated Background Sync Active'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Self-Healing Daemon
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Auto-checks TV show card images, air dates/times, streaming platforms, and finalized episode titles on a scheduled cadence.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
            <span>Last Run: <strong className="text-slate-200">{telemetry?.lastRunTime ? new Date(telemetry.lastRunTime).toLocaleTimeString() : 'Pending'}</strong></span>
            <span>•</span>
            <span>Next Scheduled: <strong className="text-slate-200">{telemetry?.nextRunTime ? new Date(telemetry.nextRunTime).toLocaleTimeString() : 'In 6 hours'}</strong></span>
            <span>•</span>
            <span>Total Completed Runs: <strong className="text-slate-200">{telemetry?.totalRunsCompleted || 0}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <input
            type="text"
            placeholder="Specific show (optional)..."
            value={targetShow}
            onChange={(e) => setTargetShow(e.target.value)}
            className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${
              theme === 'dark' 
                ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
            }`}
          />
          <button
            onClick={handleTriggerSync}
            disabled={syncing || telemetry?.isRunning}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer shrink-0 ${
              syncing || telemetry?.isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 active:scale-95 shadow-blue-500/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing || telemetry?.isRunning ? 'animate-spin' : ''}`} />
            <span>{syncing || telemetry?.isRunning ? 'Auditing Library...' : 'Run Audit Now'}</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Pillars KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Images */}
        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-blue-400">Pillar 1</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{cumulative.totalImagesCorrected}</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">Card Images Verified</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Upgrades dead, missing, or generic stock card banners to high-res 16:9 official key art.
            </p>
          </div>
        </div>

        {/* Pillar 2: Air Times & Dates */}
        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400">Pillar 2</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">{cumulative.totalAirDatesCorrected}</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">Air Times & Dates Synced</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Maintains strict ISO YYYY-MM-DD air dates, accurate broadcast times, and marks concluded series.
            </p>
          </div>
        </div>

        {/* Pillar 3: Streaming Channels */}
        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-400">Pillar 3</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-400">{cumulative.totalChannelsCorrected}</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">Channels Standardized</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Maps networks to authentic platforms (Apple TV+, Max, Prime Video, Disney+) for filter chips.
            </p>
          </div>
        </div>

        {/* Pillar 4: Episode Titles */}
        <div className={`p-4 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-400">Pillar 4</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400">{cumulative.totalTitlesFinalized}</div>
            <div className="text-xs font-bold text-slate-300 mt-0.5">Episode Titles Finalized</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Detects provisional placeholder titles (TBA/TBD/Untitled) and replaces them with official creative titles.
            </p>
          </div>
        </div>
      </div>

      {/* Best-Practice Parameters & Timings Card */}
      <div className={`p-5 rounded-2xl border ${
        theme === 'dark' ? 'bg-[#131722] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          Senior Engineering Timings & Safety Parameters
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[11px]">Full Library Sweep</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5">Every 6 Hours</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Daily broadcast cycle balance</div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[11px]">Active Airing Sweep</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5">Every 2 Hours</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Prioritizes shows airing &lt;48h</div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[11px]">Cold Boot Delay</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5">45 Seconds</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Protects Cloud Run cold starts</div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[11px]">API Rate Throttling</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5">350ms Pacing</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Circuit breaker on 429/503</div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5">
            <div className="text-slate-400 text-[11px]">Show Freshness TTL</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5">6-Hour Cache</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Zero duplicate API queries</div>
          </div>
        </div>
      </div>

      {/* Recent Audit Runs & Diff Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Recent Audit Runs & Changes ({recentRuns.length})
          </h4>
          <span className="text-xs text-slate-400">Immutable ledger keeps all reviews safe</span>
        </div>

        {recentRuns.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center text-xs text-slate-400 ${
            theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            No audit runs recorded yet. Click <strong>"Run Audit Now"</strong> above to perform the first full library sweep.
          </div>
        ) : (
          <div className="space-y-3">
            {recentRuns.map((run: any) => {
              const isExpanded = expandedRunId === run.id;
              return (
                <div
                  key={run.id}
                  className={`rounded-2xl border transition overflow-hidden ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                    className="w-full p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left hover:bg-white/[0.02] cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">Run #{run.id.slice(-6)}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(run.timestamp).toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {run.durationMs}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Audited {run.totalShowsAudited} shows • {run.summary.showsModified} modified
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {run.summary.bannersCount} imgs
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {run.summary.airDatesCount} dates
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {run.summary.channelsCount} channels
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {run.summary.titlesCount} titles
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 border-t ${
                          theme === 'dark' ? 'bg-[#0F1117] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {(!run.changes || run.changes.length === 0) ? (
                          <div className="text-xs text-slate-400 py-2">
                            ✓ All titles, air dates, streaming channels, and card images were already verified and up to date.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {run.changes.map((change: any, idx: number) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                                  theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200">{change.showTitle}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                      change.field === 'card_image'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : change.field === 'air_date'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : change.field === 'streaming_channel'
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                      {change.field.replace('_', ' ')}
                                    </span>
                                  </div>
                                  {change.detail && (
                                    <div className="text-[11px] text-slate-400">{change.detail}</div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                                  <span className="text-red-400/80 max-w-[140px] truncate" title={change.oldValue || 'none'}>
                                    {change.oldValue || '(none)'}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span className="text-emerald-400 max-w-[180px] truncate font-semibold" title={change.newValue}>
                                    {change.newValue}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
