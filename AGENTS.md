# DevCycle JS SDKs - Agent Guidelines

## Build/Lint/Test Commands
- **Lint all**: `yarn lint` or `nx run-many --parallel --target lint --all`
- **Test all**: `yarn test` or `nx run-many --parallel --target test --all`
- **Type check**: `yarn check-types` or `nx run-many --parallel --target check-types --all`
- **Single project test**: `nx test <project-name>` (e.g., `nx test nodejs`)
- **Single project lint**: `nx lint <project-name>`
- **Build**: `nx build <project-name>`
- **Format**: `yarn prettier:format`

## Code Style Guidelines
- **Formatting**: Prettier handles all formatting (4 spaces, single quotes, no semicolons, trailing commas)
- **Linting**: ESLint enforces code quality with TypeScript strict rules
- **Naming**: camelCase for files/variables, kebab-case for folders
- **Imports**: Use package names for internal libraries (`@devcycle/bucketing`) not relative paths
- **Types**: Explicit module boundary types required (`@typescript-eslint/explicit-module-boundary-types`)
- **Lodash**: Import specific methods only (`lodash/import-scope: method`)

## Git Conventions
- **Commits**: Follow Conventional Commits: `<type>: <description>` (feat, fix, docs, etc.)
- **Aviator CLI**: Optional but recommended for stacked branches (`av branch`, `av sync --push=yes`, `av pr`)