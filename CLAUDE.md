# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DryJets is a three-sided marketplace platform for the dry cleaning and laundry industry, connecting customers, merchants (laundromats/dry cleaners), and drivers. Think "Uber Eats for dry cleaning" with advanced merchant features including IoT equipment monitoring.

**Current Status:** 60% complete, focusing on cloud-first dual-interface web application for 6-8 week MVP launch.

**Recent Major Changes (Nov 2025):**
- ✅ Migrated to Supabase PostgreSQL (connection pooling + direct connection)
- ✅ Order ID system overhaul: BigInt IDs with shortCode (DJ-1234 format) for easy reference
- ✅ Removed offline-first code and dependencies (packages/storage, dexie)
- 🎨 Creating laundry-themed UI component system (in progress)

## Tech Stack

- **Monorepo:** Turborepo with npm workspaces
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Mobile:** React Native with Expo (SDK 54)
- **Real-time:** Socket.io
- **State:** Zustand + TanStack Query
- **Payments:** Stripe Connect
- **Maps:** Google Maps API
- **AI:** Anthropic Claude (for marketing automation)

## Common Commands

### Development

```bash
# Install dependencies (from root)
npm install

# Start all apps in development
npm run dev

# Start specific workspace
npm run dev --workspace=@dryjets/api          # API on port 3000
npm run dev --workspace=@dryjets/web-merchant # Merchant portal on port 3002
npm run dev --workspace=@dryjets/mobile-customer # Customer mobile app

# Build all apps
npm run build

# Build specific workspace
npm run build --workspace=@dryjets/api

# Type checking
npm run type-check

# Linting & formatting
npm run lint
npm run format
```

### Database Operations

**IMPORTANT:** We use Supabase PostgreSQL with both connection pooling (for app) and direct connection (for migrations).

```bash
# Navigate to database package
cd packages/database

# Generate Prisma client (required after schema changes)
npm run db:generate

# Create and apply migration (uses DIRECT_DATABASE_URL)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Push schema without migration (dev only - use sparingly)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database
npm run db:seed
```

**Note:** Migrations use the direct connection URL for stability. The app runtime uses connection pooling.

### Testing

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=@dryjets/api

# Run tests with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Mobile Development

```bash
cd apps/mobile-customer  # or apps/mobile-driver

# Start Expo dev server
npm run dev

# Start with cache cleared
npm run dev -- --clear

# iOS simulator
npm run ios

# Android emulator
npm run android

# Reset project (clears cache, reinstalls deps)
npm run reset-project
```

## Architecture

### Monorepo Structure

```
apps/
├── api/                    # NestJS backend API (port 3000)
├── web-merchant/           # Next.js merchant portal (port 3002)
├── web-platform/           # Next.js marketing site
├── web-customer/           # Next.js customer portal
├── mobile-customer/        # React Native customer app
├── mobile-driver/          # React Native driver app
├── marketing-admin/        # Marketing automation admin
└── desktop/                # Electron app (future)

packages/
├── database/               # Prisma schema, migrations, seed data
├── types/                  # Shared TypeScript types
├── ui/                     # Shared React component library (51 components)
├── config/                 # Shared configs (ESLint, Tailwind, etc.)
├── utils/                  # Shared utilities
├── hooks/                  # Shared React hooks
└── storage/                # Storage abstraction layer
```

### Backend Module Structure

The NestJS API follows modular architecture:

```
apps/api/src/modules/
├── auth/                   # JWT authentication, role-based access
├── merchants/              # Merchant operations, multi-location support
├── drivers/                # Driver management, auto-assignment
├── orders/                 # Order lifecycle, status management
├── iot/                    # Equipment telemetry, health scoring
├── business-accounts/      # Business customers, recurring orders
├── enterprise/             # Enterprise accounts with branches
├── invoices/               # Billing and invoicing
├── marketing/              # AI-powered marketing automation
└── events/                 # WebSocket gateway for real-time updates
```

### Key Design Patterns

**Authentication Flow:**
- JWT tokens with refresh tokens
- Multi-role support (CUSTOMER, DRIVER, MERCHANT, ADMIN, ENTERPRISE)
- Role-Based Access Control (RBAC) via `@Permissions()` decorator
- Use `@CurrentUser()` decorator to access authenticated user

**Multi-tenancy:**
- Enterprise accounts with branches
- Location-based service areas
- Merchant-specific settings and branding

**Real-time Updates:**
- Socket.io gateway at `apps/api/src/modules/events/events.gateway.ts`
- Room-based architecture (order rooms, merchant rooms)
- Events: `order:created`, `order:statusChanged`, `driver:locationUpdate`

**Offline-First (Planned):**
- Dexie.js for IndexedDB (merchant portal)
- Background sync when online
- Optimistic UI updates

## Database Schema

The database uses a comprehensive multi-tenant schema with 30+ models hosted on **Supabase PostgreSQL**.

### Key Entities:

