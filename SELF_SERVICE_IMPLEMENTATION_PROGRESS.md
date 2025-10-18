# Customer Self-Service Order Fulfillment - Implementation Progress

## Status: 🚧 In Progress (30% Complete)

### Overview
Implementing flexible order fulfillment options allowing customers to handle pickup/delivery themselves, reducing costs and increasing convenience.

> **Note:** Self-service fulfillment tasks have been integrated into the main [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) across Phases 1.2-1.5, 3.2, and 8.1-8.4. This document tracks progress on the self-service feature specifically.

### Integration in Roadmap
- **Phase 1.2** (Week 1-2): Backend pricing logic & confirmation endpoints
- **Phase 1.3** (Week 2): Merchant availability check
- **Phase 1.4** (Week 3): Customer mobile UI (FulfillmentModeSelector, confirmation screens)
- **Phase 1.5** (Week 3-4): Merchant portal updates (tabs, pickup receipts)
- **Phase 3.2** (Week 8-9): Self-service notification templates
- **Phase 8.1** (Week 25-26): Self-service testing (all 4 fulfillment flows)
- **Phase 8.4** (Week 28): Self-service user documentation

---

## ✅ Completed Tasks

### 1. Database Schema Updates (100%)
**File:** `/packages/database/prisma/schema.prisma`

✅ **Added FulfillmentMode Enum:**
```prisma
enum FulfillmentMode {
  FULL_SERVICE
  CUSTOMER_DROPOFF_PICKUP
  CUSTOMER_DROPOFF_DRIVER_DELIVERY
  DRIVER_PICKUP_CUSTOMER_PICKUP
}
```

✅ **Added New Order Statuses:**
- `AWAITING_CUSTOMER_DROPOFF` - Customer needs to drop off items
- `READY_FOR_CUSTOMER_PICKUP` - Items ready for customer to pick up
- `PICKED_UP_BY_CUSTOMER` - Customer confirmed pickup

✅ **Added Order Model Fields:**
```prisma
fulfillmentMode       FulfillmentMode  @default(FULL_SERVICE)
selfServiceDiscount   Float            @default(0)
customerDropoffTime   DateTime?
customerPickupTime    DateTime?
dropoffConfirmed      Boolean          @default(false)
dropoffConfirmedAt    DateTime?
pickupConfirmed       Boolean          @default(false)
pickupConfirmedAt     DateTime?
confirmationPhotoUrls String[]         @default([])
```

### 2. Backend DTOs Updates (100%)
**File:** `/apps/api/src/modules/orders/dto/order.dto.ts`

✅ **Added FulfillmentMode Enum to DTOs**
✅ **Updated OrderStatus Enum** with new self-service statuses
✅ **Added fulfillmentMode field to CreateOrderDto**
✅ **Created ConfirmDropoffDto:**
```typescript
export class ConfirmDropoffDto {
  notes?: string;
  photoUrls?: string[];
  latitude?: number;
  longitude?: number;
}
```

✅ **Created ConfirmPickupDto:**
```typescript
export class ConfirmPickupDto {
  notes?: string;
  photoUrls?: string[];
  latitude?: number;
  longitude?: number;
}
```

---

## 🚧 In Progress

### 3. Dynamic Pricing Logic (0%)
**File:** `/apps/api/src/modules/orders/orders.service.ts`

**Requirements:**
- Calculate delivery fee based on fulfillment mode:
  - `FULL_SERVICE`: 100% delivery fee (e.g., $5.00)
  - `CUSTOMER_DROPOFF_PICKUP`: $0 delivery fee + 10% discount
  - `CUSTOMER_DROPOFF_DRIVER_DELIVERY`: 50% delivery fee (e.g., $2.50)
  - `DRIVER_PICKUP_CUSTOMER_PICKUP`: 50% delivery fee (e.g., $2.50)

**Method to Update:**
```typescript
async createOrder(createOrderDto: CreateOrderDto) {
  // Add fulfillment mode pricing logic
  const { fulfillmentMode = FulfillmentMode.FULL_SERVICE } = createOrderDto;

  let deliveryFee = 5.0; // Base delivery fee
  let selfServiceDiscount = 0;

  switch (fulfillmentMode) {
    case FulfillmentMode.CUSTOMER_DROPOFF_PICKUP:
      deliveryFee = 0;
      selfServiceDiscount = subtotal * 0.10; // 10% discount
      break;
    case FulfillmentMode.CUSTOMER_DROPOFF_DRIVER_DELIVERY:
    case FulfillmentMode.DRIVER_PICKUP_CUSTOMER_PICKUP:
      deliveryFee = deliveryFee * 0.50; // 50% off
      break;
  }

  // Update totalAmount calculation
  totalAmount = subtotal + serviceFee + deliveryFee + taxAmount - selfServiceDiscount;
}
```

