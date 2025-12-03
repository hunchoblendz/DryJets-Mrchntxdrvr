import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Stripe webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Forward to NestJS API for processing
    // The backend will verify the signature and process the webhook
    const response = await fetch(`${apiUrl}/api/v1/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stripe webhook processing error:', errorText);
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
