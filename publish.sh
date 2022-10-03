#!/usr/bin/env bash
# rush change
# # --target-branch origin/$(git rev-parse --abbrev-ref HEAD)

# exit 0

node common/scripts/install-run-rush.js \
  publish \
  --apply \
  --publish \
  --include-all \
  --target-branch "$CI_COMMIT_BRANCH" \
  --add-commit-details \
  --set-access-level public
