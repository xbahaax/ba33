# Architecture

## 1. The shape

**One backend, six clients, one event log.** The NestJS API at
`apps/api` exposes `/api/v1/*`. Two Flutter mobile apps and three Next.js
web apps consume that API directly. No GraphQL gateway, no BFF. Drizzle
ORM owns Postgres, BullMQ + Redis handle background work.

```
                ┌────────────────────────────────────────────────┐
                │              apps/api  (NestJS 10)             │
                │  ┌──────────────────────────────────────────┐  │
                │  │ 16 modules · 137 endpoints · /api/v1     │  │
                │  │ JWT auth · RBAC · event log · BullMQ     │  │
                │  └──────────────────────────────────────────┘  │
                │     │                                          │
                │     ▼                                          │
                │  Drizzle ORM ──► Postgres 16  ◄── Redis 7     │
                └────────────────┬───────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ MOBILE       │         │ WEB          │         │ EXTERNAL     │
│              │         │              │         │              │
│ shepherd     │         │ operations   │         │ buyer portal │
│ collector    │         │ (admin etc.) │         │ institutional│
└──────────────┘         └──────────────┘         └──────────────┘
   Flutter 3.11             Next.js 15                Next.js 15
   Riverpod                  React 19                  React 19
   go_router                 shadcn/Tailwind           shadcn/Tailwind
```

---

## 2. Monorepo layout

The repo is a **pnpm workspace + Melos hybrid** — pnpm manages TypeScript
packages, Melos (`melos.yaml`) manages Flutter packages.

```
ba33/
├── apps/
│   ├── api/                    NestJS API
│   ├── mobile-shepherd/        Flutter — wool source app
│   ├── mobile-collector/       Flutter — collector app
│   ├── web-operations/         Next.js — internal command center
│   ├── web-buyer/              Next.js — B2B portal
│   └── web-institutional/      Next.js — ministry portal
├── packages/
│   ├── ba33_ui/                Flutter design system (theme + components)
│   ├── ba33_domain/            Pure-Dart models, enums, IdGenerator
│   ├── ba33_api_client/        Dart Dio-based API client
│   ├── ba33_offline_sync/      [stub] offline event queue
│   ├── ui-web/                 React design system (shadcn/ui based)
│   ├── api-client/             [stub] TypeScript API client
│   ├── domain/                 [stub] TypeScript domain
│   ├── types/                  [stub] TypeScript types
│   ├── validation/             Zod schemas (shared)
│   └── design-tokens/          tokens.json (OKLCH)
├── infra/
│   ├── docker/docker-compose.yml
│   └── db/migrations/          Drizzle migrations (committed)
├── scripts/test-pipeline.sh    E2E smoke test (55/55)
└── Makefile                    All dev commands
```

**Dependency direction is inward-only.** `apps/` → `packages/`. Apps never
import from other apps. Packages never import from apps. `ba33_domain` has
zero Flutter dependency.

---

## 3. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Backend framework | **NestJS 10** | Module isolation, dependency injection, OpenAPI |
| ORM | **Drizzle 0.33** | Typed SQL, lightweight, plays well with Postgres enums |
| Database | **Postgres 16** | Append-only log, JSONB for payloads, mature |
| Cache + queue | **Redis 7** + **BullMQ** | Standard, scales |
| Auth | **JWT + bcrypt** | Stateless, mobile-friendly |
| Validation | **Zod** + class-validator | Two layers — schema + DTO |
| API docs | **@nestjs/swagger** | Auto-generated from decorators |
| Logging | **Pino** | Structured JSON, fast |
| Testing | **Vitest** + Supertest | Standard |
| Mobile | **Flutter 3.11** + **Riverpod 2.6** | Strict-typed providers, codegen |
| Mobile router | **go_router 14** | Type-safe routes, redirects |
| Web | **Next.js 15** + **React 19** + **Tailwind 4** | App Router, server components |
| Web UI | **shadcn/ui** + Radix | No raw component code, accessible |
| Tokens | **OKLCH** in `tokens.json` | Modern color space, perceptual uniformity |
| Build | **Turborepo** + **pnpm** + **Melos** | One command to rule them all |
| Container | **Docker Compose** | Postgres + Redis + API + web-ops in one boot |

