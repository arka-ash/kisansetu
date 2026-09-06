import React from 'react';
import { BuyerMatchResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Award, IndianRupee } from 'lucide-react';

interface PriceChartProps {
  matches?: BuyerMatchResult[];
  cropName: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ matches = [], cropName }) => {
  const { t } = useLanguage();
  if (!matches || matches.length === 0) return null;

  // Format data for chart (top 6-8 buyers for clean visualization)
  const chartData = matches.slice(0, 8).map((m) => ({
    name: m.buyer?.name?.length > 16 ? m.buyer.name.slice(0, 14) + '...' : m.buyer?.name || 'Buyer',
    fullName: m.buyer?.name || 'Buyer',
    location: m.buyer?.location || 'Regional Market',
    pricePerKg: m.pricePerKg || 0,
    netReturn: m.netReturn || 0,
    transportCost: m.transportCost || 0,
    distanceKm: m.distanceKm || 0,
    isRecommended: m.isRecommended || false,
  }));

  const avgPrice = Math.round(
    (chartData.reduce((acc, curr) => acc + curr.pricePerKg, 0) / chartData.length) * 10
  ) / 10;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              {t('price_chart_title', 'Buyer Price & Net Return Comparison')}
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              {cropName}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('price_chart_subtitle', 'Compare current platform-listed prices (₹/kg) across potential buyers against the regional average.')}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-700" />
            <span className="text-slate-600">{t('top_recommended_legend', 'Top Recommended Buyer')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-400" />
            <span className="text-slate-600">{t('alternative_legend', 'Alternative Potential Buyers')}</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              angle={-20}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 11, fill: '#475569' }}
            />
            <YAxis
              domain={[0, 'dataMax + 5']}
              tick={{ fontSize: 11, fill: '#475569' }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1 max-w-xs">
                      <div className="font-bold text-slate-100 flex items-center gap-1">
                        {data.isRecommended && <Award className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{data.fullName}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{data.location} (~{data.distanceKm} km)</div>
                      <div className="pt-1 border-t border-slate-700 flex justify-between gap-4">
                        <span className="text-slate-300">{t('offered_price', 'Price Rate')}:</span>
                        <span className="font-bold text-emerald-400">₹{data.pricePerKg}/kg</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-300">{t('transport_freight', 'Freight Cost')}:</span>
                        <span className="text-red-400">-₹{data.transportCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-700">
                        <span className="text-slate-200 font-medium">{t('est_net_return', 'Estimated Net Return')}:</span>
                        <span className="font-bold text-white text-sm">₹{data.netReturn.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={avgPrice}
              stroke="#D97706"
              strokeDasharray="4 4"
              label={{
                value: `Avg: ₹${avgPrice}/kg`,
                position: 'top',
                fill: '#B45309',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="pricePerKg" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isRecommended ? '#047857' : '#94A3B8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between border border-slate-200">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span>
            {t('regional_avg_mandi', 'Regional Market Average')}: <strong className="text-slate-900">₹{avgPrice}/kg</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Tip: Higher buying rates often offset longer freight distances for larger harvest volumes.
        </span>
      </div>
    </div>
  );
};
