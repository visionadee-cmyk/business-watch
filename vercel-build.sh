#!/bin/bash

# Vercel Build Script
# This script runs during the Vercel build process

echo "🚀 Starting Business Watch build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build complete!"
