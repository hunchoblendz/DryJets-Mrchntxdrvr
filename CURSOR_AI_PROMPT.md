# Master Cursor AI Development Prompt for DryJets

## Context

You are continuing development on **DryJets**, a comprehensive three-sided marketplace platform for the dry cleaning and laundry industry. The foundation has been laid, and you're now building out the core features.

## Current State

### ✅ What's Complete

1. **Repository Structure** - Turborepo monorepo with 4 apps and shared packages
2. **Database Schema** - Complete Prisma schema with 20+ models (see `packages/database/prisma/schema.prisma`)
3. **Backend Foundation** - NestJS API with authentication working
4. **Frontend Shells** - Next.js merchant portal and React Native apps initialized
5. **Infrastructure** - Docker Compose for local development
6. **Documentation** - README, Getting Started, and Project Summary

### 🚧 What Needs Building (Priority Order)

## Phase 1: Core Order Management (START HERE)

### 1. Orders API Module (High Priority)

**Location**: `apps/api/src/modules/orders/`

**Task**: Build complete order management API

**Requirements**:
```typescript
// Create these files:
- orders.module.ts
- orders.controller.ts
- orders.service.ts
- dto/create-order.dto.ts
- dto/update-order.dto.ts

// Implement endpoints:
POST   /api/v1/orders              # Create new order
GET    /api/v1/orders              # List orders (with filters)
GET    /api/v1/orders/:id          # Get order details
PATCH  /api/v1/orders/:id          # Update order
DELETE /api/v1/orders/:id          # Cancel order
PATCH  /api/v1/orders/:id/status   # Update order status
GET    /api/v1/orders/:id/history  # Get status history
```

**Business Logic**:
- Calculate pricing (subtotal, tax, fees, total)
- Validate merchant services
- Create order items
- Initialize order status as PENDING_PAYMENT
- Support scheduled and on-demand orders
- Generate unique order numbers
- Handle photo uploads for items

**Example Implementation Pattern**:
```typescript
@Post()
async create(@Body() createOrderDto: CreateOrderDto, @User() user) {
  // 1. Validate merchant exists and is active
  // 2. Validate services exist
  // 3. Calculate pricing
  // 4. Create order with items
  // 5. Create initial status history
  // 6. Return order with all relations
}
```

### 2. Merchant Orders Dashboard (High Priority)

**Location**: `apps/web-merchant/src/app/dashboard/`

**Task**: Build merchant order management interface

**Pages to Create**:
```
/dashboard
  /orders                 # Order list with filters
  /orders/[id]            # Order details
  /orders/[id]/edit       # Update order
  /services               # Manage services & pricing
  /settings               # Business settings
```

**Components to Build**:
- OrderList component with filters (status, date range, search)
- OrderCard component showing order summary
- OrderDetails component with timeline
- StatusUpdateButton to change order status
- ServicePricingTable for managing services

**Use**:
- TanStack Query for data fetching
- Zustand for local state
- shadcn/ui components for UI
- react-hook-form for forms

### 3. Customer Order Flow (Mobile)

**Location**: `apps/mobile-customer/app/`

**Task**: Build complete customer ordering experience

**Screens to Create**:
```
/merchants              # Browse nearby merchants
/merchants/[id]         # Merchant details & services
/orders/new             # Create new order
/orders/[id]            # Order tracking
/orders                 # Order history
```

**Flow**:
1. Customer selects merchant
2. Adds items with photos
3. Selects services per item
4. Chooses pickup/delivery addresses
5. Reviews pricing
6. Proceeds to payment
7. Tracks order in real-time

### 4. Payment Integration (Stripe)

**Location**: `apps/api/src/modules/payments/`

**Task**: Implement Stripe Connect for marketplace payments

**Requirements**:
- Merchant onboarding to Stripe Connect
- Create payment intents
- Split payments (merchant payout, platform fee, driver payout)
- Handle refunds
- Webhook handling for payment events

**Endpoints**:
```typescript
POST /api/v1/payments/create-intent
POST /api/v1/payments/confirm
POST /api/v1/payments/refund
POST /api/v1/merchants/connect-stripe
```

### 5. Driver Assignment System

**Location**: `apps/api/src/modules/drivers/`

**Task**: Build driver assignment and management

**Requirements**:
- Find available drivers near pickup location
- Assign driver to order
- Allow driver to accept/decline
- Reassign if declined
- Track driver location
- Calculate driver earnings

**Algorithm**:
```typescript
// Driver assignment priority:
1. Distance to pickup location (nearest first)
2. Driver rating (highest first)
3. Current workload (least busy first)
4. Driver preferences (if any)
```

### 6. Real-Time Tracking

**Location**: `apps/api/src/modules/tracking/`

**Task**: Implement Socket.io for real-time updates

**Events to Emit**:
- `order:status_updated` - Order status changed
- `driver:location_updated` - Driver location changed
- `order:assigned` - Driver assigned to order
- `order:picked_up` - Order picked up
- `order:delivered` - Order delivered

**Client Integration**:
- Connect from mobile apps
- Subscribe to order-specific rooms
- Update UI in real-time

### 7. Notifications System

**Location**: `apps/api/src/modules/notifications/`

**Task**: Implement multi-channel notifications

**Channels**:
- Push notifications (Expo)
- SMS (Twilio)
- Email (SendGrid)

**Events**:
- Order created
- Driver assigned
- Order picked up
- Order ready for delivery
- Order delivered
- Payment processed

