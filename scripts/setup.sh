#!/bin/bash

# DryJets Platform - Setup Script
# This script sets up the development environment

set -e

echo "🚀 DryJets Platform Setup"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js version must be 20 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. You'll need Docker to run the database.${NC}"
    echo -e "${YELLOW}   Visit: https://docs.docker.com/get-docker/${NC}"
else
    echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detected${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your API keys${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi

echo ""
echo "🐳 Starting database services with Docker..."
if command -v docker &> /dev/null; then
    cd infrastructure/docker
    docker-compose up -d postgres redis
    cd ../..
    echo -e "${GREEN}✅ Database services started${NC}"
    echo "   - PostgreSQL: localhost:5432"
    echo "   - Redis: localhost:6379"

    echo ""
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
else
    echo -e "${YELLOW}⚠️  Skipping Docker services (Docker not installed)${NC}"
fi

echo ""
echo "🗄️  Setting up database..."
cd packages/database

echo "   Running Prisma migrations..."
npm run db:migrate || echo -e "${YELLOW}⚠️  Migration failed. Make sure PostgreSQL is running.${NC}"

echo "   Generating Prisma client..."
npm run db:generate

cd ../..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Edit .env file with your API keys:"
echo "   - JWT_SECRET"
echo "   - STRIPE_SECRET_KEY (if using payments)"
echo "   - GOOGLE_MAPS_API_KEY (if using maps)"
echo ""
echo "2. Start the development servers:"
echo "   ${YELLOW}npm run dev --workspace=@dryjets/api${NC}             # API server"
echo "   ${YELLOW}npm run dev --workspace=@dryjets/web-merchant${NC}    # Merchant portal"
echo "   ${YELLOW}npm run dev --workspace=@dryjets/mobile-customer${NC} # Customer app"
echo ""
echo "3. Access the applications:"
echo "   - API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/api/docs"
echo "   - Merchant Portal: http://localhost:3001"
echo ""
echo "📖 For more information, read:"
echo "   - README.md"
echo "   - GETTING_STARTED.md"
echo "   - PROJECT_SUMMARY.md"
echo ""
echo "Happy coding! 🎉"
