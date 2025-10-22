# Stages 6-13: Implementation Guide for DryJets Unified Web Platform

**Date**: 2025-10-22
**Current Progress**: 40% Complete (5 of 13 stages)
**Status**: Foundation Complete - Ready for Portal Development

---

## Overview

Stages 1-5 have established a production-ready foundation:
- ✅ Architecture & scaffold (Stage 1)
- ✅ Design system with 18 components (Stage 2)
- ✅ Multi-tenant database schema (Stage 3)
- ✅ Backend API with 3 modules, 50+ endpoints (Stage 4)
- ✅ tRPC & NextAuth integration (Stage 5)

This guide provides detailed implementation plans for the remaining 8 stages.

---

## Stage 6: Consumer Marketplace Portal (Estimated: 3 hours)

### Goal
Build a complete consumer-facing portal for individual customers to place and manage dry cleaning orders.

### Components to Build

#### 1. Dashboard Layout (`apps/web-platform/src/app/(consumer)/app/layout.tsx`)

```typescript
import { DashboardNav } from '@/components/layouts/dashboard-nav';
import { UserMenu } from '@/components/layouts/user-menu';

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <DashboardNav />
          <UserMenu />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Navigation Items**:
- Dashboard
- New Order
- Orders
- Addresses
- Account Settings

#### 2. Dashboard Page (`apps/web-platform/src/app/(consumer)/app/dashboard/page.tsx`)

**Features**:
- Welcome message with user name
- Quick stats cards (Active Orders, Completed Orders, Total Spent)
- Recent orders table (last 5 orders)
- Quick action buttons (New Order, View All Orders)

**tRPC Queries**:
```typescript
const { data: orders } = trpc.orders.getMyOrders.useQuery({ limit: 5 });
const { data: stats } = trpc.orders.getStats.useQuery();
```

#### 3. New Order Flow (`apps/web-platform/src/app/(consumer)/app/orders/new/page.tsx`)

**Multi-Step Form**:

**Step 1: Service Selection**
- Dry Cleaning
- Laundry
- Alterations
- Special Care (suits, dresses, curtains)

**Step 2: Item Details**
- Item type dropdown (shirt, pants, dress, suit, etc.)
- Quantity selector
- Special instructions textarea
- Add Item button
- Item list with edit/remove

**Step 3: Pickup & Delivery**
- Address selector (from saved addresses or add new)
- Pickup date picker
- Pickup time slot selector (9-12, 12-3, 3-6, 6-9)
- Delivery preferences (same address or different)
- Delivery date (auto-calculated: pickup + 2 days)

**Step 4: Review & Confirm**
- Order summary
- Estimated price
- Confirm button

**tRPC Mutation**:
```typescript
const createOrder = trpc.orders.createOrder.useMutation({
  onSuccess: () => {
    toast.success('Order placed successfully!');
    router.push('/app/orders');
  },
});
```

#### 4. Orders List (`apps/web-platform/src/app/(consumer)/app/orders/page.tsx`)

**Features**:
- Filterable table (All, Pending, InProgress, Completed, Cancelled)
- Columns: Order #, Date, Status, Items, Total, Actions
- Pagination (20 per page)
- Search by order number
- Status badges with colors

**Actions**:
- View Details button
- Track Order button (for InProgress)
- Cancel Order button (for Pending only)

#### 5. Order Details (`apps/web-platform/src/app/(consumer)/app/orders/[id]/page.tsx`)

**Layout**:
```
┌─────────────────────────────────────┐
│ Order #12345                        │
│ Status: In Progress                 │
│ Placed: Oct 22, 2025                │
└─────────────────────────────────────┘

┌─────────────────┬───────────────────┐
│ Pickup Address  │ Delivery Address  │
│ 123 Main St     │ 123 Main St       │
│ ...             │ ...               │
└─────────────────┴───────────────────┘

