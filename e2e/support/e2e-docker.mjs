/**
 * Entry point for `npm run e2e`: runs the Dockerised suite with `PLAYWRIGHT_VERSION`
 * derived from the installed `@playwright/test`, so the image tag interpolated in
 * `docker-compose.e2e.yml` always matches the version the suite runs with and the
 * two can never drift apart. Brings up both the `app` (Node 14) and `playwright`
 * (modern Node) services and exits with the `playwright` service's exit code.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let version;
try {
  ({ version } = require('@playwright/test/package.json'));
} catch {
  console.error('Could not resolve @playwright/test — run `npm install` first.');
  process.exit(1);
}

const { status } = spawnSync(
  'docker',
  ['compose', '-f', 'docker-compose.e2e.yml', 'up', '--build', '--abort-on-container-exit', '--exit-code-from', 'playwright'],
  {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_VERSION: version },
  }
);

spawnSync('docker', ['compose', '-f', 'docker-compose.e2e.yml', 'down'], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_VERSION: version },
});

process.exit(status ?? 1);
