import React, { useState } from 'react';
import { StorageFacility } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Warehouse,
  Phone,
  PhoneCall,
  MessageSquare,
  Mail,
  ShieldCheck,
  Award,
  Thermometer,
  Calendar,
  Layers,
  Search,
  Filter,
  IndianRupee,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface StorageDirectoryProps {
  facilities: StorageFacility[];
  farmerLocation?: string;
  onBookFacility?: (facility: StorageFacility, volumeQuintals: number, months: number) => void;
}

export const StorageDirectory: React.FC<StorageDirectoryProps> = ({
  facilities,
  farmerLocation = 'Durgapur, West Bengal',
  onBookFacility,
}) => {
  const { t } = useLanguage();
  // Calculator State
  const [selectedCrop, setSelectedCrop] = useState<string>('Potato');
  const [volumeQuintals, setVolumeQuintals] = useState<number>(100);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [includeSubsidy, setIncludeSubsidy] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [wdraOnly, setWdraOnly] = useState<boolean>(false);
  const [subsidyOnly, setSubsidyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price' | 'capacity' | 'name'>('price');

  // Contact / Booking Modal
  const [activeFacilityModal, setActiveFacilityModal] = useState<StorageFacility | null>(null);
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  // Storage Cost & Off-season gain estimation
  const calculateStorageMetrics = (facility: StorageFacility) => {
    const monthlyRate = facility.pricePerQuintalMonth;
    const grossTotalRent = volumeQuintals * monthlyRate * durationMonths;
    // WDRA / NABARD subsidy approx 15% discount for smallholder farmers
    const subsidyDiscount = includeSubsidy && facility.isSubsidyEligible ? grossTotalRent * 0.15 : 0;
    const netRent = grossTotalRent - subsidyDiscount;

    // Estimated seasonal price increase (e.g. Potato/Onion off-season +₹6 to +₹12/kg = +₹600 to +₹1200/quintal)
    const expectedAppreciationPerQuintal =
      selectedCrop === 'Potato'
        ? 450
        : selectedCrop === 'Onion'
        ? 600
        : selectedCrop === 'Rice / Paddy'
        ? 250
        : 350;

    const grossValueGain = volumeQuintals * expectedAppreciationPerQuintal;
    const netProfitGain = grossValueGain - netRent;

    return {
      grossTotalRent: Math.round(grossTotalRent),
      subsidyDiscount: Math.round(subsidyDiscount),
      netRent: Math.round(netRent),
      monthlyCost: Math.round(volumeQuintals * monthlyRate),
      dailyCost: (volumeQuintals * facility.dailyRatePerQuintal).toFixed(0),
      grossValueGain: Math.round(grossValueGain),
      netProfitGain: Math.round(netProfitGain),
    };
  };

  // Filtered Facilities
  const filteredFacilities = facilities
    .filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.supportedCrops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        facilityTypeFilter === 'ALL' || f.facilityType.includes(facilityTypeFilter);

      const matchesDistrict =
        districtFilter === 'ALL' || f.district === districtFilter;

      const matchesWdra = !wdraOnly || f.isWdraRegistered;
      const matchesSubsidy = !subsidyOnly || f.isSubsidyEligible;

      return matchesSearch && matchesType && matchesDistrict && matchesWdra && matchesSubsidy;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePerQuintalMonth - b.pricePerQuintalMonth;
      if (sortBy === 'capacity') return b.availableCapacityMt - a.availableCapacityMt;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const triggerCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const openWhatsApp = (f: StorageFacility) => {
    const cleanPhone = f.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Namaste ${f.managerName}, I am contacting from KisanSetu. I need warehouse space for ${volumeQuintals} Quintals of ${selectedCrop} for approx ${durationMonths} months at ${f.name}. Is space available?`
    );
    const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleConfirmStorageInquiry = (f: StorageFacility) => {
    if (onBookFacility) {
      onBookFacility(f, volumeQuintals, durationMonths);
    }
    setBookingToast(
      `Storage space inquiry submitted to ${f.name}. Manager ${f.managerName} (${f.phone}) will contact you with gate-in slip!`
    );
    setActiveFacilityModal(null);
    setTimeout(() => setBookingToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-800 text-emerald-200 text-xs px-3 py-1 rounded-full font-medium">
            <Warehouse className="w-3.5 h-3.5" />
            <span>{t('storage', 'Warehouse & Cold Storage Rental Directory')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans">
            {t('storage_directory_title', 'Compare Warehouse Rental Prices & Direct Manager Contacts')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('storage_directory_desc', 'Compare WDRA registered cold storages (0-4°C), dry grain godowns, and ventilated onion sheds. Secure government e-NWR receipts and NABARD rental subsidy.')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
            {facilities.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{t('certified_godowns', 'Certified Warehouses Available')}</div>
            <div className="text-[11px] text-teal-300">Paschim & Purba Bardhaman</div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {bookingToast && (
        <div className="bg-emerald-900 border border-emerald-700 text-emerald-100 p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{bookingToast}</span>
          </div>
          <button onClick={() => setBookingToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Storage Rent & Off-Season Profit Calculator */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans">
                {t('storage_calc_title', 'Warehouse Rent & Cost Calculator')}
              </h2>
              <p className="text-xs text-slate-500">
                Calculate monthly warehouse rent vs expected off-season market appreciation
              </p>
            </div>
          </div>
          <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-bold">
            WDRA Benchmark Rates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Crop Selector */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1">{t('crop_name', 'Crop to Store')}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-700"
            >
              <option value="Potato">🥔 Potato (Cold Storage)</option>
              <option value="Onion">🧅 Onion (Ventilated Shed)</option>
              <option value="Rice / Paddy">🌾 Rice / Paddy (Dry Godown)</option>
              <option value="Mustard">🌼 Mustard Seeds</option>
              <option value="Wheat">🌾 Wheat Grain</option>
              <option value="Apple">🍎 Apple (CA Storage)</option>
            </select>
          </div>

          {/* Quantity in Quintals */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">{t('volume_qtl_label', 'Volume (Quintals)')}</label>
              <span className="text-xs font-extrabold text-emerald-700 font-sans">{volumeQuintals} {t('quintals', 'Qtl')}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={volumeQuintals}
              onChange={(e) => setVolumeQuintals(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>10 Qtl (1 MT)</span>
              <span>500 Qtl</span>
              <span>1000 Qtl (100 MT)</span>
            </div>
          </div>

          {/* Storage Duration */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">{t('duration_months_label', 'Duration (Months)')}</label>
              <span className="text-xs font-extrabold text-emerald-700 font-sans">{durationMonths} {t('months', 'Months')}</span>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1 Month</span>
              <span>3 Mos</span>
              <span>9 Months</span>
            </div>
          </div>

          {/* Subsidy Toggle */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">{t('subsidy_check_label', 'NABARD Subsidy')}</label>
              <input
                type="checkbox"
                checked={includeSubsidy}
                onChange={(e) => setIncludeSubsidy(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              15% rental discount for Kisan Credit Card / Smallholder farmers
            </p>
            <span className="text-[10px] font-bold text-emerald-700 mt-1">
              {includeSubsidy ? '● Subsidy Applied' : '○ Standard Commercial Rate'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_storage_placeholder', 'Search warehouse name, district, crop, manager...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={facilityTypeFilter}
            onChange={(e) => setFacilityTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium"
          >
            <option value="ALL">{t('all_facilities', 'All Facility Types')}</option>
            <option value="Cold Storage">{t('cold_storage', 'Cold Storage (0-4°C)')}</option>
            <option value="Dry Grain">{t('dry_warehouse', 'Dry Grain Godown')}</option>
            <option value="CA Controlled">{t('ca_storage', 'CA Controlled Storage')}</option>
            <option value="Ventilated Onion">{t('onion_storage', 'Ventilated Onion Shed')}</option>
            <option value="Multi-Commodity">{t('multi_commodity', 'Multi-Commodity Hub')}</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium"
          >
            <option value="ALL">All Districts</option>
            <option value="Paschim Bardhaman">Paschim Bardhaman</option>
            <option value="Purba Bardhaman">Purba Bardhaman</option>
          </select>

          <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 cursor-pointer font-medium hover:bg-slate-100">
            <input
              type="checkbox"
              checked={wdraOnly}
              onChange={(e) => setWdraOnly(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('wdra_certified', 'WDRA Registered')}</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium"
          >
            <option value="price">Sort: Lowest Rental Price</option>
            <option value="capacity">Sort: Most Available Capacity</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Facilities Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFacilities.map((f, index) => {
          const metrics = calculateStorageMetrics(f);
          const capacityPercent = Math.round(
            ((f.totalCapacityMt - f.availableCapacityMt) / f.totalCapacityMt) * 100
          );

          return (
            <div
              key={f.id}
              className={`bg-white rounded-3xl border ${
                index === 0 && sortBy === 'price'
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200'
              } shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between`}
            >
              {/* Header Badge */}
              {index === 0 && sortBy === 'price' && (
                <div className="bg-teal-700 text-white text-[10px] font-bold px-3 py-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Lowest Rental Price in Region</span>
                  </span>
                  <span>🏆 Best Economy</span>
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Facility Name & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 font-sans leading-tight">
                      {f.name}
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg shrink-0 border border-slate-200">
                      {f.facilityType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{f.location}, {f.district}</span>
                  </div>
                </div>

                {/* Certifications Row */}
                <div className="flex flex-wrap gap-1.5">
                  {f.isWdraRegistered && (
                    <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <Award className="w-3 h-3" />
                      <span>WDRA Registered (e-NWR Receipts)</span>
                    </span>
                  )}
                  {f.isSubsidyEligible && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      <span>NABARD Subsidy Eligible</span>
                    </span>
                  )}
                </div>

                {/* Capacity Meter */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Available Space:</span>
                    <span className="font-extrabold text-slate-900 font-sans">
                      {f.availableCapacityMt.toLocaleString()} MT{' '}
                      <span className="text-slate-400 font-normal">/ {f.totalCapacityMt.toLocaleString()} MT</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Occupied: {capacityPercent}%</span>
                    <span className="text-emerald-700 font-semibold">{f.availableCapacityMt} MT Free</span>
                  </div>
                </div>

                {/* Price & Rent Details */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Warehouse Rent Rate:</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 font-sans">
                        ₹{f.pricePerQuintalMonth}
                      </span>
                      <span className="text-xs font-normal text-slate-500"> /quintal/month</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        (₹{f.dailyRatePerQuintal}/qtl daily)
                      </span>
                    </div>
                  </div>

                  {/* Calculated for user volume */}
                  <div className="bg-teal-50/80 border border-teal-100 p-2.5 rounded-xl text-[11px] text-teal-900 space-y-1">
                    <div className="flex justify-between">
                      <span>Total for {volumeQuintals} Qtl × {durationMonths} Mo:</span>
                      <strong className="font-sans font-bold">₹{metrics.netRent.toLocaleString()}</strong>
                    </div>
                    {metrics.subsidyDiscount > 0 && (
                      <div className="flex justify-between text-[10px] text-emerald-700">
                        <span>NABARD Subsidy Savings (15%):</span>
                        <span>-₹{metrics.subsidyDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Temperature & Supported Crops */}
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">{f.temperatureRange}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {f.supportedCrops.map((crop) => (
                      <span key={crop} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Footer with Direct Phone & Manager Name */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-0.5">
                  <div className="text-[11px] text-slate-500">Warehouse In-Charge:</div>
                  <div className="font-bold text-slate-900">{f.managerName}</div>
                  <a
                    href={`tel:${f.phone.replace(/\s+/g, '')}`}
                    className="text-emerald-800 hover:text-emerald-900 font-mono font-bold flex items-center gap-1 pt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{f.phone}</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerCall(f.phone)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('call_manager_btn', 'Call Manager')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsApp(f)}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('whatsapp_btn', 'WhatsApp')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFacilityModal(f)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>{t('book_space_btn', 'Book Storage Space')}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredFacilities.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Warehouse className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No warehouses match current filter</h3>
            <p className="text-xs text-slate-500">
              Try adjusting the facility type or district filter to discover available storage.
            </p>
            <button
              onClick={() => {
                setFacilityTypeFilter('ALL');
                setDistrictFilter('ALL');
                setWdraOnly(false);
                setSubsidyOnly(false);
                setSearchQuery('');
              }}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Warehouse Details & Booking Modal */}
      {activeFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{activeFacilityModal.name}</h3>
                  <p className="text-xs text-slate-400">{activeFacilityModal.facilityType}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveFacilityModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900">Storage Estimate Summary</span>
                  <span className="text-teal-700 font-mono">{durationMonths} Months</span>
                </div>
                <div className="text-slate-700 space-y-1 text-[11px]">
                  <div>Crop: <strong>{selectedCrop}</strong></div>
                  <div>Quantity: <strong>{volumeQuintals} Quintals ({(volumeQuintals / 10).toFixed(1)} MT)</strong></div>
                  <div>Monthly Rent: <strong>₹{activeFacilityModal.pricePerQuintalMonth} /quintal/mo</strong></div>
                  <div>Estimated Total: <strong>₹{calculateStorageMetrics(activeFacilityModal).netRent.toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Facility Amenities & Security</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeFacilityModal.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Manager Contact Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Direct Manager Contact</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-600">Manager:</span>
                    <strong className="text-slate-900">{activeFacilityModal.managerName}</strong>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-600">Phone:</span>
                    <strong className="text-emerald-800">{activeFacilityModal.phone}</strong>
                  </div>
                  {activeFacilityModal.email && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-600">Email:</span>
                      <strong className="text-slate-800">{activeFacilityModal.email}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerCall(activeFacilityModal.phone)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Warehouse</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmStorageInquiry(activeFacilityModal)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Request Gate-in Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
