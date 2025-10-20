# DryJets Consumer Marketplace App - Implementation Guide

## Overview

This comprehensive guide covers the end-to-end implementation of the DryJets consumer mobile app - a world-class marketplace connecting consumers with local laundromats, dry cleaners, alterations, and shoe repair shops.

**Status:** Phase 1 Foundation Complete (Weeks 1-2)
**Tech Stack:** React Native + Expo, TypeScript, TanStack Query, Zustand, Stripe
**Target:** iOS & Android via Expo

---

## ✅ What's Already Built (Completed)

### 1. **Design System & Theming**
- **Location:** `apps/mobile-customer/theme/tokens.ts`
- **Features:**
  - Complete color palette (primary, secondary, success, warning, error, grays)
  - Typography system (sizes, weights, families)
  - Spacing scale (xs-xxxl)
  - Border radius presets
  - Shadow definitions for depth
  - Component-specific tokens
  - Service type colors
  - Order status colors

### 2. **Type Definitions**
- **Location:** `apps/mobile-customer/types/index.ts`
- **Comprehensive Types:**
  - User, Customer, Driver, Merchant
  - Orders (with FulfillmentMode enums)
  - Services, Addresses
  - Subscriptions, Favorites, Wardrobe
  - Reviews, Promotions
  - API Response & Paginated Response types

### 3. **API Client Layer**
- **Location:** `apps/mobile-customer/lib/api-client.ts` & `apps/mobile-customer/lib/api.ts`
- **Features:**
  - Axios-based API client with interceptors
  - Secure token storage (expo-secure-store)
  - Request/response interceptors
  - 401 error handling
  - Organized API modules:
    - Auth (phone OTP, social, logout)
    - Customers (profile, addresses)
    - Merchants (search, details, availability)
    - Orders (create, track, confirm)
    - Reviews, Wardrobe, Subscriptions
    - Payments, Notifications, Uploads
    - Promo codes, Favorites

### 4. **State Management (Zustand)**
- **Location:** `apps/mobile-customer/lib/store.ts`
- **Stores:**
  - `useAuthStore` - User authentication & session
  - `useOrdersStore` - Orders CRUD
  - `useCartStore` - Shopping cart with fulfillment modes
  - `useAddressesStore` - Customer addresses
  - `useSubscriptionsStore` - Subscription management
  - `useFavoritesStore` - Favorite merchants (home stores)
  - `useUIStore` - UI state (dark mode, sheets, filters)
  - `useNotificationsStore` - Push notifications

### 5. **Utility Functions**
- **Location:** `apps/mobile-customer/lib/utils.ts`
- **Utilities:**
  - Date/time formatting (date-fns)
  - Currency & pricing calculations
  - Order status helpers (color, label, progress)
  - Fulfillment mode utilities (pricing, discounts)
  - Distance calculations & formatting
  - Phone/email validation
  - Array operations (groupBy, sortBy, unique)
  - Error handling & retry logic

### 6. **UI Component Library**
- **Location:** `apps/mobile-customer/components/ui/`
- **Components:**
  - `Button.tsx` - Multiple variants (primary, secondary, outline, ghost, danger)
  - `Card.tsx` - Elevated, default, outlined variants
  - `Badge.tsx` - Status indicators
  - `TextInput.tsx` - Form inputs with validation
  - `Loading.tsx` - Spinner component
  - `EmptyState.tsx` - No data screens
  - `Divider.tsx` - Visual separator

### 7. **Feature Components**
- **Merchants**
  - `MerchantCard.tsx` - Display merchant with rating, distance, badges
- **Orders**
  - `FulfillmentModeSelector.tsx` - 4-mode selection with pricing
  - `OrderStatusTracker.tsx` - Visual order progress

### 8. **Authentication Screens**
- **Phone Login:** `app/auth/phone-login.tsx`
  - Phone number input
  - OTP request
  - Social login buttons (Google, Apple)

- **Phone OTP:** `app/auth/phone-otp.tsx`
  - OTP verification
  - Resend logic with countdown
  - Error handling

### 9. **Main App Screens**
- **Home Screen** (`app/(tabs)/home.tsx`)
  - Merchant discovery with search
  - Category filters
  - Home store shortcut
  - Real-time merchant listing

- **Orders Screen** (`app/(tabs)/orders.tsx`)
  - Active/Completed tabs
  - Order history
  - Order cards with status
  - Pull-to-refresh

