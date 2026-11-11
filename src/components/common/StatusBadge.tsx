import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'report' | 'project' | 'site' | 'payment' | 'approval' | 'milestone' | 'issue' | 'priority' | 'stock';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'report', className = '' }) => {
  const getColors = () => {
    const s = status.toUpperCase();

    // Success / Completed / Optimal
    if (['APPROVED', 'COMPLETED', 'PAID', 'RESOLVED', 'CLOSED', 'OPTIMAL', 'ACTIVE'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    }

    // Pending / In Progress / Under Review / Low Stock / Medium
    if (['SUBMITTED', 'IN PROGRESS', 'UNDER REVIEW', 'PENDING', 'PARTIALLY PAID', 'LOW_STOCK', 'MEDIUM'].includes(s)) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    }

    // Danger / Delayed / Critical / Rejected
    if (['REJECTED', 'DELAYED', 'CANCELLED', 'CRITICAL', 'HIGH'].includes(s)) {
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
    }

    // Draft / Planning / Not Started / Neutral
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getColors()} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
