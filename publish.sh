#!/usr/bin/env bash
# rush change
# # --target-branch origin/$(git rev-parse --abbrev-ref HEAD)

# exit 0

node common/scripts/install-run-rush.js \
  version \
  --bump \
  --version-policy unstable \
  --target-branch 5-improve-the-publishing-strategy-for-packages

node common/scripts/install-run-rush.js \
  publish \
  --apply \
  --publish \
  --include-all \
  --add-commit-details \
  --set-access-level public \
  --target-branch 5-improve-the-publishing-strategy-for-packages
