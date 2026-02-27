#!/bin/bash
set -e

echo "🔨 Building backend..."
cd back-end
npm install
npx prisma generate
npm run build
cd ..

echo "📦 Copying backend to api..."
mkdir -p api/dist
mkdir -p api/generated
cp -r back-end/dist/* api/dist/
cp -r back-end/generated/* api/generated/
cp -r back-end/node_modules api/
cp back-end/package.json api/

echo "🎨 Building frontend..."
cd front-end
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
