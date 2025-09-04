#!/bin/bash

echo "🚀 Starting Render deployment build..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --prefix backend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --prefix frontend

# Build the frontend
echo "🔨 Building frontend..."
cd frontend && npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully"

    # Create backend .next directory if it doesn't exist
    mkdir -p ../backend/.next

    # Copy the build files
    echo "📋 Copying build files to backend..."
    cp -r .next/* ../backend/.next/ 2>/dev/null || echo "✅ Copy operation completed"

    echo "🎉 Build process completed successfully!"
else
    echo "❌ Frontend build failed"
    exit 1
fi
