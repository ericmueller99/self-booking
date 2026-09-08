#!/usr/bin/env bash
#
# The server compose file probes the container with:
#     curl -f http://localhost:3003/health
#
# node:16-alpine ships no curl and the app has no /health route, so the probe
# can never pass. The container sits "unhealthy" and docker-watchdog restarts
# it every two minutes. This swaps in a node-based probe against /api/health.
#
set -euo pipefail

SERVER_IP="${SERVER_IP:-216.128.182.35}"
SERVER_USER="${SERVER_USER:-root}"
SERVER="${SERVER_USER}@${SERVER_IP}"
SERVICE="${SERVICE:-self-booking}"
COMPOSE_FILE="${COMPOSE_FILE:-/root/docker-compose.yml}"
APP_PORT="${APP_PORT:-3003}"

echo "==> Backing up ${COMPOSE_FILE} on ${SERVER_IP}"
ssh -o ConnectTimeout=15 "${SERVER}" "cp ${COMPOSE_FILE} ${COMPOSE_FILE}.bak.\$(date +%Y%m%d%H%M%S)"

# The probe is assembled on the server, not interpolated into the ssh command
# line -- the JS needs single quotes, and a round trip through the remote
# shell strips them.
echo "==> Rewriting the ${SERVICE} healthcheck"
ssh -o ConnectTimeout=15 "${SERVER}" \
  "APP_PORT='${APP_PORT}' COMPOSE_FILE='${COMPOSE_FILE}' SERVICE='${SERVICE}' python3 - " <<'PY'
import json, os

path = os.environ['COMPOSE_FILE']
port = os.environ['APP_PORT']
service = os.environ['SERVICE']

# CMD (not CMD-SHELL) so docker execs argv directly, with no shell in between.
probe = (
    "require('http')"
    ".get('http://127.0.0.1:%s/api/health',r=>process.exit(r.statusCode===200?0:1))"
    ".on('error',()=>process.exit(1))" % port
)
new = 'test: ' + json.dumps(["CMD", "node", "-e", probe])
old = 'test: ["CMD", "curl", "-f", "http://localhost:%s/health"]' % port

src = open(path).read()
if old in src:
    src = src.replace(old, new, 1)
elif 'api/health' in src:
    # Re-running after a partial patch: replace whatever health test is there.
    import re
    src, n = re.subn(r'test: \[.*?api/health.*?\]\n', new + '\n', src, count=1)
    if not n:
        raise SystemExit("    could not locate the healthcheck to replace")
else:
    raise SystemExit("    healthcheck line not recognised -- no change made")

open(path, 'w').write(src)
print("    healthcheck for %s updated" % service)
PY

echo "==> Recreating ${SERVICE} with the new healthcheck"
ssh -o ConnectTimeout=15 "${SERVER}" "docker compose -f ${COMPOSE_FILE} up -d --force-recreate ${SERVICE}"
echo "==> Done. Health goes 'starting' -> 'healthy' within about 45s; check with 'make status'."
