#!/usr/bin/env bash
#
# Ship a locally-built image to the production server and restart the service.
#
# The image is streamed over SSH (docker save | ssh docker load) instead of
# being pushed through Docker Hub. That keeps the deploy working while the
# local Docker CLI is signed in to the wrong account -- nothing is ever
# pushed from here, and the server pulls nothing.
#
set -euo pipefail

cd "$(dirname "$0")/.."

SERVER_IP="${SERVER_IP:-216.128.182.35}"
SERVER_USER="${SERVER_USER:-root}"
SERVER="${SERVER_USER}@${SERVER_IP}"
IMAGE="${IMAGE:-hollyburnproperties/self-booking}"
TAG="${TAG:?TAG is required (set by the Makefile)}"
SERVICE="${SERVICE:-self-booking}"
COMPOSE_FILE="${COMPOSE_FILE:-/root/docker-compose.yml}"
APP_PORT="${APP_PORT:-3003}"

SSH_OPTS=(-o ConnectTimeout=15 -o ServerAliveInterval=30)
ssh_run() { ssh "${SSH_OPTS[@]}" "${SERVER}" "$@"; }

if ! docker image inspect "${IMAGE}:${TAG}" >/dev/null 2>&1; then
  echo "!! ${IMAGE}:${TAG} not found locally. Run 'make build' first." >&2
  exit 1
fi

echo "==> Target: ${SERVER}  service=${SERVICE}  port=${APP_PORT}"
ssh_run true || { echo "!! Cannot reach ${SERVER} over SSH" >&2; exit 1; }

# Keep the currently-deployed image around so 'make rollback' has something
# to fall back to.
echo "==> Tagging current release as :previous on the server"
ssh_run "docker image inspect ${IMAGE}:latest >/dev/null 2>&1 \
  && docker tag ${IMAGE}:latest ${IMAGE}:previous \
  || echo '    (no existing :latest, skipping)'"

echo "==> Streaming ${IMAGE}:${TAG} to the server (this is the slow part)"
docker save "${IMAGE}:${TAG}" "${IMAGE}:latest" \
  | gzip -1 \
  | ssh "${SSH_OPTS[@]}" "${SERVER}" 'gunzip | docker load'

echo "==> Recreating ${SERVICE} from ${COMPOSE_FILE}"
ssh_run "docker compose -f ${COMPOSE_FILE} up -d --force-recreate ${SERVICE}"

echo "==> Waiting for ${SERVICE} to come up"
for _ in $(seq 1 30); do
  state="$(ssh_run "docker inspect ${SERVICE} --format '{{.State.Status}}'" 2>/dev/null || echo missing)"
  [ "${state}" = "running" ] && break
  sleep 2
done

echo "==> Post-deploy status"
ssh_run "docker ps --filter name=^/${SERVICE}\$ --format '    {{.Names}}  {{.Image}}  {{.Status}}  {{.Ports}}'"
ssh_run "curl -sf -o /dev/null -w '    HTTP %{http_code} from localhost:${APP_PORT}\n' http://localhost:${APP_PORT}/ || echo '    !! app did not answer on ${APP_PORT}'"

echo "==> Deployed ${IMAGE}:${TAG} to ${SERVER_IP}"
