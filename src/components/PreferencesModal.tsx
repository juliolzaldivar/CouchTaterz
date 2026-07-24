/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserPreferences, StreamingService } from '../types';
import { X, Check, Camera, Sparkles, Sliders, Mail, User as UserIcon, Trash2, AlertTriangle, Download, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface PreferencesModalProps {
  currentUser: User;
  preferences: UserPreferences;
  onSave: (updatedUser: User, updatedPrefs: UserPreferences) => void;
  onDelete: () => void;
  onClose: () => void;
  showWorkflowGuide: boolean;
  onToggleWorkflowGuide: (show: boolean) => void;
}

const GENRE_OPTIONS = [
  'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Mystery', 'Dystopian', 'Western', 'Animation', 'Spy Thriller'
];

const SERVICE_OPTIONS: StreamingService[] = [
  'Netflix', 'HBO', 'Disney+', 'Prime Video', 'Hulu', 'Apple TV', 'Paramount+', 'Peacock', 'AMC+'
];

const PRESET_AVATARS = [
  { name: 'Julio', seed: 'Julio' },
  { name: 'Sarah', seed: 'Sarah' },
  { name: 'CouchPotato', seed: 'CouchPotato' },
  { name: 'BingeWatcher', seed: 'BingeWatcher' },
  { name: 'TvStar', seed: 'TvStar' },
  { name: 'TaterTot', seed: 'TaterTot' },
  { name: 'Popcorn', seed: 'Popcorn' },
  { name: 'MovieGeek', seed: 'MovieGeek' },
  { name: 'Cat', seed: 'Cat' },
  { name: 'SuperFan', seed: 'SuperFan' }
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  currentUser,
  preferences,
  onSave,
  onDelete,
  onClose,
  showWorkflowGuide,
  onToggleWorkflowGuide
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [customAvatarInput, setCustomAvatarInput] = useState(
    currentUser.avatarUrl?.startsWith('http') && !currentUser.avatarUrl.includes('dicebear.com')
      ? currentUser.avatarUrl
      : ''
  );
  
  // Genres they like
  const [selectedGenres, setSelectedGenres] = useState<string[]>(preferences?.genres || []);
  
  // Services they own
  const [selectedServices, setSelectedServices] = useState<StreamingService[]>(preferences?.services || []);

  const [localShowWorkflowGuide, setLocalShowWorkflowGuide] = useState(showWorkflowGuide);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showCustomAvatarField, setShowCustomAvatarField] = useState(
    currentUser.avatarUrl?.startsWith('http') && !currentUser.avatarUrl.includes('dicebear.com')
  );

  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleExportBackup = () => {
    window.location.href = '/api/admin/backup';
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreLoading(true);
    setRestoreError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read file text content.');
        }

        const parsed = JSON.parse(text);
        
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid backup file. Must be a valid JSON object.');
        }

        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });

        if (res.ok) {
          const result = await res.json();
          alert(`Success! Successfully restored ${result.boardsCount} watch buddies' watchlists, reviews, and ratings! The app will now reload to apply all data.`);
          window.location.reload();
        } else {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to restore database from backup file.');
        }
      } catch (err: any) {
        setRestoreError(err.message || 'Error parsing backup file. Ensure it is a valid CouchTaterz backup.');
      } finally {
        setRestoreLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleToggleService = (service: StreamingService) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleSelectPresetAvatar = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(url);
    setCustomAvatarInput('');
    setShowCustomAvatarField(false);
    setIsAvatarExpanded(false); // Collapse immediately on select
  };

  const handleApplyCustomAvatar = (url: string) => {
    if (url.trim()) {
      setAvatarUrl(url.trim());
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalAvatarUrl = showCustomAvatarField && customAvatarInput.trim()
      ? customAvatarInput.trim()
      : avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name.trim())}`;

    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      avatarUrl: finalAvatarUrl
    };

    const updatedPrefs: UserPreferences = {
      ...preferences,
      genres: selectedGenres,
      services: selectedServices
    };

    onToggleWorkflowGuide(localShowWorkflowGuide);
    onSave(updatedUser, updatedPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#1A1D23] border border-white/5 shadow-2xl flex flex-col p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#262A33] rounded-2xl text-blue-400 border border-white/5">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Profile & Preferences</h3>
              <p className="text-xs text-slate-400">View what you answered on sign up and update details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#262A33] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* Avatar Section */}
          {!isAvatarExpanded ? (
            <div className="bg-[#0F1115] p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name || 'default')}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-blue-500/30 object-cover bg-slate-800"
                />
                <div className="space-y-0.5 text-left">
                  <h4 className="text-xs font-bold text-slate-300">Profile Icon Photo</h4>
                  <p className="text-[10px] text-slate-500 leading-none">Preset style or custom image URL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarExpanded(true)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#1A1D23] hover:bg-[#262A33] border border-white/5 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Change Icon
              </button>
            </div>
          ) : (
            <div className="bg-[#0F1115] p-4 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-3">
                  <div className="relative group shrink-0">
                    <img
                      src={avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name || 'default')}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full border border-blue-500/30 object-cover bg-slate-800"
                    />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-xs font-bold text-slate-300">Choose Profile Icon</h4>
                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarField(!showCustomAvatarField)}
                      className="text-[10px] text-blue-400 font-bold hover:underline block text-left"
                    >
                      {showCustomAvatarField ? "Select presets instead" : "Use custom image URL"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarExpanded(false)}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-[#1A1D23] text-slate-400 hover:text-white transition"
                >
                  Close Presets
                </button>
              </div>

              {/* Custom Image URL Field */}
              {showCustomAvatarField ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Custom Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={customAvatarInput}
                      onChange={(e) => {
                        setCustomAvatarInput(e.target.value);
                        handleApplyCustomAvatar(e.target.value);
                      }}
                      className="flex-1 bg-[#1A1D23] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAvatarExpanded(false)}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Preset Avatars Selection grid */
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quick Preset Icons</label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_AVATARS.map((avatar) => {
                      const presetUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(avatar.seed)}`;
                      const isSelected = avatarUrl === presetUrl;
                      return (
                        <button
                          key={avatar.seed}
                          type="button"
                          onClick={() => handleSelectPresetAvatar(avatar.seed)}
                          className={`p-1 rounded-xl bg-[#1A1D23] border transition hover:scale-105 cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected ? 'border-blue-500' : 'border-white/5'
                          }`}
                          title={avatar.name}
                        >
                          <img
                            src={presetUrl}
                            alt={avatar.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-[8px] text-slate-400 truncate max-w-full font-medium">{avatar.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-blue-500" />
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/40"
              />
            </div>
          </div>

          {/* Preferred Genres */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <label className="text-xs font-bold text-slate-300">Preferred Show Genres</label>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allSelected = GENRE_OPTIONS.every(g => selectedGenres.includes(g));
                  setSelectedGenres(allSelected ? [] : [...GENRE_OPTIONS]);
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/20 whitespace-nowrap"
              >
                {GENRE_OPTIONS.every(g => selectedGenres.includes(g)) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mb-2">We use this to curate recommendation boards.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {GENRE_OPTIONS.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleToggleGenre(genre)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                        : 'bg-[#0F1115] border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span>{genre}</span>
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Owned Streaming Channels */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <label className="text-xs font-bold text-slate-300">Your Streaming Subscriptions</label>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allSelected = SERVICE_OPTIONS.every(s => selectedServices.includes(s));
                  setSelectedServices(allSelected ? [] : [...SERVICE_OPTIONS]);
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/20 whitespace-nowrap"
              >
                {SERVICE_OPTIONS.every(s => selectedServices.includes(s)) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mb-2">Toggle the streaming platforms you actively own to enable our Play feature.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {SERVICE_OPTIONS.map((service) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleToggleService(service)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                        : 'bg-[#0F1115] border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span>{service}</span>
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* App Settings & Guides */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-500" />
              <label className="text-xs font-bold text-slate-300">App Settings</label>
            </div>
            <div className="bg-[#0F1115] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-bold text-slate-200">Watchlist Pipeline Guide</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Bring back the interactive guide panel on the main board explaining Watching, Up Next, and Watched pipelines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocalShowWorkflowGuide(!localShowWorkflowGuide)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localShowWorkflowGuide ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localShowWorkflowGuide ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Database Backup & Restore */}
          {(currentUser.id === 'default' || currentUser.name?.toLowerCase() === 'julio' || currentUser.name?.toLowerCase() === 'julian' || currentUser.email?.toLowerCase() === 'juliozaldivar@gmail.com') && (
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-500" />
                <label className="text-xs font-bold text-slate-300">Data Backup & Portability</label>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Cloud Run containers are stateless and ephemeral. To prevent losing your watch buddies' customized reviews, comments, and ratings when publishing updates, use these options to export or restore your data anytime. <strong className="text-emerald-400">Note: This backup file is comprehensive and includes everyone's comments, data, scores, and streaming selections, not just your own.</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/5 bg-[#0F1115] hover:bg-[#1C2028] text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                  title="Download CouchTaterz backup JSON file"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Export Backup File</span>
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    disabled={restoreLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={restoreLoading}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/5 bg-[#0F1115] hover:bg-[#1C2028] text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>{restoreLoading ? "Restoring..." : "Import/Restore Data"}</span>
                  </button>
                </div>
              </div>
              {restoreError && (
                <p className="text-[10px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{restoreError}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5 pt-4">
            {showDeleteConfirm ? (
              <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">Delete profile & restart? This cannot be undone.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#262A33] hover:bg-[#2c313c] text-slate-300 font-bold text-[11px] transition cursor-pointer"
                  >
                    No, Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Reset</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mr-auto p-2.5 rounded-xl bg-transparent hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition cursor-pointer flex items-center gap-1.5"
                  title="Delete Profile & Start Over"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Delete & Start Over</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-[#262A33] hover:bg-[#2c313c] text-slate-300 font-bold text-xs transition border border-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-500/10 border border-blue-500/25 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
