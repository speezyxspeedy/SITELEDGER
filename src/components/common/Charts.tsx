import React from 'react';

// S-Curve Line Chart for Planned vs Actual Progress
interface SCurvePoint {
  date: string;
  planned: number;
  actual: number;
}

export const PlannedVsActualChart: React.FC<{
  data: SCurvePoint[];
  height?: number;
}> = ({ data, height = 240 }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-sm text-slate-400">No progress data available</div>;
  }

  const width = 600;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const pointsPlanned = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.planned / 100) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const pointsActual = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.actual / 100) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal gridlines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = padding.top + graphHeight - (val / 100) * graphHeight;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 tabular-nums"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Date labels */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
            const x = padding.left + (i / (data.length - 1)) * graphWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 dark:fill-slate-500 font-sans"
              >
                {d.date}
              </text>
            );
          }
          return null;
        })}

        {/* Planned line (slate/blue dashed) */}
        <polyline
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeDasharray="5,4"
          points={pointsPlanned}
        />

        {/* Actual line (amber/orange solid) */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsActual}
        />

        {/* Dots on actual data */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * graphWidth;
          const y = padding.top + graphHeight - (d.actual / 100) * graphHeight;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="fill-amber-500 stroke-white dark:stroke-slate-900"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span>
          <span>Planned Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-amber-500"></span>
          <span className="font-medium text-amber-600 dark:text-amber-400">Actual Progress (Reported)</span>
        </div>
      </div>
    </div>
  );
};

// Bar chart for Labour Distribution or Daily Deployment
export const LabourBarChart: React.FC<{
  categories: { label: string; count: number; color?: string }[];
  height?: number;
}> = ({ categories, height = 180 }) => {
  const max = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="flex items-end gap-2.5 w-full pt-4" style={{ height }}>
      {categories.map((cat, i) => {
        const heightPct = (cat.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400 opacity-90 group-hover:text-amber-500 transition-colors">
              {cat.count}
            </span>
            <div
              className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-sm group-hover:bg-amber-500 transition-all duration-300 relative"
              style={{ height: `${Math.max(6, heightPct)}%` }}
            >
              <div
                className="absolute inset-x-0 bottom-0 top-0 bg-amber-500 opacity-80 rounded-t-sm"
                style={{ backgroundColor: cat.color }}
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[55px] text-center" title={cat.label}>
              {cat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Simple Donut / Radial Gauge
export const BudgetGauge: React.FC<{
  approvedBudget: number;
  expenditure: number;
}> = ({ approvedBudget, expenditure }) => {
  const utilization = approvedBudget > 0 ? Math.min(100, Math.round((expenditure / approvedBudget) * 100)) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (utilization / 100) * circumference;

  const isOver = expenditure > approvedBudget;
  const strokeColor = isOver ? '#ef4444' : utilization > 85 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {utilization}%
          </span>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Approved Budget:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            ${approvedBudget.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Spent to Date:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
            ${expenditure.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Remaining Balance:</span>
          <span className={`font-mono tabular-nums font-semibold ${approvedBudget - expenditure < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            ${(approvedBudget - expenditure).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
