/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Palette, 
  Zap, 
  ExternalLink, 
  Tv, 
  ArrowRight, 
  Loader2,
  CreditCard,
  Check,
  RefreshCw,
  Gift
} from 'lucide-react';
import { User } from '../types';
import { openLemonSqueezyCheckout, fetchUserVipStatus, simulateVipUpgrade, initLemonSqueezyJs } from '../utils/lemonSqueezy';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onVipStatusChanged?: (isVip: boolean) => void;
}

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onVipStatusChanged,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [vipStatus, setVipStatus] = useState<{
    isVip: boolean;
    isPro: boolean;
    vipPlan?: string;
    subscriptionStatus?: string;
    subscriptionRenewsAt?: string;
    customerPortalUrl?: string;
    isLiveConfigured?: boolean;
  }>({
    isVip: false,
    isPro: false,
  });

  // Check if current user already has VIP
  const isUserVip = 
    currentUser?.email?.toLowerCase().trim() === 'juliozaldivar@gmail.com' ||
    currentUser?.isVip ||
    currentUser?.isPro ||
    vipStatus.isVip ||
    (typeof window !== 'undefined' && localStorage.getItem('couchtaterz_is_pro') === 'true');

  useEffect(() => {
    if (isOpen && currentUser) {
      initLemonSqueezyJs(() => {
        handleRefreshStatus();
      });
      handleRefreshStatus();
    }
  }, [isOpen, currentUser]);

  const handleRefreshStatus = async () => {
    if (!currentUser) return;
    setIsCheckingStatus(true);
    try {
      const res = await fetchUserVipStatus(currentUser);
      setVipStatus(res);
      if (res.isVip && onVipStatusChanged) {
        onVipStatusChanged(true);
      }
    } catch (e) {
      console.warn("Status check notice:", e);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await openLemonSqueezyCheckout({
        plan: selectedPlan,
        user: currentUser,
        onSuccess: () => {
          handleRefreshStatus();
          setStatusMessage("🎉 Payment successful! Your VIP perks are now active.");
          if (onVipStatusChanged) onVipStatusChanged(true);
        },
      });

      if (!res.success) {
        setStatusMessage(res.error || "Could not launch checkout. Please try again.");
      }
    } catch (err: any) {
      setStatusMessage(err?.message || "Checkout error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTestUpgrade = async (grant: boolean) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await simulateVipUpgrade(currentUser, grant, selectedPlan);
      await handleRefreshStatus();
      setStatusMessage(grant ? "✨ VIP Test Mode Activated!" : "VIP reset to standard free tier.");
      if (onVipStatusChanged) onVipStatusChanged(grant);
    } catch (err: any) {
      setStatusMessage(err?.message || "Simulation error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#161B2E] via-[#0F1320] to-[#0A0D16] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition z-10 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/10">
                <Crown className="w-3.5 h-3.5" />
                <span>CouchTaterz™ VIP All-Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Supercharge Your TV Experience
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Unlock unlimited AI recaps, custom avatar studio slots, full 9:16 social story cards, and priority sync.
              </p>
            </div>

            {/* VIP Active Status Banner */}
            {isUserVip ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">You are a VIP Member</h4>
                    <p className="text-xs text-emerald-300">
                      All VIP studio features & unlimited AI assistant requests are unlocked.
                    </p>
                  </div>
                </div>
                {vipStatus.customerPortalUrl && (
                  <a
                    href={vipStatus.customerPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <span>Manage</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : null}

            {/* Plan Selector Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-3 sm:p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'monthly'
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
                    Monthly
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white">
                    $3.99<span className="text-xs text-slate-400 font-normal">/mo</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Cancel anytime</p>
              </div>

              {/* Annual Plan (Best Value) */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className={`relative p-3 sm:p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'annual'
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-black text-white uppercase tracking-wider shadow">
                  Save 37%
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
                    Annual Pass
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white">
                    $29.99<span className="text-xs text-slate-400 font-normal">/yr</span>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium mt-2">$2.49 / month</p>
              </div>

              {/* Lifetime Pass */}
              <div
                onClick={() => setSelectedPlan('lifetime')}
                className={`relative p-3 sm:p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'lifetime'
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
                    Lifetime
                  </span>
                  <div className="text-lg sm:text-xl font-black text-white">
                    $49.00<span className="text-xs text-slate-400 font-normal"> once</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Pay once, own forever</p>
              </div>
            </div>

            {/* Feature Comparison Checklist */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                What's Included in VIP
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Unlimited AI Recaps & Picks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Full TaterCreator (10 Slots & Sliders)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>9:16 Social Story Review Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Gold VIP Crown & Status Badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority SMS & Email Release Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Real-Time Binge Buddy Sync</span>
                </div>
              </div>
            </div>

            {/* Status Feedback Message */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs text-center font-medium">
                {statusMessage}
              </div>
            )}

            {/* Main Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-black text-sm sm:text-base tracking-wide uppercase transition shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting Lemon Squeezy...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>
                      {isUserVip ? 'Renew or Upgrade Plan' : `Unlock VIP All Access (${selectedPlan === 'monthly' ? '$3.99/mo' : selectedPlan === 'annual' ? '$29.99/yr' : '$49.00'})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Payment Trust Badges */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure 256-bit Checkout
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Powered by Lemon Squeezy
                </span>
              </div>
            </div>

            {/* Footer Secondary Options */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isCheckingStatus}
                className="hover:text-white flex items-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>Restore / Verify Purchase</span>
              </button>

              {/* Developer / Preview Sandbox Quick-Test */}
              <button
                type="button"
                onClick={() => handleSimulateTestUpgrade(!isUserVip)}
                className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition cursor-pointer"
                title="Preview simulation toggle for developer testing"
              >
                {isUserVip ? 'Reset VIP Test' : '⚡ Simulate VIP (Test Mode)'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
