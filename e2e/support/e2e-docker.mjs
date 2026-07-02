/**
 * Entry point for `pnpm e2e`: runs the Dockerised suite with `PLAYWRIGHT_VERSION`
 * derived from the installed `@playwright/test`, so the image tag interpolated in
 * `docker-compose.e2e.yml` always matches the version the suite runs with and the
 * two can never drift apart.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let version;
try {
  ({ version } = require('@playwright/test/package.json'));
} catch {
  console.error('Could not resolve @playwright/test — run `pnpm install` first.');
  process.exit(1);
}

const { status } = spawnSync('docker', ['compose', '-f', 'docker-compose.e2e.yml', 'run', '--rm', 'e2e'], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_VERSION: version },
});

process.exit(status ?? 1);
