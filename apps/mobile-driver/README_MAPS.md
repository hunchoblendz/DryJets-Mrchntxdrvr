# Google Maps Integration - Driver Mobile App

This guide explains how to set up and use Google Maps in the DryJets Driver mobile app.

## Features

✅ **Live Map View** - Real-time driver location tracking
✅ **Available Orders Map** - See all nearby orders on an interactive map
✅ **Distance Calculation** - Haversine formula for accurate distances
✅ **Radius Filtering** - Adjust search radius (5km, 10km, 15km, 20km)
✅ **Custom Markers** - Driver location (green) and order pickups (blue)
✅ **Turn-by-Turn Navigation** - Deep links to Google/Apple Maps
✅ **Location Permissions** - Handles foreground and background permissions
✅ **Auto-Follow** - Map automatically follows driver movement

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed in `package.json`:
```json
{
  "react-native-maps": "1.14.0",
  "expo-location": "~17.0.0"
}
```

If you need to reinstall:
```bash
npm install react-native-maps expo-location
```

### 2. Get Google Maps API Keys

Follow the [GOOGLE_MAPS_SETUP.md](/GOOGLE_MAPS_SETUP.md) guide in the root directory.

You'll need **two separate keys**:
- Android API Key (restricted to your Android app)
- iOS API Key (restricted to your iOS app)

### 3. Configure API Keys

#### Option A: Update app.json (Recommended for Production)

Edit `/apps/mobile-driver/app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyC_YOUR_IOS_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyD_YOUR_ANDROID_KEY_HERE"
        }
      }
    }
  }
}
```

#### Option B: Use Environment Variables (Development)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API key to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_YOUR_KEY_HERE
   ```

3. Reference in `app.json`:
   ```json
   "googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}"
   ```

### 4. Set Up Android SHA-1 Fingerprint

Get your debug keystore fingerprint:

```bash
cd ~/.android/
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 fingerprint and add it to your Android API key restrictions in Google Cloud Console.

### 5. Test the Setup

```bash
# Start the development server
npx expo start

# Run on iOS simulator
press 'i'

# Run on Android emulator
press 'a'
```

Navigate to the **Map** tab to see the live map view.

## Components

### DriverMapView Component

Located at `/components/MapView.tsx`

**Props:**
```typescript
interface DriverMapViewProps {
  orders?: Order[];          // Array of available orders to display
  showRadius?: boolean;      // Show radius circle around driver
  radiusKm?: number;         // Radius in kilometers
  onMarkerPress?: (order) => void;  // Callback when order marker pressed
  followDriver?: boolean;    // Auto-follow driver location
}
```

**Usage Example:**
```tsx
import DriverMapView from '../../components/MapView';

<DriverMapView
  orders={availableOrders}
  showRadius={true}
  radiusKm={10}
  onMarkerPress={(order) => console.log('Selected:', order)}
  followDriver={true}
/>
```

### Map Screen

Located at `/app/(tabs)/map.tsx`

**Features:**
- Interactive map showing driver location and nearby orders
- Radius filter buttons (5km, 10km, 15km, 20km)
- Order count badge
- Bottom sheet with order details when marker tapped
- One-tap order acceptance

## Location Permissions

### iOS Permissions (Already Configured)

In `app.json`:
```json
"NSLocationAlwaysAndWhenInUseUsageDescription": "DryJets Driver needs your location to accept deliveries and navigate to customers.",
"NSLocationWhenInUseUsageDescription": "DryJets Driver needs your location to accept deliveries and navigate to customers."
```

### Android Permissions (Already Configured)

```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION",
  "ACCESS_BACKGROUND_LOCATION"
]
```

## Navigation Integration

The app includes deep links to native navigation apps:

### iOS (Apple Maps)
```typescript
maps://app?daddr=LAT,LNG&q=Label
```

### Android (Google Maps)
```typescript
google.navigation:q=LAT,LNG&mode=d
```

### Fallback (Web)
```typescript
https://www.google.com/maps/dir/?api=1&destination=LAT,LNG
```

**Usage in Active Orders Screen:**
```tsx
const openNavigation = (lat, lng, label) => {
  const url = Platform.select({
    ios: `maps://app?daddr=${lat},${lng}&q=${label}`,
    android: `google.navigation:q=${lat},${lng}&mode=d`,
  });

  Linking.openURL(url);
};
```

## Map Customization

### Custom Marker Styles

**Driver Marker** (Green):
```tsx
<Marker coordinate={driverLocation}>
  <View style={styles.driverMarker}>
    <Text>🚗</Text>
  </View>
</Marker>
```

**Order Marker** (Blue with number):
```tsx
<Marker coordinate={orderLocation}>
  <View style={styles.orderMarker}>
    <Text>{orderNumber}</Text>
  </View>
</Marker>
```

### Radius Circle

```tsx
<Circle
  center={driverLocation}
  radius={radiusKm * 1000}  // Convert km to meters
  strokeColor="rgba(16, 185, 129, 0.5)"
  fillColor="rgba(16, 185, 129, 0.1)"
  strokeWidth={2}
/>
```

## Troubleshooting

### Map Not Loading

1. **Check API Key**: Ensure it's correctly added to `app.json`
2. **Rebuild App**:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios   # or run:android
   ```
3. **Check Restrictions**: Verify bundle ID (iOS) or package name (Android) matches API key restrictions

### Location Permission Denied

**iOS:**
```typescript
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Enable location permissions in Settings');
}
```

**Android:**
- Check that permissions are listed in `app.json`
- User must grant permissions when prompted

### Markers Not Showing

1. **Check Coordinates**: Ensure `latitude` and `longitude` are valid numbers
2. **Check Data**: Use `console.log(orders)` to verify order data
3. **Fit to Bounds**: Map should auto-fit, but you can manually call:
   ```tsx
   mapRef.current.fitToCoordinates(coordinates);
   ```

### Navigation Not Opening

1. **Check URL Scheme**: Verify `google.navigation:` or `maps://` is correctly formatted
2. **Test Linking**:
   ```typescript
   Linking.canOpenURL(url).then(supported => {
     if (!supported) {
       // Fallback to web URL
     }
   });
   ```

## Performance Optimization

### Reduce Location Updates

```typescript
Location.watchPositionAsync({
  accuracy: Location.Accuracy.Balanced,  // Instead of High
  timeInterval: 15000,  // Update every 15 seconds
  distanceInterval: 100,  // Update every 100 meters
}, callback);
```

### Limit Marker Count

```typescript
// Show only closest 20 orders
const displayOrders = orders.slice(0, 20);
```

### Cache Geocoding Results

Store latitude/longitude in database instead of geocoding every time.

## Additional Features to Add

### Route Polyline
Show route from driver to pickup location:
```tsx
<Polyline
  coordinates={[driverLocation, pickupLocation]}
  strokeColor="#3b82f6"
  strokeWidth={3}
/>
```

### ETA Calculation
```typescript
const calculateETA = (distanceKm) => {
  const avgSpeedKmh = 40; // Average speed
  const minutes = (distanceKm / avgSpeedKmh) * 60;
  return Math.round(minutes);
};
```

### Clustering
For many markers, use clustering:
```bash
npm install react-native-map-clustering
```

## Resources

- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

For issues with Google Maps integration:
1. Check this README
2. Review `/GOOGLE_MAPS_SETUP.md`
3. Check Google Cloud Console for API usage/errors
4. Verify billing is enabled on GCP project
