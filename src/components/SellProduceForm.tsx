import React, { useState, useEffect } from 'react';
import { CropMaster, FarmerProfile, QualityGrade } from '../types';
import { CROPS_CATALOG } from '../data/seedData';
import { CameraCaptureModal } from './CameraCaptureModal';
import { getUserLiveLocation } from '../utils/geoUtils';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Scale,
  Award,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Camera,
  X,
  Plus,
  Tag,
  Trash2,
  Compass,
} from 'lucide-react';

interface SellProduceFormProps {
  currentFarmer?: FarmerProfile;
  cropsCatalog?: CropMaster[];
  onSubmitProduce?: (listingData: {
    cropName: string;
    quantityKg: number;
    qualityGrade: QualityGrade;
    location: string;
    coordinates: { lat: number; lng: number };
    expectedPricePerKg?: number;
    imageUrl?: string;
  }) => Promise<void> | void;
  onSubmit?: (listingData: {
    cropName: string;
    quantityKg: number;
    qualityGrade: QualityGrade;
    location: string;
    coordinates: { lat: number; lng: number };
    expectedPricePerKg?: number;
    imageUrl?: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
  initialCrop?: string;
  initialQuantity?: number;
  initialGrade?: QualityGrade;
  initialLocation?: string;
  initialImageUrl?: string;
  onAddCustomCrop?: (crop: Omit<CropMaster, 'id'>) => void;
  onDeleteCustomCrop?: (id: string) => void;
}

const COMMON_CROP_EMOJIS = [
  '🌾', '🧅', '🍅', '🥔', '🌽', '🥕', '🥦', '🧄', '🌶️', '🥬',
  '🍎', '🥭', '🍌', '🍇', '🍓', '🥑', '🍊', '🍋', '🥜', '🥥',
  '🍍', '🍈', '🥒', '🍆', '🍵', '🌿', '🌱', '🌻', '🫘', '🎋',
];

const DEFAULT_LOCATION_OPTIONS = [
  { name: 'Durgapur, West Bengal', lat: 23.5204, lng: 87.3119, state: 'West Bengal' },
  { name: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  { name: 'Ludhiana, Punjab', lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh' },
  { name: 'Indore, Madhya Pradesh', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  { name: 'Agra, Uttar Pradesh', lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
];

export const SellProduceForm: React.FC<SellProduceFormProps> = ({
  currentFarmer,
  cropsCatalog = CROPS_CATALOG,
  onSubmitProduce,
  onSubmit,
  isLoading = false,
  initialCrop = 'Onion',
  initialQuantity = 500,
  initialGrade = 'Grade A',
  initialLocation = 'Durgapur, West Bengal',
  initialImageUrl = '',
  onAddCustomCrop,
  onDeleteCustomCrop,
}) => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>(initialGrade);
  const [locationName, setLocationName] = useState<string>(
    initialLocation || currentFarmer?.location || 'Durgapur, West Bengal'
  );
  const [expectedPrice, setExpectedPrice] = useState<string>('28');
  const [cropImageUrl, setCropImageUrl] = useState<string>(initialImageUrl);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  // Custom Crop Modal State
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
  const [customCropName, setCustomCropName] = useState<string>('');
  const [customCropLocalName, setCustomCropLocalName] = useState<string>('');
  const [customCropCategory, setCustomCropCategory] = useState<CropMaster['category']>('Vegetables');
  const [customCropEmoji, setCustomCropEmoji] = useState<string>('🌱');
  const [customCropBenchmark, setCustomCropBenchmark] = useState<number>(30);
  const [customCropPerishability, setCustomCropPerishability] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [customCropShelfLife, setCustomCropShelfLife] = useState<number>(14);

  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(
    currentFarmer?.coordinates || null
  );

  // Synchronize when currentFarmer changes
  useEffect(() => {
    if (currentFarmer?.location) {
      setLocationName(currentFarmer.location);
    }
    if (currentFarmer?.coordinates) {
      setCustomCoords(currentFarmer.coordinates);
    }
  }, [currentFarmer]);

  // Coordinates mapping for quick selection
  const [locationOptionsList, setLocationOptionsList] = useState(DEFAULT_LOCATION_OPTIONS);

  const handleDetectLiveGps = async () => {
    setIsDetectingGps(true);
    setGpsStatus('Requesting browser location...');
    try {
      const geo = await getUserLiveLocation();
      setCustomCoords(geo.coordinates);
      setLocationName(geo.formattedAddress);
      setGpsStatus(`✅ GPS Active: ${geo.formattedAddress} (±${geo.accuracyMeters}m)`);

      // Add to options if not present
      if (!locationOptionsList.some((l) => l.name === geo.formattedAddress)) {
        setLocationOptionsList((prev) => [
          {
            name: geo.formattedAddress,
            lat: geo.coordinates.lat,
            lng: geo.coordinates.lng,
            state: geo.state || 'India',
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      setGpsStatus(`⚠️ ${err.message || 'GPS location unavailable'}`);
    } finally {
      setIsDetectingGps(false);
    }
  };

  const currentCropObj =
    cropsCatalog.find((c) => c.name.toLowerCase() === selectedCrop.toLowerCase()) ||
    cropsCatalog[0] ||
    CROPS_CATALOG[0];

  const handleCreateCustomCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCropName.trim()) return;

    const newCropData: Omit<CropMaster, 'id'> = {
      name: customCropName.trim(),
      hindiName: customCropLocalName.trim() || undefined,
      category: customCropCategory,
      typicalMandiBenchmark: Number(customCropBenchmark) || 25,
      iconEmoji: customCropEmoji || '🌱',
      seasonalDemand: 'HIGH',
      perishability: customCropPerishability,
      shelfLifeDays: Number(customCropShelfLife) || 14,
      isCustom: true,
    };

    if (onAddCustomCrop) {
      onAddCustomCrop(newCropData);
    }

    // Auto-select this newly created crop in the form
    setSelectedCrop(newCropData.name);
    setExpectedPrice(String(newCropData.typicalMandiBenchmark));
    setIsAddCropModalOpen(false);

    // Reset modal form
    setCustomCropName('');
    setCustomCropLocalName('');
    setCustomCropBenchmark(30);
    setCustomCropEmoji('🌱');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const locMatch = locationOptionsList.find((l) => l.name === locationName) || DEFAULT_LOCATION_OPTIONS[0];
    const finalCoords = customCoords || { lat: locMatch.lat, lng: locMatch.lng };

    const submitFn = onSubmitProduce || onSubmit;
    if (submitFn) {
      await submitFn({
        cropName: selectedCrop,
        quantityKg: Number(quantity),
        qualityGrade,
        location: locationName,
        coordinates: finalCoords,
        expectedPricePerKg: expectedPrice ? Number(expectedPrice) : undefined,
        imageUrl: cropImageUrl || undefined,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Form Content - Starts directly with Select Crop at the top */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* 1. Crop Selection Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-base font-bold text-slate-900 font-sans tracking-tight">
                  1. {t('select_crop', 'Select Crop / Produce')} <span className="text-red-500">*</span>
                </label>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                  {selectedCrop}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('select_or_add_crop', 'Choose from standard crops or add any custom crop produced on your farm.')}
              </p>
            </div>

            {/* Prominent Add Custom Crop Button */}
            <button
              type="button"
              onClick={() => setIsAddCropModalOpen(true)}
              className="self-start sm:self-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>+ {t('add_new_crop_btn', 'Add Custom Crop')}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {cropsCatalog.map((crop) => {
              const isSelected = selectedCrop.toLowerCase() === crop.name.toLowerCase();
              return (
                <div
                  key={crop.id}
                  onClick={() => {
                    setSelectedCrop(crop.name);
                    setExpectedPrice(String(crop.typicalMandiBenchmark));
                  }}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer relative group ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/30 shadow-xs font-bold'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-2xl transform group-hover:scale-110 transition">{crop.iconEmoji}</span>
                  <span className="font-semibold text-xs text-slate-900 truncate max-w-full">
                    {crop.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Avg ₹{crop.typicalMandiBenchmark}/kg
                  </span>
                  {crop.isCustom && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                      <span className="text-[8px] bg-teal-100 text-teal-800 px-1 rounded font-bold border border-teal-200">
                        Custom
                      </span>
                      {onDeleteCustomCrop && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomCrop(crop.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-600 rounded transition"
                          title="Delete custom crop"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Add Custom Crop Tile */}
            <button
              type="button"
              onClick={() => setIsAddCropModalOpen(true)}
              className="p-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-200/80 group-hover:bg-emerald-300 text-emerald-900 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-emerald-900">
                + {t('add_new_crop_btn', 'Add Custom')}
              </span>
              <span className="text-[10px] text-emerald-700">
                Any crop
              </span>
            </button>
          </div>
        </div>

        {/* 2. Crop Camera Photo Upload Feature */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {cropImageUrl ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 bg-slate-900">
                <img src={cropImageUrl} alt="Crop" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCropImageUrl('')}
                  className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full text-[10px]"
                  title="Remove photo"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{t('attach_photo_optional', 'Crop Photo')}</span>
                {cropImageUrl && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    Attached
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {cropImageUrl
                  ? 'High-res crop picture attached. Clear crop photos help buyers assess produce quality and improve listing credibility.'
                  : 'Take a live camera picture of your crop lot to show quality and packaging to buyers.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCameraModalOpen(true)}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cropImageUrl ? t('change_photo', 'Retake / Change Photo') : t('take_photo_upload', 'Take Crop Photo (Camera)')}</span>
          </button>
        </div>

        {/* 3. Quantity & Expected Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              2. {t('quantity_kg', 'Quantity in Kilograms (kg)')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Scale className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="50"
                max="50000"
                step="50"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full pl-9 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                placeholder="e.g. 500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-500">
                kg
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {[200, 500, 1000, 2500, 5000].map((quickQty) => (
                <button
                  key={quickQty}
                  type="button"
                  onClick={() => setQuantity(quickQty)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    quantity === quickQty
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {quickQty >= 1000 ? `${quickQty / 1000} MT` : `${quickQty} kg`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              3. {t('quality_grade', 'Quality / Grade')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Award className="w-4 h-4" />
              </div>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Grade A">{t('grade_a', 'Grade A (Premium / Export Standard)')}</option>
                <option value="Grade B">{t('grade_b', 'Grade B (Standard APMC Market)')}</option>
                <option value="Grade C">{t('grade_c', 'Grade C (Local / Processing Quality)')}</option>
                <option value="Organic / Premium">{t('grade_organic', 'Organic / Certified Premium')}</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Buyers filter based on minimum acceptable lot grade.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-900">
                4. {t('dispatch_location', 'Farm Location / APMC Hub')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLiveGps}
                disabled={isDetectingGps}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Compass className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? t('detecting_gps', 'Detecting GPS...') : `📍 ${t('detect_live_gps', 'Use Live GPS')}`}</span>
              </button>
            </div>

            {gpsStatus && (
              <div className="mb-2 text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 font-medium flex items-center justify-between">
                <span>{gpsStatus}</span>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={locationName}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocationName(val);
                  const matched = locationOptionsList.find((l) => l.name === val);
                  if (matched) {
                    setCustomCoords({ lat: matched.lat, lng: matched.lng });
                  }
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                {locationOptionsList.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used to calculate exact road distance and transport freight.
            </p>
          </div>
        </div>

        {/* Expected Price & Benchmark Note */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                {t('estimated_gross_value', 'Representative Mandi Benchmark')} for {currentCropObj.name}
              </div>
              <div className="text-lg font-bold text-slate-900">
                ₹{currentCropObj.typicalMandiBenchmark} / kg{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({t('harvest_lot_summary', 'Estimated Lot Value')}: ₹{(quantity * currentCropObj.typicalMandiBenchmark).toLocaleString('en-IN')})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
              {t('target_price_optional', 'Expected Min Price')} (₹/kg):
            </label>
            <input
              type="number"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="₹/kg"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Platform-Listed Buyers & Processors Ready for Matching</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            <span>{isLoading ? t('finding_matches', 'Finding Matches & Road Routes...') : t('find_matching_buyers', 'Find Best Matching Buyers & Calculate Net Return')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Add Custom Crop Modal */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight flex items-center gap-2">
                  <span>Add Custom Crop to Catalog</span>
                  <span className="text-base">{customCropEmoji}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your crop details, category, and average mandi benchmark price.
                </p>
              </div>
              <button
                onClick={() => setIsAddCropModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCrop} className="space-y-4 pt-4 text-xs">
              {/* Crop Name & Regional Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Crop Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                    placeholder="e.g. Dragon Fruit, Kashmiri Apple"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Regional Name (Hindi/Local)
                  </label>
                  <input
                    type="text"
                    value={customCropLocalName}
                    onChange={(e) => setCustomCropLocalName(e.target.value)}
                    placeholder="e.g. ड्रैगन फ्रूट, सेब"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Select Crop Icon Emoji
                </label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 max-h-28 overflow-y-auto">
                  {COMMON_CROP_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCustomCropEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition cursor-pointer ${
                        customCropEmoji === emoji
                          ? 'bg-emerald-200 border-2 border-emerald-600 scale-110 shadow-xs'
                          : 'bg-white hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Benchmark Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Category
                  </label>
                  <select
                    value={customCropCategory}
                    onChange={(e) => setCustomCropCategory(e.target.value as CropMaster['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Vegetables">Vegetables (सब्जियां)</option>
                    <option value="Fruits">Fruits (फल)</option>
                    <option value="Grains & Cereals">Grains & Cereals (अनाज)</option>
                    <option value="Pulses">Pulses / Dal (दालें)</option>
                    <option value="Oilseeds">Oilseeds (तिलहन)</option>
                    <option value="Spices">Spices (मसाले)</option>
                    <option value="Cash Crops">Cash Crops (नकदी फसलें)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Avg Mandi Price (₹/kg) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={customCropBenchmark}
                      onChange={(e) => setCustomCropBenchmark(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Perishability & Shelf Life */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Perishability
                  </label>
                  <select
                    value={customCropPerishability}
                    onChange={(e) => setCustomCropPerishability(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="HIGH">High (Tomatoes, Berries - 3-7 days)</option>
                    <option value="MEDIUM">Medium (Onions, Potatoes - 15-45 days)</option>
                    <option value="LOW">Low (Grains, Pulses - 180+ days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Default Shelf Life (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customCropShelfLife}
                    onChange={(e) => setCustomCropShelfLife(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCropModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Crop & Select</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        cropName={selectedCrop}
        onCapture={(imageData) => {
          setCropImageUrl(imageData);
        }}
      />
    </div>
  );
};
