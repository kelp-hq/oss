#!/usr/bin/env bash
# rush change
# # --target-branch origin/$(git rev-parse --abbrev-ref HEAD)

# exit 0

rush publish \
  --apply \
  --publish \
  --include-all \
  --target-branch $(git rev-parse --abbrev-ref HEAD) \
  --add-commit-details \
  --set-access-level public
