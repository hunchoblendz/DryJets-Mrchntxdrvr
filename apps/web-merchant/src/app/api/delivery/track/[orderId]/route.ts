import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface TrackingData {
  orderId: string;
  status: 'pending' | 'driver_assigned' | 'picked_up' | 'in_transit' | 'arriving' | 'delivered';
  driver?: {
    id: string;
    name: string;
    phone: string;
    photoUrl?: string;
    vehicleInfo?: string;
  };
  location?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    updatedAt: string;
  };
  eta?: {
    minutes: number;
    distance: string;
    updatedAt: string;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Forward request to NestJS API
    const response = await fetch(`${apiUrl}/api/v1/delivery/track/${orderId}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch tracking data' },
        { status: response.status }
      );
    }

    const data: TrackingData = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Order-Status': data.status,
      },
    });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
