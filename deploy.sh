#!/bin/bash

# Exit on any error
set -e

echo "🔄 Pulling latest code from Git..."
git pull

echo "📦 Installing dependencies..."
npm install

echo "⚙️ Building the project..."
npm run build

echo "📁 Copying .env to build directory..."
cp .env ./build

echo "📂 Entering build directory..."
cd ./build

echo "📦 Installing build dependencies..."
npm install

echo "✅ Deployment steps completed successfully!"
