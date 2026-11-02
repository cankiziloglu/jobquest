import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { config } from 'dotenv';

// override: .env.test must win over shell/CI variables (e.g. a production DATABASE_URL)
config({ path: '.env.test', quiet: true, override: true });

if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => cleanup());
}
