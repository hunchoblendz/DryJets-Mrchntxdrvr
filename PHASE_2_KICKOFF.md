# Phase 2 Kickoff - Merchant Detail & Checkout

**Timeline:** Weeks 3-4
**Focus:** Core Order Flow
**Team Size:** 2-3 developers
**Estimated Hours:** 80-100 hours

---

## 🎯 Phase 2 Objectives

Build the complete order creation flow enabling users to:
1. Browse and select merchants
2. Add items to cart
3. Select fulfillment mode
4. Proceed to checkout
5. Process payment

**Result:** End-to-end order placement working

---

## 📋 Feature Breakdown

### Week 3: Merchant Detail & Cart

#### 1. Merchant Detail Screen (`app/merchants/[id].tsx`)

**What to build:**
- Merchant info (banner, logo, name, rating, reviews)
- Services list with prices
- Location with map
- Operating hours
- Reviews carousel

**Files to create:**
```
app/merchants/
├── _layout.tsx
├── [id].tsx
├── [id]/services.tsx (optional sub-screen)
└── [id]/reviews.tsx (optional sub-screen)
```

**Component usage:**
- Use MerchantCard pattern for reference
- Create ServiceCard component
- Create ReviewCard component

**API calls:**
```typescript
const merchant = await merchantsApi.getById(id);
const services = await merchantsApi.getServices(id);
const reviews = await merchantsApi.getReviews(id);
```

**State management:**
- Store selected merchant in useOrdersStore
- Track selected location
- Save merchant for reorder

---

#### 2. Shopping Cart (`app/checkout/cart.tsx`)

**What to build:**
- Display cart items (from useCartStore)
- Item quantity controls (+/-)
- Remove item button
- Subtotal calculation
- Special instructions per item

**Features:**
- Persist cart to storage automatically
- Show empty state
- Estimate delivery time
- Show merchant info

**Component needs:**
- CartItemCard (new)
- QuantitySelector (new)

**State:**
- useCartStore for all cart operations
- Auto-persist to AsyncStorage

---

#### 3. Fulfillment Mode Selector (Enhancement)

**What to enhance:**
- Already built in Phase 1 ✅
- Just need to integrate into flow

**Usage:**
```typescript
import { FulfillmentModeSelector } from '@/components/orders';

<FulfillmentModeSelector
  selectedMode={fulfillmentMode}
  onSelect={setFulfillmentMode}
  subtotal={getSubtotal()}
/>
```

---

### Week 4: Checkout & Payment

#### 4. Checkout Screen (`app/checkout/index.tsx`)

**What to build:**
- Order summary
- Address selection
- Scheduling (ASAP or date/time)
- Promo code input
- Tip selector
- Payment method selection
- Submit button

**Screens:**
```
Checkout Flow:
1. Cart Review
2. Address Selection
3. Scheduling
4. Promo Code
5. Payment Method
6. Order Review
7. Submit
```

**Components needed:**
- AddressSelector (new)
- DateTimePicker (new)
- PromoCodeInput (new)
- TipSelector (new)
- OrderSummary (new)

**API calls:**
```typescript
// Validate promo code
const promo = await promoCodesApi.validate(code, subtotal);

// Check merchant availability
await merchantsApi.checkAvailability(
  merchantId,
  locationId,
  scheduledTime
);
```

---

#### 5. Payment Processing (`app/checkout/payment.tsx`)

**What to build:**
- Stripe payment sheet integration
- Handle payment success/failure
- Show receipt
- Redirect to order tracking

**Implementation:**
```typescript
import { CardField, useStripe } from '@stripe/react-native';

// Create payment intent
const { clientSecret } = await paymentsApi.createPaymentIntent(
  orderId,
  totalAmount
);

// Process payment
const result = await stripe.confirmPayment(clientSecret);
```

**Error handling:**
- Show payment error messages
- Allow retry
- Cancel order option

---

#### 6. Order Confirmation Screen (`app/checkout/confirmation.tsx`)

**What to show:**
- Order number
- Confirmation message
- Order summary
- Merchant contact info
- Estimated completion time
- "Track Order" button
- "Continue Shopping" button

---

## 🛠️ Technical Setup

### New Components to Create

