# DryJets Test Scripts

This directory contains utility scripts for testing and development.

## IoT Telemetry Testing

### Quick Test (Bash Script)

Send a single telemetry data point to test the IoT API:

```bash
# Using default values
./scripts/test-iot-simple.sh

# With custom equipment ID and API key
./scripts/test-iot-simple.sh equip_abc123 iot_your_api_key_here

# With custom API URL
API_URL=https://api.dryjets.com ./scripts/test-iot-simple.sh
```

**Requirements:**
- `curl` and `jq` installed
- API server running

### Continuous Simulation (TypeScript)

Simulate multiple IoT devices sending telemetry continuously:

```bash
# Install dependencies (if not already installed)
npm install

# Run simulator (sends telemetry every 60 seconds)
ts-node scripts/test-iot-telemetry.ts

# Custom interval (every 10 seconds)
ts-node scripts/test-iot-telemetry.ts --interval=10000

# Custom API URL
ts-node scripts/test-iot-telemetry.ts --api-url=https://api.dryjets.com

# Send single test (no loop)
ts-node scripts/test-iot-telemetry.ts --test
```

**What it simulates:**
- 3 devices by default (Washer, Dryer, Presser)
- Realistic sensor readings (power, water, temperature, vibration)
- Random cycle start/stop (20% chance per interval)
- Occasional anomalies (5% power spikes, 3% high vibration)
- Proper cycle types and timing

**Output example:**
```
🚀 IoT Telemetry Simulator Started
📡 API URL: http://localhost:3000
⏱️  Interval: 60s
🔧 Equipment: 3 devices

Equipment List:
  - Test Washer #1 (WASHER) [ID: equip_test_washer_1]
  - Test Dryer #1 (DRYER) [ID: equip_test_dryer_1]
  - Test Presser #1 (PRESSER) [ID: equip_test_presser_1]

📊 Starting telemetry transmission...

✅ [Test Washer #1] Sent telemetry | Health: 87% | Efficiency: 92% | 🔄 RUNNING
🟢 [Test Dryer #1] Sent telemetry | Health: 74% | Efficiency: 68% | ⏸️  IDLE
   ⚠️  Issues: Maintenance overdue (95 days since last service)
🟡 [Test Presser #1] Sent telemetry | Health: 92% | Efficiency: 95% | 🔄 RUNNING
```

### Setup Before Testing

1. **Create test equipment in database:**

```sql
-- Insert test equipment (run in your PostgreSQL database)
INSERT INTO "Equipment" (id, "merchantId", name, type, status, "isIotEnabled", "iotDeviceId", "iotApiKey", "createdAt", "updatedAt")
VALUES
  ('equip_test_washer_1', 'YOUR_MERCHANT_ID', 'Test Washer #1', 'WASHER', 'OPERATIONAL', true, 'device_washer_1', 'iot_test_key_washer_1', NOW(), NOW()),
  ('equip_test_dryer_1', 'YOUR_MERCHANT_ID', 'Test Dryer #1', 'DRYER', 'OPERATIONAL', true, 'device_dryer_1', 'iot_test_key_dryer_1', NOW(), NOW()),
  ('equip_test_presser_1', 'YOUR_MERCHANT_ID', 'Test Presser #1', 'PRESSER', 'OPERATIONAL', true, 'device_presser_1', 'iot_test_key_presser_1', NOW(), NOW());
```

2. **Or use the API to enable IoT:**

```bash
# First, create equipment through your app or API
# Then enable IoT via API:

curl -X POST http://localhost:3000/api/v1/iot/equipment/YOUR_EQUIPMENT_ID/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "iotDeviceId": "device_washer_1"
  }'

# Response will include the generated API key
```

3. **Update script with your equipment IDs and API keys**

Edit `scripts/test-iot-telemetry.ts` and replace the default equipment array with your actual IDs and API keys.

## Verifying Results

### 1. Check API logs

The API will log when telemetry is received:

```
[IoTService] Telemetry received for equipment equip_test_washer_1 | Health: 87 | Efficiency: 92
[MaintenanceAlertsService] Created HIGH alert for equipment equip_test_washer_1: High Vibration Detected
```

### 2. Query database

```sql
-- Check latest telemetry
SELECT * FROM "EquipmentTelemetry" WHERE "equipmentId" = 'equip_test_washer_1';

-- Check telemetry history
SELECT * FROM "EquipmentTelemetryLog"
WHERE "equipmentId" = 'equip_test_washer_1'
ORDER BY timestamp DESC
LIMIT 10;

-- Check generated alerts
SELECT * FROM "MaintenanceAlert"
WHERE "equipmentId" = 'equip_test_washer_1'
ORDER BY "createdAt" DESC;
```

### 3. View in merchant dashboard

Navigate to: `http://localhost:3001/dashboard/equipment`

You should see:
- Real-time health scores
- Equipment status (Running/Idle)
- Maintenance alerts
- Telemetry charts

## Troubleshooting

### "Equipment not found"
- Verify equipment exists in database
- Check that `isIotEnabled = true`
- Verify equipment ID matches

### "Invalid API key"
- Check that API key matches what's in database
- Ensure you're using the `x-api-key` header

### "Connection refused"
- Ensure API server is running on specified URL
- Check firewall/network settings

### No data appearing in dashboard
- Verify equipment belongs to logged-in merchant
- Check browser console for API errors
- Refresh the page

## Advanced Usage

### Simulate Specific Scenarios

**High Vibration Alert:**
Modify `test-iot-simple.sh` and set vibration to 7.0:

```bash
VIBRATION=7.0
```

**Low Efficiency:**
Set high power consumption:

```bash
POWER_WATTS=4000  # 2x normal for washer
```

**Maintenance Overdue:**
Update equipment's `lastMaintenanceDate` in database to 120+ days ago.

## Next Steps

After testing:
1. Replace test equipment IDs with production IDs
2. Secure API keys (use environment variables)
3. Set up monitoring/alerting for failed telemetry submissions
4. Configure appropriate telemetry intervals (recommended: 5 minutes)

## Need Help?

- Check IOT_INTEGRATION_GUIDE.md for full documentation
- Review API logs for detailed error messages
- Test with `--test` flag first before continuous simulation
