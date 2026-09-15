/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, Sparkles, Sliders, CheckCircle2, Lock, 
  RefreshCw, AlertTriangle, UserCheck, Flame, Zap
} from 'lucide-react';

interface AiBetaSettings {
  betaLimitsEnabled: boolean;
  dailyLimitPerUser: number;
  adminOnlyMode: boolean;
  proDailyLimit: number;
}

interface AiControlsTabProps {
  currentUser: { id: string; name: string; email?: string };
  theme?: 'dark' | 'light';
  initialSettings?: AiBetaSettings;
  onSettingsUpdated?: (newSettings: AiBetaSettings) => void;
}

export const AiControlsTab: React.FC<AiControlsTabProps> = ({
  currentUser,
  theme = 'dark',
  initialSettings,
  onSettingsUpdated
}) => {
  const [settings, setSettings] = useState<AiBetaSettings>(
    initialSettings || {
      betaLimitsEnabled: true,
      dailyLimitPerUser: 10,
      adminOnlyMode: false,
      proDailyLimit: 100
    }
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isJulioAdmin = 
    currentUser.email?.toLowerCase().trim() === 'juliozaldivar@gmail.com' ||
    currentUser.email?.toLowerCase().trim() === 'julio@couchtaterz.com' ||
    currentUser.id === 'default' ||
    currentUser.id === 'user-julio';

  const handleToggleLimits = () => {
    setSettings((prev) => ({
      ...prev,
      betaLimitsEnabled: !prev.betaLimitsEnabled
    }));
    setSaveSuccess(false);
  };

  const handleToggleAdminOnly = () => {
    setSettings((prev) => ({
      ...prev,
      adminOnlyMode: !prev.adminOnlyMode
    }));
    setSaveSuccess(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email || 'juliozaldivar@gmail.com',
          betaLimitsEnabled: settings.betaLimitsEnabled,
          dailyLimitPerUser: Number(settings.dailyLimitPerUser),
          adminOnlyMode: settings.adminOnlyMode,
          proDailyLimit: Number(settings.proDailyLimit)
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update AI beta safeguard settings.');
      }

      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        if (onSettingsUpdated) {
          onSettingsUpdated(data.settings);
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error saving AI settings:', err);
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className={`p-5 rounded-2xl border ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-800/40' 
          : 'bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-purple-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shrink-0 border border-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Public Beta AI Safeguards & Quota Controls
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Beta Protection
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Safeguard your Gemini API limits as you open CouchTaterz to beta testers. Non-admin users can be capped at a configurable daily limit (default 10 AI recommendations & summaries per day), with your admin account remaining completely unlimited.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Exemption Status Card */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Admin Unlimited Access Status: <span className="text-emerald-400 font-extrabold">{isJulioAdmin ? 'Active (Exempt from limits)' : 'Standard User'}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Admin account (<span className="text-purple-300 font-medium">juliozaldivar@gmail.com</span>) bypasses all daily AI consumption limits.
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 10 AI Quota Toggle */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Daily Public AI Quota</h4>
                  <p className="text-[11px] text-slate-400">Enforce daily quota for standard beta testers</p>
                </div>
              </div>

              {/* Master Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleLimits}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.betaLimitsEnabled ? 'bg-blue-600' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.betaLimitsEnabled}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.betaLimitsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Daily Limit Per Beta User:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.dailyLimitPerUser}
                  onChange={(e) => setSettings({ ...settings, dailyLimitPerUser: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  disabled={!settings.betaLimitsEnabled}
                  className={`w-24 px-3 py-2 rounded-xl text-sm font-bold border text-center transition ${
                    settings.betaLimitsEnabled
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500 focus:outline-none'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                />
                <span className="text-xs text-slate-400 font-medium">
                  AI requests / day (default: 10)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            {settings.betaLimitsEnabled ? (
              <span className="text-blue-400 font-medium">● Rate limiting active: Beta users receive notifications when hitting their daily allowance.</span>
            ) : (
              <span className="text-amber-400 font-medium">○ Rate limiting disabled: Public beta testers have unlimited AI queries.</span>
            )}
          </div>
        </div>

        {/* Card 2: Emergency Admin-Only Mode */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Emergency Admin-Only AI Mode</h4>
                  <p className="text-[11px] text-slate-400">Restrict all AI features exclusively to admin</p>
                </div>
              </div>

              {/* Admin-Only Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleAdminOnly}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.adminOnlyMode ? 'bg-rose-600' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.adminOnlyMode}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.adminOnlyMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              If your API key approaches critical limits during sudden viral traffic, flipping this on immediately locks AI features for public users with a friendly maintenance message while allowing you to test freely.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
            {settings.adminOnlyMode ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Emergency Lock Active: Only Julio has AI access.
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Public AI Access enabled for beta testers.
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Pro Tier Allowance */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#121522] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Paid / Pro Tier Daily Limit</h4>
                <p className="text-[11px] text-slate-400">Quota for future paid subscribers</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Daily Limit for Taterz Pro:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={settings.proDailyLimit}
                  onChange={(e) => setSettings({ ...settings, proDailyLimit: Math.max(20, parseInt(e.target.value, 10) || 100) })}
                  className="w-24 px-3 py-2 rounded-xl text-sm font-bold border bg-slate-900 border-slate-700 text-white text-center focus:border-amber-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-medium">
                  AI requests / day (default: 100)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Provides liberal credits for upgraded beta supporters.
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {saveSuccess ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="w-4 h-4" /> AI safeguard settings saved & synced in real-time!
            </span>
          ) : errorMsg ? (
            <span className="text-rose-400 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
              <AlertTriangle className="w-4 h-4" /> {errorMsg}
            </span>
          ) : (
            <span>Settings apply immediately to all active AI queries and reset automatically at midnight.</span>
          )}
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Controls...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save AI Safeguards</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
