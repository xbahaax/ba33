SHELL := /bin/bash
.DEFAULT_GOAL := dev

# ── Config ────────────────────────────────────────────────────────────────────
COMPOSE  := docker compose -f infra/docker/docker-compose.yml
API_PORT ?= 3100
HOST     := $(shell ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo localhost)
API_URL  := http://$(HOST):$(API_PORT)
DATABASE_URL ?= postgres://ba33:ba33_dev_password@localhost:5450/ba33_platform
REDIS_URL    ?= redis://localhost:6390

export DATABASE_URL
export REDIS_URL

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
dev: install infra wait-db migrate seed-db api-build
	$(call log,"Starting all services (API :$(API_PORT) · web-ops :3000 · web-buyer :3001 · web-institutional :3002)...")
	@trap 'kill 0' INT; \
	PORT=$(API_PORT) BA33_API_URL=$(API_URL) NEXT_PUBLIC_BA33_API_URL=$(API_URL)/api/v1 NEXT_PUBLIC_API_URL=$(API_URL)/api/v1 pnpm dev & \
	printf "$(GRAY)[ba33] Waiting for API on $(API_URL)...$(NC)\n"; \
	until curl -sf $(API_URL)/api > /dev/null 2>&1; do sleep 3; done; \
	wait

# ── API first build (creates dist/ so nest --watch can start) ─────────────────
.PHONY: api-build
api-build:
	$(call log,"Building API (first compile)...")
	@rm -f apps/api/tsconfig.tsbuildinfo
	@pnpm --filter @ba33/api build
	$(ok,"API built")

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
	@$(COMPOSE) up -d postgres redis
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
	@pnpm --filter @ba33/api db:migrate
	$(ok,"Migrations applied")

.PHONY: seed-db
seed-db:
	$(call log,"Seeding full demo database...")
	@pnpm --filter @ba33/api db:seed
	$(ok,"Demo database seeded")

.PHONY: seed
seed:
	$(call log,"Seeding full demo database...")
	@pnpm --filter @ba33/api db:seed
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

# ── Mobile ────────────────────────────────────────────────────────────────────
SIMULATOR_ID := RFCT605TZDK

.PHONY: collector
collector:
	$(call log,"Launching collector app → $(API_URL)")
	@cd apps/mobile-collector && flutter run -d $(SIMULATOR_ID) --dart-define=API_URL=$(API_URL)

.PHONY: shepherd
shepherd:
	$(call log,"Launching shepherd app → $(API_URL)")
	@cd apps/mobile-shepherd && flutter run -d $(SIMULATOR_ID) --dart-define=API_URL=$(API_URL)

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
