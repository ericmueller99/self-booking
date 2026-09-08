# self-booking -- build and deploy
#
# Production server is fixed at 216.128.182.35 (Vultr, x86_64, root).
# The image is built locally for linux/amd64 and streamed to the server over
# SSH, so nothing is pushed to Docker Hub -- the local Docker CLI being signed
# in to the wrong account does not matter. The server is signed in as
# hollyburnproperties, which is only relevant if you ever use `make push`.

SERVER_IP     := 216.128.182.35
SERVER_USER   := root
SERVER        := $(SERVER_USER)@$(SERVER_IP)
IMAGE         := hollyburnproperties/self-booking
SERVICE       := self-booking
APP_PORT      := 3003
COMPOSE_FILE  := /root/docker-compose.yml
PLATFORM      := linux/amd64

# Tag = short commit sha, plus -dirty when the tree has uncommitted changes.
GIT_SHA  := $(shell git rev-parse --short HEAD 2>/dev/null || echo nogit)
DIRTY    := $(shell test -n "$$(git status --porcelain 2>/dev/null)" && echo -dirty)
TAG      ?= $(GIT_SHA)$(DIRTY)

SSH := ssh -o ConnectTimeout=15
EXPORTS := IMAGE=$(IMAGE) TAG=$(TAG) PLATFORM=$(PLATFORM) SERVER_IP=$(SERVER_IP) \
           SERVER_USER=$(SERVER_USER) SERVICE=$(SERVICE) APP_PORT=$(APP_PORT) \
           COMPOSE_FILE=$(COMPOSE_FILE)

.DEFAULT_GOAL := help
.PHONY: help build deploy release push logs ps status health restart rollback shell ssh clean patch-healthcheck

help: ## Show this help
	@echo "self-booking -> $(SERVER_IP):$(APP_PORT)   image $(IMAGE):$(TAG)"
	@echo
	@grep -E '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) \
	  | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

build: ## Build the linux/amd64 image locally
	@$(EXPORTS) ./scripts/build.sh

deploy: ## Stream the built image to the server and restart the service
	@$(EXPORTS) ./scripts/deploy.sh

release: build deploy ## Build and deploy in one step

push: ## Push to Docker Hub instead (needs `docker login -u hollyburnproperties`)
	@docker push $(IMAGE):$(TAG)
	@docker push $(IMAGE):latest
	@$(SSH) $(SERVER) "docker compose -f $(COMPOSE_FILE) pull $(SERVICE) && \
	  docker compose -f $(COMPOSE_FILE) up -d $(SERVICE)"

logs: ## Tail the container logs (ctrl-c to stop)
	@$(SSH) $(SERVER) "docker logs -f --tail 200 $(SERVICE)"

ps: ## Show all containers on the server
	@$(SSH) $(SERVER) "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'"

status: ## Show this service's state, health and restart count
	@$(SSH) $(SERVER) "docker inspect $(SERVICE) --format \
	  'image:    {{.Config.Image}}{{println}}state:    {{.State.Status}}{{println}}health:   {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}{{println}}restarts: {{.RestartCount}}{{println}}started:  {{.State.StartedAt}}'"

health: ## Hit the health endpoint through the public IP
	@curl -sS -o /dev/null -w 'http://$(SERVER_IP):$(APP_PORT)/api/health -> HTTP %{http_code}\n' \
	  http://$(SERVER_IP):$(APP_PORT)/api/health

restart: ## Restart the container without redeploying
	@$(SSH) $(SERVER) "docker restart $(SERVICE)"

rollback: ## Roll back to the image replaced by the last deploy
	@$(SSH) $(SERVER) "docker image inspect $(IMAGE):previous >/dev/null 2>&1 || \
	  { echo 'No :previous image on the server'; exit 1; }; \
	  docker tag $(IMAGE):previous $(IMAGE):latest && \
	  docker compose -f $(COMPOSE_FILE) up -d --force-recreate $(SERVICE)"
	@$(MAKE) --no-print-directory status

shell: ## Open a shell inside the running container
	@$(SSH) -t $(SERVER) "docker exec -it $(SERVICE) sh"

ssh: ## SSH into the server
	@$(SSH) -t $(SERVER)

clean: ## Remove dangling images on the server
	@$(SSH) $(SERVER) "docker image prune -f"

patch-healthcheck: ## Replace the broken curl healthcheck in the server compose file
	@$(EXPORTS) ./scripts/patch-healthcheck.sh
