#!/usr/bin/env bash
#
# Build the self-booking image for the deploy target.
#
# The build host is arm64 (Apple Silicon) and the server is x86_64, so the
# image is always built for linux/amd64 regardless of where this runs.
#
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${IMAGE:-hollyburnproperties/self-booking}"
TAG="${TAG:?TAG is required (set by the Makefile)}"
PLATFORM="${PLATFORM:-linux/amd64}"

echo "==> Building ${IMAGE}:${TAG} for ${PLATFORM}"

# --provenance/--sbom off: attestations turn the result into a manifest list,
# which `docker save | docker load` on the server cannot ingest.
docker buildx build \
  --platform "${PLATFORM}" \
  --provenance=false \
  --sbom=false \
  --tag "${IMAGE}:${TAG}" \
  --tag "${IMAGE}:latest" \
  --load \
  .

echo "==> Built:"
docker images "${IMAGE}" --format '    {{.Repository}}:{{.Tag}}  {{.Size}}  {{.CreatedSince}}'