---

## 📋 Remaining Tasks

### 4. Confirmation Endpoints (Backend)
**File:** `/apps/api/src/modules/orders/orders.controller.ts`

**Create Endpoints:**
```typescript
@Post(':id/confirm-dropoff')
async confirmDropoff(
  @Param('id') orderId: string,
  @Body() dto: ConfirmDropoffDto
) {
  // Update order: dropoffConfirmed = true, dropoffConfirmedAt = now()
  // Change status to RECEIVED_BY_MERCHANT
  // Send notification to merchant
  // Return updated order
}

@Post(':id/confirm-pickup')
async confirmPickup(
  @Param('id') orderId: string,
  @Body() dto: ConfirmPickupDto
) {
  // Update order: pickupConfirmed = true, pickupConfirmedAt = now()
  // Change status to PICKED_UP_BY_CUSTOMER
  // Complete order
  // Return updated order
}
```

### 5. Merchant Availability Check
**File:** `/apps/api/src/modules/merchants/merchants.service.ts`

**Create Method:**
```typescript
async checkAvailability(merchantId: string, date: Date): Promise<boolean> {
  const merchant = await this.prisma.merchantLocation.findFirst({
    where: { merchantId }
  });

  // Parse operatingHours JSON
  // Check if merchant is open on given date/time
  // Return boolean
}
```

### 6. Notification Templates
**File:** `/apps/api/src/modules/notifications/notifications.service.ts`

**Add Templates:**
- Self-service order confirmation email
- Drop-off reminder (SMS + Email)
- Ready for pickup notification (SMS + Email + Push)
- Late pickup warning (after 7 days)

### 7. Customer Mobile App - Fulfillment Mode Selector
**Files to Create:**
- `/apps/mobile-customer/components/FulfillmentModeSelector.tsx`
- `/apps/mobile-customer/components/FulfillmentModeCard.tsx`

**UI Design:**
```tsx
<FulfillmentModeSelector
  onSelect={setFulfillmentMode}
  merchantLocation={merchant}
  subtotal={subtotal}
/>

// Shows 4 cards:
// 1. Full Service - $5.00 delivery
// 2. Self Drop-off & Pickup - FREE + 10% off
// 3. Drop-off, We Deliver - $2.50
// 4. We Pick up, You Pick up - $2.50
```

### 8. Order Tracking UI
**File:** `/apps/mobile-customer/screens/OrderTracking.tsx`

**Update for Self-Service:**
- Show merchant address and hours
- Map with merchant location
- "Confirm Drop-off" button (with photo upload)
- "Confirm Pickup" button (with photo upload)
- QR code scanner for merchant confirmation

### 9. Confirmation Screens
**Files to Create:**
- `/apps/mobile-customer/screens/ConfirmDropoff.tsx`
- `/apps/mobile-customer/screens/ConfirmPickup.tsx`

**Features:**
- Camera integration for proof photos
- GPS location capture
- Notes input
- Timestamp display
- Confirmation success animation

### 10. Merchant Portal Updates
**File:** `/apps/web-merchant/pages/orders.tsx`

**Add Tabs:**
- "All Orders"
- "Driver Deliveries" (full service + hybrid)
- "Customer Pickups" (self-service)

**Show:**
- Expected customer arrival times
- Customer contact info
- Print pickup receipt
- Mark as ready for pickup button

---

## 📊 Fulfillment Mode Status Flows

### Mode 1: Full Service
```
PENDING_PAYMENT
  ↓
PAYMENT_CONFIRMED
  ↓
DRIVER_ASSIGNED
  ↓
PICKED_UP (from customer)
  ↓
IN_TRANSIT_TO_MERCHANT
  ↓
RECEIVED_BY_MERCHANT
  ↓
IN_PROCESS
  ↓
READY_FOR_DELIVERY
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

### Mode 2: Customer Drop-off & Pickup
```
PENDING_PAYMENT
  ↓
PAYMENT_CONFIRMED
  ↓
AWAITING_CUSTOMER_DROPOFF
  ↓ (customer confirms drop-off)
RECEIVED_BY_MERCHANT
  ↓
IN_PROCESS
  ↓
READY_FOR_CUSTOMER_PICKUP
  ↓ (customer confirms pickup)
PICKED_UP_BY_CUSTOMER
```

### Mode 3: Customer Drop-off, Driver Delivery
```
PENDING_PAYMENT
  ↓
PAYMENT_CONFIRMED
  ↓
