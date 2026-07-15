import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const distSchematicsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'dist',
  'ngx-fast-marquee',
  'schematics'
);
const collectionPath = join(distSchematicsDir, 'collection.json');

function angularJson(builder: string, options: Record<string, string>): string {
  return JSON.stringify({
    version: 1,
    projects: {
      app: {
        root: '',
        sourceRoot: 'src',
        projectType: 'application',
        architect: {
          build: { builder, options },
        },
      },
    },
  });
}

function createStandaloneAppTree(): Tree {
  const tree = Tree.empty();
  tree.create('/angular.json', angularJson('@angular-devkit/build-angular:application', { browser: 'src/main.ts' }));
  tree.create(
    '/src/main.ts',
    `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
`
  );
  tree.create(
    '/src/app/app.config.ts',
    `import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [],
};
`
  );
  return tree;
}

function createNgModuleAppTree(): Tree {
  const tree = Tree.empty();
  tree.create('/angular.json', angularJson('@angular-devkit/build-angular:browser', { main: 'src/main.ts' }));
  tree.create(
    '/src/main.ts',
    `import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule).catch((err) => console.error(err));
`
  );
  tree.create(
    '/src/app/app.module.ts',
    `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
`
  );
  return tree;
}

async function runNgAdd(
  tree: Tree,
  runner: SchematicTestRunner,
  options: { project?: string } = { project: 'app' }
): Promise<[UnitTestTree, string[]]> {
  const messages: string[] = [];
  const subscription = runner.logger.subscribe(entry => messages.push(entry.message));
  try {
    const result = await runner.runSchematic('ng-add', options, tree);
    return [result, messages];
  } finally {
    subscription.unsubscribe();
  }
}

describe('ng-add schematic', () => {
  it('adds provideFastMarquee() to a standalone application config', async () => {
    const runner = new SchematicTestRunner('ngx-fast-marquee', collectionPath);
    const [result] = await runNgAdd(createStandaloneAppTree(), runner);

    const content = result.readContent('/src/app/app.config.ts');
    expect(content).toContain("import { provideFastMarquee } from 'ngx-fast-marquee';");
    expect(content).toMatch(/providers:\s*\[provideFastMarquee\(\)\]/);
  });

  it('adds provideFastMarquee() to an NgModule root module', async () => {
    const runner = new SchematicTestRunner('ngx-fast-marquee', collectionPath);
    const [result] = await runNgAdd(createNgModuleAppTree(), runner);

    const content = result.readContent('/src/app/app.module.ts');
    expect(content).toContain("import { provideFastMarquee } from 'ngx-fast-marquee';");
    expect(content).toMatch(/providers:\s*\[\s*provideFastMarquee\(\)\s*\]/);
  });

  it('does not add a duplicate provider when one is already registered', async () => {
    const tree = createStandaloneAppTree();
    tree.overwrite(
      '/src/app/app.config.ts',
      `import { ApplicationConfig } from '@angular/core';
import { provideFastMarquee } from 'ngx-fast-marquee';

export const appConfig: ApplicationConfig = {
  providers: [provideFastMarquee()],
};
`
    );
    const originalContent = tree.readText('/src/app/app.config.ts');
    const runner = new SchematicTestRunner('ngx-fast-marquee', collectionPath);
    const [result, messages] = await runNgAdd(tree, runner);

    expect(result.readContent('/src/app/app.config.ts')).toBe(originalContent);
    expect(messages.some(message => message.includes('already registered'))).toBe(true);
  });

  it('falls back to manual instructions for an unrecognized workspace shape', async () => {
    const runner = new SchematicTestRunner('ngx-fast-marquee', collectionPath);
    const [result, messages] = await runNgAdd(Tree.empty(), runner, {});

    expect(result.files).toEqual([]);
    expect(messages.some(message => message.includes('could not automatically register'))).toBe(true);
  });
});
