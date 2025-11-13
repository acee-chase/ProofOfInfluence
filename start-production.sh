#!/bin/bash

# Production startup script - Start both main application and API server
echo "🚀 Starting services in production mode..."

# Store the project root directory
PROJECT_ROOT=$(pwd)

# Start API Server in background
echo "📡 Starting API Server on port 3001..."
(cd api-server && npm start) &
API_PID=$!

# Give API server a moment to start
sleep 3

# Start main application (foreground)
echo "🌐 Starting main application on port 5000..."
cd "$PROJECT_ROOT"
NODE_ENV=production node dist/index.js

# If main app exits, kill the API server
kill $API_PID 2>/dev/null
