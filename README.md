# Transit Line — Bus Travel Planning App

Full-stack bus route/schedule planner with a public passenger site, a
role-protected admin dashboard, and a versioned REST API built to be reused
by a future Android client.

## Stack

| Layer          | Choice                                   |
|----------------|-------------------------------------------|
| Frontend       | Next.js 14 (App Router)                   |
| State          | Redux Toolkit                             |
| Auth           | Auth.js (NextAuth, credentials + JWT)     |
| API            | Next.js Route Handlers, `/api/v1/*`, REST |
| Database       | PostgreSQL via Prisma                     |
| Validation     | Zod                                       |

## Getting started

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push        # create tables from prisma/schema.prisma
npm run prisma:seed       # creates an admin user + sample routes/trips
npm run dev
```

Generate a real `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

The seed script logs in as whatever `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
you set in `.env` (defaults to `admin@buslines.example` / `ChangeMe123!` —
change the password before deploying anywhere real).

## Project layout

```
prisma/schema.prisma        Route, Trip, Delay, User + Auth.js tables
prisma/seed.ts               Seeds an admin user and demo routes/trips
src/app/
  page.tsx                   Public homepage (live departure board)
  routes/                    Public route list + detail (search/filter)
  trips/[id]/                Public trip detail (stops, delay history)
  login/                     Credentials sign-in
  admin/                     Role-protected dashboard (routes/trips/delay CRUD)
  api/auth/[...nextauth]/    Auth.js handler
  api/v1/                    REST API (routes, trips, trips/:id/delay)
src/lib/
  auth.ts                    Auth.js config (credentials provider, JWT callbacks)
  rbac.ts                    requireAdmin() guard used by mutating API routes
  prisma.ts                  Prisma client singleton
  serialize.ts                Prisma model -> JSON DTO conversion
src/store/                   Redux Toolkit store + authSlice/routesSlice/tripsSlice
src/middleware.ts            Edge-level guard for /admin/*
```

## Roles

- **Passenger** (no account needed): browse `/routes`, search/filter, view
  trip detail and delay history.
- **Admin**: signs in at `/login`, gets a `role: ADMIN` JWT, and can manage
  routes/trips/delays at `/admin`. Both the edge `middleware.ts` and the
  server-rendered `admin/layout.tsx` check the role, and every mutating API
  route re-checks it server-side via `requireAdmin()` — the UI guard is not
  the only line of defense.

## REST API (`/api/v1`)

All responses share one envelope: `{ data, error?, meta? }`. This is what
makes the same fetch logic reusable from an Android client later — it never
needs endpoint-specific parsing.

| Method | Path                        | Auth        | Notes                                  |
|--------|-----------------------------|-------------|-----------------------------------------|
| GET    | `/api/v1/routes`            | Public      | `?q=` search, `?includeInactive=true`   |
| GET    | `/api/v1/routes/:id`        | Public      |                                          |
| POST   | `/api/v1/routes`            | Admin       |                                          |
| PUT    | `/api/v1/routes/:id`        | Admin       |                                          |
| DELETE | `/api/v1/routes/:id`        | Admin       | Soft-delete (deactivates, keeps history)|
| GET    | `/api/v1/trips`             | Public      | `?routeId=`, `?status=`, `?from=`,`?to=`|
| GET    | `/api/v1/trips/:id`         | Public      |                                          |
| POST   | `/api/v1/trips`              | Admin       |                                          |
| PUT    | `/api/v1/trips/:id`          | Admin       |                                          |
| DELETE | `/api/v1/trips/:id`          | Admin       | Soft-delete (cancels, keeps history)    |
| PATCH  | `/api/v1/trips/:id/delay`    | Admin       | `delayMinutes: 0` clears the delay      |

Auth for a future Android app: `POST /api/auth/callback/credentials` (Auth.js)
issues the same JWT-backed session used by the web app. For a pure mobile
client it's usually cleaner to add a small `/api/v1/auth/login` route that
returns a signed JWT directly — the `requireAdmin()` helper in `src/lib/rbac.ts`
is already isolated from the web session mechanics, so swapping or adding a
token-based check for mobile only touches that one file.

## Data model

- `Route`: name, origin, destination, distance, active flag
- `Trip`: belongs to a route; departure/arrival time, stops (string list),
  status (`SCHEDULED` / `ON_TIME` / `DELAYED` / `CANCELLED` / `COMPLETED`)
- `Delay`: belongs to a trip; minutes + reason + timestamp — kept as a full
  history, not just a single "current delay" field, so the trip detail page
  can show what happened over time

## Design notes

The passenger homepage's departure board is the one deliberate visual
signature (split-flap style, amber-on-ink, tabular numerals) — everything
else stays quiet (paper background, hairline dividers) so admin screens read
as plain working tools rather than competing for attention. Font tokens are
declared in `tailwind.config.js` (`font-display` / `font-body` / `font-board`)
with safe system fallbacks; wire up `next/font/google` in `layout.tsx` if you
want the exact Space Grotesk / IBM Plex Sans / JetBrains Mono pairing to load
for real.

## Future extensions

- **Android app**: reuse `/api/v1/*` as-is; add a mobile-friendly auth route
  as described above.
- **Real-time delays**: the `PATCH /trips/:id/delay` endpoint is the natural
  place to also emit a WebSocket/SSE event or trigger polling invalidation.
- **Multi-tenant**: add a `Company` model and a `companyId` foreign key to
  `Route`; scope every query in `api/v1/*` by the authenticated admin's
  company.
