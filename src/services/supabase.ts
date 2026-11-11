/**
 * SiteLedger — Supabase Client Service
 * Provides Supabase client connection if configured in environment or user settings.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const customUrl = localStorage.getItem('siteledger_supabase_url');
  const customKey = localStorage.getItem('siteledger_supabase_key');
  return {
    url: customUrl || envUrl,
    anonKey: customKey || envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (url) localStorage.setItem('siteledger_supabase_url', url.trim());
  else localStorage.removeItem('siteledger_supabase_url');

  if (anonKey) localStorage.setItem('siteledger_supabase_key', anonKey.trim());
  else localStorage.removeItem('siteledger_supabase_key');
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConnected(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}
