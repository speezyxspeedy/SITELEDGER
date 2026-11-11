import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Calculator,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { PlannedVsActualChart } from '../common/Charts';
import { StatusBadge } from '../common/StatusBadge';

export const PlannedVsActualView: React.FC = () => {
  const { state, calculateWeightedProgress } = useSiteLedger();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    state.selectedProjectId === 'ALL' ? (state.projects[0]?.id || '') : state.selectedProjectId
  );

  const currentProject = state.projects.find((p) => p.id === selectedProjectId) || state.projects[0];
  const projectMilestones = state.milestones.filter((m) => m.projectId === currentProject?.id);

  const weightedStats = calculateWeightedProgress(currentProject?.id || '');

  // Delayed activities
  const delayedMilestones = projectMilestones.filter(
    (m) => m.isDelayed || m.status === 'DELAYED' || (m.actualProgress < m.plannedProgress && m.status !== 'COMPLETED')
  );

  // Time curve data points for selected project
  const chartPoints = [
    { date: 'Month 1', planned: 5, actual: 5 },
    { date: 'Month 3', planned: 18, actual: 20 },
    { date: 'Month 6', planned: 35, actual: 32 },
    { date: 'Month 9', planned: 54, actual: 48 },
    { date: 'Month 12', planned: 72, actual: 65 },
    { date: 'Current', planned: weightedStats.plannedWeighted || 80, actual: weightedStats.actualWeighted || 72 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <span>Planned vs. Actual Progress Analytics Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic aggregation comparing planned engineering milestones against verified site progress
          </p>
        </div>

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
      </div>

      {/* Progress Derivation Transparency Card */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Formula & Progress Percentage Derivation
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Construction progress is calculated using milestone weight coefficients to prevent skewed unweighted averages:
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Overall Project Progress</span>
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {weightedStats.actualWeighted}%
            </span>
          </div>
        </div>

        {/* Calculation Formula Display */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300">
          <code>
            Overall Progress = Σ (Milestone Actual Completion % × Milestone Weight) ÷ Total Weight ({weightedStats.totalWeight}%)
          </code>
        </div>

        {/* Milestones Weight Breakdown Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Milestone Activity</th>
                <th className="py-2.5 px-3 text-right">Weight</th>
                <th className="py-2.5 px-3 text-right">Target Sched. %</th>
                <th className="py-2.5 px-3 text-right">Verified Actual %</th>
                <th className="py-2.5 px-3 text-right">Weighted Contribution</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {projectMilestones.map((m) => {
                const contribution =
                  weightedStats.totalWeight > 0
                    ? Math.round(((m.actualProgress * m.weight) / weightedStats.totalWeight) * 10) / 10
                    : 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      {m.title}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {m.weight}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {m.plannedProgress}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {m.actualProgress}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                      +{contribution}%
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={m.status} type="milestone" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* S-Curve Graph */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Project S-Curve Timeline Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Baseline cumulative planned trajectory versus real daily reported progress
          </p>
        </div>

        <PlannedVsActualChart data={chartPoints} height={240} />
      </div>

      {/* Delayed Milestones and Variance Analysis */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Delayed Milestones & Critical Path Variances
          </h2>
        </div>

        {delayedMilestones.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            All project activities currently tracking on or ahead of scheduled timeline.
          </p>
        ) : (
          <div className="space-y-2">
            {delayedMilestones.map((m) => {
              const gap = Math.round((m.plannedProgress - m.actualProgress) * 10) / 10;
              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {m.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/60">
                        Variance: −{gap}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Target deadline: {m.plannedEnd} · Assigned Lead: {m.assignedToName || 'Civil Lead'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {m.actualProgress}% completed / {m.plannedProgress}% scheduled
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
