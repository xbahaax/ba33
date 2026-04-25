# Deployment

> Docker-based development environment. One `make` command boots Postgres,
> Redis, the API, and the operations web app. Mobile apps run via
> `make collector` / `make shepherd`.

---

## 1. Prerequisites

| Tool | Version | Why |
|---|---|---|
| Docker Desktop | latest | Postgres + Redis + API + web-ops containers |
| Node.js | 22+ | Local TS workspace tooling |
| pnpm | 10.11+ | Workspace package manager |
| Flutter SDK | 3.11+ | Mobile apps |
| Make | any | Orchestration |

On Windows: Docker Desktop with WSL2 backend recommended. Use Git Bash for
the Make commands.

---

## 2. One-command boot

```bash
make
```

What this does (from `Makefile`):

1. **install** — `pnpm install` across the workspace
2. **infra** — `docker compose -f infra/docker/docker-compose.yml up -d postgres redis`
3. **wait-db** — polls `pg_isready` until Postgres is healthy
4. **migrate** — `pnpm --filter @ba33/api db:migrate` (Drizzle)
5. **seed-db** — `pnpm --filter @ba33/api db:seed` (full demo data)
6. **api-build** — first compile of the NestJS app (creates `dist/`)
7. **dev** — `pnpm dev` in the workspace (Turborepo runs all dev servers in parallel)

Then waits for the API health check to respond before returning the prompt.

---

## 3. Service ports

After `make`, services are reachable at:

| Service | URL | Container |
|---|---|---|
| API (Swagger) | `http://localhost:3001` (`/api/docs`) | `ba33-api` |
| web-operations | `http://localhost:3000` | `ba33-web-operations` |
| web-buyer | `http://localhost:3001` (collides — see notes) | host-only |
| web-institutional | `http://localhost:3002` | host-only |
| Postgres | `localhost:5450` | `ba33-postgres` |
| Redis | `localhost:6390` | `ba33-redis` |

**Port collision note.** The `web-buyer` Next.js dev server defaults to 3001
(after web-operations took 3000). The API also runs on 3001 inside docker
mapping to host 3001. Two ways to resolve:

- Run `web-buyer` outside docker with a forced port:
  `cd apps/web-buyer && PORT=3010 pnpm dev`
- Or change the API host port in `infra/docker/docker-compose.yml`.

---

## 4. Environment variables

Defaults are in `.env.example`:

```env
# Database
DATABASE_URL=postgresql://ba33:ba33_dev_password@localhost:5450/ba33_platform

# Redis
REDIS_URL=redis://localhost:6390

# JWT
JWT_SECRET=change-me-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
PORT=3100
NODE_ENV=development

# Admin seed
ADMIN_EMAIL=admin@ba33.dz
ADMIN_PASSWORD=change-me-in-production

# File storage (local for v1)
FILE_STORAGE_PATH=./uploads
```

Inside docker, the API container uses `DATABASE_URL=postgres://ba33:...@postgres:5432/ba33_platform`
and `REDIS_URL=redis://redis:6379` (service names, internal port).

---

## 5. Migrations

### Generate a new migration

```bash
# After editing apps/api/src/common/database/schema/*.ts
docker exec ba33-api sh -lc "pnpm --filter @ba33/api db:generate"
# → drizzle-kit creates infra/db/migrations/000X_<random_name>.sql
```

### Apply migrations

```bash
make migrate
# or:
docker exec ba33-api sh -lc "pnpm --filter @ba33/api db:migrate"
```

### Migration order (current)

| File | Adds |
|---|---|
| `0000_dark_korvac.sql` | All baseline tables (53 tables) and ~70 enums |
| `0001_curly_hammerhead.sql` | Stage 1+ fields on pre_lots, depot, laverie, transformation; new wool_type / extraction_method / bag_type / lot_classification / conditioning_state / antimites enums |
| `0002_add_collection_jobs.sql` | `collection_jobs` + `collection_job_gps_points` tables, `source_profession` + `collection_job_status` enums, `sources.profession` column |

### Drizzle Studio

```bash
make studio
# Opens a web UI at https://local.drizzle.studio for browsing the DB
```

---

## 6. Seeding

### Full demo seed

```bash
make seed
```

Runs `apps/api/src/scripts/seed.ts`:

