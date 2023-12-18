#!/bin/bash
cd "$(dirname "$0")"

# update checksums to allow any changes to the file-linked packages to update the lockfile in CI without errors
yarn up @devcycle/nextjs-sdk
yarn up @devcycle/js-client-sdk
yarn up @devcycle/react-client-sdk
yarn up @devcycle/types
yarn

# clear cache because next seems to cache node modules even if they change :/
rm -rf .next

yarn dev
