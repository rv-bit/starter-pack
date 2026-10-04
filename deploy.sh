#!/usr/bin/env bash
set -e

APP_NAME="${APP_NAME:-my-app}"
CONTAINER_NAME="${APP_NAME}-web"
IMAGE_TAG="${APP_NAME}:latest"
IMAGE_TAR="image.tar"

# Load Docker image
docker load < "$IMAGE_TAR"

# Stop and remove old container if exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker stop "${CONTAINER_NAME}" || true
  docker rm "${CONTAINER_NAME}" || true
fi

# Ensure .env.production exists in ~/apps/app-name
ENV_DIR="$HOME/apps/app-name"
mkdir -p "$ENV_DIR"
if [ ! -f "$ENV_DIR/.env.production" ]; then
  touch "$ENV_DIR/.env.production"
fi

# Run new container (no --rm, so PM2 can manage it)
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file "$ENV_DIR/.env.production" \
  "${IMAGE_TAG}"

# Cleanup tar
rm -f "$IMAGE_TAR"
