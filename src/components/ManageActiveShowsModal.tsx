/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TvShow, StreamingService } from '../types';
import { getShowBannerImage } from '../utils/showBanners';
import { X, Trash2, Calendar, Tv, Check, Save, HelpCircle, Film, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { SERVICE_COLORS } from './ShowCard';

interface ManageActiveShowsModalProps {
  shows: TvShow[];
  onUpdateShow: (updatedShow: TvShow) => void;
  onDeleteShow: (id: string) => void;
  onClose: () => void;
  isOpen?: boolean;
  theme?: 'dark' | 'light';
}

export const ManageActiveShowsModal: React.FC<ManageActiveShowsModalProps> = ({
  shows,
  onUpdateShow,
  onDeleteShow,
  onClose,
  theme = 'dark',
}) => {
  // Filter active shows: nextEpisode exists and not concluded
  const activeShows = shows.filter((s) => s.nextEpisode && !s.concluded);

  // Maintain local state for the active show currently being edited
  const [editingShowId, setEditingShowId] = useState<string | null>(null);
  const [deletingShowId, setDeletingShowId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editService, setEditService] = useState<StreamingService>('Netflix');
  const [editSeason, setEditSeason] = useState(1);
  const [editEpisode, setEditEpisode] = useState(1);
  const [editEpTitle, setEditEpTitle] = useState('');
  const [editAirDate, setEditAirDate] = useState('');

  const handleStartEdit = (show: TvShow) => {
    setEditingShowId(show.id);
    setEditTitle(show.title);
    setEditService(show.streamingService);
    setEditSeason(show.nextEpisode?.season || 1);
    setEditEpisode(show.nextEpisode?.episode || 1);
    setEditEpTitle(show.nextEpisode?.title || '');
    setEditAirDate(show.nextEpisode?.airDate ? show.nextEpisode.airDate.split('T')[0] : '');
  };

  const handleSaveEdit = (showId: string) => {
    const originalShow = shows.find((s) => s.id === showId);
    if (!originalShow) return;

    const updated: TvShow = {
      ...originalShow,
      title: editTitle,
      streamingService: editService,
      nextEpisode: {
        season: Number(editSeason),
        episode: Number(editEpisode),
        title: editEpTitle || 'TBD',
        airDate: editAirDate || new Date().toISOString().split('T')[0],
      },
    };

    onUpdateShow(updated);
    setEditingShowId(null);
  };

  const handleToggleConcluded = (show: TvShow) => {
    const updated: TvShow = {
      ...show,
      concluded: true,
      nextEpisode: null, // Clear upcoming episodes since it's concluded
    };
    onUpdateShow(updated);
  };

  const streamingServices: StreamingService[] = [
    'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Starz', 'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/85 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-3xl rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-max(1.5rem,env(safe-area-inset-top)+1rem))] sm:max-h-[85vh] ${
          theme === 'dark' ? 'bg-[#16181D] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        id="manage-active-modal"
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          theme === 'dark' ? 'bg-[#1A1D23] border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              theme === 'dark' ? 'bg-blue-600/15 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-black tracking-tight uppercase ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Manage Watching Series</h3>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Edit status, release dates, or delete tracked shows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeShows.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Tv className={`w-10 h-10 mx-auto animate-pulse ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} />
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>No Watching Countdown Shows</h4>
              <p className={`text-xs max-w-md mx-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                All your tracked shows are concluded or don't have scheduled upcoming episodes. Add more shows, or enrich existing ones with future seasons!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeShows.map((show, idx) => {
                const colors = SERVICE_COLORS[show.streamingService] || SERVICE_COLORS['Other'];
                const isEditing = editingShowId === show.id;

                return (
                  <div
                    key={`${show.id}-${idx}`}
                    className={`p-4 rounded-2xl border space-y-4 transition ${
                      theme === 'dark' 
                        ? 'bg-[#1E2128] border-white/5 hover:border-white/10' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Info & Quick Action buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Left Block: Image & Show Details */}
                      <div className="flex items-center gap-3">
                        <img
                          src={getShowBannerImage(show)}
                          alt={show.title}
                          className="w-16 h-10 rounded-lg object-cover bg-slate-800 border border-white/5 shrink-0"
                          style={{ objectPosition: show.bannerPosition || 'center 25%' }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white leading-snug truncate">{show.title}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded border ${colors.bg} ${colors.text} ${colors.border} shrink-0`}>
                              {show.streamingService}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium truncate">
                              S{show.nextEpisode?.season}E{show.nextEpisode?.episode} — {show.nextEpisode?.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!isEditing ? (
                          <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
                            <button
                              onClick={() => handleStartEdit(show)}
                              className="w-full sm:w-auto text-center px-3 py-2 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-white/5 transition whitespace-nowrap"
                            >
                              Edit Countdown
                            </button>
                            <button
                              onClick={() => handleToggleConcluded(show)}
                              className="w-full sm:w-auto text-center px-3 py-2 sm:py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-xs font-bold text-emerald-400 border border-emerald-800/20 transition whitespace-nowrap"
                              title="Mark as ended/concluded"
                            >
                              Conclude
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
                            <button
                              onClick={() => handleSaveEdit(show.id)}
                              className="w-full sm:w-auto justify-center p-2 sm:p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 text-xs font-bold px-3 whitespace-nowrap"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingShowId(null)}
                              className="w-full sm:w-auto text-center px-3 py-2 sm:py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-400 transition whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Direct Delete Trigger */}
                        <div className="shrink-0">
                          {deletingShowId === show.id ? (
                            <div className="flex items-center gap-1 bg-[#0F1115]/80 p-1 rounded-xl border border-rose-500/30">
                              <button
                                onClick={() => {
                                  onDeleteShow(show.id);
                                  setDeletingShowId(null);
                                }}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-[10px] font-black rounded text-white transition cursor-pointer"
                              >
                                Delete?
                              </button>
                              <button
                                onClick={() => setDeletingShowId(null)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded text-slate-300 transition cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setDeletingShowId(show.id);
                                // Auto reset after 4 seconds
                                setTimeout(() => setDeletingShowId(null), 4000);
                              }}
                              className="p-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/20 text-rose-400 border border-rose-800/20 hover:text-white transition cursor-pointer flex items-center justify-center h-[36px] w-[36px] sm:h-[32px] sm:w-[32px]"
                              title="Delete show from board"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Editing Form Panel */}
                    {isEditing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3 border-t border-white/5 text-xs bg-[#17191E]/50 p-3.5 rounded-xl">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Show Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Streaming Service</label>
                          <select
                            value={editService}
                            onChange={(e) => setEditService(e.target.value as StreamingService)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                          >
                            {streamingServices.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Season No.</label>
                            <select
                              value={editSeason}
                              onChange={(e) => {
                                const newSeason = Number(e.target.value);
                                setEditSeason(newSeason);
                                const maxEp = show.episodesPerSeason?.[newSeason - 1] || 100;
                                if (editEpisode > maxEp) {
                                  setEditEpisode(maxEp);
                                }
                              }}
                              className="w-full bg-[#1A1D23] border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                            >
                              {Array.from({ length: show.totalSeasons || 1 }, (_, i) => i + 1).map((sNum) => (
                                <option key={sNum} value={sNum}>
                                  Season {sNum}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Episode No.</label>
                            <select
                              value={editEpisode}
                              onChange={(e) => setEditEpisode(Number(e.target.value))}
                              className="w-full bg-[#1A1D23] border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                            >
                              {Array.from({ length: show.episodesPerSeason?.[editSeason - 1] || 1 }, (_, i) => i + 1).map((eNum) => (
                                <option key={eNum} value={eNum}>
                                  Episode {eNum}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming Episode Title</label>
                          <input
                            type="text"
                            value={editEpTitle}
                            onChange={(e) => setEditEpTitle(e.target.value)}
                            placeholder="e.g. S3 Premiere"
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Air Date</label>
                          <input
                            type="date"
                            value={editAirDate}
                            onChange={(e) => setEditAirDate(e.target.value)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-semibold text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex justify-end bg-[#1A1D23]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
          >
            Done Managing
          </button>
        </div>
      </motion.div>
    </div>
  );
};
