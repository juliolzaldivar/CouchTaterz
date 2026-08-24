import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  ArrowLeft, 
  ChevronDown, 
  Search, 
  Shield, 
  UserCheck,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface AdminImpersonationBarProps {
  currentUser: User;
  adminImpersonator?: User | null;
  allUsers?: User[];
  onSwitchTester: (user: any) => void;
  onExitTestMode: () => void;
  onOpenAdminModal?: () => void;
  theme?: 'dark' | 'light';
}

const CANONICAL_FALLBACK_TESTERS: User[] = [
  {
    id: 'user-doug-5821',
    name: 'Doug Briskie',
    email: 'doug.briskie@icloud.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=DougBriskie',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-stef-4912',
    name: 'Stef',
    email: 'stef@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Stef',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-ejc-2841',
    name: 'EJC',
    email: 'ejc@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=EJC',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-rafael-9639',
    name: 'Rafael',
    email: 'rafael.gomez@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RafaelGomez',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-kris-5139',
    name: 'Kris',
    email: 'kris@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kris',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-greg-3842',
    name: 'Greg',
    email: 'greg@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Greg',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-lilyann-4290',
    name: 'Lilyann',
    email: 'lilyann@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=BingeWatcher',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-julian-7667',
    name: 'Julian',
    email: 'julian@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-hyunjin-6821',
    name: 'Hyunjin',
    email: 'hyunjin@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hyunjin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-lily-9367',
    name: 'AnnaDee',
    email: 'annadee@taterz.com',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=AnnaDee',
    createdAt: new Date().toISOString()
  }
];

export const AdminImpersonationBar: React.FC<AdminImpersonationBarProps> = ({
  currentUser,
  adminImpersonator,
  allUsers = [],
  onSwitchTester,
  onExitTestMode,
  onOpenAdminModal,
  theme = 'dark'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Merge loaded users with canonical testers
  const combinedUsers = React.useMemo(() => {
    const map = new Map<string, User>();
    CANONICAL_FALLBACK_TESTERS.forEach(u => map.set(u.id, u));
    allUsers.forEach(u => {
      if (u && u.id) map.set(u.id, u);
    });
    return Array.from(map.values());
  }, [allUsers]);

  // Filter out current user from quick switch list
  const availableTesters = combinedUsers.filter(u => {
    if (u.id === currentUser.id) return false;
    if (u.id === 'default' || u.id === 'user-julio' || u.email === 'juliozaldivar@gmail.com') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const adminDisplayName = adminImpersonator?.name || 'Julio';

  return (
    <div className="sticky top-0 z-[100] w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-neutral-950 shadow-xl border-b border-amber-400/50">
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-6 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        {/* Left Badge & Current Persona Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black text-amber-300 font-black text-[10px] uppercase tracking-wider shrink-0 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Admin Test Mode</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-black/80 font-bold hidden md:inline text-[11px]">Acting as:</span>
            <div className="flex items-center gap-1.5 bg-black/15 px-2 py-1 rounded-xl border border-black/10 truncate">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-4 h-4 rounded-full border border-black/30 object-cover shrink-0"
              />
              <span className="font-extrabold text-neutral-950 truncate text-[11px]">
                {currentUser.name}
              </span>
              {currentUser.email && (
                <span className="text-[10px] text-black/70 hidden sm:inline truncate font-mono">
                  ({currentUser.email})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Switcher Dropdown, Admin Modal Trigger, Exit Button */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          
          {/* Quick Switch Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-black/20 hover:bg-black/30 active:bg-black/40 text-black font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl border border-black/20 flex items-center gap-1.5 transition cursor-pointer"
              title="Quickly switch to another tester persona"
            >
              <Users className="w-3 h-3 text-black" />
              <span>Switch Tester</span>
              <ChevronDown className={`w-3 h-3 text-black transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-64 xs:w-72 bg-[#141722] text-slate-100 border border-slate-700/80 rounded-2xl shadow-2xl z-[110] overflow-hidden flex flex-col text-xs"
                >
                  <div className="p-2.5 border-b border-slate-800 bg-[#1A1E2C] space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Select Active Tester Persona
                    </p>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search testers..."
                        className="w-full pl-8 pr-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                    {availableTesters.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-[11px]">
                        No other testers found matching query.
                      </div>
                    ) : (
                      availableTesters.map(u => (
                        <button
                          key={`switch-target-${u.id}`}
                          onClick={() => {
                            onSwitchTester(u);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition flex items-center justify-between gap-2 group cursor-pointer text-slate-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={u.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`}
                              alt={u.name}
                              className="w-6 h-6 rounded-full border border-slate-700 object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-white text-[11px] truncate group-hover:text-amber-300">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate font-mono">
                                {u.email || u.id}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 opacity-0 group-hover:opacity-100 transition shrink-0 font-bold">
                            Act As
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Admin shortcut */}
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="bg-black/20 hover:bg-black/30 text-black font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl border border-black/20 hidden sm:flex items-center gap-1.5 transition cursor-pointer"
              title="Open Admin Control Center"
            >
              <Shield className="w-3 h-3 text-black" />
              <span>Admin Center</span>
            </button>
          )}

          {/* Exit Impersonation Button */}
          <button
            onClick={onExitTestMode}
            className="bg-black hover:bg-neutral-900 active:scale-95 text-amber-400 font-black text-[11px] px-3 py-1.5 rounded-xl shadow-lg border border-amber-300/40 flex items-center gap-1.5 transition cursor-pointer"
            title={`Exit Test Mode and return to ${adminDisplayName} (Admin)`}
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Exit to {adminDisplayName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
