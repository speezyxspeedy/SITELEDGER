import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Briefcase,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { AttendanceStatus, Worker, WorkerCategory } from '../../types';

const WORKER_CATEGORIES: WorkerCategory[] = [
  'Mason',
  'Carpenter',
  'Electrician',
  'Plumber',
  'Painter',
  'Welder',
  'General Labour',
  'Supervisor',
  'Machine Operator',
  'Other',
];

export const LabourView: React.FC = () => {
  const {
    state,
    currentUser,
    addWorker,
    recordAttendance,
  } = useSiteLedger();

  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(state.sites[0]?.id || '');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    fullName: '',
    category: 'Mason' as WorkerCategory,
    contractorName: 'Direct Workforce',
    dailyWage: 250,
    contactNumber: '',
  });

  const [attendanceMessage, setAttendanceMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get active site's parent project
  const currentSite = state.sites.find((s) => s.id === selectedSiteId) || state.sites[0];
  const currentProjectId = currentSite?.projectId || state.projects[0]?.id || '';

  // Get attendance records for the selected site and date
  const siteAttendance = state.attendance.filter(
    (a) => a.siteId === selectedSiteId && a.attendanceDate === activeDate
  );

  const presentCount = siteAttendance.filter((a) => a.status === 'PRESENT').length;
  const halfDayCount = siteAttendance.filter((a) => a.status === 'HALF DAY').length;
  const absentCount = siteAttendance.filter((a) => a.status === 'ABSENT').length;
  const totalDailyCost = siteAttendance.reduce((sum, a) => sum + (a.dailyCost || 0), 0);

  // Filter workers
  const filteredWorkers = state.workers.filter((w) => {
    const matchSearch =
      w.fullName.toLowerCase().includes(search.toLowerCase()) ||
      w.workerCode.toLowerCase().includes(search.toLowerCase()) ||
      (w.contractorName && w.contractorName.toLowerCase().includes(search.toLowerCase()));

    const matchCat = selectedCategory === 'ALL' || w.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleMarkAttendance = (worker: Worker, status: AttendanceStatus, hours: number = 8) => {
    setAttendanceMessage(null);
    try {
      recordAttendance({
        workerId: worker.id,
        workerName: worker.fullName,
        workerCategory: worker.category,
        contractorName: worker.contractorName,
        projectId: currentProjectId,
        siteId: selectedSiteId,
        attendanceDate: activeDate,
        status,
        workingHours: status === 'ABSENT' || status === 'LEAVE' ? 0 : hours,
        recordedBy: currentUser.id,
      });
      setAttendanceMessage({
        type: 'success',
        text: `Logged ${worker.fullName} as ${status} on ${activeDate}`,
      });
      setTimeout(() => setAttendanceMessage(null), 3000);
    } catch (err: any) {
      setAttendanceMessage({
        type: 'error',
        text: err.message || 'Error recording attendance',
      });
    }
  };

  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerForm.fullName.trim()) return;

    addWorker({
      ...workerForm,
      isActive: true,
    });
    setIsAddWorkerOpen(false);
    setWorkerForm({
      fullName: '',
      category: 'Mason',
      contractorName: 'Direct Workforce',
      dailyWage: 250,
      contactNumber: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Labour Management & Daily Attendance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily workforce deployments, contractor trades, attendance records, and automatic payroll calculations
          </p>
        </div>

        <button
          onClick={() => setIsAddWorkerOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Worker</span>
        </button>
      </div>

      {/* Date & Site Context Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Active Site:
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-white focus:outline-none"
            >
              {state.sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.siteName} ({s.siteCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Attendance Date:
            </label>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Daily Labour Summary Metrics */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Present</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {presentCount + halfDayCount}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            <span className="text-[10px] text-slate-500 block font-medium">Absent</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {absentCount}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">Est. Daily Cost</span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-300 tabular-nums">
              ${totalDailyCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {attendanceMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            attendanceMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span>{attendanceMessage.text}</span>
          <button onClick={() => setAttendanceMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker name, code, or subcontractor..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Trades & Categories</option>
          {WORKER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Workers Roster & Daily Attendance Logger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Worker Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Trade / Category</th>
                <th className="py-3 px-4">Contractor</th>
                <th className="py-3 px-4 text-right">Daily Wage</th>
                <th className="py-3 px-4">Status on {activeDate}</th>
                <th className="py-3 px-4 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredWorkers.map((worker) => {
                const loggedAttendance = siteAttendance.find((a) => a.workerId === worker.id);

                return (
                  <tr key={worker.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {worker.workerCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {worker.fullName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {worker.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {worker.contractorName || 'SiteLedger Direct'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                      ${worker.dailyWage}
                    </td>
                    <td className="py-3 px-4">
                      {loggedAttendance ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              loggedAttendance.status === 'PRESENT'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : loggedAttendance.status === 'HALF DAY'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {loggedAttendance.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({loggedAttendance.workingHours}h · ${loggedAttendance.dailyCost})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Logged</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          disabled={Boolean(loggedAttendance)}
                          onClick={() => handleMarkAttendance(worker, 'PRESENT', 8)}
                          className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                            loggedAttendance?.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white font-bold'
                              : loggedAttendance
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          Present (8h)
                        </button>
                        <button
                          disabled={Boolean(loggedAttendance)}
                          onClick={() => handleMarkAttendance(worker, 'HALF DAY', 4)}
                          className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                            loggedAttendance?.status === 'HALF DAY'
                              ? 'bg-amber-600 text-white font-bold'
                              : loggedAttendance
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          Half (4h)
                        </button>
                        <button
                          disabled={Boolean(loggedAttendance)}
                          onClick={() => handleMarkAttendance(worker, 'ABSENT', 0)}
                          className={`px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                            loggedAttendance?.status === 'ABSENT'
                              ? 'bg-slate-600 text-white font-bold'
                              : loggedAttendance
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Worker Modal */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Register Construction Worker
              </h2>
              <button
                onClick={() => setIsAddWorkerOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorkerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Worker Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={workerForm.fullName}
                  onChange={(e) => setWorkerForm({ ...workerForm, fullName: e.target.value })}
                  placeholder="e.g. Carlos Ramirez"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Skill Trade / Category *
                </label>
                <select
                  value={workerForm.category}
                  onChange={(e) => setWorkerForm({ ...workerForm, category: e.target.value as WorkerCategory })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                >
                  {WORKER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contractor / Firm
                </label>
                <input
                  type="text"
                  value={workerForm.contractorName}
                  onChange={(e) => setWorkerForm({ ...workerForm, contractorName: e.target.value })}
                  placeholder="e.g. Vanguard Masonry Contractors"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Daily Wage ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={workerForm.dailyWage}
                    onChange={(e) => setWorkerForm({ ...workerForm, dailyWage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={workerForm.contactNumber}
                    onChange={(e) => setWorkerForm({ ...workerForm, contactNumber: e.target.value })}
                    placeholder="+1 555-010-0000"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
