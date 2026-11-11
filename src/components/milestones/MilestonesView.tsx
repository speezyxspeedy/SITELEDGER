import React, { useState } from 'react';
import {
  Milestone as MilestoneIcon,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { Milestone, MilestonePriority, MilestoneStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const PRIORITIES: MilestonePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: MilestoneStatus[] = ['NOT STARTED', 'IN PROGRESS', 'COMPLETED', 'DELAYED', 'ON HOLD'];

export const MilestonesView: React.FC = () => {
  const {
    state,
    currentUser,
    addMilestone,
    updateMilestoneProgress,
    calculateWeightedProgress,
  } = useSiteLedger();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    state.selectedProjectId === 'ALL' ? (state.projects[0]?.id || '') : state.selectedProjectId
  );
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [progressModal, setProgressModal] = useState<Milestone | null>(null);
  const [updatedProgressVal, setUpdatedProgressVal] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: state.users[1]?.id || '',
    plannedStart: new Date().toISOString().split('T')[0],
    plannedEnd: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
    plannedProgress: 50,
    actualProgress: 0,
    weight: 15,
    priority: 'HIGH' as MilestonePriority,
    status: 'IN PROGRESS' as MilestoneStatus,
  });

  const currentProject = state.projects.find((p) => p.id === selectedProjectId) || state.projects[0];
  const weighted = calculateWeightedProgress(currentProject?.id || '');

  // Filtered milestones
  const filteredMilestones = state.milestones
    .filter((m) => m.projectId === currentProject?.id)
    .filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(search.toLowerCase())) ||
        (m.assignedToName && m.assignedToName.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
      return matchSearch && matchStatus;
    });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: state.users[1]?.id || '',
      plannedStart: new Date().toISOString().split('T')[0],
      plannedEnd: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      plannedProgress: 50,
      actualProgress: 0,
      weight: 15,
      priority: 'HIGH',
      status: 'NOT STARTED',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenProgressModal = (m: Milestone) => {
    setProgressModal(m);
    setUpdatedProgressVal(m.actualProgress);
  };

  const handleSaveProgress = () => {
    if (!progressModal) return;
    updateMilestoneProgress(progressModal.id, updatedProgressVal);
    setProgressModal(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const assigned = state.users.find((u) => u.id === formData.assignedTo);
    addMilestone({
      ...formData,
      projectId: currentProject.id,
      assignedToName: assigned?.fullName,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MilestoneIcon className="w-6 h-6 text-amber-500" />
            <span>Tasks & Milestones Planning</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gantt schedule tracking with weighted milestone completion derivation and variance alerts
          </p>
        </div>

        {currentUser.role !== 'SITE_ENGINEER' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Milestone</span>
          </button>
        )}
      </div>

      {/* Progress Derivation Summary Banner */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {currentProject?.projectCode}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {currentProject?.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Overall Weighted Progress: Sum of (Milestone Actual % × Weight) ÷ Total Weight ({weighted.totalWeight}%)
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Target Scheduled</span>
            <span className="text-lg font-bold font-mono tabular-nums text-slate-600 dark:text-slate-300">
              {weighted.plannedWeighted}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-medium">Actual Weighted</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {weighted.actualWeighted}%
            </span>
          </div>
        </div>
      </div>

      {/* Project Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
        >
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.projectCode})
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search milestone phase, description, or assigned lead..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Gantt Timeline Style List */}
      <div className="space-y-3">
        {filteredMilestones.map((m) => {
          const isDelayed = m.isDelayed || (m.actualProgress < m.plannedProgress && m.status !== 'COMPLETED');
          const variance = Math.round((m.actualProgress - m.plannedProgress) * 10) / 10;

          return (
            <div
              key={m.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium">
                      Weight: {m.weight}%
                    </span>
                    <StatusBadge status={m.priority} type="priority" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {m.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={m.status} type="milestone" />
                  <button
                    onClick={() => handleOpenProgressModal(m)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Update %</span>
                  </button>
                </div>
              </div>

              {/* Progress Comparison Bar (Gantt style) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Schedule: <strong className="text-slate-700 dark:text-slate-300 font-medium">{m.plannedStart}</strong> to <strong className="text-slate-700 dark:text-slate-300 font-medium">{m.plannedEnd}</strong>
                  </span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-slate-400">Planned: {m.plannedProgress}%</span>
                    <span className="font-bold text-slate-900 dark:text-white">Actual: {m.actualProgress}%</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ({variance >= 0 ? `+${variance}%` : `${variance}%`})
                    </span>
                  </div>
                </div>

                {/* Layered Progress Bar */}
                <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  {/* Planned marker (dashed outline or grey fill) */}
                  <div
                    className="absolute top-0 bottom-0 bg-slate-300 dark:bg-slate-700 opacity-60"
                    style={{ width: `${Math.min(100, m.plannedProgress)}%` }}
                  />
                  {/* Actual completed fill */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
                      m.actualProgress >= 100
                        ? 'bg-emerald-500'
                        : isDelayed
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, m.actualProgress)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Assigned: <strong className="text-slate-600 dark:text-slate-300 font-medium">{m.assignedToName || 'Civil Lead'}</strong></span>
                {m.daysDelayed ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Delayed by ~{m.daysDelayed} days</span>
                  </span>
                ) : (
                  <span>On schedule</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Slider Update Modal */}
      {progressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Milestone Progress
              </h3>
              <button onClick={() => setProgressModal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {progressModal.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target scheduled progress: {progressModal.plannedProgress}%
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Verified Actual Completion:
                </label>
                <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                  {updatedProgressVal}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={updatedProgressVal}
                onChange={(e) => setUpdatedProgressVal(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setProgressModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create Project Milestone Task
              </h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Structural Shear Wall Core Cast"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scope specifications and inspection criteria..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Planned Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.plannedStart}
                    onChange={(e) => setFormData({ ...formData, plannedStart: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Planned End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.plannedEnd}
                    onChange={(e) => setFormData({ ...formData, plannedEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as MilestonePriority })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MilestoneStatus })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Project Manager / Engineer
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
