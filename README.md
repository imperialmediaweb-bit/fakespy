# FakeSpy AI – Backend API

Production-grade backend for FakeSpy AI, an Ad Intelligence & Ad Generator SaaS platform.

## Tech Stack

- **Runtime**: Node.js 20+ / TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Auth**: JWT (access + refresh tokens)
- **Payments**: Stripe (subscriptions, webhooks)
- **AI**: OpenAI API (GPT-4o)
- **Validation**: Zod
- **Testing**: Vitest + Supertest

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Stripe account (for billing)
- OpenAI API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env
# Edit .env with your credentials

# 3. Start infrastructure (Docker)
docker-compose up -d postgres redis

# 4. Run database migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Seed the database
npm run prisma:seed

# 7. Start dev server
npm run dev
```

### Docker (full stack)

```bash
cp .env.example .env
# Edit .env
docker-compose up
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout (auth required) |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT tokens |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| GET | `/api/v1/auth/me` | Get current user profile |
| GET | `/api/v1/auth/verify-email/:token` | Verify email |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List user projects |
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects/:id` | Get project details |
| PATCH | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |
| GET | `/api/v1/projects/:id/analyses` | List project analyses |
| GET | `/api/v1/projects/:id/generations` | List project generations |

### Analyses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analyses` | Run new analysis |
| GET | `/api/v1/analyses/:id` | Get analysis results |
| POST | `/api/v1/analyses/:id/rerun` | Rerun analysis |

### Ad Generations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/generations` | Generate ads |
| GET | `/api/v1/generations/:id` | Get generation |

### Exports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/exports/project/:id` | Export project |
| GET | `/api/v1/exports` | List exports |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/create-checkout-session` | Start checkout |
| POST | `/api/v1/billing/create-portal-session` | Billing portal |
| GET | `/api/v1/billing/subscription` | Get subscription info |
| POST | `/api/v1/billing/webhook` | Stripe webhook |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings` | Get settings + usage |
| PATCH | `/api/v1/settings/profile` | Update profile |
| PATCH | `/api/v1/settings/password` | Change password |
| GET | `/api/v1/settings/api-keys` | List API keys |
| POST | `/api/v1/settings/api-keys` | Add API key |
| DELETE | `/api/v1/settings/api-keys/:id` | Delete API key |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List users |
| GET | `/api/v1/admin/subscriptions` | List subscriptions |
| GET | `/api/v1/admin/usage` | Usage statistics |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check (includes DB) |

## Architecture

```
src/
├── config/          # Environment config, plan definitions
├── lib/             # Database, Redis, Logger, Error classes
├── middleware/       # Auth, rate limiting, plan enforcement, error handling
├── modules/
│   ├── auth/        # Registration, login, JWT, password reset
│   ├── projects/    # CRUD for projects
│   ├── analyses/    # Intelligence analysis engine
│   ├── generations/ # AI ad generation with prompt builders
│   ├── exports/     # Project export (JSON, PDF-ready)
│   ├── billing/     # Stripe subscriptions & webhooks
│   ├── settings/    # User profile, password, API keys
│   ├── admin/       # Admin dashboard data
│   └── health/      # Health & readiness probes
├── providers/
│   ├── ai/          # AI provider abstraction (OpenAI, extensible)
│   └── intelligence/ # Intelligence provider abstraction
├── jobs/            # BullMQ queue setup
├── validators/      # Zod schemas
├── utils/           # Encryption, helpers
└── types/           # TypeScript declarations
```

## Subscription Plans

| Feature | Free | Pro | Agency |
|---------|------|-----|--------|
| Analyses/month | 3 | 30 | 200 |
| Generations/month | 10 | 100 | 1000 |
| Exports/month | 5 | 50 | 500 |
| Projects | 3 | 25 | Unlimited |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed database |
| `npm run prisma:studio` | Open Prisma Studio |

## Demo accounts & seeding (production)

`GET|POST /seed?secret=<SEED_SECRET>` creates the demo accounts. It is **disabled unless `SEED_SECRET` is set** (use a random string, never the JWT secret).

- The admin password is taken from `SEED_ADMIN_PASSWORD`, or generated and returned once in the response. Re-running the seed rotates it.
- Demo users (`demo@`, `pro@`, `agency@adxura.com`) are USER-role, quota-limited accounts intended for evaluation.

## SEO

- `robots.txt` is served from the frontend build; `sitemap.xml` is generated dynamically (marketing pages + published blog posts) and uses `FRONTEND_URL` as the canonical origin — set it to your public domain.
