#!/usr/bin/env bash
# Script para crear el .env con contraseña generadas. Si ya existe un .env, no hace nada

set -eu
cd "$(dirname "$0")/.."

# Comprueba .env existente
if [ -f .env ]; then
  echo "** Ya existe un .env, no se modifica **"
  exit 0
fi

# Compiamos el .env.example al .env
cp .env.example .env

# Cada marcador GENERATE_ME se reemplaza por una contraseña distinta
while grep -q 'GENERATE_ME' .env; do
  secret=$(openssl rand -hex 24)
  sed -i "0,/GENERATE_ME/s//${secret}/" .env
done

chmod 600 .env
echo "** Se ha creado correctamente el .env **"