┌─────────────────────────────────────┐
│ Items (5)                           │
│ - Men's Dress Shirt x2              │
│ - Pants x2                          │
│ - Suit Jacket x1                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Order Timeline                      │
│ ✓ Order Placed - Oct 22, 9:30 AM   │
│ ✓ Picked Up - Oct 22, 2:15 PM      │
│ → In Process - Current              │
│   Out for Delivery - Pending        │
│   Delivered - Pending               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Pricing                             │
│ Items: $45.00                       │
│ Pickup: $5.00                       │
│ Delivery: $5.00                     │
│ ───────────                         │
│ Total: $55.00                       │
└─────────────────────────────────────┘
```

#### 6. Address Management (`apps/web-platform/src/app/(consumer)/app/addresses/page.tsx`)

**Features**:
- List of saved addresses
- Add New Address button
- Edit/Delete buttons for each
- Set Default button
- Address form modal with validation

**Fields**:
- Label (Home, Work, Other)
- Street Address
- Apt/Suite (optional)
- City
- State (dropdown)
- ZIP Code
- Phone Number

### Design Patterns

**Use Existing Components**:
- Button, Input, Select from design system
- Card for section grouping
- Table for order lists
- Badge for status indicators
- Dialog for modals
- Alert for errors/success

**Colors for Status**:
- Pending: Yellow
- InProgress: Blue
- Completed: Green
- Cancelled: Red

### State Management

**React Query (via tRPC)**:
- Automatic caching
- Optimistic updates on mutations
- Invalidation on success

**Local State**:
- Form state with react-hook-form
- Multi-step wizard state

### Validation

**Use Zod schemas** matching backend DTOs:
```typescript
const orderSchema = z.object({
  serviceType: z.string().min(1),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  pickupDate: z.string(),
  items: z.array(itemSchema).min(1),
});
```

---

## Stage 7: Business Client Portal (Estimated: 2 hours)

### Goal
Build a business portal for corporate clients with team management and recurring orders.

### Components to Build

#### 1. Business Dashboard (`apps/web-platform/src/app/(business)/business/dashboard/page.tsx`)

**Features**:
- Company overview card
- Monthly spend chart
- Active recurring orders
- Recent team activity
- Quick actions (Invite Team, New Recurring Order)

**tRPC Queries**:
```typescript
const { data: account } = trpc.business.getAccount.useQuery();
const { data: stats } = trpc.business.getStats.useQuery({ businessId: account.id });
const { data: team } = trpc.business.getTeamMembers.useQuery({ businessId: account.id });
```

#### 2. Team Management (`apps/web-platform/src/app/(business)/business/team/page.tsx`)

**Features**:
- Team members table (Name, Email, Role, Permissions, Status)
- Invite Team Member button
- Edit/Remove buttons
- Role badges (Admin, Member, Viewer)

**Invite Flow**:
- Email input
- Role selector
- Permissions checkboxes:
  - Can Place Orders
  - Can View Invoices
  - Can Manage Team
  - Can Manage Settings

**tRPC Mutation**:
```typescript
const inviteMember = trpc.business.inviteTeamMember.useMutation({
  onSuccess: () => {
    utils.business.getTeamMembers.invalidate();
    toast.success('Invitation sent!');
  },
});
```

#### 3. Recurring Orders (`apps/web-platform/src/app/(business)/business/recurring/page.tsx`)

**Features**:
- List of recurring orders
- Create New Recurring Order button
- Edit/Pause/Delete actions
- Next scheduled pickup date display

**Create/Edit Form**:
- Frequency selector (Daily, Weekly, Biweekly, Monthly)
- Day of week picker (for Weekly)
- Day of month picker (for Monthly)
- Time slot selector
- Service type
- Special instructions
- Address (from company address or custom)

#### 4. Invoices (`apps/web-platform/src/app/(business)/business/invoices/page.tsx`)

**Features**:
- Monthly invoices table
- Filters (All, Pending, Paid, Overdue)
- Download PDF button
- Pay Now button (for Pending)

**Invoice Details**:
- Invoice number
- Date range
- Line items (each order)
- Total amount
- Payment status
- Payment method (if paid)

#### 5. Settings (`apps/web-platform/src/app/(business)/business/settings/page.tsx`)

**Tabs**:

**Company Info**:
- Company name
- Tax ID
- Industry
- Billing email
- Phone number

**Subscription**:
- Current tier (Basic, Professional, Enterprise)
- Monthly spend limit
- Upgrade/Downgrade buttons

**Preferences**:
- Auto-pay enabled
- Email notifications
- Invoice delivery

---

## Stage 8: Enterprise Multi-Tenant SaaS Layer (Estimated: 2.5 hours)

### Goal
Build enterprise portal for multi-location organizations with centralized management.

### Components to Build

#### 1. Enterprise Dashboard (`apps/web-platform/src/app/(enterprise)/enterprise/dashboard/page.tsx`)

**Features**:
- Organization overview
- Branch performance chart
- API usage graph
- Monthly spend across all branches
- Top performing branches
- Recent API calls log

**tRPC Queries**:
```typescript
const { data: org } = trpc.enterprise.getOrganization.useQuery();
const { data: branches } = trpc.enterprise.getBranches.useQuery({ organizationId: org.id });
const { data: quota } = trpc.enterprise.getQuotaUsage.useQuery({ organizationId: org.id });
const { data: apiLogs } = trpc.enterprise.getApiLogs.useQuery({ organizationId: org.id, limit: 10 });
```

#### 2. Branch Management (`apps/web-platform/src/app/(enterprise)/enterprise/branches/page.tsx`)

**Features**:
- Branch list/grid view
- Add New Branch button
- Branch cards showing:
  - Branch name & code
  - Location
  - Status (Active/Inactive)
  - Recent orders count
  - Monthly revenue
- Edit/Deactivate/Delete actions

**Create Branch Form**:
- Branch name
- Branch code (unique identifier)
- Email
- Phone
- Address (street, city, state, ZIP)
- Settings:
  - Accepts orders toggle
  - Business hours configurator

**tRPC Mutations**:
```typescript
const createBranch = trpc.enterprise.createBranch.useMutation();
const updateBranch = trpc.enterprise.updateBranch.useMutation();
const toggleStatus = trpc.enterprise.toggleBranchStatus.useMutation();
```

#### 3. API Management (`apps/web-platform/src/app/(enterprise)/enterprise/api/page.tsx`)

**Features**:
- API key display (masked: ek_****...****1234)
- Reveal API Key button
- Regenerate API Key button (with confirmation)
- Copy to Clipboard button
- API documentation link
- Monthly quota usage bar
- Remaining API calls

**Usage Stats**:
- Total API calls this month
- Success rate percentage
- Average response time
- Most used endpoints

**API Logs Table**:
- Timestamp
- Method (GET, POST, etc.)
- Endpoint
- Status Code
- Response Time
- IP Address

#### 4. Billing & Invoices (`apps/web-platform/src/app/(enterprise)/enterprise/billing/page.tsx`)

**Features**:
- Subscription plan card (Starter, Growth, Enterprise, Custom)
- Upgrade/Downgrade buttons
- Billing cycle dates
- Payment method
- Invoice history (all branches aggregated)
- Download consolidated invoice

#### 5. Settings (`apps/web-platform/src/app/(enterprise)/enterprise/settings/page.tsx`)

**Tabs**:

**Organization**:
- Organization name
- Tenant ID (read-only)
- Admin email
- Support contact

**Subscription**:
- Current plan
- Monthly quota
- Features included
- Upgrade options

**Security**:
- Two-factor authentication
- IP whitelist
- Webhook configuration
- API rate limits

**Notifications**:
- Email notifications for:
  - API quota approaching limit
  - New branch created
  - Failed API calls
  - Monthly invoice

---

## Stage 9: Real-time & Notifications Integration (Estimated: 1 hour)

### Goal
Integrate existing Socket.io and notification modules from backend.

### Tasks

#### 1. Socket.io Client Setup

**Install Dependencies**:
```bash
npm install socket.io-client
```

**Create Socket Context** (`src/contexts/socket-context.tsx`):
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token: session.user.id },
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

#### 2. Order Tracking Hook

**Create Hook** (`src/hooks/use-order-tracking.ts`):
```typescript
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';

