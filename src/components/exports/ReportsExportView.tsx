import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  HardHat,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';

type ReportType =
  | 'DPR_SUMMARY'
  | 'LABOUR_ATTENDANCE'
  | 'MATERIAL_CONSUMPTION'
  | 'EXPENSES_BUDGET'
  | 'MILESTONE_PROGRESS'
  | 'SITE_ISSUES';

export const ReportsExportView: React.FC = () => {
  const { state, currentUser, kpis, getMaterialStockBalance } = useSiteLedger();

  const [reportType, setReportType] = useState<ReportType>('DPR_SUMMARY');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(state.projects[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const currentProject = state.projects.find((p) => p.id === selectedProjectId) || state.projects[0];
  const projectSites = state.sites.filter((s) => s.projectId === currentProject?.id);

  // Generate CSV Download
  const handleDownloadCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `SiteLedger_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'DPR_SUMMARY') {
      headers = ['Report Code', 'Date', 'Site', 'Engineer', 'Labour Count', 'Working Hours', 'Weather', 'Status'];
      rows = state.dailyReports.map((r) => [
        r.reportCode,
        r.reportDate,
        `"${r.siteName || ''}"`,
        `"${r.engineerName}"`,
        r.labourCount.toString(),
        r.workingHours.toString(),
        `"${r.weather}"`,
        r.status,
      ]);
    } else if (reportType === 'LABOUR_ATTENDANCE') {
      headers = ['Date', 'Worker Code', 'Worker Name', 'Category', 'Contractor', 'Status', 'Hours', 'Daily Cost ($)'];
      rows = state.attendance.map((a) => [
        a.attendanceDate,
        a.workerId,
        `"${a.workerName}"`,
        a.workerCategory,
        `"${a.contractorName || ''}"`,
        a.status,
        a.workingHours.toString(),
        a.dailyCost.toString(),
      ]);
    } else if (reportType === 'MATERIAL_CONSUMPTION') {
      headers = ['Date', 'Commodity', 'Category', 'Type', 'Quantity', 'Unit', 'Total Cost ($)', 'Supplier/Notes'];
      rows = state.materialTransactions.map((t) => [
        t.transactionDate,
        `"${t.materialName || ''}"`,
        t.materialCategory || '',
        t.transactionType,
        t.quantity.toString(),
        t.unit || '',
        t.totalCost.toString(),
        `"${t.supplier || t.notes || ''}"`,
      ]);
    } else if (reportType === 'EXPENSES_BUDGET') {
      headers = ['Expense Code', 'Date', 'Category', 'Description', 'Vendor', 'Amount ($)', 'Payment Status', 'Approval Status'];
      rows = state.expenses.map((e) => [
        e.expenseCode,
        e.expenseDate,
        e.category,
        `"${e.description}"`,
        `"${e.vendor}"`,
        e.amount.toString(),
        e.paymentStatus,
        e.approvalStatus,
      ]);
    } else if (reportType === 'MILESTONE_PROGRESS') {
      headers = ['Title', 'Priority', 'Planned Start', 'Planned End', 'Planned %', 'Actual %', 'Weight %', 'Status'];
      rows = state.milestones.map((m) => [
        `"${m.title}"`,
        m.priority,
        m.plannedStart,
        m.plannedEnd,
        m.plannedProgress.toString(),
        m.actualProgress.toString(),
        m.weight.toString(),
        m.status,
      ]);
    } else if (reportType === 'SITE_ISSUES') {
      headers = ['Issue Code', 'Title', 'Category', 'Priority', 'Status', 'Reported By', 'Assigned To', 'Resolution Notes'];
      rows = state.siteIssues.map((i) => [
        i.issueCode,
        `"${i.title}"`,
        i.category,
        i.priority,
        i.status,
        `"${i.reportedByName || ''}"`,
        `"${i.assignedToName || ''}"`,
        `"${i.resolutionNotes || ''}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate JSON Download
  const handleDownloadJSON = () => {
    let data: any = {};
    if (reportType === 'DPR_SUMMARY') data = state.dailyReports;
    else if (reportType === 'LABOUR_ATTENDANCE') data = state.attendance;
    else if (reportType === 'MATERIAL_CONSUMPTION') data = state.materialTransactions;
    else if (reportType === 'EXPENSES_BUDGET') data = state.expenses;
    else if (reportType === 'MILESTONE_PROGRESS') data = state.milestones;
    else if (reportType === 'SITE_ISSUES') data = state.siteIssues;

    const payload = {
      reportType,
      project: currentProject?.name,
      generatedAt: new Date().toISOString(),
      preparedBy: currentUser.fullName,
      recordsCount: data.length,
      records: data,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `SiteLedger_${reportType}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            <span>Formal Construction Report Generation & Exports</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate auditor-grade construction operation reports, printable dossiers, CSV ledgers, and JSON archives
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Report Configuration Selector */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
          >
            <option value="DPR_SUMMARY">Daily Progress Reports (DPR)</option>
            <option value="LABOUR_ATTENDANCE">Labour Attendance & Cost Report</option>
            <option value="MATERIAL_CONSUMPTION">Material Consumption & Stock Report</option>
            <option value="EXPENSES_BUDGET">Project Expense & Budget Audit</option>
            <option value="MILESTONE_PROGRESS">Milestone Progress & Variances</option>
            <option value="SITE_ISSUES">Site Issues & Non-Conformance Report</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Target Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
          >
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Printable Report Document Surface */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs print-container">
        {/* Document Header Lockup */}
        <div className="border-b-2 border-slate-900 dark:border-white pb-5 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                SiteLedger Operations Ledger
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                CERTIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contractor Project Operations Management Platform · Certified Site Record
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="text-slate-400">Document Generated:</p>
            <p className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {new Date().toLocaleString()}
            </p>
            <p className="text-slate-400">Prepared By: {currentUser.fullName} ({currentUser.role.replace('_', ' ')})</p>
          </div>
        </div>

        {/* Project Context Box */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Project Name</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentProject?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Project Code</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">{currentProject?.projectCode}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Client Organization</span>
            <span className="font-medium text-slate-900 dark:text-white">{currentProject?.clientName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Location</span>
            <span className="font-medium text-slate-900 dark:text-white">{currentProject?.city}, {currentProject?.state}</span>
          </div>
        </div>

        {/* Dynamic Report Content Table */}
        {reportType === 'DPR_SUMMARY' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Progress Reports (DPR) Summary Records
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">Report Code</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Site Name</th>
                  <th className="p-2.5">Engineer</th>
                  <th className="p-2.5 text-right">Labour</th>
                  <th className="p-2.5 text-right">Hours</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {state.dailyReports.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2.5 font-mono font-bold">{r.reportCode}</td>
                    <td className="p-2.5">{r.reportDate}</td>
                    <td className="p-2.5">{r.siteName}</td>
                    <td className="p-2.5">{r.engineerName}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{r.labourCount}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{r.workingHours}h</td>
                    <td className="p-2.5 font-semibold">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'LABOUR_ATTENDANCE' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Labour Deployment & Payout Log
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Worker Name</th>
                  <th className="p-2.5">Trade Category</th>
                  <th className="p-2.5">Contractor</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Hours</th>
                  <th className="p-2.5 text-right">Cost ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {state.attendance.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2.5">{a.attendanceDate}</td>
                    <td className="p-2.5 font-semibold">{a.workerName}</td>
                    <td className="p-2.5">{a.workerCategory}</td>
                    <td className="p-2.5">{a.contractorName || 'SiteLedger Direct'}</td>
                    <td className="p-2.5 font-medium">{a.status}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{a.workingHours}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums font-bold">${a.dailyCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'MATERIAL_CONSUMPTION' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Material Transactions & Site Consumption Ledger
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Commodity</th>
                  <th className="p-2.5 text-right">Quantity</th>
                  <th className="p-2.5 text-right">Total Cost ($)</th>
                  <th className="p-2.5">Supplier / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {state.materialTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2.5">{t.transactionDate}</td>
                    <td className="p-2.5 font-bold">{t.transactionType}</td>
                    <td className="p-2.5 font-medium">{t.materialName}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums font-bold">
                      {t.transactionType === 'RECEIPT' ? `+${t.quantity}` : `-${t.quantity}`} {t.unit}
                    </td>
                    <td className="p-2.5 text-right font-mono tabular-nums">${t.totalCost.toLocaleString()}</td>
                    <td className="p-2.5">{t.supplier || t.invoiceReference || 'Site usage'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'EXPENSES_BUDGET' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Expenses & Budget Ledger
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">Code</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Vendor</th>
                  <th className="p-2.5 text-right">Amount ($)</th>
                  <th className="p-2.5">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {state.expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="p-2.5 font-mono font-bold">{e.expenseCode}</td>
                    <td className="p-2.5">{e.expenseDate}</td>
                    <td className="p-2.5">{e.category}</td>
                    <td className="p-2.5 font-medium">{e.description}</td>
                    <td className="p-2.5">{e.vendor}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums font-bold">${e.amount.toLocaleString()}</td>
                    <td className="p-2.5 font-semibold">{e.approvalStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'MILESTONE_PROGRESS' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Milestone Progress & Schedule Status
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">Milestone Title</th>
                  <th className="p-2.5">Planned End</th>
                  <th className="p-2.5 text-right">Weight</th>
                  <th className="p-2.5 text-right">Planned %</th>
                  <th className="p-2.5 text-right">Actual %</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {state.milestones.map((m) => (
                  <tr key={m.id}>
                    <td className="p-2.5 font-bold">{m.title}</td>
                    <td className="p-2.5">{m.plannedEnd}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{m.weight}%</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">{m.plannedProgress}%</td>
                    <td className="p-2.5 text-right font-mono tabular-nums font-bold">{m.actualProgress}%</td>
                    <td className="p-2.5 font-semibold">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'SITE_ISSUES' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Site Issues & Quality Non-Conformance Log
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-2.5">Issue Code</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Resolution Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {state.siteIssues.map((i) => (
                  <tr key={i.id}>
                    <td className="p-2.5 font-mono font-bold">{i.issueCode}</td>
                    <td className="p-2.5 font-medium">{i.title}</td>
                    <td className="p-2.5">{i.category}</td>
                    <td className="p-2.5 font-bold">{i.priority}</td>
                    <td className="p-2.5 font-semibold">{i.status}</td>
                    <td className="p-2.5 italic text-slate-600 dark:text-slate-300">{i.resolutionNotes || 'Open / Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Verification Signatures */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
            <p className="font-semibold text-slate-900 dark:text-white">Site Operations Director / Lead Engineer</p>
            <p className="text-[11px] text-slate-400">Date & Certified Signature</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-400 mb-2"></div>
            <p className="font-semibold text-slate-900 dark:text-white">Project Manager / General Contractor</p>
            <p className="text-[11px] text-slate-400">Date & Verification Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
