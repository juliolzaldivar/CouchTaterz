/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Users, Shield, Search, Mail, ExternalLink, Trash2, UserPlus, 
  UserCheck, Star, Tv, Film, Eye, Activity, BarChart2, Globe, Sparkles, 
  Check, Copy, RefreshCw, MessageSquare, Heart, Clock, Layers, ArrowRight, 
  Share2, CheckCircle2, AlertCircle, TrendingUp, Filter, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkGraph } from './NetworkGraph';

interface UserAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string; email?: string; avatarUrl?: string };
  theme?: 'dark' | 'light';
  onInspectUserLibrary: (userId: string) => void;
  onDeleteUserProfile?: (userId: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatDetailedDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0 minutes';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs} hr${hrs === 1 ? '' : 's'}`);
  if (mins > 0) parts.push(`${mins} min${mins === 1 ? '' : 's'}`);
  if (secs > 0 && hrs === 0) parts.push(`${secs} sec${secs === 1 ? '' : 's'}`);
  return parts.join(' ') || '0 minutes';
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Just now';
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 45) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDateTime(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoString;
  }
}

export const UserAdminModal: React.FC<UserAdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  theme = 'dark',
  onInspectUserLibrary,
  onDeleteUserProfile
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'network' | 'trends' | 'commonalities' | 'reviews'>('profiles');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectingUser, setInspectingUser] = useState<any | null>(null);
  const [userSortBy, setUserSortBy] = useState<'activity' | 'recentLogin' | 'shows' | 'name' | 'friends'>('activity');
  
  // Quick connect tool state
  const [connectUser1, setConnectUser1] = useState<string>('');
  const [connectUser2, setConnectUser2] = useState<string>('');
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Batch delete state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState<boolean>(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/overview?email=${encodeURIComponent(currentUser.email || '')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Failed to load admin overview:', err);
      setError(err.message || 'Failed to fetch administration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, labelKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(labelKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConnectUsers = async () => {
    if (!connectUser1 || !connectUser2 || connectUser1 === connectUser2) return;
    try {
      const res = await fetch('/api/friends/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: connectUser1, user2Id: connectUser2 })
      });
      if (res.ok) {
        setConnectStatus('Successfully linked users as buddies!');
        fetchAdminData();
        setTimeout(() => setConnectStatus(null), 3000);
      }
    } catch (err) {
      console.error('Error connecting users:', err);
    }
  };

  const handleUnfriendUsers = async (u1Id: string, u2Id: string) => {
    try {
      await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u1Id, targetUserId: u2Id, action: 'unfriend' })
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error unlinking users:', err);
    }
  };

  const handleDeleteUser = async (targetId: string) => {
    try {
      const res = await fetch(`/api/boards/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        if (onDeleteUserProfile) onDeleteUserProfile(targetId);
        setDeleteConfirmId(null);
        await fetchAdminData();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Failed to delete user profile.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('An unexpected error occurred while deleting the user.');
    }
  };

  const handleToggleSelectUser = (userId: string) => {
    if (userId === currentUser.id || userId === 'default') return;
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAllEligible = () => {
    const eligibleIds = filteredUsers
      .map((u: any) => u.id)
      .filter((id: string) => id !== currentUser.id && id !== 'default');
    setSelectedUserIds(new Set(eligibleIds));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds(new Set());
  };

  const handleBatchDeleteUsers = async () => {
    if (selectedUserIds.size === 0) return;
    setIsBatchDeleting(true);
    try {
      const idsArray = Array.from(selectedUserIds);
      const res = await fetch(`/api/admin/users/batch-delete?email=${encodeURIComponent(currentUser.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: idsArray })
      });
      if (res.ok) {
        if (onDeleteUserProfile) {
          idsArray.forEach(id => onDeleteUserProfile(id));
        }
        setSelectedUserIds(new Set());
        setBatchDeleteConfirmOpen(false);
        await fetchAdminData();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Batch deletion failed.');
      }
    } catch (err) {
      console.error('Error batch deleting users:', err);
      alert('An error occurred during batch deletion.');
    } finally {
      setIsBatchDeleting(false);
    }
  };

  // Filtered and sorted users list
  const usersList = data?.users || [];
  const filteredUsers = usersList.filter((u: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  }).sort((a: any, b: any) => {
    if (userSortBy === 'activity') {
      return (b.totalTimeSpentSeconds || 0) - (a.totalTimeSpentSeconds || 0);
    }
    if (userSortBy === 'recentLogin') {
      const timeA = new Date(a.lastLoginAt || a.lastActiveAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.lastLoginAt || b.lastActiveAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    }
    if (userSortBy === 'shows') {
      return (b.stats?.totalShows || 0) - (a.stats?.totalShows || 0);
    }
    if (userSortBy === 'friends') {
      return (b.friendsCount || 0) - (a.friendsCount || 0);
    }
    return (a.name || '').localeCompare(b.name || '');
  });

  const summary = data?.summary || {
    totalUsers: 0,
    activeOnlineCount: 0,
    activeInLast24HoursCount: 0,
    totalTimeSpentSeconds: 0,
    totalTrackedShows: 0,
    totalReviewsCount: 0,
    avgCommunityScore: null,
    totalConnections: 0,
    statusDistribution: { Watching: 0, Backlog: 0, Completed: 0, Dropped: 0 },
    serviceDistribution: {},
    genreDistribution: {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`relative w-full max-w-6xl h-[85vh] max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border ${
          theme === 'dark' 
            ? 'bg-[#0F1117] text-slate-100 border-slate-800' 
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Top Header Bar */}
        <div className={`p-4 sm:p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-[#141824] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">User Administration & Insights</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Central management dashboard for profiles, viewing trends, review stats, and social connections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                theme === 'dark'
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Refresh live admin data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition ${
                theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 border-b text-center text-xs divide-x divide-y xs:divide-y-0 ${
          theme === 'dark' ? 'bg-[#111420] border-slate-800 divide-slate-800/60' : 'bg-slate-100/70 border-slate-200 divide-slate-200'
        }`}>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Total Users
            </div>
            <div className="text-lg font-black text-blue-400 mt-0.5">{summary.totalUsers}</div>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Active Online
            </div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{summary.activeOnlineCount}</div>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Total System Time
            </div>
            <div className="text-lg font-black text-indigo-400 mt-0.5" title={`${summary.totalTimeSpentSeconds || 0} seconds`}>
              {formatDuration(summary.totalTimeSpentSeconds)}
            </div>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <Tv className="w-3.5 h-3.5 text-purple-400" /> Tracked Shows
            </div>
            <div className="text-lg font-black text-purple-400 mt-0.5">{summary.totalTrackedShows}</div>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Reviews & Notes
            </div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{summary.totalReviewsCount}</div>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Connections
            </div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">{summary.totalConnections}</div>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Avg Rating
            </div>
            <div className="text-lg font-black text-amber-300 mt-0.5">
              {summary.avgCommunityScore ? `${summary.avgCommunityScore} / 10` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Tab Switcher Navigation */}
        <div className={`px-4 sm:px-6 pt-3 border-b flex items-center gap-2 overflow-x-auto scrollbar-none ${
          theme === 'dark' ? 'bg-[#0F1117] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'network'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social Network ({summary.totalConnections})</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'trends'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Viewing Trends & Engagement</span>
          </button>

          <button
            onClick={() => setActiveTab('commonalities')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'commonalities'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Top Shows & Commonalities</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews & Notes ({summary.totalReviewsCount})</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6 scrollbar-thin">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading user profiles and aggregate insights...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="font-bold">{error}</p>
              <button onClick={fetchAdminData} className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs">
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: User Directory */}
              {activeTab === 'profiles' && (
                <div className="space-y-4">
                  {/* Search bar & batch action controls & Sort */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or user ID..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none transition ${
                          theme === 'dark'
                            ? 'bg-[#161A26] border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                        }`}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Sort Filter Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs ${
                        theme === 'dark' ? 'bg-[#161A26] border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}>
                        <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 hidden xs:inline">Sort:</span>
                        <select
                          value={userSortBy}
                          onChange={e => setUserSortBy(e.target.value as any)}
                          className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-200"
                        >
                          <option value="activity" className="bg-slate-900 text-slate-200">Most Time in App</option>
                          <option value="recentLogin" className="bg-slate-900 text-slate-200">Recent Login</option>
                          <option value="shows" className="bg-slate-900 text-slate-200">Most Shows</option>
                          <option value="friends" className="bg-slate-900 text-slate-200">Most Buddies</option>
                          <option value="name" className="bg-slate-900 text-slate-200">Alphabetical</option>
                        </select>
                      </div>

                      <button
                        onClick={selectedUserIds.size > 0 ? handleDeselectAll : handleSelectAllEligible}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{selectedUserIds.size > 0 ? 'Deselect' : 'Select All'}</span>
                      </button>

                      {selectedUserIds.size > 0 && (
                        <button
                          onClick={() => setBatchDeleteConfirmOpen(true)}
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-rose-600/30 animate-pulse"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge ({selectedUserIds.size})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Users Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers.map((user: any, uIdx: number) => {
                      const isProtected = user.id === currentUser.id || user.id === 'default';
                      const isSelected = selectedUserIds.has(user.id);

                      return (
                      <div
                        key={`admin-user-${user.id}-${uIdx}`}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500/60 shadow-lg shadow-rose-500/10'
                            : theme === 'dark'
                            ? 'bg-[#151926] border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Top row: Checkbox, Avatar, Name, Email, Online */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Checkbox for Batch Selection */}
                            <button
                              disabled={isProtected}
                              onClick={() => handleToggleSelectUser(user.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                                isProtected
                                  ? 'opacity-30 cursor-not-allowed border-slate-700 bg-slate-800'
                                  : isSelected
                                  ? 'bg-rose-600 border-rose-500 text-white cursor-pointer shadow-sm'
                                  : 'border-slate-600 hover:border-slate-400 bg-slate-800/80 cursor-pointer'
                              }`}
                              title={isProtected ? 'Protected user profile' : 'Select user for batch actions'}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="relative shrink-0">
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-md"
                              />
                              <span
                                className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#151926] ${
                                  user.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'
                                }`}
                                title={user.isOnline ? 'Active Online Now' : 'Offline'}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-sm text-slate-100">{user.name}</h3>
                                {user.id === currentUser.id && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{user.email}</span>
                                <button
                                  onClick={() => handleCopy(user.email, `email_${user.id}`)}
                                  className="text-slate-500 hover:text-slate-300 transition"
                                  title="Copy Email"
                                >
                                  {copiedId === `email_${user.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                ID: <span className="font-mono">{user.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold ${
                              user.isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {user.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>

                        {/* Last Login & Time in System Activity Bar */}
                        <div className={`p-2 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs ${
                          theme === 'dark' ? 'bg-[#181d2c] border-slate-800/80' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-[11px] text-slate-400">Last login:</span>
                            <span className="font-bold text-slate-200" title={formatFullDateTime(user.lastLoginAt || user.lastActiveAt)}>
                              {formatRelativeTime(user.lastLoginAt || user.lastActiveAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-extrabold text-[11px]">
                              <span>⏱️ {formatDuration(user.totalTimeSpentSeconds)}</span>
                              <span className="text-[10px] text-emerald-400/80 font-normal">in app</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({user.sessionCount || 1} {user.sessionCount === 1 ? 'login' : 'logins'})
                            </span>
                          </div>
                        </div>

                        {/* Middle Stats Bar */}
                        <div className={`p-2.5 rounded-xl grid grid-cols-4 text-center text-[11px] gap-1 ${
                          theme === 'dark' ? 'bg-[#1A1F30]' : 'bg-slate-200/60'
                        }`}>
                          <div>
                            <span className="block text-slate-400 text-[10px]">Shows</span>
                            <span className="font-black text-slate-200">{user.stats.totalShows}</span>
                          </div>
                          <div>
                            <span className="block text-blue-400 text-[10px]">Watching</span>
                            <span className="font-black text-blue-300">{user.stats.watching}</span>
                          </div>
                          <div>
                            <span className="block text-amber-400 text-[10px]">Backlog</span>
                            <span className="font-black text-amber-300">{user.stats.backlog}</span>
                          </div>
                          <div>
                            <span className="block text-emerald-400 text-[10px]">Reviews</span>
                            <span className="font-black text-emerald-300">{user.stats.reviewsCount}</span>
                          </div>
                        </div>

                        {/* Top genres & services pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {user.topServices.map((srv: string, idx: number) => (
                            <span key={`srv-${srv}-${idx}`} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                              {srv}
                            </span>
                          ))}
                          {user.topGenres.map((gn: string, idx: number) => (
                            <span key={`gn-${gn}-${idx}`} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                              {gn}
                            </span>
                          ))}
                          <span className="ml-auto text-slate-400 font-bold">
                            🤝 {user.friendsCount} Buddies
                          </span>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              onInspectUserLibrary(user.id);
                              onClose();
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Library</span>
                          </button>

                          <button
                            onClick={() => setInspectingUser(user)}
                            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="View full user details & session analytics"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {user.id !== currentUser.id && user.id !== 'default' && (
                            <button
                              onClick={() => setDeleteConfirmId(user.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                              title="Delete user profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Delete confirmation inline */}
                        {deleteConfirmId === user.id && (
                          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 space-y-2">
                            <p className="font-bold">Are you sure you want to purge {user.name}'s board?</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg text-xs"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Batch Delete Confirmation Overlay Modal */}
              {batchDeleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg p-6 rounded-3xl bg-[#141824] border border-rose-500/40 shadow-2xl space-y-5 text-slate-100"
                  >
                    <div className="flex items-center gap-3 text-rose-400">
                      <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg">Confirm Batch User Purge</h3>
                        <p className="text-xs text-rose-300">This action is permanent and cannot be undone.</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      You are about to permanently delete <strong className="text-rose-400">{selectedUserIds.size} user profile(s)</strong> from CouchTaterz, including local database records, Cloud SQL database rows, Firestore documents, and friend connections.
                    </p>

                    {/* Preview list of users to delete */}
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 max-h-40 overflow-y-auto space-y-1.5 text-xs scrollbar-thin">
                      {Array.from(selectedUserIds).map(id => {
                        const targetUser = usersList.find((u: any) => u.id === id);
                        return (
                          <div key={`batch-del-item-${id}`} className="flex items-center justify-between text-slate-300">
                            <span className="font-bold">{targetUser?.name || id}</span>
                            <span className="font-mono text-[10px] text-slate-500">{targetUser?.email || id}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        disabled={isBatchDeleting}
                        onClick={() => setBatchDeleteConfirmOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isBatchDeleting}
                        onClick={handleBatchDeleteUsers}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-rose-600/30"
                      >
                        {isBatchDeleting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Purging Accounts...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Yes, Purge {selectedUserIds.size} Accounts</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* TAB 2: Social Network */}
              {activeTab === 'network' && (
                <div className="space-y-4">
                  <NetworkGraph
                    usersList={data?.users || []}
                    networkConnections={data?.networkConnections || []}
                    topShowsList={data?.topShows || []}
                    theme={theme}
                    currentUser={currentUser}
                    onInspectUserLibrary={(uId) => {
                      onInspectUserLibrary(uId);
                      onClose();
                    }}
                  />

                  {/* Quick Connect Administrative Tool */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-extrabold text-sm text-slate-100">Quick Buddy Linker (Admin Connect)</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Link any two users together as mutual Binge Buddies without needing email invites.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <select
                        value={connectUser1}
                        onChange={e => setConnectUser1(e.target.value)}
                        className={`p-2.5 rounded-xl text-xs border outline-none font-medium ${
                          theme === 'dark' ? 'bg-[#1A1F30] border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                        }`}
                      >
                        <option value="">Select User 1...</option>
                        {usersList.map((u: any, idx: number) => (
                          <option key={`opt1-${u.id}-${idx}`} value={u.id}>{u.name} ({u.id})</option>
                        ))}
                      </select>

                      <select
                        value={connectUser2}
                        onChange={e => setConnectUser2(e.target.value)}
                        className={`p-2.5 rounded-xl text-xs border outline-none font-medium ${
                          theme === 'dark' ? 'bg-[#1A1F30] border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                        }`}
                      >
                        <option value="">Select User 2...</option>
                        {usersList.map((u: any, idx: number) => (
                          <option key={`opt2-${u.id}-${idx}`} value={u.id}>{u.name} ({u.id})</option>
                        ))}
                      </select>

                      <button
                        onClick={handleConnectUsers}
                        disabled={!connectUser1 || !connectUser2 || connectUser1 === connectUser2}
                        className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Link as Buddies</span>
                      </button>
                    </div>

                    {connectStatus && (
                      <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> {connectStatus}
                      </p>
                    )}
                  </div>

                  {/* Connected Pairs Matrix / List */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-indigo-400" />
                      Active Connections Matrix ({data?.networkConnections?.length || 0} Friend Pairs)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(data?.networkConnections || []).map((conn: any, idx: number) => (
                        <div
                          key={`conn-${conn.user1Id || idx}-${conn.user2Id || idx}-${idx}`}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
                            <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              {conn.user1Name}
                            </span>
                            <span className="text-slate-500">↔</span>
                            <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              {conn.user2Name}
                            </span>
                          </div>

                          <button
                            onClick={() => handleUnfriendUsers(conn.user1Id, conn.user2Id)}
                            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                          >
                            Unlink
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Viewing Trends & Platforms */}
              {activeTab === 'trends' && (
                <div className="space-y-6">
                  {/* Status Breakdown Bar */}
                  <div className={`p-5 rounded-2xl border space-y-3 ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Show Status Distribution (Watching vs Backlog vs Completed)
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <span className="block text-slate-400 text-[10px]">Watching</span>
                        <span className="text-lg font-black text-blue-400">{summary.statusDistribution.Watching}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="block text-slate-400 text-[10px]">Backlog (Plan to Watch)</span>
                        <span className="text-lg font-black text-amber-400">{summary.statusDistribution.Backlog}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="block text-slate-400 text-[10px]">Completed</span>
                        <span className="text-lg font-black text-emerald-400">{summary.statusDistribution.Completed}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="block text-slate-400 text-[10px]">Dropped</span>
                        <span className="text-lg font-black text-rose-400">{summary.statusDistribution.Dropped}</span>
                      </div>
                    </div>
                  </div>

                  {/* Streaming Service Distribution */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-blue-400" />
                      Streaming Platform Share across Community Libraries
                    </h3>

                    <div className="space-y-2.5">
                      {(data?.serviceTrends || []).map((item: any, idx: number) => {
                        const pct = summary.totalTrackedShows > 0 ? Math.round((item.count / summary.totalTrackedShows) * 100) : 0;
                        return (
                          <div key={`st-${item.service}-${idx}`} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-200">{item.service}</span>
                              <span className="text-slate-400">{item.count} titles ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Genre Distribution */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-400" />
                      Most Tracked Genres
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {(data?.genreTrends || []).map((item: any, idx: number) => (
                        <div
                          key={`gt-${item.genre}-${idx}`}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 flex items-center gap-2"
                        >
                          <span>{item.genre}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-200 text-[10px]">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User Engagement & Time Leaderboard */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        User Engagement & Time Spent in System Leaderboard
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        Total System Time: <strong className="text-emerald-300">{formatDetailedDuration(summary.totalTimeSpentSeconds)}</strong>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[...usersList]
                        .sort((a, b) => (b.totalTimeSpentSeconds || 0) - (a.totalTimeSpentSeconds || 0))
                        .map((u: any, idx: number) => {
                          const totalSysTime = summary.totalTimeSpentSeconds || 1;
                          const userSecs = u.totalTimeSpentSeconds || 0;
                          const pct = Math.min(100, Math.round((userSecs / Math.max(totalSysTime, 1)) * 100));

                          return (
                            <div key={`leaderboard-${u.id}-${idx}`} className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                                    idx === 0 ? 'bg-amber-400 text-black shadow-sm' :
                                    idx === 1 ? 'bg-slate-300 text-black' :
                                    idx === 2 ? 'bg-amber-700 text-white' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                                  <span className="font-bold text-slate-200">{u.name}</span>
                                  {u.isOnline && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      Online
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400 text-[11px]">
                                    Last login: <strong className="text-slate-300">{formatRelativeTime(u.lastLoginAt || u.lastActiveAt)}</strong>
                                  </span>
                                  <span className="font-mono font-black text-emerald-400 text-xs">
                                    {formatDuration(userSecs)}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(pct, 2)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Top Content & Commonalities */}
              {activeTab === 'commonalities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100">Top Trending Shows & Shared Titles</h3>
                      <p className="text-xs text-slate-400">Shows appearing across multiple user libraries.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data?.topShows || []).map((show: any, idx: number) => (
                      <div
                        key={`top-show-${show.title || idx}-${idx}`}
                        className={`p-4 rounded-2xl border flex items-start gap-3 transition ${
                          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {show.bannerImage ? (
                          <img
                            src={show.bannerImage}
                            alt={show.title}
                            className="w-16 h-20 rounded-xl object-cover shrink-0 shadow-md border border-slate-700"
                          />
                        ) : (
                          <div className="w-16 h-20 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                            <Tv className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-sm text-slate-100 truncate">{show.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                              {show.count} {show.count === 1 ? 'User' : 'Users'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-bold text-blue-400">{show.streamingService}</span>
                            {show.avgScore && (
                              <span className="flex items-center gap-1 font-bold text-amber-300">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {show.avgScore} / 10
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-slate-500 mr-1">Tracked by:</span>
                            {show.users.map((u: any, uIdx: number) => (
                              <span
                                key={`show-u-${u.id || u.name || uIdx}-${uIdx}`}
                                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium"
                              >
                                {u.name} ({u.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Reviews & Notes Feed */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100">User Reviews & Notes Feed</h3>
                      <p className="text-xs text-slate-400">Browse user notes and custom ratings across all titles.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(data?.recentReviews || []).map((rev: any, idx: number) => (
                      <div
                        key={`rev-${rev.userId || idx}-${rev.showTitle || idx}-${idx}`}
                        className={`p-4 rounded-2xl border space-y-2 ${
                          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-700"
                            />
                            <span className="font-extrabold text-xs text-slate-200">{rev.userName}</span>
                            <span className="text-slate-500 text-[10px]">reviewed</span>
                            <span className="font-extrabold text-xs text-blue-400">{rev.showTitle}</span>
                          </div>

                          {rev.userScore && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {rev.userScore} / 10
                            </span>
                          )}
                        </div>

                        {rev.userNotes ? (
                          <p className="text-xs text-slate-300 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50 leading-relaxed">
                            "{rev.userNotes}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No written review notes provided.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detailed User Inspector Modal Drawer */}
        <AnimatePresence>
          {inspectingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col p-6 space-y-4 ${
                  theme === 'dark' ? 'bg-[#121624] text-white border-slate-800' : 'bg-white text-black border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={inspectingUser.avatarUrl} alt={inspectingUser.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h3 className="font-extrabold text-base">{inspectingUser.name}'s Profile Details</h3>
                      <p className="text-xs text-slate-400">{inspectingUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setInspectingUser(null)} className="p-2 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  {/* User Session & Activity Time Metrics */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <h4 className="text-xs font-black uppercase text-blue-300 tracking-wider">User Session & Time Tracking</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inspectingUser.isOnline 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {inspectingUser.isOnline ? '🟢 Online Now' : `Last Seen ${formatRelativeTime(inspectingUser.lastActiveAt)}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                        <span className="block text-slate-400 text-[10px] font-medium">Last Login</span>
                        <span className="font-extrabold text-blue-300 text-xs mt-0.5 block">
                          {formatRelativeTime(inspectingUser.lastLoginAt)}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate mt-0.5" title={inspectingUser.lastLoginAt}>
                          {formatFullDateTime(inspectingUser.lastLoginAt)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                        <span className="block text-slate-400 text-[10px] font-medium">Total Time Spent</span>
                        <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">
                          {formatDuration(inspectingUser.totalTimeSpentSeconds)}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                          {formatDetailedDuration(inspectingUser.totalTimeSpentSeconds)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                        <span className="block text-slate-400 text-[10px] font-medium">Login Sessions</span>
                        <span className="font-extrabold text-purple-300 text-sm mt-0.5 block">
                          {inspectingUser.sessionCount || 1}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Cumulative Logins
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                        <span className="block text-slate-400 text-[10px] font-medium">Account Created</span>
                        <span className="font-extrabold text-slate-200 text-xs mt-0.5 block">
                          {formatRelativeTime(inspectingUser.createdAt)}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                          {formatFullDateTime(inspectingUser.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Tracked Library ({inspectingUser.shows?.length || 0})</h4>
                  <div className="space-y-2">
                    {(inspectingUser.shows || []).map((s: any, idx: number) => (
                      <div key={`user-show-${s.id || s.title}-${idx}`} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-extrabold text-slate-100">{s.title}</div>
                          <div className="text-[10px] text-slate-400">{s.streamingService} • {s.status}</div>
                          {s.userNotes && (
                            <div className="text-[11px] text-amber-200/90 italic mt-1">"{s.userNotes}"</div>
                          )}
                        </div>
                        {s.userScore && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                            ★ {s.userScore}/10
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      onInspectUserLibrary(inspectingUser.id);
                      setInspectingUser(null);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Switch View to {inspectingUser.name}'s Board</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
