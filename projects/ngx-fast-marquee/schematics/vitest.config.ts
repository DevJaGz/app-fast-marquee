import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  cacheDir: fileURLToPath(new URL('../../../.angular/cache/vitest-schematics', import.meta.url)),
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.spec.ts'],
  },
});
