import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Building2,
  HardHat,
  Calendar,
  X,
  Edit2,
  ClipboardCheck,
  Users,
  Boxes,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { ConstructionSite, SiteStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const SITE_STATUSES: SiteStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED', 'HANDOVER_COMPLETE'];

export const SitesView: React.FC<{ onNavigateToReports?: (siteId: string) => void }> = ({
  onNavigateToReports,
}) => {
  const { state, currentUser, addSite, updateSite } = useSiteLedger();

  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    projectId: state.projects[0]?.id || '',
    siteName: '',
    address: '',
    area: '',
    city: '',
    siteEngineerId: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as SiteStatus,
    notes: '',
  });

  const [formError, setFormError] = useState('');

  // Eligible site engineers
  const engineers = state.users.filter((u) => u.role === 'SITE_ENGINEER' || u.role === 'PROJECT_MANAGER');

  const filteredSites = state.sites.filter((s) => {
    const matchSearch =
      s.siteName.toLowerCase().includes(search.toLowerCase()) ||
      s.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      (s.siteEngineerName && s.siteEngineerName.toLowerCase().includes(search.toLowerCase())) ||
      s.city.toLowerCase().includes(search.toLowerCase());

    const matchPrj = selectedProjectId === 'ALL' || s.projectId === selectedProjectId;
    const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchSearch && matchPrj && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingSite(null);
    setFormData({
      projectId: state.projects[0]?.id || '',
      siteName: '',
      address: '',
      area: '',
      city: '',
      siteEngineerId: engineers[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (site: ConstructionSite) => {
    setEditingSite(site);
    setFormData({
      projectId: site.projectId,
      siteName: site.siteName,
      address: site.address,
      area: site.area || '',
      city: site.city,
      siteEngineerId: site.siteEngineerId || '',
      startDate: site.startDate,
      status: site.status,
      notes: site.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.siteName.trim() || !formData.city.trim() || !formData.projectId) {
      setFormError('Please enter site name, select a project, and enter city location.');
      return;
    }

    try {
      const engineer = engineers.find((e) => e.id === formData.siteEngineerId);
      if (editingSite) {
        updateSite(editingSite.id, {
          ...formData,
          siteEngineerName: engineer?.fullName,
        });
      } else {
        addSite({
          ...formData,
          siteEngineerName: engineer?.fullName,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error saving construction site');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-500" />
            <span>Construction Sites & Work Zones</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track multi-site construction locations, active work fronts, and resident site engineer assignments
          </p>
        </div>

        {currentUser.role !== 'SITE_ENGINEER' && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Site</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site name, code, assigned engineer, or area..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Projects</option>
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {SITE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site) => {
          const project = state.projects.find((p) => p.id === site.projectId);
          const reportsCount = state.dailyReports.filter((r) => r.siteId === site.id).length;
          const openIssuesCount = state.siteIssues.filter((i) => i.siteId === site.id && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
          const activeAttendanceToday = state.attendance.filter((a) => a.siteId === site.id && (a.status === 'PRESENT' || a.status === 'HALF DAY')).length;

          return (
            <div
              key={site.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:border-amber-400 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {site.siteCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {site.siteName}
                    </h3>
                  </div>
                  <StatusBadge status={site.status} type="site" />
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project?.name || 'Project'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Eng: <strong className="text-slate-900 dark:text-white font-medium">{site.siteEngineerName || 'Unassigned'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{site.area || site.address}, {site.city}</span>
                  </div>
                </div>

                {site.notes && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded border border-slate-100 dark:border-slate-800 italic line-clamp-2">
                    &ldquo;{site.notes}&rdquo;
                  </p>
                )}

                {/* Site Activity Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-[10px] text-slate-400 block">DPRs Filed</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{reportsCount}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-[10px] text-slate-400 block">Workers</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{activeAttendanceToday}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-[10px] text-slate-400 block">Issues</span>
                    <span className={`font-mono font-bold ${openIssuesCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {openIssuesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigateToReports && onNavigateToReports(site.id)}
                  className="font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>View Reports</span>
                </button>

                {currentUser.role !== 'SITE_ENGINEER' && (
                  <button
                    onClick={() => handleOpenEdit(site)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Site Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSite ? 'Edit Construction Site' : 'Add New Construction Site'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Parent Project *
                </label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                >
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site or Work Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="e.g. Tower Core Zone A, Podium Level B2"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Area / Specific Sector
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Levels 12-24 Slabs"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    City Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Chicago"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Site Engineer
                  </label>
                  <select
                    value={formData.siteEngineerId}
                    onChange={(e) => setFormData({ ...formData, siteEngineerId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.fullName} ({eng.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Site Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SiteStatus })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    {SITE_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street and lot number"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site Notes / Safety Constraints
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Tower crane #1 operational zone, strict PPE enforcement"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md"
                >
                  {editingSite ? 'Save Changes' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
