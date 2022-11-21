#!/usr/bin/env bash
# set -x
set -o errexit

echo "THIS SHOULD NOT BE USED IN PRODUCTION!!!"
echo "IT IS ONLY FOR LOCAL BUILDING OF THE PRODUCTION IMAGE"
echo "IT WILL BE REMOVED AT SOME POINT"

PRODUCT="${1:-}"
PROJECT_ROOT=$(git rev-parse --show-toplevel)
IMAGE_VERSION=$(git rev-parse --short HEAD)

FULL_PRODUCT="anagolay/$PRODUCT:$IMAGE_VERSION"

echo "Building $FULL_PRODUCT"

DOCKER_BUILDKIT=0 docker build \
  --tag docker.io/"$FULL_PRODUCT" \
  --file "$PROJECT_ROOT"/.devops/docker/prod/"$PRODUCT".dockerfile .

if [[ "${2}" =~ "run" ]]; then
  echo "$2"
  # docker run --rm -it --env-file="$PROJECT_ROOT"/.env "$FULL_PRODUCT"
  docker run --rm -it "$FULL_PRODUCT"
fi
