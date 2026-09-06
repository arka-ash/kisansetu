import React, { useState } from 'react';
import { BuyerMatchResult, FarmerListing, FarmerProfile, QualityGrade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Star,
  Truck,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RecommendationCardProps {
  matches?: BuyerMatchResult[];
  match?: BuyerMatchResult;
  listing?: FarmerListing | null;
  cropName?: string;
  quantityKg?: number;
  qualityGrade?: QualityGrade;
  farmerLocation?: string;
  onSendOffer: (match: BuyerMatchResult) => void;
  onSelectBuyerForDetail?: (match: BuyerMatchResult) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  matches: propMatches,
  match: propMatch,
  listing,
  cropName = 'Produce',
  quantityKg = 500,
  qualityGrade = 'Grade A',
  farmerLocation = 'Farm Gate',
  onSendOffer,
  onSelectBuyerForDetail = (_match: BuyerMatchResult) => {},
}) => {
  const { t } = useLanguage();
  const [selectedBuyerForContact, setSelectedBuyerForContact] = useState<BuyerMatchResult | null>(null);
  const [showAllAlternatives, setShowAllAlternatives] = useState<boolean>(false);

  const effectiveMatches = propMatches || (propMatch ? [propMatch] : []);

  if (effectiveMatches.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{t('no_buyers_found', 'No Direct Buyers Found')}</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          {t('no_buyers_desc', 'We could not find active buyers purchasing this crop lot within the procurement radius.')}
        </p>
      </div>
    );
  }

  const topBuyer = propMatch || effectiveMatches.find((m) => m.isRecommended) || effectiveMatches[0];
  const alternativeBuyers = effectiveMatches.filter((m) => m.buyer.id !== topBuyer.buyer.id);
  const visibleAlternatives = showAllAlternatives ? alternativeBuyers : alternativeBuyers.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. TOP RECOMMENDED BUYER CARD */}
      <div className="relative bg-white rounded-2xl border border-emerald-600 shadow-xs overflow-hidden transition hover:shadow-sm">
        {/* Star Badge */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 text-slate-950 p-1 rounded-md">
              <Star className="w-4 h-4 fill-slate-950" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase">
              {t('top_buyer_recommendation', 'AI-ASSISTED BUYER RECOMMENDATION')} ⭐
            </span>
          </div>
          <span className="bg-emerald-950/80 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/40">
            {t('match_score', 'Overall Score')}: {topBuyer.overallScore}/100
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Buyer Info & Financials */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                      {topBuyer.buyer.name}
                    </h3>
                    <span
                      className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded cursor-help"
                      title="Buyer verification is represented by a prototype verification flag."
                    >
                      {t('verified_buyer', 'Demo Verified')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{topBuyer.buyer.location}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium text-emerald-700">~{topBuyer.distanceKm} km {t('away', 'away')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      topBuyer.cropRequirement.demandLevel === 'HIGH'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {t('demand_level', 'Demand')}: {topBuyer.cropRequirement.demandLevel}
                  </span>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div className="text-[11px] text-slate-500 font-medium">{t('crop_name', 'Crop & Grade')}</div>
                    <div className="text-sm font-bold text-slate-900">{cropName} ({qualityGrade})</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div className="text-[11px] text-slate-500 font-medium">{t('offered_price', 'Buying Price')}</div>
                    <div className="text-sm font-bold text-emerald-700">₹{topBuyer.pricePerKg}/kg</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div className="text-[11px] text-slate-500 font-medium">{t('quantity', 'Quantity')}</div>
                    <div className="text-sm font-bold text-slate-900">{quantityKg.toLocaleString('en-IN')} kg</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div className="text-[11px] text-slate-500 font-medium">{t('distance', 'Distance')}</div>
                    <div className="text-sm font-bold text-slate-900">{topBuyer.distanceKm} km</div>
                  </div>
                </div>

                {/* Net Return Formula Breakdown */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('gross_revenue', 'Gross Revenue')} ({quantityKg} kg × ₹{topBuyer.pricePerKg}/kg):</span>
                    <span className="font-semibold text-slate-900">₹{topBuyer.grossRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{t('estimated_transport_cost', 'Estimated Freight')} ({topBuyer.transportDetails.vehicleType}):</span>
                    </span>
                    <span className="font-semibold">- ₹{topBuyer.transportCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-300">
                    <span className="text-sm font-bold text-slate-900">
                      {t('estimated_net_return', 'ESTIMATED NET RETURN')}:
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      ₹{topBuyer.netReturn.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onSendOffer(topBuyer)}
                  className="w-full sm:w-auto flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('send_offer', 'Send Digital Offer')} (₹{topBuyer.pricePerKg}/kg)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBuyerForContact(selectedBuyerForContact?.buyer.id === topBuyer.buyer.id ? null : topBuyer)}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-5 rounded-xl border border-slate-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>{selectedBuyerForContact?.buyer.id === topBuyer.buyer.id ? t('hide_contact', 'Hide Contact') : t('contact_buyer', 'Contact Buyer')}</span>
                </button>
              </div>

              {/* Contact Reveal Drawer */}
              {selectedBuyerForContact?.buyer.id === topBuyer.buyer.id && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs space-y-2 animate-fadeIn">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('direct_procurement_desk', 'Direct Procurement Desk Contacts:')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-950">
                    <div>
                      <span className="text-emerald-700">{t('contact_person', 'Contact Person')}:</span> {topBuyer.buyer.contactPerson}
                    </div>
                    <div>
                      <span className="text-emerald-700">{t('phone_number', 'Phone')}:</span>{' '}
                      <a href={`tel:${topBuyer.buyer.phone}`} className="font-bold underline text-emerald-900">
                        {topBuyer.buyer.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-emerald-700">{t('email_address', 'Email')}:</span> {topBuyer.buyer.email}
                    </div>
                    <div>
                      <span className="text-emerald-700">{t('payment_terms', 'Payment Terms')}:</span> {topBuyer.buyer.paymentTerms}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Why Recommended & Scoring Reasons */}
            <div className="lg:col-span-5 bg-emerald-50/70 rounded-xl p-5 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>{t('why_recommended', 'Why This Buyer Is Recommended')}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-emerald-950">
                  {topBuyer.recommendationReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Score Breakdown Pills */}
              <div className="mt-5 pt-4 border-t border-emerald-200">
                <div className="text-[11px] font-semibold text-emerald-900 mb-2">
                  {t('transparent_sih_scoring', 'Transparent SIH Algorithm Scoring Weights:')}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-emerald-200 flex justify-between">
                    <span className="text-slate-600">{t('price_weight', 'Price (40%)')}:</span>
                    <span className="font-bold text-emerald-800">{topBuyer.priceScore}/100</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200 flex justify-between">
                    <span className="text-slate-600">{t('demand_weight', 'Demand (20%)')}:</span>
                    <span className="font-bold text-emerald-800">{topBuyer.demandScore}/100</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200 flex justify-between">
                    <span className="text-slate-600">{t('distance_weight', 'Distance (20%)')}:</span>
                    <span className="font-bold text-emerald-800">{topBuyer.distanceScore}/100</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200 flex justify-between">
                    <span className="text-slate-600">{t('net_return_weight', 'Net Return (20%)')}:</span>
                    <span className="font-bold text-emerald-800">{Math.round((topBuyer.netReturn / topBuyer.grossRevenue) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ALTERNATIVE BUYERS LIST */}
      {alternativeBuyers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                {t('alternative_buyers_title', 'Alternative Potential Buyers & Mandis')} ({alternativeBuyers.length})
              </h4>
              <p className="text-xs text-slate-500">
                {t('compare_alternatives_desc', 'Compare other potential buyers purchasing produce sorted by estimated net returns.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visibleAlternatives.map((alt) => (
              <div
                key={alt.buyer.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-slate-900 leading-tight">
                      {alt.buyer.name}
                    </h5>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        alt.cropRequirement.demandLevel === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {alt.cropRequirement.demandLevel}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{alt.buyer.location} (~{alt.distanceKm} km)</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('price_offered', 'Price Offered')}:</span>
                      <span className="font-bold text-slate-900">₹{alt.pricePerKg}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('transport_freight', 'Est. Transport')}:</span>
                      <span className="text-red-600 font-medium">- ₹{alt.transportCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                      <span className="font-semibold text-slate-800">{t('est_net_return', 'Est. Net Return')}:</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        ₹{alt.netReturn.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onSendOffer(alt)}
                    className="flex-1 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{t('send_offer', 'Send Digital Offer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectBuyerForDetail(alt)}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium py-2 px-2.5 rounded-lg border border-slate-300 transition cursor-pointer"
                    title="View Buyer Details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {alternativeBuyers.length > 3 && (
            <div className="text-center mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAllAlternatives(!showAllAlternatives)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllAlternatives ? t('show_less', 'Show Less Alternatives') : t('view_all_alternatives', `View All ${alternativeBuyers.length} Alternative Buyers`)}</span>
                {showAllAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
