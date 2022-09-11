#!/usr/bin/env bash
export HISTIGNORE='DOPPLER_*'

PROJECT_ROOT=$(git rev-parse --show-toplevel)

pnpm env use --global 18.4.0

pnpm add --global @microsoft/rush

ln -fs $GITPOD_REPO_ROOT/.devops/gitpod/.bash_aliases $HOME/.bash_aliases
bash $GITPOD_REPO_ROOT/.devops/gitpod/prep-doppler.sh

cd $PROJECT_ROOT


docker-compose up -d ipfs mongodb redis

# give ipfs 5 secs to start
sleep 5

docker-compose exec ipfs ipfs bootstrap rm all &&
  docker-compose stop ipfs &&
  docker-compose up -d ipfs

sleep 5
# add our ipfs node
docker-compose exec ipfs ipfs swarm connect /ip4/159.69.27.167/udp/4001/quic/p2p/12D3KooWGc7qCqwQvx9r96hwtmVhJSiXKK1qMFunXP3KiccJv64w
