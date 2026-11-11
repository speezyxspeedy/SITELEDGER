import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  ClipboardCheck,
  Users,
  Boxes,
  Receipt,
  Milestone,
  TrendingUp,
  AlertOctagon,
  FileSpreadsheet,
  UserCheck,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';

export type NavTabId =
  | 'overview'
  | 'projects'
  | 'sites'
  | 'reports'
  | 'labour'
  | 'inventory'
  | 'expenses'
  | 'milestones'
  | 'analytics'
  | 'issues'
  | 'exports'
  | 'team'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { state, kpis } = useSiteLedger();

  // Calculate unreviewed reports & open issues count
  const pendingReportsCount = state.dailyReports.filter((r) => r.status === 'SUBMITTED').length;
  const openIssuesCount = state.siteIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const pendingExpensesCount = state.expenses.filter((e) => e.approvalStatus === 'PENDING').length;

  const navItems = [
    { id: 'overview' as NavTabId, label: 'Overview', icon: LayoutDashboard },
    { id: 'projects' as NavTabId, label: 'Projects', icon: FolderKanban, badge: state.projects.length },
    { id: 'sites' as NavTabId, label: 'Sites', icon: MapPin, badge: state.sites.length },
    {
      id: 'reports' as NavTabId,
      label: 'Daily Reports (DPR)',
      icon: ClipboardCheck,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} review` : undefined,
      badgeColor: 'amber',
    },
    { id: 'labour' as NavTabId, label: 'Labour Management', icon: Users },
    { id: 'inventory' as NavTabId, label: 'Material Inventory', icon: Boxes },
    {
      id: 'expenses' as NavTabId,
      label: 'Project Expenses',
      icon: Receipt,
      badge: pendingExpensesCount > 0 ? `${pendingExpensesCount}` : undefined,
    },
    { id: 'milestones' as NavTabId, label: 'Tasks & Milestones', icon: Milestone },
    { id: 'analytics' as NavTabId, label: 'Planned vs Actual', icon: TrendingUp },
    {
      id: 'issues' as NavTabId,
      label: 'Site Issues',
      icon: AlertOctagon,
      badge: openIssuesCount > 0 ? `${openIssuesCount} open` : undefined,
      badgeColor: 'rose',
    },
    { id: 'exports' as NavTabId, label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'team' as NavTabId, label: 'Team Management', icon: UserCheck },
    { id: 'settings' as NavTabId, label: 'Settings & Supabase', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Operations Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-900 dark:text-amber-300 font-semibold border-l-2 border-amber-500 rounded-l-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      item.badgeColor === 'amber'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : item.badgeColor === 'rose'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Tagline & System Summary */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            SiteLedger v1.0
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
            Every Site. Every Resource. Every Update.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sites: {state.sites.length} Active</span>
            <span className="font-mono tabular-nums">{kpis.labourPresentToday} Workers</span>
          </div>
        </div>
      </aside>
    </>
  );
};
