/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Users,
  Plus,
  Tv,
  Star,
  Check,
  X,
  Share2,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  Shield,
  Layers,
  ArrowRight,
  Flame,
  Film
} from 'lucide-react';
import {
  SharedVipWatchlist,
  SharedWatchlistShow,
  SharedWatchlistCollaborator,
  TvShow
} from '../types';
import {
  fetchSharedWatchlists,
  createSharedWatchlist,
  updateSharedWatchlist,
  addShowToSharedWatchlist,
  removeShowFromSharedWatchlist,
  voteOnSharedWatchlistShow,
  deleteSharedWatchlist
} from '../utils/sharedWatchlists';
import { getFriendsData } from '../utils/friendsStorage';
import { normalizeUserId } from '../utils/userUtils';

interface SharedVipWatchlistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  allUsers?: any[];
  currentShows?: TvShow[];
  initialShowToAdd?: any;
  initialBuddyId?: string | null;
  onAddShowToPersonalBoard?: (show: any) => void;
  onOpenUpgradeModal?: () => void;
  theme?: 'dark' | 'light';
  initialSelectedListId?: string;
}

const THEME_COLORS: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
  purple: { bg: 'from-purple-900/40 to-indigo-950/60', border: 'border-purple-500/40', text: 'text-purple-300', badgeBg: 'bg-purple-500/20 text-purple-300' },
  amber: { bg: 'from-amber-900/40 to-orange-950/60', border: 'border-amber-500/40', text: 'text-amber-300', badgeBg: 'bg-amber-500/20 text-amber-300' },
  emerald: { bg: 'from-emerald-900/40 to-teal-950/60', border: 'border-emerald-500/40', text: 'text-emerald-300', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
  indigo: { bg: 'from-indigo-900/40 to-blue-950/60', border: 'border-indigo-500/40', text: 'text-indigo-300', badgeBg: 'bg-indigo-500/20 text-indigo-300' },
  rose: { bg: 'from-rose-900/40 to-pink-950/60', border: 'border-rose-500/40', text: 'text-rose-300', badgeBg: 'bg-rose-500/20 text-rose-300' }
};

const BADGE_OPTIONS = [
  '👑 VIP Shared',
  '🔥 Binge Squad',
  '🍿 Movie Night',
  '✨ Curated VIP',
  '🚀 Sci-Fi Club',
  '🏆 Emmy Contenders',
  '❤️ Couples Marathon'
];

