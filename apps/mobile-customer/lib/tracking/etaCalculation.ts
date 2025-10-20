/**
 * ETA and distance calculations for driver tracking
 */

interface Location {
  latitude: number;
  longitude: number;
}

interface ETAResult {
  distanceMiles: number;
  distanceKm: number;
  estimatedMinutes: number;
  eta: Date;
  etaFormatted: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles and kilometers
 */
export const calculateDistance = (
  origin: Location,
  destination: Location
): { miles: number; km: number } => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLng = toRad(destination.longitude - origin.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.latitude)) *
      Math.cos(toRad(destination.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const miles = R * c;
  const km = miles * 1.60934;

  return { miles: Math.round(miles * 10) / 10, km: Math.round(km * 10) / 10 };
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculate ETA based on distance and average speed
 * Used as fallback when Google Directions API is not available
 */
export const calculateETAFromDistance = (
  distanceMiles: number,
  averageSpeedMph: number = 25 // Average city driving speed
): ETAResult => {
  const estimatedMinutes = Math.ceil((distanceMiles / averageSpeedMph) * 60);
  const eta = new Date(Date.now() + estimatedMinutes * 60000);

  return {
    distanceMiles,
    distanceKm: distanceMiles * 1.60934,
    estimatedMinutes,
    eta,
    etaFormatted: formatETA(eta),
  };
};

/**
 * Calculate ETA based on current location and destination
 * Returns estimated arrival time and formatted string
 */
export const calculateETA = (
  currentLocation: Location,
  destination: Location,
  averageSpeed: number = 25
): ETAResult => {
  const { miles } = calculateDistance(currentLocation, destination);
  return calculateETAFromDistance(miles, averageSpeed);
};

/**
 * Format ETA time as human-readable string
 * Examples: "2:30 PM", "In 5 mins"
 */
export const formatETA = (eta: Date): string => {
  const now = new Date();
  const diffMs = eta.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 0) {
    return 'Arrived';
  }

  if (diffMins <= 60) {
    return `In ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `In ${hours}h ${mins}m`;
};

/**
 * Format time as HH:MM AM/PM
 */
export const formatTimeAMPM = (date: Date): string => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
};

/**
 * Get traffic-based speed adjustment
 * Returns average speed based on time of day and day of week
 */
export const getAdjustedSpeed = (date: Date = new Date()): number => {
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Rush hour: 7-9 AM, 5-7 PM
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

  if (isRushHour && !isWeekend) {
    return 15; // Slower during rush hour
  }

  if (isWeekend && (hour >= 12 && hour <= 20)) {
    return 20; // Slower on weekends afternoons
  }

  return 28; // Normal speed
};

/**
 * Calculate ETA with traffic consideration
 */
export const calculateETAWithTraffic = (
  currentLocation: Location,
  destination: Location,
  dateTime: Date = new Date()
): ETAResult => {
  const adjustedSpeed = getAdjustedSpeed(dateTime);
  return calculateETA(currentLocation, destination, adjustedSpeed);
};

/**
 * Get color for ETA urgency
 * Green: > 10 mins
 * Amber: 5-10 mins
 * Red: < 5 mins
 */
export const getETAColor = (
  estimatedMinutes: number,
  colors: { good: string; warning: string; urgent: string }
): string => {
  if (estimatedMinutes > 10) {
    return colors.good;
  }
  if (estimatedMinutes > 5) {
    return colors.warning;
  }
  return colors.urgent;
};

/**
 * Get speed category for route coloring
 * Used to color-code route segments by traffic
 */
export const getSpeedCategory = (
  speedMph: number
): 'low' | 'medium' | 'high' => {
  if (speedMph > 25) return 'low'; // Free-flowing
  if (speedMph > 15) return 'medium'; // Moderate traffic
  return 'high'; // Heavy traffic
};

/**
 * Calculate progress percentage for ETA
 * Used for progress bar in ETA banner
 */
export const calculateETAProgress = (
  originalETA: Date,
  originalDistance: number,
  currentDistance: number
): number => {
  const distanceProgress = (originalDistance - currentDistance) / originalDistance;
  return Math.max(0, Math.min(1, distanceProgress)); // Clamp to 0-1
};

/**
 * Format distance with appropriate unit
 * Shows miles if < 10km, otherwise km
 */
export const formatDistance = (distanceMiles: number): string => {
  if (distanceMiles >= 1) {
    return `${distanceMiles.toFixed(1)} mi`;
  }

  const feet = distanceMiles * 5280;
  if (feet >= 100) {
    return `${Math.round(feet / 100) * 100} ft`;
  }

  return 'Very close';
};

/**
 * Generate realistic ETA variations to simulate real tracking
 * Adds slight randomness to make tracking feel more natural
 */
export const addETAVariation = (baseETA: Date, variationMinutes: number = 2): Date => {
  const variation = (Math.random() - 0.5) * variationMinutes * 60000;
  return new Date(baseETA.getTime() + variation);
};
