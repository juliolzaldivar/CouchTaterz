/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, Search, UserMinus, UserCheck, Shield, Sparkles, Filter, 
  Trash2, Layers, ExternalLink, ChevronLeft, ChevronRight, CheckSquare, 
  Square, LayoutGrid, Table as TableIcon, Mail, Clock, Eye, AlertCircle, 
  Check, Copy, ArrowUpDown, LogIn, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserDirectoryTabProps {
  usersList: any[];
  currentUser: { id: string; name: string; email?: string; avatarUrl?: string };
  theme?: 'dark' | 'light';
  selectedUserIds: Set<string>;
  onToggleSelectUser: (userId: string) => void;
  onSelectAllEligible: (ids: string[]) => void;
  onDeselectAll: () => void;
  onInspectUser: (user: any) => void;
  onOpenConnectionsDrawer: (user: any) => void;
  onInspectUserLibrary: (userId: string) => void;
  onImpersonateUser?: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  onOpenBatchDeleteModal: () => void;
  onBulkMeshConnect?: (userIds: string[]) => Promise<void>;
  onBulkUnlink?: (userIds: string[]) => Promise<void>;
  formatRelativeTime: (iso?: string) => string;
  formatDuration: (sec?: number) => string;
  formatFullDateTime: (iso?: string) => string;
  copiedId: string | null;
  onCopy: (text: string, key: string) => void;
}

