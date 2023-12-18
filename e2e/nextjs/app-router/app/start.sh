#!/bin/bash
cd "$(dirname "$0")"

yarn

# clear cache because next seems to cache node modules even if they change :/
rm -rf .next

yarn dev
