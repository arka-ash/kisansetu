import React, { useState } from 'react';
import { BuyerMatchResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Star, ArrowUpDown, Send, MapPin, Truck, CheckCircle2 } from 'lucide-react';

interface BuyerComparisonTableProps {
  matches?: BuyerMatchResult[];
  onSendOffer: (match: BuyerMatchResult) => void;
  quantityKg?: number;
}

export const BuyerComparisonTable: React.FC<BuyerComparisonTableProps> = ({
  matches = [],
  onSendOffer,
}) => {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'netReturn' | 'pricePerKg' | 'distanceKm' | 'overallScore'>('netReturn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [distanceFilter, setDistanceFilter] = useState<number>(1000);

  const handleSort = (field: 'netReturn' | 'pricePerKg' | 'distanceKm' | 'overallScore') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'distanceKm' ? 'asc' : 'desc');
    }
  };

  const safeMatches = matches || [];
  const filteredMatches = safeMatches.filter((m) => (m.distanceKm || 0) <= distanceFilter);

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    let multiplier = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'netReturn') return (a.netReturn - b.netReturn) * multiplier;
    if (sortBy === 'pricePerKg') return (a.pricePerKg - b.pricePerKg) * multiplier;
    if (sortBy === 'distanceKm') return (a.distanceKm - b.distanceKm) * multiplier;
    if (sortBy === 'overallScore') return (a.overallScore - b.overallScore) * multiplier;
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            {t('buyer_comparison_matrix', 'Buyer Comparison Matrix')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('comparison_subtitle', 'Compare current platform-listed prices, logistics freight estimates, and estimated net returns across potential buyers.')}
          </p>
        </div>

        {/* Distance Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium mr-1">{t('radius', 'Radius')}:</span>
          {[
            { label: t('all_filter', 'All'), value: 1000 },
            { label: '< 50 km', value: 50 },
            { label: '< 150 km', value: 150 },
            { label: '< 300 km', value: 300 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setDistanceFilter(item.value)}
              className={`px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                distanceFilter === item.value
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
            <tr>
              <th className="py-3.5 px-4">{t('table_buyer', 'Buyer & Mandi')}</th>
              <th
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-200/80 transition"
                onClick={() => handleSort('pricePerKg')}
              >
                <div className="flex items-center gap-1">
                  <span>{t('table_price', 'Price/kg')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-200/80 transition"
                onClick={() => handleSort('distanceKm')}
              >
                <div className="flex items-center gap-1">
                  <span>{t('table_distance', 'Distance')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-3">{t('table_demand', 'Demand')}</th>
              <th className="py-3.5 px-3">{t('table_transport', 'Est. Transport')}</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/80 transition text-right"
                onClick={() => handleSort('netReturn')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('table_net_return', 'Net Return')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">{t('table_action', 'Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {sortedMatches.map((item) => {
              const isRecommended = item.isRecommended;
              return (
                <tr
                  key={item.buyer.id}
                  className={`transition ${
                    isRecommended
                      ? 'bg-emerald-50/80 font-medium hover:bg-emerald-100/60'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Buyer Column */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {isRecommended && (
                        <div className="bg-amber-400 text-slate-950 p-0.5 rounded" title="AI-Assisted Buyer Recommendation">
                          <Star className="w-3 h-3 fill-slate-950" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.buyer.name}</span>
                          {isRecommended && (
                            <span className="text-[10px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded-full">
                              {t('top_match_badge', 'TOP MATCH')}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.buyer.location}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900">₹{item.pricePerKg}</span>
                    <span className="text-[10px] text-slate-500">/kg</span>
                  </td>

                  {/* Distance */}
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-slate-700">{item.distanceKm} km</span>
                  </td>

                  {/* Demand */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.cropRequirement.demandLevel === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.cropRequirement.demandLevel}
                    </span>
                  </td>

                  {/* Transport */}
                  <td className="py-3.5 px-3">
                    <div className="text-slate-700 font-medium">
                      ₹{item.transportCost.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {item.transportDetails.vehicleType}
                    </div>
                  </td>

                  {/* Net Return */}
                  <td className="py-3.5 px-4 text-right">
                    <div className={`font-bold text-base ${isRecommended ? 'text-emerald-700 font-extrabold' : 'text-slate-900'}`}>
                      ₹{item.netReturn.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t('gross', 'Gross')}: ₹{item.grossRevenue.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSendOffer(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                        isRecommended
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>{t('send_offer', 'Send Digital Offer')}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
