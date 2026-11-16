#!/usr/bin/env bash
# Levanta todo: crea el .env si falta, luego la app y el monitoreo.
set -eu
cd "$(dirname "$0")"

./scripts/setup.sh
docker compose -f docker-compose-cvapi.yml up -d --build
docker compose -f docker-compose-monitoring.yml up -d

echo
echo "Web:          http://localhost:8088"
echo "Grafana:      http://localhost:3000  (usuario y clave en .env)"
echo "Prometheus:   http://localhost:9090"
echo "Alertmanager: http://localhost:9093"