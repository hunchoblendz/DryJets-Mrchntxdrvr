import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface ETARequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  orderId?: string;
}

interface ETAResponse {
  minutes: number;
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
  trafficCondition: 'light' | 'moderate' | 'heavy';
  calculatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ETARequest = await request.json();
    const { origin, destination, orderId } = body;

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return NextResponse.json(
        { error: 'Origin and destination coordinates are required' },
        { status: 400 }
      );
    }

    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsKey) {
      // Fallback to estimated calculation without Google Maps
      const distanceKm = calculateHaversineDistance(origin, destination);
      const estimatedMinutes = Math.ceil(distanceKm * 3); // ~20km/h average urban speed

      return NextResponse.json({
        minutes: estimatedMinutes,
        distance: {
          value: Math.round(distanceKm * 1000),
          text: `${distanceKm.toFixed(1)} km`,
        },
        duration: {
          value: estimatedMinutes * 60,
          text: `${estimatedMinutes} mins`,
        },
        trafficCondition: 'moderate',
        calculatedAt: new Date().toISOString(),
        estimated: true,
      } as ETAResponse & { estimated: boolean });
    }

    // Use Google Maps Distance Matrix API
    const googleMapsUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    googleMapsUrl.searchParams.set('origins', `${origin.lat},${origin.lng}`);
    googleMapsUrl.searchParams.set('destinations', `${destination.lat},${destination.lng}`);
    googleMapsUrl.searchParams.set('mode', 'driving');
    googleMapsUrl.searchParams.set('departure_time', 'now');
    googleMapsUrl.searchParams.set('traffic_model', 'best_guess');
    googleMapsUrl.searchParams.set('key', googleMapsKey);

    const response = await fetch(googleMapsUrl.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      throw new Error('Google Maps API error');
    }

    const element = data.rows[0].elements[0];
    const durationInTraffic = element.duration_in_traffic || element.duration;
    const minutes = Math.ceil(durationInTraffic.value / 60);

    // Determine traffic condition
    let trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate';
    if (element.duration_in_traffic && element.duration) {
      const ratio = element.duration_in_traffic.value / element.duration.value;
      if (ratio < 1.1) trafficCondition = 'light';
      else if (ratio > 1.4) trafficCondition = 'heavy';
    }

    // Add buffer time for pickup/dropoff (5 minutes)
    const totalMinutes = minutes + 5;

    return NextResponse.json({
      minutes: totalMinutes,
      distance: element.distance,
      duration: durationInTraffic,
      trafficCondition,
      calculatedAt: new Date().toISOString(),
    } as ETAResponse);
  } catch (error) {
    console.error('ETA calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ETA' },
      { status: 500 }
    );
  }
}

// Haversine formula for distance calculation
function calculateHaversineDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) *
      Math.cos(toRad(destination.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
