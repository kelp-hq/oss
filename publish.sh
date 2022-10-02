#!/usr/bin/env bash
rush publish \
  --apply \
  --publish \
  --include-all \
  --target-branch $(git rev-parse --abbrev-ref HEAD) \
  --add-commit-details \
  --set-access-level public
