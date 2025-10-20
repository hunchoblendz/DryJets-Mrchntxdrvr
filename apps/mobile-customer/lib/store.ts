import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Customer,
  Address,
  Order,
  Subscription,
  FavoriteMerchant,
  Notification,
} from '../types';

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: User | null;
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  setCustomer: (customer: Customer) => void;
  setToken: (token: string) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      customer: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setCustomer: (customer) => set({ customer }),
      setToken: (token) => set({ token }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          customer: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ============================================
// ADDRESSES STORE
// ============================================

interface AddressesState {
  addresses: Address[];
  selectedAddressId: string | null;

  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setSelectedAddress: (addressId: string) => void;
  getSelectedAddress: () => Address | undefined;
}

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      setAddresses: (addresses) => set({ addresses }),

      addAddress: (address) =>
        set((state) => ({
          addresses: [...state.addresses, address],
        })),

      updateAddress: (address) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === address.id ? address : a)),
        })),

      deleteAddress: (addressId) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== addressId),
        })),

      setSelectedAddress: (addressId) => set({ selectedAddressId: addressId }),

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return addresses.find((a) => a.id === selectedAddressId);
      },
    }),
    {
      name: 'addresses-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ============================================
// ORDERS STORE
// ============================================

interface OrdersState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;

  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  setActiveOrder: (order: Order | null) => void;
  setIsLoading: (loading: boolean) => void;
  getOrderById: (id: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      activeOrder: null,
      isLoading: false,

      setOrders: (orders) => set({ orders }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrder: (order) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === order.id ? order : o)),
        })),

      setActiveOrder: (order) => set({ activeOrder: order }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      getOrderById: (id) => {
        const { orders } = get();
        return orders.find((o) => o.id === id);
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ============================================
// CART STORE
// ============================================

export interface CartItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  merchantId: string | null;
  merchantLocationId: string | null;
  pickupAddressId: string | null;
  deliveryAddressId: string | null;
  promoCode: string | null;
  fulfillmentMode: string | null;
  scheduledPickupAt: string | null;
  isASAP: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (serviceId: string) => void;
  updateItem: (serviceId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setMerchantId: (id: string | null) => void;
  setMerchantLocationId: (id: string | null) => void;
  setPickupAddressId: (id: string | null) => void;
  setDeliveryAddressId: (id: string | null) => void;
  setPromoCode: (code: string | null) => void;
  setFulfillmentMode: (mode: string | null) => void;
  setScheduledPickupAt: (date: string | null) => void;
  setIsASAP: (asap: boolean) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  merchantId: null,
  merchantLocationId: null,
  pickupAddressId: null,
  deliveryAddressId: null,
  promoCode: null,
  fulfillmentMode: null,
  scheduledPickupAt: null,
  isASAP: true,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.serviceId === item.serviceId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.serviceId === item.serviceId ? { ...i, quantity: i.quantity + item.quantity } : i,
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (serviceId) =>
    set((state) => ({
      items: state.items.filter((i) => i.serviceId !== serviceId),
    })),

  updateItem: (serviceId, updates) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.serviceId === serviceId ? { ...i, ...updates } : i,
      ),
    })),

  clearCart: () =>
    set({
      items: [],
      merchantId: null,
      merchantLocationId: null,
      pickupAddressId: null,
      deliveryAddressId: null,
      promoCode: null,
      fulfillmentMode: null,
      scheduledPickupAt: null,
      isASAP: true,
    }),

  setMerchantId: (id) => set({ merchantId: id }),

  setMerchantLocationId: (id) => set({ merchantLocationId: id }),

  setPickupAddressId: (id) => set({ pickupAddressId: id }),

  setDeliveryAddressId: (id) => set({ deliveryAddressId: id }),

  setPromoCode: (code) => set({ promoCode: code }),

  setFulfillmentMode: (mode) => set({ fulfillmentMode: mode }),

  setScheduledPickupAt: (date) => set({ scheduledPickupAt: date }),

  setIsASAP: (asap) => set({ isASAP: asap }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));

// ============================================
// SUBSCRIPTIONS STORE
// ============================================

interface SubscriptionsState {
  subscriptions: Subscription[];
  isLoading: boolean;

  setSubscriptions: (subscriptions: Subscription[]) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  deleteSubscription: (subscriptionId: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useSubscriptionsStore = create<SubscriptionsState>()(
  persist(
    (set) => ({
      subscriptions: [],
      isLoading: false,

      setSubscriptions: (subscriptions) => set({ subscriptions }),

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, subscription],
        })),

      updateSubscription: (subscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === subscription.id ? subscription : s,
          ),
        })),

      deleteSubscription: (subscriptionId) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== subscriptionId),
        })),

      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'subscriptions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ============================================
// FAVORITES STORE (HOME STORES)
// ============================================

interface FavoritesState {
  favorites: FavoriteMerchant[];
  homeStore: FavoriteMerchant | null;

  setFavorites: (favorites: FavoriteMerchant[]) => void;
  addFavorite: (favorite: FavoriteMerchant) => void;
  removeFavorite: (favoriteId: string) => void;
  setAsHomeStore: (favorite: FavoriteMerchant) => void;
  clearHomeStore: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      homeStore: null,

      setFavorites: (favorites) => set({ favorites }),

      addFavorite: (favorite) =>
        set((state) => ({
          favorites: [...state.favorites, favorite],
        })),

      removeFavorite: (favoriteId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== favoriteId),
        })),

      setAsHomeStore: (favorite) => set({ homeStore: favorite }),

      clearHomeStore: () => set({ homeStore: null }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ============================================
// UI STATE STORE
// ============================================

interface UIState {
  isDarkMode: boolean;
  bottomSheetVisible: boolean;
  bottomSheetContent: string | null;
  filterBottomSheetVisible: boolean;
  filters: Record<string, any>;

  setDarkMode: (dark: boolean) => void;
  showBottomSheet: (content: string) => void;
  hideBottomSheet: () => void;
  showFilterBottomSheet: () => void;
  hideFilterBottomSheet: () => void;
  updateFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      bottomSheetVisible: false,
      bottomSheetContent: null,
      filterBottomSheetVisible: false,
      filters: {},

      setDarkMode: (dark) => set({ isDarkMode: dark }),

      showBottomSheet: (content) => set({ bottomSheetVisible: true, bottomSheetContent: content }),

      hideBottomSheet: () => set({ bottomSheetVisible: false, bottomSheetContent: null }),

      showFilterBottomSheet: () => set({ filterBottomSheetVisible: true }),

      hideFilterBottomSheet: () => set({ filterBottomSheetVisible: false }),

      updateFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () => set({ filters: {} }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ============================================
// NOTIFICATIONS STORE
// ============================================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    })),

  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter((n) => !n.read).length;
  },
}));
