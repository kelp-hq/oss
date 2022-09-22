#!/usr/bin/env bash
set -ex
PROJECT_ROOT=$(git rev-parse --show-toplevel)

PKG_MODULE=$PROJECT_ROOT/common/scripts/package.json/module.json
PKG_CJS=$PROJECT_ROOT/common/scripts/package.json/commonjs.json

cp "$PKG_MODULE" "$PROJECT_ROOT/tools/ipfs-api-client/lib/package.json"
cp "$PKG_CJS" "$PROJECT_ROOT/tools/ipfs-api-client/lib_cjs/package.json"

# cp "$PKG_MODULE" "$PROJECT_ROOT/tools/ipfs-cli/lib/package.json"
cp "$PKG_CJS" "$PROJECT_ROOT/tools/ipfs-cli/lib/package.json"

# cp "$PKG_MODULE" "$PROJECT_ROOT/tools/utils/lib/package.json"
# cp "$PKG_CJS" "$PROJECT_ROOT/tools/utils/lib_cjs/package.json"

cp "$PKG_MODULE" "$PROJECT_ROOT/tools/web3-auth-handler/lib/package.json"
cp "$PKG_CJS" "$PROJECT_ROOT/tools/web3-auth-handler/lib_cjs/package.json"

cp "$PKG_MODULE" "$PROJECT_ROOT/tools/sveltekit-adapter-macula/lib/package.json"
