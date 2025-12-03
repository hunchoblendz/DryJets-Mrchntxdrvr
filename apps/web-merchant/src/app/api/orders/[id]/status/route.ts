import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// GET - Get order status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/api/v1/orders/${id}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: response.status }
      );
    }

    const order = await response.json();

    // Return simplified status response
    return NextResponse.json({
      orderId: order.id,
      shortCode: order.shortCode,
      status: order.status,
      statusHistory: order.statusHistory,
      driver: order.driver ? {
        id: order.driver.id,
        name: `${order.driver.user?.firstName} ${order.driver.user?.lastName}`,
        phone: order.driver.user?.phone,
      } : null,
      estimatedDelivery: order.estimatedDelivery,
      updatedAt: order.updatedAt,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const body = await request.json();

    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiUrl}/api/v1/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to update order status' },
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
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
