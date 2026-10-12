#!/usr/bin/env bash
set -Eeuo pipefail

CONTAINER_NAME="project-name"
IMAGE_TAG="project-name:latest"
MIGRATOR_IMAGE="project-name:migrator"
APP_DIR="$HOME/apps/project-name"
ENV_FILE="$APP_DIR/.env.production"
DATA_DIR="$APP_DIR/data"
IMAGE_TAR="image.tar"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing runtime environment file: $ENV_FILE" >&2
  exit 1
fi

if [ ! -f "$IMAGE_TAR" ]; then
  echo "Missing Docker image archive: $IMAGE_TAR" >&2
  exit 1
fi

echo "Loading docker images..."
mkdir -p "$DATA_DIR"
docker load --input "$IMAGE_TAR"

# This is to make sure that the database path / directory has access
echo "Fixing data directory ownership..."
docker run --rm \
  --mount type=bind,source="$DATA_DIR",target=/data \
  alpine:3 chown -R 1001:1001 /data

# Runs the database migrations using the env variable for specific settings, dev, prod etc
echo "Running database migrations..."
docker run --rm \
  --user 1001:1001 \
  -e HOME=/tmp \
  --env-file "$ENV_FILE" \
  --mount type=bind,source="$DATA_DIR",target=/app/data \
  "$MIGRATOR_IMAGE" \
  sh -c 'bun node_modules/drizzle-kit/bin.cjs migrate --config="$DATABASE_SETTINGS"'

# Removes the current container image
echo "Starting replacement application container..."
if docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  docker rm -f "$CONTAINER_NAME"
fi

# Replacing / adding the new container image
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file "$ENV_FILE" \
  --mount type=bind,source="$DATA_DIR",target=/app/data \
  "$IMAGE_TAG"

# Removes the copied image file
rm -f "$IMAGE_TAR"

echo "Deployment complete: $IMAGE_TAG"
echo "Persistent database/data directory: $DATA_DIR"
