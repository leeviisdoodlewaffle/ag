#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is required to deploy the Ahola Gateway." >&2
  exit 1
fi

if ! docker network inspect ahola-net >/dev/null 2>&1; then
  echo "Error: Docker network 'ahola-net' does not exist." >&2
  echo "Create it once with: docker network create ahola-net" >&2
  exit 1
fi

git pull --ff-only origin main

docker compose --project-name ahola-gateway -f compose.yaml config --quiet
docker compose --project-name ahola-gateway -f compose.yaml build

if docker container inspect ahola-gateway >/dev/null 2>&1; then
  COMPOSE_PROJECT=$(docker container inspect \
    --format '{{ index .Config.Labels "com.docker.compose.project" }}' \
    ahola-gateway)
  if [ "$COMPOSE_PROJECT" != "ahola-gateway" ]; then
    docker container rm --force ahola-gateway
  fi
fi

docker compose --project-name ahola-gateway -f compose.yaml up --detach --no-build
docker compose --project-name ahola-gateway -f compose.yaml ps
