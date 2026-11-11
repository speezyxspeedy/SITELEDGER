import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, FolderKanban, MapPin, ClipboardCheck, Users, Boxes, AlertOctagon } from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { NavTabId } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTabId, recordId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { state } = useSiteLedger();
  const [query, setQuery] = useState('');

  // Close on Escape, focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate('overview');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: {
      id: string;
      title: string;
      subtitle: string;
      type: 'project' | 'site' | 'report' | 'worker' | 'material' | 'issue';
      tab: NavTabId;
    }[] = [];

    // Projects
    state.projects.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          title: p.name,
          subtitle: `${p.projectCode} · ${p.clientName} · ${p.city}`,
          type: 'project',
          tab: 'projects',
        });
      }
    });

    // Sites
    state.sites.forEach((s) => {
      if (
        s.siteName.toLowerCase().includes(q) ||
        s.siteCode.toLowerCase().includes(q) ||
        (s.siteEngineerName && s.siteEngineerName.toLowerCase().includes(q))
      ) {
        results.push({
          id: s.id,
          title: s.siteName,
          subtitle: `${s.siteCode} · Eng: ${s.siteEngineerName || 'Unassigned'}`,
          type: 'site',
          tab: 'sites',
        });
      }
    });

    // Reports
    state.dailyReports.forEach((r) => {
      if (
        r.reportCode.toLowerCase().includes(q) ||
        (r.remarks && r.remarks.toLowerCase().includes(q)) ||
        r.reportDate.includes(q)
      ) {
        results.push({
          id: r.id,
          title: r.reportCode,
          subtitle: `${r.reportDate} · ${r.siteName || 'Site'} · Status: ${r.status}`,
          type: 'report',
          tab: 'reports',
        });
      }
    });

    // Workers
    state.workers.forEach((w) => {
      if (
        w.fullName.toLowerCase().includes(q) ||
        w.workerCode.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: w.id,
          title: w.fullName,
          subtitle: `${w.workerCode} · ${w.category} · ${w.contractorName || 'Direct'}`,
          type: 'worker',
          tab: 'labour',
        });
      }
    });

    // Materials
    state.materials.forEach((m) => {
      if (
        m.materialName.toLowerCase().includes(q) ||
        m.materialCode.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: m.id,
          title: m.materialName,
          subtitle: `${m.materialCode} · ${m.category} (${m.unit})`,
          type: 'material',
          tab: 'inventory',
        });
      }
    });

    // Issues
    state.siteIssues.forEach((i) => {
      if (
        i.title.toLowerCase().includes(q) ||
        i.issueCode.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: i.id,
          title: i.title,
          subtitle: `${i.issueCode} · ${i.category} · Priority: ${i.priority}`,
          type: 'issue',
          tab: 'issues',
        });
      }
    });

    return results.slice(0, 10);
  }, [query, state]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-500" />;
      case 'site':
        return <MapPin className="w-4 h-4 text-emerald-500" />;
      case 'report':
        return <ClipboardCheck className="w-4 h-4 text-amber-500" />;
      case 'worker':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'material':
        return <Boxes className="w-4 h-4 text-orange-500" />;
      case 'issue':
        return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, sites, DPRs, workers, materials, issues..."
            className="w-full px-3 py-3.5 text-sm bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type project name, site code, DPR number, worker, or material to jump immediately.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No construction records matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onNavigate(item.tab, item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 font-medium">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
