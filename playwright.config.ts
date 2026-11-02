import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// override: .env.test must win over shell variables (e.g. production keys/DB)
config({ path: '.env.test', quiet: true, override: true });

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : undefined,
    // Optional: for sandboxes that only allow egress through an HTTPS proxy
    proxy: process.env.E2E_BROWSER_PROXY
      ? { server: process.env.E2E_BROWSER_PROXY, bypass: 'localhost,127.0.0.1' }
      : undefined,
    ignoreHTTPSErrors: process.env.E2E_IGNORE_HTTPS_ERRORS === '1',
  },
  projects: [
    { name: 'global setup', testMatch: /global\.setup\.ts/, teardown: 'global teardown' },
    { name: 'global teardown', testMatch: /global\.teardown\.ts/ },
    {
      name: 'public',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['global setup'],
    },
    {
      name: 'authenticated',
      testMatch: /app\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/user.json' },
      dependencies: ['global setup'],
    },
  ],
  // Skip starting a server when testing a deployed URL
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm build && pnpm start --port ${PORT}`,
        url: baseURL,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        env: { ...(process.env as Record<string, string>) },
      },
});
