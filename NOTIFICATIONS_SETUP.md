# Notifications Setup Guide

This guide covers setting up multi-channel notifications (Email, SMS, Push) for the DryJets platform.

## Overview

The platform supports 4 notification channels:
- **Email** (SendGrid)
- **SMS** (Twilio)
- **Push Notifications** (Firebase Cloud Messaging)
- **In-App** (Real-time via Socket.io)

---

## 1. SendGrid Email Setup

### Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### Generate API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it `DryJets Production`
4. Choose **Full Access** permission
5. Copy the API key (you'll only see it once!)

### Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (for testing) or **Domain Authentication** (for production)
3. For Single Sender:
   - Add your email address
   - Verify it via the email you receive
4. For Domain (production):
   - Add your domain (e.g., `dryjets.com`)
   - Add the DNS records to your domain provider
   - Wait for verification (can take 24-48 hours)

### Environment Variables
```env
# Backend .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@dryjets.com
```

---

## 2. Twilio SMS Setup

### Create Twilio Account
1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for a free trial account ($15 credit)
3. Verify your phone number

### Get Phone Number
1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose your country
3. Select a number with **SMS** capability
4. Purchase the number (uses trial credit or real money)

### Get Credentials
1. Go to **Dashboard**
2. Find your **Account SID** and **Auth Token**
3. Copy both values

### Important Notes
- **Trial Account:** Can only send SMS to verified phone numbers
- **Production:** Need to upgrade account and complete registration
- **Costs:** ~$0.0075 per SMS in the US (varies by country)

### Environment Variables
```env
# Backend .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 3. Firebase Cloud Messaging (FCM) Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Name it `DryJets`
4. Disable Google Analytics (optional)
5. Create project

### Add Apps to Firebase

#### Android App
1. Click **Add app** → **Android**
2. Android package name: `com.dryjets.driver` (or your package name)
3. Download `google-services.json`
4. Place in `/apps/mobile-driver/android/app/`

#### iOS App
1. Click **Add app** → **iOS**
2. iOS bundle ID: `com.dryjets.driver` (or your bundle ID)
3. Download `GoogleService-Info.plist`
4. Place in `/apps/mobile-driver/ios/DryJetsDriver/`

### Generate Service Account Key
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. **IMPORTANT:** Keep this file secure! Never commit to git!

### Environment Variables
```env
# Backend .env
# Paste the entire JSON content as a single line (or use base64)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"dryjets",...}'
```

Alternative (recommended for production):
```env
# Store as base64
FIREBASE_SERVICE_ACCOUNT_BASE64=ewogICJ0eXBlIjogInNlcn...
```

Then decode in code:
```typescript
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
);
```

---

## 4. Mobile App Push Notifications Setup

### Install Dependencies

```bash
cd apps/mobile-driver
npx expo install expo-notifications expo-device expo-constants
```

### Configure app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#10b981",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "POST_NOTIFICATIONS"
      ]
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#10b981",
      "androidMode": "default",
      "androidCollapsedTitle": "DryJets"
    }
  }
}
```

### Android Setup (React Native)

1. **Add Firebase SDK** to `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.1.0'
}
```

2. **Add plugin** to `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

3. **Create notification channel** in `MainActivity.java`:
```java
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        "dryjets_notifications",
        "DryJets Notifications",
        NotificationManager.IMPORTANCE_HIGH
      );
      channel.setDescription("Order and delivery notifications");

      NotificationManager manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(channel);
    }
  }
}
```

### iOS Setup (React Native)

1. **Enable Push Notifications** in Xcode:
   - Open `ios/DryJetsDriver.xcworkspace`
   - Select target → **Signing & Capabilities**
   - Click **+ Capability** → **Push Notifications**

2. **Add to Info.plist**:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

---

## 5. Testing Notifications

### Email Testing
```bash
curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "userType": "customer",
    "type": "ORDER_CREATED",
    "channels": ["EMAIL"],
    "title": "Test Order",
    "message": "Your order has been created",
    "data": {
      "orderNumber": "ORD-12345",
      "totalAmount": 50.00
    }
  }'
```

### SMS Testing
```bash
curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "userType": "driver",
    "type": "DRIVER_ASSIGNED",
    "channels": ["SMS"],
    "title": "New Pickup",
    "message": "You have been assigned to order ORD-12345"
  }'
```

### Push Notification Testing
```bash
curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "userType": "driver",
    "type": "ORDER_DELIVERED",
    "channels": ["PUSH"],
    "title": "Order Delivered",
    "message": "Great job! Order ORD-12345 delivered successfully"
  }'
```

---

## 6. Notification Preferences

Users can manage notification preferences through the API:

```bash
# Update preferences
curl -X PATCH http://localhost:3000/api/v1/notifications/preferences/user-123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": true,
    "sms": false,
    "push": true,
    "inApp": true
  }'
```

---

## 7. Complete .env Example

```env
# ============================================
# NOTIFICATIONS CONFIGURATION
# ============================================

