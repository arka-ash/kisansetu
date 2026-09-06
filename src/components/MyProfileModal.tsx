import React, { useState } from 'react';
import { FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getUserLiveLocation } from '../utils/geoUtils';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Building,
  CreditCard,
  Sprout,
  RefreshCw,
  Layers,
  ShieldCheck,
  Database,
} from 'lucide-react';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: FarmerProfile;
  onSaveProfile: (updatedProfile: FarmerProfile) => Promise<void> | void;
  onOpenGmailAuth: () => void;
  onLocationUpdated?: (coords: { lat: number; lng: number }, locationName: string) => void;
}

const POPULAR_CROPS_LIST = [
  'Onion',
  'Potato',
  'Tomato',
  'Rice',
  'Wheat',
  'Maize',
  'Mustard',
  'Ginger',
  'Garlic',
  'Green Chilli',
  'Turmeric',
  'Soybean',
  'Cotton',
  'Sugarcane',
];

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  onClose,
  farmer,
  onSaveProfile,
  onOpenGmailAuth,
  onLocationUpdated,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const [name, setName] = useState<string>(farmer.name || '');
  const [email, setEmail] = useState<string>(farmer.email || '');
  const [mobile, setMobile] = useState<string>(farmer.mobile || '');
  const [address, setAddress] = useState<string>(farmer.address || '');
  const [district, setDistrict] = useState<string>(farmer.district || 'Paschim Bardhaman');
  const [stateName, setStateName] = useState<string>(farmer.state || 'West Bengal');
  const [pincode, setPincode] = useState<string>(farmer.pincode || '713212');
  const [locationName, setLocationName] = useState<string>(farmer.location || 'Durgapur, West Bengal');
  const [lat, setLat] = useState<number>(farmer.coordinates.lat || 23.5204);
  const [lng, setLng] = useState<number>(farmer.coordinates.lng || 87.3119);
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(farmer.farmSizeAcres || 4.5);
  const [fpoName, setFpoName] = useState<string>(farmer.fpoName || 'Damodar Valley Krishak Sangha');
  const [upiId, setUpiId] = useState<string>(farmer.upiId || `${farmer.mobile.replace(/\D/g, '').slice(-10)}@upi`);
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(
    farmer.primaryCrops && farmer.primaryCrops.length > 0
      ? farmer.primaryCrops
      : ['Onion', 'Potato', 'Tomato']
  );

  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(
    farmer.isGpsActive ? t('gps_active_msg', 'Live GPS Location is active & locked.') : null
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Toggle crop tag
  const toggleCrop = (crop: string) => {
    if (primaryCrops.includes(crop)) {
      setPrimaryCrops(primaryCrops.filter((c) => c !== crop));
    } else {
      setPrimaryCrops([...primaryCrops, crop]);
    }
  };

  // Detect Live GPS using navigator.geolocation and reverse geocode
  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsStatus(t('detecting_gps_status', 'Requesting GPS coordinates from your device...'));
    try {
      const geo = await getUserLiveLocation();
      setLat(geo.coordinates.lat);
      setLng(geo.coordinates.lng);
      setLocationName(geo.formattedAddress);
      if (geo.district) setDistrict(geo.district);
      if (geo.state) setStateName(geo.state);
      setGpsAccuracy(geo.accuracyMeters);
      setGpsStatus(`✅ GPS Locked: ${geo.formattedAddress} (Accuracy: ±${geo.accuracyMeters}m)`);

      if (onLocationUpdated) {
        onLocationUpdated(geo.coordinates, geo.formattedAddress);
      }
    } catch (err: any) {
      setGpsStatus(`⚠️ ${err.message || 'Could not fetch live GPS.'}`);
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: FarmerProfile = {
        ...farmer,
        name: name.trim() || farmer.name,
        email: email.trim() || farmer.email,
        mobile: mobile.trim() || farmer.mobile,
        location: locationName.trim() || `${district}, ${stateName}`,
        address: address.trim(),
        district: district.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        coordinates: { lat, lng },
        farmSizeAcres: Number(farmSizeAcres) || 3,
        fpoName: fpoName.trim(),
        primaryCrops,
        upiId: upiId.trim(),
        isGpsActive: true,
      };

      await onSaveProfile(updated);

      if (onLocationUpdated) {
        onLocationUpdated({ lat, lng }, updated.location);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl border-2 border-emerald-400/40 shadow-inner">
                {farmer.avatarUrl ? (
                  <img
                    src={farmer.avatarUrl}
                    alt={farmer.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900" title="Online & Synced" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight font-sans text-white">
                  {t('farmer_profile_title', 'Farmer Profile & Settings')}
                </h2>
                <span className="text-[10px] bg-emerald-900/90 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700">
                  {t('supabase_connected', 'Supabase Connected')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {t('farmer_profile_subtitle', 'Manage your name, address, GPS location, and linked Google / Gmail account.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Google / Gmail Status Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{t('google_auth_header', 'Google / Gmail Authentication')}</span>
                  {farmer.email ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      {t('linked', 'Linked')}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      {t('not_linked', 'Not Linked')}
                    </span>
                  )}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {farmer.email || t('sign_in_google_desc', 'Sign in with Google to enable automatic cloud backup & buyer alerts.')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenGmailAuth}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs text-xs whitespace-nowrap"
            >
              {farmer.email ? t('switch_relink_btn', 'Switch / Re-link Account') : t('connect_google_btn', 'Connect with Google')}
            </button>
          </div>

          {/* 2. Personal Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>{t('personal_contact_info', 'Personal & Contact Information')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('full_farmer_name', 'Full Farmer Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('mobile_number', 'Mobile / WhatsApp Number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="xxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('gmail_email_address', 'Gmail / Email Address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer.name@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('upi_id_label', 'UPI ID (For Direct Payments)')}
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. farmer@upi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Live Farm Location & GPS Detection */}
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>{t('farm_location_gps_title', 'Farm Location & Live GPS Positioning')}</span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {t('farm_location_gps_subtitle', 'Your exact GPS location ensures accurate buyer distance and road freight calculations.')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? t('detecting_gps_btn', 'Detecting GPS...') : `📍 ${t('use_live_gps_btn', 'Use Live GPS Location')}`}</span>
              </button>
            </div>

            {/* GPS Live Status Message */}
            {gpsStatus && (
              <div className="bg-white p-2.5 rounded-xl border border-emerald-300 text-[11px] text-emerald-950 font-medium flex items-center justify-between gap-2 shadow-2xs">
                <span>{gpsStatus}</span>
                {lat && lng && (
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('farm_village_address', 'Farm / Village Address')}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Village Gopalpur, Post Bamunara, Near Damodar Canal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('district_label', 'District')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Paschim Bardhaman"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('state_pincode_label', 'State & Pincode')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="West Bengal"
                    className="col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="713212"
                    className="col-span-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('apmc_hub_label', 'Primary APMC Market Hub Label')}
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Durgapur, West Bengal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('coordinates_label', 'Coordinates (Lat, Lng)')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="px-2 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-center"
                    placeholder="Lat"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="px-2 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-center"
                    placeholder="Lng"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Agricultural Holding & Crops */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>{t('farm_holding_title', 'Farm Land Holding & Primary Produce')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('total_farm_size_acres', 'Total Farm Size (Acres)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t('fpo_society_name', 'FPO / Cooperative Society Name')}
                </label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  placeholder="e.g. Damodar Valley Krishak Sangha"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                {t('major_crops_grown', 'Major Crops Grown (Click to toggle)')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CROPS_LIST.map((crop) => {
                  const isSelected = primaryCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${crop}` : `+ ${crop}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save Status & Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>{t('synced_supabase_notice', 'Changes are automatically synced to the Supabase Cloud database.')}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer text-xs"
              >
                {t('cancel', 'Cancel')}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-1/2 sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs text-xs disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{t('saved_and_synced', 'Saved & Synced!')}</span>
                  </>
                ) : isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('syncing_supabase', 'Syncing Supabase...')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('save_update_profile_btn', 'Save & Update Profile')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
