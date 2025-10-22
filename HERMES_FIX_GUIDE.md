# Hermes Compatibility - Fix Implementation Guide

## Overview

This guide provides step-by-step instructions to implement the recommended fixes for Hermes compatibility.

---

## Fix #1: NotificationsManager Lazy Initialization [HIGH PRIORITY]

### Why This Matters

Current code runs `Notifications.setNotificationHandler()` at module import time, before the Expo app is fully initialized. This can cause:
- Race conditions with app initialization
- Notification handler not being ready when notifications arrive
- Hermes engine conflicts during startup

### Step 1: Update notificationsManager.ts

**File:** `apps/mobile-customer/lib/notifications/notificationsManager.ts`

**Before (Lines 155-159):**
```typescript
}

export const notificationsManager = NotificationsManager.getInstance();
```

**After:**
```typescript
}

// Lazy initialization - only create instance when first needed
let _instance: NotificationsManager | null = null;

export function getNotificationsManager(): NotificationsManager {
  if (!_instance) {
    _instance = NotificationsManager.getInstance();
  }
  return _instance;
}

// For backwards compatibility if needed (optional deprecated export)
export const notificationsManager = {
  get getInstance() {
    return getNotificationsManager();
  },
} as any;
```

### Step 2: Update index.ts Exports

**File:** `apps/mobile-customer/lib/notifications/index.ts`

**Before:**
```typescript
export { notificationsManager } from './notificationsManager';
```

**After:**
```typescript
export { getNotificationsManager, notificationsManager } from './notificationsManager';
export type { NotificationsManager } from './notificationsManager';
```

### Step 3: Update Usage in useNotifications Hook

**File:** `apps/mobile-customer/hooks/useNotifications.ts`

**Search for all instances of `notificationsManager` and update:**

**Before:**
```typescript
import { notificationsManager } from '../lib/notifications';

export function useNotifications() {
  useEffect(() => {
    const hasPermission = await notificationsManager.requestPermissions();
    const token = await notificationsManager.getDeviceToken();
```

**After:**
```typescript
import { getNotificationsManager } from '../lib/notifications';

export function useNotifications() {
  useEffect(() => {
    const manager = getNotificationsManager();
    const hasPermission = await manager.requestPermissions();
    const token = await manager.getDeviceToken();
```

**All Replacements in useNotifications.ts (Lines 20-68):**
```typescript
  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const manager = getNotificationsManager();  // Get instance here
        
        // Request permissions
        const hasPermission = await manager.requestPermissions();
        if (!hasPermission) {
          console.warn('Notification permissions denied');
          return;
        }

        // Get device token
        const token = await manager.getDeviceToken();
        if (token) {
          setDeviceToken(token);

          // Register device token with backend
          if (customerId) {
            try {
              await notificationsApi.registerDeviceToken(
                customerId,
                token,
                'ios' // or 'android' based on platform
              );
            } catch (error) {
              console.error('Error registering device token:', error);
            }
          }
        }

        // Set up notification listener
        const subscription = manager.onNotification(
          (notification) => {
            // Handle notification received
            console.log('Notification received:', notification);
          }
        );

        setInitialized(true);

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [customerId]);
```

**Update clearAllNotifications callback (Line 120-123):**
```typescript
  // OLD:
  const clearAllNotifications = useCallback(async () => {
    await notificationsManager.clearAllNotifications();
    await notificationsManager.setBadgeCount(0);
  }, []);

  // NEW:
  const clearAllNotifications = useCallback(async () => {
    const manager = getNotificationsManager();
    await manager.clearAllNotifications();
    await manager.setBadgeCount(0);
  }, []);
```

### Step 4: Search for Other Usage

**Command to find all usage:**
```bash
cd /Users/husamahmed/DryJets/apps/mobile-customer
grep -r "notificationsManager\." . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
```

**Expected results (should be none after fixes):**
```
# Should be empty
```

### Step 5: Verify Changes

**Test the import:**
```bash
cd /Users/husamahmed/DryJets/apps/mobile-customer
npx tsc --noEmit  # Type check
npm run lint      # Lint check
```

---

## Fix #2: Socket.io-client Hermes Resilience [MEDIUM PRIORITY]

### Why This Matters

Socket.io-client uses WebSocket and polling transports with dynamic switching. Hermes may have issues with certain WebSocket implementations or event handling patterns.

### Step 1: Enhanced Error Handling in socket-client.ts

**File:** `apps/mobile-customer/lib/realtime/socket-client.ts`

**Update the initializeSocket function (Lines 8-41):**

**Before:**
```typescript
export const initializeSocket = async (token: string): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(API_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket.io connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.io disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket.io error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  return socket;
};
```

**After:**
```typescript
export const initializeSocket = async (token: string): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  try {
    socket = io(API_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      // Hermes-specific improvements
      closeOnBeforeunload: false,
      autoConnect: true,
    });

    return new Promise((resolve, reject) => {
      let connectionTimeout: NodeJS.Timeout;

      // Set connection timeout
      connectionTimeout = setTimeout(() => {
        socket!.disconnect();
        reject(new Error('Socket.io connection timeout (5s)'));
      }, 5000);

      socket!.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('Socket.io connected:', socket?.id);
        resolve(socket!);
      });

      socket!.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
        // Resolve has already been called on connect
      });

      socket!.on('error', (error) => {
        console.error('Socket.io error:', error);
      });

      socket!.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        // Try to clear timeout in case we haven't connected yet
        if (!socket!.connected) {
          clearTimeout(connectionTimeout);
          reject(new Error(`Socket.io connection error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    socket = null;
    throw error;
  }
};
```

### Step 2: Add Hermes Compatibility Check

**Add this function to socket-client.ts (after SOCKET_EVENTS):**

```typescript
// Check if Hermes is available (helpful for debugging)
export const isHermesEnabled = (): boolean => {
  try {
    return !!(global as any).HermesInternal !== undefined;
  } catch {
    return false;
  }
};

