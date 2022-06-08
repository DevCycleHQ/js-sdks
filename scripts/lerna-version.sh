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

yarn lerna version --force-publish=$PACKAGES --message "chore(release): publish" "$@"

