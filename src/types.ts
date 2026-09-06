export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Organic / Premium';
export type DemandLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  mobile: string;
  location: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  coordinates: { lat: number; lng: number };
  farmSizeAcres?: number;
  fpoName?: string;
  primaryCrops?: string[];
  upiId?: string;
  authProvider?: 'gmail' | 'phone' | 'demo';
  isGpsActive?: boolean;
}

export interface BuyerCropRequirement {
  cropName: string;
  minGrade: QualityGrade;
  pricePerKg: number;
  maxQuantityKg?: number;
  demandLevel: DemandLevel;
}

export interface BuyerProfile {
  id: string;
  name: string;
  businessType: 'Wholesale Mandi Trader' | 'Food Processor' | 'Agri-Retail Chain' | 'Exporter' | 'Local Aggregator' | 'FPO Federation';
  location: string;
  state: string;
  coordinates: { lat: number; lng: number };
  contactPerson: string;
  phone: string;
  email: string;
  verified: boolean;
  rating: number;
  cropsPurchased: BuyerCropRequirement[];
  paymentTerms: string;
}

export interface FarmerListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  quantityKg: number;
  qualityGrade: QualityGrade;
  harvestDate: string;
  location: string;
  coordinates: { lat: number; lng: number };
  expectedPricePerKg?: number;
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
  imageUrl?: string;
  createdAt: string;
}

export interface BuyerMatchResult {
  buyer: BuyerProfile;
  cropRequirement: BuyerCropRequirement;
  distanceKm: number;
  pricePerKg: number;
  grossRevenue: number;
  transportCost: number;
  netReturn: number;
  priceScore: number;
  distanceScore: number;
  demandScore: number;
  overallScore: number;
  isRecommended: boolean;
  recommendationReasons: string[];
  transportDetails: {
    vehicleType: string;
    ratePerKm: number;
    estimatedDays: string;
  };
}

export interface Offer {
  id: string;
  listingId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  cropName: string;
  quantityKg: number;
  qualityGrade: QualityGrade;
  offeredPricePerKg: number;
  totalValue: number;
  estimatedTransportCost: number;
  netReturnToFarmer: number;
  pickupLocation: string;
  deliveryLocation: string;
  status: OfferStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CropMaster {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Vegetables' | 'Grains & Cereals' | 'Pulses' | 'Spices' | 'Fruits' | 'Cash Crops';
  iconEmoji: string;
  typicalMandiBenchmark: number; // ₹/kg
  seasonalDemand: DemandLevel;
  shelfLifeDays: number;
  perishability?: 'HIGH' | 'MEDIUM' | 'LOW';
  isCustom?: boolean;
}

export interface CropInventoryItem {
  id: string;
  farmerId: string;
  cropName: string;
  variety?: string;
  totalQuantityKg: number;
  availableQuantityKg: number;
  reservedQuantityKg: number;
  qualityGrade: QualityGrade;
  harvestDate: string;
  storageLocation: string;
  expectedPricePerKg: number;
  imageUrl?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'RESERVED' | 'SOLD_OUT';
  lastUpdated: string;
  notes?: string;
}

export interface TransporterOption {
  id: string;
  name: string;
  agencyName: string;
  vehicleType: string;
  capacityKg: number;
  capacityTon: number;
  baseCharge: number;
  perKmRate: number;
  loadingHelperCharge: number;
  rating: number;
  tripsCompleted: number;
  phone: string;
  alternatePhone?: string;
  operatingHub: string;
  isVerified: boolean;
  hasRefrigeration: boolean;
  vehicleNumber: string;
  availableNow: boolean;
}

export interface StorageFacility {
  id: string;
  name: string;
  facilityType: 'Cold Storage (0-4°C)' | 'Dry Grain Godown' | 'CA Controlled Atmosphere' | 'Ventilated Onion Shed' | 'Multi-Commodity Hub';
  location: string;
  district: string;
  state: string;
  coordinates: { lat: number; lng: number };
  pricePerQuintalMonth: number;
  dailyRatePerQuintal: number;
  minDurationDays: number;
  totalCapacityMt: number;
  availableCapacityMt: number;
  temperatureRange: string;
  managerName: string;
  phone: string;
  email?: string;
  isVerified: boolean;
  isWdraRegistered: boolean;
  isSubsidyEligible: boolean;
  amenities: string[];
  supportedCrops: string[];
}