AWAITING_CUSTOMER_DROPOFF
  ↓ (customer confirms drop-off)
RECEIVED_BY_MERCHANT
  ↓
IN_PROCESS
  ↓
READY_FOR_DELIVERY
  ↓
DRIVER_ASSIGNED
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

### Mode 4: Driver Pickup, Customer Pickup
```
PENDING_PAYMENT
  ↓
PAYMENT_CONFIRMED
  ↓
DRIVER_ASSIGNED
  ↓
PICKED_UP (from customer)
  ↓
IN_TRANSIT_TO_MERCHANT
  ↓
RECEIVED_BY_MERCHANT
  ↓
IN_PROCESS
  ↓
READY_FOR_CUSTOMER_PICKUP
  ↓ (customer confirms pickup)
PICKED_UP_BY_CUSTOMER
```

---

## 🔧 Next Steps (Priority Order)

1. **Run Prisma Migration**
   ```bash
   cd packages/database
   npx prisma migrate dev --name add_self_service_fulfillment
   npx prisma generate
   ```

2. **Implement Dynamic Pricing Logic** in `orders.service.ts`
3. **Create Confirmation Endpoints** in `orders.controller.ts`
4. **Add Merchant Availability Check** in `merchants.service.ts`
5. **Update Notification Templates**
6. **Build Mobile UI Components:**
   - Fulfillment Mode Selector
   - Order Tracking (self-service mode)
   - Confirmation Screens
7. **Update Merchant Portal**
8. **Create User Documentation**
9. **Testing:**
   - Unit tests for pricing logic
   - Integration tests for status transitions
   - E2E tests for customer flows
10. **Deploy to Staging**

---

## 📖 API Documentation

### New Endpoints

#### Confirm Drop-off
```http
POST /api/v1/orders/:orderId/confirm-dropoff
Content-Type: application/json

{
  "notes": "Dropped off 3 bags",
  "photoUrls": ["https://..."],
  "latitude": 37.7749,
  "longitude": -122.4194
}

Response:
{
  "order": { ... },
  "message": "Drop-off confirmed successfully"
}
```

#### Confirm Pickup
```http
POST /api/v1/orders/:orderId/confirm-pickup
Content-Type: application/json

{
  "notes": "Picked up all items",
  "photoUrls": ["https://..."],
  "latitude": 37.7749,
  "longitude": -122.4194
}

Response:
{
  "order": { ... },
  "message": "Pickup confirmed successfully"
}
```

#### Check Merchant Availability
```http
GET /api/v1/merchants/:merchantId/availability?date=2024-10-20T14:00:00Z

Response:
{
  "isOpen": true,
  "hours": {
    "open": "08:00",
    "close": "18:00"
  }
}
```

---

## 💰 Pricing Examples

### Order: 3 shirts @ $5 each = $15 subtotal

| Mode | Delivery Fee | Discount | Tax (8.75%) | Total |
|------|-------------|----------|-------------|-------|
| Full Service | $5.00 | $0 | $1.75 | $21.75 |
| Self Drop & Pickup | $0 | -$1.50 (10%) | $1.18 | $14.68 |
| Drop-off, Driver Delivers | $2.50 | $0 | $1.53 | $19.03 |
| Driver Pickup, Self Pickup | $2.50 | $0 | $1.53 | $19.03 |

**Savings:**
- Self-service: **$7.07 (32% off)**
- Hybrid: **$2.72 (12.5% off)**

---

## 🎯 Success Metrics

### Customer Adoption
- % of orders using self-service options
- Average savings per self-service order
- Customer satisfaction ratings by fulfillment mode

### Operational Efficiency
- Driver utilization rate
- Orders per driver per day
- Merchant capacity utilization

### Revenue Impact
- Revenue per order by fulfillment mode
- Platform profit margin by mode
- Total GMV growth

---

## ⚠️ Business Rules to Implement

1. **Self-service only during merchant hours**
2. **Minimum order value:** $10 for driver service, no minimum for self-service
3. **Drop-off confirmation window:** Must confirm within 2 hours of scheduled time
4. **Pickup deadline:** 7 days, after which $5/day late fee applies
5. **Photo upload:** Required for drop-off, optional for pickup
6. **Merchant approval:** Merchants can disable self-service in settings

---

**Document Version:** 1.0
**Last Updated:** October 18, 2025
**Progress:** 30% Complete

---

**Files Modified So Far:**
1. ✅ `/packages/database/prisma/schema.prisma`
2. ✅ `/apps/api/src/modules/orders/dto/order.dto.ts`

**Files Remaining:** 14 files to create/modify
**Estimated Time to Complete:** 4-5 hours
