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
mkdir -p api/prisma
cp -r back-end/dist/* api/dist/
cp -r back-end/generated/* api/generated/
cp -r back-end/node_modules api/
cp back-end/prisma/schema.prisma api/prisma/

echo "🎨 Building frontend..."
cd front-end
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
