import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addRootProvider } from '@schematics/angular/utility';
import { getWorkspace, ProjectDefinition, WorkspaceDefinition } from '@schematics/angular/utility/workspace';

const PACKAGE_NAME = 'ngx-fast-marquee';
const PROVIDER_NAME = 'provideFastMarquee';

interface NgAddSchema {
  project?: string;
}

const MANUAL_SETUP_INSTRUCTIONS = `
${PACKAGE_NAME}: could not automatically register ${PROVIDER_NAME}(). Add it to your
application's root providers manually.

Standalone bootstrap (app.config.ts):

  import { ${PROVIDER_NAME} } from '${PACKAGE_NAME}';

  export const appConfig: ApplicationConfig = {
    providers: [${PROVIDER_NAME}(), /* ...other providers */],
  };

NgModule bootstrap (app.module.ts):

  import { ${PROVIDER_NAME} } from '${PACKAGE_NAME}';

  @NgModule({
    providers: [${PROVIDER_NAME}()],
  })
  export class AppModule {}

See the ${PACKAGE_NAME} README for the full setup guide:
https://github.com/DevJaGz/app-fast-marquee/blob/develop/projects/ngx-fast-marquee/README.md
`;

export default function ngAdd(options: NgAddSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const workspace = await getWorkspace(tree);
      const project = resolveProject(workspace, options.project);

      if (!project) {
        context.logger.info(MANUAL_SETUP_INSTRUCTIONS);
        return;
      }

      const [projectName, projectDefinition] = project;

      if (isProviderAlreadyRegistered(tree, projectDefinition)) {
        context.logger.info(`${PROVIDER_NAME}() is already registered for project "${projectName}"; nothing to do.`);
        return;
      }

      return addRootProvider(projectName, ({ code, external }) => code`${external(PROVIDER_NAME, PACKAGE_NAME)}()`);
    } catch {
      context.logger.info(MANUAL_SETUP_INSTRUCTIONS);
      return;
    }
  };
}

function resolveProject(
  workspace: WorkspaceDefinition,
  requestedName?: string
): [string, ProjectDefinition] | undefined {
  if (requestedName) {
    const project = workspace.projects.get(requestedName);
    return project ? [requestedName, project] : undefined;
  }

  const defaultProject = workspace.extensions['defaultProject'];
  if (typeof defaultProject === 'string') {
    const project = workspace.projects.get(defaultProject);
    if (project) {
      return [defaultProject, project];
    }
  }

  if (workspace.projects.size === 1) {
    const [[name, project]] = workspace.projects.entries();
    return [name, project];
  }

  return undefined;
}

function isProviderAlreadyRegistered(tree: Tree, project: ProjectDefinition): boolean {
  const sourceRoot = project.sourceRoot ?? `${project.root}/src`;
  return directoryContainsProviderCall(tree, sourceRoot);
}

function directoryContainsProviderCall(tree: Tree, dirPath: string): boolean {
  const dir = tree.getDir(dirPath);

  for (const fileName of dir.subfiles) {
    if (!fileName.endsWith('.ts') || fileName.endsWith('.spec.ts')) {
      continue;
    }

    const filePath = `${dir.path}/${fileName}`;
    const content = tree.readText(filePath);
    if (content.includes(PROVIDER_NAME)) {
      return true;
    }
  }

  for (const subDirName of dir.subdirs) {
    if (directoryContainsProviderCall(tree, `${dir.path}/${subDirName}`)) {
      return true;
    }
  }

  return false;
}
