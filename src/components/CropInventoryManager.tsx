import React, { useState } from 'react';
import {
  CropInventoryItem,
  CropMaster,
  FarmerListing,
  FarmerProfile,
  QualityGrade,
} from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { useLanguage } from '../context/LanguageContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Camera,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Calendar,
  MapPin,
  IndianRupee,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Tag,
  Clock,
  Layers,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  Award,
} from 'lucide-react';

interface CropInventoryManagerProps {
  currentFarmer: FarmerProfile;
  inventory: CropInventoryItem[];
  cropsCatalog: CropMaster[];
  onAddInventoryItem: (item: Omit<CropInventoryItem, 'id' | 'lastUpdated'>) => void;
  onUpdateInventoryItem: (id: string, updates: Partial<CropInventoryItem>) => void;
  onDeleteInventoryItem: (id: string) => void;
  onAddCustomCrop: (crop: Omit<CropMaster, 'id'>) => void;
  onUpdateCrop: (id: string, updates: Partial<CropMaster>) => void;
  onDeleteCustomCrop: (id: string) => void;
  onSelectForSelling: (cropName: string, quantityKg: number, grade: QualityGrade) => void;
}

export const CropInventoryManager: React.FC<CropInventoryManagerProps> = ({
  currentFarmer,
  inventory,
  cropsCatalog,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
  onAddCustomCrop,
  onUpdateCrop,
  onDeleteCustomCrop,
  onSelectForSelling,
}) => {
  const { t } = useLanguage();
  // Filters & State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals State
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState<boolean>(false);
  const [isEditLotModalOpen, setIsEditLotModalOpen] = useState<boolean>(false);
  const [isCropCatalogModalOpen, setIsCropCatalogModalOpen] = useState<boolean>(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
  const [isEditCropModalOpen, setIsEditCropModalOpen] = useState<boolean>(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Active item selections for edit/adjust
  const [activeEditingItem, setActiveEditingItem] = useState<CropInventoryItem | null>(null);
  const [activeEditingCrop, setActiveEditingCrop] = useState<CropMaster | null>(null);
  const [activeAdjustingItem, setActiveAdjustingItem] = useState<CropInventoryItem | null>(null);

  // Form State for New / Edit Inventory Lot
  const [formCropName, setFormCropName] = useState<string>('Onion');
  const [formVariety, setFormVariety] = useState<string>('');
  const [formQuantityKg, setFormQuantityKg] = useState<number>(1000);
  const [formGrade, setFormGrade] = useState<QualityGrade>('Grade A');
  const [formHarvestDate, setFormHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formStorageLocation, setFormStorageLocation] = useState<string>('Farm Shade Godown');
  const [formExpectedPrice, setFormExpectedPrice] = useState<number>(25);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Form State for Stock Adjustment
  const [adjustAmountKg, setAdjustAmountKg] = useState<number>(100);
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState<string>('New Harvest Intake');

  // Form State for Custom Crop
  const [cropFormName, setCropFormName] = useState<string>('');
  const [cropFormCategory, setCropFormCategory] = useState<CropMaster['category']>('Vegetables');
  const [cropFormEmoji, setCropFormEmoji] = useState<string>('🌱');
  const [cropFormBenchmark, setCropFormBenchmark] = useState<number>(30);
  const [cropFormShelfLife, setCropFormShelfLife] = useState<number>(30);

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.variety && item.variety.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const cropMeta = cropsCatalog.find((c) => c.name.toLowerCase() === item.cropName.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || (cropMeta && cropMeta.category === selectedCategory);

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Totals & Stats
  const totalStockKg = inventory.reduce((sum, item) => sum + item.availableQuantityKg, 0);
  const totalStockQuintals = (totalStockKg / 100).toFixed(1);
  const totalEstimatedValue = inventory.reduce(
    (sum, item) => sum + item.availableQuantityKg * (item.expectedPricePerKg || 25),
    0
  );
  const lowStockCount = inventory.filter((item) => item.status === 'LOW_STOCK' || item.availableQuantityKg < 500).length;

  // Open Edit Lot Modal
  const handleOpenEditLot = (item: CropInventoryItem) => {
    setActiveEditingItem(item);
    setFormCropName(item.cropName);
    setFormVariety(item.variety || '');
    setFormQuantityKg(item.totalQuantityKg);
    setFormGrade(item.qualityGrade);
    setFormHarvestDate(item.harvestDate);
    setFormStorageLocation(item.storageLocation);
    setFormExpectedPrice(item.expectedPricePerKg);
    setFormImageUrl(item.imageUrl || '');
    setFormNotes(item.notes || '');
    setIsEditLotModalOpen(true);
  };

  // Open Adjust Stock Modal
  const handleOpenAdjustStock = (item: CropInventoryItem) => {
    setActiveAdjustingItem(item);
    setAdjustAmountKg(100);
    setAdjustType('ADD');
    setAdjustReason('New Harvest Intake');
    setIsAdjustStockModalOpen(true);
  };

  // Submit New Lot
  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInventoryItem({
      farmerId: currentFarmer.id,
      cropName: formCropName,
      variety: formVariety,
      totalQuantityKg: Number(formQuantityKg),
      availableQuantityKg: Number(formQuantityKg),
      reservedQuantityKg: 0,
      qualityGrade: formGrade,
      harvestDate: formHarvestDate,
      storageLocation: formStorageLocation,
      expectedPricePerKg: Number(formExpectedPrice),
      imageUrl: formImageUrl || undefined,
      status: Number(formQuantityKg) < 500 ? 'LOW_STOCK' : 'IN_STOCK',
      notes: formNotes,
    });

    setIsAddLotModalOpen(false);
    resetLotForm();
  };

  // Submit Edit Lot
  const handleSaveEditLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingItem) return;

    onUpdateInventoryItem(activeEditingItem.id, {
      cropName: formCropName,
      variety: formVariety,
      totalQuantityKg: Number(formQuantityKg),
      availableQuantityKg: Math.max(0, Number(formQuantityKg) - activeEditingItem.reservedQuantityKg),
      qualityGrade: formGrade,
      harvestDate: formHarvestDate,
      storageLocation: formStorageLocation,
      expectedPricePerKg: Number(formExpectedPrice),
      imageUrl: formImageUrl || undefined,
      status: Number(formQuantityKg) < 500 ? 'LOW_STOCK' : 'IN_STOCK',
      notes: formNotes,
    });

    setIsEditLotModalOpen(false);
    setActiveEditingItem(null);
  };

  // Submit Stock Adjustment
  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjustingItem) return;

    const diff = adjustType === 'ADD' ? Number(adjustAmountKg) : -Number(adjustAmountKg);
    const newTotal = Math.max(0, activeAdjustingItem.totalQuantityKg + diff);
    const newAvailable = Math.max(0, activeAdjustingItem.availableQuantityKg + diff);

    let newStatus: CropInventoryItem['status'] = 'IN_STOCK';
    if (newAvailable === 0) newStatus = 'SOLD_OUT';
    else if (newAvailable < 500) newStatus = 'LOW_STOCK';

    onUpdateInventoryItem(activeAdjustingItem.id, {
      totalQuantityKg: newTotal,
      availableQuantityKg: newAvailable,
      status: newStatus,
      notes: `${activeAdjustingItem.notes ? activeAdjustingItem.notes + ' | ' : ''}[${new Date().toLocaleDateString()}]: ${adjustType === 'ADD' ? '+' : '-'}${adjustAmountKg}kg (${adjustReason})`,
    });

    setIsAdjustStockModalOpen(false);
    setActiveAdjustingItem(null);
  };

  // Submit Add Custom Crop
  const handleCreateCustomCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropFormName.trim()) return;

    onAddCustomCrop({
      name: cropFormName.trim(),
      category: cropFormCategory,
      iconEmoji: cropFormEmoji || '🌱',
      typicalMandiBenchmark: Number(cropFormBenchmark),
      seasonalDemand: 'HIGH',
      shelfLifeDays: Number(cropFormShelfLife),
      isCustom: true,
    });

    setCropFormName('');
    setCropFormBenchmark(30);
    setIsAddCropModalOpen(false);
  };

  // Submit Edit Crop
  const handleSaveEditCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingCrop) return;

    onUpdateCrop(activeEditingCrop.id, {
      name: cropFormName.trim(),
      category: cropFormCategory,
      iconEmoji: cropFormEmoji,
      typicalMandiBenchmark: Number(cropFormBenchmark),
      shelfLifeDays: Number(cropFormShelfLife),
    });

    setIsEditCropModalOpen(false);
    setActiveEditingCrop(null);
  };

  const resetLotForm = () => {
    setFormCropName(cropsCatalog[0]?.name || 'Onion');
    setFormVariety('');
    setFormQuantityKg(1000);
    setFormGrade('Grade A');
    setFormHarvestDate(new Date().toISOString().split('T')[0]);
    setFormStorageLocation('Farm Shade Godown');
    setFormExpectedPrice(25);
    setFormImageUrl('');
    setFormNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-800 text-emerald-200 text-xs px-3 py-1 rounded-full font-medium">
            <Boxes className="w-3.5 h-3.5" />
            <span>{t('crop_stock', 'Farm Inventory & Dynamic Crop Master')}</span>
          </div>
          <h1 className="text-2xl font-bold font-sans">
            {t('inventory_manager_title', 'Crop Stock & Inventory Management')}
          </h1>
          <p className="text-xs text-slate-400">
            {t('inventory_manager_desc', 'Track lot quantities, take live crop photos, manage custom crop names, and discover high-value buyers instantly.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCropCatalogModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t('manage_crops_catalog', 'Manage Crop Names')} ({cropsCatalog.length})</span>
          </button>

          <button
            onClick={() => {
              resetLotForm();
              setIsAddLotModalOpen(true);
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_harvest_lot', 'Add Crop Stock Lot')}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('available_stock', 'Available Stock')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-sans">
              {totalStockKg.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">kg ({totalStockQuintals} {t('quintals', 'Qtl')})</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">{t('active_lots_godown', 'Across active lots')} ({inventory.length})</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('estimated_stock_value', 'Estimated Valuation')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-700 font-sans">
              ₹{(totalEstimatedValue / 100000).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-500">Lakh</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{t('avg_benchmark_price', 'At current benchmark rates')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('monitored_varieties', 'Crops in Catalog')}</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-sans">
              {cropsCatalog.length}
            </span>
            <span className="text-xs font-bold text-slate-500">Varieties</span>
          </div>
          <span className="text-[11px] text-teal-700 mt-1 block">
            {cropsCatalog.filter((c) => c.isCustom).length} {t('custom_crops', 'custom farmer crops')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('low_stock_alert', 'Stock Alerts')}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-sans">
              {lowStockCount}
            </span>
            <span className="text-xs font-bold text-slate-500">Lots</span>
          </div>
          <span className={`text-[11px] font-medium mt-1 block ${lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {lowStockCount > 0 ? t('requires_replenishment', 'Action required: low quantity') : 'Healthy inventory levels'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_inventory_placeholder', 'Search crop, variety, godown...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-700 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-emerald-700 cursor-pointer"
          >
            <option value="ALL">{t('all_categories', 'All Categories')}</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Grains & Cereals">Grains & Cereals</option>
            <option value="Pulses">Pulses</option>
            <option value="Spices">Spices</option>
            <option value="Cash Crops">Cash Crops</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-emerald-700 cursor-pointer"
          >
            <option value="ALL">{t('all_status', 'All Status')}</option>
            <option value="IN_STOCK">{t('in_stock', 'In Stock')}</option>
            <option value="LOW_STOCK">{t('low_stock', 'Low Stock')}</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD_OUT">{t('sold_out', 'Sold Out')}</option>
          </select>
        </div>
      </div>

      {/* Inventory Lots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const cropMeta = cropsCatalog.find(
            (c) => c.name.toLowerCase() === item.cropName.toLowerCase()
          );

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header & Photo */}
              <div>
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.cropName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 gap-2">
                      <span className="text-4xl">{cropMeta?.iconEmoji || '🌱'}</span>
                      <span className="text-xs">No crop photo attached</span>
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <span>{cropMeta?.iconEmoji || '🌱'}</span>
                      <span>{item.cropName}</span>
                    </span>
                    <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {item.qualityGrade}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {item.imageUrl && (
                      <button
                        onClick={() => setPreviewPhotoUrl(item.imageUrl || null)}
                        className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg backdrop-blur-xs transition cursor-pointer"
                        title="View Full Photo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-xs ${
                        item.status === 'IN_STOCK'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'LOW_STOCK'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {item.status === 'IN_STOCK'
                        ? t('in_stock', 'In Stock')
                        : item.status === 'LOW_STOCK'
                        ? t('low_stock', 'Low Stock')
                        : item.status}
                    </span>
                  </div>

                  {/* Variety Banner at bottom of photo */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 text-white">
                    <div className="text-xs font-semibold truncate">
                      {item.variety || `${item.cropName} Standard Lot`}
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="truncate">{item.storageLocation}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Details & Numbers */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[11px] text-slate-500 block">{t('available_stock', 'Available Quantity')}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900 font-sans">
                          {item.availableQuantityKg.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-slate-500">kg</span>
                        <span className="text-[11px] text-slate-400">
                          ({(item.availableQuantityKg / 100).toFixed(1)} {t('quintals', 'Qtl')})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">{t('target_price_optional', 'Target Rate')}</span>
                      <div className="text-lg font-black text-emerald-700 font-sans">
                        ₹{item.expectedPricePerKg} <span className="text-xs font-normal text-slate-500">{t('rupees_per_kg', '/kg')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('harvest_date', 'Harvest')}: {item.harvestDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Shelf: ~{cropMeta?.shelfLifeDays || 30} days</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-2 bg-slate-50/70 p-2 rounded-lg">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenAdjustStock(item)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('adjust_stock', 'Adjust Qty')}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditLot(item)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('edit_details', 'Edit Lot')}</span>
                  </button>
                </div>

                {/* Primary Action: Discover Buyers for this Lot */}
                <button
                  onClick={() =>
                    onSelectForSelling(item.cropName, item.availableQuantityKg, item.qualityGrade)
                  }
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-md"
                >
                  <span>{t('find_buyers_for_lot', 'Find Best Buyer & Price')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredInventory.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('no_inventory_found', 'No matching crop stock lots found')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your current harvest inventory with quantity and photos to track stock levels and connect to buyers.
            </p>
            <button
              onClick={() => {
                resetLotForm();
                setIsAddLotModalOpen(true);
              }}
              className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('add_harvest_lot', 'Add First Stock Lot')}</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW INVENTORY LOT (WITH LIVE CAMERA PHOTO) */}
      {/* ========================================================================= */}
      {isAddLotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Add Crop Stock Lot</h3>
                  <p className="text-xs text-slate-400">Record quantity, harvest date, grade & picture</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Crop Name Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">Crop Name *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddLotModalOpen(false);
                      setIsCropCatalogModalOpen(true);
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Crop Name</span>
                  </button>
                </div>
                <select
                  value={formCropName}
                  onChange={(e) => {
                    setFormCropName(e.target.value);
                    const matched = cropsCatalog.find((c) => c.name === e.target.value);
                    if (matched) {
                      setFormExpectedPrice(matched.typicalMandiBenchmark);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-emerald-700 focus:bg-white"
                >
                  {cropsCatalog.map((crop) => (
                    <option key={crop.id} value={crop.name}>
                      {crop.iconEmoji} {crop.name} ({crop.category}) - Mandi Benchmark ₹{crop.typicalMandiBenchmark}/kg
                    </option>
                  ))}
                </select>
              </div>

              {/* Variety & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Variety / Strain</label>
                  <input
                    type="text"
                    placeholder="e.g. Nashik Red / Hybrid"
                    value={formVariety}
                    onChange={(e) => setFormVariety(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Total Quantity (Kg) *</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formQuantityKg}
                    onChange={(e) => setFormQuantityKg(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Grade & Expected Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Quality Grade *</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as QualityGrade)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-emerald-700 focus:bg-white"
                  >
                    <option value="Grade A">Grade A (Premium / Export / Uniform)</option>
                    <option value="Grade B">Grade B (Standard Commercial Mandi)</option>
                    <option value="Grade C">Grade C (Mixed Size / Processing)</option>
                    <option value="Organic / Premium">Organic / Premium Certified</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Expected Price (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={formExpectedPrice}
                    onChange={(e) => setFormExpectedPrice(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-emerald-700 focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Harvest Date & Storage Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Harvest Date *</label>
                  <input
                    type="date"
                    value={formHarvestDate}
                    onChange={(e) => setFormHarvestDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Godown, Cold Storage Sec 2"
                    value={formStorageLocation}
                    onChange={(e) => setFormStorageLocation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* Crop Picture Camera / Upload section */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Crop Picture</label>
                <div className="flex items-center gap-3">
                  {formImageUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={formImageUrl} alt="Crop preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-[10px]"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{formImageUrl ? 'Change Picture' : 'Take / Upload Picture'}</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Notes / Moisture / Packaging</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Packed in 50kg jute bags, dry moisture < 12%"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-emerald-700 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLotModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Crop Lot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT INVENTORY LOT */}
      {/* ========================================================================= */}
      {isEditLotModalOpen && activeEditingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Crop Lot: {activeEditingItem.cropName}</h3>
                  <p className="text-xs text-slate-400">Update quantity, pricing, or storage info</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditLotModalOpen(false);
                  setActiveEditingItem(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLot} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Crop Name</label>
                  <select
                    value={formCropName}
                    onChange={(e) => setFormCropName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {cropsCatalog.map((crop) => (
                      <option key={crop.id} value={crop.name}>
                        {crop.iconEmoji} {crop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Variety / Sub-type</label>
                  <input
                    type="text"
                    value={formVariety}
                    onChange={(e) => setFormVariety(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Total Quantity (Kg)</label>
                  <input
                    type="number"
                    min="10"
                    value={formQuantityKg}
                    onChange={(e) => setFormQuantityKg(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Expected Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formExpectedPrice}
                    onChange={(e) => setFormExpectedPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Quality Grade</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as QualityGrade)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                    <option value="Organic / Premium">Organic / Premium</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={formStorageLocation}
                    onChange={(e) => setFormStorageLocation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Crop Picture */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Crop Picture</label>
                <div className="flex items-center gap-3">
                  {formImageUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                      <img src={formImageUrl} alt="Crop" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{formImageUrl ? 'Change Photo' : 'Add Photo'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete lot for ${activeEditingItem.cropName}?`)) {
                      onDeleteInventoryItem(activeEditingItem.id);
                      setIsEditLotModalOpen(false);
                      setActiveEditingItem(null);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Lot</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditLotModalOpen(false);
                      setActiveEditingItem(null);
                    }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK ADJUST STOCK QUANTITY */}
      {/* ========================================================================= */}
      {isAdjustStockModalOpen && activeAdjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Adjust Stock: {activeAdjustingItem.cropName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Current: <strong className="text-emerald-400">{activeAdjustingItem.availableQuantityKg} kg</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdjustStockModalOpen(false);
                  setActiveAdjustingItem(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="p-5 space-y-4 text-xs">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'ADD' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stock (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('SUBTRACT')}
                  className={`py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'SUBTRACT' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <span>Reduce Stock (-)</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Adjustment Amount (Kg) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={adjustAmountKg}
                    onChange={(e) => setAdjustAmountKg(Number(e.target.value))}
                    required
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-base focus:outline-emerald-700"
                  />
                  <div className="flex items-center gap-1">
                    {[50, 100, 500].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setAdjustAmountKg(quick)}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] font-semibold"
                      >
                        {quick}kg
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                >
                  <option value="New Harvest Intake">New Harvest Intake / Farm Pick</option>
                  <option value="Local Mandi Direct Sale">Local Mandi Direct Cash Sale</option>
                  <option value="Sorted Out Storage Loss / Waste">Storage Spoilage / Sort Out</option>
                  <option value="Internal Family / Seed Use">Seed Retention / Farm Consumption</option>
                  <option value="FPO Aggregation Transfer">Transferred to FPO Joint Lot</option>
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-[11px]">
                New Available Stock will be:{' '}
                <strong className="text-emerald-800 font-sans text-xs">
                  {adjustType === 'ADD'
                    ? activeAdjustingItem.availableQuantityKg + adjustAmountKg
                    : Math.max(0, activeAdjustingItem.availableQuantityKg - adjustAmountKg)}{' '}
                  kg
                </strong>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdjustStockModalOpen(false);
                    setActiveAdjustingItem(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MANAGE & EDIT CROP NAMES MASTER CATALOG */}
      {/* ========================================================================= */}
      {isCropCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Crop Names Catalog ({cropsCatalog.length})</h3>
                  <p className="text-xs text-slate-400">Add custom crops, rename crops, and edit benchmark prices</p>
                </div>
              </div>
              <button
                onClick={() => setIsCropCatalogModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                Add any crop of your choice to use throughout KisanSetu
              </span>
              <button
                onClick={() => setIsAddCropModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Crop Name</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cropsCatalog.map((crop) => (
                  <div
                    key={crop.id}
                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-emerald-500 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                        {crop.iconEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{crop.name}</span>
                          {crop.isCustom && (
                            <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{crop.category}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700 font-sans">
                            ₹{crop.typicalMandiBenchmark}/kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setActiveEditingCrop(crop);
                          setCropFormName(crop.name);
                          setCropFormCategory(crop.category);
                          setCropFormEmoji(crop.iconEmoji);
                          setCropFormBenchmark(crop.typicalMandiBenchmark);
                          setCropFormShelfLife(crop.shelfLifeDays);
                          setIsEditCropModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Crop Name or Benchmark Price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {crop.isCustom && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove custom crop ${crop.name}?`)) {
                              onDeleteCustomCrop(crop.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Delete Custom Crop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsCropCatalogModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD CUSTOM CROP */}
      {/* ========================================================================= */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Add Custom Crop Name</span>
              </h3>
              <button onClick={() => setIsAddCropModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCrop} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Crop Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dragon Fruit, Green Chilli, Basmati Rice"
                  value={cropFormName}
                  onChange={(e) => setCropFormName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category *</label>
                  <select
                    value={cropFormCategory}
                    onChange={(e) => setCropFormCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Spices">Spices</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Cash Crops">Cash Crops</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="🌱"
                    value={cropFormEmoji}
                    onChange={(e) => setCropFormEmoji(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Benchmark Rate (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={cropFormBenchmark}
                    onChange={(e) => setCropFormBenchmark(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={cropFormShelfLife}
                    onChange={(e) => setCropFormShelfLife(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCropModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT EXISTING CROP */}
      {/* ========================================================================= */}
      {isEditCropModalOpen && activeEditingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-700" />
                <span>Edit Crop: {activeEditingCrop.name}</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditCropModalOpen(false);
                  setActiveEditingCrop(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCrop} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Crop Name *</label>
                <input
                  type="text"
                  value={cropFormName}
                  onChange={(e) => setCropFormName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={cropFormCategory}
                    onChange={(e) => setCropFormCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Spices">Spices</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Cash Crops">Cash Crops</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Emoji</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={cropFormEmoji}
                    onChange={(e) => setCropFormEmoji(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Benchmark Rate (₹/kg)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={cropFormBenchmark}
                    onChange={(e) => setCropFormBenchmark(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={cropFormShelfLife}
                    onChange={(e) => setCropFormShelfLife(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditCropModalOpen(false);
                    setActiveEditingCrop(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAMERA CAPTURE MODAL */}
      {/* ========================================================================= */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        cropName={formCropName}
        onCapture={(imageData) => {
          setFormImageUrl(imageData);
        }}
      />

      {/* ========================================================================= */}
      {/* PHOTO FULL-SIZE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-xs font-semibold">Verified Crop Lot Photo</span>
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={previewPhotoUrl}
                alt="Crop Full Preview"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
