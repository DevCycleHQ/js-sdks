#!/bin/bash
set -e

echo "Pre Commit Hook"

lint-staged --shell
exit
