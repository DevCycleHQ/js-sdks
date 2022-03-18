#!/bin/bash

# Check for the existence of the version that's about to be published on NPM. If it exists, do nothing
# If it doesn't exist, check that we're on the main branch, the working directory is clean, and the current commit
# is tagged with the requested version

if [[ $# -eq 0 ]]; then
  echo "Must specify the package to push/check."
  exit 1
fi

PACKAGE=$1
NPM_SHOW="$(npm show "$PACKAGE" version)"
NPM_LS="$(npm ls "$PACKAGE" --json | jq -r '.version')"

echo $2
while :; do
  case "$2" in
    --otp=*)
      OTP="${2#*=}"
      ;;
    *) break
  esac
  shift
done

# check if otp is set
if [[ -z "$OTP" ]]; then
  echo "Must specify the NPM one-time password using the --otp option."
  exit 1
fi

if [[ "$NPM_SHOW" != "$NPM_LS" ]]; then
  echo "Versions are not the same, (Remote = $NPM_SHOW; Local = $NPM_LS). Checking for publish eligibility."

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

  # check if current commit is tagged with the requested version
  if [[ -z "$(git tag --points-at HEAD "$PACKAGE@$NPM_LS")" ]]; then
    echo "Current commit is not tagged with the requested version. Aborting."
    exit 1
  fi

  npx npm publish --otp=$OTP
else
  echo "Versions are the same ($NPM_SHOW = $NPM_LS). Not pushing"
fi
