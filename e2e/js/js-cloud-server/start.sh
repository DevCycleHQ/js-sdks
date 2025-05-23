#!/bin/bash
cd "$(dirname "$0")"


if [ -z "${DVC_E2E_SERVER_SDK_KEY}" ]; then
  echo "DVC_E2E_SERVER_SDK_KEY is not set"
  exit 1
fi
echo "DEVCYCLE_SERVER_SDK_KEY=$DVC_E2E_SERVER_SDK_KEY" >> .dev.vars
# allow lockfile changes to account for different contents of file-linked packages generating different checksums
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn

yarn start &

sleep 5