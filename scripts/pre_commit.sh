#!/bin/bash
set -e
# Implemented from: https://stackoverflow.com/questions/3284292/can-a-git-hook-automatically-add-files-to-the-commit

echo "Pre Commit Hook"

rebasingBranch() {
    for location in rebase-merge rebase-apply; do
        path=$(git rev-parse --git-path ${location})
        if test -d ${path}; then
            revision=$(<"${path}"/head-name)
            echo "${revision##refs/heads/}"
            return 0
        fi
    done
}

rebasing_branch_name="$(rebasingBranch)"

if [ "$rebasing_branch_name" != "" ]; then
  branch_name="$rebasing_branch_name"
else
  branch_name="$(git rev-parse --abbrev-ref HEAD)"
fi

valid_branch_regex='[Dd][Vv][Cc]-[[:digit:]]{3,4}|main|release'

message="Your branch name $branch_name does not contain a ticket number (DVC-1234)."

if [[ ! $branch_name =~ $valid_branch_regex ]]; then
    echo "$message"
    exit 1
fi

lint-staged --shell
exit
