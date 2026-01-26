/**
 * Geocoding Utility
 * 
 * Converts city/country names to latitude/longitude coordinates
 * for accurate astrology calculations (moon sign, rising sign).
 */

// Simple geocoding database for common cities
// In production, this would use a real geocoding API
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // New Zealand
  "leeston,new zealand": { lat: -43.7667, lon: 172.3000 },
  "auckland,new zealand": { lat: -36.8485, lon: 174.7633 },
  "wellington,new zealand": { lat: -41.2865, lon: 174.7762 },
  "christchurch,new zealand": { lat: -43.5321, lon: 172.6362 },
  
  // Major world cities
  "london,united kingdom": { lat: 51.5074, lon: -0.1278 },
  "new york,united states": { lat: 40.7128, lon: -74.0060 },
  "tokyo,japan": { lat: 35.6762, lon: 139.6503 },
  "sydney,australia": { lat: -33.8688, lon: 151.2093 },
  "paris,france": { lat: 48.8566, lon: 2.3522 },
  "berlin,germany": { lat: 52.5200, lon: 13.4050 },
  "rome,italy": { lat: 41.9028, lon: 12.4964 },
  "madrid,spain": { lat: 40.4168, lon: -3.7038 },
  "beijing,china": { lat: 39.9042, lon: 116.4074 },
  "mumbai,india": { lat: 19.0760, lon: 72.8777 },
  "singapore,singapore": { lat: 1.3521, lon: 103.8198 },
  "dubai,united arab emirates": { lat: 25.2048, lon: 55.2708 },
  "los angeles,united states": { lat: 34.0522, lon: -118.2437 },
  "toronto,canada": { lat: 43.6532, lon: -79.3832 },
  "mexico city,mexico": { lat: 19.4326, lon: -99.1332 },
  "são paulo,brazil": { lat: -23.5505, lon: -46.6333 },
  "buenos aires,argentina": { lat: -34.6037, lon: -58.3816 },
  "cape town,south africa": { lat: -33.9249, lon: 18.4241 },
  "moscow,russia": { lat: 55.7558, lon: 37.6173 },
  "istanbul,turkey": { lat: 41.0082, lon: 28.9784 },
  "bangkok,thailand": { lat: 13.7563, lon: 100.5018 },
  "seoul,south korea": { lat: 37.5665, lon: 126.9780 },
  "hong kong,china": { lat: 22.3193, lon: 114.1694 },
};

/**
 * Geocode a city/country pair to coordinates.
 * Returns default coordinates (0, 0) if not found.
 */
export function geocode(city: string, country: string): { latitude: number; longitude: number } {
  const key = `${city.toLowerCase()},${country.toLowerCase()}`;
  const coords = CITY_COORDINATES[key];
  
  if (coords) {
    return { latitude: coords.lat, longitude: coords.lon };
  }
  
  // Return default coordinates (Greenwich, UK) if not found
  // This ensures astrology calculations don't crash
  console.warn(`[Geocoding] No coordinates found for ${city}, ${country}. Using default (0, 0).`);
  return { latitude: 0, longitude: 0 };
}

/**
 * Check if a city/country pair has known coordinates.
 */
export function hasCoordinates(city: string, country: string): boolean {
  const key = `${city.toLowerCase()},${country.toLowerCase()}`;
  return key in CITY_COORDINATES;
}
