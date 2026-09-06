/**
 * Geolocation & Reverse Geocoding Utility for KisanSetu
 */

export interface GeoLocationResult {
  coordinates: { lat: number; lng: number };
  accuracyMeters: number;
  formattedAddress: string;
  district?: string;
  state?: string;
  city?: string;
  source: 'gps' | 'ip' | 'fallback';
}

const KNOWN_INDIAN_HUBS = [
  { name: 'Durgapur, West Bengal', district: 'Paschim Bardhaman', state: 'West Bengal', lat: 23.5204, lng: 87.3119 },
  { name: 'Kolkata, West Bengal', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Asansol, West Bengal', district: 'Paschim Bardhaman', state: 'West Bengal', lat: 23.6889, lng: 86.9661 },
  { name: 'Burdwan, West Bengal', district: 'Purba Bardhaman', state: 'West Bengal', lat: 23.2324, lng: 87.8615 },
  { name: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Pune, Maharashtra', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Mumbai, Maharashtra', district: 'Mumbai Suburban', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Ludhiana, Punjab', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Amritsar, Punjab', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Guntur, Andhra Pradesh', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365 },
  { name: 'Vijayawada, Andhra Pradesh', district: 'NTR', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { name: 'Indore, Madhya Pradesh', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal, Madhya Pradesh', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { name: 'Agra, Uttar Pradesh', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Varanasi, Uttar Pradesh', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Lucknow, Uttar Pradesh', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Bengaluru, Karnataka', district: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad, Telangana', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Jaipur, Rajasthan', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Ahmedabad, Gujarat', district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Patna, Bihar', district: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
];

/**
 * Calculate distance in km between two lat/lng pairs using the Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds the nearest known Indian hub to the given coordinates
 */
export function findNearestIndianHub(lat: number, lng: number) {
  let nearest = KNOWN_INDIAN_HUBS[0];
  let minDistance = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);

  for (const hub of KNOWN_INDIAN_HUBS) {
    const dist = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hub;
    }
  }

  return { hub: nearest, distanceKm: minDistance };
}

/**
 * Reverse geocode lat/lng to clean formatted address using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{
  formattedAddress: string;
  district?: string;
  state?: string;
  city?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'KisanSetuAgriApp/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
      const district = addr.state_district || addr.county || addr.district || '';
      const state = addr.state || '';
      const country = addr.country || 'India';

      let formatted = '';
      if (city && state) {
        formatted = `${city}, ${state}`;
      } else if (district && state) {
        formatted = `${district}, ${state}`;
      } else if (state) {
        formatted = `${state}, ${country}`;
      } else if (data.display_name) {
        formatted = data.display_name.split(',').slice(0, 3).join(', ').trim();
      }

      if (formatted) {
        return {
          formattedAddress: formatted,
          district: district || city,
          state: state || 'India',
          city: city || district,
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocode fallback triggered:', err);
  }

  // Fallback to nearest recognized hub
  const nearest = findNearestIndianHub(lat, lng);
  return {
    formattedAddress: nearest.hub.name,
    district: nearest.hub.district,
    state: nearest.hub.state,
    city: nearest.hub.name.split(',')[0],
  };
}

/**
 * Request real device GPS location with high accuracy
 */
export async function getUserLiveLocation(): Promise<GeoLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 20);

        try {
          const geocoded = await reverseGeocode(lat, lng);
          resolve({
            coordinates: { lat, lng },
            accuracyMeters: accuracy,
            formattedAddress: geocoded.formattedAddress,
            district: geocoded.district,
            state: geocoded.state,
            city: geocoded.city,
            source: 'gps',
          });
        } catch {
          const nearest = findNearestIndianHub(lat, lng);
          resolve({
            coordinates: { lat, lng },
            accuracyMeters: accuracy,
            formattedAddress: nearest.hub.name,
            district: nearest.hub.district,
            state: nearest.hub.state,
            source: 'gps',
          });
        }
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  });
}
