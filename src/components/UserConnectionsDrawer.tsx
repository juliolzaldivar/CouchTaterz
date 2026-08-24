/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserMinus, UserCheck, Search, Shield, X, AlertTriangle, 
  ExternalLink, Sparkles, UserPlus, CheckCircle2, ChevronRight, Filter, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { matchUserId, normalizeUserId } from '../utils/userUtils';

interface UserConnectionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  allUsers: any[];
  onUnlink: (user1Id: string, user2Id: string) => Promise<void>;
  onLink: (user1Id: string, user2Id: string) => Promise<void>;
  onInspectLibrary: (userId: string) => void;
  theme?: 'dark' | 'light';
}

export const UserConnectionsDrawer: React.FC<UserConnectionsDrawerProps> = ({
  isOpen,
  onClose,
  user,
  allUsers = [],
  onUnlink,
  onLink,
  onInspectLibrary,
  theme = 'dark'
}) => {
  const [search, setSearch] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [unlinkingIds, setUnlinkingIds] = useState<Set<string>>(new Set());
  const [isLinking, setIsLinking] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [localFriendIds, setLocalFriendIds] = useState<string[]>([]);

  // Keep localFriendIds updated whenever the user prop changes
  useEffect(() => {
    if (user && Array.isArray(user.friendIds)) {
      setLocalFriendIds(user.friendIds);
    } else {
      setLocalFriendIds([]);
    }
  }, [user?.id, JSON.stringify(user?.friendIds || [])]);

  // Match friends to deduplicated full user objects
  const connectedUsers = useMemo(() => {
    if (!user) return [];
    const seen = new Set<string>();
    const list: any[] = [];

    localFriendIds.forEach(fId => {
      if (!fId) return;
      const match = allUsers.find(u => matchUserId(u.id, fId));
      const effectiveId = match ? normalizeUserId(match.id) : normalizeUserId(fId);
      if (!seen.has(effectiveId)) {
        seen.add(effectiveId);
        if (match) {
          list.push(match);
        } else {
          list.push({
            id: fId,
            name: fId,
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fId}`
          });
        }
      }
    });

    return list.filter(u => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    });
  }, [localFriendIds, allUsers, search, user]);

  // Eligible users to connect (not self and not already in friend list)
  const eligibleUsersToConnect = useMemo(() => {
    if (!user) return [];
    return allUsers.filter(
      u => !matchUserId(u.id, user.id) && !localFriendIds.some(fId => matchUserId(fId, u.id))
    );
  }, [allUsers, user, localFriendIds]);

  if (!isOpen || !user) return null;

  const handleUnlinkFriend = async (targetId: string) => {
    if (!targetId || unlinkingIds.has(targetId)) return;
    
    // Mark as unlinking specifically for this ID
    setUnlinkingIds(prev => new Set(prev).add(targetId));
    
    // Instant optimistic removal from local state
    setLocalFriendIds(prev => prev.filter(id => !matchUserId(id, targetId)));
    
    try {
      await onUnlink(user.id, targetId);
      setStatusMsg('Connection removed.');
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (e) {
      console.error('Failed to unlink friend:', e);
      // Revert if error
      if (user && Array.isArray(user.friendIds)) {
        setLocalFriendIds(user.friendIds);
      }
    } finally {
      setUnlinkingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  const handleLinkNewFriend = async () => {
    if (!selectedToAdd || isLinking) return;
    const targetId = selectedToAdd;
    setIsLinking(true);
    setLocalFriendIds(prev => Array.from(new Set([...prev, targetId])));
    try {
      await onLink(user.id, targetId);
      setSelectedToAdd('');
      setStatusMsg('Successfully linked buddy!');
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (e) {
      console.error('Failed to link friend:', e);
      if (user && Array.isArray(user.friendIds)) {
        setLocalFriendIds(user.friendIds);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleClearAllConnections = async () => {
    if (isClearingAll) return;
    setIsClearingAll(true);
    const toUnlink = [...localFriendIds];
    setLocalFriendIds([]);
    try {
      for (const fId of toUnlink) {
        await onUnlink(user.id, fId);
      }
      setConfirmClearAll(false);
      setStatusMsg('All connections cleared.');
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (e) {
      console.error('Failed to clear all connections:', e);
      if (user && Array.isArray(user.friendIds)) {
        setLocalFriendIds(user.friendIds);
      }
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className={`w-full max-w-lg h-full border-l shadow-2xl flex flex-col p-6 space-y-5 overflow-y-auto ${
          theme === 'dark' ? 'bg-[#111420] text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`} 
              alt={user.name} 
              className="w-11 h-11 rounded-2xl object-cover border border-indigo-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">{user.name}'s Social Links</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {connectedUsers.length} Buddies
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs">{user.email || user.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Quick Link New Friend Combobox / Select */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs">
              <UserPlus className="w-4 h-4" />
              <span>Link with Another User</span>
            </div>
            <span className="text-[10px] text-slate-400">{eligibleUsersToConnect.length} available</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedToAdd}
              onChange={e => setSelectedToAdd(e.target.value)}
              className={`flex-1 p-2.5 rounded-xl text-xs border outline-none font-medium ${
                theme === 'dark' ? 'bg-[#181D2C] border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
              }`}
            >
              <option value="">Select a user to connect...</option>
              {eligibleUsersToConnect.map(u => (
                <option key={`opt-connect-${u.id}`} value={u.id}>
                  {u.name} ({u.email || u.id})
                </option>
              ))}
            </select>

            <button
              onClick={handleLinkNewFriend}
              disabled={!selectedToAdd || isLinking}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs transition shrink-0 cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              {isLinking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Connect</span>
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search active buddies..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none ${
                theme === 'dark' ? 'bg-[#181D2C] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          {connectedUsers.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              title="Sever all active friend connections for this user"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unlink All</span>
            </button>
          )}
        </div>

        {/* Clear All Confirmation Modal */}
        {confirmClearAll && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Disconnect all {connectedUsers.length} buddies for {user.name}?</span>
            </div>
            <p className="text-[11px] text-slate-400">
              This will remove all mutual friendships and pending requests for this user across both accounts.
            </p>
            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllConnections}
                disabled={isClearingAll}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-extrabold text-white flex items-center gap-1 cursor-pointer"
              >
                {isClearingAll && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Confirm Disconnect All</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Connections List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {connectedUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-medium">No active connections matching criteria.</p>
            </div>
          ) : (
            connectedUsers.map((buddy: any) => {
              const isItemUnlinking = unlinkingIds.has(buddy.id) || unlinkingIds.has(normalizeUserId(buddy.id));

              return (
                <div
                  key={`buddy-${buddy.id}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={buddy.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${buddy.id}`}
                      alt={buddy.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-200 truncate">{buddy.name}</span>
                        {buddy.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{buddy.email || buddy.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onInspectLibrary(buddy.id);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="View this user's watchlist"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleUnlinkFriend(buddy.id)}
                      disabled={isItemUnlinking}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                      title="Unlink this pair"
                    >
                      {isItemUnlinking ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                      ) : (
                        <UserMinus className="w-3 h-3" />
                      )}
                      <span>{isItemUnlinking ? 'Unlinking...' : 'Unlink'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
};
