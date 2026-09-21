import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3219', browserName: 'chromium' },
  webServer: {
    command: 'corepack pnpm start --port 3219',
    url: 'http://127.0.0.1:3219',
    reuseExistingServer: false,
  },
});
