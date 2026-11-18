# CV DevOps - Pablo Agustín Miño

Versión ampliada de mi currículum. En lugar de listar herramientas, las muestro funcionando: una aplicación mínima corriendo sobre un stack completo de contenedores, con monitoreo y logs centralizados y un pipeline de CI.

Todo corre en local con un solo comando; no hace falta servidor ni cuenta en ningún servicio.

## Qué hace la aplicación

Una página que te pide tu nombre, lo guarda en PostgreSQL y te saluda: *"Hola {nombre}, esta es una versión más desarrollada de mi currículum"*. La aplicación es simple a propósito, es para demostrar mis habilidades de DevOps.

## Qué incluye

| Componente | Función |
|---|---|
| **Nginx** | Sirve la página y hace de proxy inverso hacia la API |
| **API (Spring Boot, Java 21)** | Recibe los nombres y expone métricas |
| **PostgreSQL 18** | Guarda los visitantes |
| **Prometheus** | Recolecta métricas y evalúa las alertas |
| **Alertmanager** | Recibe y agrupa las alertas |
| **Grafana** | Dashboard único con métricas y logs |
| **Loki + Grafana Alloy** | Logs de todos los contenedores, con nivel y formato legible |
| **cAdvisor, node-exporter, postgres-exporter** | Métricas de contenedores, servidor y base de datos |
| **GitHub Actions** | Valida, construye, escanea (Trivy) y publica la imagen |

## Requisitos

- Docker con Compose v2
- `openssl` (para generar las contraseñas)
- Linux, macOS o WSL2

## Inicio rápido

```bash
git clone https://github.com/PabloMinioo/cv-devops.git
cd cv-devops
./up-api.sh
```

El script crea el archivo `.env` con contraseñas aleatorias la primera vez (no hay que editar nada), levanta la aplicación y después el monitoreo. La primera ejecución tarda unos minutos porque descarga imágenes y dependencias.

Para apagar todo: `./down-api.sh`.

## Accesos

Todos los puertos escuchan solo en `127.0.0.1`.

| Servicio | URL |
|---|---|
| Aplicación | http://localhost:8088 |
| Grafana | http://localhost:3000 (usuario y contraseña en `.env`) |
| Prometheus | http://localhost:9090 |
| Alertmanager | http://localhost:9093 |
| Alloy | http://localhost:12345 |

## Qué probar

1. Abrí la aplicación y registrá tu nombre.
2. En Grafana, abrí el dashboard **CV DevOps - Overview**: vas a ver la request, el nuevo visitante y el log del registro.
3. Probá una alerta: `docker compose -f docker-compose-cvapi.yml stop api`. Aparecerá `TargetDown` y `ContainerDown` en Alertmanager. Después `docker compose -f docker-compose-cvapi.yml start api` y se resuelven.

## La API

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/visitors` | Guarda un visitante. Cuerpo: `{"name": "Ana"}`. Responde `{"id": 1, "name": "Ana"}`. Devuelve `400` si el nombre está vacío o supera los 50 caracteres. |
| `GET` | `/api/visitors/count` | Cantidad de visitantes guardados |
| `GET` | `/actuator/health` | Estado de salud (interno, lo usa el healthcheck) |
| `GET` | `/actuator/prometheus` | Métricas (interno, lo lee Prometheus) |

Además expone dos métricas propias: `cv_visitors_registered_total` (altas desde que arrancó) y `cv_visitors_total` (total en la base). La API no se publica hacia afuera: solo Nginx llega a ella.

## Monitoreo

- **Métricas:** API (tráfico, latencia, errores, JVM, pool de conexiones), PostgreSQL, contenedores y servidor.
- **Alertas** (`monitoring/prometheus/alerts.yml`): disponibilidad, errores y latencia de la API, base de datos, recursos del servidor y salud del propio pipeline de logs.
- **Logs:** Alloy lee los logs de los contenedores del proyecto, les asigna nivel (`info`, `warn`, `error`), une los stack traces y descarta el ruido. En Grafana se ven separados por categoría.
- El dashboard está provisionado desde el repositorio: se edita el JSON, no la interfaz.

## Seguridad

- Todos los contenedores (salvo cAdvisor) corren con `no-new-privileges` y sin capacidades de Linux (`cap_drop: ALL`); se devuelven solo las imprescindibles a Postgres, Nginx y Alloy.
- Nginx tiene el sistema de archivos en solo lectura.
- Las contraseñas se generan en el primer arranque; el repositorio no contiene secretos.
- Puertos publicados solo en `localhost`; las redes están separadas (`frontend`, `backend`, `monitoring`).
- Imágenes con versión fija, mantenidas por Dependabot.

**Excepciones asumidas** (es un entorno local):
- cAdvisor corre `privileged` porque lo necesita para leer los contenedores.
- Alloy monta el socket de Docker en modo lectura para descubrir contenedores.
- Alloy conserva `DAC_OVERRIDE` para escribir en su carpeta de datos.
- Loki no tiene healthcheck porque su imagen no incluye shell.

## CI/CD

El workflow `.github/workflows/ci.yml` se ejecuta en cada PR y en cada push a `main`:

1. Valida los dos archivos de Compose.
2. Construye la imagen de producción de la API.
3. La escanea con Trivy (falla ante vulnerabilidades altas o críticas con parche disponible).
4. En `main`, la publica en GitHub Container Registry: `ghcr.io/pablominioo/cv-devops-api`.

## Estructura

```
.
├── api/                          # API Spring Boot + Dockerfile multi-stage
├── db/init.sql                   # Esquema inicial de la base
├── web/                          # Página y configuración de Nginx
├── monitoring/
│   ├── prometheus/               # Configuración y alertas
│   ├── alertmanager/
│   ├── alloy/                    # Pipeline de logs
│   ├── loki/
│   └── grafana/                  # Datasources y dashboard provisionados
├── docker-compose-cvapi.yml      # Aplicación
├── docker-compose-monitoring.yml # Monitoreo
├── scripts/setup.sh              # Genera el .env
├── up-api.sh / down-api.sh
└── .github/                      # CI y Dependabot
```

## Comandos útiles

```bash
docker compose -f docker-compose-cvapi.yml ps          # estado de la aplicación
docker compose -f docker-compose-monitoring.yml ps     # estado del monitoreo
docker compose -f docker-compose-cvapi.yml logs -f api # logs de un servicio
docker compose -f docker-compose-cvapi.yml watch       # desarrollo con recarga automática
```

La API arranca en modo desarrollo (`target: development` en el Compose), por eso el primer arranque tarda hasta un minuto y medio.

## Pendiente

- TLS en la conexión a PostgreSQL con una CA propia.
- Ejecutar la API con la imagen de producción por defecto (hoy usa la de desarrollo para el hot reload).
