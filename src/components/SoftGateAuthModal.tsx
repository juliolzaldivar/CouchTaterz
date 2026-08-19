import React, { useState } from 'react';
import { X, Sparkles, LogIn, Lock, Check, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface SoftGateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  ownerName?: string;
  actionTitle?: string;
}

export const SoftGateAuthModal: React.FC<SoftGateAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  ownerName = 'a Binge Buddy',
  actionTitle = 'interact with watch lists',
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'quick' | 'google'>('quick');

  if (!isOpen) return null;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const cleanName = name.trim();
      const generatedEmail = email.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@couchtaterz.com`;
      const newUser: User = {
        id: `user-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cleanName,
        email: generatedEmail,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('coughtater_user', JSON.stringify(newUser));
      } catch (err) {}

      setIsSubmitting(false);
      onClose();
      onSuccessLogin(newUser);
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const googleUser: User = {
        id: `user-google-${randomId}`,
        name: name.trim() || `TaterFriend_${randomId}`,
        email: email.trim() || `user_${randomId}@gmail.com`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=Tater_${randomId}`,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('coughtater_user', JSON.stringify(googleUser));
      } catch (err) {}

      setIsSubmitting(false);
      onClose();
      onSuccessLogin(googleUser);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F1117] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 my-auto">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0F1117] rounded-[14px] flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[9px] font-black uppercase tracking-wider">
              1-Tap Guest Authentication
            </span>
            <h3 className="text-base font-black text-white tracking-tight mt-0.5">
              Sync & Join {ownerName}'s Binge Buddies!
            </h3>
          </div>
        </div>

        {/* Explanatory Callout */}
        <div className="p-3.5 bg-purple-950/30 border border-purple-500/25 rounded-2xl space-y-1">
          <p className="text-xs text-purple-200 font-medium leading-relaxed">
            Join <strong className="text-white">{ownerName}'s</strong> Binge Buddies on CouchTaterz to {actionTitle} and sync watch lists in real time!
          </p>
          <div className="flex items-center gap-1 text-[10px] text-purple-300/80 font-bold pt-1 border-t border-purple-500/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Your action has been saved and will apply automatically once signed in.</span>
          </div>
        </div>

        {/* Google 1-Tap Auth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google 1-Tap</span>
        </button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0F1117] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
            or quick guest sign in
          </span>
        </div>

        {/* Quick Guest Name Input Form */}
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
              Your Name or Handle *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Julio, AnnaDee, Alex"
              className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full bg-[#161822] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Signing in & Applying Action...' : 'Join & Save Action'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500 leading-normal">
          No passkeys required. Free forever. By continuing, you connect as a Binge Buddy with {ownerName}.
        </p>
      </div>
    </div>
  );
};
