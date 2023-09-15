#!/bin/bash

# Check for the existence of the version that's about to be published on NPM. If it exists, do nothing
# If it doesn't exist, check that we're on the main branch, the working directory is clean, and the current commit
# is tagged with the requested version

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Must specify the package to push/check."
  exit 1
fi

PACKAGE=$1
DEPRECATED_PACKAGE=""
JQ_PATH=".version"
NPM_REGISTRY="$(yarn config get npmRegistryServer)"
SHA="$(git rev-parse HEAD)"

# Use bash function to parse arguments more efficiently
function parse_arguments() {
  while (( "$#" )); do
    case "$1" in
      --otp=*)
        OTP="${1#*=}"
        shift
        ;;
      --deprecated-package=*)
        DEPRECATED_PACKAGE="${1#*=}"
        shift
        ;;
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

function npm_authenticated() {
  if [[ -z "$NPM_TOKEN" ]]; then
    yarn npm "$@" --otp="$OTP"
  else
    yarn npm "$@"
  fi
}

# Initialize variables to ensure they exist
OTP=""
DRY_RUN=""
parse_arguments "$@"

NPM_SHOW="$(npm show "$PACKAGE" version)"
NPM_LS="$(cat package.json | jq -r $JQ_PATH)"

if [[ "$NPM_REGISTRY" != "https://registry.yarnpkg.com" ]]; then
  echo "NPM registry is not set to https://registry.yarnpkg.com. Aborting."
  exit 1
fi

# check if otp is set
if [[ -z "$OTP" && -z "$NPM_TOKEN" ]]; then
  echo "Must specify the NPM one-time password using the --otp option, or set the NPM_TOKEN environment variable. Aborting."
  exit 1
fi

echo "$PACKAGE npm show: $NPM_SHOW, npm ls: $NPM_LS"

if [[ "$NPM_SHOW" != "$NPM_LS" ]]; then
  echo "Versions are not the same, (Remote = $NPM_SHOW; Local = $NPM_LS). Checking for publish eligibility."

  # make sure we're able to track this deployment
  if [[ -z "$DEVCYCLE_PROD_SLEUTH_API_TOKEN" ]]; then
    echo "Sleuth.io deployment tracking token not found. Aborting."
    exit 1
  fi

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
    echo "Current commit is not tagged with the requested version. Aborting."
    exit 1
  fi

  if [[ -z "$DRY_RUN" ]]; then
    echo "Publishing $PACKAGE@$NPM_LS to NPM."
    npm_authenticated publish
  else
    echo "[DRY RUN] Not publishing $PACKAGE@$NPM_LS to NPM."
  fi

  if [[ "$?" != 0 ]]; then
    echo "Publish failed. Aborting."
    exit 1
  fi

  curl -X POST \
    -d api_key=$DEVCYCLE_PROD_SLEUTH_API_TOKEN \
    -d environment=production \
    -d sha=$SHA https://app.sleuth.io/api/1/deployments/taplytics/js-sdks-2/register_deploy
else
  echo "Versions are the same ($NPM_SHOW = $NPM_LS). Not pushing"
fi

# If DEPRECATED_PACKAGE is set, run the deploy logic for it
if [[ "$DEPRECATED_PACKAGE" != "" ]]; then
  echo "Deploy to Deprecated Package: $DEPRECATED_PACKAGE"

  # Check version for DEPRECATED_PACKAGE
  NPM_SHOW_DEPRECATED="$(npm show "$DEPRECATED_PACKAGE" version)"

  echo "$DEPRECATED_PACKAGE npm show: $NPM_SHOW_DEPRECATED, npm ls: $NPM_LS"

  if [[ "$NPM_SHOW_DEPRECATED" != "$NPM_LS" ]]; then
    echo "Versions are not the same, (Remote = $NPM_SHOW_DEPRECATED; Local = $NPM_LS). Proceeding with deploy for deprecated package."

    # Backup the original package.json
    cp package.json package.json.bak

    # Ensure the original package.json is restored even if the script exits prematurely
    trap 'mv package.json.bak package.json' EXIT

    # Update the name field to DEPRECATED_PACKAGE
    jq --arg DEPRECATED_PACKAGE "$DEPRECATED_PACKAGE" '.name = $DEPRECATED_PACKAGE' package.json > package.json.temp
    mv package.json.temp package.json

    # Deploy logic
    if [[ -z "$DRY_RUN" ]]; then
      echo "Publishing $DEPRECATED_PACKAGE@$NPM_LS to NPM."
      npm_authenticated publish

      sleep 10

      npm_authenticated deprecate "$DEPRECATED_PACKAGE"@"*" "Package has been renamed to: $PACKAGE"
    else
      echo "[DRY RUN] Not publishing $DEPRECATED_PACKAGE@$NPM_LS to NPM."
    fi

    # Restore the original package.json (trap will take care of this if the script exits prematurely)
    mv package.json.bak package.json

    # Remove trap once the job is done
    trap - EXIT
  else
    echo "Versions are the same ($NPM_SHOW_DEPRECATED = $NPM_LS). Not pushing deprecated package."
  fi
fi
