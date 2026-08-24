import React, { useState } from 'react';
import { 
  Palette, Check, ArrowRight, Shuffle, Sparkles, User, RefreshCw
} from 'lucide-react';
import { JULIO_OFFICIAL_AVATAR } from '../../utils/taterAvatarUtils';

interface ProfileSectionProps {
  tasteCalibrationScore: number;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  selectedTones: string[];
  selectedSubscriptions: Record<string, boolean>;
  setSelectedSubscriptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleActionClick: (target: any) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = React.memo(({
  tasteCalibrationScore,
  selectedGenres,
  setSelectedGenres,
  selectedTones,
  selectedSubscriptions,
  setSelectedSubscriptions,
  handleActionClick
}) => {
  // Seeds & Avatar State
  const [selectedSeed, setSelectedSeed] = useState<string>('Julio');
  const [customSeedInput, setCustomSeedInput] = useState<string>('');

  const seedPresets = [
    { seed: 'Julio', label: 'Julio (Admin)' },
    { seed: 'Rafael', label: 'Rafael' },
    { seed: 'Kris', label: 'Kris' },
    { seed: 'AnnaDee', label: 'AnnaDee' },
    { seed: 'SpudMaster', label: 'SpudMaster' },
    { seed: 'CyberTater', label: 'CyberTater' }
  ];

  const handleRandomize = () => {
    const randomSeeds = ['PixelHero', 'CouchKing', 'PopcornPixel', 'NightWatcher', 'CinemaGhost', 'Retro8Bit', 'StreamVault'];
    const randomChoice = randomSeeds[Math.floor(Math.random() * randomSeeds.length)];
    setSelectedSeed(randomChoice);
  };

  const currentAvatarUrl = selectedSeed === 'Julio' 
    ? JULIO_OFFICIAL_AVATAR 
    : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(selectedSeed)}`;

  return (
    <section id="doc-section-profile" className="space-y-8 scroll-mt-24">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/25">
          <Palette className="w-3.5 h-3.5 text-blue-400" />
          <span>Section 5</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          5. User Profile & Preferences
        </h2>
        <p className="text-base text-slate-300 font-medium max-w-3xl leading-relaxed">
          Access settings anytime by clicking your avatar in the top-right corner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SUB-SECTION 5.1: PROFILE & DICEBEAR PIXEL ART AVATAR */}
        <div className="lg:col-span-6 bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl shadow-blue-950/20 space-y-6 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Profile Identity & DiceBear Avatar</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black border border-blue-500/30">
                Preset: {selectedSeed}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Manage display name, email, and avatar. Powered by the <strong>DiceBear Pixel Art Engine</strong> using procedural seed-based generation.
            </p>

            {/* Live DiceBear Avatar Display & Seed Presets */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              
              {/* Avatar Preview Frame */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <div className="relative group shrink-0">
                  <img
                    src={currentAvatarUrl}
                    alt="Customized DiceBear Avatar"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-blue-500/50 object-cover bg-slate-950 shadow-xl"
                  />
                  {selectedSeed === 'Julio' && (
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                      Default
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">Julio Zaldivar</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 text-[9px] font-black border border-blue-500/40">
                        JLZ
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">julio@couchtaterz.com</p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={handleRandomize}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Randomize</span>
                    </button>
                    {selectedSeed !== 'Julio' && (
                      <button
                        onClick={() => setSelectedSeed('Julio')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset to Julio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Seed Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Seed Presets & Character Generation
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {seedPresets.map(preset => (
                    <button
                      key={preset.seed}
                      onClick={() => setSelectedSeed(preset.seed)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition truncate cursor-pointer ${
                        selectedSeed === preset.seed
                          ? 'bg-blue-600 border-blue-400 text-white shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Seed Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Custom Seed Input
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSeedInput}
                    onChange={(e) => setCustomSeedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customSeedInput.trim()) {
                        setSelectedSeed(customSeedInput.trim());
                        setCustomSeedInput('');
                      }
                    }}
                    placeholder="Enter any seed name..."
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (customSeedInput.trim()) {
                        setSelectedSeed(customSeedInput.trim());
                        setCustomSeedInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
                  >
                    Apply Seed
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Pixel Art DiceBear Avatar Engine</span>
            <button
              onClick={() => handleActionClick('preferences')}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Profile in Preferences</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* SUB-SECTION 5.2: AI TASTE PROFILE & STREAMING SERVICES */}
        <div className="lg:col-span-6 bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl shadow-blue-950/20 space-y-6 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>AI Taste Profile & Services</span>
              </h3>
              <div className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black border border-blue-500/30">
                Calibration: {tasteCalibrationScore}%
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <strong>AI Taste Profile:</strong> Define preferred genres, favorite eras, tones, and benchmark shows to calibrate Spudz AI recommendations.
            </p>

            {/* Interactive Taste Chips */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Preferred Genres & Tones (Click to Toggle)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Sci-Fi', 'Prestige Drama', 'Psychological Thriller', 'Satire', 'Dark Noir', 'Witty & Sarcastic', 'Mind-Bending', '90s Classics'].map(chip => {
                    const isSelected = selectedGenres.includes(chip) || selectedTones.includes(chip);
                    return (
                      <button
                        key={chip}
                        onClick={() => {
                          if (selectedGenres.includes(chip)) {
                            setSelectedGenres(selectedGenres.filter(g => g !== chip));
                          } else {
                            setSelectedGenres([...selectedGenres, chip]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Benchmark Shows */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Benchmark Calibration Shows
                </span>
                <div className="flex items-center gap-2 text-xs text-blue-300 font-bold">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Severance</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Succession</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Slow Horses</span>
                </div>
              </div>
            </div>

            {/* Streaming Services & Data Controls */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Streaming Services Subscriptions
                </h4>
                <p className="text-xs text-slate-400">Toggle active streaming subscriptions to filter availability.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(selectedSubscriptions).map(([service, active]) => (
                  <button
                    key={service}
                    onClick={() => setSelectedSubscriptions(prev => ({ ...prev, [service]: !prev[service] }))}
                    className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="truncate">{service}</span>
                    {active && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span><strong>Data Management:</strong> Account deletion and privacy controls</span>
                <span className="text-blue-400 font-bold">GDPR Compliant</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Personalization Matrix</span>
            <button
              onClick={() => handleActionClick('preferences')}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Configure AI Preferences</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

ProfileSection.displayName = 'ProfileSection';
