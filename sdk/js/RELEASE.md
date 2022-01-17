# Releasing

Create a release branch in the format `release-js-sdk-x.x.x`. Increment the package version number, commit it to git and push the changes.

A CircleCI build will trigger and publish your changes to `npm`. Then make a PR in the branch and merge into `main`.