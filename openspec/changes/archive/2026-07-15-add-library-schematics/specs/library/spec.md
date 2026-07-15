# Delta: library — add-library-schematics

## ADDED Requirements

### Requirement: ng-add Installation Schematic

The published `ngx-fast-marquee` package SHALL ship an `ng add` schematic so that running `ng add ngx-fast-marquee` in a consumer workspace installs the package as a runtime dependency and registers `provideFastMarquee()` in the target application's root providers. The schematic SHALL support both standalone bootstrap projects (provider inserted into the application config passed to `bootstrapApplication`) and `NgModule`-based projects (provider inserted into the root module's `providers`). The schematic SHALL be idempotent: when `provideFastMarquee()` is already registered it SHALL NOT add a duplicate. When the workspace or project shape is not recognized, the schematic SHALL make no source edit, SHALL print the library README's manual setup instructions, and SHALL complete without failing the `ng add` run. The compiled schematic factories and their collection/schema JSON files SHALL be included in the packaged library artifact.

#### Scenario: Standalone application gets the provider wired

- **WHEN** `ng add ngx-fast-marquee` runs against a standalone-bootstrap application whose root providers do not yet include `provideFastMarquee()`
- **THEN** the schematic adds `provideFastMarquee()` to the root providers with the corresponding import from `ngx-fast-marquee`, and the package is saved to the workspace `dependencies`

#### Scenario: NgModule-based application gets the provider wired

- **WHEN** `ng add ngx-fast-marquee` runs against an `NgModule`-bootstrapped application whose root module does not yet register `provideFastMarquee()`
- **THEN** the schematic adds `provideFastMarquee()` to the root module's `providers` with the corresponding import from `ngx-fast-marquee`

#### Scenario: Re-running the schematic adds no duplicate

- **WHEN** `ng add ngx-fast-marquee` runs against an application that already registers `provideFastMarquee()` in its root providers
- **THEN** the schematic leaves the existing registration untouched and does not add a second one

#### Scenario: Unrecognized project shape falls back to manual instructions

- **WHEN** `ng add ngx-fast-marquee` runs against a workspace whose bootstrap shape the schematic cannot locate or safely edit
- **THEN** the schematic modifies no source file, logs the manual `provideFastMarquee()` setup instructions, and the `ng add` command still completes successfully

#### Scenario: Packaged artifact carries the schematics

- **WHEN** the library is built for publishing via the library build
- **THEN** `dist/ngx-fast-marquee/` contains the compiled schematic factories with their collection and schema JSON files, and the artifact's `package.json` declares the `schematics` collection entry point

### Requirement: ng-update Migration Collection

The published `ngx-fast-marquee` package SHALL declare an `ng update` migration collection via the `ng-update.migrations` field of its `package.json`, resolvable inside the published artifact. The collection MAY contain zero migrations until a release introduces a breaking change that needs one; an empty collection SHALL NOT cause `ng update ngx-fast-marquee` to fail.

#### Scenario: ng update resolves the empty collection without error

- **WHEN** a consumer runs `ng update ngx-fast-marquee` against a published version whose migration collection contains no migrations
- **THEN** the update completes without error and applies no migration

#### Scenario: Packaged artifact declares the migration collection

- **WHEN** the library is built for publishing via the library build
- **THEN** the artifact's `package.json` contains an `ng-update.migrations` entry pointing at a migration collection JSON file that exists inside the artifact
