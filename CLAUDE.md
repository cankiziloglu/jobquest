# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
JobQuest is a minimalist job application tracker for software developers. Users can track job applications through stages (WISHLIST → APPLIED → INTERVIEW → OFFER/REJECTED), manage notes, and view jobs in table or kanban views.

## Tech Stack

- **Framework**: Next.js 15.5.3 with App Router + Turbopack
- **React**: 19.1.0 with TypeScript 5.x
- **Styling**: Tailwind CSS 4.x + shadcn/ui (New York variant)
- **Forms**: React Hook Form + Zod validation
- **Database**: PostgreSQL (Neon.tech) via Prisma 6.16.2
- **Authentication**: Clerk 6.32.0
- **Tables**: TanStack Table 8.21.3
- **Package Manager**: pnpm

## Architecture

### Directory Structure

- `/app` - Next.js App Router with route groups
  - `(private)/` - Protected routes: `/dashboard`, `/jobs`, `/kanban`
  - `(public)/` - Public routes: `/`, `/sign-in`, `/sign-up`
- `/components` - Reusable UI components (shadcn/ui in `ui/`)
- `/server/actions.ts` - All CRUD operations as Next.js Server Actions
- `/lib` - Utilities, schemas, types, and generated Prisma client
  - `auth.ts` - `requireUserId()` and `requireUserIdStrict()` helpers
  - `schemas.ts` - Zod validation schemas
  - `utils.ts` - `cn()` utility for className merging
  - `generated/prisma/` - Custom Prisma client output path
- `/prisma/schema.prisma` - Database schema
- `/scripts` - Seed and verification scripts

### Authentication

- **Middleware** (`middleware.ts`) protects routes: `/jobs`, `/kanban`, `/dashboard`
- **Auth Helpers** (`lib/auth.ts`):
  - `requireUserId()` - Redirects to sign-in if not authenticated
  - `requireUserIdStrict()` - Throws error if not authenticated (use in server actions)
- **Theming**: Clerk components styled with shadcn theme in `components/clerk-provider.tsx`
- **User Scoping**: All database queries filtered by Clerk `userId` (string field, not FK)

### Data Model

**Job** - Main entity with status progression:
- Status enum: `WISHLIST` → `APPLIED` → `INTERVIEW` → `OFFER` | `REJECTED`
- Fields: `title`, `company`, `description`, `location`, `salary`, `jobUrl`, `workArrangement` (REMOTE/ON_SITE/HYBRID)
- One-to-many relationship with `Note`

**Note** - Text notes attached to jobs:
- Foreign key `jobId` with cascade delete
- Simple `content` field

**Import Prisma client from**: `@/lib/generated/prisma` (custom output path)

### Server Actions Pattern

All database operations in `/server/actions.ts`:
- Use `requireUserIdStrict()` from `lib/auth.ts` for authentication
- Validate all inputs with Zod schemas before DB operations
- Verify resource ownership before updates/deletes
- Call `revalidatePath()` after mutations for UI updates
- Support both individual operations and bulk updates (e.g., kanban status changes)

## Key Patterns

### Server/Client Component Split
- **Server Components**: Data fetching, auth checks (e.g., `page.tsx`)
- **Client Components**: Interactivity, forms, state (e.g., `*-client.tsx`)
- Use `'use server'` directive for server actions, `'use client'` for client components

### Form Validation
- Define Zod schemas in `lib/schemas.ts`
- Use React Hook Form with `@hookform/resolvers/zod`
- Validate on both client (UX) and server (security)
- Transform empty strings to undefined, trim values

### Component Patterns
- shadcn/ui components in `components/ui/`
- Use `cn()` utility for conditional className merging
- TanStack Table for data tables with sortable/filterable columns
- Dialog components for modals (job creation, editing, details)

### Styling
- OKLCH color space with zinc palette
- Dark mode via `next-themes` with system preference detection
- CSS variables for theming
- Geist Sans/Mono fonts with CSS variables

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Build
pnpm build            # Production build with Turbopack
pnpm start            # Start production server

# Database
npx prisma generate   # Generate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio     # Open database GUI
pnpm seed             # Seed database with sample data

# Note: No lint/test scripts configured
```

## When Adding Features

1. **New protected routes**: Add pattern to `middleware.ts` `isProtectedRoute` matcher
2. **Database changes**:
   - Update `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name <description>`
   - Run `npx prisma generate`
3. **New server actions**: Add to `server/actions.ts` with `requireUserIdStrict()` auth check
4. **New forms**:
   - Create Zod schema in `lib/schemas.ts`
   - Use React Hook Form with Zod resolver
   - Validate on client and server
5. **UI components**: Use shadcn/ui patterns, follow New York variant style
6. **Data tables**: Use TanStack Table v8 with shadcn DataTable component

## Code Conventions

- **Quotes**: Single quotes for strings
- **Naming**: PascalCase for components, kebab-case for files
- **Imports**: External packages → internal modules → types
- **Path alias**: `@/*` points to project root
