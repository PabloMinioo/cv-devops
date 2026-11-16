#!/usr/bin/env bash
# Levanta todo: crea el .env si falta, la app y después el monitoreo.
set -eu
cd "$(dirname "$0")/.."

./scripts/setup.sh
docker compose up -d --build
docker compose --env-file .env -f monitoring/compose.yaml up -d

echo
echo "Web:          http://localhost:8088"
echo "Grafana:      http://localhost:3000  (usuario y contraseña en .env)"
echo "Prometheus:   http://localhost:9090"
echo "Alertmanager: http://localhost:9093"