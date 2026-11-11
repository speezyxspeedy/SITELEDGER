import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  FileText,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { IssueCategory, IssuePriority, IssueStatus, SiteIssue } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const ISSUE_CATEGORIES: IssueCategory[] = [
  'Material Shortage',
  'Labour Shortage',
  'Equipment Breakdown',
  'Weather Delay',
  'Design Clarification',
  'Quality Issue',
  'Safety Concern',
  'Transportation Issue',
  'Other',
];

const PRIORITIES: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: IssueStatus[] = ['OPEN', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'];

export const SiteIssuesView: React.FC = () => {
  const {
    state,
    currentUser,
    addSiteIssue,
    updateSiteIssueStatus,
  } = useSiteLedger();

  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [resolveModal, setResolveModal] = useState<{ issue: SiteIssue; targetStatus: IssueStatus } | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [resolveError, setResolveError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    siteId: state.sites[0]?.id || '',
    title: '',
    description: '',
    category: 'Equipment Breakdown' as IssueCategory,
    priority: 'HIGH' as IssuePriority,
    assignedTo: state.users[1]?.id || '',
    targetDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    photographicEvidence: '',
  });

  const [formError, setFormError] = useState('');

  const filteredIssues = state.siteIssues.filter((i) => {
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.issueCode.toLowerCase().includes(search.toLowerCase());

    const matchSite = selectedSiteId === 'ALL' || i.siteId === selectedSiteId;
    const matchCat = selectedCategory === 'ALL' || i.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || i.status === selectedStatus;

    return matchSearch && matchSite && matchCat && matchStatus;
  });

  const handleOpenReport = () => {
    setFormData({
      siteId: state.sites[0]?.id || '',
      title: '',
      description: '',
      category: 'Equipment Breakdown',
      priority: 'HIGH',
      assignedTo: state.users[1]?.id || '',
      targetDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      photographicEvidence: '',
    });
    setFormError('');
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Please enter issue title and detailed description.');
      return;
    }

    const targetSite = state.sites.find((s) => s.id === formData.siteId);
    if (!targetSite) {
      setFormError('Select a valid construction site.');
      return;
    }

    const assigned = state.users.find((u) => u.id === formData.assignedTo);

    try {
      addSiteIssue({
        projectId: targetSite.projectId,
        siteId: targetSite.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        reportedBy: currentUser.id,
        reportedByName: currentUser.fullName,
        assignedTo: formData.assignedTo,
        assignedToName: assigned?.fullName,
        targetDate: formData.targetDate,
        photographicEvidence: formData.photographicEvidence ? [formData.photographicEvidence] : [],
      });
      setIsReportModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error logging issue');
    }
  };

  const handleOpenResolve = (issue: SiteIssue, targetStatus: IssueStatus) => {
    setResolveModal({ issue, targetStatus });
    setResolutionNoteInput(issue.resolutionNotes || '');
    setResolveError('');
  };

  const handleConfirmResolve = () => {
    if (!resolveModal) return;
    setResolveError('');

    // Strict validation: Resolution note required before marking Resolved or Closed
    if (
      (resolveModal.targetStatus === 'RESOLVED' || resolveModal.targetStatus === 'CLOSED') &&
      !resolutionNoteInput.trim()
    ) {
      setResolveError('Mandatory Requirement: A clear resolution note is required before marking an issue as Resolved or Closed.');
      return;
    }

    try {
      updateSiteIssueStatus(
        resolveModal.issue.id,
        resolveModal.targetStatus,
        resolutionNoteInput
      );
      setResolveModal(null);
    } catch (err: any) {
      setResolveError(err.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            <span>Site Issues & Quality Non-Conformance Log</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Report breakdowns, design clarifications, and shortages with photographic evidence and mandatory resolution trails
          </p>
        </div>

        <button
          onClick={handleOpenReport}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Site Problem</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issue title, code, or description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Sites</option>
          {state.sites.map((s) => (
            <option key={s.id} value={s.id}>{s.siteName}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          {ISSUE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {STATUSES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Issues Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.map((issue) => {
          const site = state.sites.find((s) => s.id === issue.siteId);

          return (
            <div
              key={issue.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {issue.issueCode}
                      </span>
                      <StatusBadge status={issue.priority} type="priority" />
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{issue.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {issue.title}
                    </h3>
                  </div>
                  <StatusBadge status={issue.status} type="issue" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {issue.description}
                </p>

                {/* Photographic Evidence Attachment */}
                {issue.photographicEvidence && issue.photographicEvidence.length > 0 && (
                  <div className="mt-3">
                    <img
                      src={issue.photographicEvidence[0]}
                      alt="Site problem evidence"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Resolution Notes Block if present */}
                {issue.resolutionNotes && (
                  <div className="mt-3 p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 block text-[11px]">
                      Documented Resolution Notes:
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200 mt-0.5">
                      {issue.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer info & resolution buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                <div>
                  <span>Site: <strong className="text-slate-600 dark:text-slate-300 font-medium">{site?.siteName || 'Site'}</strong></span>
                  <span className="mx-1.5">·</span>
                  <span>Assigned: <strong className="text-slate-600 dark:text-slate-300 font-medium">{issue.assignedToName || 'Unassigned'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
                    <>
                      <button
                        onClick={() => handleOpenResolve(issue, 'IN PROGRESS')}
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-medium"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleOpenResolve(issue, 'RESOLVED')}
                        className="px-2.5 py-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 rounded font-semibold border border-emerald-300 dark:border-emerald-800"
                      >
                        Resolve Issue
                      </button>
                    </>
                  )}
                  {issue.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleOpenResolve(issue, 'CLOSED')}
                      className="px-2.5 py-1 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded font-semibold"
                    >
                      Close Issue
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Resolution Note Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Status to {resolveModal.targetStatus}
              </h3>
              <button onClick={() => setResolveModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Issue: <strong className="text-slate-900 dark:text-white">{resolveModal.issue.title}</strong>
            </p>

            {resolveError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded border border-rose-200 text-xs">
                {resolveError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resolution Notes & Corrective Actions Taken *
              </label>
              <textarea
                rows={4}
                required
                value={resolutionNoteInput}
                onChange={(e) => setResolutionNoteInput(e.target.value)}
                placeholder="Explain the technical resolution, certified contractor fixes, or inspection approval..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required audit trail record before finalizing status.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setResolveModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report New Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Report Site Issue / Non-Conformance
              </h2>
              <button onClick={() => setIsReportModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Construction Site *
                </label>
                <select
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                >
                  {state.sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.siteName} ({s.siteCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Scaffolding anchor bolts missing on West elevation"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IssueCategory })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {ISSUE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as IssuePriority })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description & Hazards *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe location, affected trades, and immediate stoppage constraints..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Person
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {state.users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Resolution Date
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Photographic Evidence URL
                </label>
                <input
                  type="text"
                  value={formData.photographicEvidence}
                  onChange={(e) => setFormData({ ...formData, photographicEvidence: e.target.value })}
                  placeholder="/src/assets/images/site_skyline_commercial_1794412319370.jpg"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded"
                >
                  File Site Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
