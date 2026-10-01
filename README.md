# Expense Sharing App

A small full-stack expense-sharing application inspired by Splitwise. Users record who paid for whom, and the app shows the full expense history together with the **net balance** between every pair of users.

- **Live app:** <!-- TODO: add deployed frontend URL -->
- **API docs (Swagger):** <!-- TODO: add deployed backend URL -->/docs
- **API base URL:** <!-- TODO: add deployed backend URL -->/api

## Table of Contents

- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started (backend)](#getting-started-backend)
- [Getting started (frontend)](#getting-started-frontend)
- [API reference](#api-reference)
- [Design decisions](#design-decisions)
- [Manual test scenario](#manual-test-scenario)
- [Deployment](#deployment)

## How it works

An expense is a single **directional transaction**:

```
paidBy → paidFor → amount
Alice  → Bob     → $50     means: Bob owes Alice $50
```

Users are seeded beforehand (no authentication, registration, or user creation). The UI has one page with two views:

- **Expenses:** who paid, who the expense was for, amount, description, and date, newest first.
- **Balances:** the current net balance between users, e.g. `Bob owes Alice $30`.

Transactions between the same two users are **netted**, regardless of direction:

| Transaction | Effect |
|---|---|
| Alice → Bob → $50 | Bob owes Alice $50 |
| Bob → Alice → $20 | Bob owes Alice $30 (netted) |
| Bob → Alice → $30 | Settled, the pair disappears from balances |

## Tech stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeScript |
| Database | PostgreSQL via TypeORM |
| Validation | class-validator / class-transformer |
| Configuration | `@nestjs/config` with validated environment variables |
| API docs | Swagger (`@nestjs/swagger`) |
| Frontend | <!-- TODO: fill in frontend stack --> |

## Project structure

```
.
├── back-end/
│   └── src/
│       ├── common/          Shared building blocks (abstract entity, money transformer, DTOs)
│       ├── config/          Typed configuration, env validation, Swagger setup
│       ├── database/        TypeORM config/module, seeder and seed data
│       ├── users/           Users module (list / get user)
│       ├── expenses/        Expenses module (create / list with pagination)
│       ├── balances/        Balances module (net balances between users)
│       ├── app.module.ts
│       └── main.ts
└── front-end/               <!-- TODO: confirm folder name -->
```

Each feature is a self-contained NestJS module (module, controller, service, DTOs, entities). Modules depend on each other only through exported services.

## Getting started (backend)

### Prerequisites

- Node.js 20 or newer
- [pnpm](https://pnpm.io/)
- A running PostgreSQL instance

### 1. Create the database

```sql
CREATE DATABASE expense_sharing;
```

### 2. Install dependencies

```bash
cd back-end
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development`, `production` or `test` |
| `PORT` | no | `5000` | HTTP port |
| `DATABASE_HOST` | yes | | PostgreSQL host |
| `DATABASE_PORT` | no | `5432` | PostgreSQL port |
| `DATABASE_NAME` | yes | | Database name |
| `DATABASE_USERNAME` | yes | | Database user |
| `DATABASE_PASSWORD` | no | empty | Database password |

Environment variables are validated at startup. If something is missing or invalid, the app fails immediately with a clear message instead of failing later at runtime.

### 4. Run the app

```bash
pnpm start:dev
```

In development the schema is created and synchronized automatically from the entities, and SQL queries are logged.

### 5. Seed the database

The seeder inserts 8 users and 17 sample expenses (including opposite-direction transactions, a fully settled pair, and decimal amounts):

```bash
pnpm seed
```

The seeder is idempotent: running it again does not duplicate users, and expenses are only inserted when the table is empty. To wipe the expenses and re-seed them:

```bash
pnpm seed:fresh
```

The seed data lives in `back-end/src/database/data/seed.json`, so it can be edited without touching code.

### Useful URLs

| URL | Description |
|---|---|
| `http://localhost:5000/` | Landing page |
| `http://localhost:5000/docs` | Swagger UI |
| `http://localhost:5000/api/health` | Health check (also verifies the database connection) |

### Scripts

| Script | Description |
|---|---|
| `pnpm start:dev` | Run in watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start:prod` | Run the compiled app |
| `pnpm seed` | Seed users and sample expenses |
| `pnpm seed:fresh` | Remove expenses, then seed again (blocked in production) |
| `pnpm seed:prod` | Run the compiled seeder (`dist/`) |

## Getting started (frontend)

<!-- TODO: add frontend setup and run instructions -->

## API reference

All endpoints are prefixed with `/api`. Interactive documentation is available at `/docs`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get a single user |
| `GET` | `/api/expenses?page=1&limit=20` | List expenses, newest first (paginated) |
| `POST` | `/api/expenses` | Record a new expense |
| `GET` | `/api/balances` | Net balances between users |
| `GET` | `/api/health` | API and database health |

### Create an expense

`POST /api/expenses`

```json
{
  "paidById": 1,
  "paidForId": 2,
  "amount": 50,
  "description": "Dinner"
}
```

| Field | Rules |
|---|---|
| `paidById` | integer, must be an existing user (the person who paid) |
| `paidForId` | integer, must be an existing user and different from `paidById` (the person who owes) |
| `amount` | positive number in dollars, at most 2 decimal places, at most 1,000,000 |
| `description` | non-empty string after trimming, at most 255 characters |

Unknown fields are rejected. Responses:

- `201` the created expense, including the `paidBy` and `paidFor` users
- `400` validation error, or `paidById` equals `paidForId`
- `404` one of the users does not exist

### List expenses

`GET /api/expenses?page=1&limit=20` (`limit` max is 100)

```json
{
  "items": [
    {
      "id": 1,
      "amount": 50,
      "description": "Dinner",
      "createdAt": "2026-09-30T12:00:00.000Z",
      "paidById": 1,
      "paidForId": 2,
      "paidBy": { "id": 1, "name": "Alice", "createdAt": "..." },
      "paidFor": { "id": 2, "name": "Bob", "createdAt": "..." }
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### Net balances

`GET /api/balances`

```json
[
  {
    "debtor": { "id": 2, "name": "Bob" },
    "creditor": { "id": 1, "name": "Alice" },
    "amount": 30
  }
]
```

Read it as: **`debtor` owes `creditor` `amount`**. `amount` is always positive and settled pairs are omitted. Results are sorted by amount (largest first).

## Design decisions

**Balances are computed, not stored.** Expenses are the single source of truth. A stored balance column would have to be updated in the same transaction as every new expense, and any bug or partial failure would leave the two out of sync. Instead, `GET /api/balances` aggregates the expenses on demand. For the scale of this app that is fast, and it can never drift from the data.

**Netting happens in the database.** Each transaction is mapped to an ordered pair using `LEAST` / `GREATEST` on the user IDs, so `Alice → Bob` and `Bob → Alice` fall into the same `GROUP BY` bucket. A `CASE` expression signs each amount by direction, and the sum tells who owes whom. Only the (small) number of user pairs is sent to the application, which then resolves user names through `UsersService` and builds the response.

**Money is stored as integer cents.** Floating point cannot represent values like `0.1 + 0.2` exactly, and errors accumulate. Amounts are stored as `integer` cents and converted by a TypeORM `ValueTransformer`, so the API and the rest of the code work with plain dollar amounts. Input is limited to 2 decimal places and a maximum amount, so rounding never loses information.

**Business rules are enforced in two layers.** DTO validation gives clean `400` errors, and database constraints are the last line of defence: `amount > 0`, `paidById <> paidForId`, and foreign keys with `ON DELETE RESTRICT` so financial history cannot be deleted by removing a user. Indexes exist on both foreign keys.

**No caching.** The balances query is a cheap aggregate over an indexed table, and a cache would add invalidation logic, coupling between modules, and stale-data risk for no measurable gain.

**Pairwise netting, not debt simplification.** Balances show the net amount between each pair of users, as specified. Global debt simplification (turning `A→B→C` into `A→C`) is a different problem and was intentionally left out.

**Environment-aware database behaviour.** `synchronize` and SQL logging are enabled only in development. In any other environment auto-sync is disabled and migrations from `src/database/migrations` run on startup.

**Seeding is a separate script.** The seeder is not part of application startup. It creates the same Nest application context (same config, same DI) without starting the HTTP server, runs inside a single transaction, and is idempotent.

## Manual test scenario

After `pnpm seed:fresh`, `GET /api/balances` returns 12 balances (the pair Hadi / Nik-Aein is fully settled and therefore absent). Or start from an empty database and try this in Swagger:

| Step | Request | `GET /api/balances` afterwards |
|---|---|---|
| 1 | Alice → Bob → 50 | Bob owes Alice 50 |
| 2 | Bob → Alice → 20 | Bob owes Alice 30 |
| 3 | Bob → Alice → 30 | empty (settled) |
| 4 | Charlie → Alice → 12.5 | Alice owes Charlie 12.5 |

Error cases to try: same user on both sides (`400`), unknown user ID (`404`), amount `0`, negative, or `10.999` (`400`), an extra field such as `"id": 5` (`400`), whitespace-only description (`400`).

## Deployment

<!-- TODO: describe the deployment (platform, database, environment variables, migration/seed steps) once deployed -->
