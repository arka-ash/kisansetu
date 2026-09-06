/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BuyerMatchResult,
  BuyerProfile,
  CropInventoryItem,
  CropMaster,
  DemandLevel,
  FarmerListing,
  FarmerProfile,
  Offer,
  QualityGrade,
  StorageFacility,
  TransporterOption,
  UserRole,
} from './types';
import {
  CROPS_CATALOG,
  INITIAL_BUYERS,
  INITIAL_INVENTORY,
  INITIAL_LISTINGS,
  INITIAL_OFFERS,
  INITIAL_STORAGE_FACILITIES,
  INITIAL_TRANSPORTERS,
  SAMPLE_FARMERS,
} from './data/seedData';
import { matchAndRankBuyers } from './utils/matchingEngine';
import { Navbar } from './components/Navbar';
import { SellProduceForm } from './components/SellProduceForm';
import { RecommendationCard } from './components/RecommendationCard';
import { BuyerComparisonTable } from './components/BuyerComparisonTable';
import { PriceChart } from './components/PriceChart';
import { AgriMap } from './components/AgriMap';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { GovernmentMandiPrices } from './components/GovernmentMandiPrices';
import { CropInventoryManager } from './components/CropInventoryManager';
import { TransportDirectory } from './components/TransportDirectory';
import { StorageDirectory } from './components/StorageDirectory';
import { SihPresentationHub } from './components/SihPresentationHub';
import { MyProfileModal } from './components/MyProfileModal';
import { GmailAuthModal } from './components/GmailAuthModal';
import { getUserLiveLocation } from './utils/geoUtils';
import {
  Sprout,
  Truck,
  Warehouse,
  Boxes,
  Layers,
  MapPin,
  Sparkles,
  CheckCircle2,
  Send,
  X,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<string>('sell');
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [currentFarmer, setCurrentFarmer] = useState<FarmerProfile>(() => {
    const saved = localStorage.getItem('kisansetu_current_farmer');
    return saved ? JSON.parse(saved) : SAMPLE_FARMERS[0];
  });
  const [currentBuyer, setCurrentBuyer] = useState<BuyerProfile>(INITIAL_BUYERS[0]);

  // Modals & User Dialogs State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isGmailAuthModalOpen, setIsGmailAuthModalOpen] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Dynamic Crop Master & Inventory State
  const [cropsCatalog, setCropsCatalog] = useState<CropMaster[]>(() => {
    const saved = localStorage.getItem('kisansetu_crops_catalog');
    return saved ? JSON.parse(saved) : CROPS_CATALOG;
  });

  const [inventory, setInventory] = useState<CropInventoryItem[]>(() => {
    const saved = localStorage.getItem('kisansetu_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // Transport & Storage Directory State
  const [transporters, setTransporters] = useState<TransporterOption[]>(INITIAL_TRANSPORTERS);
  const [storageFacilities, setStorageFacilities] = useState<StorageFacility[]>(INITIAL_STORAGE_FACILITIES);

  // Database / Listings / Offers State
  const [buyers, setBuyers] = useState<BuyerProfile[]>(INITIAL_BUYERS);
  const [listings, setListings] = useState<FarmerListing[]>(INITIAL_LISTINGS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);

  // Active Produce & Matching Engine State
  const [selectedCrop, setSelectedCrop] = useState<string>('Onion');
  const [quantityKg, setQuantityKg] = useState<number>(500);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A');
  const [farmerLocation, setFarmerLocation] = useState<string>(
    currentFarmer.location || 'Durgapur, West Bengal'
  );
  const [farmerCoords, setFarmerCoords] = useState<{ lat: number; lng: number }>(
    currentFarmer.coordinates || {
      lat: 23.5204,
      lng: 87.3119,
    }
  );
  const [selectedCropImageUrl, setSelectedCropImageUrl] = useState<string>('');

  const [currentMatches, setCurrentMatches] = useState<BuyerMatchResult[]>([]);
  const [activeListing, setActiveListing] = useState<FarmerListing | null>(INITIAL_LISTINGS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals & Notifications
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);
  const [targetMatchForOffer, setTargetMatchForOffer] = useState<BuyerMatchResult | null>(null);
  const [offerPriceInput, setOfferPriceInput] = useState<string>('');
  const [offerNotesInput, setOfferNotesInput] = useState<string>('');
  const [isSihModalOpen, setIsSihModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('kisansetu_crops_catalog', JSON.stringify(cropsCatalog));
  }, [cropsCatalog]);

  useEffect(() => {
    localStorage.setItem('kisansetu_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('kisansetu_current_farmer', JSON.stringify(currentFarmer));
  }, [currentFarmer]);

  // Live GPS Detector Handler
  const handleDetectLiveGps = async () => {
    setIsDetectingGps(true);
    showToast('Detecting GPS Location 🛰️', 'Requesting high-precision device coordinates...');
    try {
      const geo = await getUserLiveLocation();
      setFarmerCoords(geo.coordinates);
      setFarmerLocation(geo.formattedAddress);

      const updatedFarmer: FarmerProfile = {
        ...currentFarmer,
        location: geo.formattedAddress,
        coordinates: geo.coordinates,
        district: geo.district || currentFarmer.district,
        state: geo.state || currentFarmer.state,
        isGpsActive: true,
      };

      setCurrentFarmer(updatedFarmer);

      // Re-run matching with exact live location
      runBuyerMatching(
        selectedCrop,
        quantityKg,
        qualityGrade,
        geo.coordinates,
        geo.formattedAddress
      );

      // Update Supabase profile asynchronously
      fetch(`/api/profile/${updatedFarmer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFarmer),
      }).catch((e) => console.warn('Supabase profile sync notice:', e));

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });

      showToast(
        '📍 Live GPS Location Locked!',
        `${geo.formattedAddress} (Accuracy: ±${geo.accuracyMeters}m). Nearby buyers recalculated.`
      );
    } catch (err: any) {
      showToast('Location Access Notice', err.message || 'Could not fetch device GPS.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Farmer Profile Save & Sync Handler
  const handleSaveProfile = async (updatedFarmer: FarmerProfile) => {
    setCurrentFarmer(updatedFarmer);
    if (updatedFarmer.location) {
      setFarmerLocation(updatedFarmer.location);
    }
    if (updatedFarmer.coordinates) {
      setFarmerCoords(updatedFarmer.coordinates);
    }

    try {
      const res = await fetch(`/api/profile/${updatedFarmer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFarmer),
      });

      if (res.ok) {
        runBuyerMatching(
          selectedCrop,
          quantityKg,
          qualityGrade,
          updatedFarmer.coordinates,
          updatedFarmer.location
        );

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
        });

        showToast(
          'Profile Saved & Synced! ☁️',
          'Your profile, address, and live coordinates are saved to the Supabase database.'
        );
      }
    } catch (e) {
      console.warn('Profile save notice:', e);
      showToast('Profile Updated Locally', 'Saved in browser session.');
    }
  };

  // Gmail Authentication Success Handler
  const handleGmailLoginSuccess = (authenticatedFarmer: FarmerProfile) => {
    setCurrentFarmer(authenticatedFarmer);
    if (authenticatedFarmer.location) {
      setFarmerLocation(authenticatedFarmer.location);
    }
    if (authenticatedFarmer.coordinates) {
      setFarmerCoords(authenticatedFarmer.coordinates);
    }

    runBuyerMatching(
      selectedCrop,
      quantityKg,
      qualityGrade,
      authenticatedFarmer.coordinates,
      authenticatedFarmer.location
    );

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.4 },
    });

    showToast(
      'Google Sign-In Successful! 🌾',
      `Welcome, ${authenticatedFarmer.name}! Connected to Supabase Cloud Database.`
    );
  };

  // Sign Out Handler
  const handleSignOut = () => {
    const defaultFarmer = {
      ...SAMPLE_FARMERS[0],
      email: undefined,
      authProvider: 'demo' as const,
    };
    setCurrentFarmer(defaultFarmer);
    localStorage.removeItem('kisansetu_current_farmer');
    showToast('Signed Out', 'Switched to standard guest demo mode.');
  };

  // Fetch initial data from Supabase backend on boot if available
  const fetchBackendData = async () => {
    try {
      const [buyersRes, listingsRes, offersRes] = await Promise.allSettled([
        fetch('/api/buyers').then((r) => (r.ok ? r.json() : INITIAL_BUYERS)),
        fetch('/api/listings').then((r) => (r.ok ? r.json() : INITIAL_LISTINGS)),
        fetch('/api/offers').then((r) => (r.ok ? r.json() : INITIAL_OFFERS)),
      ]);

      if (buyersRes.status === 'fulfilled' && Array.isArray(buyersRes.value) && buyersRes.value.length > 0) {
        setBuyers(buyersRes.value);
      }
      if (listingsRes.status === 'fulfilled' && Array.isArray(listingsRes.value) && listingsRes.value.length > 0) {
        setListings(listingsRes.value);
        setActiveListing(listingsRes.value[0]);
      }
      if (offersRes.status === 'fulfilled' && Array.isArray(offersRes.value) && offersRes.value.length > 0) {
        setOffers(offersRes.value);
      }
    } catch (err) {
      console.warn('Using seeded data as fallback:', err);
    }
  };

  // Initial matching calculation on boot
  useEffect(() => {
    fetchBackendData();
    runBuyerMatching(selectedCrop, quantityKg, qualityGrade, farmerCoords, farmerLocation);
  }, []);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const runBuyerMatching = (
    crop: string,
    qty: number,
    grade: QualityGrade,
    coords: { lat: number; lng: number },
    loc: string
  ) => {
    const results = matchAndRankBuyers({
      cropName: crop,
      quantityKg: qty,
      qualityGrade: grade,
      farmerCoordinates: coords,
      farmerLocation: loc,
      buyersList: buyers,
    });
    setCurrentMatches(results);
  };

  // Farmer submits produce form
  const handleProduceSubmit = async (listingData: {
    cropName: string;
    quantityKg: number;
    qualityGrade: QualityGrade;
    location: string;
    coordinates: { lat: number; lng: number };
    expectedPricePerKg?: number;
    imageUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      setSelectedCrop(listingData.cropName);
      setQuantityKg(listingData.quantityKg);
      setQualityGrade(listingData.qualityGrade);
      setFarmerLocation(listingData.location);
      setFarmerCoords(listingData.coordinates);
      if (listingData.imageUrl) {
        setSelectedCropImageUrl(listingData.imageUrl);
      }

      // Create new listing object
      const newListing: FarmerListing = {
        id: `listing-${Date.now()}`,
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        farmerPhone: currentFarmer.mobile,
        cropName: listingData.cropName,
        quantityKg: listingData.quantityKg,
        qualityGrade: listingData.qualityGrade,
        harvestDate: new Date().toISOString().split('T')[0],
        location: listingData.location,
        coordinates: listingData.coordinates,
        expectedPricePerKg: listingData.expectedPricePerKg,
        imageUrl: listingData.imageUrl,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      setListings((prev) => [newListing, ...prev]);
      setActiveListing(newListing);

      // Send to Backend API
      fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing),
      }).catch((e) => console.warn('Async listing sync notice:', e));

      // Run matching
      runBuyerMatching(
        listingData.cropName,
        listingData.quantityKg,
        listingData.qualityGrade,
        listingData.coordinates,
        listingData.location
      );

      showToast(
        'Produce Lot Listed Successfully! 🌾',
        `Matched ${currentMatches.length} verified buyers for ${listingData.quantityKg}kg ${listingData.cropName}.`
      );

      // Scroll smoothly to recommendation view
      window.scrollTo({ top: 550, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill sell tab from Inventory Lot
  const handleSelectForSelling = (cropName: string, quantity: number, grade: QualityGrade) => {
    setSelectedCrop(cropName);
    setQuantityKg(quantity);
    setQualityGrade(grade);
    setActiveTab('sell');
    runBuyerMatching(cropName, quantity, grade, farmerCoords, farmerLocation);
    showToast('Inventory Lot Selected', `Ready to discover buyers for ${quantity}kg ${cropName}.`);
  };

  // Crop Catalog Operations
  const handleAddCustomCrop = (cropData: Omit<CropMaster, 'id'>) => {
    const newCrop: CropMaster = {
      ...cropData,
      id: `crop-${Date.now()}`,
      isCustom: true,
    };
    setCropsCatalog((prev) => [...prev, newCrop]);
    showToast('New Crop Added! 🌱', `${newCrop.name} is now available in your catalog.`);
  };

  const handleUpdateCrop = (id: string, updates: Partial<CropMaster>) => {
    setCropsCatalog((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Crop Updated', 'Crop catalog benchmark and details saved.');
  };

  const handleDeleteCustomCrop = (id: string) => {
    setCropsCatalog((prev) => prev.filter((c) => c.id !== id));
    showToast('Crop Removed', 'Custom crop removed from your catalog.');
  };

  // Inventory Stock Operations
  const handleAddInventoryItem = (itemData: Omit<CropInventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: CropInventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
    showToast('Stock Lot Recorded! 📦', `Added ${newItem.totalQuantityKg}kg of ${newItem.cropName} to inventory.`);
  };

  const handleUpdateInventoryItem = (id: string, updates: Partial<CropInventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
    showToast('Stock Updated', 'Inventory quantity and details successfully updated.');
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    showToast('Stock Lot Deleted', 'Lot removed from active farm inventory.');
  };

  // Transport Booking
  const handleBookTransporter = (transporter: TransporterOption, distance: number, weight: number) => {
    showToast(
      'Transport Inquiry Dispatched! 🚚',
      `Booking request sent to ${transporter.name} (${transporter.phone}).`
    );
  };

  // Storage Facility Booking
  const handleBookFacility = (facility: StorageFacility, volume: number, months: number) => {
    showToast(
      'Storage Inquiry Sent! 🏢',
      `Inquiry for ${volume} Qtl sent to ${facility.name}. Manager ${facility.managerName} notified.`
    );
  };

  // Open Offer Creation Modal for Farmer to send offer to a matched Buyer
  const handleOpenSendOffer = (match: BuyerMatchResult) => {
    setTargetMatchForOffer(match);
    setOfferPriceInput(String(match.pricePerKg));
    setOfferNotesInput(
      `Lot of ${quantityKg}kg ${qualityGrade} ${selectedCrop} available for immediate dispatch from ${farmerLocation}.`
    );
    setIsOfferModalOpen(true);
  };

  // Submit Offer
  const handleConfirmSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMatchForOffer) return;

    const price = Number(offerPriceInput) || targetMatchForOffer.pricePerKg;
    const totalVal = quantityKg * price;
    const netRet = totalVal - targetMatchForOffer.transportCost;

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      listingId: activeListing?.id || `listing-${Date.now()}`,
      farmerId: currentFarmer.id,
      farmerName: currentFarmer.name,
      buyerId: targetMatchForOffer.buyer.id,
      buyerName: targetMatchForOffer.buyer.name,
      buyerPhone: targetMatchForOffer.buyer.phone,
      cropName: selectedCrop,
      quantityKg,
      qualityGrade,
      offeredPricePerKg: price,
      totalValue: totalVal,
      estimatedTransportCost: targetMatchForOffer.transportCost,
      netReturnToFarmer: netRet,
      pickupLocation: farmerLocation,
      deliveryLocation: targetMatchForOffer.buyer.location,
      status: 'PENDING',
      notes: offerNotesInput,
      createdAt: new Date().toISOString(),
    };

    setOffers((prev) => [newOffer, ...prev]);
    setIsOfferModalOpen(false);

    // Persist to Backend API
    fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOffer),
    }).catch((e) => console.warn('Async offer sync notice:', e));

    showToast(
      'Digital Offer Dispatched! 📨',
      `Offer sent to ${targetMatchForOffer.buyer.name} for ₹${price}/kg (Est. Net: ₹${netRet.toLocaleString('en-IN')}).`
    );
  };

  // Farmer Accepts Offer
  const handleAcceptOffer = async (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'ACCEPTED', updatedAt: new Date().toISOString() } : o))
    );

    fetch(`/api/offers/${offerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    }).catch((e) => console.warn('Async accept sync notice:', e));

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast('Trade Agreement Confirmed! 🎉', 'Buyer notified for pickup scheduling & bank payout.');
  };

  // Farmer Rejects Offer
  const handleRejectOffer = async (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'REJECTED', updatedAt: new Date().toISOString() } : o))
    );

    fetch(`/api/offers/${offerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    }).catch((e) => console.warn('Async reject sync notice:', e));

    showToast('Offer Declined', 'The buyer will be notified.');
  };

  // Farmer clicks "View Recommendations & Buyers" on any listing card
  const handleSelectListingFromDashboard = (listing: FarmerListing) => {
    setSelectedCrop(listing.cropName);
    setQuantityKg(listing.quantityKg);
    setQualityGrade(listing.qualityGrade);
    setFarmerLocation(listing.location);
    if (listing.coordinates) {
      setFarmerCoords(listing.coordinates);
    }
    setActiveListing(listing);

    // Run buyer matching algorithm with the exact crop, quantity, quality, coordinates & location
    runBuyerMatching(
      listing.cropName,
      listing.quantityKg,
      listing.qualityGrade,
      listing.coordinates || farmerCoords,
      listing.location
    );

    // Switch to sell tab where produce details and ranked buyer recommendation cards are displayed
    setActiveTab('sell');

    // Smooth scroll to recommendations section
    setTimeout(() => {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }, 100);

    showToast(
      `Listing Loaded: ${listing.cropName} 🌾`,
      `Computed live buyer matches for ${listing.quantityKg.toLocaleString('en-IN')}kg ${listing.qualityGrade} at ${listing.location}.`
    );
  };

  // Buyer Updates Procurement Requirements
  const handleBuyerUpdateRequirement = async (
    cropName: string,
    minGrade: QualityGrade,
    pricePerKg: number,
    demandLevel: DemandLevel
  ) => {
    const updatedCrops = [...(currentBuyer.cropsPurchased || [])];
    const existingIdx = updatedCrops.findIndex(
      (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
    );
    if (existingIdx >= 0) {
      updatedCrops[existingIdx] = { cropName, minGrade, pricePerKg, demandLevel };
    } else {
      updatedCrops.push({ cropName, minGrade, pricePerKg, demandLevel });
    }

    const updatedBuyer = { ...currentBuyer, cropsPurchased: updatedCrops };
    setCurrentBuyer(updatedBuyer);
    setBuyers((prev) => prev.map((b) => (b.id === updatedBuyer.id ? updatedBuyer : b)));

    fetch(`/api/buyers/${currentBuyer.id}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName, minGrade, pricePerKg, demandLevel }),
    }).catch((e) => console.warn('Requirement sync notice:', e));

    showToast(
      'Procurement Rate Updated',
      `${cropName} rate set to ₹${pricePerKg}/kg (${demandLevel} demand).`
    );
  };

  // Buyer Sends Direct Offer to Farmer
  const handleBuyerCreateOffer = async (offerData: {
    listingId: string;
    farmerId: string;
    farmerName: string;
    cropName: string;
    quantityKg: number;
    qualityGrade: QualityGrade;
    offeredPricePerKg: number;
    notes?: string;
  }) => {
    const totalVal = Math.round(offerData.quantityKg * offerData.offeredPricePerKg);
    const estFreight = Math.min(2200, Math.round(offerData.quantityKg * 1.5));
    const netRet = Math.max(0, totalVal - estFreight);

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      listingId: offerData.listingId,
      farmerId: offerData.farmerId,
      farmerName: offerData.farmerName,
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.name,
      buyerPhone: 'xxxxx',
      cropName: offerData.cropName,
      quantityKg: offerData.quantityKg,
      qualityGrade: offerData.qualityGrade,
      offeredPricePerKg: offerData.offeredPricePerKg,
      totalValue: totalVal,
      estimatedTransportCost: estFreight,
      netReturnToFarmer: netRet,
      pickupLocation: farmerLocation,
      deliveryLocation: currentBuyer.location,
      status: 'PENDING',
      notes: offerData.notes,
      createdAt: new Date().toISOString(),
    };

    setOffers((prev) => [newOffer, ...prev]);

    fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOffer),
    }).catch((e) => console.warn('Offer sync notice:', e));

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    showToast(
      'Digital Purchase Offer Dispatched! 📨',
      `Offer of ₹${offerData.offeredPricePerKg}/kg sent to ${offerData.farmerName} for ${offerData.quantityKg}kg ${offerData.cropName}.`
    );
  };

  // Reset Demo Data
  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/reset-demo', { method: 'POST' }).catch(() => {});
      localStorage.removeItem('kisansetu_crops_catalog');
      localStorage.removeItem('kisansetu_inventory');
      setCropsCatalog(JSON.parse(JSON.stringify(CROPS_CATALOG)));
      setInventory(JSON.parse(JSON.stringify(INITIAL_INVENTORY)));
      setTransporters(JSON.parse(JSON.stringify(INITIAL_TRANSPORTERS)));
      setStorageFacilities(JSON.parse(JSON.stringify(INITIAL_STORAGE_FACILITIES)));
      setBuyers(JSON.parse(JSON.stringify(INITIAL_BUYERS)));
      setListings(JSON.parse(JSON.stringify(INITIAL_LISTINGS)));
      setOffers(JSON.parse(JSON.stringify(INITIAL_OFFERS)));
      setCurrentFarmer(SAMPLE_FARMERS[0]);
      setCurrentBuyer(INITIAL_BUYERS[0]);
      setActiveListing(INITIAL_LISTINGS[0]);
      runBuyerMatching('Onion', 500, 'Grade A', SAMPLE_FARMERS[0].coordinates, SAMPLE_FARMERS[0].location);
      showToast('Data Reset', 'Restored pristine sample dataset and inventory.');
    } finally {
      setIsResetting(false);
    }
  };

  const pendingOffersCount = offers.filter(
    (o) => o.farmerId === currentFarmer.id && o.status === 'PENDING'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentFarmer={currentFarmer}
        currentBuyer={currentBuyer}
        pendingOffersCount={pendingOffersCount}
        onResetDemo={handleResetDemoData}
        isResetting={isResetting}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenGmailAuth={() => setIsGmailAuthModalOpen(true)}
        onDetectLiveGps={handleDetectLiveGps}
        isDetectingGps={isDetectingGps}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-emerald-200">{toastMessage.title}</div>
            <div className="text-xs text-slate-300 mt-0.5">{toastMessage.desc}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: SELL PRODUCE (Starts immediately with Select Crop at the top) */}
        {activeTab === 'sell' && (
          <div className="space-y-8">
            {/* Produce Input Form with Camera & Dynamic Custom Crops */}
            <SellProduceForm
              currentFarmer={currentFarmer}
              cropsCatalog={cropsCatalog}
              onSubmitProduce={handleProduceSubmit}
              onSubmit={handleProduceSubmit}
              isLoading={isLoading}
              initialCrop={selectedCrop}
              initialQuantity={quantityKg}
              initialGrade={qualityGrade}
              initialLocation={farmerLocation}
              initialImageUrl={selectedCropImageUrl}
              onAddCustomCrop={handleAddCustomCrop}
              onDeleteCustomCrop={handleDeleteCustomCrop}
            />

            {/* Recommendation Engine Section */}
            {currentMatches.length > 0 && (
              <div className="space-y-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                      Recommended Buyer Matches for {quantityKg}kg {qualityGrade} {selectedCrop}
                    </h2>
                    <p className="text-xs text-slate-600">
                      Ranked by multi-factor score (40% Net Price, 20% Trust, 20% Distance, 20% Total Return)
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full self-start sm:self-auto border border-emerald-300">
                    {currentMatches.length} Potential Buyers Listed
                  </span>
                </div>

                {/* Best Recommendation Highlight Card */}
                {currentMatches[0] && (
                  <RecommendationCard
                    matches={currentMatches}
                    match={currentMatches[0]}
                    cropName={selectedCrop}
                    quantityKg={quantityKg}
                    qualityGrade={qualityGrade}
                    farmerLocation={farmerLocation}
                    onSendOffer={handleOpenSendOffer}
                  />
                )}

                {/* Mandi Price Trend Chart */}
                <PriceChart matches={currentMatches} cropName={selectedCrop} />

                {/* Comparison Table of All Matched Buyers */}
                <BuyerComparisonTable
                  matches={currentMatches}
                  onSendOffer={handleOpenSendOffer}
                />
              </div>
            )}
          </div>
        )}

        {/* BUYER PORTAL DASHBOARD */}
        {(activeTab === 'buyer' || (currentRole === 'buyer' && (activeTab === 'sell' || activeTab === 'dashboard'))) && (
          <BuyerDashboard
            currentBuyer={currentBuyer}
            listings={listings}
            offers={offers}
            onUpdateRequirement={handleBuyerUpdateRequirement}
            onCreateOfferToFarmer={handleBuyerCreateOffer}
          />
        )}

        {/* GOVERNMENT MANDI PRICES TAB (AGMARKNET data.gov.in) */}
        {activeTab === 'mandiPrices' && (
          <GovernmentMandiPrices />
        )}

        {/* TAB: TRANSPORT DIRECTORY */}
        {activeTab === 'transport' && (
          <TransportDirectory
            transporters={transporters}
            farmerLocation={farmerLocation}
            onBookTransporter={handleBookTransporter}
          />
        )}

        {/* TAB: STORAGE DIRECTORY */}
        {activeTab === 'storage' && (
          <StorageDirectory
            facilities={storageFacilities}
            farmerLocation={farmerLocation}
            onBookFacility={handleBookFacility}
          />
        )}

        {/* TAB: FARMER DASHBOARD */}
        {activeTab === 'dashboard' && currentRole === 'farmer' && (
          <FarmerDashboard
            currentFarmer={currentFarmer}
            farmer={currentFarmer}
            listings={listings}
            offers={offers}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onSelectListing={handleSelectListingFromDashboard}
            onAddNewListing={() => setActiveTab('sell')}
            onNewProduceClick={() => setActiveTab('sell')}
          />
        )}

        {/* TAB 6: INTERACTIVE AGRI-MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                Geospatial Market & Mandi Map
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Visualizing buyer hubs, APMC mandis, food processors, and live farmer produce listings with road distance calculation.
              </p>
            </div>
            <AgriMap
              matches={currentMatches}
              farmerCoordinates={farmerCoords}
              farmerCoords={farmerCoords}
              farmerLocationName={farmerLocation}
              farmerLocation={farmerLocation}
              farmerName={currentFarmer.name}
              buyers={buyers}
              selectedCrop={selectedCrop}
              onSendOffer={handleOpenSendOffer}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center sm:text-left text-[11px] text-slate-300">
            <span className="font-bold text-emerald-400">Prototype Notice:</span> Buyer profiles, procurement prices and some market data shown in this demo are representative data used for demonstration. Production deployment would integrate verified market, buyer and logistics data sources.
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200">KisanSetu • Smart India Hackathon 2026</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            Problem Statement 26132 • Empowering Farmers with Transparent Net Return Discovery, Storage & Direct Logistics
          </div>
        </div>
      </footer>

      {/* Send Offer Modal */}
      {isOfferModalOpen && targetMatchForOffer && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">Send Direct Offer to Buyer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  To: <strong className="text-slate-800">{targetMatchForOffer.buyer.name}</strong> ({targetMatchForOffer.buyer.location})
                </p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSendOffer} className="space-y-4 pt-4 text-xs">
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Produce:</span>
                  <strong className="text-slate-900">{quantityKg}kg {qualityGrade} {selectedCrop}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Buyer Listed Base Price:</span>
                  <strong className="text-emerald-700">₹{targetMatchForOffer.pricePerKg}/kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Road Freight:</span>
                  <strong className="text-slate-900">₹{targetMatchForOffer.transportCost.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Your Asking Price per Kg (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={offerPriceInput}
                    onChange={(e) => setOfferPriceInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Dispatch Notes & Readiness
                </label>
                <textarea
                  rows={2}
                  value={offerNotesInput}
                  onChange={(e) => setOfferNotesInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Digital Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIH Mentor Presentation Hub Modal */}
      {isSihModalOpen && (
        <SihPresentationHub onClose={() => setIsSihModalOpen(false)} />
      )}

      {/* My Profile & Farmer Account Modal */}
      <MyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        farmer={currentFarmer}
        onSaveProfile={handleSaveProfile}
        onOpenGmailAuth={() => {
          setIsProfileModalOpen(false);
          setIsGmailAuthModalOpen(true);
        }}
        onLocationUpdated={(coords, locName) => {
          setFarmerCoords(coords);
          setFarmerLocation(locName);
          runBuyerMatching(selectedCrop, quantityKg, qualityGrade, coords, locName);
        }}
      />

      {/* Google / Gmail Authentication Modal with Supabase */}
      <GmailAuthModal
        isOpen={isGmailAuthModalOpen}
        onClose={() => setIsGmailAuthModalOpen(false)}
        currentFarmer={currentFarmer}
        onLoginSuccess={handleGmailLoginSuccess}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
