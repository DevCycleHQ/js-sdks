# Project Coding Standards and Conventions

## Configuration and Tooling

-   The project root contains configuration files for building, linting, formatting, and testing.
-   Key files include:
    -   `package.json`: Project dependencies and scripts
    -   `tsconfig.base.json`: Base TypeScript configuration
    -   `jest.config.ts`: Jest test runner configuration
    -   `.eslintrc.json`: ESLint configuration
    -   `.prettierrc.json`: Prettier formatting rules
    -   `nx.json`: NX workspace configuration
    -   `project.json`: Project definitions for NX

## Formatting

-   Defer all formatting to Prettier for supported file types (JavaScript, TypeScript, JSON, Markdown, etc.).
-   ESLint enforces code quality and linting rules.

## Git Commit Message Conventions

-   Follow Conventional Commits specification: `<type>: <description>` or `<type>(<scope>): <description>` (scopes are optional and rarely used)
-   Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
-   Description should be imperative mood, lowercase, single sentence.
-   Examples: `feat: add support for multi-threaded tests`, `fix: correct response for invalid input`, `docs: update README with new usage instructions`

## Internal Library Imports

-   Internal libraries should be imported using their package name (e.g., `@devcycle/bucketing`) rather than relative or absolute paths.
-   The package path for a library can be found in the library's `package.json` file under the `name` field.
-   This applies to code in `lib/`, `sdk/`, and test/script files are excluded.
-   **Example:**
    -   Correct: `import { generateBucketedConfig } from '@devcycle/bucketing'`
    -   Incorrect: `import { generateBucketedConfig } from '../../lib/shared/bucketing'`

## Naming Conventions

-   Files and variables should use camelCase (starting with lowercase).
-   Folders should use kebab-case.

## Project Structure Guide

-   This repository is managed as an NX monorepo.
-   Main configuration files: `nx.json`, `project.json`, `package.json`, `tsconfig.base.json`, `jest.config.ts`
-   Source code organized under `lib/`, `sdk/`, and `dev-apps/` directories.
-   Shared types and utilities found in `lib/shared/`
-   Each project (library, SDK, or app) defined in its own directory under `lib/`, `sdk/`, or `dev-apps/`
-   NX commands used to build, test, and manage dependencies between projects.

### README and Documentation

-   The main `README.md` at project root provides repository overview.
-   Many packages and libraries include their own README.md files with package-specific details.

## Testing and Mocks

-   Source files in `lib/`, `sdk/`, should have corresponding test files.
-   Test and script files themselves are not required to have their own tests.
-   Test files: use `.spec.ts`, `.spec.js`, `.test.js`, or `.test.ts` suffixes. (prefer `.test.ts`)
-   Tests located in `__tests__/` directories or alongside source files.
-   Mock implementations placed in `__mocks__/` directories within each package or module.

## Aviator CLI Workflow (optional)

-   Use Aviator CLI (`av`) for managing stacked branches: `av branch chore-fix-invalid-input`
-   Sync and push changes: `av sync --push=yes`
-   Create PR: `av pr --title "<title>" --body "<body>"` 
    -   title follows Conventional Commits, body uses markdown/bullets, `av pr` will push the branch
