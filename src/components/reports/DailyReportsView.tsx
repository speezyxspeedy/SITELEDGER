import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Calendar,
  CloudSun,
  HardHat,
  Truck,
  FileText,
  X,
  AlertTriangle,
  Upload,
  Eye,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { DailyProgressReport, ReportActivity, ReportStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const COMMON_UNITS = [
  'sq ft',
  'm²',
  'm³',
  'm',
  'kg',
  'Tonnes',
  'Bags',
  'Pcs',
  'Units',
  'Hours',
];

const REPORT_STATUSES: ReportStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'NEEDS REVISION',
];

export const DailyReportsView: React.FC<{ initialReportId?: string }> = ({ initialReportId }) => {
  const {
    state,
    currentUser,
    addDailyReport,
    reviewDailyReport,
  } = useSiteLedger();

  const [search, setSearch] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal / Drawer States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<DailyProgressReport | null>(
    () => (initialReportId ? state.dailyReports.find((r) => r.id === initialReportId) || null : null)
  );
  const [reviewActionModal, setReviewActionModal] = useState<{
    report: DailyProgressReport;
    action: 'APPROVE' | 'REJECT' | 'NEEDS_REVISION';
  } | null>(null);

  const [reviewNotes, setReviewNotes] = useState('');

  // Submit DPR Form State
  const [formSiteId, setFormSiteId] = useState<string>(state.sites[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formWeather, setFormWeather] = useState('Clear, 24°C (Sunny)');
  const [formHours, setFormHours] = useState<number>(8.0);
  const [formConditions, setFormConditions] = useState('Normal dry conditions. Access roads open.');
  const [formLabourCount, setFormLabourCount] = useState<number>(18);
  const [formEquipment, setFormEquipment] = useState('Tower Crane #1, Concrete Pump, Telehandler');
  const [formRemarks, setFormRemarks] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('/src/assets/images/site_inspection_concrete_1794412352346.jpg');

  // Multi-activities state
  const [activities, setActivities] = useState<
    { activityName: string; plannedQuantity: number; completedQuantity: number; unit: string; remarks: string }[]
  >([
    {
      activityName: 'Structural Concrete Slab Casting',
      plannedQuantity: 80,
      completedQuantity: 80,
      unit: 'm³',
      remarks: 'Grade C35 with plasticizer, full slump test verified',
    },
    {
      activityName: 'Column Rebar Reinforcement Tie-off',
      plannedQuantity: 15,
      completedQuantity: 12,
      unit: 'Tonnes',
      remarks: 'Tying columns on grid C-E',
    },
  ]);

  const [formError, setFormError] = useState('');

  const filteredReports = state.dailyReports.filter((r) => {
    const matchSearch =
      r.reportCode.toLowerCase().includes(search.toLowerCase()) ||
      r.engineerName.toLowerCase().includes(search.toLowerCase()) ||
      (r.remarks && r.remarks.toLowerCase().includes(search.toLowerCase())) ||
      r.reportDate.includes(search);

    const matchSite = selectedSiteId === 'ALL' || r.siteId === selectedSiteId;
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchSearch && matchSite && matchStatus;
  });

  const handleAddActivityRow = () => {
    setActivities([
      ...activities,
      { activityName: '', plannedQuantity: 100, completedQuantity: 0, unit: 'sq ft', remarks: '' },
    ]);
  };

  const handleRemoveActivityRow = (index: number) => {
    if (activities.length === 1) return;
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleActivityChange = (index: number, field: string, value: any) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const handleOpenSubmitModal = () => {
    setFormSiteId(state.sites[0]?.id || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormWeather('Clear, 24°C (Sunny)');
    setFormHours(8.0);
    setFormConditions('Dry ground conditions.');
    setFormLabourCount(18);
    setFormEquipment('Tower Crane, Excavator, Boom Pump');
    setFormRemarks('');
    setFormError('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitDPR = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetSite = state.sites.find((s) => s.id === formSiteId);
    if (!targetSite) {
      setFormError('Please select a valid construction site.');
      return;
    }

    if (activities.length === 0 || activities.some((a) => !a.activityName.trim())) {
      setFormError('Please provide descriptions for all recorded activities.');
      return;
    }

    try {
      addDailyReport({
        projectId: targetSite.projectId,
        siteId: targetSite.id,
        reportDate: formDate,
        weather: formWeather,
        workingHours: formHours,
        siteConditions: formConditions,
        labourCount: formLabourCount,
        equipmentUsed: formEquipment,
        remarks: formRemarks,
        activities,
        photographicEvidence: formPhotoUrl ? [formPhotoUrl] : [],
      });
      setIsSubmitModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error submitting report');
    }
  };

  const handleConfirmReview = () => {
    if (!reviewActionModal) return;
    try {
      reviewDailyReport(
        reviewActionModal.report.id,
        reviewActionModal.action,
        reviewNotes
      );
      if (viewingReport?.id === reviewActionModal.report.id) {
        setViewingReport({
          ...viewingReport,
          status: reviewActionModal.action === 'APPROVE' ? 'APPROVED' : reviewActionModal.action === 'REJECT' ? 'REJECTED' : 'NEEDS REVISION',
          reviewedByName: currentUser.fullName,
          reviewNotes,
        });
      }
      setReviewActionModal(null);
      setReviewNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-amber-500" />
            <span>Daily Progress Reports (DPR)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Core civil engineering workflow: record planned vs actual quantities, weather, labour deployment, and photographic logs
          </p>
        </div>

        <button
          onClick={handleOpenSubmitModal}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Report</span>
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
            placeholder="Search report code, engineer, date, or remarks..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {REPORT_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DPR Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Report Code</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Site & Project</th>
                <th className="py-3 px-4">Engineer</th>
                <th className="py-3 px-4">Labour</th>
                <th className="py-3 px-4">Activities</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No Daily Progress Reports found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {report.reportCode}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {report.reportDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {report.siteName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {report.projectName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {report.engineerName}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {report.labourCount} men
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {report.activities.length} logged
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.status} type="report" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingReport(report)}
                          className="px-2.5 py-1 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                          title="View Full Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {(currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER') &&
                          report.status === 'SUBMITTED' && (
                            <button
                              onClick={() => setReviewActionModal({ report, action: 'APPROVE' })}
                              className="px-2 py-1 font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                            >
                              Review
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full DPR View / Print Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {viewingReport.reportCode}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Daily Progress Report — {viewingReport.reportDate}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable DPR Content */}
            <div className="p-6 space-y-6 text-xs print-container">
              {/* Report Header Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[11px]">Project</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewingReport.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Construction Site</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewingReport.siteName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reporting Engineer</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewingReport.engineerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Report Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={viewingReport.status} type="report" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Weather & Temp</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{viewingReport.weather}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Working Hours</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    {viewingReport.workingHours} hrs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Labour On Site</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    {viewingReport.labourCount} workers
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Site Conditions</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate block">
                    {viewingReport.siteConditions || 'Normal'}
                  </span>
                </div>
              </div>

              {/* Equipment Used */}
              {viewingReport.equipmentUsed && (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                    Major Equipment Deployed
                  </span>
                  <p className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingReport.equipmentUsed}
                  </p>
                </div>
              )}

              {/* Completed Work Activities Table */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">
                  Daily Work Activities & Measured Quantities
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Activity Description</th>
                        <th className="py-2.5 px-3 text-right">Planned Qty</th>
                        <th className="py-2.5 px-3 text-right">Completed Qty</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 text-right">Completion %</th>
                        <th className="py-2.5 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {viewingReport.activities.map((act) => {
                        const exceedsPlanned = act.completedQuantity > act.plannedQuantity;
                        return (
                          <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                              {act.activityName}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                              {act.plannedQuantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                              {act.completedQuantity}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                              {act.unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              <span
                                className={`font-bold ${
                                  act.progressPercentage >= 100
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {act.progressPercentage}%
                              </span>
                              {exceedsPlanned && (
                                <span className="ml-1 text-[10px] text-amber-500" title="Exceeds planned amount">
                                  ▲
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 italic">
                              {act.remarks || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Remarks */}
              {viewingReport.remarks && (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                    Engineer Site Remarks
                  </span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {viewingReport.remarks}
                  </p>
                </div>
              )}

              {/* Photographic Evidence */}
              {viewingReport.photographicEvidence && viewingReport.photographicEvidence.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-2">
                    Site Photographic Evidence
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingReport.photographicEvidence.map((imgUrl, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img
                          src={imgUrl}
                          alt="Site inspection photo"
                          className="w-full h-44 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400 text-center">
                          Inspection photo #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Audit Sign-off */}
              {viewingReport.reviewedByName && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Audited by {viewingReport.reviewedByName}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Review Note: {viewingReport.reviewNotes || 'Approved without amendments'}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {viewingReport.reviewedAt ? new Date(viewingReport.reviewedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
              <div>
                {(currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER') &&
                  viewingReport.status === 'SUBMITTED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReviewActionModal({ report: viewingReport, action: 'APPROVE' })}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"
                      >
                        Approve DPR
                      </button>
                      <button
                        onClick={() => setReviewActionModal({ report: viewingReport, action: 'NEEDS_REVISION' })}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={() => setReviewActionModal({ report: viewingReport, action: 'REJECT' })}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit New DPR Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Submit Daily Progress Report (DPR)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Logged by: {currentUser.fullName} ({currentUser.role.replace('_', ' ')})
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDPR} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Construction Site *
                  </label>
                  <select
                    required
                    value={formSiteId}
                    onChange={(e) => setFormSiteId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    {state.sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.siteName} ({s.siteCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Report Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Weather Conditions *
                  </label>
                  <input
                    type="text"
                    required
                    value={formWeather}
                    onChange={(e) => setFormWeather(e.target.value)}
                    placeholder="e.g. Sunny 28°C, Rain delay"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Working Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Labour Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formLabourCount}
                    onChange={(e) => setFormLabourCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Equipment Deployed
                </label>
                <input
                  type="text"
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                  placeholder="e.g. Tower Crane #1, Concrete Boom Pump, 2x Compactors"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              {/* Multi Activity Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900 dark:text-white text-xs">
                    Work Activities & Measured Quantities
                  </label>
                  <button
                    type="button"
                    onClick={handleAddActivityRow}
                    className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {activities.map((act, index) => {
                    const pct = act.plannedQuantity > 0 ? (act.completedQuantity / act.plannedQuantity) * 100 : 0;
                    return (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Activity #{index + 1}
                          </span>
                          {activities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveActivityRow(index)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              required
                              placeholder="Activity description (e.g. Brickwork)"
                              value={act.activityName}
                              onChange={(e) => handleActivityChange(index, 'activityName', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="0"
                              placeholder="Planned Qty"
                              value={act.plannedQuantity}
                              onChange={(e) => handleActivityChange(index, 'plannedQuantity', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono tabular-nums"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="0"
                              placeholder="Completed Qty"
                              value={act.completedQuantity}
                              onChange={(e) => handleActivityChange(index, 'completedQuantity', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono tabular-nums"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <select
                              value={act.unit}
                              onChange={(e) => handleActivityChange(index, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                            >
                              {COMMON_UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="Remarks (e.g. cavity insulation inspected)"
                              value={act.remarks}
                              onChange={(e) => handleActivityChange(index, 'remarks', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                            />
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 pl-2 shrink-0">
                              {Math.round(pct)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  General Remarks & Issues
                </label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Notes on progress, delays, inspection results..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Attach Site Photo (Camera / Staging)
                </label>
                <input
                  type="text"
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  placeholder="Photo URL or local capture path"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs"
                >
                  Submit Daily Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {reviewActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {reviewActionModal.action === 'APPROVE'
                ? 'Approve Daily Progress Report'
                : reviewActionModal.action === 'REJECT'
                ? 'Reject Daily Progress Report'
                : 'Request Revision for DPR'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Report Code: <strong className="text-slate-800 dark:text-slate-200">{reviewActionModal.report.reportCode}</strong>
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Review Notes / Verification Remarks
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Quantities verified against batch concrete tickets. Approved."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewActionModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                className={`px-3 py-1.5 text-xs font-semibold rounded text-white ${
                  reviewActionModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : reviewActionModal.action === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Confirm {reviewActionModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
