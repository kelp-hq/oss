#!/usr/bin/env bash
set -ex
PROJECT_ROOT=$(git rev-parse --show-toplevel)

PKG_MODULE=$PROJECT_ROOT/common/scripts/package.json/module.json
PKG_CJS=$PROJECT_ROOT/common/scripts/package.json/commonjs.json

cp "$PKG_MODULE" "$PROJECT_ROOT/libraries/ipfs-api-client/lib/package.json"
cp "$PKG_CJS" "$PROJECT_ROOT/libraries/ipfs-api-client/lib-commonjs/package.json"

# cp "$PKG_MODULE" "$PROJECT_ROOT/tools/ipfs-cli/lib/package.json"
cp "$PKG_CJS" "$PROJECT_ROOT/tools/ipfs-cli/lib/package.json"

# cp "$PKG_MODULE" "$PROJECT_ROOT/tools/utils/lib/package.json"
# cp "$PKG_CJS" "$PROJECT_ROOT/tools/utils/lib-commonjs/package.json"

cp "$PKG_MODULE" "$PROJECT_ROOT/libraries/web3-api-auth-token/lib/package.json"
cp "$PKG_CJS" "$PROJECT_ROOT/libraries/web3-api-auth-token/lib-commonjs/package.json"

cp "$PKG_MODULE" "$PROJECT_ROOT/libraries/sveltekit-adapter-macula/lib/package.json"
