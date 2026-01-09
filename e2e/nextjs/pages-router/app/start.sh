#!/bin/bash
cd "$(dirname "$0")"

# allow lockfile changes to account for different contents of file-linked packages generating different checksums
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn

# clear cache because next seems to cache node modules even if they change :/
rm -rf .next

yarn dev --port 3003