export function useOrderTracking(orderId: string) {
  const socket = useSocket();
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('order:track', { orderId });

    socket.on('order:status-updated', (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status);
      }
    });

    socket.on('driver:location-updated', (data) => {
      if (data.orderId === orderId) {
        setDriverLocation(data.location);
      }
    });

    return () => {
      socket.off('order:status-updated');
      socket.off('driver:location-updated');
    };
  }, [socket, orderId]);

  return { status, driverLocation };
}
```

#### 3. Push Notifications

**Use Browser Notification API**:
```typescript
export function useNotifications() {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/badge.png',
      });
    }
  };

  return { requestPermission, showNotification };
}
```

#### 4. Integration Points

**Order Details Page**:
- Real-time status updates
- Driver location on map (if assigned)

**Dashboard**:
- Toast notification when order status changes
- Badge count for unread notifications

**Business Dashboard**:
- Real-time team activity feed

---

## Stage 10: Payments & Financial Systems (Estimated: 1.5 hours)

### Goal
Integrate Stripe for payments and financial transactions.

### Tasks

#### 1. Stripe Setup

**Install Dependencies**:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Environment Variables**:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### 2. Payment Methods Management

**Create Component** (`src/components/payments/payment-methods.tsx`):
- List saved payment methods
- Add New Card button
- Set Default button
- Remove button

**Stripe Elements Integration**:
```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function AddPaymentMethod() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement!,
    });

    if (!error) {
      // Send paymentMethod.id to backend
      await savePaymentMethod(paymentMethod.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Add Card</button>
    </form>
  );
}
```

#### 3. Checkout Flow

**Consumer Order Checkout**:
- Order summary
- Payment method selector
- Promo code input
- Total with tax calculation
- Pay Now button

**Backend tRPC Procedure**:
```typescript
// Add to orders router
createPaymentIntent: protectedProcedure
  .input(z.object({ orderId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const order = await getOrder(input.orderId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total * 100, // cents
      currency: 'usd',
      customer: ctx.session.user.stripeCustomerId,
      metadata: { orderId: input.orderId },
    });

    return { clientSecret: paymentIntent.client_secret };
  }),
