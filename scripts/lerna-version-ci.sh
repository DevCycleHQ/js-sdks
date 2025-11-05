#!/usr/bin/env bash

set -eo pipefail

# Get the last tagged sha from the output of "git describe"
LAST_TAG=$(git describe --always --first-parent --abbrev=0)
IGNORED_PACKAGES=()
#TODO: remove nextjs after it is released
INCLUDED_PACKAGES=("@devcycle/nextjs-sdk")

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
        AFFECTED_PROJECTS=$(yarn nx show projects | paste -sd "," -)
        echo "Selecting all projects for version increment"
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

AFFECTED_PROJECTS=""
VERSION_INCREMENT_TYPE="patch"

parse_arguments "$@"

if [ -z "$AFFECTED_PROJECTS" ]; then
  AFFECTED_PROJECTS=$(yarn nx print-affected --base $LAST_TAGGED_SHA --select=projects)
fi

echo "Affected projects: $AFFECTED_PROJECTS"

# exit if no affected projects
if [ -z "$AFFECTED_PROJECTS" ]; then
  echo "No affected projects found. Exiting."
  exit 1
fi

# strip whitespace from affected projects
AFFECTED_PROJECTS=$(echo "$AFFECTED_PROJECTS" | tr -d '[:space:]')

# split affect projects on comma
IFS=',' read -ra AFFECTED_PROJECTS <<< "$AFFECTED_PROJECTS"

# loop through affected projects
PACKAGES=()
for PROJECT in "${AFFECTED_PROJECTS[@]}"; do

  echo "Getting package name for $PROJECT"

  # get filepath from project.json
  FILEPATH=$(yarn nx show project $PROJECT | jq -r ".root")

  if [ ! -f "$FILEPATH/package.json" ]; then
    echo "::warning::Unable to find package.json for $PROJECT"
    continue
  fi

  # get package name from package.json
  PACKAGE=$(cat "$FILEPATH/package.json" | jq -r '.name')

  if [[ " ${IGNORED_PACKAGES[*]} " =~ " $PACKAGE " ]]; then
      echo "::info::Ignoring package $PACKAGE"
      continue
  fi

  # If INCLUDED_PACKAGES is specified and package is not in it, skip
  if [[ ${#INCLUDED_PACKAGES[@]} -gt 0 && ! " ${INCLUDED_PACKAGES[*]} " =~ " $PACKAGE " ]]; then
      echo "::info::Skipping package $PACKAGE (not in INCLUDED_PACKAGES)"
      continue
  fi

  # add package to array
  PACKAGES+=("$PACKAGE")
done

# join packages with comma
PACKAGES=$(IFS=','; echo "${PACKAGES[*]}")

echo -e "::info::Applying version increment $VERSION_INCREMENT_TYPE to packages:\n$PACKAGES"

yarn lerna version --exact --force-publish=$PACKAGES --message "chore(release): publish" --no-push --yes "$VERSION_INCREMENT_TYPE"

# store the tags created for this commit
RELEASE_TAGS=$(git tag --points-at HEAD)

#  run yarn and add any lockfile changes
echo -e "::info::Run yarn"
yarn --no-immutable
git add yarn.lock

# amend the previous commit with the new lock file. Now the SHA is different and the tags are wrong
echo -e "::info::Amend previous commit"
git commit --amend --no-edit --no-verify

# fix the tags by iterating over them and moving them to the new commit
echo -e "::info::Fix the tags: $RELEASE_TAGS"
if [ -n "$RELEASE_TAGS" ]; then
  while IFS= read -r line; do
    git tag -f "$line" -m "$line"
  done <<< "$RELEASE_TAGS"
else
  echo -e "::info::No tags to fix."
fi
