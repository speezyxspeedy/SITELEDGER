import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Header } from './components/common/Header';
import { Sidebar, NavTabId } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Views
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ProjectsView } from './components/projects/ProjectsView';
import { SitesView } from './components/sites/SitesView';
import { DailyReportsView } from './components/reports/DailyReportsView';
import { LabourView } from './components/labour/LabourView';
import { MaterialInventoryView } from './components/inventory/MaterialInventoryView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { MilestonesView } from './components/milestones/MilestonesView';
import { PlannedVsActualView } from './components/analytics/PlannedVsActualView';
import { SiteIssuesView } from './components/issues/SiteIssuesView';
import { ReportsExportView } from './components/exports/ReportsExportView';
import { TeamView } from './components/team/TeamView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [targetedRecordId, setTargetedRecordId] = useState<string | undefined>();

  const handleNavigate = (tab: NavTabId, recordId?: string) => {
    setActiveTab(tab);
    setTargetedRecordId(recordId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectsView onNavigateToSites={() => setActiveTab('sites')} />;
      case 'sites':
        return <SitesView onNavigateToReports={() => setActiveTab('reports')} />;
      case 'reports':
        return <DailyReportsView initialReportId={targetedRecordId} />;
      case 'labour':
        return <LabourView />;
      case 'inventory':
        return <MaterialInventoryView />;
      case 'expenses':
        return <ExpensesView />;
      case 'milestones':
        return <MilestonesView />;
      case 'analytics':
        return <PlannedVsActualView />;
      case 'issues':
        return <SiteIssuesView />;
      case 'exports':
        return <ReportsExportView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeTab={activeTab}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 transition-all">
          {/* Mobile subheader bar with hamburger trigger */}
          <div className="lg:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-16 z-20">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2 text-xs font-semibold"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {activeTab.replace('_', ' ')}
            </span>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