```

#### 4. Invoice Payments (Business)

**Invoice Payment Page**:
- Invoice details
- Amount due
- Payment method selector
- Pay Invoice button

**Auto-Pay Configuration**:
- Enable/disable toggle
- Default payment method selector
- Invoice delivery preferences

#### 5. Subscription Management (Enterprise)

**Stripe Subscriptions**:
- Plan selector (Starter, Growth, Enterprise)
- Monthly/Annual toggle
- Price display
- Subscribe button

**Webhook Handler** (`src/app/api/webhooks/stripe/route.ts`):
```typescript
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook error', { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    case 'customer.subscription.updated':
      // Update subscription status
      break;
  }

  return new Response('Success', { status: 200 });
}
```

---

## Stage 11: Marketing, SEO & Content Infrastructure (Estimated: 2 hours)

### Goal
Build marketing pages with SEO optimization and content management.

### Tasks

#### 1. Homepage Enhancements

**Update** `apps/web-platform/src/app/(marketing)/page.tsx`:

**Add Sections**:
- Hero with CTA
- How It Works (3 steps)
- Services Grid
- Pricing Comparison
- Customer Testimonials
- FAQ Accordion
- Footer with links

**SEO Optimization**:
```typescript
export const metadata: Metadata = {
  title: 'DryJets - Premium Dry Cleaning & Laundry Delivery Service',
  description: 'On-demand dry cleaning and laundry service. Schedule pickup and delivery in minutes. Professional care for your garments.',
  keywords: 'dry cleaning, laundry service, pickup delivery, dry cleaners near me',
  openGraph: {
    title: 'DryJets - On-Demand Dry Cleaning',
    description: 'Premium dry cleaning delivered to your door',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DryJets - On-Demand Dry Cleaning',
    description: 'Premium dry cleaning delivered to your door',
    images: ['/og-image.jpg'],
  },
};
```

#### 2. Pricing Page (`apps/web-platform/src/app/(marketing)/pricing/page.tsx`)

**Sections**:
- Individual pricing (per-item)
- Business pricing (volume discounts)
- Enterprise pricing (custom)
- Comparison table
- FAQ

**Pricing Cards**:
```typescript
const pricingTiers = [
  {
    name: 'Individual',
    price: 'Pay per item',
    features: [
      'Pickup & delivery',
      'Same-day service available',
      'Premium care',
      '24/7 support',
    ],
    cta: 'Get Started',
    href: '/auth/signin',
  },
  {
    name: 'Business',
    price: 'Starting at $199/mo',
    features: [
      'Volume discounts',
      'Team management',
      'Recurring pickups',
      'Monthly invoicing',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    href: '/business/signup',
  },
  {
    name: 'Enterprise',
    price: 'Custom pricing',
    features: [
      'Multi-location support',
      'API access',
      'Custom integration',
      'SLA guarantees',
      'White-label options',
    ],
    cta: 'Request Demo',
    href: '/enterprise/demo',
  },
];
```

#### 3. City Landing Pages

**Dynamic Route** (`apps/web-platform/src/app/(marketing)/cleaners/[city]/page.tsx`):

**URL Structure**: `/cleaners/san-francisco`, `/cleaners/new-york`, etc.

**Content**:
- City-specific hero
- Local service areas map
- Pricing for city
- Local testimonials
- How to schedule in [City]

**SEO**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const city = params.city.replace(/-/g, ' ');
  return {
    title: `Dry Cleaning in ${city} | DryJets`,
    description: `Professional dry cleaning and laundry service in ${city}. Same-day pickup and delivery available.`,
  };
}
```

#### 4. Blog Setup

**Use Contentlayer** for markdown content:

**Install**:
```bash
npm install contentlayer next-contentlayer
```

**Configuration** (`contentlayer.config.ts`):
```typescript
import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.md`,
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    author: { type: 'string', required: true },
    excerpt: { type: 'string', required: true },
    coverImage: { type: 'string', required: true },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace('blog/', ''),
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
});
```

**Blog Index** (`apps/web-platform/src/app/(marketing)/blog/page.tsx`):
- Grid of blog posts
- Pagination
- Search
- Categories filter

**Blog Post** (`apps/web-platform/src/app/(marketing)/blog/[slug]/page.tsx`):
- Post content (markdown rendered)
- Author bio
- Related posts
- Social share buttons

#### 5. Sitemap & robots.txt

**Sitemap** (`apps/web-platform/src/app/sitemap.ts`):
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://dryjets.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://dryjets.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Add all city pages
    // Add all blog posts
  ];
}
```

