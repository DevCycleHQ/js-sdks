#!/bin/bash

# Check for the existence of the version that's about to be published on NPM. If it exists, do nothing
# If it doesn't exist, check that we're on the main branch, the working directory is clean, and the current commit
# is tagged with the requested version

set -eo pipefail

if [[ $# -eq 0 ]]; then
  echo "Must specify the package to push/check."
  exit 1
fi

PACKAGE=$1
JQ_PATH=".version"
SHA="$(git rev-parse HEAD)"
DRY_RUN=""


# Use bash function to parse arguments more efficiently
function parse_arguments() {
  while (( "$#" )); do
    case "$1" in
      --dry-run)
        DRY_RUN="true"
        echo "Dry run enabled. Not pushing to NPM."
        shift
        ;;
      *)
        shift
        ;;
    esac
  done
}

parse_arguments "$@"

NPM_SHOW="$(npm show "$PACKAGE" version)"
NPM_LS="$(cat package.json | jq -r $JQ_PATH)"

echo "$PACKAGE npm show: $NPM_SHOW, npm ls: $NPM_LS"

if [[ "$NPM_SHOW" != "$NPM_LS" ]]; then
  echo "Versions are not the same, (Remote = $NPM_SHOW; Local = $NPM_LS). Checking for publish eligibility."

  # Check for main branch and local changes when running locally
  if [[ -z "$CI" ]]; then
    # check if we're on main branch
    if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
      echo "Not on main branch. Aborting."
      exit 1
    fi

    # check if working directory is clean
    if [[ -n "$(git status --porcelain)" ]]; then
      echo "Working directory is not clean. Aborting."
      exit 1
    fi
  fi

  # check if current commit is tagged with the requested version
  if [[ -z "$(git tag --points-at HEAD "$PACKAGE@$NPM_LS")" ]]; then
    echo "::error::Current commit is not tagged with the requested version. Aborting."
    exit 1
  fi

  if [[ -z "$DRY_RUN" ]]; then
    echo "::info::Publishing $PACKAGE@$NPM_LS to NPM."
    npm publish --access=public --provenance
  else
    echo "::warning::[DRY RUN] Not publishing $PACKAGE@$NPM_LS to NPM."
  fi

  if [[ "$?" != 0 ]]; then
    echo "::error::Publish of package $PACKAGE@$NPM_LS failed. Aborting."
    exit 1
  fi
else
  echo "::info::Versions are the same ($NPM_SHOW = $NPM_LS). Not pushing"
fi