## Phase 2: Enhanced Features

### 8. Merchant CRM

Build customer relationship management:
- Customer profiles
- Order history per customer
- Customer preferences
- Loyalty points
- Automated marketing campaigns

### 9. Inventory Management

Build inventory tracking:
- Stock levels for supplies
- Auto-reorder triggers
- Cost tracking
- Supplier management

### 10. Multi-Location Support

For merchant chains:
- Centralized dashboard
- Cross-location analytics
- Load balancing orders
- Unified inventory

### 11. Driver Earnings & Payouts

- Real-time earnings dashboard
- Weekly payout processing
- Tax documentation
- Mileage tracking

## Phase 3: AI Features

### 12. Fabric Detection

- Upload item photo
- AI identifies fabric type
- Suggests cleaning method
- Price estimation

### 13. Demand Forecasting

- Train ML model on historical data
- Predict order volume
- Staffing recommendations
- Inventory optimization

### 14. Route Optimization

- Multi-stop route planning
- Minimize driver travel time
- Maximize orders per hour
- Consider traffic and time windows

### 15. Dynamic Pricing

- Surge pricing during high demand
- Promotional pricing
- Discount codes
- Time-based pricing

## Development Guidelines

### Code Quality Standards

**TypeScript**:
```typescript
// ✅ Good
const order: Order = await this.ordersService.findById(id);

// ❌ Bad
const order: any = await this.ordersService.findById(id);
```

**Error Handling**:
```typescript
// ✅ Good
try {
  const order = await this.ordersService.create(dto);
  return { success: true, data: order };
} catch (error) {
  if (error instanceof BadRequestException) {
    throw error;
  }
  throw new InternalServerErrorException('Failed to create order');
}
```

**API Responses**:
```typescript
// ✅ Good - Consistent response format
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}

// For errors
{
  "success": false,
  "error": {
    "message": "Order not found",
    "code": "ORDER_NOT_FOUND"
  }
}
```

### Testing Requirements

Every feature should have:
1. **Unit tests** for business logic
2. **Integration tests** for API endpoints
3. **E2E tests** for critical flows

```typescript
// Example test structure
describe('OrdersService', () => {
  describe('create', () => {
    it('should create order with correct pricing', async () => {
      // Test implementation
    });

    it('should throw error if merchant not found', async () => {
      // Test implementation
    });
  });
});
```

### Database Queries

Use Prisma efficiently:

```typescript
// ✅ Good - Include relations in one query
const order = await this.prisma.order.findUnique({
  where: { id },
  include: {
    items: true,
    customer: true,
    merchant: true,
  },
});

// ❌ Bad - Multiple queries
const order = await this.prisma.order.findUnique({ where: { id } });
const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
```

### Frontend State Management

```typescript
// Use TanStack Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['orders', orderId],
  queryFn: () => api.orders.getById(orderId),
});

// Use Zustand for UI state
const useOrderStore = create((set) => ({
  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),
}));
```

## Working with This Codebase

### Adding a New API Module

1. Create module directory: `apps/api/src/modules/your-feature/`
2. Create files:
   - `your-feature.module.ts`
   - `your-feature.controller.ts`
   - `your-feature.service.ts`
   - `dto/` directory for DTOs
3. Import module in `app.module.ts`
4. Add Swagger documentation
5. Write tests

### Adding a New Frontend Page

**Next.js (Merchant Portal)**:
1. Create page in `apps/web-merchant/src/app/your-page/page.tsx`
2. Create components in `components/`
3. Use TanStack Query for data fetching
4. Follow existing patterns

**React Native (Mobile Apps)**:
1. Create screen in `app/your-screen/index.tsx`
2. Add to navigation
3. Use Expo Router conventions

### Database Changes

1. Edit `packages/database/prisma/schema.prisma`
2. Run migration: `cd packages/database && npm run db:migrate`
3. Generate client: `npm run db:generate`
4. Update TypeScript types if needed

## Priority Action Items

Start with these in order:

1. ✅ **Orders API** - Complete CRUD operations
2. ✅ **Merchant Dashboard** - Order management UI
3. ✅ **Customer Order Flow** - Mobile ordering
4. ✅ **Payment Integration** - Stripe Connect
5. ✅ **Driver Assignment** - Smart matching
6. ✅ **Real-Time Tracking** - Socket.io
7. ✅ **Notifications** - Multi-channel

## Success Criteria

**MVP is complete when**:
- Customer can place order via mobile app
- Driver gets assigned and can pick up
- Merchant can manage order in portal
- Payment is processed via Stripe
- Order is delivered and marked complete
- All parties get notifications

## Resources

- **Prisma Schema**: `packages/database/prisma/schema.prisma`
- **API Docs**: http://localhost:3000/api/docs (when running)
- **Shared Types**: `packages/types/`
- **Environment Variables**: `.env.example`

## Questions to Ask

When unsure about implementation:

1. **Does this follow the existing patterns?** - Check similar modules
2. **Is this properly typed?** - No `any` types
3. **Does this have tests?** - Aim for 80% coverage
4. **Is this documented?** - Swagger docs for APIs
5. **Does this handle errors?** - Try/catch and proper error types

## Let's Build!

Start with **Orders API** module. Create the complete CRUD operations following NestJS best practices. Use the Prisma schema as your guide for what data needs to be handled.

Good luck! 🚀
