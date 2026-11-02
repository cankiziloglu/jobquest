# JobQuest

A modern, minimalist job application tracker built for software developers. JobQuest helps you organize your job search journey with an intuitive interface, tracking applications from wishlist to offer.

## Features

### For Job Seekers

- **Application Tracking**: Track jobs through five distinct stages:
  - 📋 **Wishlist** - Companies and positions you're interested in
  - 📤 **Applied** - Applications you've submitted
  - 💬 **Interview** - Active interview processes
  - ✅ **Offer** - Successful offers received
  - ❌ **Rejected** - Closed opportunities

- **Dual View Modes**:
  - **Table View** - Sortable, filterable data table with advanced search
  - **Kanban Board** - Drag-and-drop visual workflow management

- **Comprehensive Job Details**:
  - Company name and job title
  - Location and work arrangement (Remote/On-site/Hybrid)
  - Salary range tracking
  - Job description and URL
  - Application dates (created/updated timestamps)

- **Notes & Context**:
  - Attach unlimited notes to each job
  - Track interview feedback, follow-ups, and research

- **Dashboard Analytics**:
  - Application status distribution
  - Visual pipeline overview
  - Quick insights into your job search progress

- **Dark Mode Support**: System-aware theme switching for comfortable use

## Tech Stack

### Frontend

- **Next.js** - React framework with App Router and Turbopack
- **React** - Latest React with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with OKLCH color space
- **shadcn/ui** - Accessible, customizable component library (New York variant)
- **TanStack Table** - Powerful data table with sorting/filtering
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation

### Backend

- **Next.js Server Actions** - Type-safe server mutations
- **PostgreSQL** - Relational database hosted on Neon.tech
- **Prisma** - Type-safe ORM with migrations
- **Clerk** - Complete authentication solution with user management

## Architecture Highlights

### Server-First Design

- Server Components for data fetching and initial render
- Client Components only where interactivity is needed
- Server Actions for all mutations with built-in revalidation

### Security

- Route-level authentication via middleware
- User-scoped database queries (all data isolated by Clerk user ID)
- Server-side validation for all inputs
- Resource ownership verification on updates/deletes

### Type Safety

- End-to-end TypeScript coverage
- Prisma-generated types for database models
- Zod schemas for runtime validation
- React Hook Form integration for type-safe forms

### Performance

- React Server Components reduce client bundle size
- Automatic code splitting with App Router
- Optimistic UI updates with revalidation
- Turbopack for faster development builds

## Getting Started

### Prerequisites

- Node.js 22.x or later
- pnpm (install via `npm install -g pnpm`)
- PostgreSQL database (Neon.tech recommended)
- Clerk account for authentication

### Environment Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd jobquest
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory (use `.env.example` as reference):

### Database Setup

1. Generate Prisma Client:

```bash
npx prisma generate
```

2. Apply database migrations:

```bash
pnpm db:migrate
```

> Existing database created with `prisma db push` before migrations were added?
> Mark the initial migration as applied instead: `npx prisma migrate resolve --applied 0_init`

3. (Optional) Seed sample data for a Clerk user:

```bash
SEED_USER_ID=user_xxx pnpm seed
```

4. (Optional) View database in Prisma Studio:

```bash
npx prisma studio
```

### Development

Start the development server with Turbopack:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
pnpm build
pnpm start
```

## Testing

```bash
pnpm test:unit          # schemas, auth helpers, components (jsdom)
pnpm test:db:push       # create schema in the test DB from .env.test
pnpm test:integration   # server actions against a real Postgres
pnpm test:e2e           # Playwright, builds and starts the app
```

Copy `.env.test.example` to `.env.test`. Integration tests only need `DATABASE_URL`
(a throwaway local Postgres; tables are wiped between tests). E2E tests also need
Clerk **development** keys and `E2E_CLERK_USER_EMAIL`, an existing user in that
Clerk instance; sign-in uses `@clerk/testing` tokens, so no password/OTP is needed.
Set `E2E_BASE_URL` to run the e2e suite against a deployed URL.

## Deploying to Cloudflare Workers

The app runs on Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare).
Postgres (Neon) is reached over TCP with the `pg` driver; a Prisma client is created per
request because Workers can't reuse sockets across requests.

```bash
pnpm cf:preview   # build + run locally in workerd (secrets from .dev.vars)
pnpm cf:deploy    # build + deploy
```

One-time setup:

1. Authenticate Wrangler: set `CLOUDFLARE_API_TOKEN` (token with *Workers Scripts: Edit*)
   and `CLOUDFLARE_ACCOUNT_ID`, or run `npx wrangler login`.
2. Set runtime secrets:
   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put CLERK_SECRET_KEY
   ```
3. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is inlined at build time, so it must be in the
   environment (or `.env`) when running `pnpm cf:deploy`.
4. The Worker is served at `jobquest.cgk.dev` (custom domain in `wrangler.jsonc`). The
   production Clerk instance is bound to that domain and needs its DNS records in the
   `cgk.dev` zone (Clerk dashboard → Domains): `clerk`, `accounts`, `clkmail`,
   `clk._domainkey`, `clk2._domainkey` — all **DNS only** (not proxied).

Health check: `GET /api/health` returns `{ "ok": true, "db": "up" }`.

> `middleware.ts` is intentionally kept instead of Next 16's `proxy.ts`: OpenNext doesn't
> officially support Node.js-runtime middleware yet.

## Authentication Flow

1. Unauthenticated users land on public homepage
2. Clerk handles sign-up/sign-in (email verification code / OTP)
3. Middleware protects `/jobs`, `/kanban`, `/dashboard` routes
4. All database queries automatically scoped to authenticated user
5. User data completely isolated - no cross-user data access

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for your own job search or as a portfolio piece.

---

For deployed version please visit [https://jobquest.cgk.dev](https://jobquest.cgk.dev)

---

**Built with** Next.js, React, TypeScript, Tailwind CSS, Prisma, and Clerk • **Deployed on** Vercel