- **User** - Multi-role authentication
- **Customer/Driver/Merchant** - Role-specific profiles
- **Order** - Complete order lifecycle with status tracking
  - **NEW:** Uses BigInt ID for auto-incrementing order numbers
  - **NEW:** Includes `shortCode` field (DJ-1234 format) for easy customer reference
  - Supports searching by shortCode, orderNumber, or BigInt ID
- **Equipment** - IoT-enabled equipment monitoring
- **Telemetry** - Real-time equipment data (power, temperature, vibration)
- **BusinessAccount** - Corporate customers with team management
- **EnterpriseAccount** - Multi-branch enterprise customers
- **Invoice** - Billing and invoicing
- **MarketingCampaign** - AI-powered campaign management

### Order ID System:

Orders use a dual-identifier system:
1. **BigInt ID** (`id`): Auto-incrementing primary key for database relations
2. **Short Code** (`shortCode`): Customer-friendly reference like "DJ-1234"
3. **Order Number** (`orderNumber`): Full unique CUID for internal tracking

Example:
```typescript
// Generate short code from order ID
import { generateOrderShortCode } from '@dryjets/utils/order-code';

const orderId = 1234567n;
const shortCode = generateOrderShortCode(orderId); // "DJ-7567"
```

**Important:** Always run `npm run db:generate` from `packages/database` after schema changes to regenerate the Prisma client.

## IoT Equipment Monitoring

The platform includes real-time equipment monitoring:

- **Health Scoring:** Automated equipment health calculation (0-100 scale)
- **Telemetry:** Real-time metrics (power usage, temperature, vibration, water flow)
- **Predictive Maintenance:** ML-based maintenance alerts
- **Resource Optimization:** Usage pattern analysis

Test IoT telemetry with: `./scripts/test-iot-simple.sh`

## Important Development Notes

### Mobile Apps (React Native)

- **Expo SDK:** Using SDK 54 (latest stable)
- **No Expo Go for complex features:** Maps, payment, and advanced features require development builds
- **Monorepo isolation:** React Native packages use `nohoist` in root `package.json` to avoid hoisting issues
- **Metro config:** Custom metro config handles monorepo paths
- **Common issues:** See `docs/10-troubleshooting/` for fixes

### API Development

- **Validation:** Use `class-validator` decorators in DTOs
- **Swagger:** API docs auto-generated at `http://localhost:3000/api/docs`
- **Error handling:** Use NestJS exception filters
- **Testing:** Write unit tests with Jest, use Supertest for integration tests

### Frontend Development

