import React, { useState } from 'react';
import {
  Settings,
  Database,
  Key,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useSiteLedger } from '../../services/useSiteLedger';
import { getStoredSupabaseConfig, saveSupabaseConfig, isSupabaseConnected } from '../../services/supabase';

export const SettingsView: React.FC = () => {
  const { resetToDemo } = useSiteLedger();

  const [supabaseUrl, setSupabaseUrl] = useState(() => getStoredSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getStoredSupabaseConfig().anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const isConnected = isSupabaseConnected();

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase-schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          <span>Platform Settings & Database Architecture</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure production Supabase credentials, execute PostgreSQL schemas, and manage demo workspace state
        </p>
      </div>

      {/* Supabase Connection Setup Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Supabase PostgreSQL Connection
            </h2>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
            }`}
          >
            {isConnected ? 'Connected to Remote Supabase' : 'Running on Local Engine'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          SiteLedger operates out-of-the-box with full offline local persistence. To link with your own Supabase cloud project, paste your project URL and anonymous public key below:
        </p>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Supabase configuration updated.</span>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              VITE_SUPABASE_URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzproject.supabase.co"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              VITE_SUPABASE_ANON_KEY (Public Publishable Key)
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded transition-colors"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>

      {/* SQL Schema Execution Instructions */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          PostgreSQL Database Schema & Security File
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          The complete SQL schema with PostgreSQL Row Level Security (RLS) policies, foreign keys, triggers protecting approved reports, and atomic material stock validation RPCs is located at root in:
        </p>

        <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-800 dark:text-slate-200">
          <span>/supabase-schema.sql</span>
          <button
            onClick={handleCopySchemaPath}
            className="ml-auto text-xs px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>{copied ? 'Copied!' : 'Copy Path'}</span>
          </button>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800/60 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
            How to apply in Supabase:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Log in to your Supabase project dashboard at <code className="font-mono">supabase.com</code></li>
            <li>Go to <strong>SQL Editor</strong> &gt; <strong>New Query</strong></li>
            <li>Copy and paste the contents of <code className="font-mono">supabase-schema.sql</code></li>
            <li>Click <strong>Run</strong> to establish all tables, RLS policies, and stored procedures.</li>
          </ol>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <span>Demo Data & Workspace Reset</span>
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Reset all current state to the official sample construction projects (Skyline Commercial Tower and Oakridge Green Residences), including 3 sites, 5 engineers, 15 workers, material transactions, and realistic DPR records.
        </p>

        <button
          onClick={() => {
            if (confirm('Reset workspace and reload official demo construction records?')) {
              resetToDemo();
              alert('Demo workspace reloaded successfully.');
            }
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload Demo Workspace</span>
        </button>
      </div>
    </div>
  );
};
