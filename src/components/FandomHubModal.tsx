/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Flame, 
  Trophy, 
  Star, 
  MessageSquare, 
  Users, 
  Play, 
  Check, 
  Plus, 
  ExternalLink, 
  Sparkles,
  UserPlus,
  Compass,
  Tv,
  Search,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShowFandom, FandomMember, TvShow, User } from '../types';
import { getStreamingServiceLink } from '../utils/streamingLinks';
import { FandomNetworkGraph } from './FandomNetworkGraph';

interface FandomHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  fandom: ShowFandom | null;
  allFandoms?: ShowFandom[];
  currentUser?: User | null;
  theme?: string;
  onToggleJoinFandom: (showTitle: string) => void;
  onSelectMemberBoard: (userId: string) => void;
  onAddToQueue?: (showTitle: string) => void;
  onAddBuddy?: (userId: string) => void;
  connectedBuddyIds?: string[];
  onSelectFandom?: (fandom: ShowFandom) => void;
}

export const FandomHubModal: React.FC<FandomHubModalProps> = ({
  isOpen,
  onClose,
  fandom,
  allFandoms = [],
  currentUser,
  theme = 'dark',
  onToggleJoinFandom,
  onSelectMemberBoard,
  onAddToQueue,
  onAddBuddy,
  connectedBuddyIds = [],
  onSelectFandom
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'reviews' | 'consensus'>('leaderboard');
  const [superfanView, setSuperfanView] = useState<'list' | 'network'>('list');
  const [isSwitchingShow, setIsSwitchingShow] = useState(false);
  const [showSearchQuery, setShowSearchQuery] = useState('');
  const [showFilterTab, setShowFilterTab] = useState<'all' | 'pinned'>('all');

  // Filtered fandoms list for in-modal switcher
  const filteredSwitchFandoms = useMemo(() => {
    let list = allFandoms;
    if (showFilterTab === 'pinned') {
      list = list.filter(f => f.isUserJoined);
    }
    if (showSearchQuery.trim()) {
      const q = showSearchQuery.toLowerCase().trim();
      list = list.filter(f => f.showTitle.toLowerCase().includes(q));
    }
    return list;
  }, [allFandoms, showFilterTab, showSearchQuery]);

  // Compute other shows frequently tracked by members of this fandom
  const relatedFandomShows = useMemo(() => {
    if (!fandom || allFandoms.length <= 1) return [];
    const memberIds = new Set(fandom.members.map(m => m.userId));
    
    return allFandoms
      .filter(f => f.normalizedTitle !== fandom.normalizedTitle)
      .map(other => {
        const overlapCount = other.members.filter(m => memberIds.has(m.userId)).length;
        return {
          fandom: other,
          overlapCount,
          overlapPercentage: Math.round((overlapCount / fandom.members.length) * 100)
        };
      })
      .filter(item => item.overlapCount > 0)
      .sort((a, b) => b.overlapCount - a.overlapCount)
      .slice(0, 6);
  }, [fandom, allFandoms]);

  if (!isOpen || !fandom) return null;

  const isJoined = fandom.isUserJoined;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full ${
            activeTab === 'leaderboard' && superfanView === 'network' ? 'max-w-4xl xl:max-w-5xl' : 'max-w-2xl'
          } transition-all duration-300 rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] z-10 ${
            theme === 'dark'
              ? 'bg-[#11141D] border-white/10 text-white'
              : 'bg-white border-neutral-200 text-neutral-900 shadow-neutral-400/20'
          }`}
        >
          {/* Visual Header / Banner */}
          <div className="relative h-24 xs:h-28 sm:h-44 md:h-48 w-full overflow-hidden shrink-0 bg-neutral-900">
            {fandom.bannerImage ? (
              <img
                src={fandom.bannerImage}
                alt={fandom.showTitle}
                className="w-full h-full object-cover brightness-[0.7] filter"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black flex items-center justify-center">
                <Tv className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400/30" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#11141D] via-[#11141D]/60 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition cursor-pointer z-10"
              title="Close Fandom Hub"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Banner Content */}
            <div className="absolute bottom-2 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 sm:gap-3">
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                    <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-current animate-pulse" />
                    Show Fandom
                  </span>
                  {fandom.streamingService && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border backdrop-blur-md ${
                      theme === 'dark' ? 'bg-white/10 text-slate-200 border-white/15' : 'bg-white/90 text-neutral-800 border-neutral-300'
                    }`}>
                      {fandom.streamingService}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-neutral-900/80 text-slate-300 border border-white/10 backdrop-blur-md">
                    {fandom.memberCount} {fandom.memberCount === 1 ? 'Fan' : 'Fans'}
                  </span>
                  {fandom.avgRating !== null && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                      <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
                      <span>{fandom.avgRating}</span>
                      <span className="text-white/50 font-normal">/ 10</span>
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-2xl font-black tracking-tight text-white truncate drop-shadow-md">
                  {fandom.showTitle}
                </h2>
              </div>

              {/* Join / Leave Action Button */}
              <button
                onClick={() => onToggleJoinFandom(fandom.showTitle)}
                className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all cursor-pointer shrink-0 active:scale-95 self-start sm:self-auto ${
                  isJoined
                    ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20 border border-amber-400'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20'
                }`}
              >
                <Flame className={`w-3 h-3 sm:w-4 sm:h-4 ${isJoined ? 'fill-current' : 'text-amber-400'}`} />
                <span>{isJoined ? 'Joined' : 'Join Fandom'}</span>
                {isJoined && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* Sub-Header: 3-Way Equal Segmented Control Bar */}
          <div className={`p-1.5 sm:px-4 sm:py-2.5 border-b ${
            theme === 'dark' ? 'bg-[#151924] border-white/5' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-1.5 sm:gap-2">
              {/* 3 Main Categories - Always 100% visible on all screen sizes */}
              <div className="grid grid-cols-3 gap-1 bg-black/25 p-0.5 sm:p-1 rounded-xl flex-1 w-full sm:max-w-md">
                {/* Tab 1: Superfans */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('leaderboard');
                    setIsSwitchingShow(false);
                  }}
                  className={`py-1 sm:py-2 px-1 rounded-lg font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer text-center ${
                    activeTab === 'leaderboard' && !isSwitchingShow
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Top Superfans</span>
                  <span className="sm:hidden">Superfans</span>
                  <span className={`text-[9px] sm:text-[10px] font-mono px-1 rounded-full ${
                    activeTab === 'leaderboard' && !isSwitchingShow
                      ? 'bg-black/20 text-black font-bold'
                      : 'text-slate-400 bg-white/5'
                  }`}>
                    {fandom.topTenMembers.length}
                  </span>
                </button>

                {/* Tab 2: Takes & Reviews */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('reviews');
                    setIsSwitchingShow(false);
                  }}
                  className={`py-1 sm:py-2 px-1 rounded-lg font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer text-center ${
                    activeTab === 'reviews' && !isSwitchingShow
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Takes & Reviews</span>
                  <span className="sm:hidden">Reviews</span>
                  <span className={`text-[9px] sm:text-[10px] font-mono px-1 rounded-full ${
                    activeTab === 'reviews' && !isSwitchingShow
                      ? 'bg-black/20 text-black font-bold'
                      : 'text-slate-400 bg-white/5'
                  }`}>
                    {fandom.recentTakes.length}
                  </span>
                </button>

                {/* Tab 3: Taste Overlap */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('consensus');
                    setIsSwitchingShow(false);
                  }}
                  className={`py-1 sm:py-2 px-1 rounded-lg font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer text-center ${
                    activeTab === 'consensus' && !isSwitchingShow
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Taste Overlap</span>
                  <span className="sm:hidden">Overlap</span>
                  <span className={`text-[9px] sm:text-[10px] font-mono px-1 rounded-full ${
                    activeTab === 'consensus' && !isSwitchingShow
                      ? 'bg-black/20 text-black font-bold'
                      : 'text-slate-400 bg-white/5'
                  }`}>
                    {relatedFandomShows.length}
                  </span>
                </button>
              </div>

              {/* Switch Show Button & Score Pill */}
              <div className="flex items-center justify-between xs:justify-end gap-1.5 sm:gap-2 shrink-0">
                {allFandoms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsSwitchingShow(!isSwitchingShow)}
                    className={`flex-1 xs:flex-none px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 border transition cursor-pointer shadow-xs ${
                      isSwitchingShow
                        ? 'bg-amber-500 text-black border-amber-400 font-black'
                        : theme === 'dark'
                          ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                          : 'bg-white hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                    }`}
                    title="Search and switch between all shows in your collection"
                  >
                    <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                    <span>Switch</span>
                    <span className="text-[9px] sm:text-[10px] font-mono opacity-80">({allFandoms.length})</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isSwitchingShow ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {fandom.avgRating !== null && (
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-400 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    <span>{fandom.avgRating}</span>
                    <span className="text-[9px] text-slate-400 font-normal">/ 10</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show Switcher Search Drawer */}
          {isSwitchingShow && (
            <div className={`p-3 border-b space-y-2 ${
              theme === 'dark' ? 'bg-[#0E1118] border-white/10' : 'bg-neutral-100 border-neutral-300'
            }`}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={showSearchQuery}
                    onChange={(e) => setShowSearchQuery(e.target.value)}
                    placeholder={`Search among all ${allFandoms.length} shows...`}
                    className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border outline-hidden transition ${
                      theme === 'dark'
                        ? 'bg-[#181C28] border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50'
                        : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-amber-500'
                    }`}
                    autoFocus
                  />
                  {showSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setShowSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowFilterTab('all')}
                    className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border transition cursor-pointer ${
                      showFilterTab === 'all'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({allFandoms.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterTab('pinned')}
                    className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                      showFilterTab === 'pinned'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    <span>Pinned ({allFandoms.filter(f => f.isUserJoined).length})</span>
                  </button>
                </div>
              </div>

              {/* Fast Scrollable Switcher List */}
              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                {filteredSwitchFandoms.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">
                    No matching shows found.
                  </p>
                ) : (
                  filteredSwitchFandoms.map((otherFandom) => {
                    const isCurrent = otherFandom.normalizedTitle === fandom.normalizedTitle;
                    return (
                      <button
                        key={`switcher-${otherFandom.normalizedTitle}`}
                        type="button"
                        onClick={() => {
                          if (onSelectFandom) {
                            onSelectFandom(otherFandom);
                          }
                          setIsSwitchingShow(false);
                          setShowSearchQuery('');
                        }}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition cursor-pointer border ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-black'
                            : theme === 'dark'
                              ? 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10 text-slate-200'
                              : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Flame className={`w-3.5 h-3.5 shrink-0 ${otherFandom.isUserJoined ? 'text-amber-400 fill-current' : 'text-slate-500'}`} />
                          <span className="truncate font-extrabold">{otherFandom.showTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                          <span>{otherFandom.memberCount} {otherFandom.memberCount === 1 ? 'Fan' : 'Fans'}</span>
                          {otherFandom.avgRating !== null && (
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {otherFandom.avgRating}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-black">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Modal Body Content */}
          <div className="p-2.5 sm:p-4 overflow-y-auto max-h-[64vh] sm:max-h-[60vh] space-y-2 sm:space-y-3">
            {/* TAB 1: TOP 10 SUPERFANS LEADERBOARD & BINGE BUDDIES NETWORK */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-slate-400 px-1 pb-0.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span>COMMUNITY SUPERFANS ({fandom.topTenMembers.length})</span>
                    <span className="hidden sm:inline opacity-60">•</span>
                    <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">Ranked by show engagement</span>
                  </div>

                  {/* View Mode Toggle: List vs Network Graph */}
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSuperfanView('list')}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-black flex items-center gap-1 transition cursor-pointer ${
                        superfanView === 'list'
                          ? 'bg-amber-500 text-black shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="View tabular list of superfans"
                    >
                      <Trophy className="w-3 h-3" />
                      <span>List View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuperfanView('network')}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 transition cursor-pointer ${
                        superfanView === 'network'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-purple-300 hover:text-white'
                      }`}
                      title="Interactive Binge Buddies Network Constellation Graph"
                    >
                      <Share2 className="w-3 h-3 text-purple-200" />
                      <span>Network Graph</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                    </button>
                  </div>
                </div>

                {superfanView === 'network' ? (
                  <FandomNetworkGraph
                    fandom={fandom}
                    allFandoms={allFandoms}
                    currentUser={currentUser}
                    connectedBuddyIds={connectedBuddyIds}
                    theme={theme}
                    onSelectMemberBoard={onSelectMemberBoard}
                    onAddBuddy={onAddBuddy}
                    onCloseModal={onClose}
                  />
                ) : fandom.topTenMembers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No superfans recorded yet. Be the first to join this fandom!
                  </div>
                ) : (
                  fandom.topTenMembers.map((member, index) => {
                    const isSelf = Boolean((currentUser && (member.userId === currentUser.id || member.userId === 'default')) || member.userId === 'default');
                    const isConnectedBuddy = connectedBuddyIds.includes(member.userId);
                    const rankMedal = `#${index + 1}`;
                    const avatarSrc = isSelf && currentUser?.avatarUrl
                      ? currentUser.avatarUrl
                      : (member.userAvatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.userName}`);
                    const displayName = isSelf && currentUser?.name ? currentUser.name : member.userName;

                    return (
                      <div
                        key={member.userId}
                        className={`p-2 sm:p-3 rounded-xl border transition-all ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/5 hover:border-amber-500/30'
                            : 'bg-neutral-50 border-neutral-200 hover:border-amber-300'
                        }`}
                      >
                        {/* Primary Row: Rank + Avatar + Name & Badges + Score + Board Link */}
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                            {/* Rank Badge */}
                            <span className="text-[11px] sm:text-xs font-black w-4 sm:w-6 text-center shrink-0 font-mono text-amber-400">
                              {rankMedal}
                            </span>

                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <img
                                src={avatarSrc}
                                alt={displayName}
                                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-amber-500/30"
                              />
                              {member.isOnline && (
                                <span
                                  className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#11141D] absolute -bottom-0.5 -right-0.5"
                                  title="Active Now"
                                />
                              )}
                            </div>

                            {/* Name & Badges */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs sm:text-sm truncate">
                                  {displayName}
                                </span>
                                {isSelf && (
                                  <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 shrink-0">
                                    YOU
                                  </span>
                                )}
                                {isConnectedBuddy && (
                                  <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 shrink-0">
                                    BUDDY
                                  </span>
                                )}
                              </div>
                              {/* Watch Status Subtitle */}
                              <span className="text-[10px] text-slate-400 block truncate">
                                {member.status}
                                {member.latestWatched && ` (S${member.latestWatched.season}E${member.latestWatched.episode})`}
                              </span>
                            </div>
                          </div>

                          {/* Right: Watch Status, Score & Quick Actions */}
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            {/* Watch Status Pill on Tablet / Desktop */}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border hidden md:inline-flex ${
                              member.status === 'Completed'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : member.status === 'Watching'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : 'bg-neutral-800 text-slate-300 border-white/10'
                            }`}>
                              {member.status}
                            </span>

                            {/* User Score Badge */}
                            {member.userScore && (
                              <div className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-black text-amber-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                                <span>{member.userScore}</span>
                                <span className="text-[9px] text-amber-400/60 font-normal hidden sm:inline">/ 10</span>
                              </div>
                            )}

                            {/* Quick Add Buddy */}
                            {!isSelf && !isConnectedBuddy && onAddBuddy && (
                              <button
                                onClick={() => onAddBuddy(member.userId)}
                                className="p-1 sm:px-2 sm:py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition cursor-pointer text-[10px] sm:text-xs font-bold flex items-center gap-1 active:scale-95"
                                title={`Add ${member.userName} as Binge Buddy`}
                              >
                                <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden md:inline">Add Buddy</span>
                              </button>
                            )}

                            {/* View Member Board - Inlined Compact Action Button */}
                            <button
                              onClick={() => {
                                onSelectMemberBoard(member.userId);
                                onClose();
                              }}
                              className="px-2 sm:px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer active:scale-95 shrink-0"
                              title={`View ${member.userName}'s complete show board`}
                            >
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span className="hidden xs:inline">Board</span>
                            </button>
                          </div>
                        </div>

                        {/* Tier 2: Dedicated Quote / Take Box (Only when present, compact) */}
                        {member.recentTake ? (
                          <div className={`mt-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs leading-snug border ${
                            theme === 'dark'
                              ? 'bg-black/30 border-white/5 text-slate-200'
                              : 'bg-amber-50/80 border-amber-200/60 text-neutral-800'
                          }`}>
                            <span className="text-amber-400 font-serif text-xs mr-0.5 select-none font-bold">“</span>
                            <span className="italic">{member.recentTake}</span>
                            <span className="text-amber-400 font-serif text-xs ml-0.5 select-none font-bold">”</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: RECENT COMMUNITY TAKES & MICRO-REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-2">
                {fandom.recentTakes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No episode reviews submitted by fandom members yet. Add your review to lead the feed!
                  </div>
                ) : (
                  fandom.recentTakes.map((take, idx) => (
                    <div
                      key={`${take.userId}-${idx}`}
                      className={`p-2.5 sm:p-3 rounded-xl border transition ${
                        theme === 'dark'
                          ? 'bg-white/5 border-white/5'
                          : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <img
                            src={take.userAvatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${take.userName}`}
                            alt={take.userName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-extrabold text-xs">{take.userName}</span>
                          {take.episodeKey && (
                            <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10">
                              {take.episodeKey}
                            </span>
                          )}
                        </div>

                        {take.score && (
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-400">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                            <span>{take.score} / 10</span>
                          </div>
                        )}
                      </div>

                      <p className={`text-[11px] sm:text-xs leading-snug sm:leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-neutral-800'}`}>
                        "{take.reviewText}"
                      </p>

                      <div className="mt-1.5 flex justify-end">
                        <button
                          onClick={() => {
                            onSelectMemberBoard(take.userId);
                            onClose();
                          }}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>Explore {take.userName}'s Board</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: TASTE OVERLAP & CONSENSUS BLENDS */}
            {activeTab === 'consensus' && (
              <div className="space-y-2.5">
                <div className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs leading-snug sm:leading-relaxed ${
                  theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fandom Taste Overlap Intelligence</span>
                  </div>
                  <span>Shows tracked and rated highest by fellow fans of <strong>{fandom.showTitle}</strong>:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relatedFandomShows.map(({ fandom: related, overlapCount, overlapPercentage }) => (
                    <div
                      key={related.normalizedTitle}
                      className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                        theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs truncate">{related.showTitle}</h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-400">
                          {overlapCount} {overlapCount === 1 ? 'fan' : 'fans'} ({overlapPercentage}% overlap)
                        </p>
                      </div>

                      {onAddToQueue && (
                        <button
                          onClick={() => onAddToQueue(related.showTitle)}
                          className="px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                          title={`Add ${related.showTitle} to my watchlist`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Queue</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className={`p-3 border-t flex items-center justify-between text-xs ${
            theme === 'dark' ? 'bg-[#151924] border-white/5 text-slate-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
          }`}>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Fandom connections grant full Binge Buddy perks & show browsing</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
