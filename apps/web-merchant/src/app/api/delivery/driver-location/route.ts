import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface DriverLocationUpdate {
  driverId: string;
  orderId: string;
  location: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
  };
  timestamp: string;
}

interface DriverLocationResponse {
  success: boolean;
  driverId: string;
  orderId: string;
  location: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
  };
  eta?: {
    minutes: number;
    updatedAt: string;
  };
}

// POST - Update driver location (called from mobile app)
export async function POST(request: NextRequest) {
  try {
    const body: DriverLocationUpdate = await request.json();
    const { driverId, orderId, location, timestamp } = body;

    if (!driverId || !orderId || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: 'driverId, orderId, and location are required' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Forward to NestJS API for processing and broadcasting
    const response = await fetch(`${apiUrl}/api/v1/delivery/driver-location`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driverId,
        orderId,
        location,
        timestamp: timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update driver location' },
        { status: response.status }
      );
    }

    const data: DriverLocationResponse = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Driver location update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get current driver location for an order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const driverId = searchParams.get('driverId');

    if (!orderId && !driverId) {
      return NextResponse.json(
        { error: 'orderId or driverId is required' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams();
    if (orderId) queryParams.set('orderId', orderId);
    if (driverId) queryParams.set('driverId', driverId);

    const response = await fetch(
      `${apiUrl}/api/v1/delivery/driver-location?${queryParams}`,
      {
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch driver location' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Driver location fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
