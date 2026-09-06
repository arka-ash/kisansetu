import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BuyerMatchResult, BuyerProfile, FarmerListing } from '../types';
import { MapPin, Navigation, Send, Layers, Star, Info } from 'lucide-react';

interface AgriMapProps {
  farmerCoordinates?: { lat: number; lng: number };
  farmerCoords?: { lat: number; lng: number };
  farmerLocationName?: string;
  farmerLocation?: string;
  farmerName?: string;
  matches?: BuyerMatchResult[];
  buyers?: BuyerProfile[];
  selectedCrop?: string;
  onSendOffer?: (match: BuyerMatchResult) => void;
}

export const AgriMap: React.FC<AgriMapProps> = ({
  farmerCoordinates: propFarmerCoords,
  farmerCoords,
  farmerLocationName: propFarmerLocName,
  farmerLocation,
  farmerName,
  matches: propMatches = [],
  buyers = [],
  selectedCrop = 'Produce',
  onSendOffer = (_match: BuyerMatchResult) => {},
}) => {
  const activeCoordinates = propFarmerCoords || farmerCoords || { lat: 23.5204, lng: 87.3119 };
  const activeLocationName = propFarmerLocName || farmerLocation || (farmerName ? `${farmerName}'s Farm Gate` : 'Farm Gate (Durgapur, WB)');
  const matches = propMatches;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerMatchResult | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeCoordinates.lat, activeCoordinates.lng],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // 1. Add Farmer Marker (Green Icon)
    const farmerIcon = L.divIcon({
      className: 'custom-farmer-icon',
      html: `
        <div style="background-color: #047857; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <span style="font-size: 16px;">🌾</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const farmerMarker = L.marker([activeCoordinates.lat, activeCoordinates.lng], { icon: farmerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 12px; font-family: sans-serif;">
          <div style="font-size: 10px; font-weight: bold; color: #047857; text-transform: uppercase;">Your Farm Gate Location</div>
          <div style="font-size: 14px; font-weight: bold; color: #111827; margin-top: 2px;">${activeLocationName}</div>
          <div style="font-size: 11px; color: #4B5563; margin-top: 4px;">Origin for all logistics and freight calculations</div>
        </div>
      `);

    // Radius circles (50 km, 150 km)
    L.circle([activeCoordinates.lat, activeCoordinates.lng], {
      radius: 50000,
      color: '#059669',
      fillColor: '#10B981',
      fillOpacity: 0.05,
      weight: 1,
      dashArray: '4, 4',
    }).addTo(map);

    // 2. Add Buyer Markers
    const bounds = L.latLngBounds([[activeCoordinates.lat, activeCoordinates.lng]]);

    matches.forEach((match) => {
      if (!match.buyer || !match.buyer.coordinates) return;
      const isBest = match.isRecommended;
      const isHighDemand = match.cropRequirement?.demandLevel === 'HIGH';

      const pinColor = isBest ? '#059669' : isHighDemand ? '#DC2626' : '#2563EB';
      const pinEmoji = isBest ? '⭐' : '🏢';

      const buyerIcon = L.divIcon({
        className: 'custom-buyer-icon',
        html: `
          <div style="background-color: ${pinColor}; color: white; width: ${isBest ? '38px' : '32px'}; height: ${isBest ? '38px' : '32px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); cursor: pointer;">
            <span style="font-size: ${isBest ? '16px' : '13px'};">${pinEmoji}</span>
          </div>
        `,
        iconSize: isBest ? [38, 38] : [32, 32],
        iconAnchor: isBest ? [19, 19] : [16, 16],
      });

      const marker = L.marker([match.buyer.coordinates.lat, match.buyer.coordinates.lng], { icon: buyerIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedBuyer(match);
        });

      bounds.extend([match.buyer.coordinates.lat, match.buyer.coordinates.lng]);

      // Connect recommended buyer with a highlighted route line
      if (isBest) {
        L.polyline(
          [
            [activeCoordinates.lat, activeCoordinates.lng],
            [match.buyer.coordinates.lat, match.buyer.coordinates.lng],
          ],
          {
            color: '#059669',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.8,
          }
        ).addTo(map);
      }
    });

    // Fit map bounds safely
    if (matches.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }

    return () => {
      // Map stays attached or cleaned up gracefully
    };
  }, [activeCoordinates.lat, activeCoordinates.lng, activeLocationName, matches]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      {/* Map Header */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold font-sans tracking-tight">
              Interactive Mandi & Buyer Geospatial Map
            </h3>
            <span className="text-[11px] bg-emerald-800 text-emerald-100 font-semibold px-2 py-0.5 rounded">
              OpenStreetMap
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic view of procurement hubs from origin: <strong className="text-white">{activeLocationName}</strong>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Your Farm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-300">Recommended ⭐</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-slate-300">High Demand</span>
          </div>
        </div>
      </div>

      {/* Map Body & Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[420px]">
        {/* Leaflet Canvas */}
        <div
          ref={mapContainerRef}
          className="lg:col-span-8 w-full h-[400px] lg:h-[480px] z-0"
        />

        {/* Right Info Drawer: Selected Buyer or Top Recommendation */}
        <div className="lg:col-span-4 p-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between overflow-y-auto max-h-[480px]">
          {selectedBuyer ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Selected Mandi / Buyer
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-1 font-sans tracking-tight">
                    {selectedBuyer.buyer.name}
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBuyer.buyer.location}</span>
                  </div>
                </div>

                {selectedBuyer.isRecommended && (
                  <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-slate-950" />
                    <span>Top Pick</span>
                  </span>
                )}
              </div>

              {/* Data Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Distance from Farm:</span>
                  <span className="font-bold text-slate-900">{selectedBuyer.distanceKm} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Procurement Price:</span>
                  <span className="font-bold text-emerald-700">₹{selectedBuyer.pricePerKg}/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Demand Level:</span>
                  <span
                    className={`font-bold uppercase ${
                      selectedBuyer.cropRequirement.demandLevel === 'HIGH'
                        ? 'text-red-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {selectedBuyer.cropRequirement.demandLevel}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Estimated Freight:</span>
                  <span className="font-medium text-red-600">-₹{selectedBuyer.transportCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 items-center pt-2">
                  <span className="text-slate-700 font-bold">Estimated Net Return:</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{selectedBuyer.netReturn.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                <strong>Logistics:</strong> {selectedBuyer.transportDetails.vehicleType} • ETA ~{selectedBuyer.transportDetails.estimatedDays}
              </div>

              <button
                type="button"
                onClick={() => onSendOffer(selectedBuyer)}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Direct Offer (₹{selectedBuyer.pricePerKg}/kg)</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">Select Any Pin on Map</h5>
                <p className="text-xs text-slate-500 mt-1">
                  Click on any buyer marker to view precise road distance, transport fees, and estimated net returns.
                </p>
              </div>

              {matches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBuyer(matches.find((m) => m.isRecommended) || matches[0])}
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  View Top Recommended Buyer
                </button>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 text-center">
            Integrated with Leaflet + OpenStreetMap GPS routing
          </div>
        </div>
      </div>
    </div>
  );
};
