# Getting Started with DryJets Development

This guide will help you set up and start developing the DryJets platform.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

```bash
cd infrastructure/docker
docker-compose up -d postgres redis
cd ../..
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="postgresql://dryjets:dryjets_dev_password@localhost:5432/dryjets"
JWT_SECRET="your-secret-key-here"
```

### 4. Initialize Database

```bash
cd packages/database
npm run db:migrate
npm run db:generate
cd ../..
```

### 5. Start Development Servers

```bash
# Terminal 1: Start API
npm run dev --workspace=@dryjets/api

# Terminal 2: Start Merchant Portal
npm run dev --workspace=@dryjets/web-merchant

# Terminal 3: Start Customer Mobile App
npm run dev --workspace=@dryjets/mobile-customer
```

## Detailed Setup

### Prerequisites

Make sure you have installed:

- **Node.js 20+**: `node --version`
- **npm 10+**: `npm --version`
- **Docker**: `docker --version`
- **Git**: `git --version`

### Project Structure Overview

```
dryjets-platform/
├── apps/                    # Applications
│   ├── api/                 # Backend (NestJS) - Port 3000
│   ├── web-merchant/        # Merchant Portal (Next.js) - Port 3001
│   ├── mobile-customer/     # Customer App (React Native)
│   └── mobile-driver/       # Driver App (React Native)
├── packages/                # Shared code
│   ├── database/            # Prisma schema
│   └── types/               # TypeScript types
└── infrastructure/          # DevOps configs
```

### Database Setup

The database schema includes:
- Users (multi-role: customer, driver, merchant, admin)
- Orders (complete order lifecycle)
- Payments (Stripe integration ready)
- Merchants (business management)
- Drivers (gig economy model)
- And much more!

View the full schema: [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)

### API Endpoints

Once the API is running, access:

- **API Base**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

### Testing the API

**Register a new customer:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

### Mobile App Development

Both customer and driver apps use React Native with Expo:

```bash
# Start customer app
cd apps/mobile-customer
npm run dev

# Scan QR code with Expo Go app (iOS/Android)
```

### Merchant Portal

The merchant portal is a Next.js app:

```bash
npm run dev --workspace=@dryjets/web-merchant
```

Open http://localhost:3001

## Development Workflow

### Creating a New Feature

1. **Create database models** (if needed)
   ```bash
   # Edit packages/database/prisma/schema.prisma
   cd packages/database
   npm run db:migrate
   npm run db:generate
   ```

2. **Create API endpoints**
   ```bash
   # Create module in apps/api/src/modules/your-feature/
   ```

3. **Add frontend components**
   ```bash
   # Add to appropriate app (web-merchant, mobile-customer, etc.)
   ```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific workspace tests
npm run test --workspace=@dryjets/api

# Watch mode
npm run test:watch --workspace=@dryjets/api
```

### Code Quality

```bash
# Lint all code
npm run lint

# Format all code
npm run format

# Type check
npm run type-check
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Database Connection Issues

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
cd packages/database
npm run db:push -- --force-reset

# Regenerate client
npm run db:generate
```

### Module Not Found Errors

```bash
# Clean and reinstall
npm run clean
rm -rf node_modules
npm install
```

## Next Steps

Now that you have the platform running:

1. **Explore the API docs**: http://localhost:3000/api/docs
2. **Review the database schema**: [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)
3. **Check the project roadmap**: See README.md
4. **Start building features**: Follow the architecture in each app

## Key Development Resources

- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **React Native Docs**: https://reactnative.dev
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Connect**: https://stripe.com/docs/connect

## Need Help?

- Check the main [README.md](README.md)
- Review the [architecture documentation](docs/)
- Ask in the team Slack channel

Happy coding!
