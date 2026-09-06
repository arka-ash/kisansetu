import React, { useState } from 'react';
import { BuyerProfile, CropMaster, DemandLevel, FarmerListing, Offer, QualityGrade } from '../types';
import { CROPS_CATALOG } from '../data/seedData';
import {
  Store,
  Plus,
  Send,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Edit2,
  IndianRupee,
  PackageCheck,
  Building,
  Search,
  Filter,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';

interface BuyerDashboardProps {
  currentBuyer?: BuyerProfile;
  listings?: FarmerListing[];
  allListings?: FarmerListing[];
  offers?: Offer[];
  buyerOffers?: Offer[];
  onUpdateRequirement: (cropName: string, minGrade: QualityGrade, pricePerKg: number, demandLevel: DemandLevel) => Promise<void> | void;
  onCreateOfferToFarmer?: (offerData: {
    listingId: string;
    farmerId: string;
    farmerName: string;
    cropName: string;
    quantityKg: number;
    qualityGrade: QualityGrade;
    offeredPricePerKg: number;
    notes?: string;
  }) => Promise<void> | void;
  onCreateOffer?: (offerData: {
    listingId: string;
    farmerId: string;
    farmerName: string;
    cropName: string;
    quantityKg: number;
    qualityGrade: QualityGrade;
    offeredPricePerKg: number;
    notes?: string;
  }) => Promise<void> | void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentBuyer: propBuyer,
  listings: propListings,
  allListings,
  offers: propOffers,
  buyerOffers: propBuyerOffers,
  onUpdateRequirement,
  onCreateOfferToFarmer,
  onCreateOffer,
}) => {
  const activeBuyer: BuyerProfile = propBuyer || {
    id: 'buyer-1',
    name: 'FreshMart Agro Retail Ltd',
    businessType: 'Organized Retail Chain',
    location: 'Kolkata, West Bengal',
    coordinates: { lat: 22.5726, lng: 88.3639 },
    contactPerson: 'Amitabh Sen (Procurement Lead)',
    phone: 'xxxxx',
    email: 'procurement@freshmartagro.in',
    trustScore: 94,
    paymentTerms: '24h Direct Bank Transfer after Quality Check',
    cropsPurchased: [],
  };

  const effectiveListings = allListings || propListings || [];
  const effectiveOffers = propBuyerOffers || propOffers || [];
  const handleCreateOffer = onCreateOfferToFarmer || onCreateOffer || (async () => {});

  const [selectedListingForOffer, setSelectedListingForOffer] = useState<FarmerListing | null>(null);
  const [offerPrice, setOfferPrice] = useState<string>('28');
  const [offerNotes, setOfferNotes] = useState<string>('Immediate procurement. 24h bank settlement after quality check.');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState<boolean>(false);

  // Search & Filter state for listings
  const [listingCropFilter, setListingCropFilter] = useState<string>('All');
  const [listingLocationSearch, setListingLocationSearch] = useState<string>('');

  // Sent Offers Filter
  const [offerStatusFilter, setOfferStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

  // Edit Crop Requirement Modal/Form state
  const [editingCrop, setEditingCrop] = useState<string>('Onion');
  const [reqPrice, setReqPrice] = useState<string>('28.5');
  const [reqGrade, setReqGrade] = useState<QualityGrade>('Grade A');
  const [reqDemand, setReqDemand] = useState<DemandLevel>('HIGH');
  const [isSavingReq, setIsSavingReq] = useState<boolean>(false);

  const activeListings = effectiveListings.filter((l) => l.status === 'ACTIVE');
  const userBuyerOffers = effectiveOffers.filter((o) => o.buyerId === activeBuyer.id);

  const filteredListings = activeListings.filter((l) => {
    if (listingCropFilter !== 'All' && l.cropName.toLowerCase() !== listingCropFilter.toLowerCase()) {
      return false;
    }
    if (listingLocationSearch.trim()) {
      const q = listingLocationSearch.toLowerCase();
      return (
        l.location.toLowerCase().includes(q) ||
        l.farmerName.toLowerCase().includes(q) ||
        l.cropName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUserOffers = userBuyerOffers.filter((o) => {
    if (offerStatusFilter === 'ALL') return true;
    return o.status === offerStatusFilter;
  });

  const handleOpenOfferModal = (listing: FarmerListing) => {
    setSelectedListingForOffer(listing);
    // Find default price for this crop from buyer requirements if exists
    const existingReq = (activeBuyer.cropsPurchased || []).find(
      (c) => c.cropName.toLowerCase() === listing.cropName.toLowerCase()
    );
    setOfferPrice(existingReq ? String(existingReq.pricePerKg) : '28');
  };

  const handleSendOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForOffer) return;

    setIsSubmittingOffer(true);
    try {
      await handleCreateOffer({
        listingId: selectedListingForOffer.id,
        farmerId: selectedListingForOffer.farmerId,
        farmerName: selectedListingForOffer.farmerName,
        cropName: selectedListingForOffer.cropName,
        quantityKg: selectedListingForOffer.quantityKg,
        qualityGrade: selectedListingForOffer.qualityGrade,
        offeredPricePerKg: Number(offerPrice),
        notes: offerNotes,
      });
      setSelectedListingForOffer(null);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReq(true);
    try {
      await onUpdateRequirement(editingCrop, reqGrade, Number(reqPrice), reqDemand);
    } finally {
      setIsSavingReq(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Buyer Profile Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
                  {activeBuyer.name}
                </h2>
                <span
                  className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded cursor-help"
                  title="Buyer verification is represented by a prototype verification flag. Production deployment would integrate formal KYC/GST/institutional verification."
                >
                  Platform-Listed Buyer (Demo Verified)
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {activeBuyer.businessType} • 📍 {activeBuyer.location} • Contact: {activeBuyer.contactPerson} (Ph: xxxxx)
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Payment: {activeBuyer.paymentTerms}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center sm:text-right">
            <div className="text-xs text-slate-500 font-medium">Outgoing Offers Made</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {userBuyerOffers.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {userBuyerOffers.filter((o) => o.status === 'ACCEPTED').length} accepted deals
            </div>
          </div>
        </div>
      </div>

      {/* 2. Buyer Procurement Price Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              Your Crop Procurement Rate Card & Demand
            </h3>
            <p className="text-xs text-slate-500">
              Set procurement requirements such as crop, minimum grade, buying price and demand. Farmers searching on KisanSetu are matched automatically against your buying rates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(activeBuyer.cropsPurchased || []).map((cropReq) => (
            <div
              key={cropReq.cropName}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-bold text-slate-900">
                    {cropReq.cropName}
                  </span>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Min Acceptable: <strong>{cropReq.minGrade}</strong>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    cropReq.demandLevel === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cropReq.demandLevel} Demand
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Procurement Price:</span>
                  <div className="text-lg font-extrabold text-emerald-700">
                    ₹{cropReq.pricePerKg} <span className="text-xs font-normal text-slate-500">/ kg</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingCrop(cropReq.cropName);
                    setReqPrice(String(cropReq.pricePerKg));
                    setReqGrade(cropReq.minGrade);
                    setReqDemand(cropReq.demandLevel);
                  }}
                  className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Update Requirement Form inline */}
        <form onSubmit={handleSaveRequirement} className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quick Update / Add Crop Procurement Rate:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Crop</label>
              <select
                value={editingCrop}
                onChange={(e) => setEditingCrop(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
              >
                {CROPS_CATALOG.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.iconEmoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Buying Rate (₹/kg)</label>
              <input
                type="number"
                step="0.5"
                required
                value={reqPrice}
                onChange={(e) => setReqPrice(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Min Acceptable Grade</label>
              <select
                value={reqGrade}
                onChange={(e) => setReqGrade(e.target.value as QualityGrade)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
                <option value="Organic / Premium">Organic / Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Current Demand</label>
              <select
                value={reqDemand}
                onChange={(e) => setReqDemand(e.target.value as DemandLevel)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-semibold"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingReq}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSavingReq ? 'Saving Rate...' : 'Save Procurement Rate'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Browse Farmer Produce Listings & Send Offers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              Active Regional Farmer Produce Lots ({filteredListings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Browse lots posted by farmers and submit digital purchase offers directly to their dashboard.
            </p>
          </div>

          {/* Search & Crop Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listingLocationSearch}
                onChange={(e) => setListingLocationSearch(e.target.value)}
                placeholder="Filter by location / district..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={listingCropFilter}
                onChange={(e) => setListingCropFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="All">All Crops</option>
                <option value="Onion">Onion</option>
                <option value="Potato">Potato</option>
                <option value="Tomato">Tomato</option>
                <option value="Wheat">Wheat</option>
                <option value="Paddy(Dhan)">Paddy / Dhan</option>
              </select>
            </div>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No active farmer listings matched your search or crop filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase">
                        {listing.cropName} • {listing.qualityGrade}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-sans tracking-tight">
                        {listing.quantityKg.toLocaleString('en-IN')} kg Produce Lot
                      </h4>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Available Lot
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <div>👨‍🌾 Farmer: <strong>{listing.farmerName}</strong> (Ph: xxxxx)</div>
                    <div>📍 Location: {listing.location}</div>
                    {listing.expectedPricePerKg && (
                      <div>🏷️ Farmer Target Price: <strong>₹{listing.expectedPricePerKg}/kg</strong></div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenOfferModal(listing)}
                  className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Digital Offer</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Sent Requests / Offers & Statuses */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              Sent Purchase Requests & Offers ({userBuyerOffers.length})
            </h3>
            <p className="text-xs text-slate-500">
              Track the status of all digital purchase offers submitted to regional farmers.
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setOfferStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                  offerStatusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {status === 'ALL' ? 'All Offers' : status}
              </button>
            ))}
          </div>
        </div>

        {filteredUserOffers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {userBuyerOffers.length === 0
              ? 'You have not submitted any purchase offers yet. Click "Send Digital Offer" on any farm lot above to start negotiating.'
              : `No offers with status "${offerStatusFilter}".`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Farmer & Produce</th>
                  <th className="py-3 px-4">Offered Rate</th>
                  <th className="py-3 px-4">Total Payout</th>
                  <th className="py-3 px-4">Estimated Net to Farmer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUserOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{offer.farmerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {offer.cropName} • {offer.qualityGrade} • {offer.quantityKg.toLocaleString('en-IN')} kg
                      </div>
                      {offer.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5 italic">"{offer.notes}"</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{offer.offeredPricePerKg} / kg
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{offer.totalValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                      ₹{offer.netReturnToFarmer.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : offer.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {offer.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {offer.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                        {offer.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {offer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(offer.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {selectedListingForOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Direct Digital Offer
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight mt-0.5">
                  Offer to {selectedListingForOffer.farmerName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lot: {selectedListingForOffer.quantityKg.toLocaleString('en-IN')} kg {selectedListingForOffer.cropName} ({selectedListingForOffer.qualityGrade})
                </p>
              </div>
              <button
                onClick={() => setSelectedListingForOffer(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Your Offered Price (₹ / kg) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="28"
                  />
                </div>
              </div>

              {/* Real-time value calculation preview */}
              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between text-emerald-950">
                  <span>Gross Lot Payout ({selectedListingForOffer.quantityKg} kg × ₹{offerPrice || 0}):</span>
                  <span className="font-bold">
                    ₹{(selectedListingForOffer.quantityKg * (Number(offerPrice) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-900 font-bold pt-1 border-t border-emerald-200">
                  <span>Estimated Net Return to Farmer:</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    ₹{Math.max(0, selectedListingForOffer.quantityKg * (Number(offerPrice) || 0) - 800).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Procurement Notes / Logistics Instructions
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Pickup via refrigerated vehicle tomorrow at farm gate."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListingForOffer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingOffer ? 'Submitting...' : 'Submit Digital Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

