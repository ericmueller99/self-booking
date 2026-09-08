#!/usr/bin/env bash
#
# Make .env.production the actual source of truth for the deployed container.
#
# By default the server keeps its runtime env inline in the compose file's
# `environment:` block, which silently drifts from .env.production -- that is
# how HOLLYBURN_API_URL went missing in production while working locally.
# This uploads .env.production to the server and points the service at it
# with `env_file`, so one file drives both.
#
set -euo pipefail

cd "$(dirname "$0")/.."

SERVER_IP="${SERVER_IP:-216.128.182.35}"
SERVER_USER="${SERVER_USER:-root}"
SERVER="${SERVER_USER}@${SERVER_IP}"
SERVICE="${SERVICE:-self-booking}"
COMPOSE_FILE="${COMPOSE_FILE:-/root/docker-compose.yml}"
REMOTE_ENV="${REMOTE_ENV:-/root/${SERVICE}.env}"
LOCAL_ENV="${LOCAL_ENV:-.env.production}"

[ -f "${LOCAL_ENV}" ] || { echo "!! ${LOCAL_ENV} not found" >&2; exit 1; }

echo "==> Uploading ${LOCAL_ENV} -> ${SERVER}:${REMOTE_ENV}"
scp -q "${LOCAL_ENV}" "${SERVER}:${REMOTE_ENV}"
ssh "${SERVER}" "chmod 600 ${REMOTE_ENV}"

echo "==> Pointing ${SERVICE} at ${REMOTE_ENV} in ${COMPOSE_FILE}"
ssh "${SERVER}" "cp ${COMPOSE_FILE} ${COMPOSE_FILE}.bak.\$(date +%Y%m%d%H%M%S) && \
  SERVICE='${SERVICE}' REMOTE_ENV='${REMOTE_ENV}' COMPOSE_FILE='${COMPOSE_FILE}' python3 - " <<'PY'
import os, re

path    = os.environ['COMPOSE_FILE']
service = os.environ['SERVICE']
env_ref = os.environ['REMOTE_ENV']

src = open(path).read()

if 'env_file' in src.split('services:')[1].split(service + ':')[1][:600]:
    print("    env_file already configured -- leaving compose alone")
    raise SystemExit(0)

# Insert env_file directly after the service's container_name line.
pat = r'(  %s:\n(?:.*\n)*?    container_name: %s\n)' % (re.escape(service), re.escape(service))
m = re.search(pat, src)
if not m:
    raise SystemExit("    !! could not locate the %s service block" % service)

src = src[:m.end(1)] + "    env_file:\n      - %s\n" % env_ref + src[m.end(1):]
open(path, 'w').write(src)
print("    env_file added to %s" % service)
PY

echo "==> Recreating ${SERVICE}"
ssh "${SERVER}" "docker compose -f ${COMPOSE_FILE} up -d --force-recreate ${SERVICE}"
echo "==> Done. Values in the compose 'environment:' block still override env_file,"
echo "    so remove any duplicated keys there once you have verified this works."
