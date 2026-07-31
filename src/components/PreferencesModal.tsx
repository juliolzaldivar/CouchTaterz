/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserPreferences, StreamingService, TvShow } from '../types';
import { 
  X, Check, Sparkles, Sliders, Mail, User as UserIcon, Trash2, 
  AlertTriangle, Download, Upload, Tv, Globe, Clock, Film, Heart, Plus, Calendar,
  Camera, ShieldCheck, MapPin, Tag, Star, Bell, Phone, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreferencesModalProps {
  currentUser: User;
  preferences: UserPreferences;
  existingShows?: TvShow[];
  onSave: (updatedUser: User, updatedPrefs: UserPreferences) => void;
  onDelete: (password?: string) => void;
  onClose: () => void;
  showWorkflowGuide: boolean;
  onToggleWorkflowGuide: (show: boolean) => void;
  theme?: 'dark' | 'light';
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

const GENDER_OPTIONS = [
  'Prefer not to say', 'Female', 'Male', 'Non-binary', 'Other'
];

const AGE_RANGE_OPTIONS = [
  'Under 18', '18–24', '25–34', '35–44', '45–54', '55+'
];

const ERA_OPTIONS = [
  '70s & Classic TV', '80s Nostalgia', '90s Golden Era', '2000s Peak TV', '2010s Prestige TV', 'Current & Modern (2020s)'
];

const VIBE_OPTIONS = [
  'Bingeable Drama', 'Dark & Gritty', 'Lighthearted & Comforting', 'Mind-Bending & Sci-Fi', 'Fast-Paced Action', 'Cerebral Mystery', 'Satirical & Sharp', 'Slow-Burn Masterpiece'
];

const POPULAR_SHOW_SUGGESTIONS = [
  'Breaking Bad', 'The Office', 'Game of Thrones', 'Succession', 'The Sopranos', 'Stranger Things', 'Ted Lasso', 'Friends', 'Seinfeld', 'The Wire', 'Twin Peaks', 'Severance'
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  currentUser,
  preferences,
  existingShows = [],
  onSave,
  onDelete,
  onClose,
  showWorkflowGuide,
  onToggleWorkflowGuide,
  theme = 'dark'
}) => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'ai_taste' | 'subscriptions' | 'app_data'>('profile');

  // Account & Identity State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [customAvatarInput, setCustomAvatarInput] = useState(
    currentUser?.avatarUrl?.startsWith('http') && !currentUser?.avatarUrl?.includes('dicebear.com')
      ? currentUser.avatarUrl
      : ''
  );
  const [showCustomAvatarField, setShowCustomAvatarField] = useState(
    Boolean(currentUser?.avatarUrl?.startsWith('http') && !currentUser?.avatarUrl?.includes('dicebear.com'))
  );
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

  // Notifications Preference State
  const [alertPreference, setAlertPreference] = useState<'email' | 'text'>(
    preferences?.alertPreference || 'email'
  );
  const [alertEmail, setAlertEmail] = useState<string>(
    preferences?.alertPreference === 'email' && preferences?.alertDestination
      ? preferences.alertDestination
      : currentUser?.email || ''
  );
  const [alertPhone, setAlertPhone] = useState<string>(
    preferences?.alertPreference === 'text' && preferences?.alertDestination
      ? preferences.alertDestination
      : ''
  );

  // Expanded Demographics & Granular Location
  const [gender, setGender] = useState<string>(preferences?.gender || 'Prefer not to say');
  const [ageRange, setAgeRange] = useState<string>(preferences?.ageRange || '25–34');
  const [country, setCountry] = useState<string>(preferences?.country || 'United States');
  const [stateRegion, setStateRegion] = useState<string>(preferences?.stateRegion || '');
  const [city, setCity] = useState<string>(preferences?.city || '');
  const [timezone, setTimezone] = useState<string>(
    preferences?.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Los_Angeles')
  );
  // Background Location Auto-Detection
  useEffect(() => {
    try {
      const tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'America/Los_Angeles';
      setTimezone(tz);

      let detectedCountry = country || 'United States';
      let detectedState = stateRegion || '';
      let detectedCity = city || '';

      if (tz.includes('America/Los_Angeles')) {
        detectedCountry = 'United States';
        if (!detectedState) detectedState = 'California';
        if (!detectedCity) detectedCity = 'Los Angeles';
      } else if (tz.includes('America/New_York')) {
        detectedCountry = 'United States';
        if (!detectedState) detectedState = 'New York';
        if (!detectedCity) detectedCity = 'New York';
      } else if (tz.includes('America/Chicago')) {
        detectedCountry = 'United States';
        if (!detectedState) detectedState = 'Illinois';
        if (!detectedCity) detectedCity = 'Chicago';
      } else if (tz.includes('America/Denver') || tz.includes('America/Phoenix')) {
        detectedCountry = 'United States';
        if (!detectedState) detectedState = 'Colorado';
        if (!detectedCity) detectedCity = 'Denver';
      } else if (tz.includes('America/Toronto') || tz.includes('America/Vancouver')) {
        detectedCountry = 'Canada';
        if (!detectedState) detectedState = 'Ontario';
        if (!detectedCity) detectedCity = 'Toronto';
      } else if (tz.includes('Europe/London')) {
        detectedCountry = 'United Kingdom';
        if (!detectedState) detectedState = 'Greater London';
        if (!detectedCity) detectedCity = 'London';
      } else if (tz.includes('Australia/Sydney') || tz.includes('Australia/Melbourne')) {
        detectedCountry = 'Australia';
        if (!detectedState) detectedState = 'New South Wales';
        if (!detectedCity) detectedCity = 'Sydney';
      } else if (tz.includes('Europe/Paris')) {
        detectedCountry = 'France';
        if (!detectedState) detectedState = 'Île-de-France';
        if (!detectedCity) detectedCity = 'Paris';
      } else if (tz.includes('Europe/Berlin')) {
        detectedCountry = 'Germany';
        if (!detectedState) detectedState = 'Berlin';
        if (!detectedCity) detectedCity = 'Berlin';
      } else if (tz.includes('Asia/Tokyo')) {
        detectedCountry = 'Japan';
        if (!detectedCity) detectedCity = 'Tokyo';
      }

      setCountry(detectedCountry);
      setStateRegion(detectedState);
      setCity(detectedCity);
    } catch {
      // Silent background auto-detection
    }
  }, []);

  // Expanded AI Taste Profile
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    Array.isArray(preferences?.genres) ? preferences.genres : []
  );
  const [selectedEras, setSelectedEras] = useState<string[]>(
    Array.isArray(preferences?.eras) ? preferences.eras : ['90s Golden Era', '2000s Peak TV', 'Current & Modern (2020s)']
  );
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    Array.isArray(preferences?.vibes) ? preferences.vibes : []
  );
  // Merge saved preference favorites with any favorited shows on user's tracked board
  const initialFavoriteShows = React.useMemo(() => {
    const list = new Set<string>();
    if (Array.isArray(preferences?.favoriteShows)) {
      preferences.favoriteShows.forEach(fav => {
        if (typeof fav === 'string' && fav.trim()) {
          list.add(fav.trim());
        }
      });
    }
    if (Array.isArray(existingShows) && existingShows.length > 0) {
      existingShows.forEach(s => {
        if (s && s.isFavorite && typeof s.title === 'string' && s.title.trim()) {
          list.add(s.title.trim());
        }
      });
    }
    return Array.from(list);
  }, [preferences?.favoriteShows, existingShows]);

  const [favoriteShows, setFavoriteShows] = useState<string[]>(initialFavoriteShows);
  const [showTagInput, setShowTagInput] = useState('');

  // Subscriptions
  const [selectedServices, setSelectedServices] = useState<StreamingService[]>(
    Array.isArray(preferences?.services) ? preferences.services : []
  );

  // Settings & Administrative Data
  const [localShowWorkflowGuide, setLocalShowWorkflowGuide] = useState(showWorkflowGuide);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const isJulio = currentUser?.id === 'default' || currentUser?.id === 'user-julio' || currentUser?.name?.trim().toLowerCase() === 'julio' || currentUser?.email?.toLowerCase() === 'juliozaldivar@gmail.com';

  const handleConfirmDelete = () => {
    if (isJulio) {
      if (deletePassword.trim() !== '3713') {
        setDeleteError("Incorrect password! Enter password 3713 to delete Julio's profile.");
        return;
      }
    }
    onDelete(deletePassword);
  };

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
        if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
          throw new Error('Invalid backup file. Must be a valid JSON object or array.');
        }

        const activeBoardId = currentUser?.id || 'default';
        const res = await fetch(`/api/admin/restore?boardId=${encodeURIComponent(activeBoardId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });

        if (res.ok) {
          const result = await res.json();
          // Crucial: Clear cached local boards so old state doesn't overwrite restored server data on reload
          Object.keys(localStorage).forEach(key => {
            if (key.includes('couchtater_board') || key.includes('coughtater_board')) {
              localStorage.removeItem(key);
            }
          });
          alert(`Success! Successfully restored ${result.boardsCount} binge buddies' watchlists, reviews, and ratings! The app will now reload to apply all data.`);
          window.location.reload();
        } else {
          let errMessage = 'Failed to restore database from backup file.';
          try {
            const errData = await res.json();
            if (errData?.error) errMessage = errData.error;
          } catch (e) {
            errMessage = `Server returned status code ${res.status}`;
          }
          throw new Error(errMessage);
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

  const handleToggleEra = (era: string) => {
    setSelectedEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  const handleToggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  const handleToggleService = (service: StreamingService) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleAddFavoriteShow = (showTitle: string) => {
    const trimmed = showTitle.trim();
    if (!trimmed) return;
    if (!favoriteShows.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setFavoriteShows(prev => [...prev, trimmed]);
    }
    setShowTagInput('');
  };

  const handleRemoveFavoriteShow = (showTitle: string) => {
    setFavoriteShows(prev => prev.filter(s => s !== showTitle));
  };

  const handleSelectPresetAvatar = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(url);
    setCustomAvatarInput('');
    setShowCustomAvatarField(false);
    setIsAvatarExpanded(false);
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

    const computedGeography = [city.trim(), stateRegion.trim(), country.trim()].filter(Boolean).join(', ') || country.trim() || 'United States';

    const updatedPrefs: UserPreferences = {
      ...preferences,
      genres: selectedGenres,
      services: selectedServices,
      gender,
      ageRange,
      geography: computedGeography,
      country: country.trim(),
      stateRegion: stateRegion.trim(),
      city: city.trim(),
      timezone: timezone.trim(),
      eras: selectedEras,
      vibes: selectedVibes,
      favoriteShows,
      alertPreference,
      alertDestination: alertPreference === 'email' ? alertEmail.trim() : alertPhone.trim()
    };

    onToggleWorkflowGuide(localShowWorkflowGuide);
    onSave(updatedUser, updatedPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 overflow-hidden">
      {/* Click outside backdrop to close */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
        aria-label="Close drawer"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={`relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl h-full border-l shadow-2xl flex flex-col overflow-hidden z-10 transition-colors ${
          theme === 'light' ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-[#16181E] border-white/10 text-white'
        }`}
      >
        {/* Header Bar */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 shrink-0 ${
          theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#111319] border-white/10'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 ${
                theme === 'light' ? 'text-neutral-900' : 'text-white'
              }`}>
                <span>Profile & Preferences</span>
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-neutral-500' : 'text-slate-400'}`}>Tailor your profile identity, granular streaming region, and Spudz AI taste preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2.5 rounded-2xl transition cursor-pointer border shrink-0 ${
              theme === 'light' 
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border-neutral-200' 
                : 'bg-[#222630] hover:bg-[#2e3342] text-slate-300 hover:text-white border-white/5'
            }`}
            title="Close panel"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Navigation Bar (Mobile 2x2 Segmented Grid & Desktop Segmented Tab Track) */}
        <div className={`border-b p-2.5 sm:px-5 sm:pt-3 shrink-0 ${
          theme === 'light' ? 'bg-neutral-100/70 border-neutral-200' : 'bg-[#0C0E12] border-white/10'
        }`}>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 bg-[#14171F] sm:bg-transparent p-1.5 sm:p-0 rounded-2xl sm:rounded-none border border-white/5 sm:border-none">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-t-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center sm:justify-start gap-2 cursor-pointer border sm:border-t sm:border-x sm:border-b-0 ${
                activeTab === 'profile'
                  ? 'bg-[#16181E] text-blue-400 border-blue-500/40 sm:border-white/10 sm:border-b-[#16181E] sm:-mb-px z-10 shadow-md'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0 text-blue-400" />
              <span className="truncate">
                <span className="sm:hidden">Profile</span>
                <span className="hidden sm:inline">Profile & Identity</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_taste')}
              className={`px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-t-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 cursor-pointer border sm:border-t sm:border-x sm:border-b-0 ${
                activeTab === 'ai_taste'
                  ? 'bg-[#16181E] text-emerald-400 border-emerald-500/40 sm:border-emerald-500/40 sm:border-b-[#16181E] sm:-mb-px z-10 shadow-md'
                  : 'text-slate-400 hover:text-emerald-300 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">AI Taste</span>
                <span className="hidden sm:inline">AI Taste Profile</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border border-emerald-500/30 shrink-0">
                AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className={`px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-t-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 cursor-pointer border sm:border-t sm:border-x sm:border-b-0 ${
                activeTab === 'subscriptions'
                  ? 'bg-[#16181E] text-sky-400 border-sky-500/40 sm:border-white/10 sm:border-b-[#16181E] sm:-mb-px z-10 shadow-md'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Tv className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Streaming</span>
                <span className="hidden sm:inline">Streaming Services</span>
              </span>
              {selectedServices.length > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black flex items-center justify-center border border-sky-500/30 shrink-0">
                  {selectedServices.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('app_data')}
              className={`px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-t-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center sm:justify-start gap-2 cursor-pointer border sm:border-t sm:border-x sm:border-b-0 ${
                activeTab === 'app_data'
                  ? 'bg-[#16181E] text-amber-400 border-amber-500/40 sm:border-white/10 sm:border-b-[#16181E] sm:-mb-px z-10 shadow-md'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">App & Data</span>
                <span className="hidden sm:inline">App & Data</span>
              </span>
            </button>
          </div>
        </div>

        {/* Tab Body Content - Full Height & Spacious Scrollable Panel */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: PROFILE & IDENTITY */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* VIP Hero Identity Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#121624] via-[#0D1018] to-[#0A0C12] p-5 sm:p-6 rounded-2xl border border-blue-500/20 shadow-xl space-y-4">
                {/* Ambient Radial Glow Effect */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Avatar & Member Name */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative group shrink-0">
                      <img
                        src={avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name || 'default')}`}
                        alt="Avatar"
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-blue-400/50 object-cover bg-slate-900 shadow-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAvatarExpanded(!isAvatarExpanded)}
                        className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg border border-blue-400/30 transition hover:scale-110 cursor-pointer"
                        title="Change Avatar"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">{name || 'Watchlist Curator'}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>Spudz VIP</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{email || 'no-email@spudz.app'}</p>
                    </div>
                  </div>

                  {/* Right: Change Avatar Action Button */}
                  <button
                    type="button"
                    onClick={() => setIsAvatarExpanded(!isAvatarExpanded)}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 transition cursor-pointer shrink-0"
                  >
                    {isAvatarExpanded ? 'Close Avatar Picker' : 'Edit Avatar'}
                  </button>
                </div>

                {/* Profile Stats Quick-Bar */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
                  <div className="bg-[#141722]/80 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="block text-xs sm:text-sm font-black text-white">{selectedServices.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Services</span>
                  </div>
                  <div className="bg-[#141722]/80 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="block text-xs sm:text-sm font-black text-emerald-400">{selectedGenres.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Genres</span>
                  </div>
                  <div className="bg-[#141722]/80 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="block text-xs sm:text-sm font-black text-amber-400">{favoriteShows.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Favorites</span>
                  </div>
                </div>

                {/* Avatar Selection Drawer */}
                <AnimatePresence>
                  {isAvatarExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-white/10 space-y-3 overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">Select Avatar Preset</span>
                        <button
                          type="button"
                          onClick={() => setShowCustomAvatarField(!showCustomAvatarField)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                        >
                          {showCustomAvatarField ? "Choose Preset Icon" : "Use Custom Image URL"}
                        </button>
                      </div>

                      {showCustomAvatarField ? (
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={customAvatarInput}
                          onChange={(e) => {
                            setCustomAvatarInput(e.target.value);
                            if (e.target.value.trim()) setAvatarUrl(e.target.value.trim());
                          }}
                          className="w-full bg-[#16181E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
                        />
                      ) : (
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                          {PRESET_AVATARS.map((avatar) => {
                            const presetUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(avatar.seed)}`;
                            const isSelected = avatarUrl === presetUrl;
                            return (
                              <button
                                key={avatar.seed}
                                type="button"
                                onClick={() => handleSelectPresetAvatar(avatar.seed)}
                                className={`p-1 rounded-xl bg-[#16181E] border transition cursor-pointer flex items-center justify-center ${
                                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/20' : 'border-white/5 hover:border-white/20'
                                }`}
                                title={avatar.name}
                              >
                                <img src={presetUrl} alt={avatar.name} className="w-8 h-8 rounded-lg" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account Credentials Card */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Personal Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Display Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[#16181E] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-[#16181E] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Show Notifications Card */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-blue-400" />
                    <span>Show Notifications</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Configure your alert preferences for new episodes, air dates, and show updates</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span>Alert Preference</span>
                    </label>
                    <select
                      value={alertPreference}
                      onChange={(e) => setAlertPreference(e.target.value as 'email' | 'text')}
                      className="w-full bg-[#16181E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="email">Email</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    {alertPreference === 'email' ? (
                      <>
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Notification Email</span>
                        </label>
                        <input
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-[#16181E] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          value={alertPhone}
                          onChange={(e) => setAlertPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full bg-[#16181E] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI TASTE PROFILE & RECOMMENDATIONS */}
          {activeTab === 'ai_taste' && (
            <div className="space-y-5">
              {/* Concise AI Header Banner */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  <span className="font-semibold text-emerald-200">Spudz AI Recommendation Engine</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">These preferences tune Gemini AI recommendations and watchlist match ratings.</span>
                </div>
              </div>

              {/* Favorite Genres Card Grid */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Preferred Genres</h4>
                    {selectedGenres.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedGenres.length} selected
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = GENRE_OPTIONS.every(g => selectedGenres.includes(g));
                      setSelectedGenres(allSelected ? [] : [...GENRE_OPTIONS]);
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {GENRE_OPTIONS.every(g => selectedGenres.includes(g)) ? 'Clear' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {GENRE_OPTIONS.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleToggleGenre(genre)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/30' 
                            : 'bg-[#14171F] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate mr-1">{genre}</span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Eras Card Grid */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Favorite Eras</h4>
                    {selectedEras.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedEras.length} selected
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = ERA_OPTIONS.every(e => selectedEras.includes(e));
                      setSelectedEras(allSelected ? [] : [...ERA_OPTIONS]);
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {ERA_OPTIONS.every(e => selectedEras.includes(e)) ? 'Clear' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ERA_OPTIONS.map(era => {
                    const isSelected = selectedEras.includes(era);
                    return (
                      <button
                        key={era}
                        type="button"
                        onClick={() => handleToggleEra(era)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/30' 
                            : 'bg-[#14171F] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate mr-1">{era}</span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show Vibes Card Grid */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Show Vibes & Tone</h4>
                    {selectedVibes.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedVibes.length} selected
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = VIBE_OPTIONS.every(v => selectedVibes.includes(v));
                      setSelectedVibes(allSelected ? [] : [...VIBE_OPTIONS]);
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {VIBE_OPTIONS.every(v => selectedVibes.includes(v)) ? 'Clear' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {VIBE_OPTIONS.map(vibe => {
                    const isSelected = selectedVibes.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => handleToggleVibe(vibe)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/30' 
                            : 'bg-[#14171F] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate mr-1">{vibe}</span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All-Time Favorite TV Shows */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">All-Time Favorite TV Shows</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Add 3+ shows you love</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={showTagInput}
                    onChange={(e) => setShowTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFavoriteShow(showTagInput);
                      }
                    }}
                    placeholder="Search or type a show title..."
                    className="flex-1 bg-[#16181E] border border-white/10 focus:border-emerald-500/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFavoriteShow(showTagInput)}
                    disabled={!showTagInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Show</span>
                  </button>
                </div>

                {/* Tracked Watchlist Favorites Section */}
                {Array.isArray(existingShows) && existingShows.filter(s => s && typeof s.title === 'string').length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>From Your Tracked Collection (Tap to favorite)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {existingShows.filter(s => s && typeof s.title === 'string' && favoriteShows.some(fav => typeof fav === 'string' && fav.toLowerCase().trim() === s.title.toLowerCase().trim())).length} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {existingShows.map(s => {
                        if (!s || typeof s.title !== 'string') return null;
                        const isSelected = favoriteShows.some(fav => typeof fav === 'string' && fav.toLowerCase().trim() === s.title.toLowerCase().trim());
                        return (
                          <button
                            key={s.id || s.title}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveFavoriteShow(s.title);
                              } else {
                                handleAddFavoriteShow(s.title);
                              }
                            }}
                            className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-100 ring-1 ring-amber-500/30' 
                                : 'bg-[#14171F] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate mr-1">{s.title}</span>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Popular Show Suggestions Box Grid */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Popular Suggestions (Tap to select)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {POPULAR_SHOW_SUGGESTIONS.map(s => {
                      const isSelected = favoriteShows.some(fav => typeof fav === 'string' && fav.toLowerCase() === s.toLowerCase());
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveFavoriteShow(s);
                            } else {
                              handleAddFavoriteShow(s);
                            }
                          }}
                          className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/30' 
                              : 'bg-[#14171F] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate mr-1">{s}</span>
                          {isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Added Favorite Show Cards (not in popular or tracked list) */}
                {favoriteShows.filter(s => 
                  typeof s === 'string' &&
                  !POPULAR_SHOW_SUGGESTIONS.some(p => typeof p === 'string' && p.toLowerCase() === s.toLowerCase()) &&
                  !(Array.isArray(existingShows) && existingShows.some(e => e && typeof e.title === 'string' && e.title.toLowerCase().trim() === s.toLowerCase().trim()))
                ).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Custom Added Shows</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {favoriteShows
                        .filter(s => 
                          typeof s === 'string' &&
                          !POPULAR_SHOW_SUGGESTIONS.some(p => typeof p === 'string' && p.toLowerCase() === s.toLowerCase()) &&
                          !(Array.isArray(existingShows) && existingShows.some(e => e && typeof e.title === 'string' && e.title.toLowerCase().trim() === s.toLowerCase().trim()))
                        )
                        .map(s => (
                          <div
                            key={s}
                            className="p-3 rounded-xl text-xs font-semibold border bg-emerald-500/15 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/30 flex items-center justify-between shadow-sm"
                          >
                            <span className="truncate mr-1">{s}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFavoriteShow(s)}
                              className="w-4 h-4 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center shrink-0 transition cursor-pointer"
                              title="Remove show"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STREAMING SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-5">
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-sky-400" />
                      <span>Active Streaming Subscriptions</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Select platforms you own to power deep links and streaming availability badges</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = SERVICE_OPTIONS.every(s => selectedServices.includes(s));
                      setSelectedServices(allSelected ? [] : [...SERVICE_OPTIONS]);
                    }}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20 shrink-0"
                  >
                    {SERVICE_OPTIONS.every(s => selectedServices.includes(s)) ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SERVICE_OPTIONS.map((service) => {
                    const isSelected = selectedServices.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleToggleService(service)}
                        className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-sky-500/15 border-sky-500/40 text-sky-100 ring-1 ring-sky-500/30' 
                            : 'bg-[#14171F] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate mr-1">{service}</span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APP SETTINGS & DATA */}
          {activeTab === 'app_data' && (
            <div className="space-y-5">
              {/* Pipeline Guide Toggle */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 flex items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Watchlist Pipeline Guide Banner</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Display the interactive guide banner explaining Watching, Up Next, and Watched pipelines on board screens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalShowWorkflowGuide(!localShowWorkflowGuide)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    localShowWorkflowGuide ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      localShowWorkflowGuide ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Database Backup & Portability */}
              {(currentUser?.id === 'default' || currentUser?.id === 'user-julio' || currentUser?.name?.toLowerCase() === 'julio' || currentUser?.email?.toLowerCase() === 'juliozaldivar@gmail.com') && (
                <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Database Backup & Data Portability</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Export a snapshot of all watchlists, reviews, and buddy recommendations to JSON, or restore a previous backup file.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-[#16181E] hover:bg-[#202430] text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Export Database Backup</span>
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
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-[#16181E] hover:bg-[#202430] text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>{restoreLoading ? "Restoring..." : "Restore Data from File"}</span>
                      </button>
                    </div>
                  </div>
                  {restoreError && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{restoreError}</p>
                  )}
                </div>
              )}

              {/* Danger Zone */}
              <div className="bg-[#0D0F14] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Account & Profile Management</span>
                </h4>

                {showDeleteConfirm ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span className="text-xs font-bold">
                        {isJulio
                          ? "Protected Action: Enter password (3713) to delete Julio's profile:"
                          : "Delete profile & restart? This cannot be undone."}
                      </span>
                    </div>

                    {isJulio && (
                      <div className="space-y-1.5">
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => {
                            setDeletePassword(e.target.value);
                            setDeleteError('');
                          }}
                          placeholder="Enter password (3713)"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#0C0E12] text-white border border-rose-500/40 focus:outline-none focus:border-rose-400 placeholder-slate-500"
                          autoFocus
                        />
                        {deleteError && (
                          <p className="text-xs font-bold text-rose-400 mt-1 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                            {deleteError}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                          setDeleteError('');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#262A33] hover:bg-[#2c313c] text-slate-300 font-bold text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Confirm Reset</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-3 rounded-xl bg-[#16181E] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-2 text-xs font-semibold w-full"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete Profile & Reset Local State</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sticky Bottom Action Footer */}
          <div className="p-5 sm:p-6 bg-[#111319] border-t border-white/10 flex items-center justify-end gap-3 shrink-0 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#222630] hover:bg-[#2e3342] text-slate-300 font-bold text-xs transition border border-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-500/20 border border-blue-500/30 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Preferences</span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
