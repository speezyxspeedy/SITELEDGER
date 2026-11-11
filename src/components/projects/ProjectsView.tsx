import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  X,
  Edit2,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { Project, ProjectCategory, ProjectStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const CATEGORIES: ProjectCategory[] = [
  'Commercial Construction',
  'Residential Construction',
  'Industrial Construction',
  'Infrastructure',
  'Renovation',
  'Interior Work',
  'Other',
];

const STATUSES: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON HOLD', 'COMPLETED', 'CANCELLED'];

export const ProjectsView: React.FC<{ onNavigateToSites?: (projectId: string) => void }> = ({
  onNavigateToSites,
}) => {
  const { state, currentUser, addProject, updateProject, deleteProject, setSelectedProject } =
    useSiteLedger();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeProjectDetail, setActiveProjectDetail] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    category: 'Commercial Construction' as ProjectCategory,
    address: '',
    city: '',
    state: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    contractValue: 5000000,
    approvedBudget: 4200000,
    projectManagerId: currentUser.id,
    status: 'ACTIVE' as ProjectStatus,
  });

  const [formError, setFormError] = useState('');

  const filteredProjects = state.projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      clientName: '',
      category: 'Commercial Construction',
      address: '',
      city: '',
      state: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      contractValue: 5000000,
      approvedBudget: 4200000,
      projectManagerId: currentUser.id,
      status: 'ACTIVE',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      name: p.name,
      description: p.description,
      clientName: p.clientName,
      category: p.category,
      address: p.address,
      city: p.city,
      state: p.state,
      startDate: p.startDate,
      expectedEndDate: p.expectedEndDate,
      contractValue: p.contractValue,
      approvedBudget: p.approvedBudget,
      projectManagerId: p.projectManagerId || currentUser.id,
      status: p.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.clientName.trim() || !formData.city.trim()) {
      setFormError('Please fill in all required fields (Project Name, Client, City).');
      return;
    }

    if (formData.expectedEndDate < formData.startDate) {
      setFormError('Expected completion date cannot be earlier than project start date.');
      return;
    }

    try {
      if (editingProject) {
        updateProject(editingProject.id, formData);
      } else {
        const pm = state.users.find((u) => u.id === formData.projectManagerId);
        addProject({
          ...formData,
          projectManagerName: pm?.fullName,
          imageUrl: '/src/assets/images/site_skyline_commercial_1794412319370.jpg',
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error saving project');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete project "${name}" and all associated site links?`)) {
      try {
        deleteProject(id);
        if (activeProjectDetail?.id === id) setActiveProjectDetail(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-500" />
            <span>Project Management Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage commercial, residential, and infrastructure sites with live contract and budget oversight
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
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
            placeholder="Search by project title, code, client name, or city..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((p) => {
          const sitesCount = state.sites.filter((s) => s.projectId === p.id).length;
          const expensesTotal = state.expenses
            .filter((e) => e.projectId === p.id && (e.approvalStatus === 'APPROVED' || e.paymentStatus === 'PAID'))
            .reduce((sum, e) => sum + e.amount, 0);

          const budgetPct = p.approvedBudget > 0 ? Math.round((expensesTotal / p.approvedBudget) * 100) : 0;

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-amber-400/80 dark:hover:border-amber-500/80 transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {p.projectCode}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{p.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                  <StatusBadge status={p.status} type="project" />
                </div>

                {/* Client and Location */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Client</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {p.clientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Location</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {p.city}, {p.state}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Approved Budget:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      ${p.approvedBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Recorded Spent:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      ${expensesTotal.toLocaleString()} ({budgetPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${budgetPct > 90 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, budgetPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedProject(p.id);
                      if (onNavigateToSites) onNavigateToSites(p.id);
                    }}
                    className="font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{sitesCount} Linked Sites</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setActiveProjectDetail(p)}
                    className="px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Drawer Modal */}
      {activeProjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {activeProjectDetail.projectCode}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeProjectDetail.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeProjectDetail.category} · {activeProjectDetail.city}, {activeProjectDetail.state}
                </p>
              </div>
              <button
                onClick={() => setActiveProjectDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Project Description</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProjectDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[11px]">Client Organization</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeProjectDetail.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contract Value</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    ${activeProjectDetail.contractValue.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Approved Budget</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    ${activeProjectDetail.approvedBudget.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Start Date</span>
                  <span className="font-medium text-slate-900 dark:text-white">{activeProjectDetail.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Completion</span>
                  <span className="font-medium text-slate-900 dark:text-white">{activeProjectDetail.expectedEndDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Manager</span>
                  <span className="font-medium text-slate-900 dark:text-white">{activeProjectDetail.projectManagerName || 'Unassigned'}</span>
                </div>
              </div>

              {/* Linked Sites within this project */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Linked Construction Sites</h4>
                <div className="space-y-2">
                  {state.sites
                    .filter((s) => s.projectId === activeProjectDetail.id)
                    .map((site) => (
                      <div
                        key={site.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-900 dark:text-white">
                              {site.siteCode}
                            </span>
                            <span>·</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {site.siteName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Engineer: {site.siteEngineerName || 'Unassigned'} | Area: {site.area || site.address}
                          </p>
                        </div>
                        <StatusBadge status={site.status} type="site" />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveProjectDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingProject ? 'Edit Construction Project' : 'Create New Construction Project'}
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
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Central Plaza Tower"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Metro Urban Development Co."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="100 Grand Boulevard"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    City *
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
                    Contract Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Approved Budget ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.approvedBudget}
                    onChange={(e) => setFormData({ ...formData, approvedBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expected End Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedEndDate}
                    onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Scope & Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Structural specifications, key milestones, and architectural details..."
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