1. **Truncates everything** (`TRUNCATE ... RESTART IDENTITY CASCADE`).
2. Inserts 4 regions (Sétif, Alger, Oran, + 1 village).
3. Inserts 11 personas (see [AUTH_AND_RBAC.md](AUTH_AND_RBAC.md#2-the-11-seeded-personas)).
4. Inserts collectors / transporters / buyers profiles.
5. Inserts 3 sources (1 shepherd, 1 slaughterhouse, 1 aggregator).
6. Inserts 2 pre-lots, 6 lots in various states.
7. Inserts 2 depots + 3 zones.
8. Inserts depot receptions + dispatches.
9. Inserts 2 A1 alerts.
10. Inserts 4 transport jobs.
11. Inserts 1 laverie + production runs + qualifications + pricing.
12. Inserts 2 transformers (D3 + D4) + 1 BOM.
13. Inserts 3 certifications (1 pending, 1 issued, 1 revoked).
14. Inserts orders + shipments + sales documents.
15. Inserts 10 default rules in `rules_config`.
16. Inserts events for the entire seeded chain (so the dashboard isn't empty).

Then `seed-buyer.ts` inserts the production-style buyer
(`buyer@ba33.dz` / `Buyer@2026!`) and a buyer catalog with NFN seal codes
(`NFN-P1-00042-X7` valid, `NFN-P2-00148-M2` revoked, etc.) for the public
verify demo.

### Re-seed clean

```bash
make reset
# = docker compose down -v + pnpm clean + make
```

---

## 7. Docker compose breakdown

`infra/docker/docker-compose.yml`:

```yaml
services:
  postgres:    # postgres:16-alpine, port 5450:5432
  redis:       # redis:7-alpine, port 6390:6379
  api:         # built from infra/docker/Dockerfile.dev
               # mounts the repo as /app, runs `pnpm --filter @ba33/api dev`
               # depends on postgres healthy + redis started
               # port 3001:3001
  web-operations:  # built from same Dockerfile.dev
                   # mounts the repo, runs `pnpm --filter @ba33/web-operations dev`
                   # port 3000:3000
                   # uses BA33_API_URL=http://api:3001 (internal docker network)
                   # NEXT_PUBLIC_BA33_API_URL=/_ba33_api (proxied via Next rewrites)
volumes:
  ba33-postgres-data
  ba33-redis-data
  ba33-api-node-modules / -workspace-node-modules
  ba33-web-operations-node-modules / -next
```

The `Dockerfile.dev` is a thin Node.js image that runs `pnpm install`
(frozen-lockfile) on each start — slow on first boot, fast on subsequent
restarts thanks to mounted volumes.

---

## 8. Production build (not used in v1)

Each app has a `build` script:

```bash
pnpm --filter @ba33/api build           # NestJS bundle to dist/
pnpm --filter @ba33/web-operations build # Next.js build
pnpm --filter @ba33/web-buyer build
pnpm --filter @ba33/web-institutional build
```

For a real deployment you'd:
- API: containerize the `dist/` output, run `node dist/main.js`.
- Web apps: `pnpm start` (Next.js standalone), or static export, or Vercel.
- Postgres: managed (RDS, Cloud SQL, Supabase).
- Redis: managed (ElastiCache, Upstash).
- Files: replace `FILE_STORAGE_PATH` with S3-compatible (MinIO, R2, S3).
- Secrets: rotate `JWT_SECRET`, change `ADMIN_PASSWORD`.

---

## 9. Useful Make commands

```bash
make             # everything
make down        # docker compose down
make reset       # wipe volumes + clean + restart
make migrate     # migrations only
make seed        # re-seed (API must be running)
make studio      # Drizzle Studio
make logs        # tail docker logs
make collector   # mobile-collector on simulator
make shepherd    # mobile-shepherd on simulator
make build       # pnpm build all
make lint        # pnpm lint
make typecheck   # pnpm typecheck
make test        # pnpm test
make help        # the menu
```

The default simulator ID is in `Makefile`: `SIMULATOR_ID := RFCT605TZDK` —
override with `make collector SIMULATOR_ID=<your-device-id>`.

---

## 10. Troubleshooting

### Postgres unhealthy

```bash
docker logs ba33-postgres --tail 50
# usually: port 5450 already in use, change in compose file
```

### "Migrations applied successfully" but tables missing

The migrator tracks applied migrations in `drizzle.__drizzle_migrations`.
If the journal (`infra/db/migrations/meta/_journal.json`) gets out of sync
(e.g. after a rebase), some migrations may be skipped. Apply manually:

```bash
cat infra/db/migrations/000X_<name>.sql | \
  docker exec -i ba33-postgres psql -U ba33 -d ba33_platform
```

### API returns 401 "The current user no longer exists"

The DB was re-seeded with new user IDs but your client still has the old
JWT. Re-login. Or in `web-operations` use the persona picker.

### "Cannot find module '@ba33/...'"

```bash
pnpm install
# or in docker: docker exec ba33-api sh -lc "pnpm install"
```

### Mobile codegen warnings

The hand-written `.g.dart` files have placeholder hashes. Run:

```bash
cd apps/mobile-{shepherd,collector} && \
  flutter pub get && \
  dart run build_runner build --delete-conflicting-outputs
```

### Smoke test fails after fresh boot

The seed needs to run before the e2e test. After `make`, run `make seed`
once. Verify with `bash scripts/test-pipeline.sh` → 55/55.
