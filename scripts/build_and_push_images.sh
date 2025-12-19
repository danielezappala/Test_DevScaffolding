#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd -P)"
cd "$ROOT_DIR"

REGISTRY="${REGISTRY:-ghcr.io/danielezappala}"
VERSION="${1:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"
BUILDX_BUILDER="${BUILDX_BUILDER:-eno-builder}"
NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/inventory}"
NEXT_PUBLIC_ASSET_PREFIX="${NEXT_PUBLIC_ASSET_PREFIX:-$NEXT_PUBLIC_BASE_PATH}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://backend:8000/api/v1}"

if ! docker buildx inspect "$BUILDX_BUILDER" >/dev/null 2>&1; then
  echo "ℹ️  Buildx builder \"$BUILDX_BUILDER\" not found, creating it..."
  docker buildx create --name "$BUILDX_BUILDER" --use >/dev/null
else
  docker buildx use "$BUILDX_BUILDER" >/dev/null
fi

build_and_push() {
  local service="$1"
  local context="$2"
  local tag="$REGISTRY/eno-inventory-${service}:${VERSION}"
  local -a tags=(-t "$tag")
  local -a build_args=()

  if [[ "$VERSION" != "latest" ]]; then
    tags+=(-t "$REGISTRY/eno-inventory-${service}:latest")
  fi

  if [[ "$service" == "frontend" ]]; then
    build_args+=(
      --build-arg "NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH"
      --build-arg "NEXT_PUBLIC_ASSET_PREFIX=$NEXT_PUBLIC_ASSET_PREFIX"
      --build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
    )
  fi

  echo "🚢 Building ${service} for ${PLATFORMS} → ${tag}"
  docker buildx build \
    --platform "$PLATFORMS" \
    "${tags[@]}" \
    ${build_args[@]+"${build_args[@]}"} \
      --no-cache \
      --push \
      "$context"
}

build_and_push backend backend
build_and_push frontend frontend

echo "✅ Multi-arch images pushed:"
echo "  Backend : ${REGISTRY}/eno-inventory-backend:${VERSION}"
echo "  Frontend: ${REGISTRY}/eno-inventory-frontend:${VERSION}"
