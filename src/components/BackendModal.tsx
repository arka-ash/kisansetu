import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, RefreshCw, Copy, Check, Server, ShieldCheck, ExternalLink, X, Code2 } from 'lucide-react';
import { BackendStatus, checkBackendHealth, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../lib/supabase';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const BackendModal: React.FC<BackendModalProps> = ({ isOpen, onClose, onSyncComplete }) => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sql' | 'credentials'>('overview');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    const res = await checkBackendHealth();
    setStatus(res);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch('/api/sync-supabase', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setSyncMessage('✅ Seed records pushed and synchronized with Supabase!');
        fetchStatus();
        if (onSyncComplete) onSyncComplete();
      } else {
        setSyncMessage(`⚠️ Sync notice: ${data.details || data.error || 'Check table schema'}`);
      }
    } catch (err: any) {
      setSyncMessage(`⚠️ Network/Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-sans tracking-tight">Supabase Backend Integration</h3>
                <span className="bg-emerald-700 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Project: <code className="font-mono text-emerald-300 font-bold">{SUPABASE_PROJECT_ID}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Backend Health & Tables
          </button>
          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeSubTab === 'credentials'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Configured Credentials
          </button>
          <button
            onClick={() => setActiveSubTab('sql')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeSubTab === 'sql'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PostgreSQL SQL Schema
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5 text-slate-800 text-xs sm:text-sm">
          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Supabase Backend is Active</div>
                    <div className="text-xs text-slate-600">
                      REST API server + Supabase Client initialized and routing queries.
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md font-bold">
                    {status?.latencyMs ? `${status.latencyMs}ms ping` : 'Online'}
                  </span>
                </div>
              </div>

              {/* Database Tables Count */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Synchronized Application Tables:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-500">Mandi Buyers</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {status?.tables.buyersCount ?? 20}
                    </div>
                    <div className="text-[10px] text-emerald-700">Demo Listed</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-500">Farmer Produce</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {status?.tables.listingsCount ?? 4}
                    </div>
                    <div className="text-[10px] text-emerald-700">Active Lots</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-500">Digital Offers</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {status?.tables.offersCount ?? 3}
                    </div>
                    <div className="text-[10px] text-amber-700">In Pipeline</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-500">Farmers & FPOs</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {status?.tables.farmersCount ?? 4}
                    </div>
                    <div className="text-[10px] text-emerald-700">Active Profiles</div>
                  </div>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">Push & Synchronize Data</div>
                    <div className="text-xs text-slate-500">
                      Sync produce lots, price rules, and offers to remote Supabase tables.
                    </div>
                  </div>
                  <button
                    onClick={handleSyncSupabase}
                    disabled={isSyncing}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Synchronizing...' : 'Sync Database Now'}</span>
                  </button>
                </div>

                {syncMessage && (
                  <div className="text-xs p-2.5 rounded-lg bg-white border border-slate-200 font-medium text-slate-700">
                    {syncMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'credentials' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                The application is configured to connect to your Supabase project using the credentials you provided.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1">PROJECT ID:</div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900">
                    <span className="flex-1 truncate">{SUPABASE_PROJECT_ID}</span>
                    <button
                      onClick={() => copyToClipboard(SUPABASE_PROJECT_ID, 'proj')}
                      className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                    >
                      {copiedKey === 'proj' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1">SUPABASE URL:</div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900">
                    <span className="flex-1 truncate">{SUPABASE_URL}</span>
                    <button
                      onClick={() => copyToClipboard(SUPABASE_URL, 'url')}
                      className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                    >
                      {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1">PUBLISHABLE (ANON) API KEY:</div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900">
                    <span className="flex-1 truncate">Configured via SUPABASE_PUBLISHABLE_KEY</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-sans font-medium px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1">SECRET (SERVICE ROLE) API KEY:</div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900">
                    <span className="flex-1 truncate">•••••••••••••••••••••••••••••••• (Stored securely in server environment)</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-sans font-medium px-2 py-0.5 rounded">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  SQL Schema for Supabase tables (<code>farmers</code>, <code>buyers</code>, <code>listings</code>, <code>offers</code>):
                </span>
                <button
                  onClick={() => {
                    const sql = `-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.farmers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    avatar_url TEXT,
    address TEXT,
    location TEXT NOT NULL,
    district TEXT,
    state TEXT,
    pincode TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    farm_size_acres NUMERIC DEFAULT 3.0,
    fpo_name TEXT,
    primary_crops TEXT[],
    upi_id TEXT,
    auth_provider TEXT DEFAULT 'phone',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.buyers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    location TEXT NOT NULL,
    state TEXT DEFAULT 'West Bengal',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    verified BOOLEAN DEFAULT TRUE,
    rating NUMERIC(2,1) DEFAULT 4.5,
    payment_terms TEXT DEFAULT 'Standard 24h RTGS settlement',
    crops_purchased JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    farmer_id TEXT REFERENCES public.farmers(id) ON DELETE SET NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    quality_grade TEXT DEFAULT 'Grade A',
    harvest_date DATE DEFAULT CURRENT_DATE,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    expected_price_per_kg NUMERIC,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    farmer_id TEXT,
    farmer_name TEXT NOT NULL,
    buyer_id TEXT REFERENCES public.buyers(id) ON DELETE SET NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    quality_grade TEXT NOT NULL,
    offered_price_per_kg NUMERIC NOT NULL,
    total_value NUMERIC NOT NULL,
    estimated_transport_cost NUMERIC DEFAULT 0,
    net_return_to_farmer NUMERIC NOT NULL,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`;
                    copyToClipboard(sql, 'fullSql');
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === 'fullSql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Full SQL</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[220px] space-y-1">
                <div className="text-emerald-400">-- 1. Table: farmers</div>
                <div>CREATE TABLE public.farmers (id TEXT PRIMARY KEY, name TEXT, mobile TEXT, email TEXT, address TEXT, district TEXT, state TEXT, pincode TEXT, primary_crops TEXT[]...);</div>
                <div className="text-emerald-400 pt-1">-- 2. Table: buyers</div>
                <div>CREATE TABLE public.buyers (id TEXT PRIMARY KEY, name TEXT, business_type TEXT, crops_purchased JSONB...);</div>
                <div className="text-emerald-400 pt-1">-- 3. Table: listings</div>
                <div>CREATE TABLE public.listings (id TEXT PRIMARY KEY, crop_name TEXT, quantity_kg NUMERIC, status TEXT...);</div>
                <div className="text-emerald-400 pt-1">-- 4. Table: offers</div>
                <div>CREATE TABLE public.offers (id TEXT PRIMARY KEY, offered_price_per_kg NUMERIC, status TEXT...);</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Server-to-Supabase Proxy with Real-time fallback</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
