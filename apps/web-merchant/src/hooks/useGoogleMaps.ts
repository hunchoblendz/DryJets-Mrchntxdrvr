/**
 * Google Maps Hook
 *
 * Provides Google Maps functionality for live tracking
 * "Dummy User Friendly" - simple API, handles complexity internally
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useJsApiLoader, Libraries } from '@react-google-maps/api';

// Libraries to load
const libraries: Libraries = ['places', 'geometry', 'drawing'];

// Default map options for DryJets
export const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Dark mode map styles
export const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#0e1626' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: string; // e.g., "2.5 km"
  duration: string; // e.g., "8 mins"
  distanceValue: number; // meters
  durationValue: number; // seconds
  polyline: string; // encoded polyline
}

export interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | undefined;
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
  calculateRoute: (origin: Coordinates, destination: Coordinates) => Promise<RouteInfo | null>;
  getDirections: (origin: Coordinates, destination: Coordinates) => Promise<google.maps.DirectionsResult | null>;
  geocodeAddress: (address: string) => Promise<Coordinates | null>;
  reverseGeocode: (coords: Coordinates) => Promise<string | null>;
  calculateETA: (origin: Coordinates, destination: Coordinates) => Promise<number | null>;
  fitBoundsToMarkers: (markers: Coordinates[]) => void;
  panToLocation: (coords: Coordinates, zoom?: number) => void;
}

/**
 * Main Google Maps hook
 * Handles all Google Maps functionality in one place
 */
export function useGoogleMaps(): UseGoogleMapsReturn {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const distanceMatrixRef = useRef<google.maps.DistanceMatrixService | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Initialize services when loaded
  useEffect(() => {
    if (isLoaded && typeof google !== 'undefined') {
      directionsServiceRef.current = new google.maps.DirectionsService();
      geocoderRef.current = new google.maps.Geocoder();
      distanceMatrixRef.current = new google.maps.DistanceMatrixService();
    }
  }, [isLoaded]);

  /**
   * Calculate route between two points
   */
  const calculateRoute = useCallback(
    async (origin: Coordinates, destination: Coordinates): Promise<RouteInfo | null> => {
      if (!directionsServiceRef.current) return null;

      try {
        const result = await directionsServiceRef.current.route({
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        });

        const route = result.routes[0];
        const leg = route.legs[0];

        return {
          distance: leg.distance?.text || 'Unknown',
          duration: leg.duration?.text || 'Unknown',
          distanceValue: leg.distance?.value || 0,
          durationValue: leg.duration?.value || 0,
          polyline: route.overview_polyline,
        };
      } catch (error) {
        console.error('Error calculating route:', error);
        return null;
      }
    },
    []
  );

  /**
   * Get full directions result (for rendering on map)
   */
  const getDirections = useCallback(
    async (origin: Coordinates, destination: Coordinates): Promise<google.maps.DirectionsResult | null> => {
      if (!directionsServiceRef.current) return null;

      try {
        const result = await directionsServiceRef.current.route({
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        });

        return result;
      } catch (error) {
        console.error('Error getting directions:', error);
        return null;
      }
    },
    []
  );

  /**
   * Convert address to coordinates
   */
  const geocodeAddress = useCallback(async (address: string): Promise<Coordinates | null> => {
    if (!geocoderRef.current) return null;

    try {
      const result = await geocoderRef.current.geocode({ address });
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        return { lat: location.lat(), lng: location.lng() };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }, []);

  /**
   * Convert coordinates to address
   */
  const reverseGeocode = useCallback(async (coords: Coordinates): Promise<string | null> => {
    if (!geocoderRef.current) return null;

    try {
      const result = await geocoderRef.current.geocode({
        location: new google.maps.LatLng(coords.lat, coords.lng),
      });
      if (result.results[0]) {
        return result.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }, []);

  /**
   * Calculate ETA in minutes
   */
  const calculateETA = useCallback(
    async (origin: Coordinates, destination: Coordinates): Promise<number | null> => {
      if (!distanceMatrixRef.current) return null;

      try {
        const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
          distanceMatrixRef.current!.getDistanceMatrix(
            {
              origins: [new google.maps.LatLng(origin.lat, origin.lng)],
              destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (status === 'OK' && response) {
                resolve(response);
              } else {
                reject(new Error(status));
              }
            }
          );
        });

        const element = result.rows[0]?.elements[0];
        if (element?.status === 'OK' && element.duration) {
          return Math.ceil(element.duration.value / 60); // Convert to minutes
        }
        return null;
      } catch (error) {
        console.error('Error calculating ETA:', error);
        return null;
      }
    },
    []
  );

  /**
   * Fit map to show all markers
   */
  const fitBoundsToMarkers = useCallback(
    (markers: Coordinates[]) => {
      if (!map || markers.length === 0) return;

      const bounds = new google.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
      });
      map.fitBounds(bounds, 50); // 50px padding
    },
    [map]
  );

  /**
   * Pan map to specific location
   */
  const panToLocation = useCallback(
    (coords: Coordinates, zoom?: number) => {
      if (!map) return;
      map.panTo(new google.maps.LatLng(coords.lat, coords.lng));
      if (zoom) {
        map.setZoom(zoom);
      }
    },
    [map]
  );

  return {
    isLoaded,
    loadError,
    map,
    setMap,
    calculateRoute,
    getDirections,
    geocodeAddress,
    reverseGeocode,
    calculateETA,
    fitBoundsToMarkers,
    panToLocation,
  };
}

/**
 * Hook for real-time driver tracking
 */
export function useDriverTracking(orderId: string, enabled: boolean = true) {
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !orderId) return;

    let intervalId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchDriverLocation = async () => {
      try {
        const response = await fetch(`/api/delivery/track/${orderId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch driver location');
        }

        const data = await response.json();

        if (data.driver?.currentLocation) {
          setDriverLocation({
            lat: data.driver.currentLocation.lat,
            lng: data.driver.currentLocation.lng,
          });
          setEta(data.eta?.minutes || null);
          setLastUpdated(new Date());
          setIsConnected(true);
          setError(null);
          retryCount = 0;
        }
      } catch (err) {
        retryCount++;
        if (retryCount >= maxRetries) {
          setIsConnected(false);
          setError('Unable to connect to tracking service');
        }
        console.error('Error fetching driver location:', err);
      }
    };

    // Initial fetch
    fetchDriverLocation();

    // Poll every 5 seconds for real-time updates
    intervalId = setInterval(fetchDriverLocation, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, enabled]);

  return {
    driverLocation,
    eta,
    lastUpdated,
    isConnected,
    error,
  };
}

export default useGoogleMaps;
