#!/usr/bin/env bash
export HISTIGNORE='DOPPLER_*'

PROJECT_ROOT=$(git rev-parse --show-toplevel)

pnpm env use --global 18.4.0

pnpm add --global @microsoft/rush

ln -fs "$GITPOD_REPO_ROOT"/.devops/gitpod/.bash_aliases "$HOME"/.bash_aliases
bash "$GITPOD_REPO_ROOT"/.devops/gitpod/prep-doppler.sh

cd "$PROJECT_ROOT" || exit

wget https://github.com/jsontypedef/json-typedef-codegen/releases/download/v0.4.1/x86_64-unknown-linux-musl.zip
unzip -o x86_64-unknown-linux-musl.zip -d ../bin/
rm -f x86_64-unknown-linux-musl.zip

docker-compose up -d ipfs mongodb redis

# give ipfs 5 secs to start
sleep 5

docker-compose exec ipfs ipfs bootstrap rm all &&
  docker-compose stop ipfs &&
  docker-compose up -d ipfs

sleep 5
# add our ipfs node
docker-compose exec ipfs ipfs swarm connect /ip4/159.69.27.167/udp/4001/quic/p2p/12D3KooWGc7qCqwQvx9r96hwtmVhJSiXKK1qMFunXP3KiccJv64w

wget https://github.com/caddyserver/caddy/releases/download/v2.6.2/caddy_2.6.2_linux_amd64.tar.gz
wget https://github.com/caddyserver/caddy/releases/download/v2.6.2/caddy_2.6.2_linux_amd64.tar.gz.sig
tar xvf caddy_2.6.2_linux_amd64.tar.gz
mv caddy /workspace/bin/caddy

caddy version

rm caddy_2.6.2_linux_amd64.tar.gz caddy_2.6.2_linux_amd64.tar.gz.sig
