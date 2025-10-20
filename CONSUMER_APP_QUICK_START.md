# DryJets Consumer App - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Setup
```bash
cd apps/mobile-customer
npm install
cp .env.example .env
```

### 2. Configure Environment
Edit `.env`:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

### 3. Start Development Server
```bash
npm run dev              # Starts Expo
# Scan QR code with Expo Go app
```

### 4. Alternative - Emulator
```bash
npm run ios             # iOS Simulator
npm run android         # Android Emulator
npm run web             # Web Browser
```

---

## 📁 Project Structure Quick Reference

```
apps/mobile-customer/
├── app/                    # Screens & routing
│   ├── auth/              # Authentication screens
│   ├── (tabs)/            # Main app screens
│   └── _layout.tsx        # Root layout (configure navigation)
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── merchants/        # Merchant-related components
│   └── orders/           # Order-related components
├── lib/                   # Business logic
│   ├── api.ts            # API calls
│   ├── api-client.ts     # HTTP client
│   ├── store.ts          # State management (Zustand)
│   └── utils.ts          # Helpers & utilities
├── theme/                # Design tokens
│   └── tokens.ts         # Colors, spacing, typography
└── types/                # TypeScript interfaces
    └── index.ts          # All type definitions
```

---

## 🎨 Common Tasks

### Add New Screen
1. Create file in `app/(tabs)/` or `app/sections/`
2. Import components from `components/`
3. Import API from `lib/api`
4. Import store with `const { data } = useStore()`
5. Add navigation in `app/_layout.tsx`

### Add New Component
1. Create file in `components/ui/` or `components/features/`
2. Use design tokens from `theme/tokens.ts`
3. Export as default or named export
4. Document with TypeScript props interface

### Fetch Data
```typescript
import { useQuery } from '@tanstack/react-query';
import { merchantsApi } from '@/lib/api';

const { data, isLoading, error } = useQuery({
  queryKey: ['merchants'],
  queryFn: () => merchantsApi.list()
});
```

### Update State
```typescript
import { useOrdersStore } from '@/lib/store';

const { orders, addOrder, updateOrder } = useOrdersStore();

// Use it
addOrder(newOrder);
```

### Use Design Tokens
```typescript
import { colors, spacing, typography } from '@/theme/tokens';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.primary,
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
```

---

## 🔑 Key APIs

### Authentication
```typescript
// Login with OTP
await authApi.requestPhoneOtp('+1234567890');
await authApi.verifyPhoneOtp('+1234567890', '123456');

// Get session
const session = await authApi.getSession();

// Logout
await authApi.logout();
```

### Merchants
```typescript
// Search merchants
const response = await merchantsApi.list({
  query: 'dry cleaning',
  latitude: 40.7128,
  longitude: -74.0060,
});

// Get merchant details
const merchant = await merchantsApi.getById(merchantId);

// Get services
const services = await merchantsApi.getServices(merchantId);
```

### Orders
```typescript
// Create order
const order = await ordersApi.create({
  customerId: 'cust-123',
  merchantId: 'merch-456',
  fulfillmentMode: 'FULL_SERVICE',
  items: [{ serviceId: 'svc-789', quantity: 2 }],
});

// Get order
const order = await ordersApi.getById(orderId);

// List orders
const orders = await ordersApi.list(customerId);

// Track order
const tracking = await ordersApi.getTracking(orderId);
```

### Cart (Local State)
```typescript
import { useCartStore } from '@/lib/store';

const { items, addItem, removeItem, getSubtotal } = useCartStore();

// Add item
addItem({ serviceId: 'svc-123', quantity: 2, ... });

// Get total
const subtotal = getSubtotal();
```

---

## 🎯 Common Patterns

### Fetch & Display List
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['merchants'],
  queryFn: () => merchantsApi.list(),
});

if (isLoading) return <Loading />;
if (!data?.data.length) return <EmptyState />;

return (
  <FlatList
    data={data.data}
    renderItem={({ item }) => <MerchantCard merchant={item} />}
  />
);
```

### Form with Validation
```typescript
const [value, setValue] = useState('');
const [error, setError] = useState('');

const handleSubmit = () => {
  if (!value) {
    setError('Required');
    return;
  }
  // Submit
};

return (
  <TextInput
    value={value}
    onChangeText={setValue}
    error={error}
  />
);
```

### Loading State
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await api.doSomething();
  } finally {
    setLoading(false);
  }
};

return <Button loading={loading} onPress={handleAction} />;
```

### Navigation
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Push screen
router.push('/merchants/123');

// Go back
router.back();

// Replace (no back)
router.replace('/(tabs)/home');
```

---

## 🐛 Debugging

### Enable Console Logging
```typescript
// In development
if (__DEV__) {
  console.log('Debug info:', data);
}
```

### React Query DevTools (Optional)
```bash
npm install @tanstack/react-query-devtools
```

### Check Store State
```typescript
import { useOrdersStore } from '@/lib/store';

// In component
const store = useOrdersStore();
console.log('Store state:', store);
```

### Inspect API Calls
- Open Expo DevTools
- Network tab shows all API calls
- See request/response payloads

---

## 📝 Common Imports

```typescript
// Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';

// Stores
import { useAuthStore } from '@/lib/store';
import { useOrdersStore } from '@/lib/store';
import { useCartStore } from '@/lib/store';

// API
import { ordersApi, merchantsApi } from '@/lib/api';

// Types
import { Order, Merchant, FulfillmentMode } from '@/types';

// Utils
import { formatCurrency, formatDateTime } from '@/lib/utils';

// Hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

// Design
import { colors, spacing, typography } from '@/theme/tokens';
```

---

## ✅ Pre-Commit Checklist

Before pushing code:
- [ ] No `console.log` statements in production code
- [ ] All TypeScript types are correct
- [ ] Components are responsive (test on different sizes)
- [ ] API calls handle errors
- [ ] No hardcoded values (use constants/config)
- [ ] Comments for complex logic
- [ ] Tests pass (when available)

---

## 🚨 Troubleshooting

### App Won't Load
1. Kill Expo: `Ctrl+C`
2. Clear cache: `npm start --clear`
3. Check `.env` is configured
4. Verify API is running: `curl http://localhost:3000`

### Component Not Displaying
1. Check import path is correct
2. Verify TypeScript types
3. Check styling (especially flexbox)
4. Use React DevTools to inspect

### API Calls Failing
1. Check `.env` API URL is correct
2. Verify backend is running
3. Check network tab in Expo DevTools
4. Look for 401 (auth issue) or 500 (server error)

### State Not Updating
1. Verify store is imported correctly
2. Check component subscribes to store
3. Use `useShallow` for performance if needed
4. Inspect store state in Expo DevTools

---

## 📚 Next Resources

- [Implementation Guide](./CONSUMER_APP_IMPLEMENTATION_GUIDE.md)
- [Features Checklist](./FEATURES_CHECKLIST.md)
- [Design System](./theme/tokens.ts)
- [Type Definitions](./types/index.ts)

---

## 💬 Get Help

1. **Error Message?** Search in codebase for similar code
2. **Feature Question?** Check implementation guide phases
3. **Component Issue?** Look at component examples in screens
4. **API Problem?** Check API module documentation

---

**Happy Coding! 🎉**
