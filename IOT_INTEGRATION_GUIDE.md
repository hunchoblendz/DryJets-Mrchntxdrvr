# DryJets IoT Integration Guide

## Overview

The DryJets IoT system enables dry cleaning businesses to connect their commercial equipment (washers, dryers, pressers, steamers) to the platform for:

- **Real-time monitoring** of equipment health and performance
- **Predictive maintenance** alerts to prevent breakdowns
- **Resource optimization** recommendations to reduce utility costs
- **Operational analytics** for data-driven decision making

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  IoT Device / Sensor                    │
│  (Commercial Machine API or Aftermarket Sensor Module)  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP POST (every 5 min)
                       │
┌──────────────────────▼──────────────────────────────────┐
│           DryJets API - IoT Telemetry Endpoint          │
│              POST /api/v1/iot/telemetry                 │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
┌─────────▼────┐ ┌─────▼─────┐ ┌──▼──────────┐
│ Health Scoring│ │  Alerts   │ │Optimization│
│   (Rule-Based)│ │  Service  │ │  Service   │
└───────────────┘ └───────────┘ └────────────┘
          │            │            │
          └────────────┼────────────┘
                       │
          ┌────────────▼────────────┐
          │   PostgreSQL Database   │
          │  (Equipment Telemetry)  │
          └─────────────────────────┘
```

## Getting Started

### For Merchants with Smart Machines

If your equipment has built-in IoT capabilities (Electrolux, LG Pro, Alliance, etc.):

1. **Enable IoT in DryJets Dashboard:**
   - Navigate to Equipment > [Your Machine]
   - Click "Enable IoT Integration"
   - Enter your IoT Device ID (from manufacturer's dashboard)
   - Copy the generated API Key

2. **Configure Your Machine:**
   - Access your machine's IoT settings
   - Set webhook URL: `https://api.dryjets.com/v1/iot/telemetry`
   - Add header: `x-api-key: YOUR_API_KEY`
   - Set interval: Every 5 minutes

3. **Verify Connection:**
   - Return to DryJets dashboard
   - Check "Last Telemetry Received" timestamp
   - View real-time health metrics

### For Merchants with Standard Machines (Aftermarket Sensors)

If your equipment doesn't have IoT capabilities, you can add sensors:

#### Recommended Hardware Setup (~$50 per machine)

**Components:**
- ESP32 DevKit ($10) - WiFi-enabled microcontroller
- Sonoff Pow R2 ($15) - Energy monitoring module
- DHT22 Sensor ($5) - Temperature sensor
- ADXL345 Accelerometer ($5) - Vibration sensor
- Misc wires and connectors ($10)

**Installation:**
1. Install Sonoff Pow R2 inline with machine's power supply
2. Mount DHT22 near machine's exhaust vent
3. Attach ADXL345 to machine frame (near motor)
4. Connect all sensors to ESP32 via I2C/GPIO pins
5. Power ESP32 via USB adapter

#### Firmware Setup

We provide ready-to-use Arduino firmware:

```cpp
// Download from: https://github.com/dryjets/iot-firmware
// Or use the code below

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_ADXL345_U.h>

// Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* apiKey = "YOUR_DRYJETS_API_KEY";
const char* equipmentId = "YOUR_EQUIPMENT_ID";
const char* apiUrl = "https://api.dryjets.com/v1/iot/telemetry";

// Sensors
DHT dht(4, DHT22);  // DHT22 on GPIO 4
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// Power monitoring (via serial from Sonoff)
float powerWatts = 0;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  dht.begin();
  accel.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read sensors
    float temperature = dht.readTemperature();
    sensors_event_t event;
    accel.getEvent(&event);
    float vibration = sqrt(event.acceleration.x * event.acceleration.x +
                           event.acceleration.y * event.acceleration.y +
                           event.acceleration.z * event.acceleration.z);

    // Build JSON payload
    StaticJsonDocument<512> doc;
    doc["equipmentId"] = equipmentId;
    doc["powerWatts"] = powerWatts;
    doc["temperature"] = temperature;
    doc["vibration"] = vibration / 9.8;  // Convert to relative scale (0-10)
    doc["isRunning"] = (powerWatts > 100);  // Machine on if > 100W

    String jsonString;
    serializeJson(doc, jsonString);

    // Send to API
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);
    int httpCode = http.POST(jsonString);

    Serial.printf("HTTP Response: %d\\n", httpCode);
    http.end();
  }

  delay(300000);  // Wait 5 minutes
}
```

**Flash Firmware:**
```bash
# Install Arduino IDE and ESP32 board support
# Open firmware.ino
# Tools > Board > ESP32 Dev Module
# Tools > Port > [Select your ESP32]
# Upload
```

## API Reference

### Submit Telemetry

**Endpoint:** `POST /api/v1/iot/telemetry`

