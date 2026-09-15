/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Bug, Sparkles, HelpCircle, MessageSquare, Send, CheckCircle2, 
  AlertCircle, Info, Monitor, Smartphone, Clock, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BugReport, BugReportCategory, BugReportSeverity, User } from '../types';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  theme?: 'dark' | 'light';
  currentRoute?: string;
  initialCategory?: BugReportCategory;
}

const CATEGORY_OPTIONS: { key: BugReportCategory; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    key: 'bug',
    label: 'Defect or Error',
    description: 'Something is broken, crashing, or not working as expected',
    icon: Bug,
  },
  {
    key: 'feature_request',
    label: 'Feature Request',
    description: 'Idea or suggestion to improve the CouchTaterz experience',
    icon: Sparkles,
  },
  {
    key: 'ui_confusing',
    label: 'UI / UX Feedback',
    description: 'A layout or interaction was confusing or difficult to use',
    icon: HelpCircle,
  },
  {
    key: 'other',
    label: 'General Feedback',
    description: 'Any other comments, questions, or beta impressions',
    icon: MessageSquare,
  },
];

const SEVERITY_OPTIONS: { key: BugReportSeverity; label: string; desc: string; badgeColor: string }[] = [
  { key: 'low', label: 'Low', desc: 'Minor cosmetic or typo issue', badgeColor: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  { key: 'medium', label: 'Medium', desc: 'Feature partially working or inconvenient', badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { key: 'high', label: 'High', desc: 'Major feature broken or data not loading', badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { key: 'critical', label: 'Critical', desc: 'Blocking app use or crash', badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
];

export const ReportBugModal: React.FC<ReportBugModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  theme = 'dark',
  currentRoute = typeof window !== 'undefined' ? window.location.pathname : '/',
  initialCategory = 'bug',
}) => {
  const [category, setCategory] = useState<BugReportCategory>(initialCategory);
  const [severity, setSeverity] = useState<BugReportSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab view inside modal: 'new' or 'history'
  const [activeView, setActiveView] = useState<'new' | 'history'>('new');
  const [userReports, setUserReports] = useState<BugReport[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Diagnostics details
  const [diagnostics, setDiagnostics] = useState<{
    browser: string;
    screen: string;
    url: string;
    timestamp: string;
  }>({
    browser: 'Unknown',
    screen: 'Unknown',
    url: currentRoute,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      setDiagnostics({
        browser: ua,
        screen: `${width}x${height} (DPR: ${pixelRatio})`,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
    }
  }, [isOpen, currentUser, currentRoute]);

  // Load user's previous reports when history tab is clicked
  const fetchUserHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const email = currentUser?.email || userEmail;
      const userId = currentUser?.id || 'default';
      const url = `/api/bug-reports?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email || '')}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUserReports(data.reports || []);
      }
    } catch (e) {
      console.error('Failed to load user bug reports history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeView === 'history') {
      fetchUserHistory();
    }
  }, [isOpen, activeView]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a brief title and description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: Partial<BugReport> = {
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      stepsToReproduce: stepsToReproduce.trim() || undefined,
      expectedBehavior: expectedBehavior.trim() || undefined,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest User',
      userEmail: userEmail.trim() || undefined,
      currentRoute: diagnostics.url,
      browserInfo: diagnostics.browser,
      screenResolution: diagnostics.screen,
      status: 'new',
    };

    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to submit bug report');
      }

      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setExpectedBehavior('');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setErrorMessage(err.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(false);
    setErrorMessage(null);
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setCategory('bug');
    setSeverity('medium');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Resolved</span>;
      case 'investigating':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Investigating</span>;
      case 'dismissed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">Dismissed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">New</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] transition-colors ${
          theme === 'light' ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-[#16181E] border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 shrink-0 ${
          theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#111319] border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>
                Beta Feedback & Bug Reporting
              </h2>
              <p className={`text-xs ${theme === 'light' ? 'text-neutral-500' : 'text-slate-400'}`}>
                Help us refine CouchTaterz by reporting defects, oddities, or feature ideas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              theme === 'light'
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200'
                : 'bg-[#222630] hover:bg-[#2e3342] text-slate-300 border-white/5'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className={`px-6 pt-3 border-b flex items-center gap-2 shrink-0 ${
          theme === 'light' ? 'bg-neutral-100/60 border-neutral-200' : 'bg-[#0E1015] border-white/5'
        }`}>
          <button
            type="button"
            onClick={() => { setActiveView('new'); setSubmitSuccess(false); }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition cursor-pointer border-t border-x ${
              activeView === 'new'
                ? theme === 'light'
                  ? 'bg-white text-blue-600 border-neutral-200 border-b-transparent -mb-px'
                  : 'bg-[#16181E] text-blue-400 border-white/10 border-b-transparent -mb-px'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Submit Feedback or Defect
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition cursor-pointer border-t border-x flex items-center gap-1.5 ${
              activeView === 'history'
                ? theme === 'light'
                  ? 'bg-white text-blue-600 border-neutral-200 border-b-transparent -mb-px'
                  : 'bg-[#16181E] text-blue-400 border-white/10 border-b-transparent -mb-px'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>My Submitted Reports</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeView === 'history' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300">Previous Submissions</h3>
                <button
                  onClick={fetchUserHistory}
                  disabled={isLoadingHistory}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Loading your submitted tickets...</span>
                </div>
              ) : userReports.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border ${
                  theme === 'light' ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-[#111319] border-white/5 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-sm font-bold text-slate-300">No reports submitted yet</p>
                  <p className="text-xs text-slate-500 mt-1">If you notice any bugs during your binge sessions, feel free to report them!</p>
                  <button
                    onClick={() => setActiveView('new')}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Submit a Report
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#111319] border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                              {report.category.replace('_', ' ')}
                            </span>
                            <span className="text-slate-600">•</span>
                            {getStatusBadge(report.status)}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              SEVERITY_OPTIONS.find(s => s.key === report.severity)?.badgeColor || 'text-slate-400'
                            }`}>
                              {report.severity.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-200">{report.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{report.description}</p>
                        </div>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {report.adminNotes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                          <span className="font-bold">Admin response: </span>
                          <span>{report.adminNotes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : submitSuccess ? (
            <div className={`p-8 text-center rounded-2xl border ${
              theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
            }`}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-emerald-400">Report Received!</h3>
              <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto">
                Thank you for helping us make CouchTaterz better. The engineering team has received your ticket and diagnostics snapshot.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-white/10"
                >
                  Submit Another Report
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Back to Bingeing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map(opt => {
                    const IconComponent = opt.icon;
                    const isSelected = category === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setCategory(opt.key)}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                            : theme === 'light'
                              ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                              : 'bg-[#111319] hover:bg-[#191c25] border-white/5 text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>{opt.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Level (only for bugs) */}
              {category === 'bug' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SEVERITY_OPTIONS.map(sev => {
                      const isSelected = severity === sev.key;
                      return (
                        <button
                          key={sev.key}
                          type="button"
                          onClick={() => setSeverity(sev.key)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50'
                              : 'bg-[#111319] hover:bg-[#191c25] border-white/5 text-slate-400'
                          }`}
                        >
                          <span className="block text-xs font-bold">{sev.label}</span>
                          <span className="block text-[10px] text-slate-400 truncate mt-0.5">{sev.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Summary Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === 'bug' 
                      ? 'e.g., Episode progress resets when toggling seasons'
                      : category === 'feature_request'
                        ? 'e.g., Add filter by TV rating (PG-13, TV-MA)'
                        : 'e.g., Brief summary of the issue or feedback'
                  }
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    theme === 'light'
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-[#111319] border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, what view you were in, and how to reproduce it..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    theme === 'light'
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-[#111319] border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* Optional Steps to Reproduce */}
              {category === 'bug' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Steps to Reproduce (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      placeholder="1. Click Show Card&#10;2. Edit episode count&#10;3. Click Save"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        theme === 'light'
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                          : 'bg-[#111319] border-white/10 text-white placeholder:text-slate-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Expected Outcome (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={expectedBehavior}
                      onChange={(e) => setExpectedBehavior(e.target.value)}
                      placeholder="What should have happened instead?"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        theme === 'light'
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                          : 'bg-[#111319] border-white/10 text-white placeholder:text-slate-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Contact Email (Optional, for resolution updates)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    theme === 'light'
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-[#111319] border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* Automatic Diagnostics Accordion */}
              <div className={`rounded-xl border overflow-hidden transition ${
                theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#111319] border-white/5'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Auto-Captured Environment Diagnostics</span>
                  </div>
                  {showDiagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDiagnostics && (
                  <div className="px-3.5 pb-3 text-[11px] font-mono text-slate-400 space-y-1 border-t border-white/5 pt-2">
                    <p><span className="text-slate-300 font-bold">User:</span> {currentUser?.name || 'Guest'} ({currentUser?.id || 'guest'})</p>
                    <p><span className="text-slate-300 font-bold">Screen:</span> {diagnostics.screen}</p>
                    <p><span className="text-slate-300 font-bold">Route:</span> {diagnostics.url}</p>
                    <p className="truncate"><span className="text-slate-300 font-bold">Agent:</span> {diagnostics.browser}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    theme === 'light' ? 'hover:bg-neutral-100 text-neutral-600' : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
