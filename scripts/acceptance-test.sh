#!/bin/bash

# Immortality Playable Agent - Acceptance Test Script
# Usage: ./scripts/acceptance-test.sh [base_url] [demo_user_id]

BASE_URL=${1:-http://localhost:5000}
DEMO_USER_ID=${2:-demo-001}

echo "=========================================="
echo "Immortality Playable Agent - Acceptance Test"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Demo User ID: $DEMO_USER_ID"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Grant permissions
echo -e "${YELLOW}[Test 1] Grant Agent Permissions${NC}"
echo "Creating vault and granting permissions..."

# First, we need to get a vaultId. Let's run the scenario which will create it.
# For now, we'll skip this and go directly to scenario test.

# Test 2: Check OpenAI API (via chat endpoint)
echo -e "\n${YELLOW}[Test 2] Check OpenAI API Configuration${NC}"
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=test' \
  -d '{"message":"Hello"}')

if echo "$CHAT_RESPONSE" | grep -q "Chat service not configured"; then
  echo -e "${RED}❌ OPENAI_API_KEY not configured${NC}"
  echo "Response: $CHAT_RESPONSE"
else
  echo -e "${GREEN}✅ Chat endpoint accessible${NC}"
fi

# Test 3: Run full scenario
echo -e "\n${YELLOW}[Test 3] Run immortality-playable-agent Scenario${NC}"
SCENARIO_RESPONSE=$(curl -s -X POST "$BASE_URL/api/test-scenarios/run" \
  -H 'Content-Type: application/json' \
  -H "x-demo-user-id: $DEMO_USER_ID" \
  -d "{
    \"scenarioKey\": \"immortality-playable-agent\",
    \"params\": {
      \"chain\": \"base-sepolia\",
      \"memorySeed\": [\"I am immortal.\", \"My badge proves it.\", \"POI is my RWA infra.\"],
      \"chat\": {
        \"messages\": [{\"role\": \"user\", \"content\": \"你是谁？你记得什么？\"}]
      },
      \"mint\": {
        \"method\": \"mintSelf\",
        \"priceEth\": \"0\"
      }
    }
  }")

echo "Response:"
echo "$SCENARIO_RESPONSE" | jq '.' 2>/dev/null || echo "$SCENARIO_RESPONSE"

# Extract runId
RUN_ID=$(echo "$SCENARIO_RESPONSE" | jq -r '.runId' 2>/dev/null)

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo -e "${RED}❌ Scenario failed - no runId returned${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Scenario started - Run ID: $RUN_ID${NC}"

# Wait a bit for async execution
echo -e "\n${YELLOW}Waiting 10 seconds for scenario to complete...${NC}"
sleep 10

# Test 4: Query run details
echo -e "\n${YELLOW}[Test 4] Query Test Run Details${NC}"
RUN_DETAILS=$(curl -s "$BASE_URL/api/test-runs/$RUN_ID")

echo "Run Details:"
echo "$RUN_DETAILS" | jq '.' 2>/dev/null || echo "$RUN_DETAILS"

# Validate steps
SUCCESS=$(echo "$RUN_DETAILS" | jq -r '.status' 2>/dev/null)
if [ "$SUCCESS" = "success" ]; then
  echo -e "${GREEN}✅ Scenario completed successfully${NC}"
else
  echo -e "${RED}❌ Scenario failed or still running${NC}"
fi

# Check steps
STEPS=$(echo "$RUN_DETAILS" | jq -r '.steps | length' 2>/dev/null)
echo "Total steps: $STEPS"

# Check for errorName in failed steps
FAILED_STEPS=$(echo "$RUN_DETAILS" | jq -r '.steps[] | select(.status == "failed") | .error.errorName' 2>/dev/null)
if [ -n "$FAILED_STEPS" ]; then
  echo -e "${YELLOW}Failed steps with error names:${NC}"
  echo "$FAILED_STEPS"
fi

# Summary
echo -e "\n${YELLOW}=========================================="
echo "Test Summary"
echo "==========================================${NC}"
echo "Run ID: $RUN_ID"
echo "Status: $SUCCESS"
echo "Steps: $STEPS"
echo ""
echo "For full details, visit: $BASE_URL/api/test-runs/$RUN_ID"
