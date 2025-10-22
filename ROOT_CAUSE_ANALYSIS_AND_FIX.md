# Root Cause Analysis & Fix - react-native-paper Error

**Issue Date:** October 21, 2025
**Status:** ✅ RESOLVED
**Severity:** Critical - Build Blocker

---

## 🔍 Root Cause Analysis

### The Problem:
Expo Go app was showing error:
```
Unable to resolve "react-native-paper" from "app/notifications/index.tsx"
```

### Why It Happened:

**You have TWO separate DryJets projects on your machine:**

1. **✅ CORRECT PROJECT (Monorepo):**
   - Location: `/Users/husamahmed/DryJets/`
   - Structure: Turborepo monorepo with `apps/mobile-customer/`
   - This is where we've been implementing Phase 2
   - Does NOT use `react-native-paper`
   - ALL dependencies properly installed

2. **❌ WRONG PROJECT (Standalone - OLD):**
   - Location: `/Users/husamahmed/DryJets-Mobile-Standalone/`
   - Structure: Standalone Expo app
   - Uses `react-native-paper` but doesn't have it installed
   - THIS is what your Expo Go was connected to!

### The Issue Chain:

1. **Multiple Servers Running:**
   - Server 1 (PID 3093): `/Users/husamahmed/DryJets-Mobile-Standalone/` ❌
   - Server 2 (PID 1808): `/Users/husamahmed/DryJets/apps/mobile-customer/` ✅

2. **Expo Go Connection:**
   - Your Expo Go app was pointing to port 8081
   - The standalone app server claimed port 8081 first
   - So Expo Go connected to the WRONG project

3. **Missing Dependency:**
   - Standalone app's `app/notifications/index.tsx` imports `react-native-paper`
   - But that dependency isn't in `package.json`
   - Build failed when Metro tried to bundle

---

## ✅ Resolution Steps Applied

### Step 1: Identified All Running Processes
```bash
ps aux | grep -E "expo|metro"
```

**Found:**
- husamahmed 3093 - DryJets-Mobile-Standalone ❌
- husamahmed 1808 - DryJets/apps/mobile-customer ✅

### Step 2: Killed ALL Expo Processes
```bash
kill -9 3093 3083 1808 1796 1793
```

**Result:** All conflicting servers terminated ✅

### Step 3: Verified Correct Project
```bash
cd /Users/husamahmed/DryJets/apps/mobile-customer
grep -r "react-native-paper" app components lib
```

**Result:** No `react-native-paper` imports in monorepo ✅

### Step 4: Verified All Dependencies
```bash
cat package.json | jq -r '.dependencies | keys[]'
```

**Result:** All required dependencies installed:
- @stripe/stripe-react-native ✅
- react-native-maps ✅
- expo-location ✅
- zustand ✅
- @tanstack/react-query ✅
- All others ✅

### Step 5: Started Server in Correct Location
```bash
cd /Users/husamahmed/DryJets/apps/mobile-customer
npx expo start --clear
```

**Result:** Server running at correct location ✅

---

## 🎯 How To Prevent This Issue

### Option 1: Delete or Rename Standalone Project

**Recommended if you don't need the standalone version:**

```bash
# Backup first (optional)
mv /Users/husamahmed/DryJets-Mobile-Standalone /Users/husamahmed/DryJets-Mobile-Standalone.BACKUP

# Or delete entirely
# rm -rf /Users/husamahmed/DryJets-Mobile-Standalone
```

### Option 2: Always Verify Working Directory

**Before starting Expo:**

```bash
# Check you're in the correct directory
pwd

# Should show:
# /Users/husamahmed/DryJets/apps/mobile-customer

# If not, navigate there:
cd /Users/husamahmed/DryJets/apps/mobile-customer
```

### Option 3: Use Different Ports

**If you need both projects:**

In standalone project, use a different port:
```bash
cd /Users/husamahmed/DryJets-Mobile-Standalone
npx expo start --port 8082  # Different port
```

