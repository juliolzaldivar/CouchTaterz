/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  X, 
  UserPlus, 
  Search, 
  Mail, 
  Sparkles, 
  Link as LinkIcon, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  Tv, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ShieldCheck,
  Heart,
  MessageSquare,
  MoreVertical,
  UserX,
  Send,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { NetworkGraph } from './NetworkGraph';
import { 
  getFriendsData, 
  fetchFriendsDataAsync,
  sendFriendRequest, 
  respondToFriendRequest, 
  JULIO_USER_ID,
  FriendsData,
  FriendRequestDetail
} from '../utils/friendsStorage';

interface ShareBoardModalProps {
  currentBoardId: string;
  currentUser: User | null;
  allUsers: User[];
  onJoinBoard: (boardId: string) => void;
  onClose: () => void;
  onFriendsUpdated?: () => void;
  onOpenGroupWatchAi?: () => void;
  theme?: 'dark' | 'light';
}

export const ShareBoardModal: React.FC<ShareBoardModalProps> = ({
  currentBoardId,
  currentUser,
  allUsers,
  onJoinBoard,
  onClose,
  onFriendsUpdated,
  onOpenGroupWatchAi,
  theme = 'dark'
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'invite' | 'search' | 'buddies'>('network');
  
  // Feature 4: Network Graph State
  const [networkData, setNetworkData] = useState<{ users: any[]; networkConnections: any[]; topShows: any[] } | null>(null);
  const [networkLoading, setNetworkLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'network' && !networkData) {
      setNetworkLoading(true);
      fetch('/api/network/graph')
        .then(res => res.json())
        .then(data => {
          setNetworkData(data);
        })
        .catch(err => {
          console.error('Failed to fetch network graph:', err);
        })
        .finally(() => {
          setNetworkLoading(false);
        });
    }
  }, [activeTab, networkData]);
  
  // Feature 1: Invite Link State
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [emailNote, setEmailNote] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Feature 2: Search & Friend Request State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'pending' | 'connected'>('all');
  const [menuOpenUserId, setMenuOpenUserId] = useState<string | null>(null);
  
  // Messaging state for Watch Buddies
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Friends data from storage & async server sync
  const [friendsData, setFriendsData] = useState<FriendsData>(() => 
    getFriendsData(currentUser?.id || JULIO_USER_ID)
  );

  const [requestMessages, setRequestMessages] = useState<Record<string, string>>({});
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      fetchFriendsDataAsync(currentUser.id).then(updated => {
        setFriendsData(updated);
      });
    }
  }, [currentUser]);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshFriends = async () => {
    if (!currentUser) return;
    const local = getFriendsData(currentUser.id);
    setFriendsData(local);
    const updated = await fetchFriendsDataAsync(currentUser.id);
    setFriendsData(updated);
    if (onFriendsUpdated) onFriendsUpdated();
  };

  // Generate Invite URL
  const inviteUrl = useMemo(() => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const inviterId = currentUser?.id || 'default';
    const inviterName = encodeURIComponent(currentUser?.name || 'Friend');
    return `${origin}${pathname}?inviteFrom=${inviterId}&inviterName=${inviterName}`;
  }, [currentUser]);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    showToast('Invite link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleSendEmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const subject = encodeURIComponent(`${currentUser?.name || 'A friend'} invited you to connect on CouchTaterz!`);
    const noteText = emailNote.trim() ? `Note from ${currentUser?.name || 'your friend'}:\n"${emailNote.trim()}"\n\n` : '';
    const body = encodeURIComponent(
      `Hey!\n\n${noteText}I'm using CouchTaterz to track TV shows and share watchlist picks. Join me as a Binge Buddy so we can swap show recommendations!\n\nClick here to create your account and automatically connect:\n${inviteUrl}\n\nSee you on CouchTaterz!`
    );

    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, '_blank');
    setEmailSent(true);
    showToast(`Email invitation opened for ${inviteEmail}!`);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handleSendRequest = (targetUser: User) => {
    if (!currentUser) return;
    const customMsg = requestMessages[targetUser.id];
    sendFriendRequest(
      { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      { id: targetUser.id, name: targetUser.name, avatarUrl: targetUser.avatarUrl },
      customMsg
    );
    refreshFriends();
    showToast(`Friend request sent to ${targetUser.name}!`);
  };

  const handleRespond = (targetUser: User, action: 'accept' | 'reject' | 'cancel' | 'unfriend') => {
    if (!currentUser) return;
    const replyMsg = replyMessages[targetUser.id];
    respondToFriendRequest(currentUser.id, targetUser.id, action, replyMsg);
    refreshFriends();
    if (action === 'accept') {
      showToast(`🎉 Connected with ${targetUser.name}! You are now Binge Buddies.`);
    } else if (action === 'reject') {
      showToast(`Declined request from ${targetUser.name}.`);
    } else if (action === 'cancel') {
      showToast(`Cancelled request to ${targetUser.name}.`);
    } else if (action === 'unfriend') {
      showToast(`Removed ${targetUser.name} from Binge Buddies.`);
    }
  };

  const handleSendMessage = async (targetUser: User) => {
    if (!currentUser || !messageInput.trim()) return;
    setSendingMessage(true);

    const isGuest = currentUser.id === 'guest-demo' || currentUser.id.startsWith('guest') || currentUser.email?.includes('guest');
    if (isGuest) {
      setTimeout(() => {
        showToast(`Message sent to ${targetUser.name}! (Demo Mode)`);
        setMessageInput('');
        setMessagingUserId(null);
        setSendingMessage(false);
      }, 400);
      return;
    }

    try {
      const customMsg = messageInput.trim();
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          notification: {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: currentUser.id,
            senderName: currentUser.name || 'Binge Buddy',
            senderAvatarUrl: currentUser.avatarUrl,
            message: customMsg,
            timestamp: new Date().toISOString(),
            type: 'message'
          }
        })
      });

      showToast(`Message sent to ${targetUser.name}!`);
      setMessageInput('');
      setMessagingUserId(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      showToast(`Failed to send message. Please try again.`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Processed Users List for Search Tab
  const processedUsers = useMemo(() => {
    if (!currentUser) return [];

    const isCurrentUserJulio = currentUser.id === JULIO_USER_ID || currentUser.id === 'default' || currentUser.id === 'user-julio' || currentUser.email?.toLowerCase() === 'juliozaldivar@gmail.com';

    return allUsers.map(user => {
      const isJulioUser = user.id === JULIO_USER_ID || user.id === 'default' || user.id === 'user-julio' || user.email?.toLowerCase() === 'juliozaldivar@gmail.com';
      const isSelf = user.id === currentUser.id || (isCurrentUserJulio && isJulioUser);
      const isConnected = (!isCurrentUserJulio && isJulioUser) || friendsData.friends.includes(user.id);
      
      // Exclude users who are already connected from pending
      const isPendingSent = !isConnected && friendsData.pendingSent.includes(user.id);
      const isPendingReceived = !isConnected && friendsData.pendingReceived.some(item => 
        (typeof item === 'string' ? item : item.fromUserId) === user.id
      );

      return {
        user,
        isSelf,
        isJulio: isJulioUser,
        isConnected,
        isPendingSent,
        isPendingReceived
      };
    });
  }, [allUsers, currentUser, friendsData]);

  // Filtered Users for Search Tab
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return processedUsers.filter(({ user, isSelf, isConnected, isPendingSent, isPendingReceived }) => {
      if (isSelf) return false; // Don't list self in search results

      // Search query filter (matches First Name, Last Name, or Email)
      if (q) {
        const nameMatch = user.name.toLowerCase().includes(q);
        const emailMatch = user.email.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }

      // Tab category filter
      if (searchFilter === 'connected') {
        return isConnected;
      }
      if (searchFilter === 'pending') {
        return isPendingSent || isPendingReceived;
      }

      return true;
    });
  }, [processedUsers, searchQuery, searchFilter]);

  // Counts for Badges
  const pendingCount = useMemo(() => {
    return processedUsers.filter(u => !u.isSelf && (u.isPendingSent || u.isPendingReceived)).length;
  }, [processedUsers]);

  const connectedCount = useMemo(() => {
    return processedUsers.filter(u => !u.isSelf && u.isConnected).length;
  }, [processedUsers]);

  const pendingReceivedUsers = useMemo(() => {
    return friendsData.pendingReceived.filter(item => {
      const reqId = typeof item === 'string' ? item : item.fromUserId;
      return reqId !== currentUser?.id && reqId !== JULIO_USER_ID && !friendsData.friends.includes(reqId);
    });
  }, [friendsData, currentUser]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/85 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative w-full ${activeTab === 'network' ? 'max-w-5xl' : 'max-w-xl'} overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col transition-all duration-300 max-h-[calc(100dvh-max(1.5rem,env(safe-area-inset-top)+1rem))] sm:max-h-[90vh] ${
          theme === 'dark' ? 'bg-[#161920] border-white/10' : 'bg-white border-neutral-200'
        }`}
      >
        {/* Header Banner */}
        <div className={`p-3.5 sm:p-6 pb-3 sm:pb-4 border-b ${
          theme === 'dark'
            ? 'border-white/10 bg-gradient-to-r from-purple-950/60 via-[#1A1D25] to-indigo-950/40'
            : 'border-neutral-200 bg-gradient-to-r from-purple-100/80 via-neutral-50 to-indigo-50/60'
        }`}>
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border shadow-inner shrink-0 ${
                theme === 'dark' ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300'
              }`}>
                <UserPlus className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className={`text-sm sm:text-xl font-black tracking-tight truncate ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  + Add & Manage Buddies
                </h3>
                <p className={`text-[11px] sm:text-xs mt-0.5 truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Invite friends to CouchTaterz or search existing members
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer shrink-0 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center active:scale-95 ${
                theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-neutral-200/60'
              }`}
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Tabs Header - Grid 4 Columns guarantees Invite tab never falls off screen */}
          <div className={`grid grid-cols-4 gap-1 mt-3 sm:mt-5 p-1 rounded-xl sm:rounded-2xl border w-full ${
            theme === 'dark' ? 'bg-[#0A0C10] border-white/10' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <button
              onClick={() => setActiveTab('network')}
              className={`py-1.5 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer min-w-0 w-full ${
                activeTab === 'network'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black ring-1 ring-purple-400/30'
                  : theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-neutral-200/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0 text-purple-300" />
              <span className="hidden sm:inline">Binge Network</span>
              <span className="sm:hidden truncate">Network</span>
            </button>

            <button
              onClick={() => setActiveTab('buddies')}
              className={`py-1.5 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer min-w-0 w-full ${
                activeTab === 'buddies'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black ring-1 ring-purple-400/30'
                  : theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-neutral-200/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Binge Buddies</span>
              <span className="sm:hidden truncate">Buddies</span>
              <span className={`text-[9px] sm:text-[10px] opacity-80 font-bold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded ${
                theme === 'dark' ? 'bg-white/10' : 'bg-neutral-200 text-slate-800'
              } shrink-0`}>
                {connectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`py-1.5 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer relative min-w-0 w-full ${
                activeTab === 'search'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black ring-1 ring-purple-400/30'
                  : theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-neutral-200/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Find Taterz</span>
              <span className="sm:hidden truncate">Find</span>
              {pendingCount > 0 && (
                <span className="px-1 sm:px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black animate-pulse shrink-0">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invite')}
              className={`py-1.5 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer min-w-0 w-full ${
                activeTab === 'invite'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black ring-1 ring-purple-400/30'
                  : theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-neutral-200/50'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Invite Link</span>
              <span className="sm:hidden truncate">Invite</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className={`p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 custom-scrollbar ${
          theme === 'dark' ? 'bg-[#12151E]' : 'bg-neutral-50'
        }`}>
          {/* TAB 1: INVITE A FRIEND */}
          {activeTab === 'invite' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              
              {/* SECTION 1: HERO SHARE LINK CARD */}
              <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#211A34] to-[#151322] border border-purple-500/30 shadow-xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-black text-white">Your Personal Invite Link</h4>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      Fastest
                    </span>
                  </div>
                  {currentUser && (
                    <span className="text-[11px] text-slate-400">
                      Inviting as <strong className="text-purple-300 font-bold">{currentUser.name}</strong>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Anyone who joins CouchTaterz using this unique link will <strong className="text-white font-bold">automatically connect with you</strong> as a Binge Buddy!
                </p>

                {/* Link Box & Copy Button */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className={`w-full text-xs px-3.5 py-2.5 sm:py-3 rounded-xl border select-all font-mono outline-none pr-8 focus:border-purple-500 transition ${
                        theme === 'dark'
                          ? 'bg-[#0A0C10] text-slate-200 border-white/10'
                          : 'bg-white text-slate-800 border-purple-200 shadow-inner'
                      }`}
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 sm:top-3.5 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className={`w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
                      linkCopied
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 scale-102'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40 active:scale-95'
                    }`}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Invite Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 2: DIRECT EMAIL INVITATION */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 sm:space-y-3.5 shadow-md ${
                theme === 'dark' ? 'bg-[#171A24] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        Send Email Invitation
                      </h4>
                      <p className={`text-[11px] leading-snug ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Send a direct email with an optional personal message
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSendEmailInvite} className="space-y-2.5">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Friend's Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g. friend@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 transition ${
                        theme === 'dark'
                          ? 'bg-[#0D0F15] text-slate-100 border-white/10 placeholder-slate-600'
                          : 'bg-white text-slate-900 border-slate-300 placeholder-slate-400 shadow-sm'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <span>Personal Note or Recommendation</span>
                      <span className="text-[10px] opacity-70 font-normal normal-case">Optional</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={emailNote}
                        onChange={(e) => setEmailNote(e.target.value)}
                        placeholder="e.g. You have to check out Severance! Join CouchTaterz so we can track shows together."
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 transition ${
                          theme === 'dark'
                            ? 'bg-[#0D0F15] text-slate-100 border-white/10 placeholder-slate-600'
                            : 'bg-white text-slate-900 border-slate-300 placeholder-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={!inviteEmail.trim()}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        inviteEmail.trim()
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40 active:scale-95'
                          : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Email Invite</span>
                    </button>
                  </div>
                </form>

                {emailSent && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Email invitation ready in your mail client! They will connect automatically upon signing up.</span>
                  </div>
                )}
              </div>

              {/* SECTION 3: VISUAL HOW IT WORKS STEPS */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                theme === 'dark' ? 'bg-[#141720] border-white/5' : 'bg-slate-100 border-slate-200'
              }`}>
                <h5 className={`text-[11px] font-black uppercase tracking-wider text-center ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  How Binge Buddy Invitations Work
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className={`p-3 rounded-xl border space-y-1 ${
                    theme === 'dark' ? 'bg-[#0D0F15] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-7 h-7 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">
                      1
                    </div>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Share Your Link</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Copy link or email direct invitation</p>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${
                    theme === 'dark' ? 'bg-[#0D0F15] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-7 h-7 mx-auto rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-black">
                      2
                    </div>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Friend Joins CouchTaterz</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>They log in or create an account</p>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${
                    theme === 'dark' ? 'bg-[#0D0F15] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                      3
                    </div>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Swap Recommendations</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Instantly share watchlist picks & ratings</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: FIND EXISTING COUCHTATERZ */}
          {activeTab === 'search' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {onOpenGroupWatchAi && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGroupWatchAi();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-950/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                  <span>✨ AskTaterz What to Watch Together</span>
                </button>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search CouchTaterz by first name, last name, or email address..."
                  className={`w-full text-xs pl-10 pr-9 py-3 rounded-2xl border transition focus:outline-none focus:border-blue-500 ${
                    theme === 'dark'
                      ? 'bg-[#0A0C10] text-slate-100 border-white/10 placeholder-slate-600'
                      : 'bg-slate-100 text-slate-900 border-slate-300 placeholder-slate-500 shadow-inner'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sensible Search Filters */}
              <div className={`flex items-center gap-1.5 p-1 rounded-2xl border overflow-x-auto scrollbar-none ${
                theme === 'dark' ? 'bg-[#0A0C10] border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setSearchFilter('all')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    searchFilter === 'all'
                      ? theme === 'dark'
                        ? 'bg-white/10 text-white font-black border border-white/10 shadow-sm'
                        : 'bg-white text-slate-900 font-black border border-slate-300 shadow-sm'
                      : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="hidden sm:inline">All Members</span>
                  <span className="sm:hidden">All</span>
                  <span className={`text-[10px] opacity-70 px-1.5 py-0.5 rounded-md ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'
                  }`}>
                    {allUsers.filter(u => u.id !== currentUser?.id).length}
                  </span>
                </button>

                <button
                  onClick={() => setSearchFilter('pending')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    searchFilter === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 font-black border border-amber-500/30'
                      : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pending</span>
                  {pendingCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/30 text-amber-300 text-[10px] font-black">
                      {pendingCount}
                    </span>
                  ) : (
                    <span className={`text-[10px] opacity-70 px-1.5 py-0.5 rounded-md ${
                      theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'
                    }`}>0</span>
                  )}
                </button>

                <button
                  onClick={() => setSearchFilter('connected')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    searchFilter === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30'
                      : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Connected</span>
                  <span className={`text-[10px] opacity-70 px-1.5 py-0.5 rounded-md ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'
                  }`}>
                    {connectedCount}
                  </span>
                </button>
              </div>

              {/* User Results List */}
              <div className="space-y-2.5 pt-1">
                {filteredUsers.length === 0 ? (
                  <div className={`p-8 text-center rounded-3xl border space-y-2 ${
                    theme === 'dark' ? 'bg-[#0F1117] border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      No CouchTaterz members matched your search "{searchQuery}".
                    </p>
                    <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                      Try searching for a different first name, last name, or send an email invite!
                    </p>
                  </div>
                ) : (
                  filteredUsers.map(({ user, isJulio, isConnected, isPendingSent, isPendingReceived }, uIdx) => (
                    <div
                      key={`search-user-${user.id}-${uIdx}`}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition flex flex-col gap-2.5 shadow-sm ${
                        theme === 'dark'
                          ? 'bg-[#161922] border-white/10 hover:border-white/20'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: User Details & Primary Action */}
                      <div className="flex items-center justify-between gap-2.5">
                        {/* Avatar & User Meta */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`}
                              alt={user.name}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/10 bg-[#0F1117] object-cover"
                            />
                            {isConnected && !isJulio && (
                              <span
                                className={`w-2.5 h-2.5 rounded-full border-2 border-[#161922] absolute -bottom-0.5 -right-0.5 shadow-sm ${
                                  user.id === currentUser.id || (user as any).isOnline
                                    ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]'
                                    : 'bg-slate-500'
                                }`}
                                title={user.id === currentUser.id || (user as any).isOnline ? "Active now" : "Offline"}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs sm:text-sm font-bold truncate ${
                                theme === 'dark' ? 'text-white' : 'text-slate-900'
                              }`}>{user.name}</h4>
                              {isJulio && (
                                <span title="Community Host">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Action Control */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isJulio ? (
                            <button
                              onClick={() => {
                                onJoinBoard(JULIO_USER_ID);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                            >
                              View Board
                            </button>
                          ) : isConnected ? (
                            <button
                              onClick={() => setActiveTab('buddies')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Click to view in Binge Buddies tab"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Connected</span>
                            </button>
                          ) : isPendingSent ? (
                            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                              <button
                                onClick={() => handleRespond(user, 'cancel')}
                                className="text-[10px] text-slate-400 hover:text-rose-400 font-semibold underline cursor-pointer ml-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : isPendingReceived ? (
                            <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-400" /> Wants to Connect
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user)}
                              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap min-h-[38px]"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Connect</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Optional Message Note for non-connected users */}
                      {!isJulio && !isConnected && !isPendingSent && !isPendingReceived && (
                        <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1 pointer-events-none" />
                          <input
                            type="text"
                            value={requestMessages[user.id] || ''}
                            onChange={e => setRequestMessages(prev => ({ ...prev, [user.id]: e.target.value }))}
                            placeholder={`Add an optional note or message for ${user.name}...`}
                            className="w-full text-xs px-3.5 py-2 rounded-xl bg-[#0F1117] text-slate-100 border border-white/10 focus:border-purple-500/60 focus:outline-none placeholder-slate-500 transition min-h-[38px]"
                          />
                        </div>
                      )}

                      {/* Bottom Row: Incoming Connection Request Handler */}
                      {isPendingReceived && (
                        <div className="pt-2.5 border-t border-purple-500/30 bg-purple-950/40 p-3 rounded-2xl flex flex-col gap-2.5 shadow-sm">
                          <div className="text-xs text-purple-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Incoming Binge Buddy Request
                          </div>
                          <input
                            type="text"
                            value={replyMessages[user.id] || ''}
                            onChange={e => setReplyMessages(prev => ({ ...prev, [user.id]: e.target.value }))}
                            placeholder="Optional reply message..."
                            className="w-full bg-[#0D0F17] text-white text-xs px-3.5 py-2.5 rounded-xl border border-purple-500/30 focus:border-purple-400 focus:outline-none placeholder-slate-400 min-h-[42px]"
                          />
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              onClick={() => handleRespond(user, 'accept')}
                              className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-950/30 active:scale-[0.98]"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => handleRespond(user, 'reject')}
                              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#222632] hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer border border-white/10 flex items-center justify-center active:scale-[0.98]"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: MY BINGE BUDDIES */}
          {activeTab === 'buddies' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Your Connected Binge Buddies
                </h4>
                <span className="text-xs font-bold text-purple-400">
                  {connectedCount} Connected
                </span>
              </div>

              {/* Incoming Pending Requests Attention Banner */}
              {pendingReceivedUsers.length > 0 && (
                <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/35 space-y-3 shadow-md">
                  <h5 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    Pending Incoming Connection Requests ({pendingReceivedUsers.length})
                  </h5>
                  <div className="space-y-2.5">
                    {pendingReceivedUsers.map((item, idx) => {
                      const reqId = typeof item === 'string' ? item : item.fromUserId;
                      const foundUser = allUsers.find(u => u.id === reqId);
                      const name = typeof item === 'object' && item.fromUserName ? item.fromUserName : (foundUser?.name || 'CouchTaterz Member');
                      const avatarUrl = typeof item === 'object' && item.fromUserAvatar ? item.fromUserAvatar : (foundUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`);
                      const email = foundUser?.email || 'member@couchtaterz.com';
                      const msg = typeof item === 'object' ? item.message : undefined;

                      const targetUser: User = foundUser || {
                        id: reqId,
                        name,
                        email,
                        avatarUrl,
                        createdAt: ''
                      };

                      return (
                        <div key={`${reqId}-${idx}`} className="flex flex-col gap-2.5 bg-[#161822] p-3 sm:p-3.5 rounded-xl border border-purple-500/30 text-slate-100">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={avatarUrl}
                                alt={name}
                                className="w-9 h-9 rounded-xl border border-purple-500/30 bg-[#1A1D25] object-cover shrink-0"
                              />
                              <div>
                                <div className="text-xs font-extrabold text-white">{name}</div>
                                <div className="text-[10px] font-bold text-purple-300">Wants to connect</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                              <button
                                onClick={() => handleRespond(targetUser, 'accept')}
                                className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold transition cursor-pointer min-h-[38px] flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespond(targetUser, 'reject')}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer border border-white/10 min-h-[38px] flex items-center justify-center active:scale-[0.98]"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                          {msg && (
                            <p className="text-xs text-purple-100 italic bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/30 leading-relaxed">
                              "{msg}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Connected Buddies List */}
              <div className="space-y-2.5">
                {processedUsers
                  .filter(u => u.isConnected && !u.isSelf)
                  .map(({ user, isJulio }, uIdx) => (
                    <div
                      key={`connected-user-${user.id}-${uIdx}`}
                      className={`rounded-2xl border transition relative ${
                        theme === 'dark'
                          ? 'bg-[#1A1E27] border-white/5 hover:border-white/10'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                      } ${
                        menuOpenUserId === user.id ? 'z-40' : 'z-10'
                      }`}
                    >
                      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 relative">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`}
                              alt={user.name}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/10 bg-[#0F1117] object-cover shrink-0"
                            />
                            <span
                              className={`w-2.5 h-2.5 rounded-full border-2 border-[#1A1E27] absolute -bottom-0.5 -right-0.5 shadow-sm ${
                                user.id === currentUser.id || (user as any).isOnline
                                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]'
                                  : 'bg-slate-500'
                              }`}
                              title={user.id === currentUser.id || (user as any).isOnline ? "Active now" : "Offline"}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`text-xs sm:text-sm font-bold truncate ${
                                theme === 'dark' ? 'text-white' : 'text-slate-900'
                              }`}>{user.name}</h4>
                              {isJulio && (
                                <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-extrabold uppercase shrink-0">
                                  Host
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              onJoinBoard(user.id);
                              onClose();
                            }}
                            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95 whitespace-nowrap min-h-[38px]"
                          >
                            View Board
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenUserId(menuOpenUserId === user.id ? null : user.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                              title="Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {menuOpenUserId === user.id && (
                              <>
                                {/* Backdrop to close menu on click away */}
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenUserId(null);
                                  }}
                                />
                                <div className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-[#1A1E29] border border-white/20 rounded-xl shadow-2xl p-1.5 text-xs">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMessagingUserId(messagingUserId === user.id ? null : user.id);
                                      setMessageInput('');
                                      setMenuOpenUserId(null);
                                    }}
                                    className="w-full text-left px-2.5 py-2 rounded-lg text-purple-300 hover:bg-purple-500/15 font-semibold flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Message Buddy</span>
                                  </button>
                                  {!isJulio && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRespond(user, 'unfriend');
                                        setMenuOpenUserId(null);
                                      }}
                                      className="w-full text-left px-2.5 py-2 rounded-lg text-rose-400 hover:bg-rose-500/15 font-semibold flex items-center gap-2 transition cursor-pointer"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Remove Buddy</span>
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Animated Slide-Down Message Text Field */}
                      <AnimatePresence>
                        {messagingUserId === user.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="border-t border-white/10 bg-[#12151D] p-3 rounded-b-2xl overflow-hidden"
                          >
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage(user);
                              }}
                              className="space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Send a message to <strong className="text-white">{user.name}</strong></span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMessagingUserId(null);
                                    setMessageInput('');
                                  }}
                                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={messageInput}
                                  onChange={(e) => setMessageInput(e.target.value)}
                                  placeholder={`Type a message for ${user.name}...`}
                                  autoFocus
                                  className="flex-1 bg-[#1A1E27] border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                                />
                                <button
                                  type="submit"
                                  disabled={!messageInput.trim() || sendingMessage}
                                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md active:scale-95"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span className="hidden xs:inline">{sendingMessage ? 'Sending...' : 'Send'}</span>
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: SOCIAL & CONTENT NETWORK GRAPH */}
          {activeTab === 'network' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              {networkLoading ? (
                <div className="h-80 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Sparkles className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs font-semibold">Mapping Binge Buddy & Content Connections...</span>
                </div>
              ) : (
                <NetworkGraph
                  usersList={networkData?.users || []}
                  networkConnections={networkData?.networkConnections || []}
                  topShowsList={networkData?.topShows || []}
                  theme={theme}
                  currentUser={currentUser}
                  onInspectUserLibrary={(uId) => {
                    onJoinBoard(uId);
                    onClose();
                  }}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Interactive Toast Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-6 right-6 z-50 p-3 bg-purple-600 text-white rounded-2xl font-bold text-xs shadow-xl flex items-center gap-2 justify-between border border-purple-400/30"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-200 animate-pulse shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="p-1 hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className={`p-3.5 px-5 border-t flex items-center justify-center ${
          theme === 'dark' ? 'bg-[#12141A] border-white/10 text-slate-400' : 'bg-slate-100 border-neutral-200 text-slate-600'
        }`}>
          <span className="text-[11px] font-medium text-center">Julio is Everybody's Binge Buddy on CouchTaterz!</span>
        </div>
      </motion.div>
    </div>
  );
};
