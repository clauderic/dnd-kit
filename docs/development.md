# dnd-kit Development Guide

This document describes how to set up, build, test, and contribute to the dnd-kit monorepo.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Running in Development](#running-in-development)
4. [Build System](#build-system)
5. [Testing](#testing)
6. [Linting and Formatting](#linting-and-formatting)
7. [CI/CD Pipelines](#cicd-pipelines)
8. [Release Process](#release-process)
9. [Project Structure](#project-structure)
10. [Common Tasks](#common-tasks)

---

## Prerequisites

### Required Tools

- **Bun** (v1.1.12 or later) -- The project uses Bun as its package manager and test runner. The exact version is pinned in the root `package.json` via the `packageManager` field:

  ```json
  "packageManager": "bun@1.1.12"
  ```

  Install Bun by following the instructions at [https://bun.sh](https://bun.sh).

- **Node.js** (v20 or later) -- Required for CI workflows and the Changesets release tooling. The GitHub Actions workflows explicitly use Node 20.

- **npm** (latest) -- Used during the release process for publishing packages to the npm registry. The release workflow runs `npm install -g npm@latest`.

- **Git** -- Standard version control.

### Recommended Tools

- **Turborepo** -- Installed as a devDependency (`turbo@^2.5.2`), so no global install is necessary. You invoke it through the `bun run` scripts defined in the root `package.json`.

---

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/clauderic/dnd-kit.git
cd dnd-kit
```

The primary development branch is `experimental`.

```bash
git checkout experimental
```

### 2. Install Dependencies

```bash
bun install
```

This installs all dependencies across every workspace (`packages/*` and `apps/*`) via Bun's built-in workspace support.

### 3. Build All Packages

```bash
bun run build
```

This runs `turbo run build`, which builds all packages in topological order (dependencies are built before dependents). You must build before running the development server so that cross-package imports resolve correctly.

---

## Running in Development

### Start the Development Server

```bash
bun run dev
```

This runs `turbo run dev --concurrency 15`, which starts watch-mode builds for all packages and the Storybook development server in parallel.

### What Gets Started

- **Package watch builds** -- Each package runs tsup in watch mode. This recompiles the package whenever source files change, producing updated ESM and CJS bundles.

- **Storybook** -- The `apps/stories` workspace starts a Storybook development server on port **6006**:

  ```bash
  storybook dev -p 6006
  ```

  Stories are located in `apps/stories/stories/` and are picked up by the patterns `**/*.stories.mdx` and `**/*.stories.tsx`.

Once `bun run dev` is running, open [http://localhost:6006](http://localhost:6006) to view the Storybook UI, which serves as the primary interactive development environment for testing drag-and-drop behaviors.

---

## Build System

### Turborepo

The project uses [Turborepo](https://turbo.build/) to orchestrate builds, tests, and other tasks across the monorepo. The pipeline is configured in `turbo.json`:

```json
{
  "tasks": {
    "build": {
      "outputs": [
        "./packages/**/*.js",
        "./packages/**/*.js.map",
        "./packages/**/*.cjs",
        "./packages/**/*.cjs.map",
        "./packages/**/*.d.ts",
        "./packages/**/*.d.cts",
        "dist/**",
        "storybook-static/**"
      ],
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "cache": false,
      "persistent": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

Key details:

- **`build`** -- Runs in topological order (`"dependsOn": ["^build"]`), meaning a package's dependencies are built before the package itself. Build outputs are cached by Turborepo to speed up subsequent runs.
- **`dev`** and **`test`** -- Not cached (`"cache": false`) and marked as persistent tasks (long-running processes).
- **`lint`** -- Runs independently with no dependency ordering and is cacheable.
- **`clean`** -- Not cached; removes build artifacts, Turborepo cache, and `node_modules`.

### tsup (Package Bundler)

All library packages use [tsup](https://tsup.egoist.dev/) to bundle TypeScript source into distributable JavaScript. tsup is a zero-config bundler built on esbuild.

#### Packages with `tsup.config.ts`

Three packages have explicit tsup configuration files that output directly to the package root (`outDir: './'`):

- **`@dnd-kit/abstract`** (`packages/abstract/tsup.config.ts`):

  ```ts
  import {defineConfig} from 'tsup';

  export default defineConfig((options) => ({
    dts: true,
    outDir: './',
    external: ['@dnd-kit/abstract'],
    format: ['esm', 'cjs'],
    sourcemap: true,
    treeshake: !options.watch,
  }));
  ```

- **`@dnd-kit/dom`** (`packages/dom/tsup.config.ts`): Same pattern, with CSS files loaded as text and additional externals for sibling `@dnd-kit/*` packages.

- **`@dnd-kit/react`** (`packages/react/tsup.config.ts`): Same pattern, with externals for `@dnd-kit/abstract`, `@dnd-kit/react`, `@dnd-kit/dom`, and `@dnd-kit/state`.

These packages produce output files at the package root (e.g., `index.js`, `index.cjs`, `index.d.ts`).

#### Packages without `tsup.config.ts`

The remaining packages (`collision`, `geometry`, `helpers`, `state`) invoke tsup directly from their `build` script with inline flags:

```json
"build": "tsup src/index.ts --format esm,cjs --dts --external react"
```

These packages output to a `dist/` directory by default.

#### Multi-Entry Builds

Several packages have multiple entry points, each built with a separate tsup invocation:

- **`@dnd-kit/abstract`**: `core`, `modifiers`
- **`@dnd-kit/dom`**: `core`, `modifiers`, `plugins`, `sortable`, `utilities`
- **`@dnd-kit/react`**: `core`, `hooks`, `sortable`, `utilities`

The build scripts run these sequentially. For example, `@dnd-kit/react`:

```json
"build": "bun build:utilities && bun build:hooks && bun build:core && bun build:sortable"
```

### Build Outputs

Every package produces dual-format output:

| Format | Extension | Description |
|--------|-----------|-------------|
| ESM    | `.js`     | ES module format for modern bundlers |
| CJS    | `.cjs`    | CommonJS format for Node.js and legacy bundlers |
| Types  | `.d.ts`, `.d.cts` | TypeScript declaration files |
| Source maps | `.js.map`, `.cjs.map` | For debugging |

Packages expose their entry points through the `exports` field in `package.json`:

```json
"exports": {
  ".": {
    "types": "./index.d.ts",
    "import": "./index.js",
    "require": "./index.cjs"
  }
}
```

### TypeScript Configuration

Shared TypeScript configurations live in `config/typescript/`:

| Config | File | Used By |
|--------|------|---------|
| Base   | `config/typescript/base.json` | Extended by all other configs |
| Vanilla | `config/typescript/vanilla.json` | `abstract`, `collision`, `dom`, `geometry`, `helpers`, `state` |
| React  | `config/typescript/react.json` | `react` |

The base config enables `strict` mode, `declaration` output, and `emitDeclarationOnly` (actual JS is produced by tsup, not tsc). All configs target ES6 with `NodeNext` module resolution.

### Storybook Build

The `apps/stories` workspace uses Storybook 9 with the `@storybook/react-vite` framework. Its build produces static output in `storybook-static/`:

```json
"build": "storybook build"
```

---

## Testing

### Test Runner

The project uses **Bun's built-in test runner** (`bun test`). Tests import from `bun:test`:

```ts
import {describe, expect, it} from 'bun:test';
```

The `@dnd-kit/state` package includes `bun-types` in its devDependencies and configures its `tsconfig.json` with `"types": ["bun-types"]` for type-safe test authoring.

### Running Tests

Run all tests across the monorepo:

```bash
bun run test
```

This executes `turbo run test`, which finds and runs tests in all workspaces that have a `test` script defined. Currently, the `@dnd-kit/state` package has tests.

Run tests for a specific package:

```bash
cd packages/state
bun test
```

Or use Turborepo's filter:

```bash
bun run test --filter=@dnd-kit/state
```

### Test File Conventions

Test files are placed in a `tests/` directory within the relevant package and use the `.test.ts` extension. For example:

```
packages/state/tests/comparators.test.ts
```

The `tsconfig.json` for packages with tests includes the `tests/` directory:

```json
{
  "include": ["src/**/*", "tests/**/*"]
}
```

---

## Linting and Formatting

### ESLint

The monorepo maintains a shared ESLint configuration in the `@dnd-kit/eslint-config` package (`packages/eslint-config/`). This private package provides configuration presets based on `@vercel/style-guide` and `eslint-config-turbo`.

Individual packages extend the shared config via their `.eslintrc.js`:

```js
// Vanilla TypeScript packages (state, geometry, etc.)
module.exports = {
  extends: ["@dnd-kit/eslint-config/vanilla.js"],
};

// Storybook app
module.exports = {
  extends: ['@dnd-kit/eslint-config', 'plugin:storybook/recommended'],
};
```

Run linting across all packages:

```bash
bun run lint
```

This runs `turbo run lint`, which invokes each package's `lint` script. The lint scripts use ESLint with auto-fix enabled:

```json
"lint": "TIMING=1 eslint src/**/*.ts* --fix"
```

The `TIMING=1` environment variable enables ESLint's rule timing output for performance profiling.

### Prettier

Code formatting is handled by Prettier (v3.1.1+). The root `.prettierrc` defines the project style:

```json
{
  "bracketSpacing": false,
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5"
}
```

Key style rules:

- No spaces inside curly braces: `{a: 1}` not `{ a: 1 }`
- Single quotes for strings
- Semicolons at the end of statements
- Trailing commas where valid in ES5 (objects, arrays, function parameters)

Format all files:

```bash
bun run format
```

This runs:

```bash
prettier --write "**/*.{ts,tsx,md}"
```

### Browser Support

The `.browserslistrc` defines target browsers for any tooling that consumes it:

```
defaults
last 2 version
not IE 11
not dead
```

---

## CI/CD Pipelines

The project has four GitHub Actions workflows in `.github/workflows/`.

### 1. Tests (`tests.yml`)

**Triggers:** Pull requests and pushes to the `experimental` branch.

**What it does:**
- Checks out the repository
- Sets up Bun (latest version)
- Installs dependencies with `bun install`
- Runs the test suite with `bun test`

This is the primary quality gate for all pull requests.

### 2. Release (`release.yml`)

**Triggers:** Pushes to the `experimental` branch only.

**Permissions:** Requires `id-token` (OIDC), `contents` (write), and `pull-requests` (write).

**What it does:** Runs two matrix jobs sequentially (`max-parallel: 1`):

- **`current` channel:**
  - Sets up Node 20 and Bun
  - Installs dependencies and builds all packages
  - Uses the `changesets/action@v1` GitHub Action to either:
    - **Create a "Version Packages" pull request** if there are pending changesets, or
    - **Publish packages to npm** if the version PR has been merged and package versions are bumped

- **`beta` channel:**
  - Runs after the `current` channel completes
  - Creates snapshot beta versions: `npm run version-packages:beta`
  - Publishes to npm with the `@beta` tag: `npm run release:beta`

### 3. Continuous Release (`continous-release.yml`)

**Triggers:** Pull requests and pushes to the `experimental` branch.

**What it does:**
- Sets up Node 20 and Bun
- Installs dependencies and builds all packages
- Publishes preview releases of all packages using `pkg-pr-new`:

  ```bash
  npx pkg-pr-new publish './packages/*'
  ```

This allows anyone to test unreleased changes from a PR by installing a preview version directly, without waiting for a formal npm release.

### 4. Chromatic (`chromatic.yml`)

**Triggers:** Pull requests and pushes to the `experimental` branch.

**What it does:**
- Sets up Bun and installs dependencies
- Builds all packages (required because Storybook depends on them)
- Runs [Chromatic](https://www.chromatic.com/) for visual regression testing against the `apps/stories` workspace:

  ```yaml
  uses: chromaui/action@v1
  with:
    buildScriptName: 'build'
    workingDir: 'apps/stories'
  ```

Chromatic captures screenshots of every Storybook story and compares them against baseline snapshots to detect visual regressions.

---

## Release Process

### Changesets

The project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. Configuration is in `.changeset/config.json`:

```json
{
  "changelog": ["@changesets/changelog-github", {"repo": "clauderic/dnd-kit"}],
  "commit": false,
  "fixed": [
    [
      "@dnd-kit/abstract",
      "@dnd-kit/collision",
      "@dnd-kit/dom",
      "@dnd-kit/geometry",
      "@dnd-kit/helpers",
      "@dnd-kit/react",
      "@dnd-kit/state"
    ]
  ],
  "access": "public",
  "baseBranch": "experimental",
  "updateInternalDependencies": "patch"
}
```

Key configuration:

- **Fixed versioning group** -- All seven public packages (`abstract`, `collision`, `dom`, `geometry`, `helpers`, `react`, `state`) are released together with the same version number. A changeset affecting any one of them bumps all of them.
- **Changelog format** -- Uses `@changesets/changelog-github` to generate changelogs that include GitHub PR links and contributor attribution.
- **Base branch** -- `experimental` (not `master`/`main`).
- **Public access** -- All packages are published with public access on npm.
- **No auto-commit** -- Changesets does not automatically commit version bumps.

### Adding a Changeset

When you make a change that should be released, add a changeset:

```bash
bun run changeset
```

This starts an interactive CLI that asks you:
1. Which packages are affected
2. The semver bump type (patch, minor, major)
3. A summary of the change

A markdown file is created in the `.changeset/` directory. For example:

```markdown
---
'@dnd-kit/collision': patch
---

**directionBiased**: Fix inverted logic to bias towards shapes above or below the drag operation shape.
```

Commit this file along with your code changes.

### Stable Releases

The release process is automated via the `release.yml` GitHub Action:

1. Contributors add changesets to their PRs.
2. When PRs with changesets are merged to `experimental`, the release workflow detects pending changesets.
3. The `changesets/action` automatically creates (or updates) a "Version Packages" PR that:
   - Consumes all pending changesets
   - Bumps package versions according to the changeset types
   - Updates changelogs
4. When the "Version Packages" PR is merged, the release workflow detects that versions have been bumped and publishes all updated packages to npm.

### Beta (Snapshot) Releases

Beta releases are published automatically on every push to `experimental`, alongside the stable release process:

```bash
# These commands are run by CI, but can also be run locally:
bun run version-packages:beta   # changeset version --snapshot beta
bun run release:beta            # changeset publish --snapshot --tag beta
```

Snapshot versions use calculated version numbers (configured via `"snapshot": {"useCalculatedVersion": true}`) and are published under the `@beta` dist-tag on npm. This allows users to install pre-release versions:

```bash
npm install @dnd-kit/react@beta
```

### Manual Release Commands

For reference, the root `package.json` provides these release-related scripts:

| Command | Description |
|---------|-------------|
| `bun run changeset` | Create a new changeset |
| `bun run version-packages` | Consume changesets and bump versions |
| `bun run release` | Publish packages to npm |
| `bun run version-packages:beta` | Create snapshot beta versions |
| `bun run release:beta` | Publish beta versions to npm |

---

## Project Structure

### Workspace Layout

```
dnd-kit/
  apps/
    docs/              -- Documentation site (Mintlify-based, not a workspace member)
    stories/           -- Storybook application for interactive examples
  packages/
    abstract/          -- Framework-agnostic core abstractions (DragDropManager, sensors, etc.)
    collision/         -- Collision detection algorithms
    dom/               -- DOM-specific drag-and-drop implementation
    eslint-config/     -- Shared ESLint configuration (private, not published)
    geometry/          -- Geometric primitives (shapes, coordinates, etc.)
    helpers/           -- Utility helpers for common drag-and-drop patterns
    react/             -- React bindings (hooks and components)
    state/             -- Reactive state management (built on @preact/signals-core)
  config/
    typescript/        -- Shared TypeScript configurations (base, vanilla, react)
  .changeset/          -- Changesets configuration and pending changesets
  .github/workflows/   -- GitHub Actions CI/CD workflows
```

### Workspaces

The root `package.json` declares two workspace patterns:

```json
"workspaces": [
  "packages/*",
  "apps/*"
]
```

### `packages/` -- Published Libraries

These are the npm packages that make up the dnd-kit toolkit. All public packages use **fixed versioning** -- they share the same version number (currently `0.2.3`) and are always released together.

| Package | npm Name | Description |
|---------|----------|-------------|
| `abstract` | `@dnd-kit/abstract` | Framework-agnostic abstractions: `DragDropManager`, sensors, modifiers, plugins |
| `collision` | `@dnd-kit/collision` | Collision detection algorithms (closest center, direction-biased, etc.) |
| `dom` | `@dnd-kit/dom` | DOM-specific implementation with sensors, sortable support, plugins, and modifiers |
| `geometry` | `@dnd-kit/geometry` | Geometric primitives: shapes, points, bounding rectangles |
| `helpers` | `@dnd-kit/helpers` | High-level utility functions for common patterns |
| `react` | `@dnd-kit/react` | React hooks (`useDraggable`, `useDroppable`, `useSortable`) and components |
| `state` | `@dnd-kit/state` | Reactive state primitives built on `@preact/signals-core` |
| `eslint-config` | `@dnd-kit/eslint-config` | Shared ESLint configuration (private, not published to npm) |

#### Package Dependency Graph

```
state
  geometry -> state
  abstract -> geometry, state
  collision -> abstract, geometry
  helpers -> abstract
  dom -> abstract, collision, geometry, state
  react -> abstract, dom, state
```

### `apps/` -- Applications

| App | Description |
|-----|-------------|
| `stories` | Storybook 9 application with interactive drag-and-drop examples. Uses `@storybook/react-vite` framework with Vite as the bundler. |
| `docs` | Documentation site powered by [Mintlify](https://mintlify.com/). Contains guides for both vanilla JavaScript and React usage. Not a formal workspace member (no `package.json` in workspaces). |

---

## Common Tasks

### Building a Specific Package

Use Turborepo's `--filter` flag to target a single package:

```bash
# Build only @dnd-kit/react and its dependencies
bun run build --filter=@dnd-kit/react

# Build only @dnd-kit/collision (no dependencies need building first if they are cached)
bun run build --filter=@dnd-kit/collision
```

Or navigate to the package and run its build script directly:

```bash
cd packages/collision
bun run build
```

### Running a Specific Package in Watch Mode

```bash
cd packages/dom
bun run dev
```

This starts tsup in watch mode for all entry points of that package.

### Cleaning Build Artifacts

Remove all build artifacts and `node_modules` across the monorepo:

```bash
bun run clean
```

This runs `turbo run clean` (which executes each package's `clean` script) and then removes the root `node_modules`.

Each package's clean script removes `.turbo` cache, `node_modules`, and `dist` (or built files):

```json
"clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist"
```

### Adding a New Package

1. Create a new directory under `packages/`:

   ```bash
   mkdir packages/my-package
   ```

2. Create a `package.json` following the conventions of existing packages:

   ```json
   {
     "name": "@dnd-kit/my-package",
     "version": "0.2.3",
     "type": "module",
     "main": "./dist/index.cjs",
     "module": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "sideEffects": false,
     "license": "MIT",
     "files": ["dist/**"],
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js",
         "require": "./dist/index.cjs"
       }
     },
     "scripts": {
       "build": "tsup src/index.ts --format esm,cjs --dts --external react",
       "dev": "tsup src/index.ts --format esm,cjs --watch --dts --external react",
       "lint": "TIMING=1 eslint src/**/*.ts* --fix",
       "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist"
     },
     "devDependencies": {
       "@dnd-kit/eslint-config": "*",
       "eslint": "^8.38.0",
       "tsup": "8.3.0",
       "typescript": "^5.5.2"
     },
     "publishConfig": {
       "access": "public"
     }
   }
   ```

3. Create a `tsconfig.json` that extends the appropriate shared config:

   ```json
   {
     "extends": "../../config/typescript/vanilla.json",
     "include": ["src/**/*"],
     "exclude": ["dist", "build", "node_modules"]
   }
   ```

   Use `../../config/typescript/react.json` if the package uses React/JSX.

4. Create your source entry point at `src/index.ts`.

5. If the package should be part of the fixed versioning group, add it to the `fixed` array in `.changeset/config.json`.

6. Run `bun install` from the root to link the new workspace.

### Previewing the Storybook Build

Build and serve the Storybook as a static site:

```bash
cd apps/stories
bun run build
bun run preview-storybook
```

### Linting a Single Package

```bash
cd packages/react
bun run lint
```

### Checking the Build Output of a Package

After building, inspect the output files. Packages with `tsup.config.ts` (abstract, dom, react) output to the package root. Others output to `dist/`:

```bash
# For packages outputting to root
ls packages/abstract/index.js packages/abstract/index.cjs packages/abstract/index.d.ts

# For packages outputting to dist/
ls packages/collision/dist/
```

### Running Format Check Without Writing

Prettier does not have a separate check script configured, but you can run it manually:

```bash
npx prettier --check "**/*.{ts,tsx,md}"
```

### Investigating Turborepo Task Graph

To visualize how Turborepo will execute tasks:

```bash
bunx turbo run build --graph
```

This outputs a DOT graph showing the dependency order of build tasks.