**Robots.txt** (`apps/web-platform/src/app/robots.ts`):
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/business/', '/enterprise/', '/api/'],
    },
    sitemap: 'https://dryjets.com/sitemap.xml',
  };
}
```

---

## Stage 12: Testing, CI/CD & Deployment (Estimated: 2 hours)

### Goal
Set up automated testing, continuous integration, and deployment pipelines.

### Tasks

#### 1. Unit Tests (Jest + React Testing Library)

**Install**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configuration** (`jest.config.js`):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Example Tests**:

**Component Test** (`src/components/ui/button.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**tRPC Router Test** (`src/server/routers/business.test.ts`):
```typescript
import { appRouter } from './_app';
import { createContextInner } from '../trpc';

describe('Business Router', () => {
  it('returns account for authenticated user', async () => {
    const ctx = await createContextInner({
      session: {
        user: { id: 'user-1', role: 'BUSINESS' },
      },
    });

    const caller = appRouter.createCaller(ctx);
    const account = await caller.business.getAccount();

    expect(account).toBeDefined();
    expect(account.userId).toBe('user-1');
  });
});
```

#### 2. E2E Tests (Playwright)

**Install**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration** (`playwright.config.ts`):
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3001',
  },
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Example E2E Test** (`e2e/auth.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/auth/signin');

  await page.click('text=Continue with Google');

  // Fill Google OAuth (in test environment)
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('text=Sign in');

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/app/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
});

test('user can create order', async ({ page }) => {
  await page.goto('/app/orders/new');

  await page.selectOption('[name=serviceType]', 'dry-cleaning');
  await page.fill('[name=items.0.name]', 'Shirt');
  await page.fill('[name=items.0.quantity]', '2');

  await page.click('text=Next');
  // ... continue through steps

  await page.click('text=Confirm Order');

  await expect(page.locator('text=Order placed successfully')).toBeVisible();
});
```

#### 3. CI/CD with GitHub Actions

**Workflow** (`.github/workflows/ci.yml`):
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test

      - name: E2E tests
        run: npx playwright test

      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Staging)
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Production)
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### 4. Deployment Configuration

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.dryjets.com"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url",
      "NEXTAUTH_SECRET": "@nextauth-secret"
    }
  }
}
```

**Environment Variables** (Vercel Dashboard):
- `DATABASE_URL`: Production Postgres connection
- `NEXTAUTH_SECRET`: Generated secret
- `NEXTAUTH_URL`: https://dryjets.com
- `GOOGLE_CLIENT_ID`: Production OAuth credentials
- `GOOGLE_CLIENT_SECRET`: Production OAuth credentials
- `STRIPE_SECRET_KEY`: Production Stripe key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public Stripe key

#### 5. Database Migrations

**Prisma Migrate in CI**:
```yaml
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Seed Data for Staging**:
```typescript
// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  await prisma.user.createMany({
    data: [
      {
        email: 'customer@example.com',
        name: 'Test Customer',
        role: 'CUSTOMER',
      },
      {
        email: 'business@example.com',
        name: 'Test Business',
        role: 'BUSINESS',
      },
      {
        email: 'enterprise@example.com',
        name: 'Test Enterprise',
        role: 'ENTERPRISE',
      },
    ],
  });

  console.log('Seed data created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### 6. Monitoring & Logging

**Vercel Analytics**:
```typescript
// apps/web-platform/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Error Tracking with Sentry**:
```bash
npm install @sentry/nextjs
```