```
components/checkout/
├── CartItemCard.tsx
├── QuantitySelector.tsx
├── AddressSelector.tsx
├── DateTimePicker.tsx
├── PromoCodeInput.tsx
├── TipSelector.tsx
├── OrderSummary.tsx
└── PaymentMethodSelector.tsx
```

### New Screens to Create

```
app/
├── merchants/
│   ├── _layout.tsx
│   └── [id].tsx
├── checkout/
│   ├── _layout.tsx
│   ├── index.tsx (cart review)
│   ├── address.tsx
│   ├── scheduling.tsx
│   ├── promo.tsx
│   ├── payment.tsx
│   └── confirmation.tsx
└── orders/
    ├── [id].tsx (existing)
    └── _layout.tsx
```

### Dependencies Check

```bash
# All needed for Phase 2
npm ls @stripe/react-native          # For payment
npm ls react-native-picker-select    # For date/time
npm ls @react-native-community/geolocation # For location
```

**Install if missing:**
```bash
npm install @stripe/react-native
npm install react-native-picker-select
```

---

## 📊 Testing Strategy

### Unit Tests Needed
- [x] calculateFulfillmentModeFee (already done)
- [ ] calculateTax
- [ ] calculateDiscount
- [ ] validatePromoCode
- [ ] formatOrderSummary

### Integration Tests Needed
- [ ] Cart add/remove items
- [ ] Address selection
- [ ] Payment flow
- [ ] Order creation

### E2E Tests Needed
- [ ] Full order flow: Search → Cart → Checkout → Payment
- [ ] All fulfillment modes
- [ ] Promo code application
- [ ] Multiple payment methods

---

## 🔗 API Integration Checklist

### Merchants API
- [x] getById (get merchant details)
- [x] getServices (get available services)
- [x] getLocations (get pickup/delivery locations)
- [x] getReviews (get customer reviews)
- [x] checkAvailability (verify slots available)

### Orders API
- [x] create (submit order)
- [x] getById (fetch order details)

### Promo Codes API
- [x] validate (check validity and discount)

### Payments API
- [x] createPaymentIntent (get client secret)
- [x] confirmPayment (process payment)

### Addresses API
- [x] list (get customer addresses)
- [x] create (add new address)
- [x] update (modify address)

---

## 🧮 Pricing Calculations

### Formula for Total Price

```typescript
subtotal = sum(item.price * item.quantity)
deliveryFee = calculateFulfillmentModeFee(fulfillmentMode)
discount = calculateFulfillmentModeDiscount(fulfillmentMode) +
           applyPromoCode(promoCode, subtotal)
tax = calculateTax(subtotal - discount)
tip = userSelectedTip

totalAmount = subtotal + deliveryFee + tax + tip - discount
```

### Example Breakdown

```
Dry Cleaning: 2 shirts @ $5 = $10
Laundry: 5 lbs @ $2/lb = $10
Subtotal: $20

Fulfillment: Drop-off & Delivery (+$2.50, no discount)
Promo: "FIRST10" (-$2)

Tax (8%): ($20.50 - $2) * 0.08 = $1.48
Tip (15%): $20.50 * 0.15 = $3.08

TOTAL: $20.50 + $2.50 - $2 + $1.48 + $3.08 = $25.56
```

---

## 🎨 UI Components Template

### CartItemCard

```typescript
<CartItemCard
  item={cartItem}
  onUpdateQuantity={(qty) => updateItem(item.serviceId, qty)}
  onRemove={() => removeItem(item.serviceId)}
/>
```

### AddressSelector

```typescript
<AddressSelector
  addresses={addresses}
  selectedAddressId={selectedAddressId}
  onSelect={setSelectedAddressId}
  onAddNew={() => navigateToAddAddress()}
/>
```

### PaymentMethodSelector

```typescript
<PaymentMethodSelector
  methods={paymentMethods}
  selectedMethodId={selectedMethodId}
  onSelect={setSelectedMethodId}
/>
```

---

## 📱 Key User Flows

### Order Creation Flow

```
Home
  ↓
Select Merchant
  ↓
View Services (Merchant Detail)
  ↓
Add Items to Cart
  ↓
Review Cart
  ↓
Select Fulfillment Mode
  ↓
Select Address
  ↓
Select Scheduling
  ↓
Apply Promo Code
  ↓
Select Payment Method
  ↓
Confirm & Pay
  ↓
Order Confirmation
  ↓
Track Order
```

