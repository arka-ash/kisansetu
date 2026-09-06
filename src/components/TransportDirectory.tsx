import React, { useState } from 'react';
import { TransporterOption } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Truck,
  Phone,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Star,
  Navigation,
  MapPin,
  IndianRupee,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Sparkles,
  ThermometerSnowflake,
  Weight,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface TransportDirectoryProps {
  transporters: TransporterOption[];
  farmerLocation?: string;
  onBookTransporter?: (transporter: TransporterOption, distanceKm: number, weightKg: number) => void;
}

export const TransportDirectory: React.FC<TransportDirectoryProps> = ({
  transporters,
  farmerLocation = 'Durgapur, West Bengal',
  onBookTransporter,
}) => {
  const { t } = useLanguage();
  // Calculator State
  const [distanceKm, setDistanceKm] = useState<number>(45);
  const [cargoWeightKg, setCargoWeightKg] = useState<number>(1000);
  const [destinationMandi, setDestinationMandi] = useState<string>('Asansol APMC Mandi (45 km)');
  const [includeLoadingHelper, setIncludeLoadingHelper] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [reeferOnly, setReeferOnly] = useState<boolean>(false);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rate' | 'totalCost' | 'rating' | 'capacity'>('totalCost');

  // Contact Modal
  const [activeTransporterModal, setActiveTransporterModal] = useState<TransporterOption | null>(null);
  const [bookingSuccessToast, setBookingSuccessToast] = useState<string | null>(null);

  // Pre-configured Mandi Distances from Durgapur
  const POPULAR_DESTINATIONS = [
    { name: 'Asansol APMC Mandi', distance: 45 },
    { name: 'Raniganj Wholesale Mandi', distance: 28 },
    { name: 'Bardhaman Super Market', distance: 68 },
    { name: 'Panagarh Agri Logistics Hub', distance: 18 },
    { name: 'Bankura Krishak Bazaar', distance: 54 },
    { name: 'Dankuni / Kolkata Wholesale Terminal', distance: 165 },
    { name: 'Dhanbad Mandi (Jharkhand)', distance: 110 },
  ];

  const handleDestinationChange = (destName: string, dist: number) => {
    setDestinationMandi(`${destName} (${dist} km)`);
    setDistanceKm(dist);
  };

  // Calculate freight cost for a transporter
  const calculateFreight = (t: TransporterOption) => {
    const base = t.baseCharge;
    const distanceCost = distanceKm * t.perKmRate;
    const helper = includeLoadingHelper ? t.loadingHelperCharge : 0;
    const total = base + distanceCost + helper;
    const costPerKg = (total / Math.max(cargoWeightKg, 100)).toFixed(2);

    return {
      totalCost: Math.round(total),
      baseCharge: base,
      distanceCost: Math.round(distanceCost),
      helperCharge: helper,
      costPerKg,
    };
  };

  // Filtered & Sorted Transporters
  const filteredTransporters = transporters
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.operatingHub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery);

      const matchesVehicle =
        vehicleFilter === 'ALL' ||
        (vehicleFilter === 'PICKUP' && t.capacityKg <= 1500) ||
        (vehicleFilter === 'MEDIUM' && t.capacityKg > 1500 && t.capacityKg <= 4000) ||
        (vehicleFilter === 'HEAVY' && t.capacityKg > 4000);

      const matchesReefer = !reeferOnly || t.hasRefrigeration;
      const matchesAvailable = !availableOnly || t.availableNow;

      return matchesSearch && matchesVehicle && matchesReefer && matchesAvailable;
    })
    .sort((a, b) => {
      if (sortBy === 'rate') return a.perKmRate - b.perKmRate;
      if (sortBy === 'totalCost') {
        return calculateFreight(a).totalCost - calculateFreight(b).totalCost;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'capacity') return b.capacityKg - a.capacityKg;
      return 0;
    });

  const triggerCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const openWhatsApp = (t: TransporterOption) => {
    const cleanPhone = t.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Namaste ${t.name}, I am a farmer contacting via KisanSetu. I need transport for ${cargoWeightKg}kg produce from ${farmerLocation} to ${destinationMandi} (~${distanceKm}km). Is your vehicle ${t.vehicleType} (${t.vehicleNumber}) available?`
    );
    const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const handleConfirmBookingInquiry = (t: TransporterOption) => {
    if (onBookTransporter) {
      onBookTransporter(t, distanceKm, cargoWeightKg);
    }
    setBookingSuccessToast(`Booking inquiry sent to ${t.name} (${t.phone}). The driver will call you shortly!`);
    setActiveTransporterModal(null);
    setTimeout(() => setBookingSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-800 text-emerald-200 text-xs px-3 py-1 rounded-full font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>{t('transport', 'Direct Agricultural Transport & Freight Directory')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans">
            {t('transport_directory_title', 'Compare Transporter Rates & Direct Contact Numbers')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('transport_directory_desc', 'Compare verified local farm transport operators, small pickups (Tata Ace / Bolero), refrigerated reefer vans, and heavy mandi trucks with 100% transparent per-km rates.')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
            {transporters.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{t('verified_transporters', 'Verified Transporters Available')}</div>
            <div className="text-[11px] text-emerald-400">Ready for farm-gate dispatch</div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {bookingSuccessToast && (
        <div className="bg-emerald-900 border border-emerald-700 text-emerald-100 p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{bookingSuccessToast}</span>
          </div>
          <button onClick={() => setBookingSuccessToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Freight Rate Simulator */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans">
                {t('freight_calc_title', 'Fast Freight Cost Calculator')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('origin_label', 'Origin')}: <strong className="text-slate-800">{farmerLocation}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            Live Rate Calculation
          </span>
        </div>

        {/* Quick Destination Mandi Pills */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">{t('dest_label', 'Destination Mandi / Hub')}:</span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_DESTINATIONS.map((dest) => {
              const isSelected = destinationMandi.includes(dest.name);
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleDestinationChange(dest.name, dest.distance)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{dest.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    ({dest.distance} km)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance and Weight Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Distance Input */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">{t('distance', 'Trip Distance')}</label>
              <span className="text-xs font-extrabold text-emerald-700 font-sans">{distanceKm} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="350"
              step="5"
              value={distanceKm}
              onChange={(e) => {
                setDistanceKm(Number(e.target.value));
                setDestinationMandi(`Custom Route (${e.target.value} km)`);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>5 km (Local)</span>
              <span>150 km</span>
              <span>350 km (Inter-State)</span>
            </div>
          </div>

          {/* Cargo Weight Input */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">{t('cargo_weight_label', 'Cargo Weight (kg)')}</label>
              <span className="text-xs font-extrabold text-emerald-700 font-sans">
                {cargoWeightKg} kg ({(cargoWeightKg / 100).toFixed(1)} {t('quintals', 'Qtl')})
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="9000"
              step="100"
              value={cargoWeightKg}
              onChange={(e) => setCargoWeightKg(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>200 kg</span>
              <span>1.5 MT (Bolero)</span>
              <span>9 MT (Truck)</span>
            </div>
          </div>

          {/* Helper Toggle */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">{t('helper_charge_label', 'Loading / Unloading Helper')}</label>
              <input
                type="checkbox"
                checked={includeLoadingHelper}
                onChange={(e) => setIncludeLoadingHelper(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Includes 1-2 helpers for farm-gate loading into vehicle
            </p>
            <span className="text-[10px] font-bold text-emerald-700 mt-1">
              {includeLoadingHelper ? 'Helper Assistance Included (₹150 - ₹400)' : 'Self Loading by Farmer'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_transporter_placeholder', 'Search driver, agency, vehicle, phone...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium"
          >
            <option value="ALL">{t('all_vehicles', 'All Vehicle Capacities')}</option>
            <option value="PICKUP">{t('pickup_tempo', 'Small Pickups (≤ 1.5 MT)')}</option>
            <option value="MEDIUM">{t('medium_truck', 'Medium Trucks (1.5 - 4 MT)')}</option>
            <option value="HEAVY">{t('heavy_truck', 'Heavy Trucks (> 4 MT)')}</option>
          </select>

          <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 cursor-pointer font-medium hover:bg-slate-100">
            <input
              type="checkbox"
              checked={reeferOnly}
              onChange={(e) => setReeferOnly(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
            <span>{t('reefer_van', 'Refrigerated / Cold')}</span>
          </label>

          <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 cursor-pointer font-medium hover:bg-slate-100">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>Available Now</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium"
          >
            <option value="totalCost">Sort: Lowest Total Trip Cost</option>
            <option value="rate">Sort: Lowest Per-Km Rate</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="capacity">Sort: Largest Capacity</option>
          </select>
        </div>
      </div>

      {/* Transporters Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTransporters.map((transporter, index) => {
          const freight = calculateFreight(transporter);
          const isCapacitySuitable = transporter.capacityKg >= cargoWeightKg;

          return (
            <div
              key={transporter.id}
              className={`bg-white rounded-3xl border ${
                index === 0 && sortBy === 'totalCost'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              } shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between relative`}
            >
              {/* Recommended Lowest Cost Badge */}
              {index === 0 && sortBy === 'totalCost' && (
                <div className="bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Best Estimated Economy for {distanceKm}km Trip</span>
                  </span>
                  <span>⭐ Top Choice</span>
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Header: Driver Name & Vehicle Type */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900 font-sans">{transporter.name}</h3>
                      {transporter.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Driver / Fleet" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{transporter.agencyName}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{transporter.rating}</span>
                    <span className="text-[10px] text-amber-700 font-normal">({transporter.tripsCompleted})</span>
                  </div>
                </div>

                {/* Vehicle Specs Badge */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{transporter.vehicleType}</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {transporter.vehicleNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Max Capacity: <strong className="text-slate-900">{transporter.capacityTon} MT ({transporter.capacityKg} kg)</strong></span>
                    {transporter.hasRefrigeration ? (
                      <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                        <ThermometerSnowflake className="w-3 h-3" />
                        <span>Chilled Reefer</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-semibold ${transporter.availableNow ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {transporter.availableNow ? '● Ready for Pickup' : '○ On Trip'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transparent Rate Breakdown */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Calculated Trip Freight:</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 font-sans">
                        ₹{freight.totalCost.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (~₹{freight.costPerKg}/kg for {cargoWeightKg}kg load)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-slate-50/80 p-2 rounded-xl text-slate-600 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Per Km</span>
                      <strong className="text-slate-800">₹{transporter.perKmRate}/km</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Base Fee</span>
                      <strong className="text-slate-800">₹{transporter.baseCharge}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Helper</span>
                      <strong className="text-slate-800">₹{transporter.loadingHelperCharge}</strong>
                    </div>
                  </div>
                </div>

                {/* Operating Hub */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Hub: {transporter.operatingHub}</span>
                </div>
              </div>

              {/* Direct Phone & Contact Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                {/* Direct Phone Display */}
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">Direct Mobile:</span>
                  <a
                    href={`tel:${transporter.phone.replace(/\s+/g, '')}`}
                    className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 font-mono tracking-tight"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{transporter.phone}</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerCall(transporter.phone)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('call_btn', 'Call Transporter')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsApp(transporter)}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('whatsapp_btn', 'WhatsApp')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTransporterModal(transporter)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>{t('book_trip_btn', 'Book Trip Now')}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredTransporters.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Truck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No transporters match current filter</h3>
            <p className="text-xs text-slate-500">
              Try changing the vehicle capacity or removing the refrigerated filter.
            </p>
            <button
              onClick={() => {
                setVehicleFilter('ALL');
                setReeferOnly(false);
                setAvailableOnly(false);
                setSearchQuery('');
              }}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Transporter Details & Booking Inquiry Modal */}
      {activeTransporterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{activeTransporterModal.name}</h3>
                  <p className="text-xs text-slate-400">{activeTransporterModal.agencyName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTransporterModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Trip Summary</span>
                  <span className="text-emerald-700 font-mono">{distanceKm} km</span>
                </div>
                <div className="text-slate-700 space-y-1 text-[11px]">
                  <div>From: <strong>{farmerLocation}</strong></div>
                  <div>To: <strong>{destinationMandi}</strong></div>
                  <div>Cargo: <strong>{cargoWeightKg} kg</strong></div>
                  <div>Vehicle: <strong>{activeTransporterModal.vehicleType} ({activeTransporterModal.vehicleNumber})</strong></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Direct Contact Numbers</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-600">Primary Mobile:</span>
                    <strong className="text-emerald-800">{activeTransporterModal.phone}</strong>
                  </div>
                  {activeTransporterModal.alternatePhone && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-600">Alternate / Fleet Desk:</span>
                      <strong className="text-slate-800">{activeTransporterModal.alternatePhone}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Transparent Freight Cost</h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Booking Charge:</span>
                    <span>₹{activeTransporterModal.baseCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance Freight ({distanceKm} km @ ₹{activeTransporterModal.perKmRate}/km):</span>
                    <span>₹{distanceKm * activeTransporterModal.perKmRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loading Helper Service:</span>
                    <span>₹{includeLoadingHelper ? activeTransporterModal.loadingHelperCharge : 0}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-xs text-slate-900">
                    <span>Estimated Total Freight:</span>
                    <span className="text-emerald-700 text-sm">
                      ₹{calculateFreight(activeTransporterModal).totalCost}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerCall(activeTransporterModal.phone)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Directly</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmBookingInquiry(activeTransporterModal)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send Dispatch Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