**Configuration** (`sentry.client.config.ts`):
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## Stage 13: Documentation & Handoff (Estimated: 1 hour)

### Goal
Create comprehensive documentation for developers and stakeholders.

### Deliverables

#### 1. Developer Documentation

**README.md Updates**:
```markdown
# DryJets Unified Web Platform

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- pnpm (recommended) or npm

### Installation
git clone https://github.com/your-org/dryjets.git
cd dryjets
npm install

### Environment Setup
cp apps/web-platform/.env.example apps/web-platform/.env.local
# Fill in environment variables

### Database Setup
cd packages/database
npx prisma migrate dev
npx prisma generate
npx prisma db seed

### Run Development Servers
# Terminal 1: API
cd apps/api
npm run dev  # Port 3000

# Terminal 2: Web Platform
cd apps/web-platform
npm run dev  # Port 3001

### Access
- Web Platform: http://localhost:3001
- API: http://localhost:3000
- API Docs: http://localhost:3000/api

## Architecture

### Monorepo Structure
dryjets/
├── apps/
│   ├── api/                 # NestJS backend
│   ├── web-platform/        # Next.js frontend
│   ├── mobile-customer/     # Expo customer app
│   └── mobile-driver/       # Expo driver app
├── packages/
│   └── database/            # Shared Prisma schema
└── docs/                    # Documentation

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: NestJS, Prisma, PostgreSQL
- **Auth**: NextAuth v5
- **API**: tRPC v11, REST
- **Payments**: Stripe
- **Real-time**: Socket.io
- **Deployment**: Vercel (frontend), Railway/Render (backend)

## Features

### Consumer Portal
- Order placement and tracking
- Address management
- Payment methods
- Order history

### Business Portal
- Team management
- Recurring orders
- Monthly invoicing
- Account settings

### Enterprise Portal
- Multi-location management
- API access
- Branch administration
- Centralized billing

## Development

### Code Style
npm run lint       # ESLint
npm run format     # Prettier

### Type Checking
npm run type-check

### Testing
npm test           # Unit tests
npm run test:e2e   # E2E tests

### Database
npx prisma studio  # Database GUI
npx prisma migrate dev --name migration-name

## Deployment

### Staging
git push origin develop

### Production
git push origin main

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
Proprietary - All Rights Reserved
```

