/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Copy, Check, X, Shuffle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ShareBoardModalProps {
  currentBoardId: string;
  onJoinBoard: (boardId: string) => void;
  onClose: () => void;
}

export const ShareBoardModal: React.FC<ShareBoardModalProps> = ({ currentBoardId, onJoinBoard, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const shareUrl = `${window.location.origin}${window.location.pathname}?board=${currentBoardId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentBoardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) {
      setError("Please enter a valid, non-empty code.");
      return;
    }
    onJoinBoard(cleanCode);
    onClose();
  };

  const handleGenerateRandom = () => {
    const randomAdjectives = ["family", "cosmic", "weekly", "fandom", "cinema", "stream", "showtime"];
    const randomNouns = ["watchers", "critics", "buddies", "scouts", "hub", "squad", "lounge"];
    const adj = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)];
    const noun = randomNouns[Math.floor(Math.random() * randomNouns.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const code = `${adj}-${noun}-${num}`;
    setInputCode(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#1A1D23] border border-white/5 shadow-2xl flex flex-col p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#262A33] rounded-2xl text-slate-200 border border-white/5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Share Watchlist</h3>
              <p className="text-xs text-slate-500">Collaborate with family on the same tracker</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#262A33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current share details */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Share Options</h4>
          
          <div className="space-y-2">
            {/* Share link */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Unique Collaborative Link</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-[#0F1115] text-slate-400 text-xs px-3 py-2 rounded-xl border border-white/10 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-[#262A33] hover:bg-[#2c313c] text-slate-200 rounded-xl border border-white/5 transition text-xs flex items-center gap-1.5 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Board code */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Board Code (for family profiles)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentBoardId}
                  className="flex-1 bg-[#0F1115] text-slate-400 text-xs px-3 py-2 rounded-xl border border-white/10 text-center font-bold tracking-wider select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-[#262A33] hover:bg-[#2c313c] text-slate-200 rounded-xl border border-white/5 transition text-xs flex items-center gap-1.5 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Code</span>
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
            Sharing this code/link lets anyone view, rate, and increment episode progress on this watchlist simultaneously!
          </p>
        </div>

        {/* Join another board */}
        <div className="border-t border-white/5 pt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Join a Family Board</h4>
          
          <form onSubmit={handleJoin} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter family-board-code..."
                  className="w-full bg-[#0F1115] text-slate-100 px-3 py-2 rounded-xl border border-white/10 placeholder-slate-600 text-xs text-center font-bold tracking-wide focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="absolute right-2 top-1.5 p-1 text-slate-500 hover:text-white transition"
                  title="Generate random code name"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {error && (
              <p className="text-[10px] text-rose-400 font-medium text-center">{error}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#262A33] hover:bg-[#2c313c] text-slate-300 font-bold text-xs transition border border-white/5"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