- **Component Library:** 51 pre-built components in `packages/ui`
- **Design System:** Deep Tech Blue (#0A78FF) primary, Teal (#00B7A5) success
- **Dark Mode:** Full support via `next-themes`
- **Forms:** Use `react-hook-form` + `zod` for validation
- **API Calls:** Use TanStack Query for data fetching
- **State:** Zustand for global state

### Environment Variables

Each app requires environment configuration:

```bash
# Root .env (database) - SUPABASE
DATABASE_URL="postgresql://postgres.qehmkzswoevocrvrssuc:ADpTuJKj3qGWI8Rl@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
DIRECT_DATABASE_URL="postgresql://postgres:ADpTuJKj3qGWI8Rl@db.qehmkzswoevocrvrssuc.supabase.co:5432/postgres"

# apps/api/.env
JWT_SECRET="..."
STRIPE_SECRET_KEY="..."
GOOGLE_MAPS_API_KEY="..."
SENDGRID_API_KEY="..."
TWILIO_ACCOUNT_SID="..."
ANTHROPIC_API_KEY="..."

# apps/web-merchant/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
```

**Note:** `DATABASE_URL` uses connection pooling (Supavisor) for app runtime. `DIRECT_DATABASE_URL` bypasses pooling for migrations.

## Current Implementation Focus (MVP Phase)

Per `MASTER_PLAN.md`, the team is building a cloud-first web application with these priorities:

**Phase 1 (Weeks 1-2):** Merchant portal completion
- Equipment management API + UI
- Staff management with RBAC
- Dashboard with real-time KPIs
- Driver portal (NEW web interface)

**Phase 2 (Weeks 3-4):** Google Maps + Real-time
- Maps integration (all portals)
- Socket.io real-time updates
- Live order tracking

**Phase 3 (Weeks 5-6):** Customer interface + Payments
- Simple order placement web interface
- Stripe payment processing
- Order tracking page

**Phase 4 (Weeks 7-8):** Polish + Deploy
- Email/SMS notifications
- Production deployment
- Demo preparation

## Documentation Structure

Comprehensive docs in `/docs` organized by category:

- `00-quick-start/` - Getting started guides
- `01-setup/` - Setup and configuration
- `02-architecture/` - Architecture decisions
- `03-mobile-customer/` - Customer app docs
- `04-merchant-portal/` - Merchant portal docs
- `05-backend-api/` - API documentation
- `06-features/` - Feature-specific guides
- `07-project-status/` - Progress reports
- `08-future-plans/` - Future enhancements
- `10-troubleshooting/` - Common issues and fixes

Always check relevant docs before implementing features.

## Testing Strategy

- **Unit Tests:** All business logic in services
- **Integration Tests:** API endpoints with Supertest
- **E2E Tests:** Critical user flows (future)
- **Component Tests:** Storybook for UI components

The merchant portal includes Storybook:
```bash
cd apps/web-merchant
npm run storybook  # Opens on port 6006
```

## Code Quality Standards

- **TypeScript:** Strict mode enabled, no `any` types
- **ESLint:** Shared config in `packages/config`
- **Prettier:** Automatic formatting
- **Conventional Commits:** Required for all commits
- **Code Reviews:** All PRs require review

## Third-Party Services

- **Stripe:** Payment processing and Connect for marketplace
- **Google Maps:** Location services, geocoding, directions
- **SendGrid:** Transactional emails
- **Twilio:** SMS notifications
- **Anthropic Claude:** Marketing content generation
- **Firebase:** Push notifications (mobile)

## Deployment

- **Frontend:** Vercel (auto-deploy from main branch)
- **Backend:** Railway or Render
- **Database:** Supabase or Railway (managed PostgreSQL)
- **File Storage:** AWS S3 or Cloudflare R2

## Performance Considerations

- **API Response Times:** Target < 200ms
- **Page Load Times:** Target < 2 seconds
- **Real-time Latency:** Target < 500ms for Socket.io events
- **Database Queries:** Use Prisma relations efficiently, avoid N+1 queries
- **Caching:** Redis for frequently accessed data (future)

## Security Best Practices

- **Authentication:** JWT with short expiration + refresh tokens
- **Authorization:** RBAC with permission guards
- **API Security:** Rate limiting via `@nestjs/throttler`
- **Input Validation:** Validate all DTOs with `class-validator`
- **SQL Injection:** Prevented by Prisma's parameterized queries
- **XSS Protection:** React's built-in escaping
- **HTTPS:** Required in production
- **Environment Variables:** Never commit secrets

## Troubleshooting

Common issues and solutions documented in `docs/10-troubleshooting/`:

- **Metro bundler cache issues:** Run `npm run dev -- --clear`
- **Prisma client out of sync:** Run `npm run db:generate` in `packages/database`
- **Module resolution errors:** Check `tsconfig.json` paths and symlinks
- **Monorepo native module issues:** Verify `nohoist` configuration in root `package.json`
- **Hermes compatibility:** See `HERMES_FIX_GUIDE.md`

## Getting Help

- **Documentation:** Check `/docs` directory first
- **Issues:** Report bugs via GitHub issues
- **Master Plan:** See `MASTER_PLAN.md` for current roadmap
- **Repo Structure:** See `REPO_STRUCTURE.md` for navigation

## Important Files

- `MASTER_PLAN.md` - Current implementation roadmap and priorities
- `CLEANUP_SUMMARY.md` - **NEW:** Recent architectural changes and migration guide
- `REPO_STRUCTURE.md` - Detailed repository organization
- `package.json` - Root workspace configuration
- `turbo.json` - Turborepo build configuration
- `packages/database/prisma/schema.prisma` - Database schema (Supabase PostgreSQL)
- `packages/utils/order-code.ts` - **NEW:** Order short code utilities
- `apps/api/src/app.module.ts` - Main API module
- `apps/web-merchant/src/app` - Merchant portal pages (Next.js App Router)

## Recent Architectural Changes

### Removed Packages/Features:
- ❌ `packages/storage` - Offline storage abstraction (removed)
- ❌ `dexie` dependency - IndexedDB library (removed)
- ❌ Offline-first code and components (removed)

### Added Features:
- ✅ Supabase PostgreSQL integration
- ✅ BigInt order IDs with shortCode system (DJ-1234)
- ✅ Order code utility functions
- 🎨 Laundry-themed UI component system (in progress)

## Laundry-Themed Design System

DryJets features a unique "laundry world" UI where components resemble dry cleaning products:
- **Buttons:** Shaped like detergent bottles, washing machine drums, bleach bottles
- **Progress bars:** Clotheslines filling with clean items
- **Spinners:** Washing machine drums rotating
- **Icons:** Laundry baskets, hangers, soap bubbles
- **Colors:** Clean blues, fresh teals, sunshine yellows
- **Micro-interactions:** Sparkles, bubbles, steam effects

See `CLEANUP_SUMMARY.md` for complete design system specifications.

## Notes for AI Assistants

- **Error Handling Context:** When investigating code, focus on testing its response and capability rather than just finding bugs
- **Plan Awareness:** Keep context from user instructions about sub-agents, MCPs, Google Maps integration plans
- **Cleanup Plan:** Refer to `CLEANUP_SUMMARY.md` for recent architectural changes
- **Component Reuse:** Always check `packages/ui` before creating new UI components
- **API Patterns:** Follow existing patterns in `apps/api/src/modules/` for consistency
- **Type Safety:** Leverage shared types from `packages/types`
- **BigInt Handling:** Remember to serialize BigInt as string for JSON responses
- **Offline Code:** No longer supported - removed from codebase
- **Supabase:** Primary database - use connection pooling for app, direct connection for migrations