**Headers:**
```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request Body:**
```json
{
  "equipmentId": "equip_abc123",
  "powerWatts": 2400.5,
  "waterLiters": 45.2,
  "temperature": 65.0,
  "vibration": 2.3,
  "cycleType": "WASH",
  "isRunning": true,
  "cycleStartedAt": "2024-10-18T14:30:00Z",
  "cycleEstimatedEnd": "2024-10-18T15:00:00Z"
}
```

**Field Descriptions:**
- `equipmentId` (required) - Your equipment ID or IoT device ID
- `powerWatts` (optional) - Current power consumption in watts
- `waterLiters` (optional) - Water used in current cycle (liters)
- `temperature` (optional) - Operating temperature in Celsius
- `vibration` (optional) - Vibration level (0-10 scale, 0=none, 10=extreme)
- `cycleType` (optional) - Type of cycle: "WASH", "DRY", "STEAM", "PRESS"
- `isRunning` (optional) - Whether machine is currently operating
- `cycleStartedAt` (optional) - ISO 8601 timestamp when cycle began
- `cycleEstimatedEnd` (optional) - ISO 8601 estimated completion time

**Response:**
```json
{
  "success": true,
  "telemetry": {
    "id": "tel_xyz789",
    "equipmentId": "equip_abc123",
    "healthScore": 87,
    "efficiencyScore": 92,
    "updatedAt": "2024-10-18T14:35:12Z"
  },
  "healthStatus": "GOOD",
  "issues": []
}
```

**Health Status Values:**
- `EXCELLENT` - Health score 90-100
- `GOOD` - Health score 75-89
- `FAIR` - Health score 60-74
- `POOR` - Health score 40-59
- `CRITICAL` - Health score 0-39

### Get Current Telemetry

**Endpoint:** `GET /api/v1/iot/equipment/:equipmentId/telemetry`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "id": "tel_xyz789",
  "equipmentId": "equip_abc123",
  "powerWatts": 2400.5,
  "waterLiters": 45.2,
  "temperature": 65.0,
  "vibration": 2.3,
  "cycleType": "WASH",
  "isRunning": true,
  "cycleStartedAt": "2024-10-18T14:30:00Z",
  "cycleEstimatedEnd": "2024-10-18T15:00:00Z",
  "cycleCount": 1247,
  "healthScore": 87,
  "efficiencyScore": 92,
  "healthStatus": "GOOD",
  "updatedAt": "2024-10-18T14:35:12Z"
}
```

### Get Maintenance Alerts

