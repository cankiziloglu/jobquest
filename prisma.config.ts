import { defineConfig } from 'prisma/config';

// Load .env (local dev) if present; CI/production provide DATABASE_URL directly.
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // Placeholder lets `prisma generate` run without a database (e.g. in CI builds)
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