export const SharedVipWatchlistsModal: React.FC<SharedVipWatchlistsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers = [],
  currentShows = [],
  initialShowToAdd,
  initialBuddyId,
  onAddShowToPersonalBoard,
  onOpenUpgradeModal,
  theme = 'dark',
  initialSelectedListId
}) => {
  const isJulio = currentUser?.email?.toLowerCase() === 'juliozaldivar@gmail.com' || currentUser?.id === 'default';
  const isVip = Boolean(currentUser?.isVip || currentUser?.isPro || isJulio);

  const [watchlists, setWatchlists] = useState<SharedVipWatchlist[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Watching' | 'Backlog' | 'Completed'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Creation State
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newBadge, setNewBadge] = useState<string>('👑 VIP Shared');
  const [newColor, setNewColor] = useState<string>('purple');
  const [selectedBuddyIds, setSelectedBuddyIds] = useState<string[]>([]);
  const [selectedInitialShows, setSelectedInitialShows] = useState<TvShow[]>([]);
  const [savingNewList, setSavingNewList] = useState<boolean>(false);

  // Add Show Inline State
  const [isAddingShow, setIsAddingShow] = useState<boolean>(false);
  const [addShowTitle, setAddShowTitle] = useState<string>('');
  const [addShowService, setAddShowService] = useState<string>('Netflix');
  const [addShowStatus, setAddShowStatus] = useState<'Watching' | 'Backlog' | 'Completed'>('Watching');
  const [addShowNotes, setAddShowNotes] = useState<string>('');
  const [addShowSeason, setAddShowSeason] = useState<number>(1);
  const [addShowEpisode, setAddShowEpisode] = useState<number>(1);
  const [addingShowLoading, setAddingShowLoading] = useState<boolean>(false);

  // Friends Data
  const friendsData = useMemo(() => {
    return getFriendsData(currentUser?.id || 'default');
  }, [currentUser?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Watchlists
  const refreshWatchlists = async () => {
    setLoading(true);
    try {
      const data = await fetchSharedWatchlists(currentUser?.id || 'default');
      setWatchlists(data);
      if (data.length > 0 && !selectedListId) {
        if (initialSelectedListId && data.some(d => d.id === initialSelectedListId)) {
          setSelectedListId(initialSelectedListId);
        } else {
          setSelectedListId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshWatchlists();
    }
  }, [isOpen, currentUser?.id]);

  const activeWatchlist = useMemo(() => {
    return watchlists.find(w => w.id === selectedListId) || watchlists[0] || null;
  }, [watchlists, selectedListId]);

  // Filtered Shows
  const filteredShows = useMemo(() => {
    if (!activeWatchlist || !Array.isArray(activeWatchlist.shows)) return [];
    return activeWatchlist.shows.filter(s => {
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchService = s.streamingService?.toLowerCase().includes(q);
        const matchAddedBy = s.addedByUserName?.toLowerCase().includes(q);
        if (!matchTitle && !matchService && !matchAddedBy) return false;
      }
      return true;
    });
  }, [activeWatchlist, statusFilter, searchQuery]);

  // Handle Create List
  const handleCreateNewList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || savingNewList) return;
    setSavingNewList(true);

    const buddiesToAdd = (friendsData.friends || [])
      .filter(fId => selectedBuddyIds.includes(normalizeUserId(fId)))
      .map(fId => ({
        id: normalizeUserId(fId),
        name: fId.replace(/^user-/, '').replace(/-\d+$/, '').replace(/^\w/, c => c.toUpperCase()) || 'Watch Buddy',
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fId}`,
        isVip: true,
        role: 'editor' as const
      }));

    try {
      const created = await createSharedWatchlist({
        title: newTitle.trim(),
        description: newDescription.trim(),
        badge: newBadge,
        themeColor: newColor,
        createdById: currentUser?.id || 'default',
        createdByName: currentUser?.name || (isJulio ? 'Julio (VIP Host)' : 'VIP Tater'),
        createdByAvatarUrl: currentUser?.avatarUrl,
        collaborators: buddiesToAdd,
        initialShows: selectedInitialShows.map(s => ({
          id: s.id,
          title: s.title,
          streamingService: s.streamingService || 'Other',
          bannerImage: s.bannerImage,
          genres: s.genres || [],
          status: (s.status as any) || 'Watching',
          targetSeason: (s as any).targetSeason || (s as any).currentSeason || 1,
          targetEpisode: (s as any).targetEpisode || (s as any).currentEpisode || 1,
          notes: (s as any).notes || ''
        }))
      });

      if (created) {
        setWatchlists(prev => [created, ...prev]);
        setSelectedListId(created.id);
        setIsCreating(false);
        setNewTitle('');
        setNewDescription('');
        setSelectedBuddyIds([]);
        setSelectedInitialShows([]);
        showToast(`🎉 Shared Watchlist '${created.title}' created!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNewList(false);
    }
  };

  // Handle Add Show
  const handleAddShowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWatchlist || !addShowTitle.trim() || addingShowLoading) return;
    setAddingShowLoading(true);

    try {
      const updated = await addShowToSharedWatchlist(activeWatchlist.id, {
        title: addShowTitle.trim(),
        streamingService: addShowService,
        status: addShowStatus,
        notes: addShowNotes.trim(),
        addedByUserId: currentUser?.id || 'default',
        addedByUserName: currentUser?.name || 'Julio'
      });

      if (updated) {
        setWatchlists(prev => prev.map(w => w.id === updated.id ? updated : w));
        setIsAddingShow(false);
        setAddShowTitle('');
        setAddShowNotes('');
        showToast(`Added '${addShowTitle.trim()}' to shared watchlist!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingShowLoading(false);
    }
  };

  // Handle Vote
  const handleVote = async (showId: string, voteValue: number) => {
    if (!activeWatchlist) return;
    const userId = currentUser?.id || 'default';
    const userName = currentUser?.name || 'Julio';

    const updated = await voteOnSharedWatchlistShow(
      activeWatchlist.id,
      showId,
      userId,
      userName,
      voteValue
    );

    if (updated) {
      setWatchlists(prev => prev.map(w => w.id === updated.id ? updated : w));
    }
  };

  // Handle Status Change
  const handleShowStatusChange = async (showId: string, newStatus: 'Watching' | 'Backlog' | 'Completed') => {
    if (!activeWatchlist) return;
    const nextShows = activeWatchlist.shows.map(s => s.id === showId ? { ...s, status: newStatus } : s);
    const targetShow = activeWatchlist.shows.find(s => s.id === showId);
    
    const updated = await updateSharedWatchlist(activeWatchlist.id, {
      shows: nextShows,
      updatedBy: { id: currentUser?.id || 'default', name: currentUser?.name || 'Julio' },
      actionDescription: `changed '${targetShow?.title || 'Show'}' status to ${newStatus}`
    } as any);

    if (updated) {
      setWatchlists(prev => prev.map(w => w.id === updated.id ? updated : w));
      showToast(`Updated to ${newStatus}!`);
    }
  };

  // Handle Remove Show
  const handleRemoveShow = async (showId: string) => {
    if (!activeWatchlist) return;
    const updated = await removeShowFromSharedWatchlist(
      activeWatchlist.id,
      showId,
      { id: currentUser?.id || 'default', name: currentUser?.name || 'Julio' }
    );
    if (updated) {
      setWatchlists(prev => prev.map(w => w.id === updated.id ? updated : w));
      showToast('Show removed from shared watchlist.');
    }
  };

  // Handle Delete Watchlist
  const handleDeleteList = async () => {
    if (!activeWatchlist) return;
    if (!window.confirm(`Are you sure you want to delete the shared watchlist '${activeWatchlist.title}'?`)) return;

    const ok = await deleteSharedWatchlist(activeWatchlist.id, currentUser?.id || 'default');
    if (ok) {
      setWatchlists(prev => prev.filter(w => w.id !== activeWatchlist.id));
      showToast('Shared watchlist deleted.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          theme === 'dark' ? 'bg-[#0F121B] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Bar */}
        <div className={`p-4 sm:p-6 pb-4 border-b flex items-center justify-between gap-3 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950 border-slate-800'
            : 'bg-gradient-to-r from-amber-50 via-purple-50 to-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400/20" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black tracking-tight truncate">
                  Shared VIP Buddy Watchlists
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                  VIP All-Access
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Collaboratively queue, rate, and track shows together in real time with your Binge Buddies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">New Shared List</span>
              <span className="sm:hidden">New List</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Watchlist Tabs Strip */}
        <div className={`px-4 sm:px-6 py-2.5 border-b overflow-x-auto scrollbar-none flex items-center gap-2 ${
          theme === 'dark' ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
        }`}>
          {watchlists.map(list => {
            const isSelected = list.id === activeWatchlist?.id;
            return (
              <button
                key={list.id}
                onClick={() => {
                  setSelectedListId(list.id);
                  setIsCreating(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-600/25 border-purple-500 text-white shadow-sm ring-1 ring-purple-400/40'
                    : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px]">{list.badge?.split(' ')[0] || '👑'}</span>
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{list.title}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] opacity-80 font-mono">
                  {list.shows?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* CREATE WATCHLIST FORM MODAL/DRAWER */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Create New VIP Shared Watchlist</h4>
                      <p className="text-[11px] text-slate-400">Invite connected buddies to co-curate and rate this playlist</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg text-xs font-bold"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateNewList} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Watchlist Name *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="e.g., Weekend Sci-Fi Squad, Oscar Contenders"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Playlist Badge</label>
                      <select
                        value={newBadge}
                        onChange={e => setNewBadge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white outline-none focus:border-purple-400 cursor-pointer"
                      >
                        {BADGE_OPTIONS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Description / Watch Party Goal</label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                      placeholder="e.g. Syncing up every Friday 8pm to finish Season 2 before finale!"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Buddy Invite Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span>Invite Connected Binge Buddies ({selectedBuddyIds.length} Selected)</span>
                      <span className="text-[10px] text-amber-400 font-bold">👑 VIP Unlimited Collaborators</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                      {(friendsData.friends || []).map(fId => {
                        const norm = normalizeUserId(fId);
                        const isSelected = selectedBuddyIds.includes(norm);
                        const cleanName = fId.replace(/^user-/, '').replace(/-\d+$/, '').replace(/^\w/, c => c.toUpperCase()) || 'Watch Buddy';
                        return (
                          <button
                            type="button"
                            key={fId}
                            onClick={() => {
                              setSelectedBuddyIds(prev => 
                                isSelected ? prev.filter(id => id !== norm) : [...prev, norm]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{cleanName}</span>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                      {(!friendsData.friends || friendsData.friends.length === 0) && (
                        <p className="text-[11px] text-slate-500 py-1 px-2">No connected buddies yet. You can invite them anytime!</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim() || savingNewList}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {savingNewList ? 'Creating...' : 'Create Watchlist'}
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTIVE WATCHLIST HEADER CARD */}
          {activeWatchlist && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-4 ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                      {activeWatchlist.badge || '👑 VIP Shared'}
                    </span>
                    <h3 className="text-lg font-black text-white">{activeWatchlist.title}</h3>
                  </div>
                  {activeWatchlist.description && (
                    <p className="text-xs text-slate-400">{activeWatchlist.description}</p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Created by <span className="text-slate-300 font-bold">{activeWatchlist.createdByName}</span> • {activeWatchlist.collaborators?.length || 1} Buddies in Squad
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsAddingShow(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Show</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?sharedList=${activeWatchlist.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      showToast('Shared VIP Watchlist link copied!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
                    title="Copy direct invite link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Link</span>
                  </button>

                  {(activeWatchlist.createdById === currentUser?.id || isJulio) && (
                    <button
                      onClick={handleDeleteList}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Delete Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Collaborators Avatar Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Collaborators:</span>
                  {(activeWatchlist.collaborators || []).map((collab, i) => (
                    <div
                      key={collab.id || i}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-bold"
                    >
                      <img
                        src={collab.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${collab.id}`}
                        alt={collab.name}
                        className="w-4 h-4 rounded-full border border-purple-500 object-cover"
                      />
                      <span>{collab.name}</span>
                      {collab.role === 'owner' && <Crown className="w-3 h-3 text-amber-400" />}
                    </div>
                  ))}
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {activeWatchlist.shows?.length || 0} Shows Queued
                </span>
              </div>
            </div>
          )}

          {/* ADD SHOW INLINE FORM */}
          <AnimatePresence>
            {isAddingShow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-purple-300 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>Add Show to '{activeWatchlist?.title}'</span>
                  </h4>
                  <button
                    onClick={() => setIsAddingShow(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddShowSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Show Title *</label>
                    <input
                      type="text"
                      required
                      value={addShowTitle}
                      onChange={e => setAddShowTitle(e.target.value)}
                      placeholder="e.g., Silo, The Bear, Fallout"
                      className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Streaming Platform</label>
                    <select
                      value={addShowService}
                      onChange={e => setAddShowService(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                    >
                      <option value="Netflix">Netflix</option>
                      <option value="HBO Max">HBO Max</option>
                      <option value="Apple TV+">Apple TV+</option>
                      <option value="Hulu">Hulu</option>
                      <option value="Disney+">Disney+</option>
                      <option value="Prime Video">Prime Video</option>
                      <option value="Paramount+">Paramount+</option>
                      <option value="Peacock">Peacock</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Status</label>
                    <select
                      value={addShowStatus}
                      onChange={e => setAddShowStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white outline-none cursor-pointer"
                    >
                      <option value="Watching">Watching Together</option>
                      <option value="Backlog">Backlog / Next Up</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!addShowTitle.trim() || addingShowLoading}
                      className="w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md cursor-pointer disabled:opacity-50 transition"
                    >
                      {addingShowLoading ? '...' : '+ Add'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FILTERS & SEARCH ROW */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              {(['All', 'Watching', 'Backlog', 'Completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow-xs font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'All' ? 'All Shows' : st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter shows in watchlist..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* SHOWS GRID */}
          <div className="space-y-3">
            {filteredShows.map(show => {
              const userVote = show.votes?.[currentUser?.id || 'default'] || 0;
              const allVoteValues = Object.values(show.votes || {});
              const avgScore = allVoteValues.length > 0 
                ? (allVoteValues.reduce((a, b) => a + b, 0) / allVoteValues.length).toFixed(1)
                : null;

              return (
                <div
                  key={show.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Icon / Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/30 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner">
                      {show.bannerImage ? (
                        <img src={show.bannerImage} alt={show.title} className="w-full h-full object-cover" />
                      ) : (
                        <span>🎬</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-white truncate">{show.title}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold">
                          {show.streamingService}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Added by <strong className="text-slate-300">{show.addedByUserName}</strong></span>
                        <span>•</span>
                        {show.notes && <span className="text-purple-300 italic truncate max-w-[200px]">"{show.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status, Voting & Actions */}
                  <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    {/* Status Pill Selector */}
                    <select
                      value={show.status || 'Watching'}
                      onChange={e => handleShowStatusChange(show.id, e.target.value as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase outline-none cursor-pointer border ${
                        show.status === 'Watching' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                        show.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                        'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      }`}
                    >
                      <option value="Watching" className="bg-slate-900 text-white">Watching</option>
                      <option value="Backlog" className="bg-slate-900 text-white">Backlog</option>
                      <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                    </select>

                    {/* Collaborative Star Rating Voting */}
                    <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold mr-0.5">Vote:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleVote(show.id, star)}
                          className={`p-0.5 transition cursor-pointer hover:scale-125 ${
                            star <= userVote ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'
                          }`}
                          title={`Vote ${star} stars`}
                        >
                          <Star className={`w-3.5 h-3.5 ${star <= userVote ? 'fill-amber-400' : ''}`} />
                        </button>
                      ))}
                      {avgScore && (
                        <span className="text-[10px] text-amber-300 font-extrabold ml-1 bg-amber-500/20 px-1 rounded">
                          {avgScore}★
                        </span>
                      )}
                    </div>

                    {/* Add to Personal Board Button */}
                    {onAddShowToPersonalBoard && (
                      <button
                        onClick={() => {
                          onAddShowToPersonalBoard(show);
                          showToast(`Added '${show.title}' to your personal board!`);
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                        title="Copy to My Personal Board"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Remove from Watchlist */}
                    <button
                      onClick={() => handleRemoveShow(show.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Remove from shared watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredShows.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <Tv className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-400">No shows match your filter in this watchlist</p>
                <button
                  onClick={() => setIsAddingShow(true)}
                  className="text-xs text-purple-400 font-extrabold hover:underline"
                >
                  + Add your squad's first show
                </button>
              </div>
            )}
          </div>

          {/* ACTIVITY FEED ACCORDION */}
          {activeWatchlist?.activityFeed && activeWatchlist.activityFeed.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Squad Activity Stream</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeWatchlist.activityFeed.slice(0, 8).map(act => (
                  <div key={act.id} className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-900/50 p-1.5 rounded-lg">
                    <span>
                      <strong className="text-slate-200">{act.userName}</strong> {act.action}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-6 right-6 p-3 rounded-xl bg-purple-600 text-white font-black text-xs shadow-2xl flex items-center justify-between border border-purple-400/40 z-50"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
