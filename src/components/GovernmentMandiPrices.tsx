import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  Sprout,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MANDI_FALLBACK_RECORDS } from '../data/mandifallback';

export interface MandiPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  minPricePerKg: number;
  maxPricePerKg: number;
  modalPricePerKg: number;
}

interface MandiApiResponse {
  source: string;
  isLiveApi: boolean;
  isFallback: boolean;
  disclaimer: string;
  recordsCount: number;
  records: MandiPriceRecord[];
}

export const GovernmentMandiPrices: React.FC = () => {
  const { t } = useLanguage();
  const [records, setRecords] = useState<MandiPriceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [apiMeta, setApiMeta] = useState<{
    source: string;
    isLive: boolean;
    isFallback: boolean;
    disclaimer: string;
  }>({
    source: 'Government of India AGMARKNET (data.gov.in)',
    isLive: false,
    isFallback: true,
    disclaimer:
      'Daily reported APMC wholesale market prices sourced via Government of India open data platform (data.gov.in / AGMARKNET). These are daily reported benchmark prices, not guaranteed live auction bids.',
  });

 const fetchMandiPrices = async () => {
  setIsLoading(true);

  const useFallback = () => {
    let fallback = [...MANDI_FALLBACK_RECORDS];

    if (selectedCommodity !== 'All') {
      const q = selectedCommodity.toLowerCase();
      fallback = fallback.filter((r) =>
        r.commodity.toLowerCase().includes(q)
      );
    }

    if (selectedState !== 'All') {
      const q = selectedState.toLowerCase();
      fallback = fallback.filter((r) =>
        r.state.toLowerCase().includes(q)
      );
    }

    setRecords(fallback);

    setApiMeta({
      source: 'KisanSetu Demo Fallback Dataset',
      isLive: false,
      isFallback: true,
      disclaimer:
        'Government AGMARKNET/data.gov.in data is currently unavailable. KisanSetu is displaying demo mandi records so the marketplace remains usable. These values are for demonstration and should not be treated as live government prices.',
    });
  };

  try {
    const params = new URLSearchParams();

    if (selectedCommodity !== 'All') {
      params.append('commodity', selectedCommodity);
    }

    if (selectedState !== 'All') {
      params.append('state', selectedState);
    }

    const res = await fetch(`/api/mandi-prices?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Mandi API returned ${res.status}`);
    }

    const data: MandiApiResponse = await res.json();

    if (Array.isArray(data.records) && data.records.length > 0) {
      setRecords(data.records);

      setApiMeta({
        source: data.source,
        isLive: data.isLiveApi,
        isFallback: data.isFallback,
        disclaimer: data.disclaimer,
      });

      return;
    }

    // API responded successfully but returned no records
    useFallback();
  } catch (err) {
    console.warn(
      'Government mandi API unavailable. Using KisanSetu fallback data.',
      err
    );

    useFallback();
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchMandiPrices();
  }, [selectedCommodity, selectedState]);

  // Derived filter options
  const uniqueCommodities = Array.from(new Set(records.map((r) => r.commodity))).filter(Boolean);
  const uniqueStates = Array.from(new Set(records.map((r) => r.state))).filter(Boolean);

  const displayedRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.market.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.commodity.toLowerCase().includes(q) ||
      r.variety.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Source Badge */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                Government Mandi Wholesale Prices
              </h2>
              {apiMeta.isLive ? (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live AGMARKNET Feed (data.gov.in)
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  Demo Mandi Data (Fallback Mode)
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
             Mandi price reference data from <strong>AGMARKNET / data.gov.in</strong> is used when the government feed is available. If the government API is unavailable, KisanSetu shows clearly labelled demo data so the marketplace remains functional.
            </p>
          </div>

          <button
            onClick={fetchMandiPrices}
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Agmarknet Feed</span>
          </button>
        </div>

        {/* Official Transparency & Disclaimer Alert */}
        <div className="mt-5 bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Official Agmarknet Regulatory Notice:</span>{' '}
            <span>{apiMeta.disclaimer}</span>
            <div className="text-[11px] text-amber-800/80 pt-0.5">
              Source Attribution: <strong>{apiMeta.source}</strong> • Directorate of Marketing & Inspection (DMI), Govt of India.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Mandi name, District, Commodity, Variety, or State..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Commodity:</span>
            </div>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="All">All Commodities</option>
              <option value="Onion">🧅 Onion</option>
              <option value="Potato">🥔 Potato</option>
              <option value="Tomato">🍅 Tomato</option>
              <option value="Wheat">🌾 Wheat</option>
              <option value="Paddy(Dhan)">🌾 Paddy / Dhan</option>
              <option value="Soyabean">🫘 Soyabean</option>
              <option value="Mustard">🌱 Mustard</option>
              <option value="Garlic">🧄 Garlic</option>
              <option value="Red Chilli">🌶️ Red Chilli</option>
              <option value="Cumin Seed(Jeera)">🌿 Cumin Seed (Jeera)</option>
              <option value="Groundnut">🥜 Groundnut</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-slate-600 ml-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">State:</span>
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="All">All States</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Punjab">Punjab</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
        </div>

        {/* Quick commodity filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] shrink-0">Popular:</span>
          {['All', 'Onion', 'Potato', 'Tomato', 'Wheat', 'Paddy(Dhan)', 'Mustard', 'Soyabean'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCommodity(c)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
                selectedCommodity === c
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c === 'All' ? 'All Crops' : c}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mandi Prices Data Display */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="text-xs text-slate-600">
            Showing <strong>{displayedRecords.length}</strong> official mandi reporting stations
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Prices quoted in <strong>₹ / Quintal (100 kg)</strong> and <strong>₹ / kg</strong></span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Retrieving official AGMARKNET mandi reports...</p>
          </div>
        ) : displayedRecords.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No APMC mandi records matched your filter criteria.</p>
            <p className="text-xs text-slate-400">Try resetting the commodity or state dropdowns above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Market / Mandi</th>
                  <th className="py-3 px-4">Commodity & Variety</th>
                  <th className="py-3 px-4">Min Price</th>
                  <th className="py-3 px-4">Max Price</th>
                  <th className="py-3 px-4">Modal Price (Benchmark)</th>
                  <th className="py-3 px-4">Arrival Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedRecords.map((r, index) => (
                  <tr key={`${r.market}-${r.commodity}-${index}`} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{r.market}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {r.district}, {r.state}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.commodity}</div>
                      <div className="text-[11px] text-slate-500">{r.variety}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-800 font-semibold">₹{r.minPrice.toLocaleString('en-IN')} / Qtl</div>
                      <div className="text-[11px] text-slate-500">₹{r.minPricePerKg} / kg</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-800 font-semibold">₹{r.maxPrice.toLocaleString('en-IN')} / Qtl</div>
                      <div className="text-[11px] text-slate-500">₹{r.maxPricePerKg} / kg</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex flex-col bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <span className="text-sm font-extrabold text-emerald-800 font-mono">
                          ₹{r.modalPrice.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-emerald-700">/ Qtl</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 font-mono">
                          ₹{r.modalPricePerKg} / kg
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{r.arrivalDate}</span>
                      </div>
                      <span className="inline-block mt-0.5 text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                        Reported
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
