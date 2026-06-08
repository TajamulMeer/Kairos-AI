# AIRIX AI — India's Most Intelligent NEET Preparation Platform

AIRIX AI is an AI-powered mobile platform built to help Indian students prepare for the NEET (National Eligibility cum Entrance Test) examination. It combines adaptive learning algorithms, large language model tutoring, personalized study plans, and detailed performance analytics into a single cohesive product.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

AIRIX AI targets NEET aspirants across India with a mobile-first experience. The platform delivers:

- Adaptive question banks covering Physics, Chemistry, and Biology
- An AI tutor capable of explaining concepts, solving doubts, and generating practice problems
- Full-length mock tests with NEET-pattern scoring (+4 / -1)
- Spaced-repetition flashcards and revision schedules
- Detailed analytics dashboards for students, parents, and educators
- Subscription-based monetization via Razorpay

---

## Key Features

| Feature | Description |
|---|---|
| AI Tutor | Conversational doubt resolution powered by GPT-4 / Claude with subject-aware context |
| Adaptive Tests | Question difficulty adjusts dynamically based on student performance |
| Mock Exams | Full 200-question NEET-pattern exams with auto-grading and solutions |
| Performance Analytics | Chapter-wise accuracy, time-per-question heatmaps, rank projections |
| Spaced Repetition | Flashcard engine using SM-2 algorithm for long-term retention |
| Study Planner | AI-generated personalized daily/weekly study schedules |
| Leaderboards | Peer ranking within batches, cities, and nationally |
| Offline Mode | Downloaded content and tests accessible without internet |
| Push Notifications | Study reminders, test alerts, and streak nudges via Firebase |
| Payments | Subscription plans and one-time purchases via Razorpay |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                        │
│              (Expo + TypeScript + Zustand)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                    NestJS REST API                          │
│           (TypeScript + TypeORM + Bull queues)              │
├──────────────┬──────────────────────────────────────────────┤
│   PostgreSQL │  Redis (cache + queues + sessions)           │
│   (primary   │                                              │
│    data)     │                                              │
└──────────────┴──────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼────┐     ┌─────▼────┐
    │ OpenAI  │      │ Anthropic│     │ Google AI│
    │  GPT-4  │      │  Claude  │     │  Gemini  │
    └─────────┘      └──────────┘     └──────────┘
```

The backend is a single NestJS application organised into domain modules. A provider-agnostic AI service layer abstracts over OpenAI, Anthropic, and Google AI, with automatic fallback on provider errors. Background jobs (report generation, email delivery, AI pre-computation) run through Bull on Redis.

---

## Monorepo Structure

```
airix-ai/
├── apps/
│   ├── backend/          # NestJS REST API
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules (auth, questions, ai, payments …)
│   │   │   ├── common/   # Guards, pipes, interceptors, decorators
│   │   │   ├── config/   # Configuration service
│   │   │   └── main.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── init/     # Docker init SQL
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── mobile/           # React Native (Expo) app
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── store/    # Zustand state slices
│       │   ├── services/ # API client, local storage
│       │   ├── hooks/
│       │   └── utils/
│       ├── assets/
│       ├── app.json
│       └── package.json
├── packages/
│   ├── shared-types/     # DTOs and interfaces shared between apps
│   ├── ui-components/    # Reusable React Native component library
│   └── utils/            # Pure utility functions (validators, formatters)
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose (+ Adminer)
├── .env.example
├── package.json              # Root workspace manifest
└── README.md
```

---

## Tech Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **ORM:** TypeORM with PostgreSQL 16
- **Cache / Queues:** Redis 7 + Bull
- **Auth:** JWT (access + refresh tokens) + Firebase Admin for OTP
- **File Storage:** AWS S3
- **Email:** SendGrid
- **SMS / OTP:** Twilio
- **Payments:** Razorpay
- **AI:** OpenAI, Anthropic Claude, Google Gemini (via provider abstraction)
- **Monitoring:** Sentry, Mixpanel

### Mobile
- **Framework:** React Native via Expo SDK 51
- **Language:** TypeScript
- **State:** Zustand + React Query
- **Navigation:** Expo Router (file-based)
- **UI:** Custom component library (packages/ui-components)
- **Storage:** Expo SecureStore + SQLite (offline)
- **Push:** Firebase Cloud Messaging

### Infrastructure
- **Containers:** Docker + Docker Compose
- **Database:** PostgreSQL 16 (Alpine)
- **Cache:** Redis 7 (Alpine)
- **CI/CD:** GitHub Actions

---

## Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 20.0.0 |
| npm | 10.0.0 |
| Docker | 24.0 |
| Docker Compose | 2.20 |
| Git | 2.40 |

For mobile development you also need:
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (Android emulator) or Xcode (iOS simulator, macOS only)
- Expo Go app on a physical device (optional)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/airix-ai.git
cd airix-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in the required values
```