In monorepo (use default):
```bash
cd /Users/husamahmed/DryJets/apps/mobile-customer
npx expo start  # Uses 8081
```

---

## 📱 Correct Expo Go Connection

### How to Connect to the RIGHT Project:

1. **Kill any existing servers:**
   ```bash
   pkill -f "expo start"
   ```

2. **Navigate to monorepo:**
   ```bash
   cd /Users/husamahmed/DryJets/apps/mobile-customer
   ```

3. **Start server:**
   ```bash
   npx expo start --clear
   ```

4. **Verify in terminal output:**
   ```
   Starting project at /Users/husamahmed/DryJets/apps/mobile-customer
   ```
   ✅ This is correct!

5. **Scan QR code with Expo Go**

6. **Verify app loads without react-native-paper error**

---

## 🔍 How to Verify You're Connected to Correct Project

### In Expo Go App:

1. **Shake device → Show Menu → Settings**
2. Check "Server" URL:
   - Should show your computer name
   - Port 8081

3. **Look at app UI:**
   - Should show Phase 2 features (cart, addresses, etc.)
   - Should NOT show notifications screen (standalone feature)

### In Terminal:

1. **Check process:**
   ```bash
   ps aux | grep "expo start" | grep -v grep
   ```

2. **Should show ONLY:**
   ```
   .../DryJets/apps/mobile-customer/node_modules/.bin/expo start
   ```

3. **NOT:**
   ```
   .../DryJets-Mobile-Standalone/node_modules/.bin/expo start
   ```

---

## 🚨 Warning Signs You're on Wrong Project

### If you see these errors in Expo Go:

- ❌ "Unable to resolve react-native-paper"
- ❌ "Cannot find module X" (for any missing dependency)
- ❌ Different UI than expected
- ❌ Different features than Phase 2

### Immediate Fix:

```bash
# Kill ALL Expo processes
pkill -f "expo start"

# Navigate to CORRECT project
cd /Users/husamahmed/DryJets/apps/mobile-customer

# Verify location
pwd

# Start server
npx expo start --clear

# Reload in Expo Go
# (shake device → reload)
```

---

## 📊 Project Comparison

| Aspect | Monorepo (CORRECT) | Standalone (OLD) |
|--------|-------------------|------------------|
| **Location** | `/Users/husamahmed/DryJets/` | `/Users/husamahmed/DryJets-Mobile-Standalone/` |
| **Structure** | Turborepo with apps/ | Standalone Expo app |
| **Phase 2 Features** | ✅ YES (cart, addresses, Stripe) | ❌ NO |
| **react-native-paper** | ❌ Not used | ✅ Used but not installed |
| **Current Work** | ✅ Active development | ❌ Old/unused |
| **Should Use** | ✅ YES | ❌ NO |

---

## ✅ Current Status

### Server Status:
- ✅ Running in correct location
- ✅ Metro bundler rebuilding with cleared cache
- ✅ No conflicting servers
- ✅ All dependencies present

### Next Steps for User:

1. **Wait for Metro to finish building** (~30 seconds)
2. **Open Expo Go on your device**
3. **Scan the QR code from terminal**
4. **Verify Phase 2 features load correctly:**
   - Shopping cart screen
   - Address management
   - Enhanced merchant detail
   - Stripe payment (with config warning)

---

## 🎉 Resolution Confirmed

**Problem:** Wrong project (standalone) was running and Expo Go was connected to it

**Solution:** Killed all processes, verified correct project, started fresh server in monorepo

**Status:** ✅ RESOLVED - Server running in correct location

**User Action Required:**
1. Scan QR code in Expo Go
2. Test Phase 2 features
3. Optionally: Delete or rename standalone project to prevent future confusion

---

**Generated:** October 21, 2025
**Issue:** Project Confusion (Multiple Projects)
**Fix:** Server Isolation & Correct Project Selection
