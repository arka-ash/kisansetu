import React from 'react';
import { FarmerListing, FarmerProfile, Offer, QualityGrade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Layers,
  IndianRupee,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Sprout,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface FarmerDashboardProps {
  currentFarmer?: FarmerProfile;
  farmer?: FarmerProfile;
  listings?: FarmerListing[];
  offers?: Offer[];
  onAcceptOffer: (offerId: string) => Promise<void> | void;
  onRejectOffer: (offerId: string) => Promise<void> | void;
  onSelectListing?: (listing: FarmerListing) => void;
  onNewProduceClick?: () => void;
  onAddNewListing?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentFarmer: propCurrentFarmer,
  farmer: propFarmer,
  listings = [],
  offers = [],
  onAcceptOffer,
  onRejectOffer,
  onSelectListing = (_listing: FarmerListing) => {},
  onNewProduceClick,
  onAddNewListing,
}) => {
  const { t } = useLanguage();
  const activeFarmer: FarmerProfile = propCurrentFarmer || propFarmer || {
    id: 'farmer-1',
    name: 'Ramesh Kumar',
    mobile: 'xxxxx',
    location: 'Durgapur, West Bengal',
    coordinates: { lat: 23.5204, lng: 87.3119 },
    farmSizeAcres: 4,
    fpoName: 'Durgapur Farmers Producer Company',
  };

  const handlePostProduce = onNewProduceClick || onAddNewListing || (() => {});

  const farmerListings = listings.filter((l) => l.farmerId === activeFarmer.id || l.farmerPhone === activeFarmer.mobile);
  const farmerOffers = offers.filter((o) => o.farmerId === activeFarmer.id || o.farmerName === activeFarmer.name);

  const pendingOffers = farmerOffers.filter((o) => o.status === 'PENDING');
  const acceptedOffers = farmerOffers.filter((o) => o.status === 'ACCEPTED');

  const totalSoldValue = acceptedOffers.reduce((acc, curr) => acc + curr.netReturnToFarmer, 0);
  const totalActiveQty = farmerListings
    .filter((l) => l.status === 'ACTIVE')
    .reduce((acc, curr) => acc + curr.quantityKg, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Profile & Quick Stats */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                {activeFarmer.name}'s {t('producer_hub', 'Producer Hub')}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {activeFarmer.fpoName || t('fpo_producer', 'FPO Producer')}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              📍 {activeFarmer.location || 'Durgapur, West Bengal'} • {t('farm_area', 'Farm Area')}: {activeFarmer.farmSizeAcres || 4} {t('acres', 'Acres')} • {t('phone_number', 'Ph')}: {activeFarmer.mobile || 'xxxxx'}
            </p>
          </div>

          <button
            onClick={handlePostProduce}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            <Sprout className="w-4 h-4" />
            <span>{t('post_new_lot', 'Post New Crop Lot')}</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">{t('active_crop_listings', 'Active Crop Listings')}</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {farmerListings.filter((l) => l.status === 'ACTIVE').length}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">
              {totalActiveQty.toLocaleString('en-IN')} kg {t('available', 'available')}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">{t('pending_buyer_offers', 'Pending Buyer Offers')}</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {pendingOffers.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t('requires_decision', 'Requires your decision')}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">{t('secured_net_earnings', 'Secured Net Earnings')}</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              ₹{totalSoldValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {acceptedOffers.length} {t('deals_closed', 'deals closed')}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">{t('avg_price_realization', 'Avg Price Realization')}</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              +18%
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">
              {t('vs_middleman', 'vs local village middleman')}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Received Offers Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              {t('offers_received_title', 'Digital Purchase Offers Received')} ({farmerOffers.length})
            </h3>
            <p className="text-xs text-slate-500">
              {t('offers_received_desc', 'Platform-listed buyers offering procurement prices for your harvest lots.')}
            </p>
          </div>
        </div>

        {farmerOffers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
            {t('no_offers_yet', 'No digital offers received yet. Post a produce listing to receive competitive bids from buyers.')}
          </div>
        ) : (
          <div className="space-y-3">
            {farmerOffers.map((offer) => {
              const isPending = offer.status === 'PENDING';
              const isAccepted = offer.status === 'ACCEPTED';
              const isRejected = offer.status === 'REJECTED';

              return (
                <div
                  key={offer.id}
                  className={`p-4 sm:p-5 rounded-xl border transition ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/40'
                      : isAccepted
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50/40 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">
                          {offer.buyerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-200 text-amber-900'
                              : isAccepted
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        {t('offered_label', 'Offered')}: <strong className="text-slate-900">₹{offer.offeredPricePerKg}/kg</strong> {t('for', 'for')}{' '}
                        <strong>{offer.quantityKg.toLocaleString('en-IN')} kg {offer.cropName} ({offer.qualityGrade})</strong>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                        <span>{t('gross', 'Gross')}: ₹{offer.totalValue.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span className="text-red-600">{t('transport_freight', 'Est. Transport')}: -₹{offer.estimatedTransportCost.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-800 text-sm">
                          {t('net_return', 'Net Return')}: ₹{offer.netReturnToFarmer.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {offer.notes && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80 mt-2">
                          💬 <em>"{offer.notes}"</em>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => onAcceptOffer(offer.id)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('accept_offer_btn', 'Accept Offer')}</span>
                          </button>
                          <button
                            onClick={() => onRejectOffer(offer.id)}
                            className="bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('decline_offer_btn', 'Decline')}</span>
                          </button>
                        </>
                      ) : isAccepted ? (
                        <div className="text-emerald-800 text-xs font-bold flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t('offer_accepted_badge', 'Offer Accepted • Ready for Logistics')}</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs font-medium">
                          {t('offer_declined_badge', 'Offer Declined')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Active Listings Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              {t('harvest_lots_title', 'Your Harvest Lots & Active Listings')} ({farmerListings.length})
            </h3>
            <p className="text-xs text-slate-500">
              {t('harvest_lots_desc', 'Click on any listing to inspect current price discovery and matching buyers.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farmerListings.map((listing) => (
            <div
              key={listing.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-600 transition cursor-pointer flex flex-col justify-between space-y-3"
              onClick={() => onSelectListing(listing)}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      {listing.cropName} • {listing.qualityGrade}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-sans tracking-tight">
                      {listing.quantityKg.toLocaleString('en-IN')} kg {t('produce_lot', 'Produce Lot')}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      listing.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-2 space-y-1">
                  <div>📍 {t('dispatch_location', 'Location')}: {listing.location}</div>
                  <div>📅 {t('listed_on', 'Listed on')}: {new Date(listing.createdAt).toLocaleDateString('en-IN')}</div>
                  {listing.expectedPricePerKg && (
                    <div>🏷️ {t('target_price', 'Target Price')}: ₹{listing.expectedPricePerKg}/kg</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectListing(listing);
                }}
                className="w-full pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-emerald-700 hover:text-emerald-800 font-bold transition cursor-pointer group/btn"
              >
                <span className="group-hover/btn:underline">{t('view_recommendations_btn', 'View Recommendations & Buyers')}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