At minimum, for local development you need the database and Redis values already pre-filled in `.env.example`. All external service keys (Firebase, AWS, Razorpay, AI providers) can be added later.

### 4. Start infrastructure services

```bash
npm run docker:up
# Starts PostgreSQL, Redis, and Adminer
# Adminer is available at http://localhost:8080
```

### 5. Run database migrations and seeds

```bash
npm run db:migrate
npm run db:seed
```

### 6. Start development servers

```bash
# Both backend and mobile in parallel
npm run dev

# Backend only
npm run dev:backend

# Mobile only
npm run dev:mobile
```

The backend API will be available at `http://localhost:3000`.
The Expo dev server will open a QR code for scanning with Expo Go.

---

## Environment Variables

See `.env.example` for the full list with descriptions. Key groups:

| Group | Variables |
|---|---|
| App | `NODE_ENV`, `PORT`, `APP_URL` |
| Database | `DATABASE_URL`, `POSTGRES_*` |
| Redis | `REDIS_URL`, `REDIS_PASSWORD` |
| Auth | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_*_EXPIRES_IN` |
| Firebase | `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` |
| AWS | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` |
| AI | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY` |
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| Notifications | `SENDGRID_API_KEY`, `TWILIO_*` |

Never commit a `.env` file containing real secrets. The `.gitignore` excludes all `*.env` and `.env.*` files.

---

## Development Workflow

### Branch strategy

```
main          — production-ready code
develop       — integration branch
feature/*     — individual features
fix/*         — bug fixes
release/*     — release preparation
```

### Commit convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add OTP login via Firebase
fix(questions): correct negative marking calculation
chore(deps): upgrade NestJS to 10.3
docs(readme): update environment variable table
```

Commitlint enforces this format via a pre-commit hook installed by Husky.

### Code style

Prettier and ESLint are configured at the root and applied to all workspaces. Run the formatter manually:

```bash
npm run lint        # lint all workspaces
npx prettier --write .  # format everything
```

Lint-staged automatically formats staged files on commit.

---

## Database

PostgreSQL 16 is the primary data store. TypeORM manages the schema through migrations.

### Useful commands

```bash
# Run all pending migrations
npm run db:migrate

# Generate a new migration from entity changes
npm run migration:generate --workspace=apps/backend -- -n MigrationName

# Revert the last migration
npm run migration:revert --workspace=apps/backend

# Seed the database with test data
npm run db:seed
```

### Database GUI

Adminer runs at `http://localhost:8080` when using the dev Docker Compose stack.

- System: PostgreSQL
- Server: `postgres`
- Username: `airix_user`
- Password: `airix_dev_password`
- Database: `airix_db_dev`

---

## AI Integration

The backend exposes a provider-agnostic `AiService` that wraps OpenAI, Anthropic Claude, and Google Gemini. Provider selection is controlled by `AI_DEFAULT_PROVIDER` and `AI_FALLBACK_PROVIDER` environment variables.

Key AI features:

- **Doubt resolution** — students submit a question or image; the AI responds with a step-by-step explanation
- **Question generation** — generates new NEET-pattern MCQs for a given chapter and difficulty
- **Performance insights** — summarises a student's weak areas and recommends a study plan
- **Hint system** — provides progressive hints without giving away the full answer

Rate limiting and token usage are tracked per user to prevent abuse and control costs.

---

## Testing

```bash
# Run all tests across all workspaces
npm run test

# Run tests for a specific workspace
npm run test --workspace=apps/backend

# Run with coverage
npm run test:cov --workspace=apps/backend
```

The backend uses Jest with supertest for integration tests. The mobile app uses Jest with React Native Testing Library.

---

## Deployment

### Production Docker Compose

```bash
# Build and start all production services
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### Environment checklist before production deploy

- [ ] All `*_SECRET` and `*_KEY` values replaced with strong random values
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are at least 64 characters
- [ ] `ENCRYPTION_KEY` is exactly 32 characters
- [ ] Postgres and Redis are not exposed on public interfaces
- [ ] Sentry DSN configured for error tracking
- [ ] Firebase project set to production credentials

---

## Contributing

1. Fork the repository and create a feature branch from `develop`
2. Install dependencies and ensure all tests pass locally
3. Write tests for new functionality
4. Submit a pull request targeting `develop` with a clear description

For major architectural changes, open an issue first to discuss the approach before submitting a PR.

---

## License

Proprietary — All rights reserved. Unauthorized copying, distribution, or modification of this software is strictly prohibited.