#### 2. API Documentation

**Swagger/OpenAPI** (NestJS already configured):
- Access at `http://localhost:3000/api`
- Automatically generated from controllers
- Interactive API testing

**tRPC Documentation**:
- Type-safe client usage examples
- Router structure
- Procedure types and permissions

#### 3. Deployment Checklist

**PRE-DEPLOYMENT.md**:
```markdown
# Pre-Deployment Checklist

## Environment Variables
- [ ] DATABASE_URL (production Postgres)
- [ ] NEXTAUTH_SECRET (generate new for production)
- [ ] NEXTAUTH_URL (https://dryjets.com)
- [ ] GOOGLE_CLIENT_ID (production credentials)
- [ ] GOOGLE_CLIENT_SECRET
- [ ] STRIPE_SECRET_KEY (production)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] EMAIL_SERVER_* (SendGrid/Postmark)
- [ ] SENTRY_DSN (error tracking)

## Database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify indexes exist
- [ ] Set up automated backups
- [ ] Configure connection pooling

## Security
- [ ] Enable CORS restrictions
- [ ] Configure CSP headers
- [ ] Set up rate limiting
- [ ] Enable HTTPS redirects
- [ ] Verify API key security

## Monitoring
- [ ] Set up Vercel Analytics
- [ ] Configure Sentry error tracking
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

## Third-Party Services
- [ ] Google OAuth app verified
- [ ] Stripe account activated
- [ ] Email provider configured
- [ ] Domain DNS configured

## Testing
- [ ] Run full test suite
- [ ] Manual QA on staging
- [ ] Load testing
- [ ] Security audit

## Post-Deployment
- [ ] Verify all pages load
- [ ] Test authentication flows
- [ ] Test payment processing
- [ ] Monitor error rates
- [ ] Check performance metrics
```

#### 4. User Guides

**For Customers** (`docs/CUSTOMER_GUIDE.md`):
- How to create account
- How to place order
- How to track order
- How to save payment methods
- How to manage addresses

**For Business Clients** (`docs/BUSINESS_GUIDE.md`):
- Setting up business account
- Inviting team members
- Creating recurring orders
- Understanding invoices
- Managing subscriptions

**For Enterprise** (`docs/ENTERPRISE_GUIDE.md`):
- Organization setup
- Branch management
- API integration guide
- Webhook configuration
- Billing and reporting

#### 5. Architecture Decision Records (ADRs)

