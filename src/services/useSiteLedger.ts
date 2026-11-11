/**
 * SiteLedger — React Hook for Reactive Database State
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { dbStore, DatabaseState } from './dbStore';
import { ConstructionKPIs, UserProfile } from '../types';

export function useSiteLedger() {
  const [state, setState] = useState<DatabaseState>(() => dbStore.getState());

  useEffect(() => {
    const unsubscribe = dbStore.subscribe(() => {
      setState({ ...dbStore.getState() });
    });
    return unsubscribe;
  }, []);

  const currentUser = useMemo(() => dbStore.getCurrentUser(), [state.currentUserId, state.users]);

  const kpis: ConstructionKPIs = useMemo(() => {
    return dbStore.getKPIs(state.selectedProjectId);
  }, [
    state.selectedProjectId,
    state.projects,
    state.sites,
    state.dailyReports,
    state.attendance,
    state.materialTransactions,
    state.expenses,
    state.milestones,
    state.siteIssues,
  ]);

  const selectedProject = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return null;
    return state.projects.find((p) => p.id === state.selectedProjectId) || null;
  }, [state.selectedProjectId, state.projects]);

  // Filtered views based on selectedProject
  const filteredSites = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return state.sites;
    return state.sites.filter((s) => s.projectId === state.selectedProjectId);
  }, [state.selectedProjectId, state.sites]);

  const filteredReports = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return state.dailyReports;
    return state.dailyReports.filter((r) => r.projectId === state.selectedProjectId);
  }, [state.selectedProjectId, state.dailyReports]);

  const filteredExpenses = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return state.expenses;
    return state.expenses.filter((e) => e.projectId === state.selectedProjectId);
  }, [state.selectedProjectId, state.expenses]);

  const filteredMilestones = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return state.milestones;
    return state.milestones.filter((m) => m.projectId === state.selectedProjectId);
  }, [state.selectedProjectId, state.milestones]);

  const filteredIssues = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return state.siteIssues;
    return state.siteIssues.filter((i) => i.projectId === state.selectedProjectId);
  }, [state.selectedProjectId, state.siteIssues]);

  const filteredAttendance = useMemo(() => {
    if (state.selectedProjectId === 'ALL') return state.attendance;
    return state.attendance.filter((a) => a.projectId === state.selectedProjectId);
  }, [state.selectedProjectId, state.attendance]);

  return {
    state,
    currentUser,
    kpis,
    selectedProject,
    filteredSites,
    filteredReports,
    filteredExpenses,
    filteredMilestones,
    filteredIssues,
    filteredAttendance,

    // Store Actions
    setCurrentUser: useCallback((id: string) => dbStore.setCurrentUser(id), []),
    setSelectedProject: useCallback((id: string | 'ALL') => dbStore.setSelectedProject(id), []),
    toggleTheme: useCallback(() => dbStore.toggleTheme(), []),
    resetToDemo: useCallback(() => dbStore.resetToDemo(), []),

    // CRUD Methods
    addProject: useCallback((data: any) => dbStore.addProject(data), []),
    updateProject: useCallback((id: string, updates: any) => dbStore.updateProject(id, updates), []),
    deleteProject: useCallback((id: string) => dbStore.deleteProject(id), []),

    addSite: useCallback((data: any) => dbStore.addSite(data), []),
    updateSite: useCallback((id: string, updates: any) => dbStore.updateSite(id, updates), []),

    addWorker: useCallback((data: any) => dbStore.addWorker(data), []),
    recordAttendance: useCallback((data: any) => dbStore.recordAttendance(data), []),
    batchRecordAttendance: useCallback((records: any[]) => dbStore.batchRecordAttendance(records), []),

    addDailyReport: useCallback((data: any) => dbStore.addDailyReport(data), []),
    reviewDailyReport: useCallback((id: string, action: any, notes?: string) => dbStore.reviewDailyReport(id, action, notes), []),

    addMaterial: useCallback((data: any) => dbStore.addMaterial(data), []),
    getMaterialStockBalance: useCallback((matId: string, siteId?: string, prjId?: string) => dbStore.getMaterialStockBalance(matId, siteId, prjId), []),
    recordMaterialTransaction: useCallback((data: any) => dbStore.recordMaterialTransaction(data), []),

    addExpense: useCallback((data: any) => dbStore.addExpense(data), []),
    updateExpenseApproval: useCallback((id: string, status: any) => dbStore.updateExpenseApproval(id, status), []),
    updateExpensePayment: useCallback((id: string, status: any) => dbStore.updateExpensePayment(id, status), []),

    addMilestone: useCallback((data: any) => dbStore.addMilestone(data), []),
    updateMilestoneProgress: useCallback((id: string, progress: number, status?: any) => dbStore.updateMilestoneProgress(id, progress, status), []),
    calculateWeightedProgress: useCallback((prjId: string) => dbStore.calculateWeightedProgress(prjId), []),

    addSiteIssue: useCallback((data: any) => dbStore.addSiteIssue(data), []),
    updateSiteIssueStatus: useCallback((id: string, status: any, notes?: string) => dbStore.updateSiteIssueStatus(id, status, notes), []),

    addDocument: useCallback((data: any) => dbStore.addDocument(data), []),
    deleteDocument: useCallback((id: string) => dbStore.deleteDocument(id), []),
  };
}
