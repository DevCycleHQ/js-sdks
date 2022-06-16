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

# Get the last tagged sha from the output of "git describe"
LAST_TAG=$(git describe --always --dirty --first-parent --abbrev=0)

echo "Last Tag $LAST_TAG"
LAST_TAGGED_SHA=$(git rev-list -n 1 $LAST_TAG)

if [ -z "$LAST_TAGGED_SHA" ]; then
  echo "Unable to find last tagged sha"
  exit 1
fi

echo "Last tagged sha: $LAST_TAGGED_SHA"

AFFECTED_PROJECTS=$(yarn nx print-affected --base $LAST_TAGGED_SHA --select=projects)
echo "Affected projects: $AFFECTED_PROJECTS"

# exit if no affected projects
if [ -z "$AFFECTED_PROJECTS" ]; then
  echo "No affected projects found. Exiting."
  exit 0
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
  FILEPATH=$(cat "workspace.json" | jq -r ".projects.\"$PROJECT\"")

  # get package name from project.json
  PACKAGE=$(cat "$FILEPATH/package.json" | jq -r '.name')

  # add package to array
  PACKAGES+=("$PACKAGE")
done

# join packages with comma
PACKAGES=$(IFS=','; echo "${PACKAGES[*]}")

yarn lerna version --force-publish=$PACKAGES --message "chore(release): publish" "$@" --no-push
# store the tags created for this commit
RELEASE_TAGS=$(git tag --points-at HEAD)
#  run yarn and add any lockfile changes
yarn
git add yarn.lock
# amend the previous commit with the new lock file. Now the SHA is different and the tags are wrong
git commit --amend --no-edit --no-verify

# fix the tags by iterating over them and moving them to the new commit
while IFS= read -r line; do
  git tag -f "$line" -m "$line"
done <<< "$RELEASE_TAGS"
