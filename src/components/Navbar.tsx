import React, { useState } from 'react';
import { UserRole, FarmerProfile, BuyerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageModal } from './LanguageModal';
import {
  Sprout,
  Truck,
  Warehouse,
  Layers,
  MapPin,
  RefreshCw,
  User,
  Compass,
  Mail,
  Globe,
  ChevronDown,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentFarmer: FarmerProfile;
  currentBuyer: BuyerProfile;
  pendingOffersCount: number;
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenSihHub?: () => void;
  onOpenProfile: () => void;
  onOpenGmailAuth: () => void;
  onDetectLiveGps: () => void;
  isDetectingGps?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  currentFarmer,
  currentBuyer,
  pendingOffersCount,
  onResetDemo,
  isResetting,
  onOpenProfile,
  onOpenGmailAuth,
  onDetectLiveGps,
  isDetectingGps = false,
}) => {
  const { currentLanguageOption, t } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm">
      {/* Top Context Banner & GPS / Language / Auth Toolbar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/80">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide border border-emerald-700">
            KisanSetu
          </span>
          <span className="hidden lg:inline text-emerald-200">
            {t('tagline', 'Direct Farmer-to-Buyer Market Linkage & Transparent Price Discovery')}
          </span>
        </div>

        {/* Farmer ↔ Buyer/FPO/Mandi Portal Switch */}
        <div className="inline-flex p-0.5 bg-slate-900/90 border border-emerald-500/70 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => {
              setCurrentRole('farmer');
              if (activeTab === 'buyer') setActiveTab('sell');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'farmer'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-extrabold'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>🌾</span>
            <span>Farmer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentRole('buyer');
              setActiveTab('buyer');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'buyer'
                ? 'bg-emerald-500 text-slate-950 shadow-xs font-extrabold'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>🏢</span>
            <span>Buyer/FPO/Mandi Portal</span>
          </button>
        </div>

        {/* Top Right Live Controls: Language Button, GPS Detector, Gmail Auth, Reset */}
        <div className="flex items-center gap-2">
          {/* Small Language Changer Button on Top Bar */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white px-2.5 py-0.5 rounded-lg border border-emerald-700/80 transition cursor-pointer shadow-2xs group"
            title="Change Language / भाषा बदलें / ভাষা परिवर्तन করুন"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>{currentLanguageOption.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-emerald-400 opacity-80" />
          </button>

          {/* Live GPS Button */}
          <button
            onClick={onDetectLiveGps}
            disabled={isDetectingGps}
            className="flex items-center gap-1 text-[11px] bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white px-2.5 py-0.5 rounded-lg border border-emerald-700/80 transition cursor-pointer disabled:opacity-50"
            title="Detect your device GPS coordinates to auto-match nearby buyers and transport"
          >
            <Compass className={`w-3.5 h-3.5 text-emerald-400 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>
              {isDetectingGps
                ? t('detecting_gps', 'Detecting GPS...')
                : currentFarmer.location
                ? `📍 ${currentFarmer.location.split(',')[0]}`
                : `📍 ${t('detect_live_gps', 'Detect Live GPS')}`}
            </span>
          </button>

          {/* Google Auth Status Badge */}
          {currentFarmer.email ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 text-[11px] bg-slate-900/90 hover:bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-700/60 transition cursor-pointer"
              title={`Logged in as ${currentFarmer.email}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline font-mono">
                {currentFarmer.email.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenGmailAuth}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2 py-0.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <Mail className="w-3 h-3 text-red-400" />
              <span>{t('gmail_login', 'Gmail Login')}</span>
            </button>
          )}

          {/* Demo Reset */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Reset to fresh demo sample data"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isResetting ? t('resetting', 'Resetting...') : t('reset', 'Reset')}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab(currentRole === 'buyer' ? 'buyer' : 'sell')}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-inner border border-emerald-500/30">
              {currentRole === 'buyer' ? (
                <Building2 className="w-6 h-6 text-white" />
              ) : (
                <Sprout className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Kisan<span className="text-emerald-400">Setu</span>
                </span>
                <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-emerald-700">
                  {currentRole === 'buyer' ? 'Buyer & FPO' : t('direct_mandi', 'Direct Mandi')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {currentRole === 'buyer'
                  ? 'Agri-Business & FPO Procurement Gateway'
                  : t('sub_tagline', 'किसान सेतु • Direct Farmer Market & Logistics Gateway')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {currentRole === 'farmer' ? (
              <>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'sell'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  <span>{t('sell_produce', 'Sell Produce')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 relative ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{t('farmer_hub', 'Farmer Hub')}</span>
                  {pendingOffersCount > 0 && (
                    <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {pendingOffersCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'buyer'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Buyer Procurement</span>
              </button>
            )}

            {/* Mandi Prices Tab */}
            <button
              onClick={() => setActiveTab('mandiPrices')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mandiPrices'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Govt Mandi Prices</span>
            </button>

            <button
              onClick={() => setActiveTab('transport')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'transport'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>{t('transport', 'Transport')}</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'storage'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Warehouse className="w-4 h-4 text-teal-400" />
              <span>{t('storage', 'Storage')}</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t('mandi_map', 'Mandi Map')}</span>
            </button>
          </nav>

          {/* Farmer / Buyer Profile Button & Language Button */}
          <div className="flex items-center gap-2">
            {/* Desktop Language Button */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 bg-slate-800/95 hover:bg-slate-750 px-2.5 py-1.5 rounded-2xl border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer shadow-xs"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs">{currentLanguageOption.nativeName}</span>
            </button>

            {currentRole === 'farmer' ? (
              <button
                onClick={onOpenProfile}
                className="bg-slate-800/95 hover:bg-slate-750 px-3 py-1.5 rounded-2xl border border-slate-700 flex items-center gap-2.5 text-xs transition cursor-pointer shadow-xs group"
                title="Click to view & edit My Profile (Name, Address, GPS, Google Account)"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-400/40">
                  {currentFarmer.avatarUrl ? (
                    <img
                      src={currentFarmer.avatarUrl}
                      alt={currentFarmer.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                    <span>{currentFarmer.name}</span>
                    <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-1 py-0.2 rounded border border-emerald-700">
                      {t('profile', 'Profile')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {currentFarmer.location || 'Durgapur, WB'}
                  </div>
                </div>
              </button>
            ) : (
              <div className="bg-slate-800/95 px-3 py-1.5 rounded-2xl border border-slate-700 flex items-center gap-2.5 text-xs shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-400/40">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                    <span>{currentBuyer.name}</span>
                    <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-1 py-0.2 rounded border border-emerald-700">
                      Buyer
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {currentBuyer.location}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-[11px] overflow-x-auto">
          {currentRole === 'farmer' ? (
            <>
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
                  activeTab === 'sell' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Sprout className="w-4 h-4" />
                <span>{t('sell_produce', 'Sell')}</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 relative ${
                  activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('farmer_hub', 'Hub')}</span>
                {pendingOffersCount > 0 && (
                  <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
                activeTab === 'buyer' ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Procurement</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('mandiPrices')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
              activeTab === 'mandiPrices' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Mandi</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
              activeTab === 'transport' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{t('transport', 'Transport')}</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
              activeTab === 'storage' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>{t('storage', 'Storage')}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
              activeTab === 'map' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t('mandi_map', 'Map')}</span>
          </button>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 text-emerald-300 font-bold"
          >
            <Globe className="w-4 h-4" />
            <span>{currentLanguageOption.nativeName}</span>
          </button>
        </div>
      </div>

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </header>
  );
};