**Example ADR** (`docs/adr/001-unified-web-platform.md`):
```markdown
# ADR 001: Unified Web Platform Architecture

## Status
Accepted

## Context
We need to build web portals for three distinct user types: consumers, business clients, and enterprise organizations.

## Decision
Build a single Next.js application with route groups instead of separate applications.

## Consequences
### Positive
- Shared components and utilities
- Single deployment pipeline
- Consistent design system
- Easier authentication management
- Better code reuse

### Negative
- Larger bundle size
- Potential coupling between features

## Alternatives Considered
- Three separate Next.js apps
- Monolithic React SPA
- Micro-frontend architecture
```

#### 6. Runbook

**RUNBOOK.md**:
```markdown
# Operational Runbook

## Common Issues

### "Database connection failed"
1. Check DATABASE_URL environment variable
2. Verify database is running
3. Check connection limits
4. Restart application

### "NextAuth session not persisting"
1. Verify NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL matches domain
3. Clear browser cookies
4. Verify JWT token expiration

### "tRPC endpoint not found"
1. Verify API is running (port 3000)
2. Check NEXT_PUBLIC_API_URL
3. Verify CORS configuration
4. Check network tab for errors

## Monitoring

### Key Metrics
- Response time (target: <200ms)
- Error rate (target: <1%)
- API usage (track quota)
- Database connections

### Alerts
- Error rate > 5%
- Response time > 500ms
- Database connections > 80%
- API quota > 90%

## Incident Response

### Severity Levels
- **P0**: Total outage (respond in 15 min)
- **P1**: Major feature broken (respond in 1 hour)
- **P2**: Minor feature broken (respond in 4 hours)
- **P3**: Cosmetic issue (respond in 1 day)

### Escalation
1. On-call engineer
2. Engineering lead
3. CTO

## Maintenance

### Weekly
- Review error logs
- Check performance metrics
- Update dependencies (patch versions)

### Monthly
- Security audit
- Database optimization
- Load testing

### Quarterly
- Dependency upgrades (minor versions)
- Architecture review
- Disaster recovery drill
```

---

## Final Summary

### Current Status
- **Completed Stages**: 1-5 (40%)
- **Foundation**: Production-ready
- **Backend**: 50+ API endpoints
- **Frontend**: Auth, tRPC, design system
- **Database**: Multi-tenant schema

### Remaining Work
- **Stages 6-8**: Portal UIs (estimated 7.5 hours)
- **Stage 9**: Real-time integration (1 hour)
- **Stage 10**: Payments (1.5 hours)
- **Stage 11**: Marketing & SEO (2 hours)
- **Stage 12**: Testing & deployment (2 hours)
- **Stage 13**: Documentation (1 hour)

**Total Remaining**: ~15 hours of focused development

### Recommended Next Steps

1. **Immediate (Week 1)**:
   - Build consumer portal (Stage 6)
   - Set up basic testing (Stage 12)

2. **Short-term (Week 2)**:
   - Build business portal (Stage 7)
   - Integrate payments (Stage 10)

3. **Medium-term (Week 3)**:
   - Build enterprise portal (Stage 8)
   - Real-time features (Stage 9)

4. **Pre-launch (Week 4)**:
   - Marketing pages (Stage 11)
   - Full testing suite (Stage 12)
   - Documentation (Stage 13)
   - Deployment

### Success Criteria

**Technical**:
- ✅ 100% TypeScript coverage
- ✅ Full type safety (tRPC)
- ✅ Multi-tenant security
- ✅ Role-based access control
- ⏳ 80%+ test coverage (pending)
- ⏳ <200ms response time (verify in production)

**Functional**:
- ✅ Authentication with multiple providers
- ✅ Three distinct portals (routes ready)
- ⏳ Payment processing (pending)
- ⏳ Real-time tracking (pending)
- ⏳ Mobile responsiveness (test)

**Business**:
- ⏳ Customer order flow
- ⏳ Business team management
- ⏳ Enterprise API access
- ⏳ Subscription billing

---

**Generated**: 2025-10-22
**Author**: Claude (Principal Software Architect)
**Project**: DryJets Unified Web Platform
**Status**: Ready for Portal Development
