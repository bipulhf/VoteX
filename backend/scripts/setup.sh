#!/bin/bash

# Voting System Backend Setup Script
echo "🚀 Setting up Voting System Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one based on env.example"
    echo "📋 Copying env.example to .env..."
    cp env.example .env
    echo "✅ .env file created. Please configure your environment variables."
    echo ""
    echo "Important environment variables to configure:"
    echo "- DATABASE_URL: PostgreSQL connection string"
    echo "- JWT_SECRET: Secret key for JWT tokens"
    echo "- JWT_REFRESH_SECRET: Secret key for refresh tokens"
    echo "- SMTP configuration for email functionality"
    echo ""
    read -p "Press Enter to continue after configuring your .env file..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

# Push database schema
echo "🗄️  Pushing database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema. Please check your DATABASE_URL in .env"
    exit 1
fi

echo "✅ Database schema pushed"

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build application"
    exit 1
fi

echo "✅ Application built successfully"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📚 Quick start commands:"
echo "  Development mode: npm run dev"
echo "  Production mode:  npm start"
echo "  View database:    npm run db:studio"
echo ""
echo "🧪 Test credentials:"
echo "  Admin: admin@votingsystem.com / admin123456"
echo "  User:  john.doe@example.com / user123456"
echo ""
echo "🌐 The server will run on http://localhost:5000"
echo ""
echo "Happy coding! 🚀" 