SHELL := /bin/bash
.DEFAULT_GOAL := dev

# ── Config ────────────────────────────────────────────────────────────────────
COMPOSE  := docker compose -f infra/docker/docker-compose.yml
API_PORT ?= 3333
API_URL  := http://localhost:$(API_PORT)

# ── Colors ────────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
GREEN := \033[0;32m
GRAY  := \033[0;90m
NC    := \033[0m

log = @printf "$(CYAN)[ba33]$(NC) %s\n" $(1)
ok  = @printf "$(GREEN)[ok]$(NC) %s\n" $(1)

# ══════════════════════════════════════════════════════════════════════════════
#  make        — installs deps, starts infra, migrates, launches all apps,
#                then seeds the DB automatically once the API is ready.
# ══════════════════════════════════════════════════════════════════════════════
.PHONY: dev
dev: install infra wait-db migrate
	$(call log,"Starting all services (API :3333 · web-ops :3003 · web-buyer :3001 · web-institutional :3002)...")
	@trap 'kill 0' INT; \
	pnpm dev & \
	printf "$(GRAY)[ba33] Waiting for API on $(API_URL)...$(NC)\n"; \
	until curl -sf $(API_URL)/api > /dev/null 2>&1; do sleep 3; done; \
	curl -sf -X POST $(API_URL)/seed > /dev/null 2>&1 \
	  && printf "$(GREEN)[ok]$(NC) Database seeded.\n" \
	  || printf "$(GRAY)[ba33] Seed skipped (already seeded or returned an error).$(NC)\n"; \
	wait

# ── Dependencies ──────────────────────────────────────────────────────────────
.PHONY: install
install:
	$(call log,"Installing Node dependencies...")
	@pnpm install
	$(ok,"Node dependencies ready")

# ── Infrastructure ────────────────────────────────────────────────────────────
.PHONY: infra
infra:
	$(call log,"Starting Docker services (Postgres + Redis)...")
	@$(COMPOSE) up -d
	$(ok,"Docker services started")

.PHONY: wait-db
wait-db:
	$(call log,"Waiting for Postgres to be healthy...")
	@until $(COMPOSE) exec -T postgres pg_isready -U ba33 -d ba33_platform > /dev/null 2>&1; do \
	  sleep 2; \
	done
	$(ok,"Postgres is ready")

# ── Database ──────────────────────────────────────────────────────────────────
.PHONY: migrate
migrate:
	$(call log,"Running database migrations...")
	@pnpm --filter @ba33/api drizzle-kit migrate
	$(ok,"Migrations applied")

.PHONY: seed
seed:
	$(call log,"Waiting for API on $(API_URL)...")
	@until curl -sf $(API_URL)/api > /dev/null 2>&1; do sleep 3; done
	$(call log,"Seeding database...")
	@curl -s -X POST $(API_URL)/seed | python3 -m json.tool
	$(ok,"Seed complete")

.PHONY: studio
studio:
	$(call log,"Opening Drizzle Studio...")
	@pnpm db:studio

# ── Stop / Teardown ───────────────────────────────────────────────────────────
.PHONY: down
down:
	$(call log,"Stopping Docker services...")
	@$(COMPOSE) down
	$(ok,"Services stopped")

.PHONY: reset
reset:
	$(call log,"Full reset — wiping volumes and restarting from scratch...")
	@$(COMPOSE) down -v
	@pnpm clean 2>/dev/null || true
	@$(MAKE) dev

# ── Utilities ─────────────────────────────────────────────────────────────────
.PHONY: logs
logs:
	@$(COMPOSE) logs -f

.PHONY: build
build:
	$(call log,"Building all packages...")
	@pnpm build

.PHONY: lint
lint:
	@pnpm lint

.PHONY: typecheck
typecheck:
	@pnpm typecheck

.PHONY: test
test:
	@pnpm test

# ── Help ──────────────────────────────────────────────────────────────────────
.PHONY: help
help:
	@printf "\n$(CYAN)ba33 Platform$(NC)\n\n"
	@printf "  $(GREEN)make$(NC)          Start everything (infra → migrate → all apps → seed)\n"
	@printf "  $(GREEN)make down$(NC)     Stop Docker services\n"
	@printf "  $(GREEN)make reset$(NC)    Wipe volumes + clean + full restart\n"
	@printf "  $(GREEN)make seed$(NC)     Re-seed the DB (API must be running)\n"
	@printf "  $(GREEN)make migrate$(NC)  Run DB migrations only\n"
	@printf "  $(GREEN)make studio$(NC)   Open Drizzle Studio\n"
	@printf "  $(GREEN)make logs$(NC)     Tail Docker logs\n"
	@printf "  $(GREEN)make build$(NC)    Build all packages\n"
	@printf "  $(GREEN)make install$(NC)  pnpm install\n\n"
	@printf "  Ports:  API :3333 · web-operations :3003 · web-buyer :3001 · web-institutional :3002\n\n"