### State Flow

```
Store
├── useAuthStore (customer ID)
├── useCartStore (items, merchant, mode, promo)
├── useAddressesStore (available addresses)
└── useOrdersStore (created order)
```

---

## 📅 Weekly Breakdown

### Week 3 - Days 1-2: Merchant Detail
- [ ] Create merchant detail screen layout
- [ ] Implement service list
- [ ] Add review carousel
- [ ] Implement location map
- [ ] Add operating hours

### Week 3 - Days 3-4: Shopping Cart
- [ ] Create cart display
- [ ] Implement quantity controls
- [ ] Add item removal
- [ ] Show subtotal
- [ ] Persist cart state

### Week 3 - Days 5: Integration
- [ ] Wire up navigation from home → merchant
- [ ] Connect cart to useCartStore
- [ ] Test cart persistence
- [ ] Add empty states

### Week 4 - Days 1-2: Checkout Flow
- [ ] Create address selector
- [ ] Implement date/time picker
- [ ] Build promo code input
- [ ] Add tip selector
- [ ] Create order summary

### Week 4 - Days 3-4: Payment Integration
- [ ] Set up Stripe SDK
- [ ] Create payment sheet UI
- [ ] Implement payment processing
- [ ] Add error handling
- [ ] Create confirmation screen

### Week 4 - Day 5: Testing & Polish
- [ ] End-to-end testing
- [ ] Error edge cases
- [ ] Performance optimization
- [ ] UI polish
- [ ] Documentation

---

## 🚨 Potential Challenges

### 1. Address Validation
**Problem:** User enters invalid address
**Solution:** Use Google Maps API for validation

### 2. Scheduling Validation
**Problem:** User selects closed time
**Solution:** Already handled with `checkAvailability` API

### 3. Payment Failures
**Problem:** Card declined, network error
**Solution:** Retry logic with user messaging

### 4. Merchant Availability
**Problem:** Items out of stock during checkout
**Solution:** Validate in cart before submission

### 5. Promo Code Edge Cases
**Problem:** Code expired, max usage reached
**Solution:** Validate on apply, show clear errors

---

## ✅ Definition of Done

Phase 2 is complete when:
- [x] All merchant details screen working
- [x] Shopping cart fully functional
- [x] Fulfillment mode selection working
- [x] Checkout flow complete
- [x] Payment integration working
- [x] Order confirmation showing
- [x] All screens responsive
- [x] TypeScript compiling clean
- [x] No console errors
- [x] All tests passing

---

## 🚀 Post-Phase 2

Once Phase 2 is complete:
1. Start Phase 3 (Order Tracking)
2. Implement real-time order updates
3. Add driver location tracking
4. Build order tracking map

---

## 📚 Resources

### Files to Reference
- [API Types](./types/index.ts)
- [API Client](./lib/api.ts)
- [Design Tokens](./theme/tokens.ts)
- [Utilities](./lib/utils.ts)
- [State Store](./lib/store.ts)

### Existing Components
- Button (ui/Button.tsx)
- Card (ui/Card.tsx)
- TextInput (ui/TextInput.tsx)
- Loading (ui/Loading.tsx)
- EmptyState (ui/EmptyState.tsx)

---

## 👥 Team Communication

### Daily Standup Topics
1. What did you build?
2. Any blockers?
3. Next task priority

### PR Review Checklist
- [ ] TypeScript strict mode passes
- [ ] No console.logs in prod code
- [ ] Component properly typed
- [ ] Follows naming conventions
- [ ] Tested with real data

---

## 🎯 Success Metrics

By end of Phase 2:
- ✅ Users can place full orders
- ✅ Payment processing works
- ✅ Confirmation shows correctly
- ✅ Zero critical bugs
- ✅ Responsive on all devices
- ✅ TypeScript score 100%

---

**Ready to start Phase 2?** 🚀

All critical systems are in place. Begin with Merchant Detail screen.

**Questions?** Check the files:
- Quick Start: `CONSUMER_APP_QUICK_START.md`
- Implementation Guide: `CONSUMER_APP_IMPLEMENTATION_GUIDE.md`
- QA Report: `PHASE_1_QA_REPORT.md`