---

## 4. The 16 NestJS modules

Each module lives at `apps/api/src/modules/{name}/` with this anatomy:

```
{module}/
├── {module}.module.ts          # Nest module
├── {module}.controller.ts      # HTTP routes
├── {module}.service.ts         # Business logic
├── {module}.repository.ts      # Drizzle queries
├── dto/                        # Request/response DTOs
└── __tests__/                  # Unit + e2e
```

| # | Module | Owns | Depends on |
|---|---|---|---|
| 1 | `auth` | login, JWT, refresh, sessions, dev-login | `users` |
| 2 | `users` | accounts, roles, permissions, access mgmt | — |
| 3 | `regions` | wilayas, communes, villages | — |
| 4 | `files` | photos, voice notes, signatures, certs | — |
| 5 | `events` | append-only log, recent / by-aggregate | — |
| 6 | `audit` | Ex/Sx audits, weight reconciliations | `events`, `lots` |
| 7 | `rules` | configurable runtime rules engine | — |
| 8 | `sources` | C1 shepherds, C2 slaughterhouses, C3 aggregators (now: any wool source) | `users`, `regions` |
| 9 | `collection` | pre-lots, **collection jobs**, collectors, routes, booklets | `sources`, `lots`, `users`, `transport`, `notifications` |
| 10 | `lots` | the spine — lot, photos, signatures, lineage, weighs | `events`, `sources` |
| 11 | `transport` | transport jobs, GPS, weigh-in/out, A1 dispatch | `lots`, `events`, `users`, `rules` |
| 12 | `depot` | depots, zones, receptions (E1), dispatches (S1), A1 alerts | `lots`, `events`, `transport` |
| 13 | `laverie` | washing runs, qualifications, S2/S3 dispatch, pricing | `lots`, `events`, `rules` |
| 14 | `transformation` | transformers (D3/D4), BOMs, runs, products, waste | `lots`, `events`, `laverie` |
| 15 | `certification` | NFN seals, P1/P2 codes, verification | `transformation`, `events`, `rules` |
| 16 | `sales` | orders, items, shipments, buyers, 3 channels | `certification`, `transformation`, `users` |

Plus three transverse modules:

| Module | Owns |
|---|---|
| `operations` | Cross-module aggregations: command center, fulfillment, validation, traceability |
| `institutional` | Ministry read-only views, query audit log, aggregate stats |
| `sync` | Mobile push/pull endpoints, device registration |
| `notifications` | Stubbed-delivery notification records |
| `seed` | Demo data seeder (callable via `POST /api/v1/seed`) |

Total: **20 modules** wired into `AppModule`, exposing **137 endpoints**.

---

## 5. The two-actor collection model

Originally the cahier described C1/C2/C3 sources + Shepherd Lite + Collector
apps as separate flows. The MVP collapses this into **two actors**:

1. **Wool source** — anyone with wool. Picks profession at first login
   (shepherd / slaughterhouse / butcher / aggregator / other), uses a single
   form to declare. App: `mobile-shepherd`.

2. **Collector** — execution-only. Receives instructions (`collection_jobs`)
   issued by the depot, accepts, drives (GPS tracked), arrives (auto-detected
   within 150 m), submits an arrival form. App: `mobile-collector`.

