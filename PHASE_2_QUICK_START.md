# Phase 2 Quick Start Guide

**Status:** ✅ Phase 2 Complete - Ready to Configure & Test

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Copy Environment File
```bash
cd apps/mobile-customer
cp .env.example .env
```

### Step 2: Add Your API Keys to `.env`

**Required for Payment Processing:**
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```
👉 Get from: https://dashboard.stripe.com/apikeys

**Required for Maps:**
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```
👉 Get from: https://console.cloud.google.com/

### Step 3: Restart Dev Server
```bash
npm run dev
```

---

## ✨ New Features Available

### 1. Shopping Cart 🛒
**Location:** Tap cart icon in header (any screen)

**What you can do:**
- Add items from merchant detail page
- Adjust quantities
- Add special instructions per item
- See real-time price calculations
- Proceed to checkout

**Try it:**
1. Browse to any merchant
2. Add services to cart
3. Tap cart icon
4. Play with quantities and instructions

---

### 2. Address Management 📍
**Location:** Profile → My Addresses

**What you can do:**
- Add new addresses with map picker
- Edit existing addresses
- Delete addresses
- Set default address
- Search for addresses

**Try it:**
1. Go to Addresses screen
2. Tap "Add New Address"
3. Fill in details
4. Tap "Pick Location on Map"
5. Select location and save

**Note:** Map requires Google Maps API key

---

### 3. Enhanced Merchant Detail 🏪
**Location:** Tap any merchant card

**New features:**
- 🔍 Search services
- 🏷️ Filter by category
- 📊 Sort by price/name/speed
- 🕒 View operating hours
- 🗺️ See location on map
- ⭐ Browse customer reviews

**Try it:**
1. Open any merchant
2. Try searching services
3. Test category filters
4. Check operating hours section
5. View map (if API key configured)

---

### 4. Stripe Payments 💳
**Location:** Checkout → Payment

**Payment methods:**
- Credit/Debit Cards
- Apple Pay (iOS)
- Google Pay (Android)

**Try it (Test Mode):**
1. Add items to cart
2. Complete checkout flow
3. Reach payment screen
4. Select payment method
5. Use test card: `4242 4242 4242 4242`
6. Any future expiry, any CVC

**Note:** Requires Stripe API key and backend endpoint

---

## 🧪 Testing Checklist

### Without API Keys (Everything Still Works!)
- ✅ Browse merchants and services
- ✅ Add to cart and manage quantities
- ✅ View cart summary with pricing
- ✅ Navigate through checkout flow
- ✅ See helpful configuration messages for:
  - Stripe payment setup
  - Google Maps setup

### With Stripe Configured
- ✅ Select payment method (Card/Apple Pay/Google Pay)
- ✅ Complete test payment with test card
- ✅ See payment success/failure messages
- ✅ Verify cart clears after payment
- ✅ Navigate to order confirmation

### With Google Maps Configured
- ✅ Pick address location on map
- ✅ See merchant location
- ✅ Get directions to merchant
- ✅ Search for addresses
- ✅ Use current location button

---

## 🔧 Configuration Details

### Stripe Setup (5 min)
1. Create account at https://stripe.com
2. Go to **Dashboard → API keys**
3. Copy **Publishable key** (starts with `pk_test_`)
4. Paste in `.env` as `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Restart dev server

**Backend Required:**
Your backend needs to implement:
```
POST /api/v1/payments/create-intent
```
Returns: `{ clientSecret, ephemeralKey, customerId }`

See: https://stripe.com/docs/payments/accept-a-payment

### Google Maps Setup (10 min)
1. Go to https://console.cloud.google.com/
2. Create project (or select existing)
3. Enable APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
4. Create **API Key**
5. Paste in `.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
6. Restart dev server

---

## 📱 Navigation Guide

### How to Access New Features:

**Shopping Cart:**
- Header icon (top right) → Shows cart

**Address Management:**
- Profile/Settings → My Addresses
- Checkout → Address Selection → Manage Addresses

**Enhanced Merchant:**
- Home → Tap any merchant
- Merchants tab → Tap any merchant

**Payment:**
- Cart → Proceed to Checkout
- Complete steps: Address → Scheduling → Fulfillment → **Payment**

---

## 🐛 Troubleshooting

### "Payment Not Configured" message
**Solution:** Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env` and restart

### "Map Unavailable" message
**Solution:** Add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env` and restart

### Cart is empty
**Solution:**
1. Navigate to a merchant
2. Add services to cart
3. Cart icon will show item count

### Payment fails
**Check:**
- ✅ Stripe key is correct (starts with `pk_test_`)
- ✅ Backend is running
- ✅ Backend `/payments/create-intent` endpoint works
- ✅ Using test card: 4242 4242 4242 4242

### App won't build
**Try:**
```bash
# Clear cache and reinstall
cd apps/mobile-customer
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Documentation

**Detailed Docs:**
- [PHASE_2_ORDER_FLOW_COMPLETE.md](PHASE_2_ORDER_FLOW_COMPLETE.md) - Full feature documentation
- [SESSION_SUMMARY_PHASE_2.md](SESSION_SUMMARY_PHASE_2.md) - Technical implementation details

**Environment Setup:**
- [.env.example](apps/mobile-customer/.env.example) - All environment variables

---

## 🎯 What's Next?

After testing Phase 2, we can proceed with:

**Phase 3: Order Tracking & Real-time**
- Live order status updates
- Driver tracking on map
- Real-time notifications
- Self-service confirmation flows

**Phase 5: Favorites & Home Stores**
- Favorite merchants
- Set home store
- Quick reorder

**Phase 7: Subscriptions & Loyalty**
- Subscription plans
- Loyalty points
- Rewards redemption

---

## 💡 Pro Tips

1. **Test Without API Keys First**
   - See how graceful fallbacks work
   - All features show helpful setup messages

2. **Use Stripe Test Mode**
   - Never use live keys in development
   - Test cards won't charge real money

3. **Map Picker is Optional**
   - Can manually enter addresses
   - Map enhances UX but isn't required

4. **Backend Integration**
   - Ensure your API is running on `http://localhost:3000`
   - Check `EXPO_PUBLIC_API_URL` in `.env`

---

**Questions?** Check the detailed documentation or review the code comments.

**Ready to test!** 🚀
