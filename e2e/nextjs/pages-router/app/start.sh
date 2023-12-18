#!/bin/bash
cd "$(dirname "$0")"

# update checksums to allow any changes to the file-linked packages to update the lockfile in CI without errors
yarn --update-checksums

# clear cache because next seems to cache node modules even if they change :/
rm -rf .next

yarn dev