- **Stores Screen** (`app/(tabs)/stores.tsx`)
  - Favorite merchants management
  - Home store indicator
  - Store statistics

- **Profile Screen** (`app/(tabs)/profile.tsx`)
  - User profile display
  - Loyalty points
  - Settings menu
  - Logout

- **Tab Navigation** (`app/(tabs)/_layout.tsx`)
  - Bottom tab bar with 4 main tabs
  - Icons & labels

---

## 🚀 Next Phase: Core Functionality (Weeks 3-4)

### To Implement:

#### 1. **Merchant Detail Screen**
```
/merchants/[id]
├── Merchant banner & logo
├── Services list with pricing
├── Operating hours & location map
├── Reviews & ratings
├── Add to cart flow
└── Favorite button
```

#### 2. **Order Creation Flow**
```
/orders/new
├── Service selection with quantity
├── Special instructions per item
├── Fulfillment mode selector
├── Delivery/pickup address selection
├── Scheduling (ASAP or date/time picker)
├── Promo code application
└── Checkout screen
```

#### 3. **Payment Integration**
```
/checkout
├── Order summary
├── Stripe payment sheet
├── Apply tip
├── Order confirmation
└── Success screen with tracking
```

#### 4. **Order Tracking**
```
/orders/[id]
├── Real-time status tracker
├── Live driver map (Socket.io)
├── Driver contact info
├── ETA countdown
├── Confirm drop-off/pickup buttons
└── Order items breakdown
```

#### 5. **Review & Rating**
```
/orders/[id]/review
├── Star rating
├── Photo uploads
├── Written review
├── Tag selection
└── Merchant response
```

---

## 📁 File Structure

```
apps/mobile-customer/
├── app/
│   ├── auth/
│   │   ├── phone-login.tsx      ✅ DONE
│   │   └── phone-otp.tsx        ✅ DONE
│   ├── (tabs)/
│   │   ├── _layout.tsx          ✅ DONE
│   │   ├── home.tsx             ✅ DONE
│   │   ├── orders.tsx           ✅ DONE
│   │   ├── stores.tsx           ✅ DONE
│   │   └── profile.tsx          ✅ DONE
│   ├── merchants/               🚧 IN PROGRESS
│   ├── orders/                  🚧 IN PROGRESS
│   ├── checkout/                ⏳ PENDING
│   ├── onboarding/              ⏳ PENDING
│   ├── settings/                ⏳ PENDING
│   └── _layout.tsx              ⏳ PENDING
├── components/
│   ├── ui/
│   │   ├── Button.tsx           ✅ DONE
│   │   ├── Card.tsx             ✅ DONE
│   │   ├── Badge.tsx            ✅ DONE
│   │   ├── TextInput.tsx        ✅ DONE
│   │   ├── Loading.tsx          ✅ DONE
│   │   ├── EmptyState.tsx       ✅ DONE
│   │   └── Divider.tsx          ✅ DONE
│   ├── merchants/
│   │   └── MerchantCard.tsx     ✅ DONE
│   ├── orders/
│   │   ├── FulfillmentModeSelector.tsx   ✅ DONE
│   │   └── OrderStatusTracker.tsx        ✅ DONE
│   ├── common/                  ⏳ PENDING
│   └── forms/                   ⏳ PENDING
├── lib/
│   ├── api-client.ts            ✅ DONE
│   ├── api.ts                   ✅ DONE
│   ├── store.ts                 ✅ DONE
│   └── utils.ts                 ✅ DONE
├── theme/
│   └── tokens.ts                ✅ DONE
├── types/
│   └── index.ts                 ✅ DONE
└── package.json
```

---

## 🔄 Data Flow Architecture

### Authentication Flow
```
Phone Input → OTP Request → OTP Verify → JWT Token → Auth Store → App Navigation
                                                    ↓
                                         Secure Storage (expo-secure-store)
```

### Order Creation Flow
```
Search Merchants → Select Merchant → Add Items → Select Mode →
Checkout → Payment → Order Created → Real-time Tracking
```

### Real-time Updates
```
WebSocket (Socket.io) → Order Status Updates → Push Notifications → UI Update
```

---

## 🎨 UI/UX Highlights

### Design Principles
1. **Visual Storytelling** - Animated illustrations for each step
2. **Transparency** - Real-time pricing, service transparency
3. **Flexibility** - 4 fulfillment modes for different needs
4. **Personalization** - Home stores, preferences, history
5. **Trust** - Real driver photos, confirmations, reviews

