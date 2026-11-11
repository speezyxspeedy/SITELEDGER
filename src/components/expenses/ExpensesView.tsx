import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Building2,
  X,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { ExpenseCategory, PaymentStatus, ProjectExpense } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Labour',
  'Materials',
  'Equipment Rental',
  'Transport',
  'Fuel',
  'Subcontractor Payments',
  'Permits and Fees',
  'Other Expenses',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['PAID', 'PENDING', 'PARTIALLY PAID', 'CANCELLED'];

export const ExpensesView: React.FC = () => {
  const {
    state,
    currentUser,
    addExpense,
    updateExpenseApproval,
    updateExpensePayment,
  } = useSiteLedger();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedApproval, setSelectedApproval] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Add Expense Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: state.projects[0]?.id || '',
    siteId: state.sites[0]?.id || '',
    category: 'Materials' as ExpenseCategory,
    description: '',
    amount: 1500,
    vendor: '',
    invoiceReference: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PENDING' as PaymentStatus,
    receiptUrl: '',
  });

  const [formError, setFormError] = useState('');

  // Filtered Expenses
  const filteredExpenses = state.expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseCode.toLowerCase().includes(search.toLowerCase()) ||
      (e.invoiceReference && e.invoiceReference.toLowerCase().includes(search.toLowerCase()));

    const matchPrj = selectedProjectId === 'ALL' || e.projectId === selectedProjectId;
    const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchAppr = selectedApproval === 'ALL' || e.approvalStatus === selectedApproval;

    return matchSearch && matchPrj && matchCat && matchAppr;
  });

  // Calculate Budget KPIs
  const relevantProjects = selectedProjectId === 'ALL'
    ? state.projects
    : state.projects.filter((p) => p.id === selectedProjectId);

  const totalApprovedBudget = relevantProjects.reduce((sum, p) => sum + p.approvedBudget, 0);

  // Total recorded expenditure counts APPROVED expenses or PAID expenses
  const totalApprovedExpenditure = filteredExpenses
    .filter((e) => e.approvalStatus === 'APPROVED' || e.paymentStatus === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingApprovalAmount = filteredExpenses
    .filter((e) => e.approvalStatus === 'PENDING')
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = totalApprovedBudget - totalApprovedExpenditure;
  const budgetUtilization =
    totalApprovedBudget > 0 ? Math.round((totalApprovedExpenditure / totalApprovedBudget) * 1000) / 10 : 0;

  const handleOpenAdd = () => {
    setFormData({
      projectId: state.projects[0]?.id || '',
      siteId: state.sites[0]?.id || '',
      category: 'Materials',
      description: '',
      amount: 2500,
      vendor: '',
      invoiceReference: `INV-${Date.now().toString().slice(-4)}`,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'PENDING',
      receiptUrl: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.description.trim() || !formData.vendor.trim() || formData.amount <= 0) {
      setFormError('Please enter description, vendor, and a positive amount.');
      return;
    }

    try {
      addExpense(formData);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error recording expense');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            <span>Project Expenses & Financial Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contract budget utilization, subcontractor payouts, material invoices, and financial approval audit
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Budget Utilization KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Approved Budget Cap
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
            ${totalApprovedBudget.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Total authorized allocation
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Recorded Expenditure
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
            ${totalApprovedExpenditure.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            {budgetUtilization}% of budget utilized
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Remaining Budget
          </span>
          <span
            className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
              remainingBudget < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            ${remainingBudget.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Uncommitted balance
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Pending Financial Approval
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1 block">
            ${pendingApprovalAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block">
            {filteredExpenses.filter((e) => e.approvalStatus === 'PENDING').length} unapproved claims
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, description, invoice reference, or code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Expense Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedApproval}
          onChange={(e) => setSelectedApproval(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Approvals</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Expense Code</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Vendor & Ref</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {exp.expenseCode}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {exp.expenseDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-[220px] truncate">
                    {exp.description}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{exp.vendor}</div>
                    <div className="text-[10px] text-slate-400">{exp.invoiceReference || 'No invoice'}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    ${exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={exp.paymentStatus} type="payment" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={exp.approvalStatus} type="approval" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER') &&
                        exp.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateExpenseApproval(exp.id, 'APPROVED')}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateExpenseApproval(exp.id, 'REJECTED')}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      {currentUser.role !== 'SITE_ENGINEER' && exp.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => updateExpensePayment(exp.id, 'PAID')}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Record Project Financial Expense
              </h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {state.projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Construction Site
                  </label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    <option value="">Project General</option>
                    {state.sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.siteName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Monthly crane lease, ready-mix concrete batch"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vendor / Payee *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. HeavyLift Rigging LLC"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Reference
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceReference}
                    onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                    placeholder="INV-2026-90"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {PAYMENT_STATUSES.map((ps) => (
                      <option key={ps} value={ps}>{ps}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded"
                >
                  Save Expense Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
