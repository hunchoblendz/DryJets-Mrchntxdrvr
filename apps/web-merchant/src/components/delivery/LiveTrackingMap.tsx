'use client';

/**
 * LiveTrackingMap Component
 *
 * Real-time delivery tracking map for "dummy users"
 * Shows driver location, route, and ETA with simple, clear UI
 */

import * as React from 'react';
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, Circle } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoogleMaps, useDriverTracking, darkMapStyles, defaultMapOptions, Coordinates } from '@/hooks/useGoogleMaps';

// Map container styles
const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '12px',
};

// Default center (can be overridden)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

interface DeliveryLocation {
  address: string;
  coordinates: Coordinates;
  label: string;
}

interface DriverInfo {
  id: string;
  name: string;
  phone?: string;
  photo?: string;
  vehicle?: string;
  rating?: number;
}

interface LiveTrackingMapProps {
  orderId: string;
  pickup: DeliveryLocation;
  dropoff: DeliveryLocation;
  driver?: DriverInfo;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  darkMode?: boolean;
  className?: string;
  onContactDriver?: () => void;
  onRefresh?: () => void;
}

export function LiveTrackingMap({
  orderId,
  pickup,
  dropoff,
  driver,
  status,
  darkMode = false,
  className,
  onContactDriver,
  onRefresh,
}: LiveTrackingMapProps) {
  const { isLoaded, loadError, map, setMap, getDirections, fitBoundsToMarkers } = useGoogleMaps();
  const { driverLocation, eta, lastUpdated, isConnected, error } = useDriverTracking(
    orderId,
    status === 'in_transit' || status === 'picked_up'
  );

  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
  const [selectedMarker, setSelectedMarker] = React.useState<'pickup' | 'dropoff' | 'driver' | null>(null);
  const [mapCenter, setMapCenter] = React.useState(pickup.coordinates || defaultCenter);

  // Fetch directions when driver location changes
  React.useEffect(() => {
    if (!isLoaded || !driverLocation) return;

    const destination = status === 'picked_up' ? pickup.coordinates : dropoff.coordinates;

    getDirections(driverLocation, destination).then((result) => {
      if (result) {
        setDirections(result);
      }
    });
  }, [isLoaded, driverLocation, status, pickup.coordinates, dropoff.coordinates, getDirections]);

  // Fit bounds to show all markers
  React.useEffect(() => {
    if (!map) return;

    const markers: Coordinates[] = [pickup.coordinates, dropoff.coordinates];
    if (driverLocation) {
      markers.push(driverLocation);
    }

    fitBoundsToMarkers(markers);
  }, [map, pickup.coordinates, dropoff.coordinates, driverLocation, fitBoundsToMarkers]);

  // Map options with dark mode support
  const mapOptions = React.useMemo(
    () => ({
      ...defaultMapOptions,
      styles: darkMode ? darkMapStyles : defaultMapOptions.styles,
    }),
    [darkMode]
  );

  // Loading state
  if (!isLoaded) {
    return (
      <div className={cn('flex items-center justify-center bg-background-subtle rounded-xl', className)} style={{ minHeight: '400px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="h-8 w-8 text-primary-500" />
          </motion.div>
          <p className="text-sm text-foreground-secondary">Loading map...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className={cn('flex items-center justify-center bg-background-subtle rounded-xl', className)} style={{ minHeight: '400px' }}>
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <AlertCircle className="h-10 w-10 text-error-500" />
          <p className="text-sm text-foreground-secondary">Unable to load map</p>
          <button
            type="button"
            onClick={onRefresh}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)}>
      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        options={mapOptions}
        onLoad={setMap}
        onUnmount={() => setMap(null)}
      >
        {/* Pickup Marker */}
        <Marker
          position={pickup.coordinates}
          icon={{
            url: '/markers/pickup.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40),
          }}
          onClick={() => setSelectedMarker('pickup')}
        />

        {/* Dropoff Marker */}
        <Marker
          position={dropoff.coordinates}
          icon={{
            url: '/markers/dropoff.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40),
          }}
          onClick={() => setSelectedMarker('dropoff')}
        />

        {/* Driver Marker (animated) */}
        {driverLocation && (
          <>
            <Marker
              position={driverLocation}
              icon={{
                url: '/markers/driver.svg',
                scaledSize: new google.maps.Size(48, 48),
                anchor: new google.maps.Point(24, 24),
              }}
              onClick={() => setSelectedMarker('driver')}
            />
            {/* Driver accuracy circle */}
            <Circle
              center={driverLocation}
              radius={50}
              options={{
                fillColor: '#0A78FF',
                fillOpacity: 0.1,
                strokeColor: '#0A78FF',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#0A78FF',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}

        {/* Info Windows */}
        <AnimatePresence>
          {selectedMarker === 'pickup' && (
            <InfoWindow position={pickup.coordinates} onCloseClick={() => setSelectedMarker(null)}>
              <div className="p-2">
                <p className="font-semibold text-sm">Pickup Location</p>
                <p className="text-xs text-gray-600">{pickup.address}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'dropoff' && (
            <InfoWindow position={dropoff.coordinates} onCloseClick={() => setSelectedMarker(null)}>
              <div className="p-2">
                <p className="font-semibold text-sm">Delivery Location</p>
                <p className="text-xs text-gray-600">{dropoff.address}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'driver' && driverLocation && driver && (
            <InfoWindow position={driverLocation} onCloseClick={() => setSelectedMarker(null)}>
              <div className="p-2">
                <p className="font-semibold text-sm">{driver.name}</p>
                {driver.vehicle && <p className="text-xs text-gray-600">{driver.vehicle}</p>}
                {driver.rating && (
                  <p className="text-xs text-gray-600">★ {driver.rating.toFixed(1)}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </AnimatePresence>
      </GoogleMap>

      {/* Status Bar Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg backdrop-blur-md',
            'bg-white/90 dark:bg-[#1A1A1D]/90',
            'shadow-lg border border-border-subtle dark:border-[#2A2A2D]'
          )}
        >
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusIndicator status={status} />
            <span className="text-sm font-medium text-foreground-DEFAULT dark:text-[#FAFAFA]">
              {getStatusText(status)}
            </span>
          </div>

          {/* ETA */}
          {eta && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-foreground-tertiary" />
              <span className="text-sm font-semibold text-foreground-DEFAULT dark:text-[#FAFAFA]">
                {eta} min
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Driver Card Overlay */}
      {driver && (status === 'in_transit' || status === 'picked_up') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl backdrop-blur-md',
              'bg-white/90 dark:bg-[#1A1A1D]/90',
              'shadow-lg border border-border-subtle dark:border-[#2A2A2D]'
            )}
          >
            {/* Driver Photo */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                {driver.photo ? (
                  <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary-600">
                    {driver.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Connection status dot */}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1A1A1D]',
                  isConnected ? 'bg-success-500' : 'bg-warning-500'
                )}
              />
            </div>

            {/* Driver Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground-DEFAULT dark:text-[#FAFAFA] truncate">
                {driver.name}
              </p>
              {driver.vehicle && (
                <p className="text-xs text-foreground-secondary dark:text-[#A1A1A6] truncate">
                  {driver.vehicle}
                </p>
              )}
              {lastUpdated && (
                <p className="text-xs text-foreground-tertiary dark:text-[#636366]">
                  Updated {formatTimeAgo(lastUpdated)}
                </p>
              )}
            </div>

            {/* Contact Actions */}
            <div className="flex items-center gap-2">
              {driver.phone && (
                <a
                  href={`tel:${driver.phone}`}
                  className={cn(
                    'p-2.5 rounded-lg',
                    'bg-primary-50 dark:bg-primary-900/20',
                    'text-primary-600 dark:text-primary-400',
                    'hover:bg-primary-100 dark:hover:bg-primary-900/30',
                    'transition-colors'
                  )}
                >
                  <Phone className="h-5 w-5" />
                </a>
              )}
              <button
                type="button"
                onClick={onContactDriver}
                className={cn(
                  'p-2.5 rounded-lg',
                  'bg-success-50 dark:bg-success-900/20',
                  'text-success-600 dark:text-success-400',
                  'hover:bg-success-100 dark:hover:bg-success-900/30',
                  'transition-colors'
                )}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 right-4"
        >
          <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
            <AlertCircle className="h-4 w-4 text-error-500" />
            <span className="text-sm text-error-700 dark:text-error-300">{error}</span>
            <button
              type="button"
              onClick={onRefresh}
              className="ml-auto text-sm text-error-600 hover:text-error-700 font-medium"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Status indicator component
function StatusIndicator({ status }: { status: LiveTrackingMapProps['status'] }) {
  const colors = {
    pending: 'bg-gray-400',
    assigned: 'bg-warning-500',
    picked_up: 'bg-primary-500',
    in_transit: 'bg-primary-500 animate-pulse',
    delivered: 'bg-success-500',
  };

  return (
    <div className="relative">
      <div className={cn('w-2.5 h-2.5 rounded-full', colors[status])} />
      {status === 'in_transit' && (
        <div className={cn('absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary-500 animate-ping')} />
      )}
    </div>
  );
}

// Get human-readable status text
function getStatusText(status: LiveTrackingMapProps['status']): string {
  const texts = {
    pending: 'Waiting for driver',
    assigned: 'Driver assigned',
    picked_up: 'Picking up order',
    in_transit: 'On the way',
    delivered: 'Delivered',
  };
  return texts[status];
}

// Format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default LiveTrackingMap;
