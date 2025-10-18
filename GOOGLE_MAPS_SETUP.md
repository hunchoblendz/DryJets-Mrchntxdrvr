# Google Maps API Setup Guide for DryJets

This guide will help you set up Google Maps API for all DryJets applications.

## Prerequisites

- Google Cloud Platform account
- Billing enabled on your GCP project

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "DryJets" or similar
4. Click "Create"

## Step 2: Enable Required APIs

Enable the following APIs for your project:

1. Go to **APIs & Services** → **Library**
2. Search for and enable each of these APIs:
   - ✅ **Maps SDK for Android** (for mobile driver app)
   - ✅ **Maps SDK for iOS** (for mobile driver app)
   - ✅ **Maps JavaScript API** (for web apps)
   - ✅ **Geocoding API** (for address lookups)
   - ✅ **Directions API** (for route calculations)
   - ✅ **Distance Matrix API** (for distance calculations)
   - ✅ **Places API** (for address autocomplete)
   - ✅ **Geolocation API** (for location services)

## Step 3: Create API Keys

### For Mobile Apps (Android & iOS)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the key (you'll need it for both iOS and Android)

#### Restrict the Mobile API Key:

4. Click on the newly created key to edit it
5. Under **Application restrictions**, select:
   - For Android: **Android apps**
     - Add package name: `com.dryjets.driver`
     - Add SHA-1 certificate fingerprint (get from your keystore)
   - For iOS: **iOS apps**
     - Add bundle identifier: `com.dryjets.driver`
6. Under **API restrictions**, select **Restrict key**
7. Select these APIs:
   - Maps SDK for Android (for Android key)
   - Maps SDK for iOS (for iOS key)
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Places API
8. Click **Save**

**Best Practice:** Create separate keys for Android and iOS

### For Web Apps (Customer & Merchant Portals)

1. Create another API key: **Create Credentials** → **API Key**
2. Edit the key and add restrictions:

#### Restrict the Web API Key:

3. Under **Application restrictions**, select **HTTP referrers (web sites)**
4. Add these referrers:
   ```
   http://localhost:3001/*
   http://localhost:3002/*
   https://yourdomain.com/*
   https://customer.yourdomain.com/*
   https://merchant.yourdomain.com/*
   ```
5. Under **API restrictions**, select **Restrict key**
6. Select these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Distance Matrix API
7. Click **Save**

## Step 4: Configure the Mobile Driver App

### Update `app.json`:

Replace the placeholder API keys in `/apps/mobile-driver/app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

### Alternative: Use Environment Variables

Create `.env` file in `/apps/mobile-driver/`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Then in `app.json`, use:
```json
"googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}"
```

## Step 5: Configure Web Apps

### Customer Portal (`/apps/web-customer`)

Create `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_WEB_API_KEY_HERE
```

### Merchant Portal (`/apps/web-merchant`)

Create `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_WEB_API_KEY_HERE
```

## Step 6: Get SHA-1 Certificate Fingerprint (Android)

### For Development:

```bash
# Navigate to Android debug keystore
cd ~/.android/

# Get SHA-1 fingerprint
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 fingerprint and add it to your Android API key restrictions in Google Cloud Console.

### For Production:

```bash
# Get SHA-1 from your production keystore
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

## Step 7: Test the Setup

### Test Mobile App:

```bash
cd apps/mobile-driver
npx expo start
```

Press 'i' for iOS simulator or 'a' for Android emulator. The map should load correctly.

### Test Web Apps:

```bash
# Customer portal
cd apps/web-customer
npm run dev

# Merchant portal
cd apps/web-merchant
npm run dev
```

## Troubleshooting

### Maps Not Showing on Android

1. Ensure you've added the correct SHA-1 fingerprint
2. Check the package name matches: `com.dryjets.driver`
3. Rebuild the app: `npx expo run:android`

### Maps Not Showing on iOS

1. Check the bundle identifier matches: `com.dryjets.driver`
2. Rebuild the app: `npx expo run:ios`

### "This page can't load Google Maps correctly"

1. Check your API key restrictions
2. Ensure billing is enabled on your GCP project
3. Check the browser console for specific errors

### API Key Errors

```
Error: Google Maps JavaScript API error: RefererNotAllowedMapError
```
**Fix:** Add your domain to the HTTP referrers in the API key restrictions

```
Error: This API key is not authorized to use this service or API
```
**Fix:** Enable the required API in Google Cloud Console and add it to your API key restrictions

## Cost Optimization

### Free Tier

Google Maps provides $200 free credit per month, which includes:
- 28,000 map loads
- 40,000 Geocoding calls
- 40,000 Directions calls

### Tips to Stay Within Free Tier

1. **Cache Geocoding Results**: Store address coordinates in your database
2. **Optimize Map Loads**: Only load maps when needed
3. **Use Map IDs**: Create Map IDs for static styling instead of dynamic styling
4. **Batch Requests**: Use Geocoding API batching when possible
5. **Set Usage Quotas**: Set daily quotas in GCP to avoid unexpected charges

### Set Budget Alerts

1. Go to **Billing** → **Budgets & alerts**
2. Create a budget alert at $50, $100, $150
3. You'll receive email notifications if costs approach limits

## Security Best Practices

1. ✅ **Always restrict API keys** - Never use unrestricted keys
2. ✅ **Use separate keys** for different platforms (Android, iOS, Web)
3. ✅ **Never commit keys to Git** - Use environment variables
4. ✅ **Rotate keys periodically** - Every 90 days for production
5. ✅ **Monitor usage** - Set up billing alerts
6. ✅ **Use Map IDs** - Better control and security
7. ✅ **Implement rate limiting** - Prevent API abuse

## Environment Variables Summary

### Mobile Driver App
```env
# .env in /apps/mobile-driver/
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Customer Web Portal
```env
# .env.local in /apps/web-customer/
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_web_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Merchant Web Portal
```env
# .env.local in /apps/web-merchant/
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_web_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)

## Quick Start Checklist

- [ ] Create Google Cloud Project
- [ ] Enable all required APIs
- [ ] Create API keys (separate for mobile and web)
- [ ] Restrict API keys properly
- [ ] Add keys to app.json (mobile)
- [ ] Create .env.local files (web apps)
- [ ] Get SHA-1 fingerprint (Android)
- [ ] Test on all platforms
- [ ] Set up billing alerts
- [ ] Document keys in secure location (not Git!)

---

**Note**: Replace all `YOUR_*_API_KEY_HERE` placeholders with your actual API keys before deploying to production.
