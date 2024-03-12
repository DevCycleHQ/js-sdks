#!/bin/bash
cd "$(dirname "$0")"

echo "$(dirname "$0")"

# allow lockfile changes to account for different contents of file-linked packages generating different checksums
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn

yarn start
