/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Share2, Search, UserPlus, UserCheck, UserMinus, Filter, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Users, ArrowRight
} from 'lucide-react';
import { NetworkGraph } from './NetworkGraph';
import { matchUserId, normalizeUserId } from '../utils/userUtils';

interface NetworkMatrixTabProps {
  usersList: any[];
  networkConnections: Array<{ user1Id: string; user1Name: string; user2Id: string; user2Name: string }>;
  topShowsList: any[];
  currentUser: { id: string; name: string; email?: string; avatarUrl?: string };
  theme?: 'dark' | 'light';
  onInspectUserLibrary: (userId: string) => void;
  onConnectUsers: (user1Id: string, user2Id: string) => Promise<void>;
  onUnfriendUsers: (user1Id: string, user2Id: string) => Promise<void>;
  onOpenUserConnectionsDrawer: (user: any) => void;
}

export const NetworkMatrixTab: React.FC<NetworkMatrixTabProps> = ({
  usersList = [],
  networkConnections = [],
  topShowsList = [],
  currentUser,
  theme = 'dark',
  onInspectUserLibrary,
  onConnectUsers,
  onUnfriendUsers,
  onOpenUserConnectionsDrawer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [connectUser1, setConnectUser1] = useState('');
  const [connectUser2, setConnectUser2] = useState('');
  const [searchU1, setSearchU1] = useState('');
  const [searchU2, setSearchU2] = useState('');
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlinkingPairs, setUnlinkingPairs] = useState<Set<string>>(new Set());

  // Searchable filter for pairs with deduplication
  const filteredConnections = useMemo(() => {
    const seenPairs = new Set<string>();
    const deduplicated: typeof networkConnections = [];

    networkConnections.forEach(conn => {
      const pKey = [normalizeUserId(conn.user1Id), normalizeUserId(conn.user2Id)].sort().join('___');
      if (!seenPairs.has(pKey)) {
        seenPairs.add(pKey);
        deduplicated.push(conn);
      }
    });

    return deduplicated.filter(conn => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        conn.user1Name.toLowerCase().includes(q) ||
        conn.user2Name.toLowerCase().includes(q) ||
        conn.user1Id.toLowerCase().includes(q) ||
        conn.user2Id.toLowerCase().includes(q)
      );

      if (!matchesSearch) return false;

      if (filterUser) {
        return matchUserId(conn.user1Id, filterUser) || matchUserId(conn.user2Id, filterUser);
      }

      return true;
    });
  }, [networkConnections, searchQuery, filterUser]);

  // Candidates for User 1 & User 2 typeahead / filtered options
  const user1Options = useMemo(() => {
    const q = searchU1.toLowerCase().trim();
    if (!q) return usersList.slice(0, 30);
    return usersList.filter(u => 
      u.name.toLowerCase().includes(q) || 
      (u.email && u.email.toLowerCase().includes(q)) || 
      u.id.toLowerCase().includes(q)
    );
  }, [usersList, searchU1]);

  const user2Options = useMemo(() => {
    const q = searchU2.toLowerCase().trim();
    if (!q) return usersList.filter(u => !matchUserId(u.id, connectUser1)).slice(0, 30);
    return usersList.filter(u => 
      !matchUserId(u.id, connectUser1) && (
        u.name.toLowerCase().includes(q) || 
        (u.email && u.email.toLowerCase().includes(q)) || 
        u.id.toLowerCase().includes(q)
      )
    );
  }, [usersList, searchU2, connectUser1]);

  const handleExecuteConnect = async () => {
    if (!connectUser1 || !connectUser2 || connectUser1 === connectUser2) return;
    setIsProcessing(true);
    try {
      await onConnectUsers(connectUser1, connectUser2);
      setConnectStatus('Users connected successfully!');
      setConnectUser1('');
      setConnectUser2('');
      setSearchU1('');
      setSearchU2('');
      setTimeout(() => setConnectStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setConnectStatus('Failed to connect users.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteUnfriend = async (u1Id: string, u2Id: string) => {
    const pKey = [normalizeUserId(u1Id), normalizeUserId(u2Id)].sort().join('___');
    if (unlinkingPairs.has(pKey)) return;

    setUnlinkingPairs(prev => new Set(prev).add(pKey));
    try {
      await onUnfriendUsers(u1Id, u2Id);
    } catch (e) {
      console.error('Error unlinking pair:', e);
    } finally {
      setUnlinkingPairs(prev => {
        const next = new Set(prev);
        next.delete(pKey);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Network Graph Component */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Real-Time Social Mesh Visualization</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Drag nodes to explore relationship clusters
          </span>
        </div>

        <NetworkGraph
          usersList={usersList}
          networkConnections={networkConnections}
          topShowsList={topShowsList}
          theme={theme}
          onInspectUserLibrary={onInspectUserLibrary}
          currentUser={currentUser}
          scope="all"
          allowScopeToggle={true}
        />
      </div>

      {/* Manual Connection Hub */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm space-y-4 ${
        theme === 'dark' ? 'bg-[#111420] border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Establish New Friendship Link
              </h3>
              <p className="text-[11px] text-slate-400">
                Directly establish reciprocal buddy ties between any two accounts in the directory.
              </p>
            </div>
          </div>

          {connectStatus && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{connectStatus}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* User 1 Selector */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400">First User</label>
            <select
              value={connectUser1}
              onChange={e => setConnectUser1(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs border outline-none font-medium ${
                theme === 'dark' ? 'bg-[#181D2C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="">Select First User...</option>
              {user1Options.map(u => (
                <option key={`u1-${u.id}`} value={u.id}>
                  {u.name} ({u.email || u.id})
                </option>
              ))}
            </select>
          </div>

          {/* Connect Arrow */}
          <div className="sm:col-span-2 flex justify-center items-center pt-5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* User 2 Selector */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400">Second User</label>
            <select
              value={connectUser2}
              onChange={e => setConnectUser2(e.target.value)}
              disabled={!connectUser1}
              className={`w-full p-2.5 rounded-xl text-xs border outline-none font-medium disabled:opacity-50 ${
                theme === 'dark' ? 'bg-[#181D2C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="">Select Second User...</option>
              {user2Options.map(u => (
                <option key={`u2-${u.id}`} value={u.id}>
                  {u.name} ({u.email || u.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleExecuteConnect}
            disabled={!connectUser1 || !connectUser2 || isProcessing}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            <span>Connect Accounts</span>
          </button>
        </div>
      </div>

      {/* Matrix Filter & Connections List */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm space-y-4 ${
        theme === 'dark' ? 'bg-[#111420] border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Active Connection Pairs ({filteredConnections.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search filter input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search pairs..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none ${
                  theme === 'dark' ? 'bg-[#181D2C] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            {/* Filter by Specific User */}
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className={`p-1.5 rounded-xl text-xs border outline-none font-medium ${
                theme === 'dark' ? 'bg-[#181D2C] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            >
              <option value="">All Users</option>
              {usersList.map(u => (
                <option key={`filt-${u.id}`} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Grid */}
        {filteredConnections.length === 0 ? (
          <div className="py-12 text-center text-slate-500 rounded-2xl border border-dashed border-slate-800 space-y-1">
            <Share2 className="w-6 h-6 mx-auto opacity-30" />
            <p className="text-xs font-semibold">No active connections match the search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredConnections.map((conn, idx) => {
              const u1 = usersList.find(u => matchUserId(u.id, conn.user1Id));
              const u2 = usersList.find(u => matchUserId(u.id, conn.user2Id));
              const pKey = [normalizeUserId(conn.user1Id), normalizeUserId(conn.user2Id)].sort().join('___');
              const isUnlinkingThis = unlinkingPairs.has(pKey);

              return (
                <div
                  key={`conn-${conn.user1Id}-${conn.user2Id}-${idx}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition ${
                    theme === 'dark' ? 'bg-[#151926] border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* User 1 */}
                    <button
                      onClick={() => (u1 ? onOpenUserConnectionsDrawer(u1) : onOpenUserConnectionsDrawer(conn.user1Id))}
                      className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-bold truncate max-w-[100px] cursor-pointer"
                      title={`Inspect ${conn.user1Name}'s links`}
                    >
                      {conn.user1Name}
                    </button>

                    <span className="text-slate-500 text-xs">↔</span>

                    {/* User 2 */}
                    <button
                      onClick={() => (u2 ? onOpenUserConnectionsDrawer(u2) : onOpenUserConnectionsDrawer(conn.user2Id))}
                      className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold truncate max-w-[100px] cursor-pointer"
                      title={`Inspect ${conn.user2Name}'s links`}
                    >
                      {conn.user2Name}
                    </button>
                  </div>

                  {/* Unlink Action */}
                  <button
                    onClick={() => handleExecuteUnfriend(conn.user1Id, conn.user2Id)}
                    disabled={isUnlinkingThis}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0 disabled:opacity-50"
                    title="Unlink pair"
                  >
                    {isUnlinkingThis ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                    ) : (
                      <UserMinus className="w-3 h-3" />
                    )}
                    <span>{isUnlinkingThis ? 'Unlinking...' : 'Unlink'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
