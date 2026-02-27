#!/bin/bash
set -e

echo "🔨 Building backend..."
cd back-end
npm install
npx prisma generate
npm run build
cd ..

echo "🎨 Building frontend..."
cd front-end
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
