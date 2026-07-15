import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const distSchematicsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  'dist',
  'ngx-fast-marquee',
  'schematics'
);
const migrationsPath = join(distSchematicsDir, 'migrations.json');

describe('ng-update migration collection', () => {
  it('resolves the empty collection without error and exposes zero migrations', () => {
    const runner = new SchematicTestRunner('migrations', migrationsPath);

    expect(runner.engine.createCollection('migrations').listSchematicNames()).toEqual([]);
  });
});