The lot is created **at arrival**, not in the field. The pre-lot closes, the
job completes, transport jobs fire automatically downstream. See
**[WORKFLOWS.md](WORKFLOWS.md#collection)** for the state machine.

---

## 6. Cross-cutting concerns

| Concern | Implementation |
|---|---|
| **Event sourcing** | Append-only `events` table, version per aggregate, SHA-256 checksum. Every state transition writes one row. |
| **Reconciliation** | `audit.reconciliations` table. After every weigh-out, a job computes delta vs. prior weigh-in, flags > tolerance%. |
| **RBAC** | `userType` enum gives a baseline permission set (39 perms total). Custom roles add more. Guards: `JwtAuthGuard` + `PermissionsGuard`/`RolesGuard`. See [AUTH_AND_RBAC.md](AUTH_AND_RBAC.md). |
| **Rules engine** | `rules_config` table. Versioned, time-bounded. Read at runtime by `RulesService.getRuleValue<T>(key)`. Used for SLA, A1 thresholds, S2/S3 dispatch, pricing. |
| **ID generation** | Server: `uuid` v4. Mobile: also v4 (no namespacing collision risk yet — IDs are random 128-bit). |
| **Logging** | Pino structured JSON. Audit interceptor logs every API call with actor + duration + status. |
| **OpenAPI** | Generated from `@ApiTags`/`@ApiOperation` decorators. Available at `GET /api/openapi.json` (planned for codegen — not wired yet). |

---

## 7. The mobile architecture

Both Flutter apps follow **MVVM with Riverpod**:

```
lib/
├── main.dart                            # ProviderScope + MaterialApp.router
├── navigation/router.dart               # go_router config + redirects
├── shared/providers/                    # api_provider, auth_provider, …
└── features/
    └── {feature}/
        ├── view/                        # Screens (ConsumerWidget / ConsumerStatefulWidget)
        ├── view_model/                  # @riverpod classes (.dart + .g.dart)
        ├── model/                       # Local models (POCOs)
        └── widgets/                     # Feature-local components
```

**Rules**:
- Riverpod is the **only** state management. No Provider/Bloc/GetX.
- Every `@Riverpod` class generates a `.g.dart` next to it via `build_runner`.
- `ref.watch` in `build`, `ref.read` in callbacks.
- Async state via `AsyncValue.when(data:, loading:, error:)`. No raw `Future<T>` in UI.
- No business logic in widgets — lives in view models or `ba33_domain`.

---

## 8. The web architecture

The three Next.js apps share `@ba33/ui-web` (shadcn/ui) and `@ba33/design-tokens`.
Each app is independent (separate `package.json`, separate Tailwind config).

```
apps/web-operations/src/
├── app/                                 # Next.js App Router
│   ├── (admin)/admin/...                # Route groups by role
│   ├── (depot)/depot/page.tsx
│   ├── (laverie)/laverie/page.tsx
│   ├── (sales)/sales/page.tsx
│   ├── (transformation)/...
│   └── login/page.tsx
├── components/                          # Shared workflow components
│   ├── depot-workflow-page.tsx
│   ├── laverie-workflow-page.tsx
│   ├── collection-jobs-panel.tsx        # New for two-actor model
│   └── ...
└── lib/
    ├── api.ts                           # Backend client (137 endpoint helpers)
    ├── role-routing.ts                  # userType → home route
    └── format.ts
```

Token storage:
- web-operations: `localStorage` + `ba33-token` cookie (for SSR)
- web-buyer: `ba33_buyer_token` cookie (HTTP-only-friendly)
- web-institutional: `localStorage` (no SSR auth)

---

## 9. Data flow tl;dr

```
mobile-shepherd  ──POST /collection/pre-lots/declare──┐
                                                      │
                                                      ▼
                                          ┌─────────────────────┐
                                          │  collection.service │
                                          │  ─ create source    │
                                          │  ─ create pre-lot   │
                                          │  ─ emit event       │
                                          │  ─ auto-issue job   │──► closest depot
                                          └─────────────────────┘
                                                      │
                              ┌───────────────────────┘
                              ▼
   mobile-collector  ──GET /collection/jobs/me──► [job in queue]
                              │
                              │ accept → start → gps → arrive → complete
                              ▼
                        creates LOT + closes pre-lot + closes job
                              │
                              │  (downstream: transport → depot E1 → depot S1
                              │   → laverie reception → wash → qualify → S2/S3
                              │   → transformation → certification → sale)
                              ▼
                        web-operations and web-buyer see it.
                        events table records every transition.
```

See **[PIPELINE.md](PIPELINE.md)** for sequence diagrams of every phase.
