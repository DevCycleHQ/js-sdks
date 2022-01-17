#!/bin/bash

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [[ "$BRANCH_NAME" != "HEAD" ]]; then
  yarn jira-prepare-commit-msg "$1"
fi