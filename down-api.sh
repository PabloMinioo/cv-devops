#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")"
docker compose -f docker-compose-monitoring.yml down "$@"
docker compose -f docker-compose-cvapi.yml down "$@"