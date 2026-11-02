import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { config } from 'dotenv';

config({ path: '.env.test', quiet: true });

if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => cleanup());
}