### Key Screens
1. **Home** - Merchant discovery with intelligent search & filters
2. **Merchant Detail** - Rich merchant profile with services & reviews
3. **Cart/Checkout** - Clear fulfillment mode pricing breakdown
4. **Order Tracking** - Real-time map & status updates
5. **Orders History** - Complete order history with reorder button
6. **Profile** - Loyalty points, subscriptions, preferences

---

## 🔌 Integration Points

### Backend API
- **Base URL:** `http://localhost:3000/api/v1` (configurable via env)
- **Authentication:** JWT Bearer tokens
- **Error Handling:** Axios interceptors for 401, 500, etc.

### Third-Party Services
1. **Stripe** - Payment processing
2. **Google Maps** - Merchant location & routing
3. **Twilio** - Phone verification (backend)
4. **Firebase** - Push notifications
5. **Socket.io** - Real-time order tracking
6. **OpenAI Vision** - Fabric detection (wardrobe)

---

## 📱 Device Compatibility

- **iOS:** 12+
- **Android:** 5.0+
- **Platforms:** iOS & Android via Expo
- **Orientations:** Portrait (primary), Landscape (supported)

---

## 🧪 Testing Strategy

### Unit Tests
- Utility functions (formatting, calculations, validation)
- Store reducers
- API client interceptors

### Integration Tests
- Auth flow (phone OTP, token storage)
- Order creation (cart → checkout)
- Payment processing
- Real-time tracking

### E2E Tests (Critical Flows)
1. Complete order from search → payment
2. All 4 fulfillment mode flows
3. Order tracking updates
4. Review submission

---

## 🚀 Performance Optimization

1. **Code Splitting** - Lazy load screens with Expo Router
2. **Image Optimization** - Cache merchant images
3. **API Caching** - TanStack Query with smart invalidation
4. **Offline Support** - Dexie/AsyncStorage for offline orders
5. **Bundle Size** - Tree-shaking & minification

---

## 🔐 Security Measures

1. **Token Storage** - expo-secure-store (encrypted)
2. **SSL Pinning** - (Optional) Add for production
3. **Input Validation** - All client-side validation
4. **XSS Prevention** - React escapes by default
5. **Environment Secrets** - Never commit API keys

---

## 📊 Analytics Events

Track these events for insights:
- `app_opened`
- `merchant_searched`
- `merchant_viewed`
- `order_created` (with fulfillment mode)
- `payment_processed`
- `order_tracked`
- `review_submitted`
- `subscription_created`

---

## 🛠️ Development Setup

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
Expo CLI installed globally
```

### Installation
```bash
cd apps/mobile-customer
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API URL and service keys
```

### Run App
```bash
npm run dev              # Start Expo server
npm run ios             # iOS simulator
npm run android         # Android emulator
npm run web             # Web preview
```

### Build for Distribution
```bash
npm run build            # Production build
npm run build:web        # Web build
```

---

## 📋 Checklist for Phase 2-3

- [ ] Merchant detail screen with service list
- [ ] Shopping cart with item management
- [ ] Fulfillment mode selector with dynamic pricing
- [ ] Checkout screen with Stripe integration
- [ ] Order confirmation & tracking page
- [ ] Real-time driver location on map
- [ ] Self-service drop-off/pickup confirmation
- [ ] Review & rating submission
- [ ] Order history with reorder functionality
- [ ] Favorite merchants management
- [ ] Subscription creation & management
- [ ] Wardrobe item tracking
- [ ] Push notification setup
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] App store testing & submission

---

## 🎯 Success Metrics

- **User Acquisition:** 10k+ downloads in first month
- **Order Conversion:** 15%+ of searches → orders
- **Order Value:** $25+ average order value
- **Retention:** 30%+ 7-day retention
- **Rating:** 4.5+ stars on app stores
- **Performance:** < 3s load time, < 100MB bundle

---

## 📚 Additional Resources

- [DryJets API Documentation](/api/docs)
- [Design System Guide](/packages/ui/README.md)
- [Backend Architecture](/README.md)
- [Database Schema](/packages/database/prisma/schema.prisma)

---

## 🤝 Support & Contributing

For questions or issues:
1. Check existing GitHub issues
2. Create detailed bug reports
3. Follow conventional commits
4. Test before submitting PRs

---

**Last Updated:** October 2024
**Next Review:** November 2024
**Maintained By:** DryJets Dev Team
