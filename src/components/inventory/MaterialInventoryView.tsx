import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  History,
  Building2,
  X,
  PackagePlus,
  PackageMinus,
  CheckCircle,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { MaterialCategory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'Cement',
  'Steel',
  'Sand',
  'Aggregate',
  'Bricks',
  'Tiles',
  'Paint',
  'Electrical Supplies',
  'Plumbing Supplies',
  'Other',
];

export const MaterialInventoryView: React.FC = () => {
  const {
    state,
    getMaterialStockBalance,
    recordMaterialTransaction,
    addMaterial,
  } = useSiteLedger();

  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState(false);

  // Receipt Form State
  const [receiptForm, setReceiptForm] = useState({
    materialId: state.materials[0]?.id || '',
    siteId: state.sites[0]?.id || '',
    quantity: 100,
    unitCost: 15,
    supplier: '',
    invoiceReference: '',
    transactionDate: new Date().toISOString().split('T')[0],
    storageLocation: 'Central Staging Yard',
    notes: '',
  });

  // Consumption Form State
  const [consumptionForm, setConsumptionForm] = useState({
    materialId: state.materials[0]?.id || '',
    siteId: state.sites[0]?.id || '',
    quantity: 20,
    transactionDate: new Date().toISOString().split('T')[0],
    linkedReportId: state.dailyReports[0]?.id || '',
    storageLocation: '',
    notes: '',
  });

  // New Material Catalog Item State
  const [newMaterialForm, setNewMaterialForm] = useState({
    materialName: '',
    category: 'Cement' as MaterialCategory,
    unit: 'Bags',
    minimumStock: 100,
    unitCost: 14.5,
  });

  const [txnError, setTxnError] = useState('');
  const [txnSuccess, setTxnSuccess] = useState('');

  // Calculate live balances for materials
  const materialBalances = state.materials.map((m) =>
    getMaterialStockBalance(m.id, selectedSiteId === 'ALL' ? undefined : selectedSiteId)
  );

  const filteredBalances = materialBalances.filter((b) => {
    const matchSearch =
      b.materialName.toLowerCase().includes(search.toLowerCase()) ||
      b.materialCode.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // Filtered transaction audit history
  const filteredTransactions = state.materialTransactions.filter((t) => {
    if (selectedSiteId !== 'ALL' && t.siteId !== selectedSiteId) return false;
    return true;
  });

  const handleOpenReceipt = (matId?: string) => {
    setTxnError('');
    setTxnSuccess('');
    setReceiptForm({
      materialId: matId || state.materials[0]?.id || '',
      siteId: state.sites[0]?.id || '',
      quantity: 100,
      unitCost: state.materials.find((m) => m.id === (matId || state.materials[0]?.id))?.unitCost || 20,
      supplier: 'Apex Materials Corp',
      invoiceReference: `INV-${Date.now().toString().slice(-4)}`,
      transactionDate: new Date().toISOString().split('T')[0],
      storageLocation: 'Central Staging Yard',
      notes: '',
    });
    setIsReceiptModalOpen(true);
  };

  const handleOpenConsumption = (matId?: string) => {
    setTxnError('');
    setTxnSuccess('');
    setConsumptionForm({
      materialId: matId || state.materials[0]?.id || '',
      siteId: state.sites[0]?.id || '',
      quantity: 10,
      transactionDate: new Date().toISOString().split('T')[0],
      linkedReportId: state.dailyReports[0]?.id || '',
      storageLocation: '',
      notes: '',
    });
    setIsConsumptionModalOpen(true);
  };

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnError('');
    const targetSite = state.sites.find((s) => s.id === receiptForm.siteId);
    if (!targetSite) {
      setTxnError('Select a valid delivery site.');
      return;
    }

    try {
      recordMaterialTransaction({
        ...receiptForm,
        projectId: targetSite.projectId,
        transactionType: 'RECEIPT',
        quantity: Number(receiptForm.quantity),
        unitCost: Number(receiptForm.unitCost),
      });
      setIsReceiptModalOpen(false);
      setTxnSuccess('Stock receipt logged and verified.');
      setTimeout(() => setTxnSuccess(''), 3000);
    } catch (err: any) {
      setTxnError(err.message || 'Error recording receipt');
    }
  };

  const handleConsumptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnError('');
    const targetSite = state.sites.find((s) => s.id === consumptionForm.siteId);
    if (!targetSite) {
      setTxnError('Select a valid site.');
      return;
    }

    try {
      recordMaterialTransaction({
        ...consumptionForm,
        projectId: targetSite.projectId,
        transactionType: 'CONSUMPTION',
        quantity: Number(consumptionForm.quantity),
      });
      setIsConsumptionModalOpen(false);
      setTxnSuccess('Material consumption recorded.');
      setTimeout(() => setTxnSuccess(''), 3000);
    } catch (err: any) {
      setTxnError(err.message || 'Error recording consumption');
    }
  };

  const handleNewMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialForm.materialName.trim()) return;

    addMaterial(newMaterialForm);
    setIsNewMaterialModalOpen(false);
    setNewMaterialForm({
      materialName: '',
      category: 'Cement',
      unit: 'Bags',
      minimumStock: 100,
      unitCost: 14.5,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            <span>Material Inventory & Stock Control</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-site material stock balancing with receipt verification and strict negative inventory prevention
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenReceipt()}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 rounded border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Receive Stock</span>
          </button>
          <button
            onClick={() => handleOpenConsumption()}
            className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 rounded border border-amber-300 dark:border-amber-800 transition-colors flex items-center gap-1.5"
          >
            <PackageMinus className="w-4 h-4" />
            <span>Record Usage</span>
          </button>
          <button
            onClick={() => setIsNewMaterialModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {txnSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{txnSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material code or commodity description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Storage Locations / Sites</option>
          {state.sites.map((s) => (
            <option key={s.id} value={s.id}>{s.siteName}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          {MATERIAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Materials Stock Balances Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Current Stock Inventory Balances (Formula: Received − Consumed)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredBalances.length} commodities listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Material Code</th>
                <th className="py-3 px-4">Commodity Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Total Received</th>
                <th className="py-3 px-4 text-right">Total Consumed</th>
                <th className="py-3 px-4 text-right">Closing Balance</th>
                <th className="py-3 px-4 text-right">Est. Value</th>
                <th className="py-3 px-4">Stock Health</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredBalances.map((bal) => (
                <tr key={bal.materialId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {bal.materialCode}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {bal.materialName}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {bal.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {bal.totalReceived.toLocaleString()} {bal.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {bal.totalConsumed.toLocaleString()} {bal.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {bal.currentBalance.toLocaleString()} {bal.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    ${bal.estimatedValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={bal.status} type="stock" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenReceipt(bal.materialId)}
                        className="px-2 py-0.5 rounded text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                        title="Log incoming shipment"
                      >
                        + Receive
                      </button>
                      <button
                        onClick={() => handleOpenConsumption(bal.materialId)}
                        className="px-2 py-0.5 rounded text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                        title="Record site usage"
                      >
                        − Consume
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traceable Stock Movement Audit History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <span>Traceable Stock Movement Audit Trail</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} recorded movements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4">Supplier / Reference</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.slice(0, 15).map((txn) => {
                const isReceipt = txn.transactionType === 'RECEIPT';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {txn.transactionDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isReceipt
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isReceipt ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {txn.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {txn.materialName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {isReceipt ? `+${txn.quantity}` : `-${txn.quantity}`} {txn.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      ${txn.totalCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {txn.supplier || txn.invoiceReference || 'Site consumption'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 italic">
                      {txn.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-emerald-500" />
                <span>Receive Inbound Material Stock</span>
              </h2>
              <button onClick={() => setIsReceiptModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReceiptSubmit} className="space-y-3 text-xs">
              {txnError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                  {txnError}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Material Commodity *
                </label>
                <select
                  value={receiptForm.materialId}
                  onChange={(e) => {
                    const mat = state.materials.find((m) => m.id === e.target.value);
                    setReceiptForm({
                      ...receiptForm,
                      materialId: e.target.value,
                      unitCost: mat?.unitCost || receiptForm.unitCost,
                    });
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                >
                  {state.materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.materialName} ({m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Construction Site *
                </label>
                <select
                  value={receiptForm.siteId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, siteId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                >
                  {state.sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.siteName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Received Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiptForm.quantity}
                    onChange={(e) => setReceiptForm({ ...receiptForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Rate ($/unit)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={receiptForm.unitCost}
                    onChange={(e) => setReceiptForm({ ...receiptForm, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Organization
                  </label>
                  <input
                    type="text"
                    value={receiptForm.supplier}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
                    placeholder="e.g. Vulcan Steel Supply"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Invoice / Waybill Ref
                  </label>
                  <input
                    type="text"
                    value={receiptForm.invoiceReference}
                    onChange={(e) => setReceiptForm({ ...receiptForm, invoiceReference: e.target.value })}
                    placeholder="INV-9921"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"
                >
                  Confirm Inbound Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Consumption Modal */}
      {isConsumptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageMinus className="w-4 h-4 text-amber-500" />
                <span>Record Material Consumption</span>
              </h2>
              <button onClick={() => setIsConsumptionModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleConsumptionSubmit} className="space-y-3 text-xs">
              {txnError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded border border-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{txnError}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Material to Consume *
                </label>
                <select
                  value={consumptionForm.materialId}
                  onChange={(e) => setConsumptionForm({ ...consumptionForm, materialId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                >
                  {state.materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.materialName} ({m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Active Work Site *
                </label>
                <select
                  value={consumptionForm.siteId}
                  onChange={(e) => setConsumptionForm({ ...consumptionForm, siteId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                >
                  {state.sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.siteName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Consumed Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={consumptionForm.quantity}
                  onChange={(e) => setConsumptionForm({ ...consumptionForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Activity Notes / Section Applied
                </label>
                <input
                  type="text"
                  value={consumptionForm.notes}
                  onChange={(e) => setConsumptionForm({ ...consumptionForm, notes: e.target.value })}
                  placeholder="e.g. Level 14 core shear wall pour"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConsumptionModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded"
                >
                  Verify & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Catalog Material Modal */}
      {isNewMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Material to Catalog
              </h2>
              <button onClick={() => setIsNewMaterialModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleNewMaterialSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMaterialForm.materialName}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, materialName: e.target.value })}
                  placeholder="e.g. Structural Timber Beams 2x10"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newMaterialForm.category}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, category: e.target.value as MaterialCategory })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    {MATERIAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    required
                    value={newMaterialForm.unit}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, unit: e.target.value })}
                    placeholder="Bags, Tonnes, m³, Pcs"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Standard Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newMaterialForm.unitCost}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMaterialForm.minimumStock}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, minimumStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMaterialModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded"
                >
                  Add Commodity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
