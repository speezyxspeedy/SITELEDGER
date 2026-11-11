import React, { useState } from 'react';
import {
  Building2,
  Search,
  Sun,
  Moon,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  HardHat,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, activeTab }) => {
  const {
    state,
    currentUser,
    setCurrentUser,
    setSelectedProject,
    toggleTheme,
    resetToDemo,
  } = useSiteLedger();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'PROJECT_MANAGER':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'SITE_ENGINEER':
        return <HardHat className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin / Contractor';
      case 'PROJECT_MANAGER':
        return 'Project Manager';
      case 'SITE_ENGINEER':
        return 'Site Engineer';
    }
  };

  const currentProjectName =
    state.selectedProjectId === 'ALL'
      ? 'All Construction Projects'
      : state.projects.find((p) => p.id === state.selectedProjectId)?.name || 'Project';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Brand & Active Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-sm font-bold">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              SiteLedger
            </span>
          </div>
        </div>

        {/* Global Project Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-md border border-slate-200/60 dark:border-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[130px] sm:max-w-[220px]">
              {currentProjectName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isProjectMenuOpen && (
            <div
              className="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsProjectMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Active Project Filter
              </div>
              <button
                onClick={() => {
                  setSelectedProject('ALL');
                  setIsProjectMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  state.selectedProjectId === 'ALL'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Projects (Portfolio View)</span>
                {state.selectedProjectId === 'ALL' && <span className="text-[10px]">Active</span>}
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              {state.projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProject(p.id);
                    setIsProjectMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    state.selectedProjectId === p.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.projectCode} · {p.city}</p>
                  </div>
                  {state.selectedProjectId === p.id && <span className="text-[10px] text-amber-600">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Zone: Search, Demo Mode, Role Switcher, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
          title="Search projects, sites, DPRs, workers, issues"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Search</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Explicit Demo Data Reset / Load Demo */}
        <button
          onClick={() => {
            if (confirm('Reload the official sample construction projects, sites, labour, inventory, and DPR records?')) {
              resetToDemo();
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
          title="Reset or reload demo workspace records"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Reload Demo</span>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 px-1 py-0.2 bg-amber-50 dark:bg-amber-950/40 rounded">
            DEMO
          </span>
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {getRoleIcon(currentUser.role)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                {getRoleTitle(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsRoleMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Switch Test Role & Account
              </div>
              {state.users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user.id);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                    currentUser.id === user.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-medium'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="shrink-0">{getRoleIcon(user.role)}</div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {getRoleTitle(user.role)}
                    </p>
                  </div>
                  {currentUser.id === user.id && (
                    <span className="ml-auto text-[10px] text-amber-600 font-semibold">Active</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title={`Switch to ${state.theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {state.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
