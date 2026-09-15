/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bug, Sparkles, HelpCircle, MessageSquare, Search, Filter, 
  RefreshCw, CheckCircle2, Clock, Trash2, Save, Copy, Check,
  AlertCircle, ChevronDown, ChevronUp, User, Monitor, ExternalLink, ShieldCheck
} from 'lucide-react';
import { BugReport, BugReportCategory, BugReportSeverity, BugReportStatus } from '../types';

interface BugReportsTabProps {
  currentUser: { id: string; name: string; email?: string };
  theme?: 'dark' | 'light';
  onInspectUserLibrary?: (userId: string) => void;
}

const CATEGORY_ICONS: Record<BugReportCategory, React.ComponentType<{ className?: string }>> = {
  bug: Bug,
  feature_request: Sparkles,
  ui_confusing: HelpCircle,
  other: MessageSquare,
};

export const BugReportsTab: React.FC<BugReportsTabProps> = ({
  currentUser,
  theme = 'dark',
  onInspectUserLibrary,
}) => {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Expanded report card IDs
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Editing state for admin notes
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = currentUser.email || '';
      const userId = currentUser.id || 'default';
      const res = await fetch(`/api/bug-reports?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setReports(data.reports || []);

      // Initialize admin notes
      const notes: Record<string, string> = {};
      (data.reports || []).forEach((r: BugReport) => {
        if (r.adminNotes) notes[r.id] = r.adminNotes;
      });
      setAdminNotesMap(notes);
    } catch (err: any) {
      console.error('Error fetching bug reports:', err);
      setError(err.message || 'Failed to fetch bug reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateStatus = async (reportId: string, newStatus: BugReportStatus) => {
    try {
      // Optimistic update
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));

      const res = await fetch(`/api/bug-reports/${reportId}?email=${encodeURIComponent(currentUser.email || '')}&userId=${encodeURIComponent(currentUser.id || '')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotesMap[reportId] || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }
    } catch (err) {
      console.error('Error updating report status:', err);
      fetchReports();
    }
  };

  const handleSaveNotes = async (reportId: string) => {
    setSavingNoteId(reportId);
    try {
      const notes = adminNotesMap[reportId] || '';
      const res = await fetch(`/api/bug-reports/${reportId}?email=${encodeURIComponent(currentUser.email || '')}&userId=${encodeURIComponent(currentUser.id || '')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to save notes');

      setReports(prev => prev.map(r => r.id === reportId ? { ...r, adminNotes: notes } : r));
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;

    try {
      setReports(prev => prev.filter(r => r.id !== reportId));
      await fetch(`/api/bug-reports/${reportId}?email=${encodeURIComponent(currentUser.email || '')}&userId=${encodeURIComponent(currentUser.id || '')}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      fetchReports();
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesUser = (r.userName || '').toLowerCase().includes(q) || (r.userEmail || '').toLowerCase().includes(q);
        const matchesRoute = (r.currentRoute || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesUser && !matchesRoute) return false;
      }
      return true;
    });
  }, [reports, statusFilter, categoryFilter, severityFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = reports.length;
    const newCount = reports.filter(r => r.status === 'new').length;
    const investigatingCount = reports.filter(r => r.status === 'investigating').length;
    const resolvedCount = reports.filter(r => r.status === 'resolved').length;
    const bugsCount = reports.filter(r => r.category === 'bug').length;
    const featuresCount = reports.filter(r => r.category === 'feature_request').length;
    return { total, newCount, investigatingCount, resolvedCount, bugsCount, featuresCount };
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* Metric Counters Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border transition ${
          theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#12141A] border-white/5'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Tickets</span>
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{stats.bugsCount} defects, {stats.featuresCount} features</p>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          theme === 'light' ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/20 border-blue-500/20'
        }`}>
          <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase tracking-wider">
            <span>New Submissions</span>
            <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 mt-1">{stats.newCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting investigation</p>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          theme === 'light' ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-500/20'
        }`}>
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>Investigating</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.investigatingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">In progress / troubleshooting</p>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          theme === 'light' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/20'
        }`}>
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span>Resolved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.resolvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified & deployed fixes</p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#12141A] border-white/5'
      }`}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, user, or route..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              theme === 'light' ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#181B22] border-white/10 text-white placeholder:text-slate-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'light' ? 'bg-white border-neutral-300 text-neutral-800' : 'bg-[#181B22] border-white/10 text-slate-300'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'light' ? 'bg-white border-neutral-300 text-neutral-800' : 'bg-[#181B22] border-white/10 text-slate-300'
            }`}
          >
            <option value="all">All Categories</option>
            <option value="bug">Defects</option>
            <option value="feature_request">Feature Requests</option>
            <option value="ui_confusing">UI / UX</option>
            <option value="other">General Feedback</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchReports}
            disabled={loading}
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              theme === 'light' ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700' : 'bg-[#181B22] hover:bg-[#222630] border-white/10 text-slate-300'
            }`}
            title="Refresh bug reports list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span>Loading feedback & bug tickets...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-[#12141A] border-white/5'
        }`}>
          <CheckCircle2 className="w-10 h-10 mx-auto text-slate-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-300">No tickets found</h4>
          <p className="text-xs text-slate-500 mt-1">No bug reports match the selected filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const IconComponent = CATEGORY_ICONS[report.category] || Bug;
            const isExpanded = expandedId === report.id;

            return (
              <div
                key={report.id}
                className={`rounded-2xl border transition-all ${
                  theme === 'light' ? 'bg-white border-neutral-200' : 'bg-[#14161D] border-white/10'
                } ${isExpanded ? 'ring-1 ring-blue-500/40' : ''}`}
              >
                {/* Collapsed Header Bar */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      report.category === 'bug'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        : report.category === 'feature_request'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                          : report.category === 'ui_confusing'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10.5px] font-mono font-black uppercase text-slate-400">
                          {report.category.replace('_', ' ')}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          report.severity === 'critical'
                            ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                            : report.severity === 'high'
                              ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
                              : report.severity === 'medium'
                                ? 'text-blue-400 bg-blue-500/15 border-blue-500/30'
                                : 'text-slate-400 bg-slate-500/15 border-slate-500/30'
                        }`}>
                          {report.severity}
                        </span>

                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400">
                          by <span className="text-slate-200 font-bold">{report.userName || 'Guest'}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">{report.title}</h4>
                      <p className={`text-xs text-slate-400 mt-1 line-clamp-2 ${isExpanded ? 'hidden' : ''}`}>
                        {report.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Status Selector & Expand */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <select
                      value={report.status}
                      onChange={(e) => handleUpdateStatus(report.id, e.target.value as BugReportStatus)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                        report.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : report.status === 'investigating'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : report.status === 'dismissed'
                              ? 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 transition cursor-pointer border border-transparent hover:border-white/10"
                      title={isExpanded ? 'Collapse' : 'Expand diagnostics and details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 sm:px-5 space-y-4 border-t border-white/5 mt-1">
                    {/* Full Description */}
                    <div>
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                        Report Description
                      </h5>
                      <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {report.description}
                      </div>
                    </div>

                    {/* Steps to Reproduce / Expected Behavior */}
                    {(report.stepsToReproduce || report.expectedBehavior) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.stepsToReproduce && (
                          <div>
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                              Steps to Reproduce
                            </h5>
                            <div className="p-3 rounded-xl bg-[#0E1015] border border-white/5 text-xs text-slate-300 whitespace-pre-wrap font-mono text-[11px]">
                              {report.stepsToReproduce}
                            </div>
                          </div>
                        )}
                        {report.expectedBehavior && (
                          <div>
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                              Expected Behavior
                            </h5>
                            <div className="p-3 rounded-xl bg-[#0E1015] border border-white/5 text-xs text-slate-300 whitespace-pre-wrap font-mono text-[11px]">
                              {report.expectedBehavior}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submitter & Technical Diagnostics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Submitter Info */}
                      <div className="p-3 rounded-xl bg-[#0E1015] border border-white/5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            Submitter Info
                          </span>
                          {report.userId && onInspectUserLibrary && (
                            <button
                              type="button"
                              onClick={() => onInspectUserLibrary(report.userId!)}
                              className="text-blue-400 hover:text-blue-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Library</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-200 font-bold">{report.userName || 'Guest'}</p>
                        {report.userEmail && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Email: {report.userEmail}</span>
                            <button
                              onClick={() => handleCopy(report.userEmail!, `email_${report.id}`)}
                              className="hover:text-blue-400 transition"
                              title="Copy email"
                            >
                              {copiedKey === `email_${report.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 font-mono">User ID: {report.userId}</p>
                      </div>

                      {/* Client Environment Diagnostics */}
                      <div className="p-3 rounded-xl bg-[#0E1015] border border-white/5 text-xs space-y-1 font-mono text-[11px] text-slate-400">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase font-sans">
                          <span className="flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                            Diagnostics
                          </span>
                          <span className="text-[10px] font-normal text-slate-500">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="truncate"><span className="text-slate-300">Route:</span> {report.currentRoute || 'N/A'}</p>
                        <p><span className="text-slate-300">Screen:</span> {report.screenResolution || 'N/A'}</p>
                        <p className="truncate" title={report.browserInfo}><span className="text-slate-300">Agent:</span> {report.browserInfo || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Admin Response & Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          Admin Resolution Notes (Visible to User in their History tab)
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={adminNotesMap[report.id] || ''}
                          onChange={(e) => setAdminNotesMap(prev => ({ ...prev, [report.id]: e.target.value }))}
                          placeholder="e.g., Fixed in v1.4.2 patch. Thanks for the catch!"
                          className={`flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            theme === 'light' ? 'bg-neutral-50 border-neutral-300 text-neutral-900' : 'bg-[#0E1015] border-white/10 text-white placeholder:text-slate-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(report.id)}
                          disabled={savingNoteId === report.id}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingNoteId === report.id ? 'Saving...' : 'Save Note'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Actions: Delete Ticket */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-500">
                      <span>Ticket ID: <span className="font-mono">{report.id}</span></span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-rose-400 hover:text-rose-300 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Ticket</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
