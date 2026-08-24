import React from 'react';
import { Layers, Check, Star, Filter, Search, Play, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardSectionProps {
  heroEpisodeWatched: boolean;
  setHeroEpisodeWatched: (w: boolean) => void;
  selectedProviderFilter: string;
  setSelectedProviderFilter: (p: string) => void;
  discoveryScope: 'your_shows' | 'buddy_picks';
  setDiscoveryScope: (s: 'your_shows' | 'buddy_picks') => void;
  activeCategoryTab: 'all' | 'watching' | 'up_next' | 'watched';
  setActiveCategoryTab: (t: 'all' | 'watching' | 'up_next' | 'watched') => void;
  filteredShows: Array<{
    id: string;
    title: string;
    service: string;
    tier: string;
    ep: string;
    totalEp: number;
    curEpNum: number;
    rating: number;
    img: string;
  }>;
}

export const DashboardSection: React.FC<DashboardSectionProps> = React.memo(({
  heroEpisodeWatched,
  setHeroEpisodeWatched,
  selectedProviderFilter,
  setSelectedProviderFilter,
  discoveryScope,
  setDiscoveryScope,
  activeCategoryTab,
  setActiveCategoryTab,
  filteredShows
}) => {
  return (
    <section id="doc-section-dashboard" className="space-y-8 scroll-mt-24">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-500/25">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Section 2</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          2. Dashboard & Queue Management
        </h2>
        <p className="text-base text-slate-300 font-medium max-w-3xl leading-relaxed">
          Three streamlined pipelines (Watching, Up Next, Watched) with distinct color coding, dynamic hero air banner, streaming service filters, and search discovery scoping.
        </p>
      </div>

      {/* DYNAMIC HERO BANNER EXAMPLE */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 shadow-2xl space-y-4 backdrop-blur-xl group">
        
        {/* Cinematic Backdrop Image matching real CouchTaterz Hero Banners */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg"
            alt="Severance Hero Banner"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Targeted Vignette and Gradient overlays to ensure ultra-sharp typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
        </div>

        {/* Banner Content (Relative to sit above backdrop) */}
        <div className="relative z-10 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/30 flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-white" />
                <span>Dynamic Air Banner</span>
              </span>
              <span className="text-xs text-slate-300 font-bold px-2.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80">
                Auto-Populated from Active Queue
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Airs Tonight at 9:00 PM EST</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white border border-slate-700 font-extrabold text-[10px]">
                  Apple TV+
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-blue-300">Season 2, Episode 4</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  🍅 98% RT
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                Severance: &ldquo;Woe's Hollow&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-2xl drop-shadow">
                Mark attempts to decode the encrypted Lumon security blueprint while Dylan balances the overtime switch protocols. Zero spoilers fenced.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-2.5">
              <button
                onClick={() => setHeroEpisodeWatched(!heroEpisodeWatched)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                  heroEpisodeWatched
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 ring-1 ring-blue-400/40'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{heroEpisodeWatched ? '✓ Episode 4 Watched' : 'Mark as Watched (+1)'}</span>
              </button>
              <span className="text-[10.5px] text-slate-300 font-medium bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                1-Click progress advance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE FILTER BAR & SEARCH & DISCOVERY BAR */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Provider Filter Bar */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Service Filter Bar (Filter Cards by Provider)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'Apple TV+', 'HBO Max', 'Hulu', 'Netflix'].map(prov => (
                <button
                  key={prov}
                  onClick={() => setSelectedProviderFilter(prov)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedProviderFilter === prov
                      ? 'bg-blue-600 text-white font-black shadow-xs'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {prov === 'all' ? 'All Providers (6)' : prov}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Discovery Scope Bar */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Search & Discovery Bar Scope
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDiscoveryScope('your_shows')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  discoveryScope === 'your_shows' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Your Shows (6)
              </button>
              <button
                onClick={() => setDiscoveryScope('buddy_picks')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  discoveryScope === 'buddy_picks' ? 'bg-blue-600 text-white font-black' : 'text-slate-400'
                }`}
              >
                Buddy Picks (14)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUEUE TIERS (WATCHING, UP NEXT, WATCHED) - ACCURATE COLOR ARCHITECTURE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">
            Queue Tiers: The 3 Horizontal Pillars
          </h3>
          <span className="text-xs text-slate-400 font-bold">Color-Coded Status Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TIER 1: WATCHING (BLUE) */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-blue-500/50 space-y-4 shadow-xl shadow-blue-950/20 flex flex-col justify-between backdrop-blur-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    1. Watching Tier
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black border border-blue-500/30">
                  Blue Signature
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                <strong>Watching:</strong> Shows you are actively following. Powers AI anti-spoiler features and release schedule alerts.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-white">Severance (Season 2)</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Watching
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Apple TV+ • S2E4 / 10</div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-2/5 h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-blue-400 pt-2 border-t border-slate-800">
              Active Primetime Watchlist
            </div>
          </div>

          {/* TIER 2: UP NEXT (AMBER) */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-500/50 space-y-4 shadow-xl shadow-amber-950/20 flex flex-col justify-between backdrop-blur-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    2. Up Next Tier
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                  Amber Signature
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                <strong>Up Next (Backlog):</strong> Shows on your curated backlog waiting to be started.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-white">The Last of Us (Season 2)</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Up Next
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">HBO Max • Premiere Queued</div>
                <div className="text-[10px] text-blue-300 font-bold bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20">
                  Spudz AI: Recommended for weekend binge
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-amber-400 pt-2 border-t border-slate-800">
              Curated Backlog Queue
            </div>
          </div>

          {/* TIER 3: WATCHED (EMERALD) */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/50 space-y-4 shadow-xl shadow-emerald-950/20 flex flex-col justify-between backdrop-blur-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    3. Watched Tier
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  Emerald Signature
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                <strong>Watched (Completed):</strong> Completed series kept for reference, ratings, and rewatch tracking.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">Slow Horses (Season 4)</span>
                  <span className="text-amber-400 text-xs font-black">⭐ 9.9</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Apple TV+ • All 6 Episodes Done</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Watched
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-emerald-400 pt-2 border-t border-slate-800">
              Completed Trophy Case & Ratings Archive
            </div>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE CATEGORY TAB FILTER PREVIEW */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Interactive Queue Filter Simulator</span>
            </h4>
            <p className="text-xs text-slate-400">
              Click any category pill to see how CouchTaterz filters and groups shows by their live status.
            </p>
          </div>

          {/* Category Tabs with accurate colors */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({filteredShows.length})
            </button>
            <button
              onClick={() => setActiveCategoryTab('watching')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeCategoryTab === 'watching'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              Watching (2)
            </button>
            <button
              onClick={() => setActiveCategoryTab('up_next')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeCategoryTab === 'up_next'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Up Next (2)
            </button>
            <button
              onClick={() => setActiveCategoryTab('watched')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeCategoryTab === 'watched'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Watched (2)
            </button>
          </div>
        </div>

        {/* Live Filtered Shows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredShows.map(show => (
            <div
              key={show.id}
              className={`p-3.5 rounded-2xl bg-slate-950 border transition-all ${
                show.tier === 'watching'
                  ? 'border-blue-500/40 hover:border-blue-500'
                  : show.tier === 'up_next'
                    ? 'border-amber-500/40 hover:border-amber-500'
                    : 'border-emerald-500/40 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  show.tier === 'watching'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : show.tier === 'up_next'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {show.tier === 'watching' ? 'Watching' : show.tier === 'up_next' ? 'Up Next' : 'Watched'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{show.service}</span>
              </div>
              <div className="text-xs font-black text-white truncate">{show.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{show.ep}</span>
                <span className="text-amber-400 font-bold">★ {show.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

DashboardSection.displayName = 'DashboardSection';