export const UserDirectoryTab: React.FC<UserDirectoryTabProps> = ({
  usersList = [],
  currentUser,
  theme = 'dark',
  selectedUserIds,
  onToggleSelectUser,
  onSelectAllEligible,
  onDeselectAll,
  onInspectUser,
  onOpenConnectionsDrawer,
  onInspectUserLibrary,
  onImpersonateUser,
  onDeleteUser,
  onOpenBatchDeleteModal,
  onBulkMeshConnect,
  onBulkUnlink,
  formatRelativeTime,
  formatDuration,
  formatFullDateTime,
  copiedId,
  onCopy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'empty' | 'active' | 'with_shows'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'recentLogin' | 'shows' | 'friends'>('activity');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [inlineDeleteId, setInlineDeleteId] = useState<string | null>(null);
  const [isPerformingBulkMesh, setIsPerformingBulkMesh] = useState(false);

  // Filter logic
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.id && user.id.toLowerCase().includes(q))
      );

      if (!matchesSearch) return false;

      if (statusFilter === 'online') return user.isOnline;
      if (statusFilter === 'empty') return (user.stats?.totalShows || 0) === 0 && (user.friendsCount || 0) === 0;
      if (statusFilter === 'active') return (user.totalTimeSpentSeconds || 0) > 300 || user.isOnline;
      if (statusFilter === 'with_shows') return (user.stats?.totalShows || 0) > 0;

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortBy === 'activity') {
        comp = (b.totalTimeSpentSeconds || 0) - (a.totalTimeSpentSeconds || 0);
      } else if (sortBy === 'recentLogin') {
        const timeA = new Date(a.lastLoginAt || a.lastActiveAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.lastLoginAt || b.lastActiveAt || b.createdAt || 0).getTime();
        comp = timeB - timeA;
      } else if (sortBy === 'shows') {
        comp = (b.stats?.totalShows || 0) - (a.stats?.totalShows || 0);
      } else if (sortBy === 'friends') {
        comp = (b.friendsCount || 0) - (a.friendsCount || 0);
      } else {
        comp = (a.name || '').localeCompare(b.name || '');
      }
      return sortAsc ? -comp : comp;
    });
  }, [usersList, searchQuery, statusFilter, sortBy, sortAsc]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, validCurrentPage, pageSize]);

  // Eligible for selection (non-protected)
  const visibleEligibleIds = useMemo(() => {
    return paginatedUsers
      .map(u => u.id)
      .filter(id => id !== currentUser.id && id !== 'default' && id !== 'user-julio');
  }, [paginatedUsers, currentUser.id]);

  const allVisibleSelected = visibleEligibleIds.length > 0 && visibleEligibleIds.every(id => selectedUserIds.has(id));

  const toggleSort = (field: 'name' | 'activity' | 'recentLogin' | 'shows' | 'friends') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const handleSelectVisibleOnly = () => {
    if (allVisibleSelected) {
      visibleEligibleIds.forEach(id => {
        if (selectedUserIds.has(id)) onToggleSelectUser(id);
      });
    } else {
      visibleEligibleIds.forEach(id => {
        if (!selectedUserIds.has(id)) onToggleSelectUser(id);
      });
    }
  };

  const handleBulkMesh = async () => {
    if (!onBulkMeshConnect || selectedUserIds.size < 2) return;
    setIsPerformingBulkMesh(true);
    try {
      await onBulkMeshConnect(Array.from(selectedUserIds));
    } finally {
      setIsPerformingBulkMesh(false);
    }
  };

  const handleBulkUnlinkAll = async () => {
    if (!onBulkUnlink || selectedUserIds.size < 2) return;
    setIsPerformingBulkMesh(true);
    try {
      await onBulkUnlink(Array.from(selectedUserIds));
    } finally {
      setIsPerformingBulkMesh(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Search, View Toggle, Filter & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Search ${usersList.length} users by name, email, or ID...`}
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

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Segment Filter Pill */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
            theme === 'dark' ? 'bg-[#161A26] border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({usersList.length})
            </button>
            <button
              onClick={() => { setStatusFilter('online'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                statusFilter === 'online' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </button>
            <button
              onClick={() => { setStatusFilter('with_shows'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                statusFilter === 'with_shows' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tracked Shows
            </button>
            <button
              onClick={() => { setStatusFilter('empty'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                statusFilter === 'empty' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Users with 0 tracked shows and 0 friends"
            >
              Ghost/Empty
            </button>
          </div>

          {/* Density Mode: Table vs Grid */}
          <div className={`flex items-center p-1 rounded-xl border ${
            theme === 'dark' ? 'bg-[#161A26] border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dense Tabular View (Scales for 100+ accounts)"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Operations Toolbar (Appears when 1+ users selected) */}
      <AnimatePresence>
        {selectedUserIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-xl bg-blue-500 text-white font-black text-xs">
                {selectedUserIds.size} Selected
              </span>
              <span className="text-xs text-slate-300 font-medium">Batch Operations:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onBulkMeshConnect && selectedUserIds.size >= 2 && (
                <button
                  onClick={handleBulkMesh}
                  disabled={isPerformingBulkMesh}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  title="Connect all selected users with each other as mutual buddies"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Mesh Link ({selectedUserIds.size})</span>
                </button>
              )}

              {onBulkUnlink && selectedUserIds.size >= 2 && (
                <button
                  onClick={handleBulkUnlinkAll}
                  disabled={isPerformingBulkMesh}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Unlink all pairwise connections among selected users"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Unlink Selected</span>
                </button>
              )}

              <button
                onClick={onOpenBatchDeleteModal}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Accounts ({selectedUserIds.size})</span>
              </button>

              <button
                onClick={onDeselectAll}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Table or Grid */}
      {filteredUsers.length === 0 ? (
        <div className="py-20 text-center text-slate-500 space-y-2 border border-dashed rounded-3xl border-slate-800">
          <Users className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm font-semibold">No users matching search or filter criteria.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* DENSE HIGH-SCALABILITY TABULAR VIEW */
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#131622] shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161B2B] text-slate-400 font-extrabold uppercase text-[10px] tracking-wider select-none">
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={handleSelectVisibleOnly}
                      className="text-slate-400 hover:text-white"
                      title={allVisibleSelected ? 'Deselect visible' : 'Select all visible on page'}
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th 
                    onClick={() => toggleSort('name')} 
                    className="p-3 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>User & Account</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('activity')} 
                    className="p-3 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Time Spent</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('recentLogin')} 
                    className="p-3 cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Last Active</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('shows')} 
                    className="p-3 cursor-pointer hover:text-slate-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Shows</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('friends')} 
                    className="p-3 cursor-pointer hover:text-slate-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Buddies</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="p-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedUsers.map((user: any, idx: number) => {
                  const isProtected = user.id === currentUser.id || user.id === 'default' || user.id === 'user-julio';
                  const isSelected = selectedUserIds.has(user.id);

                  return (
                    <tr
                      key={`user-row-${user.id}-${idx}`}
                      className={`transition group ${
                        isSelected 
                          ? 'bg-rose-500/10 hover:bg-rose-500/15' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          disabled={isProtected}
                          onClick={() => onToggleSelectUser(user.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition mx-auto ${
                            isProtected 
                              ? 'opacity-20 cursor-not-allowed border-slate-700 bg-slate-800' 
                              : isSelected
                              ? 'bg-rose-600 border-rose-500 text-white cursor-pointer shadow-sm'
                              : 'border-slate-600 hover:border-slate-400 bg-slate-800 cursor-pointer'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Avatar, Name, Email, ID */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <span
                              className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border border-[#131622] ${
                                user.isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-600'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-200 truncate">{user.name}</span>
                              {user.id === currentUser.id && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span className="truncate max-w-[160px]">{user.email}</span>
                              <button
                                onClick={() => onCopy(user.email, `em_${user.id}`)}
                                className="text-slate-500 hover:text-slate-300"
                                title="Copy Email"
                              >
                                {copiedId === `em_${user.id}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Time Spent */}
                      <td className="p-3">
                        <span className="font-extrabold text-emerald-400">
                          {formatDuration(user.totalTimeSpentSeconds)}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="p-3 text-slate-400">
                        <span title={formatFullDateTime(user.lastLoginAt || user.lastActiveAt)}>
                          {formatRelativeTime(user.lastLoginAt || user.lastActiveAt)}
                        </span>
                      </td>

                      {/* Tracked Shows Count & Breakdown */}
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 font-extrabold">
                          {user.stats?.totalShows || 0}
                        </span>
                      </td>

                      {/* Buddies Count & Action Drawer Trigger */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenConnectionsDrawer(user)}
                          className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                          title="Manage social connections for this user"
                        >
                          <Users className="w-3 h-3" />
                          <span>{user.friendsCount || 0}</span>
                        </button>
                      </td>

                      {/* Row Inline Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onImpersonateUser && !isProtected && (
                            <button
                              onClick={() => onImpersonateUser(user)}
                              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-sm active:scale-95"
                              title={`Act as ${user.name} (Admin Impersonation Mode)`}
                            >
                              <LogIn className="w-3 h-3 text-amber-400" />
                              <span className="hidden xl:inline">Test As</span>
                            </button>
                          )}

                          <button
                            onClick={() => onInspectUser(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Inspect full analytics & session logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onInspectUserLibrary(user.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="View board watchlist"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {!isProtected && (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedUsers.map((user: any, uIdx: number) => {
            const isProtected = user.id === currentUser.id || user.id === 'default' || user.id === 'user-julio';
            const isSelected = selectedUserIds.has(user.id);

            return (
              <div
                key={`grid-card-${user.id}-${uIdx}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/60 shadow-lg shadow-rose-500/10'
                    : 'bg-[#151926] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      disabled={isProtected}
                      onClick={() => onToggleSelectUser(user.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isProtected
                          ? 'opacity-30 cursor-not-allowed border-slate-700 bg-slate-800'
                          : isSelected
                          ? 'bg-rose-600 border-rose-500 text-white cursor-pointer'
                          : 'border-slate-600 hover:border-slate-400 bg-slate-800 cursor-pointer'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="relative shrink-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <span
                        className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#151926] ${
                          user.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'
                        }`}
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
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    user.isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {user.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Metrics bar */}
                <div className="p-2.5 rounded-xl bg-[#181D2C] border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] text-slate-400">Time:</span>
                    <span className="font-bold text-emerald-400">{formatDuration(user.totalTimeSpentSeconds)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 font-extrabold text-[11px]">
                      {user.stats?.totalShows || 0} shows
                    </span>
                    <button
                      onClick={() => onOpenConnectionsDrawer(user)}
                      className="px-2 py-0.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3 h-3" />
                      <span>{user.friendsCount || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onInspectUserLibrary(user.id)}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Watchlist</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {onImpersonateUser && !isProtected && (
                      <button
                        onClick={() => onImpersonateUser(user)}
                        className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1 transition cursor-pointer active:scale-95"
                        title={`Act as ${user.name} (Admin Impersonation Mode)`}
                      >
                        <LogIn className="w-3 h-3 text-amber-400" />
                        <span>Test As</span>
                      </button>
                    )}

                    <button
                      onClick={() => onInspectUser(user)}
                      className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Details</span>
                    </button>

                    {!isProtected && (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Showing <strong>{paginatedUsers.length}</strong> of <strong>{filteredUsers.length}</strong> accounts</span>
          <span className="text-slate-600">|</span>
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-slate-200">
            Page {validCurrentPage} of {totalPages}
          </span>

          <button
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
