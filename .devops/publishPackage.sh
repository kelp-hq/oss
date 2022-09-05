#!/usr/bin/env bash
# set -x
set -o errexit

echo "HEAVY WIP"
echo "THIS SHOULD NOT BE USED IN PRODUCTION!!!"
echo "IT IS ONLY FOR LOCAL BUILDING OF THE PRODUCTION IMAGE"
echo "IT WILL BE REMOVED AT SOME POINT"

PRODUCT="${1:-}"
PROJECT_ROOT=$(git rev-parse --show-toplevel)
IMAGE_VERSION=$(git rev-parse --short HEAD)
