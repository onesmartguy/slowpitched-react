#!/bin/bash

# Start Local MCP Server Script
# This script starts the MCP server for local development and testing

set -e

echo "🚀 Starting Pitch Height Tracker MCP Server..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Start server
echo ""
echo "✨ Starting MCP Server..."
echo "📊 API will be available at: http://localhost:3000"
echo "📡 WebSocket will be available at: ws://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

pnpm run start
