import React from 'react';
import {
  FolderKanban,
  MapPin,
  ClipboardCheck,
  Users,
  Boxes,
  Receipt,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { StatusBadge } from '../common/StatusBadge';
import { PlannedVsActualChart, LabourBarChart, BudgetGauge } from '../common/Charts';
import { NavTabId } from '../common/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTabId, recordId?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const { state, currentUser, kpis, selectedProject } = useSiteLedger();

  // Synthetic S-curve points based on real project milestones
  const sCurveData = [
    { date: 'Aug 25', planned: 5, actual: 5 },
    { date: 'Oct 25', planned: 18, actual: 19 },
    { date: 'Dec 25', planned: 32, actual: 30 },
    { date: 'Feb 26', planned: 48, actual: 44 },
    { date: 'Apr 26', planned: 60, actual: 55 },
    { date: 'Jun 26', planned: 72, actual: 66 },
    { date: 'Aug 26', planned: 82, actual: 76 },
    { date: 'Nov 26', planned: 88, actual: kpis.overallWeightedProgressPct || 81 },
  ];

  // Labour category distribution for current project/sites
  const labourCategories = [
    { label: 'Masons', count: state.workers.filter((w) => w.category === 'Mason' && w.isActive).length, color: '#f59e0b' },
    { label: 'Carpenters', count: state.workers.filter((w) => w.category === 'Carpenter' && w.isActive).length, color: '#3b82f6' },
    { label: 'Electricians', count: state.workers.filter((w) => w.category === 'Electrician' && w.isActive).length, color: '#10b981' },
    { label: 'Plumbers', count: state.workers.filter((w) => w.category === 'Plumber' && w.isActive).length, color: '#06b6d4' },
    { label: 'Operators', count: state.workers.filter((w) => w.category === 'Machine Operator' && w.isActive).length, color: '#8b5cf6' },
    { label: 'Labourers', count: state.workers.filter((w) => w.category === 'General Labour' && w.isActive).length, color: '#64748b' },
  ];

  // Recent 4 DPRs
  const recentDPRs = state.dailyReports.slice(0, 4);

  // Critical/Open Issues
  const activeIssues = state.siteIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Active Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedProject ? selectedProject.name : 'Executive Construction Operations'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{selectedProject ? `${selectedProject.projectCode} · ${selectedProject.category}` : 'All Active Projects Portfolio'}</span>
            <span aria-hidden="true">·</span>
            <span>Role: <strong className="text-slate-700 dark:text-slate-300 font-medium">{currentUser.role.replace('_', ' ')}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Submit DPR</span>
          </button>
          <button
            onClick={() => onNavigate('exports')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-md transition-colors"
          >
            Export Reports
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total & Active Projects */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Projects</span>
            <FolderKanban className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {kpis.totalProjects}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({kpis.activeProjects} active)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {kpis.totalSites} active construction sites
          </div>
        </div>

        {/* Labour Present Today */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Labour Today</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {kpis.labourPresentToday}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">on site</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <span>{state.workers.length} registered roster</span>
          </div>
        </div>

        {/* Daily Reports (DPR) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Reports Filed</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {state.dailyReports.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">total</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{state.dailyReports.filter((r) => r.status === 'SUBMITTED').length} pending review</span>
          </div>
        </div>

        {/* Material Stock Valuation */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Stock Value</span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              ${(kpis.totalMaterialStockValue / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {state.materials.length} tracked commodities
          </div>
        </div>

        {/* Open Site Issues */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Open Issues</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {kpis.openIssuesCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">active</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            {kpis.delayedMilestonesCount} delayed milestones
          </div>
        </div>
      </div>

      {/* Main Operational Grids: Planned vs Actual & Budget Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned vs Actual Progress (S-Curve) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Planned vs. Actual Progress (S-Curve)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aggregated milestone weights vs daily engineer verified completions
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <PlannedVsActualChart data={sCurveData} height={210} />
        </div>

        {/* Budget Utilization & Financials */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Budget Utilization</span>
              </h2>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Expenses
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Approved contract budgets versus actual certified payouts & invoices
            </p>

            <BudgetGauge
              approvedBudget={kpis.approvedBudgetTotal}
              expenditure={kpis.totalExpenditure}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500">Utilization Rate</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
              {kpis.budgetUtilizationPct}% of approved cap
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Grids: Labour Deployment & Recent DPR Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Labour Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Active Labour Distribution by Trade</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Headcount deployed across specialized subcontract trades
              </p>
            </div>
            <button
              onClick={() => onNavigate('labour')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Attendance Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LabourBarChart categories={labourCategories} height={160} />
        </div>

        {/* Recent Daily Progress Reports */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-500" />
                <span>Recent Daily Progress Reports</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest submissions from on-site civil engineers
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentDPRs.map((report) => (
              <div
                key={report.id}
                onClick={() => onNavigate('reports', report.id)}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
                      {report.reportCode}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{report.reportDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    {report.siteName} — {report.remarks || 'No remarks'}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={report.status} type="report" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Site Issues Drawer Preview */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <span>Active Site Issues Requiring Resolution</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdowns, material shortages, and structural design clarifications
            </p>
          </div>
          <button
            onClick={() => onNavigate('issues')}
            className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Issue Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onNavigate('issues', issue.id)}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {issue.issueCode}
                    </span>
                    <StatusBadge status={issue.priority} type="priority" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                    {issue.title}
                  </h3>
                </div>
                <StatusBadge status={issue.status} type="issue" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                {issue.description}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Category: {issue.category}</span>
                <span>Assigned: {issue.assignedToName || 'Unassigned'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