# SendGrid Email
SENDGRID_API_KEY=SG.abc123...
SENDGRID_FROM_EMAIL=noreply@dryjets.com

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase Cloud Messaging
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"dryjets","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@dryjets.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# JWT Secret (for WebSocket auth)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dryjets

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 8. Production Checklist

### Email (SendGrid)
- [ ] Domain authentication configured
- [ ] SPF, DKIM, DMARC records added
- [ ] Sender reputation monitoring enabled
- [ ] Unsubscribe link in all marketing emails
- [ ] Email templates tested on multiple clients (Gmail, Outlook, etc.)

### SMS (Twilio)
- [ ] Account upgraded from trial
- [ ] Company info registered
- [ ] Toll-free number or short code (for high volume)
- [ ] A2P 10DLC registration (US only)
- [ ] Opt-out handling implemented ("STOP" keyword)

### Push Notifications (FCM)
- [ ] Production APNs certificate uploaded (iOS)
- [ ] FCM server key rotated
- [ ] Notification icons optimized
- [ ] Deep linking configured
- [ ] Notification scheduling tested
- [ ] Badge count management

### Security
- [ ] API keys stored in secure secrets manager (AWS Secrets Manager, Vault, etc.)
- [ ] Never commit credentials to git
- [ ] Rotate keys every 90 days
- [ ] Monitor for unauthorized usage
- [ ] Rate limiting enabled
- [ ] GDPR/CCPA compliance (user data export, deletion)

---

## 9. Cost Estimates

### SendGrid
- **Free:** 100 emails/day
- **Essentials:** $19.95/mo (50,000 emails)
- **Pro:** $89.95/mo (1,500,000 emails)

### Twilio SMS
- **US:** $0.0079 per SMS sent
- **International:** Varies by country ($0.01 - $0.10)
- **Monthly cost example:** 10,000 SMS = ~$79

### Firebase Cloud Messaging
- **Free:** Unlimited push notifications
- **Cost:** Only Firebase Hosting/Database (if used)

### Total Estimated Monthly Cost
- Small (1,000 users, 5 orders/user/month):
  - SendGrid: Free
  - Twilio: ~$40
  - FCM: Free
  - **Total: ~$40/mo**

- Medium (10,000 users):
  - SendGrid: $19.95
  - Twilio: ~$400
  - FCM: Free
  - **Total: ~$420/mo**

- Large (100,000 users):
  - SendGrid: $89.95
  - Twilio: ~$4,000
  - FCM: Free
  - **Total: ~$4,090/mo**

---

## 10. Troubleshooting

### SendGrid Emails Not Sending
1. Check API key is valid: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.sendgrid.com/v3/user/profile`
2. Verify sender email is authenticated
3. Check spam folder
4. Review SendGrid activity logs
5. Ensure no rate limiting

### Twilio SMS Not Sending
1. Check trial account limitations
2. Verify phone number is verified (trial)
3. Check balance
4. Review Twilio error logs
5. Ensure number has SMS capability

### Push Notifications Not Receiving
1. Check FCM token is valid
2. Verify app is in foreground/background
3. Check notification permissions granted
4. Review Firebase Console logs
5. Ensure google-services.json is correct
6. Test with FCM console directly

### Common Errors
```
Error: "Invalid API key" (SendGrid)
→ Check SENDGRID_API_KEY is correctly set

Error: "Authenticate" (Twilio)
→ Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN

Error: "app/no-app" (Firebase)
→ Firebase not initialized, check FIREBASE_SERVICE_ACCOUNT

Error: "FCM token not found"
→ User hasn't granted notification permission or token expired
```

---

## 11. Best Practices

### Notification Strategy
- **Critical updates:** SMS + Push
- **Order lifecycle:** Email + Push
- **Marketing:** Email only (with opt-out)
- **Real-time updates:** In-app (Socket.io) + Push

### Timing
- **Immediate:** Driver assigned, order ready
- **Batched:** Daily summaries, weekly reports
- **Scheduled:** Promotional emails (avoid nights)

### Content
- **Be concise:** SMS limited to 160 characters
- **Clear CTA:** Include action links
- **Personalize:** Use user's name, order details
- **Test:** A/B test subject lines, content

### Compliance
- **GDPR:** Allow users to export/delete data
- **CAN-SPAM:** Include unsubscribe link, physical address
- **TCPA:** Get consent for SMS, honor opt-outs
- **CASL:** Canadian anti-spam law

---

## 12. Monitoring & Analytics

### Key Metrics to Track
- **Delivery Rate:** % of notifications successfully delivered
- **Open Rate:** % of emails/push notifications opened
- **Click-through Rate:** % of users who clicked links
- **Opt-out Rate:** % of users who unsubscribe
- **Error Rate:** Failed notifications

### Tools
- SendGrid: Built-in analytics dashboard
- Twilio: Message logs and analytics
- Firebase: FCM analytics in Firebase Console
- Custom: Store in database, visualize with Grafana

### Logging
```typescript
// Example logging
this.logger.log({
  event: 'notification_sent',
  userId,
  channel: 'EMAIL',
  type: 'ORDER_CREATED',
  success: true,
  timestamp: new Date(),
});
```

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Status:** Production Ready

For questions or issues, contact: dev@dryjets.com