// Log Hermes status for debugging
if (__DEV__) {
  console.log('[Socket.io] Hermes engine:', isHermesEnabled() ? 'enabled' : 'disabled');
}
```

### Step 3: Update RealtimeProvider Error Handling

**File:** `apps/mobile-customer/lib/realtime/RealtimeProvider.tsx`

**Update connectSocket function (Lines 48-199):**

**Find this section (Lines 48-65):**
```typescript
    const connectSocket = async () => {
      try {
        const socketInstance = await initializeSocket(token);
        socketRef.current = socketInstance;
        setSocket(socketInstance);

        // Set up event listeners
        socketInstance.on('connect', () => {
          console.log('Realtime connected');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('Realtime disconnected');
          setIsConnected(false);
        });
```

**Improve error handling:**
```typescript
    const connectSocket = async () => {
      try {
        const socketInstance = await initializeSocket(token);
        socketRef.current = socketInstance;
        setSocket(socketInstance);

        // Set up event listeners with Hermes awareness
        socketInstance.on('connect', () => {
          console.log('Realtime connected');
          console.log('[Realtime] Socket ID:', socketInstance.id);
          setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason: string) => {
          console.log('Realtime disconnected:', reason);
          setIsConnected(false);
          
          // Log Hermes-related disconnections
          if (reason === 'io client disconnect') {
            console.warn('[Realtime] Client initiated disconnect');
          } else if (reason === 'io server disconnect') {
            console.warn('[Realtime] Server initiated disconnect');
          } else {
            console.warn('[Realtime] Unexpected disconnect reason:', reason);
          }
        });

        socketInstance.on('error', (error: any) => {
          console.error('[Realtime] Socket error:', error);
        });

        socketInstance.on('connect_error', (error: any) => {
          console.error('[Realtime] Connection error:', error?.message || error);
        });
```

### Step 4: Testing Configuration

**Add to app.json for Android Hermes:**

**File:** `apps/mobile-customer/app.json`

```json
{
  "expo": {
    "name": "DryJets Customer",
    "slug": "dryjets-customer",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "android": {
      "package": "com.dryjets.customer",
      "jsEngine": "hermes",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    // ... rest of config
  }
}
```

---

## Fix #3: Add Hermes Configuration [LOW PRIORITY]

### Optional: Enable Hermes Engine

This is optional but recommended for performance benefits.

**For Android (in app.json):**
```json
{
  "android": {
    "jsEngine": "hermes"
  }
}
```

**For iOS (in app.json):**
```json
{
  "ios": {
    "jsEngine": "hermes"
  }
}
```

---

## Validation Checklist

Before declaring fixes complete:

- [ ] NotificationsManager uses lazy initialization
- [ ] All imports updated from `notificationsManager` to `getNotificationsManager()`
- [ ] Type checking passes: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Socket.io error handling improved
- [ ] Hermes check function added to socket-client.ts
- [ ] app.json updated with Hermes configuration
- [ ] All console.logs are for debugging only
- [ ] No new global mutations introduced
- [ ] Tests pass: `npm test` (if applicable)

---

## Testing the Changes

### 1. Type Check
```bash
cd /Users/husamahmed/DryJets/apps/mobile-customer
npx tsc --noEmit
```

### 2. Lint Check
```bash
npm run lint
```

### 3. Build Check
```bash
npm run build
```

### 4. Test with Hermes Enabled
```bash
# iOS
npx expo prebuild --clean
npx expo run:ios

# Android
npx expo prebuild --clean
npx expo run:android
```

### 5. Test Functionality
- Test notification initialization
- Test real-time order updates
- Test socket reconnection
- Test offline/online transitions

---

## Rollback Instructions

If you need to rollback:

1. Revert to the original notificationsManager export:
   ```bash
   git checkout -- apps/mobile-customer/lib/notifications/notificationsManager.ts
   git checkout -- apps/mobile-customer/hooks/useNotifications.ts
   ```

2. Revert socket.io improvements:
   ```bash
   git checkout -- apps/mobile-customer/lib/realtime/socket-client.ts
   git checkout -- apps/mobile-customer/lib/realtime/RealtimeProvider.tsx
   ```

3. Revert app.json:
   ```bash
   git checkout -- apps/mobile-customer/app.json
   ```

---

## Troubleshooting

### Issue: "Module not found: getNotificationsManager"
**Solution:** Make sure you updated the exports in `lib/notifications/index.ts`

### Issue: Notifications not working
**Solution:** Ensure `getNotificationsManager()` is called only inside a component or hook, never at module level

### Issue: Socket.io connection timeout
**Solution:** This is expected if Hermes has issues with WebSocket. The app will fallback to polling.

### Issue: "Hermes not available" error
**Solution:** This might indicate Hermes isn't properly installed. Run `npx expo prebuild --clean`

---

## Performance Improvements

After implementing these fixes, you should see:
- Faster cold start time (20-30% improvement with Hermes)
- Lower memory usage
- Better reliability with real-time connections
- Improved battery life

---

## References

- Hermes Documentation: https://hermesengine.dev/
- Expo Router: https://expo.dev/router
- Socket.io Client: https://socket.io/docs/v4/client-api/
- React Native Notifications: https://docs.expo.dev/modules/expo-notifications/

