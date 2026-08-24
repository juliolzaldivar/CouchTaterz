/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Users, Shield, Search, Mail, ExternalLink, Trash2, UserPlus, 
  UserCheck, Star, Tv, Film, Eye, Activity, BarChart2, Globe, Sparkles, 
  Check, Copy, RefreshCw, MessageSquare, Heart, Clock, Layers, ArrowRight, 
  Share2, CheckCircle2, AlertCircle, TrendingUp, Filter, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserDirectoryTab } from './UserDirectoryTab';
import { NetworkMatrixTab } from './NetworkMatrixTab';
import { UserConnectionsDrawer } from './UserConnectionsDrawer';
import { matchUserId, normalizeUserId } from '../utils/userUtils';

interface UserAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string; email?: string; avatarUrl?: string };
  theme?: 'dark' | 'light';
  onInspectUserLibrary: (userId: string) => void;
  onDeleteUserProfile?: (userId: string) => void;
  onImpersonateUser?: (user: any) => void;
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
  onDeleteUserProfile,
  onImpersonateUser
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'network' | 'trends' | 'commonalities' | 'reviews'>('profiles');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modal drawers & inspectors
  const [inspectingUser, setInspectingUser] = useState<any | null>(null);
  const [connectionDrawerUserId, setConnectionDrawerUserId] = useState<string | null>(null);

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

  const handleConnectUsers = async (u1: string, u2: string) => {
    try {
      // Optimistically update connections
      setData((prev: any) => {
        if (!prev) return prev;
        const u1Obj = (prev.users || []).find((u: any) => matchUserId(u.id, u1));
        const u2Obj = (prev.users || []).find((u: any) => matchUserId(u.id, u2));
        const u1Name = u1Obj?.name || u1;
        const u2Name = u2Obj?.name || u2;

        const nextConnections = [...(prev.networkConnections || [])];
        const pairKey = [normalizeUserId(u1), normalizeUserId(u2)].sort().join('___');
        if (!nextConnections.some((c: any) => [normalizeUserId(c.user1Id), normalizeUserId(c.user2Id)].sort().join('___') === pairKey)) {
          nextConnections.push({ user1Id: u1, user1Name: u1Name, user2Id: u2, user2Name: u2Name });
        }

        const nextUsers = (prev.users || []).map((u: any) => {
          if (matchUserId(u.id, u1)) {
            const updatedFriends = Array.from(new Set([...(u.friendIds || []), u2]));
            return { ...u, friendIds: updatedFriends, friendsCount: updatedFriends.length };
          }
          if (matchUserId(u.id, u2)) {
            const updatedFriends = Array.from(new Set([...(u.friendIds || []), u1]));
            return { ...u, friendIds: updatedFriends, friendsCount: updatedFriends.length };
          }
          return u;
        });

        return {
          ...prev,
          networkConnections: nextConnections,
          users: nextUsers,
          summary: {
            ...prev.summary,
            totalConnections: (prev.summary?.totalConnections || 0) + 1
          }
        };
      });

      const res = await fetch('/api/friends/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: u1, user2Id: u2 })
      });
      if (res.ok) {
        // Quiet background sync without full reload spinner
        try {
          const resOverview = await fetch(`/api/admin/overview?email=${encodeURIComponent(currentUser.email || 'julio@couchtaterz.com')}`);
          if (resOverview.ok) {
            const freshJson = await resOverview.json();
            setData(freshJson);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error connecting users:', err);
    }
  };

  const handleUnfriendUsers = async (u1Id: string, u2Id: string) => {
    try {
      // Optimistically update connections and buddies in UI state
      setData((prev: any) => {
        if (!prev) return prev;
        const nextUsers = (prev.users || []).map((u: any) => {
          if (matchUserId(u.id, u1Id)) {
            const updatedFriends = (u.friendIds || []).filter((id: string) => !matchUserId(id, u2Id));
            return { ...u, friendIds: updatedFriends, friendsCount: updatedFriends.length };
          }
          if (matchUserId(u.id, u2Id)) {
            const updatedFriends = (u.friendIds || []).filter((id: string) => !matchUserId(id, u1Id));
            return { ...u, friendIds: updatedFriends, friendsCount: updatedFriends.length };
          }
          return u;
        });

        const nextConnections = (prev.networkConnections || []).filter(
          (c: any) => !(
            (matchUserId(c.user1Id, u1Id) && matchUserId(c.user2Id, u2Id)) ||
            (matchUserId(c.user1Id, u2Id) && matchUserId(c.user2Id, u1Id))
          )
        );

        return {
          ...prev,
          networkConnections: nextConnections,
          users: nextUsers,
          summary: {
            ...prev.summary,
            totalConnections: Math.max(0, (prev.summary?.totalConnections || 1) - 1)
          }
        };
      });

      // Also clean up local storage cache if available
      try {
        const k1 = `coughtater_friends_${u1Id}`;
        const raw1 = localStorage.getItem(k1);
        if (raw1) {
          const p1 = JSON.parse(raw1);
          p1.friends = (p1.friends || []).filter((id: string) => !matchUserId(id, u2Id));
          localStorage.setItem(k1, JSON.stringify(p1));
        }
        const k2 = `coughtater_friends_${u2Id}`;
        const raw2 = localStorage.getItem(k2);
        if (raw2) {
          const p2 = JSON.parse(raw2);
          p2.friends = (p2.friends || []).filter((id: string) => !matchUserId(id, u1Id));
          localStorage.setItem(k2, JSON.stringify(p2));
        }
      } catch (e) {}

      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u1Id, targetUserId: u2Id, action: 'unfriend' })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('Server unfriend response error:', errJson);
      }

      // Quietly refresh admin overview state from server
      try {
        const resOverview = await fetch(`/api/admin/overview?email=${encodeURIComponent(currentUser.email || 'julio@couchtaterz.com')}`);
        if (resOverview.ok) {
          const freshJson = await resOverview.json();
          setData(freshJson);
        }
      } catch (e) {}
    } catch (err) {
      console.error('Error unlinking users:', err);
    }
  };

  const handleDeleteUser = async (targetId: string) => {
    try {
      const res = await fetch(`/api/boards/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        if (onDeleteUserProfile) onDeleteUserProfile(targetId);
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
    if (userId === currentUser.id || userId === 'default' || userId === 'user-julio') return;
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

  const handleSelectAllEligible = (eligibleIds: string[]) => {
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

  const handleBulkMeshConnect = async (userIds: string[]) => {
    try {
      const res = await fetch(`/api/admin/friends/bulk-action?email=${encodeURIComponent(currentUser.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, action: 'mesh' })
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (e) {
      console.error('Bulk mesh error:', e);
    }
  };

  const handleBulkUnlink = async (userIds: string[]) => {
    try {
      const res = await fetch(`/api/admin/friends/bulk-action?email=${encodeURIComponent(currentUser.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, action: 'unlink_all' })
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (e) {
      console.error('Bulk unlink error:', e);
    }
  };

  const usersList = data?.users || [];
  const connectionDrawerUser = useMemo(() => {
    if (!connectionDrawerUserId) return null;
    return usersList.find((u: any) => matchUserId(u.id, connectionDrawerUserId)) || null;
  }, [usersList, connectionDrawerUserId]);

  const handleOpenConnectionsDrawer = (userOrId: any) => {
    const id = typeof userOrId === 'string' ? userOrId : userOrId?.id;
    setConnectionDrawerUserId(id || null);
  };
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
        className={`relative w-full max-w-6xl h-[88vh] max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border ${
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
                <h2 className="text-xl font-extrabold tracking-tight">Enterprise User Administration</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Control Center
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage accounts at scale, inspect social graphs, streamline pairing, and analyze community trends.
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
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Total App Time
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
            <span>Network & Matrix ({data?.networkConnections?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'trends'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Viewing Trends & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('commonalities')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'commonalities'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Top Shared Titles</span>
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
            <span>Reviews Feed ({summary.totalReviewsCount})</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {loading && !data ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500" />
              <p className="text-sm font-extrabold text-slate-300">Synchronizing administration data...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm">Administration Access Error</h4>
                <p className="text-xs text-rose-200/80 leading-relaxed">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: User Directory */}
              {activeTab === 'profiles' && (
                <UserDirectoryTab
                  usersList={usersList}
                  currentUser={currentUser}
                  theme={theme}
                  selectedUserIds={selectedUserIds}
                  onToggleSelectUser={handleToggleSelectUser}
                  onSelectAllEligible={handleSelectAllEligible}
                  onDeselectAll={handleDeselectAll}
                  onInspectUser={setInspectingUser}
                  onOpenConnectionsDrawer={handleOpenConnectionsDrawer}
                  onInspectUserLibrary={onInspectUserLibrary}
                  onImpersonateUser={(userToImpersonate) => {
                    if (onImpersonateUser) {
                      onImpersonateUser(userToImpersonate);
                      onClose();
                    }
                  }}
                  onDeleteUser={handleDeleteUser}
                  onOpenBatchDeleteModal={() => setBatchDeleteConfirmOpen(true)}
                  onBulkMeshConnect={handleBulkMeshConnect}
                  onBulkUnlink={handleBulkUnlink}
                  formatRelativeTime={formatRelativeTime}
                  formatDuration={formatDuration}
                  formatFullDateTime={formatFullDateTime}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
              )}

              {/* TAB 2: Network & Matrix */}
              {activeTab === 'network' && (
                <NetworkMatrixTab
                  usersList={usersList}
                  networkConnections={data?.networkConnections || []}
                  topShowsList={data?.topShows || []}
                  currentUser={currentUser}
                  theme={theme}
                  onInspectUserLibrary={onInspectUserLibrary}
                  onConnectUsers={handleConnectUsers}
                  onUnfriendUsers={handleUnfriendUsers}
                  onOpenUserConnectionsDrawer={handleOpenConnectionsDrawer}
                />
              )}

              {/* TAB 3: Viewing Trends & Stats */}
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

                  {/* Streaming Service Popularity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-5 rounded-2xl border space-y-3 ${
                      theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                        <Film className="w-4 h-4 text-blue-400" />
                        Popular Streaming Providers
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(summary.serviceDistribution || {})
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 7)
                          .map(([service, count], idx) => (
                            <div key={`srv-${service}-${idx}`} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-bold">{service}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-extrabold">{count as number} shows</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-3 ${
                      theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-emerald-400" />
                        Genre Popularity
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(summary.genreDistribution || {})
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 7)
                          .map(([genre, count], idx) => (
                            <div key={`gnr-${genre}-${idx}`} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-bold">{genre}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-extrabold">{count as number} shows</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Top Shared Titles */}
              {activeTab === 'commonalities' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(data?.topShows || []).map((show: any, idx: number) => (
                      <div
                        key={`top-show-${show.id || show.title}-${idx}`}
                        className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                          theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-black uppercase">
                              {show.watcherCount} Fans
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-100 line-clamp-1">{show.title}</h4>
                          <p className="text-[11px] text-slate-400">{show.streamingService || 'All Platforms'}</p>
                        </div>

                        {show.watchers && show.watchers.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Watched By</div>
                            <div className="flex flex-wrap gap-1.5">
                              {show.watchers.map((w: any, wIdx: number) => (
                                <span
                                  key={`watcher-${w.userId}-${wIdx}`}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium"
                                >
                                  {w.userName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Reviews Feed */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data?.recentReviews || []).map((rev: any, idx: number) => (
                      <div
                        key={`rev-${rev.userId}-${rev.showTitle}-${idx}`}
                        className={`p-4 rounded-2xl border space-y-2.5 ${
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

        {/* Batch Delete Confirmation Overlay Modal */}
        <AnimatePresence>
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
        </AnimatePresence>

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

        {/* User-Centric Dedicated Connections Drawer */}
        <AnimatePresence>
          {connectionDrawerUser && (
            <UserConnectionsDrawer
              isOpen={!!connectionDrawerUser}
              onClose={() => setConnectionDrawerUserId(null)}
              user={connectionDrawerUser}
              allUsers={usersList}
              onUnlink={handleUnfriendUsers}
              onLink={handleConnectUsers}
              onInspectLibrary={(uId) => {
                onInspectUserLibrary(uId);
                onClose();
              }}
              theme={theme}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
