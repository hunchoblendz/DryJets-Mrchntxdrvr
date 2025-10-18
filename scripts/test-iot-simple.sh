#!/bin/bash

# Simple IoT Telemetry Test Script
# Usage: ./scripts/test-iot-simple.sh [equipment_id] [api_key]

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
EQUIPMENT_ID="${1:-equip_test_washer_1}"
API_KEY="${2:-iot_test_key_washer_1}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 IoT Telemetry Test"
echo "===================="
echo "API URL: $API_URL"
echo "Equipment ID: $EQUIPMENT_ID"
echo "API Key: $API_KEY"
echo ""

# Generate random realistic telemetry data
POWER_WATTS=$(awk -v min=2000 -v max=2500 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
WATER_LITERS=$(awk -v min=40 -v max=55 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
TEMPERATURE=$(awk -v min=60 -v max=75 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
VIBRATION=$(awk 'BEGIN{srand(); print (1.5 + rand()*2)}')
IS_RUNNING=$( [ $((RANDOM % 2)) -eq 0 ] && echo "true" || echo "false" )

# Create JSON payload
read -r -d '' PAYLOAD <<EOF
{
  "equipmentId": "$EQUIPMENT_ID",
  "powerWatts": $POWER_WATTS,
  "waterLiters": $WATER_LITERS,
  "temperature": $TEMPERATURE,
  "vibration": $VIBRATION,
  "cycleType": "WASH",
  "isRunning": $IS_RUNNING
}
EOF

echo "📤 Sending telemetry data:"
echo "$PAYLOAD" | jq '.' 2>/dev/null || echo "$PAYLOAD"
echo ""

# Send request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_URL/api/v1/iot/telemetry" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$PAYLOAD")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "📊 Response:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

  # Extract health score if available
  HEALTH_SCORE=$(echo "$BODY" | jq -r '.telemetry.healthScore' 2>/dev/null)
  if [ "$HEALTH_SCORE" != "null" ] && [ ! -z "$HEALTH_SCORE" ]; then
    echo ""
    echo -e "${YELLOW}💊 Health Score: $HEALTH_SCORE%${NC}"
  fi
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "Error Response:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 1
fi
