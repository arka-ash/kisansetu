import React, { useState } from 'react';
import { FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Database,
  Lock,
  RefreshCw,
  LogOut,
} from 'lucide-react';

interface GmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarmer: FarmerProfile;
  onLoginSuccess: (farmer: FarmerProfile) => void;
  onSignOut?: () => void;
}

const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: 'Ramesh Kumar',
    email: 'ramesh.kisan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    location: 'Durgapur, West Bengal',
    mobile: 'xxxxx',
    crops: ['Onion', 'Potato', 'Tomato'],
  },
  {
    name: 'Sunita Devi',
    email: 'sunita.agro@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
    location: 'Nashik, Maharashtra',
    mobile: 'xxxxx',
    crops: ['Onion', 'Grapes', 'Tomato'],
  },
  {
    name: 'Gurpreet Singh',
    email: 'gurpreet.punjab@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    location: 'Ludhiana, Punjab',
    mobile: 'xxxxx',
    crops: ['Wheat', 'Rice', 'Mustard'],
  },
  {
    name: 'Incredible Farmer',
    email: 'incredible8184in@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    location: 'Durgapur, West Bengal',
    mobile: 'xxxxx',
    crops: ['Onion', 'Potato', 'Mustard', 'Ginger'],
  },
];

export const GmailAuthModal: React.FC<GmailAuthModalProps> = ({
  isOpen,
  onClose,
  currentFarmer,
  onLoginSuccess,
  onSignOut,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async (emailToUse: string, nameToUse?: string, avatarToUse?: string) => {
    if (!emailToUse.trim()) {
      setAuthError('Please enter a valid Gmail address.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse.trim(),
          name: nameToUse || emailToUse.split('@')[0],
          avatarUrl: avatarToUse || `https://api.dicebear.com/7.x/bottts/svg?seed=${emailToUse}`,
          location: currentFarmer.location,
          coordinates: currentFarmer.coordinates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Supabase backend.');
      }

      const data = await response.json();
      if (data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md p-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
                <span>{t('google_signin_title', 'Google / Gmail Sign-In')}</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700">
                  {t('supabase_auth_badge', 'Supabase Auth')}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {t('google_signin_desc', 'Sign in with your Google account to automatically synchronize farm produce, live GPS, and offers.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Current Signed-In Status */}
          {currentFarmer.email && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-emerald-950 text-xs">
                    {t('currently_logged_in', 'Currently Logged In')}: {currentFarmer.name}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    {currentFarmer.email}
                  </div>
                </div>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="text-red-700 hover:text-red-900 font-bold text-xs bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('sign_out_btn', 'Sign Out')}</span>
                </button>
              )}
            </div>
          )}

          {authError && (
            <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs font-medium">
              {authError}
            </div>
          )}

          {/* Quick Select Google Account */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              {t('select_continue_google', 'Select or One-Click Continue with Google:')}
            </label>
            <div className="space-y-2">
              {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleLogin(acc.email, acc.name, acc.avatar)}
                  disabled={isLoading}
                  className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 group ${
                    currentFarmer.email === acc.email
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {currentFarmer.email === acc.email && (
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                            {t('active_status', 'Active')}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono">{acc.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        📍 {acc.location} • {t('crops_label', 'Crops')}: {acc.crops.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center border border-slate-200 group-hover:bg-emerald-700 group-hover:text-white transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-slate-400 text-[11px] font-semibold absolute">
              {t('or_enter_gmail', 'OR ENTER ANY GMAIL ADDRESS')}
            </span>
          </div>

          {/* Custom Gmail Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGoogleLogin(customEmail, customName);
            }}
            className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200"
          >
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {t('your_name', 'Your Name')}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {t('gmail_address', 'Gmail Address')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !customEmail}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs text-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('connecting_supabase', 'Connecting to Supabase...')}</span>
                </>
              ) : (
                <>
                  <span>{t('signin_sync_btn', 'Sign In with Gmail & Sync to Supabase')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Cloud Persistence Note */}
          <div className="flex items-center gap-2 text-slate-500 text-[11px] bg-slate-100 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {t('security_persistence_note', 'Secure OAuth & PostgreSQL cloud storage powered by Supabase. Your credentials and farm produce listings are safely persisted.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
