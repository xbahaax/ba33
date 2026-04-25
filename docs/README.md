# ba33 — Documentation

> NFN wool traceability platform for Algeria — track every kilogram of wool
> from the source (shepherd, slaughterhouse, butcher, aggregator) to the
> certified finished product (insulation panels, geotextiles, biofertilizers).

**Status:** MVP for hackathon demo · 55/55 e2e pipeline tests green.

---

## Documentation index

Read these in order if you're new. Each doc is self-contained and
cross-referenced.

### Start here
| # | Doc | What it covers |
|---|---|---|
| 0 | **[README.md](README.md)** (this file) | Doc index + 5-minute quickstart |
| 1 | **[PRD.md](PRD.md)** | Product vision, problem, users, MVP scope |

### Understand the system
| # | Doc | What it covers |
|---|---|---|
| 2 | **[ARCHITECTURE.md](ARCHITECTURE.md)** | Monorepo layout, tech stack, dependency graph |
| 3 | **[DATA_MODEL.md](DATA_MODEL.md)** | Database schema, event log, key relationships |
| 4 | **[API_REFERENCE.md](API_REFERENCE.md)** | All 137 endpoints, organized by module |
| 5 | **[PIPELINE.md](PIPELINE.md)** | End-to-end data flow from source to sale |
| 6 | **[WORKFLOWS.md](WORKFLOWS.md)** | Each phase (collection / depot / laverie / etc.) deep dive |

### Use the apps
| # | Doc | What it covers |
|---|---|---|
| 7 | **[MOBILE_APPS.md](MOBILE_APPS.md)** | mobile-shepherd + mobile-collector |
| 8 | **[WEB_APPS.md](WEB_APPS.md)** | web-operations + web-buyer + web-institutional |
| 9 | **[AUTH_AND_RBAC.md](AUTH_AND_RBAC.md)** | Personas, permissions, role-based routing |

### Run, demo, extend
| # | Doc | What it covers |
|---|---|---|
| 10 | **[DEPLOYMENT.md](DEPLOYMENT.md)** | Docker, environment variables, migrations, seed |
| 11 | **[TESTING.md](TESTING.md)** | E2E pipeline test script, smoke tests |
| 12 | **[DEMO_GUIDE.md](DEMO_GUIDE.md)** | Step-by-step hackathon demo script |
| 13 | **[DEVELOPMENT.md](DEVELOPMENT.md)** | Conventions, codegen, contribution rules |

---

## 5-minute quickstart

```bash
# 1. Boot infra + API + 3 web apps
make

# 2. (in separate terminals) launch the mobile apps on a simulator
make shepherd
make collector

# 3. Run the e2e smoke test
bash scripts/test-pipeline.sh   # → 55/55 pass
```

**Default services**
- API: `http://localhost:3001` (Swagger at `/api/docs`)
- web-operations: `http://localhost:3000`
- web-buyer: `http://localhost:3001` (separate Next.js, port collides — see DEPLOYMENT.md)
- Postgres: `localhost:5450`, Redis: `localhost:6390`

**Demo personas** (all password `password123`):
| Phone | Name | Role |
|---|---|---|
| `0555000001` | Yacine Admin | central_admin |
| `0555000002` | Amina Collecte | collector |
| `0555000003` | Karim Depot | depot_manager |
| `0555000010` | Omar Berger | shepherd |

Buyer portal: `buyer@ba33.dz` / `Buyer@2026!`

---

## What's in this repository

```
ba33/
├── apps/
│   ├── api/                     # NestJS backend (16 modules, 137 endpoints)
│   ├── mobile-shepherd/         # Flutter — unified wool source app
│   ├── mobile-collector/        # Flutter — instruction-driven collection
│   ├── web-operations/          # Next.js — internal command center
│   ├── web-buyer/               # Next.js — B2B buyer portal
│   └── web-institutional/       # Next.js — ministry oversight portal
├── packages/
│   ├── ba33_ui/                 # Flutter design system
│   ├── ba33_domain/             # Pure-Dart domain models
│   ├── ba33_api_client/         # Generated Dart API client
│   ├── ba33_offline_sync/       # Dart offline queue (stub)
│   ├── ui-web/                  # React/shadcn design system
│   ├── api-client/              # TS API client (stub for OpenAPI codegen)
│   ├── domain/                  # TS shared domain (stub)
│   ├── types/                   # TS shared types (stub)
│   ├── validation/              # Zod schemas (TS)
│   └── design-tokens/           # JSON tokens, OKLCH
├── infra/
│   ├── docker/docker-compose.yml
│   └── db/migrations/           # 3 Drizzle migrations
├── scripts/
│   └── test-pipeline.sh         # E2E pipeline smoke test
├── Makefile                     # All dev commands
└── docs/                        # ← you are here
```

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full breakdown.

---

## The product in one paragraph

A shepherd (or slaughterhouse, butcher, aggregator) opens **mobile-shepherd**,
taps a single big button, fills a form (weight, breed, bag count, dates),
submits. The backend creates a **pre-lot** + auto-issues a **collection job**
to the closest depot. A depot manager opens **web-operations**, sees the job
in the *Missions de collecte* panel, picks a collector. The collector opens
**mobile-collector**, sees the instruction, taps **Accepter** → **Démarrer**
→ Maps opens, GPS detects arrival within 150m → fills an arrival form
(verified weight, state). Submitting creates the **lot**, which flows through
**transport → depot reception (E1) → dispatch (S1) → laverie (wash + qualify
+ S2/S3 dispatch) → transformation (D3 textile or D4 bio) → certification
(NFN seal) → sales (national/export/institutional)**. Every state transition
is an immutable event in the event log. Every weigh-in/weigh-out is
reconciled against tolerance. Buyers verify the NFN seal on a public page.

This is a **single backend** serving three web apps and two Flutter apps. The
API at `/api/v1/*` is shared; mobile and web hit identical endpoints.

For the full feature spec, see **[PRD.md](PRD.md)**.
For the data flow with sequence diagrams, see **[PIPELINE.md](PIPELINE.md)**.
