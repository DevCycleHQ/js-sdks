#!/usr/bin/env bash

set -eo pipefail

# Get the last tagged sha from the output of "git describe"
LAST_TAG=$(git describe --always --first-parent --abbrev=0)

echo "::info::Last Tag $LAST_TAG"
LAST_TAGGED_SHA=$(git rev-list -n 1 $LAST_TAG)

if [ -z "$LAST_TAGGED_SHA" ]; then
  echo "Unable to find last tagged sha"
  exit 1
fi

echo "Last tagged sha: $LAST_TAGGED_SHA"

function parse_arguments() {
  while (( "$#" )); do
    case "$1" in
      --all-packages)
        ALL_PACKAGES=true
        echo "Selecting all projects for version increment"
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        echo "Running in dry-run mode"
        shift
        ;;
      --version-increment-type=*)
        VERSION_INCREMENT_TYPE="${1#*=}"
        shift
        ;;
      --version-increment-type*)
        VERSION_INCREMENT_TYPE="${2}"
        shift 2
        ;;
      *)
        echo "error: unrecognized argument(s): $@"
        exit 1
        ;;
    esac
  done
}

ALL_PACKAGES=false
DRY_RUN=false
VERSION_INCREMENT_TYPE="patch"

parse_arguments "$@"

# Determine base for affected projects
if [ "$ALL_PACKAGES" = true ]; then
  echo "::info::Processing all packages"
else
  echo "::info::Processing affected packages since $LAST_TAGGED_SHA"
fi

# Use NX release to handle versioning with conventional commits
if [ "$DRY_RUN" = true ]; then
  echo "::info::Running NX release DRY RUN with conventional commits"
  DRY_RUN_FLAG="--dry-run=true"
else
  echo "::info::Running NX release with conventional commits"
  DRY_RUN_FLAG="--dry-run=false"
fi

if [ "$ALL_PACKAGES" = true ]; then
  # Release all packages - NX will determine version bumps from git history
  yarn nx release version "$VERSION_INCREMENT_TYPE" $DRY_RUN_FLAG --git-commit=true --git-tag=true --first-release --verbose
else
  # Release only affected packages - NX will determine version bumps from git history  
  yarn nx release version "$VERSION_INCREMENT_TYPE" $DRY_RUN_FLAG --git-commit=true --git-tag=true --first-release --verbose
fi

# Only update yarn lockfile if not in dry-run mode
if [ "$DRY_RUN" = false ]; then
  echo "::info::Updating yarn lockfile if needed"
  yarn --no-immutable

  # Add lockfile changes to the commit if any
  if ! git diff --exit-code yarn.lock; then
    echo "::info::Adding yarn.lock changes"
    git add yarn.lock
    git commit --amend --no-edit --no-verify
  fi

  echo "::info::Release process completed successfully"
else
  echo "::info::Dry run completed - no changes were made"
fi 