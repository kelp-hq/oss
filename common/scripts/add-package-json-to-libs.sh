#!/usr/bin/env bash
set -ex

PKG_MODULE=$GITPOD_REPO_ROOT/common/scripts/package.json/module.json
PKG_CJS=$GITPOD_REPO_ROOT/common/scripts/package.json/commonjs.json

cp "$PKG_MODULE" "$GITPOD_REPO_ROOT/tools/ipfs-api-client/lib/package.json"
cp "$PKG_CJS" "$GITPOD_REPO_ROOT/tools/ipfs-api-client/lib_cjs/package.json"

# cp "$PKG_MODULE" "$GITPOD_REPO_ROOT/tools/ipfs-cli/lib/package.json"
cp "$PKG_CJS" "$GITPOD_REPO_ROOT/tools/ipfs-cli/lib/package.json"

# cp "$PKG_MODULE" "$GITPOD_REPO_ROOT/tools/utils/lib/package.json"
# cp "$PKG_CJS" "$GITPOD_REPO_ROOT/tools/utils/lib_cjs/package.json"

cp "$PKG_MODULE" "$GITPOD_REPO_ROOT/tools/sveltekit-adapter-macula/lib/package.json"
