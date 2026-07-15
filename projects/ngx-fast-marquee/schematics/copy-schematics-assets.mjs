/**
 * Copies the schematics collection/schema JSON files into the compiled dist output.
 * `tsc` only emits `.js`; ng-packagr never sees this directory. Runs after the
 * schematics `tsc` step in `build:lib`. Node (not shell) so it behaves identically
 * on Windows and in CI.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const schematicsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(schematicsDir, '..', '..', '..');
const outDir = join(repoRoot, 'dist', 'ngx-fast-marquee', 'schematics');

const assets = ['collection.json', 'migrations.json', join('ng-add', 'schema.json')];

for (const asset of assets) {
  const from = join(schematicsDir, asset);
  const to = join(outDir, asset);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
