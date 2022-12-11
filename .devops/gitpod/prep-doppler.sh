#!/usr/bin/env bash
export HISTIGNORE='DOPPLER_*'

PROJECT_ROOT=$(git rev-parse --show-toplevel)

echo "$DOPPLER_MACULA_TOKEN" | doppler configure set token --silent --scope "$PROJECT_ROOT"/services/macula

source "$HOME"/.bashrc
