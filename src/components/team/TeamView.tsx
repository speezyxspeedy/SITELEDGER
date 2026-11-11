import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Briefcase,
  HardHat,
  Phone,
  Mail,
  CheckCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { UserRole } from '../../types';

export const TeamView: React.FC = () => {
  const { state, currentUser, setCurrentUser } = useSiteLedger();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin / Contractor</span>
          </span>
        );
      case 'PROJECT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Project Manager</span>
          </span>
        );
      case 'SITE_ENGINEER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <HardHat className="w-3.5 h-3.5" />
            <span>Site Engineer</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-amber-500" />
          <span>Team Directory & Role-Based Access Control</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage key project personnel, civil engineers, project managers, and switch roles to verify security boundaries
        </p>
      </div>

      {/* Permissions Matrix Reference */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            SiteLedger Role Permissions Matrix (RLS Enforced)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-2.5">Feature & Operation</th>
                <th className="p-2.5 text-center">ADMIN / CONTRACTOR</th>
                <th className="p-2.5 text-center">PROJECT MANAGER</th>
                <th className="p-2.5 text-center">SITE ENGINEER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-2.5 font-medium">Create & Delete Projects</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Full Access</td>
                <td className="p-2.5 text-center text-slate-400">View Assigned Only</td>
                <td className="p-2.5 text-center text-slate-400">View Assigned Only</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Create Construction Sites</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Full Access</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Manage Assigned</td>
                <td className="p-2.5 text-center text-slate-400">No Access</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Submit Daily Reports (DPR)</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Yes</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Yes</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Yes (Assigned Site)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Review & Approve DPRs</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Approve / Reject</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Approve / Reject</td>
                <td className="p-2.5 text-center text-slate-400">No Approval Rights</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Labour Attendance & Wages</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Full Access</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">View & Verify</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Record Daily Roll</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Financial Expense Approvals</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Sign-off Payouts</td>
                <td className="p-2.5 text-center font-bold text-emerald-600">Verify Claims</td>
                <td className="p-2.5 text-center text-slate-400">Submit Receipts Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.users.map((user) => {
          const isCurrent = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {user.fullName}
                  </h3>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>

                {isCurrent ? (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 uppercase">
                    Active User
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentUser(user.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded transition-colors"
                  >
                    Switch to Role
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