**Endpoint:** `GET /api/v1/iot/alerts`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status` - Filter by status: OPEN, ACKNOWLEDGED, RESOLVED
- `severity` - Filter by severity: LOW, MEDIUM, HIGH, CRITICAL
- `type` - Filter by alert type (see types below)
- `equipmentId` - Filter by specific equipment

**Response:**
```json
[
  {
    "id": "alert_123",
    "equipmentId": "equip_abc123",
    "type": "HIGH_VIBRATION",
    "severity": "HIGH",
    "title": "High Vibration Detected",
    "description": "Equipment is experiencing abnormally high vibration levels (7.2/10)...",
    "recommendation": "Check for load imbalance. Inspect mounting bolts...",
    "status": "OPEN",
    "createdAt": "2024-10-18T14:35:12Z",
    "equipment": {
      "id": "equip_abc123",
      "name": "Washer #1",
      "type": "WASHER"
    }
  }
]
```

**Alert Types:**
- `PREVENTIVE_MAINTENANCE` - Scheduled maintenance due
- `HIGH_VIBRATION` - Excessive vibration detected
- `HIGH_TEMPERATURE` - Temperature above safe threshold
- `LOW_EFFICIENCY` - Equipment operating inefficiently
- `CYCLE_ANOMALY` - Unusual cycle pattern detected
- `FILTER_REPLACEMENT` - Filter needs replacement
- `PART_REPLACEMENT` - Component showing wear
- `UNUSUAL_NOISE` - Acoustic anomaly detected
- `WATER_LEAK` - Water leak detected
- `POWER_SPIKE` - Unusual power consumption

### Get Optimization Recommendations

**Endpoint:** `GET /api/v1/iot/optimization/recommendations`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `equipmentId` (optional) - Get recommendations for specific equipment

**Response:**
```json
{
  "recommendations": [
    {
      "type": "ENERGY",
      "priority": "HIGH",
      "title": "High Energy Consumption Detected",
      "description": "Your equipment is consuming an average of 3.2kW...",
      "potentialSavings": {
        "amount": 125,
        "unit": "USD",
        "period": "monthly"
      },
      "actionItems": [
        "Clean lint filters and ventilation systems",
        "Inspect heating elements for buildup",
        "Consider upgrading to energy-efficient equipment"
      ]
    }
  ],
  "potentialSavings": {
    "monthly": 245,
    "annually": 2940,
    "breakdown": {
      "ENERGY": 125,
      "WATER": 80,
      "MAINTENANCE": 40
    }
  }
}
```

## Intelligent Features

### 1. Health Scoring Algorithm

The system calculates equipment health (0-100) based on:

- **Vibration (30% weight):** 0-2 = normal, 4-6 = high, 6+ = critical
- **Temperature (20% weight):** Compared against equipment-specific ranges
- **Maintenance Age (25% weight):** Days since last service (90 days recommended)
- **Cycle Count (15% weight):** Total cycles run (higher = more wear)
- **Equipment Age (10% weight):** Years since purchase

**Example Calculation:**
```
Base Score: 100
- Vibration penalty: 2.5 level → -5 points
- Temperature: 68°C (within range) → -0 points
- Last maintenance: 120 days ago → -9 points
- Cycle count: 3,200 cycles → -6 points
- Equipment age: 4 years → -4 points
= Final Health Score: 76 (GOOD)
```

### 2. Predictive Maintenance Rules

The system automatically creates alerts when:

- **High Vibration:** > 5.0 for 3+ readings
- **High Temperature:** Exceeds equipment-specific threshold
- **Preventive Maintenance:** 90 days since last service
- **Low Efficiency:** < 70% efficiency score for 7+ days
- **Cycle-Based:** Every 500 cycles (filter replacement)

**Auto-Resolution:**
Alerts are automatically resolved when telemetry returns to normal for 24 hours.

### 3. Resource Optimization

Analyzes 30-day historical data to recommend:

**Energy Optimization:**
- Identifies equipment using 30%+ more power than expected
- Suggests off-peak hour scheduling (10pm-6am)
- Calculates potential savings with time-of-use rates

**Water Optimization:**
- Compares usage against industry standard (40L/cycle)
- Detects leaks or inefficient water valves
- Recommends water reclamation systems

**Scheduling Optimization:**
- Analyzes peak usage hours
- Suggests batch processing strategies
- Optimizes staff scheduling based on demand

## Dashboard Integration

### Equipment List View

```
┌─────────────────────────────────────────────────────────┐
│ Equipment                          Status    Health  Alerts│
├─────────────────────────────────────────────────────────┤
│ 🟢 Washer #1 (IoT)                Running   87%     0    │
│ 🟡 Dryer #1 (IoT)                 Idle      74%     2    │
│ 🔴 Washer #2 (IoT)                Error     45%     3    │
│ ⚪ Presser #1 (No IoT)            Unknown   -       -    │
└─────────────────────────────────────────────────────────┘
```

### Equipment Detail View

```
┌─────────────────────────────────────────────────────────┐
│ Washer #1                                    Health: 87% │
├─────────────────────────────────────────────────────────┤
│ Current Status: Running (Wash Cycle)                    │
│ Started: 2:30 PM | Estimated End: 3:00 PM               │
│                                                          │
│ Real-Time Metrics:                                       │
│ • Power: 2.4 kW                                          │
│ • Temperature: 65°C                                      │
│ • Vibration: 2.3 / 10 ✓                                  │
│ • Water: 45L (this cycle)                                │
│                                                          │
│ Performance:                                             │
│ • Total Cycles: 1,247                                    │
│ • Efficiency Score: 92%                                  │
│ • Last Maintenance: 45 days ago ✓                        │
│ • Next Maintenance: In 45 days                           │
│                                                          │
│ [View History] [Schedule Maintenance] [Settings]        │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Problem: No telemetry data received

**Check:**
1. Verify API key is correct
2. Check equipment ID matches
3. Ensure IoT is enabled for equipment
4. Test API endpoint with curl:

```bash
curl -X POST https://api.dryjets.com/v1/iot/telemetry \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "equipmentId": "YOUR_EQUIPMENT_ID",
    "powerWatts": 2000,
    "isRunning": true
  }'
```

### Problem: Health score is always 100

**Cause:** Not enough sensor data

**Solution:** Ensure you're sending at least:
- `vibration` OR `temperature`
- `powerWatts` for efficiency calculation

### Problem: Too many false alerts

**Solution:** Adjust alert thresholds in settings:
- Settings > Equipment > [Machine] > Alert Sensitivity
- Options: Low, Medium (default), High

## Cost Estimates

### Monthly Infrastructure Cost
- **PostgreSQL storage:** $0-5 (10GB telemetry data)
- **API requests:** $0 (included in existing infrastructure)
- **Total:** $0-5/month

### Merchant Value
- **Energy savings:** 15-25% reduction ($50-150/month per machine)
- **Water savings:** 10-20% reduction ($20-40/month per machine)
- **Downtime prevention:** 1-2 avoided breakdowns/year ($500-1000 value)
- **Extended equipment life:** +2-3 years (+$5000-8000 value over lifetime)

**ROI:** 300-500% annual return on IoT investment

## Support

- **Documentation:** https://docs.dryjets.com/iot
- **API Status:** https://status.dryjets.com
- **Email Support:** iot-support@dryjets.com
- **GitHub:** https://github.com/dryjets/iot-firmware

---

**Last Updated:** October 18, 2024
**Version:** 1.0
