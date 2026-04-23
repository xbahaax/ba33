# ba33 — Backend & Database Design (v1)

**Scope:** The first production-ready backend, with PostgreSQL as the database, Drizzle as the ORM, and NestJS as the framework. All external integrations (SMS, OTP delivery, payment gateways, WhatsApp, push notifications, IoT sensors, mTLS, SSO) are **stubbed or skipped** for v1 — the domain and schema are complete, integration wiring comes later.

**Repo:** `ba33-platform`
**Service:** `apps/api`
**DB service:** PostgreSQL via Docker Compose

---

## 1. What's IN for v1 vs OUT

### ✅ IN (build now)

- All domain modules (lots, sources, collection, transport, depot, laverie, transformation, sales, certification, institutional, audit, events)
- Auth module with **email + password + JWT** (no OTP sending, no SMS)
- Event log (append-only) — central traceability spine
- Reconciliation engine (weigh-in vs weigh-out)
- Rules engine (A1 alerts, S2/S3 dispatching, certification gates) — configurable from DB
- Sync endpoints (mobile-facing, ready for Flutter app to hit)
- Mobile-friendly lot creation endpoints (offline-generated IDs accepted)
- BullMQ + Redis for background jobs (still useful for internal workflows)
- OpenAPI spec generation

### ⛔ OUT (stubbed, implement later)

| Feature | What we do for now |
|---|---|
| OTP code delivery via SMS | Endpoint exists, generates + stores code, returns it in response (dev only). No real SMS. |
| Push notifications | Event is logged, notification record created, but no FCM/APNs send |
| WhatsApp bot | Skip entirely — no module |
| SMS gateway | Skip `apps/sms-gateway` entirely |
| Payment processing | Orders created with `payment_status: 'pending'`, no gateway calls |
| Export/customs API integrations | Document generation stubbed |
| mTLS for institutional access | Replaced with JWT + role check |
| SSO for ministries | Replaced with email + password |
| Cold-chain IoT sensors | Temperature column exists, manual entry only |
| External carrier tracking | Manual status updates only |
| Printer integrations | QR code generation works; physical printing handled by mobile later |

### 🗑️ Apps not built in v1

- `apps/sms-gateway` — not created
- `apps/sync-worker` — skipped; background jobs run inside `apps/api` for now (BullMQ workers in the same process)

---

## 2. Tech Stack — Backend

| Concern | Choice |
|---|---|
| Framework | **NestJS 10+** |
| Architecture | **Module-based** (one NestJS module per domain area) |
| ORM | **Drizzle** |
| Database | **PostgreSQL 16+** |
| Database hosting (dev) | **Docker Compose** |
| Cache + Queue | **Redis** (via Docker Compose) |
| Queue lib | **BullMQ** |
| Auth | **JWT** (access + refresh), **bcrypt** password hashing |
| Validation | **Zod** (shared with `@ba33/validation`) |
| API docs | **@nestjs/swagger** → OpenAPI JSON → `@ba33/api-client` codegen |
| Testing | **Vitest** (unit) + **Supertest** (e2e) |
| Logging | **Pino** (structured JSON) |

---

## 3. NestJS Module List (validated, complete for v1)

Each module lives at `apps/api/src/modules/{module}/`. Every module has: `{module}.module.ts`, `{module}.controller.ts`, `{module}.service.ts`, `{module}.repository.ts`, `dto/`, `__tests__/`.

### 3.1 Core infrastructure modules (cross-cutting)

| Module | Owns | Depends on |
|---|---|---|
| `auth` | login, JWT issue/refresh, session tracking | `users` |
| `users` | user accounts, roles, user types | — |
| `events` | the append-only event log, event emitter | — |
| `audit` | Ex/Sx internal audits, reconciliation records | `events`, `lots` |
| `rules` | configurable rule engine (A1, S2/S3, pricing, certification gates) | — |
| `regions` | Algerian wilayas / communes reference data | — |
| `files` | photos, voice notes, documents (stored locally on disk or S3-compatible) | — |

### 3.2 Source modules (Amont / Collection)

| Module | Owns | Depends on |
|---|---|---|
| `sources` | C1 shepherds, C2 slaughterhouses, C3 aggregators | `users`, `regions` |
| `collection` | pre-lots (declarations), collectors, booklets, routes | `sources`, `lots`, `users` |

### 3.3 Lot spine (THE central module)

| Module | Owns | Depends on |
|---|---|---|
| `lots` | the `lots` table, lot lifecycle, lineage (split/merge), photos, voice notes, signatures | `events`, `sources` |

### 3.4 Chain phases

| Module | Owns | Depends on |
|---|---|---|
| `transport` | transport jobs, legs, weigh-in/out, A1 alerts dispatch | `lots`, `events`, `users`, `rules` |
| `depot` | dépôts, zones, receptions (E1), dispatches (S1) | `lots`, `events`, `transport` |
| `laverie` | laveries, batches, washing runs, qualifications (grade/price), S2/S3 dispatch | `lots`, `events`, `rules`, `depot` |
| `transformation` | transformers (D3/D4), BOMs, production runs, products, waste | `lots`, `events`, `laverie` |

### 3.5 Downstream & output

| Module | Owns | Depends on |
|---|---|---|
| `certification` | NFN seals, P1/P2 product codes, verification endpoints | `transformation`, `events`, `rules` |
| `sales` | orders, order items, shipments, buyers, three channels (national/export/institutional) | `certification`, `transformation`, `users` |
| `institutional` | ministry access, query audit log, aggregate stats endpoints | `events`, `lots`, `products` (read-only) |

### 3.6 Sync & notifications

| Module | Owns | Depends on |
|---|---|---|
| `sync` | mobile sync endpoints (push from device, pull to device) | `lots`, `events`, `collection`, `transport` |
| `notifications` | notification records (stubbed delivery) | `events`, `users` |

**Total: 16 modules.** This list is complete and validated — nothing more should be added in v1.

### Module layout inside `apps/api/src/`

```
apps/api/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── regions/
│   ├── files/
│   ├── events/
│   ├── audit/
│   ├── rules/
│   ├── sources/
│   ├── collection/
│   ├── lots/
│   ├── transport/
│   ├── depot/
│   ├── laverie/
│   ├── transformation/
│   ├── certification/
│   ├── sales/
│   ├── institutional/
│   ├── sync/
│   └── notifications/
├── common/
│   ├── database/         (Drizzle client, base repository)
│   ├── auth/             (guards, decorators, JWT strategy)
│   ├── queues/           (BullMQ setup)
│   ├── filters/          (exception filters)
│   ├── interceptors/     (logging, timing)
│   └── pipes/            (Zod validation pipe)
├── app.module.ts
└── main.ts
```

---

## 4. Database Design Principles

1. **UUIDs everywhere.** Every primary key is a UUID v4. Allows offline ID generation from mobile without central coordination.
2. **Timestamps on every table.** `created_at`, `updated_at` at minimum. `deleted_at` only where soft delete is justified.
3. **No true deletes for domain entities.** Lots, events, and products are never deleted — they can be marked `rejected`, `cancelled`, or `archived`.
4. **Append-only event log.** The `events` table is the immutable source of truth. Relational tables are denormalized projections for query performance.
5. **Every handoff is an event.** Weigh-in, weigh-out, scan, sign, print — each is a row in `events`.
6. **Strict foreign keys.** No "soft" references via text IDs. `ON DELETE` is always `RESTRICT` for domain entities.
7. **Enums as PostgreSQL enums.** For closed sets (source type, lot status, channel). Drizzle supports this natively.
8. **JSONB for flexible payloads.** Event payloads, voice note metadata, photo metadata — JSONB with schema validation at the app layer.
9. **Indexes follow queries.** Every query pattern gets an index; no speculative indexes.
10. **Schemas organized by module.** Drizzle schema files mirror the module structure: `schema/lots.ts`, `schema/depot.ts`, etc.

---

## 5. The Database Schema

Organized by module. Each section lists the tables that module owns.

### 5.1 `regions` module

**Table: `regions`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | e.g., "Sétif" |
| code | text unique | e.g., "DZ-19" |
| parent_id | uuid nullable | for commune → wilaya hierarchy |
| type | enum (`wilaya`, `commune`, `village`) | |
| latitude | decimal nullable | |
| longitude | decimal nullable | |
| created_at, updated_at | timestamp | |

### 5.2 `users` module

**Enums**
- `user_type`: `collector`, `depot_manager`, `laverie_operator`, `transformer_operator`, `sales_agent`, `central_admin`, `regional_manager`, `buyer`, `institutional`, `system`
- `user_status`: `active`, `suspended`, `deleted`

**Table: `users`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| email | text unique | |
| password_hash | text | bcrypt |
| full_name | text | |
| phone | text nullable | |
| user_type | user_type | |
| status | user_status | default `active` |
| region_id | uuid (FK → regions) nullable | |
| last_login_at | timestamp nullable | |
| created_at, updated_at | timestamp | |

**Table: `roles`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text unique | |
| permissions | jsonb | array of permission strings |
| created_at, updated_at | timestamp | |

**Table: `user_roles`**

| Column | Type | Notes |
|---|---|---|
| user_id | uuid (FK → users) | composite PK |
| role_id | uuid (FK → roles) | composite PK |
| assigned_at | timestamp | |

**Table: `sessions`** (JWT refresh token tracking)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| refresh_token_hash | text | |
| device_info | jsonb | user agent, etc. |
| expires_at | timestamp | |
| revoked_at | timestamp nullable | |
| created_at | timestamp | |

### 5.3 `sources` module

**Enum**
- `source_type`: `c1_shepherd`, `c2_slaughterhouse`, `c3_aggregator`
- `source_status`: `pending`, `active`, `suspended`

**Table: `sources`** (polymorphic base)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| source_type | source_type | discriminator |
| name | text | |
| contact_phone | text nullable | |
| contact_email | text nullable | |
| region_id | uuid (FK → regions) | |
| latitude | decimal nullable | |
| longitude | decimal nullable | |
| address | text nullable | |
| status | source_status | default `pending` |
| registered_by | uuid (FK → users) nullable | |
| notes | text nullable | |
| created_at, updated_at | timestamp | |

**Table: `shepherds`** (C1 details, extends sources)

| Column | Type | Notes |
|---|---|---|
| source_id | uuid (PK, FK → sources) | |
| has_smartphone | boolean | |
| preferred_language | text | fr/ar/darija/tzm |
| flock_size_estimate | int nullable | |
| typical_yield_kg_per_year | decimal nullable | |

**Table: `slaughterhouses`** (C2 details)

| Column | Type | Notes |
|---|---|---|
| source_id | uuid (PK, FK → sources) | |
| license_number | text | |
| daily_capacity_heads | int nullable | |
| has_cold_storage | boolean | |

**Table: `aggregators`** (C3 details)

| Column | Type | Notes |
|---|---|---|
| source_id | uuid (PK, FK → sources) | |
| business_registration | text | |
| registered_upstream_count | int | default 0 |
| premium_certified | boolean | default false — for NFN Premium |

### 5.4 `collection` module

**Table: `collectors`** (operational info for users of type `collector`)

| Column | Type | Notes |
|---|---|---|
| user_id | uuid (PK, FK → users) | |
| assigned_regions | uuid[] | array of region ids |
| certifications | jsonb | e.g., `{"urgent_c2": true}` |
| active | boolean | default true |

**Table: `collector_booklets`** (pre-printed QR sticker tracking)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| collector_id | uuid (FK → collectors) | |
| serial_start | text | e.g., `CL01-0001` |
| serial_end | text | e.g., `CL01-0100` |
| issued_at | timestamp | |
| revoked_at | timestamp nullable | if booklet is lost |
| revoked_reason | text nullable | |

**Table: `pre_lots`** (shepherd-announced lots, before collection)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| source_id | uuid (FK → sources) | |
| estimated_weight_kg | decimal | |
| estimated_range | text nullable | e.g., "small pile", "large pile" |
| location_lat | decimal nullable | |
| location_lng | decimal nullable | |
| region_id | uuid (FK → regions) | |
| notes | text nullable | |
| voice_note_id | uuid (FK → files) nullable | |
| status | enum (`announced`, `assigned`, `collected`, `cancelled`, `expired`) | |
| assigned_collector_id | uuid (FK → collectors) nullable | |
| scheduled_at | timestamp nullable | |
| lot_id | uuid (FK → lots) nullable | set when pre-lot becomes a real lot |
| created_at, updated_at | timestamp | |

**Table: `routes`** (daily collector routes)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| collector_id | uuid (FK → collectors) | |
| date | date | |
| status | enum (`planned`, `in_progress`, `completed`) | |
| total_planned_kg | decimal nullable | |
| total_actual_kg | decimal nullable | |
| created_at, updated_at | timestamp | |

**Table: `route_stops`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| route_id | uuid (FK → routes) | |
| pre_lot_id | uuid (FK → pre_lots) nullable | |
| source_id | uuid (FK → sources) nullable | |
| order | int | order in the route |
| status | enum (`pending`, `completed`, `skipped`) | |
| arrival_time | timestamp nullable | |

### 5.5 `lots` module — the spine

**Enums**
- `lot_status`: `announced`, `collected`, `in_transit`, `received_depot`, `in_pretri`, `stored`, `dispatched_to_laverie`, `received_laverie`, `washing`, `washed`, `qualified`, `dispatched_to_d3`, `dispatched_to_d4`, `in_transformation`, `transformed`, `certified`, `sold`, `delivered`, `rejected`, `lost`, `quarantined`
- `lot_state_quick`: `clean`, `dirty`, `very_dirty`, `contaminated`, `with_meat`
- `urgency_level`: `normal`, `urgent`

**Table: `lots`** (the central entity)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | offline-generated, namespaced format |
| source_id | uuid (FK → sources) | |
| source_type | source_type | denormalized for fast filtering |
| collector_id | uuid (FK → collectors) nullable | |
| qr_code | text unique | the scannable code |
| declared_weight_kg | decimal nullable | what shepherd/source said |
| actual_weight_kg | decimal nullable | what collector measured |
| state_quick | lot_state_quick nullable | |
| urgency | urgency_level | default `normal` |
| cold_chain_temp_c | decimal nullable | for C2 only |
| gps_lat | decimal nullable | at collection |
| gps_lng | decimal nullable | |
| status | lot_status | |
| is_urgent | boolean | generated from urgency |
| collected_at | timestamp nullable | |
| pre_lot_id | uuid (FK → pre_lots) nullable | |
| route_stop_id | uuid (FK → route_stops) nullable | |
| current_location_id | uuid nullable | FK to depot/laverie/transformer |
| current_location_type | text nullable | `depot`, `laverie`, `transformer`, `in_transit` |
| notes | text nullable | |
| voice_note_id | uuid (FK → files) nullable | |
| created_at, updated_at | timestamp | |

**Table: `lot_photos`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| file_id | uuid (FK → files) | |
| angle | enum (`overview`, `closeup`, `surroundings`, `other`) | |
| captured_at | timestamp | |
| gps_lat, gps_lng | decimal nullable | |

**Table: `lot_signatures`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| type | enum (`digital`, `thumbprint`, `paper_photo`) | |
| file_id | uuid (FK → files) | signature image |
| signed_by_name | text | |
| captured_at | timestamp | |

**Table: `lot_lineage`** (split/merge tracking)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| child_lot_id | uuid (FK → lots) | |
| parent_lot_id | uuid (FK → lots) | |
| weight_contribution_kg | decimal | how much of parent went into child |
| operation | enum (`split`, `merge`) | |
| performed_by | uuid (FK → users) | |
| performed_at | timestamp | |
| notes | text nullable | |

Unique constraint on `(child_lot_id, parent_lot_id)`.

**Table: `lot_weighs`** (denormalized weigh events, for fast lookup)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| phase | text | `collection`, `transport_in`, `transport_out`, `depot_in`, `depot_out`, `laverie_in`, `laverie_out`, etc. |
| weight_kg | decimal | |
| source | enum (`scale_bluetooth`, `manual`, `estimated`) | |
| recorded_by | uuid (FK → users) | |
| recorded_at | timestamp | |
| event_id | uuid (FK → events) | link back to authoritative event |

### 5.6 `transport` module

**Enum**
- `transport_lane`: `normal`, `urgent_cold_chain`, `urgent_standard`
- `job_status`: `pending`, `assigned`, `accepted`, `in_progress`, `delivered`, `cancelled`

**Table: `transporters`** (user-type specialization)

| Column | Type | Notes |
|---|---|---|
| user_id | uuid (PK, FK → users) | |
| vehicle_info | jsonb | plate, type, capacity |
| certifications | jsonb | `{"cold_chain": true, "urgent_lane": true}` |
| active | boolean | |

**Table: `transport_jobs`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| transporter_id | uuid (FK → transporters) nullable | assigned when accepted |
| origin_type | text | `source`, `depot`, `laverie`, `transformer` |
| origin_id | uuid | polymorphic reference |
| destination_type | text | same values |
| destination_id | uuid | |
| lane | transport_lane | |
| status | job_status | |
| sla_deadline | timestamp nullable | for urgent jobs |
| requested_at | timestamp | |
| accepted_at | timestamp nullable | |
| completed_at | timestamp nullable | |
| created_at, updated_at | timestamp | |

**Table: `transport_job_lots`**

| Column | Type | Notes |
|---|---|---|
| job_id | uuid (FK → transport_jobs) | composite PK |
| lot_id | uuid (FK → lots) | composite PK |
| loaded_weight_kg | decimal nullable | on weigh-in |
| delivered_weight_kg | decimal nullable | on weigh-out |
| loaded_at | timestamp nullable | |
| delivered_at | timestamp nullable | |

**Table: `transport_gps_points`** (GPS trail)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| job_id | uuid (FK → transport_jobs) | |
| lat, lng | decimal | |
| temperature_c | decimal nullable | for cold chain |
| recorded_at | timestamp | |

Indexed on `(job_id, recorded_at)`.

### 5.7 `depot` module

**Table: `depots`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| region_id | uuid (FK → regions) | |
| address | text | |
| capacity_kg | decimal | |
| current_weight_kg | decimal | updated on reception/dispatch |
| manager_id | uuid (FK → users) nullable | |
| active | boolean | |
| created_at, updated_at | timestamp | |

**Table: `depot_zones`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| depot_id | uuid (FK → depots) | |
| code | text | e.g., "A-01" |
| purpose | enum (`c1_normal`, `c2_urgent`, `c3_aggregator`, `quarantine`, `dispatch_ready`) | |
| capacity_kg | decimal | |
| current_weight_kg | decimal | |

**Table: `depot_receptions`** (E1 entry audits)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| depot_id | uuid (FK → depots) | |
| lot_id | uuid (FK → lots) | |
| declared_weight_kg | decimal | |
| actual_weight_kg | decimal | |
| discrepancy_kg | decimal | generated: actual − declared |
| tolerance_exceeded | boolean | based on rules |
| zone_id | uuid (FK → depot_zones) nullable | |
| received_by | uuid (FK → users) | |
| received_at | timestamp | |
| notes | text nullable | |

**Table: `depot_dispatches`** (S1 exit audits, batching lots for laverie)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| depot_id | uuid (FK → depots) | |
| destination_laverie_id | uuid (FK → laveries) | |
| manifest_weight_kg | decimal | |
| dispatched_by | uuid (FK → users) | |
| dispatched_at | timestamp | |
| transport_job_id | uuid (FK → transport_jobs) nullable | |

**Table: `depot_dispatch_lots`**

| Column | Type | Notes |
|---|---|---|
| dispatch_id | uuid (FK → depot_dispatches) | composite PK |
| lot_id | uuid (FK → lots) | composite PK |
| weight_kg | decimal | |

**Table: `a1_alerts`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| depot_id | uuid (FK → depots) | |
| trigger_condition | jsonb | which rule fired |
| severity | enum (`info`, `warning`, `critical`) | |
| status | enum (`open`, `acknowledged`, `resolved`) | |
| fired_at | timestamp | |
| resolved_at | timestamp nullable | |

### 5.8 `laverie` module

**Enums**
- `grade`: `A`, `B`, `C`, `reject`
- `safety_status`: `clear`, `flagged`, `rejected`
- `dispatch_track`: `d3_textile`, `d4_bio`, `quarantine`, `reject`

**Table: `laveries`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| region_id | uuid (FK → regions) | |
| address | text | |
| daily_capacity_kg | decimal | |
| manager_id | uuid (FK → users) nullable | |
| active | boolean | |
| created_at, updated_at | timestamp | |

**Table: `laverie_receptions`** (reception at D2)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| laverie_id | uuid (FK → laveries) | |
| lot_id | uuid (FK → lots) | |
| depot_dispatch_id | uuid (FK → depot_dispatches) nullable | |
| received_weight_kg | decimal | |
| received_by | uuid (FK → users) | |
| received_at | timestamp | |

**Table: `pre_wash_checks`** (C2 safety check)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| vet_cert_reference | text nullable | |
| visual_inspection_passed | boolean | |
| contamination_detected | boolean | |
| action | enum (`approved`, `quarantined`, `rejected`) | |
| performed_by | uuid (FK → users) | |
| performed_at | timestamp | |

**Table: `washing_runs`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| laverie_id | uuid (FK → laveries) | |
| lot_id | uuid (FK → lots) | |
| dirty_weight_kg | decimal | weigh-in |
| clean_weight_kg | decimal nullable | weigh-out |
| yield_percent | decimal nullable | generated: (clean/dirty) × 100 |
| water_liters | decimal nullable | |
| chemicals | jsonb nullable | `[{"name":"...","amount":...}]` |
| cycle_duration_minutes | int nullable | |
| water_temp_c | decimal nullable | |
| started_at | timestamp | |
| completed_at | timestamp nullable | |
| operated_by | uuid (FK → users) | |

**Table: `qualifications`** (fiber grading, replaces the old lab)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| washing_run_id | uuid (FK → washing_runs) | |
| fiber_length_mm | decimal nullable | |
| fiber_diameter_micron | decimal nullable | |
| moisture_percent | decimal nullable | |
| cleanliness_score | int nullable | 1-10 |
| color | text nullable | |
| grade | grade | |
| safety_status | safety_status | |
| contamination_notes | text nullable | |
| performed_by | uuid (FK → users) | |
| performed_at | timestamp | |

**Table: `pricing_proposals`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| qualification_id | uuid (FK → qualifications) | |
| base_price_per_kg | decimal | from rules engine |
| urgency_discount_percent | decimal | |
| source_type_adjustment_percent | decimal | |
| final_price_per_kg | decimal | |
| total_value | decimal | final × clean_weight |
| computed_at | timestamp | |

**Table: `laverie_dispatches`** (S2/S3 routing to D3/D4)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| qualification_id | uuid (FK → qualifications) | |
| track | dispatch_track | |
| target_transformer_id | uuid (FK → transformers) nullable | |
| rule_version | int | which rules config decided this |
| dispatched_by | uuid (FK → users) nullable | null if automated |
| dispatched_at | timestamp | |

### 5.9 `transformation` module

**Enums**
- `transformer_track`: `d3_textile`, `d4_bio`
- `product_status`: `in_production`, `produced`, `certified`, `sold`, `shipped`, `delivered`, `rejected`

**Table: `transformers`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| track | transformer_track | |
| region_id | uuid (FK → regions) | |
| address | text | |
| daily_capacity_kg | decimal | |
| manager_id | uuid (FK → users) nullable | |
| active | boolean | |
| created_at, updated_at | timestamp | |

**Table: `boms`** (bills of materials)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| transformer_id | uuid (FK → transformers) | |
| product_type_code | text | e.g., `D3-INS-10CM` |
| product_name | text | |
| input_wool_kg_per_unit | decimal | |
| additives | jsonb | `[{"name":"...","amount":...,"unit":"..."}]` |
| expected_yield_percent | decimal | |
| version | int | |
| active | boolean | |
| created_at, updated_at | timestamp | |

**Table: `production_runs`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| transformer_id | uuid (FK → transformers) | |
| bom_id | uuid (FK → boms) | |
| bom_version | int | |
| input_weight_kg | decimal | |
| output_weight_kg | decimal nullable | |
| waste_weight_kg | decimal nullable | |
| yield_percent | decimal nullable | |
| started_at | timestamp | |
| completed_at | timestamp nullable | |
| operated_by | uuid (FK → users) | |

**Table: `production_run_lots`**

| Column | Type | Notes |
|---|---|---|
| run_id | uuid (FK → production_runs) | composite PK |
| lot_id | uuid (FK → lots) | composite PK |
| weight_used_kg | decimal | |

**Table: `products`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| production_run_id | uuid (FK → production_runs) | |
| product_code | text unique | P1-xxxxx or P2-xxxxx |
| product_type_code | text | from BOM |
| track | transformer_track | |
| quantity | decimal | |
| unit | text | e.g., "panel", "kg", "m²" |
| weight_kg | decimal | physical weight |
| status | product_status | |
| certification_id | uuid (FK → certifications) nullable | set when certified |
| created_at, updated_at | timestamp | |

**Table: `waste_records`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| production_run_id | uuid (FK → production_runs) nullable | |
| washing_run_id | uuid (FK → washing_runs) nullable | |
| amount_kg | decimal | |
| category | enum (`reusable`, `recoverable`, `disposal`) | |
| destination | text nullable | e.g., "reinjected next batch", "compost" |
| recorded_by | uuid (FK → users) | |
| recorded_at | timestamp | |

### 5.10 `certification` module

**Enum**
- `cert_status`: `pending`, `issued`, `revoked`

**Table: `certifications`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK → products) | |
| product_code | text | denormalized |
| status | cert_status | |
| gates_passed | jsonb | which rule gates were checked |
| signature | text | cryptographic signature |
| issued_by | uuid (FK → users) nullable | null if auto-issued |
| issued_at | timestamp nullable | |
| revoked_at | timestamp nullable | |
| revoked_reason | text nullable | |
| qr_code_url | text | public verification URL |
| created_at, updated_at | timestamp | |

### 5.11 `sales` module

**Enums**
- `channel`: `national`, `export`, `institutional`
- `order_status`: `draft`, `quote`, `confirmed`, `paid`, `preparing`, `shipped`, `delivered`, `returned`, `cancelled`
- `payment_status`: `pending`, `partial`, `paid`, `refunded`

**Table: `buyers`** (extends users)

| Column | Type | Notes |
|---|---|---|
| user_id | uuid (PK, FK → users) | |
| company_name | text | |
| registration_number | text nullable | |
| preferred_channel | channel | |
| credit_limit | decimal nullable | |
| billing_address | jsonb | |
| shipping_addresses | jsonb | array |

**Table: `orders`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| buyer_id | uuid (FK → buyers) | |
| channel | channel | |
| status | order_status | |
| payment_status | payment_status | default `pending` |
| subtotal | decimal | |
| tax | decimal | |
| total | decimal | |
| currency | text | `DZD`, `EUR`, `USD` |
| quoted_at | timestamp nullable | |
| confirmed_at | timestamp nullable | |
| delivered_at | timestamp nullable | |
| created_at, updated_at | timestamp | |

**Table: `order_items`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| order_id | uuid (FK → orders) | |
| product_id | uuid (FK → products) | |
| product_code | text | denormalized |
| quantity | decimal | |
| unit_price | decimal | |
| subtotal | decimal | |

**Table: `shipments`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| order_id | uuid (FK → orders) | |
| status | enum (`pending`, `in_transit`, `delivered`, `returned`) | |
| tracking_reference | text nullable | |
| shipped_at | timestamp nullable | |
| delivered_at | timestamp nullable | |

**Table: `sales_documents`** (invoices, certs, export docs)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| order_id | uuid (FK → orders) | |
| type | enum (`invoice`, `traceability_certificate`, `origin_certificate`, `export_declaration`, `other`) | |
| file_id | uuid (FK → files) | |
| generated_at | timestamp | |

### 5.12 `institutional` module

**Table: `institutional_users`** (extends users)

| Column | Type | Notes |
|---|---|---|
| user_id | uuid (PK, FK → users) | |
| institution_name | text | |
| mandate | jsonb | what scopes they can access |
| active | boolean | |

**Table: `institutional_queries`** (audit log for every institutional query)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| query_type | enum (`lot_lookup`, `product_lookup`, `shepherd_lookup`, `cert_verify`, `aggregate_stats`, `export`) | |
| query_params | jsonb | what was asked |
| result_count | int | |
| justification | text nullable | required for PII queries |
| performed_at | timestamp | |

### 5.13 `events` module (cross-cutting)

**Table: `events`** (the append-only log)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_type | text | `lot.collected`, `lot.received_depot`, `certification.issued`, etc. |
| aggregate_type | text | `lot`, `order`, `user`, `certification` |
| aggregate_id | uuid | |
| actor_id | uuid (FK → users) nullable | null if system |
| actor_type | text | `user`, `system`, `rule_engine` |
| payload | jsonb | event-specific data |
| occurred_at | timestamp | when it happened in real world |
| recorded_at | timestamp | when it reached the backend (differ for offline) |
| sync_source | text nullable | `mobile_collector`, `web_operations`, etc. |
| device_id | uuid nullable | for mobile events |
| version | int | sequence per aggregate |
| checksum | text | for tamper detection |

**Indexes:**
- `(aggregate_type, aggregate_id, version)` — for rebuilding state
- `(event_type, occurred_at)` — for reporting
- `(recorded_at)` — for sync deltas

**Table: `event_subscriptions`** (internal event bus)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| event_type_pattern | text | e.g., `lot.*`, `certification.issued` |
| handler_name | text | which internal handler |
| active | boolean | |

### 5.14 `audit` module

**Table: `audits`** (Ex/Sx internal audits at each phase)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| audit_type | enum (`entry_e1`, `exit_s1`, `internal_ex`, `internal_sx`, `reconciliation`) | |
| subject_type | text | `lot`, `production_run`, `transport_job` |
| subject_id | uuid | |
| findings | jsonb | |
| passed | boolean | |
| auditor_id | uuid (FK → users) | |
| performed_at | timestamp | |

**Table: `reconciliations`** (automatic weigh-in vs weigh-out checks)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lot_id | uuid (FK → lots) | |
| phase_from | text | `collection`, `depot`, `laverie`, etc. |
| phase_to | text | |
| weight_out_kg | decimal | |
| weight_in_kg | decimal | |
| delta_kg | decimal | generated: in − out |
| tolerance_kg | decimal | from rules |
| within_tolerance | boolean | |
| flagged | boolean | if outside tolerance |
| computed_at | timestamp | |

### 5.15 `rules` module

**Table: `rules_config`** (configurable runtime rules)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| rule_key | text | `a1.depot_weight_threshold`, `s2s3.d3_min_grade`, `pricing.urgency_discount`, `cert.required_gates` |
| value | jsonb | the rule's config |
| description | text | |
| version | int | |
| effective_from | timestamp | |
| effective_to | timestamp nullable | |
| created_by | uuid (FK → users) | |
| created_at | timestamp | |

### 5.16 `files` module

**Table: `files`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| kind | enum (`photo`, `voice_note`, `signature`, `document`, `certificate_pdf`) | |
| mime_type | text | |
| storage_path | text | local or S3-style key |
| size_bytes | int | |
| uploaded_by | uuid (FK → users) nullable | |
| metadata | jsonb nullable | dimensions, duration, etc. |
| created_at | timestamp | |

### 5.17 `notifications` module (stubbed)

**Table: `notifications`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| type | text | `lot.assigned`, `alert.a1`, `shipment.delivered` |
| title | text | |
| body | text | |
| payload | jsonb nullable | |
| read_at | timestamp nullable | |
| sent_at | timestamp nullable | null for v1 (not actually sent) |
| created_at | timestamp | |

### 5.18 `sync` module

**Table: `sync_devices`**

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| device_id | uuid unique | |
| device_info | jsonb | os, version, app_version |
| last_sync_at | timestamp nullable | |
| namespace_prefix | text | for offline ID generation |
| created_at | timestamp | |

**Table: `sync_batches`** (log of sync operations)

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| device_id | uuid (FK → sync_devices) | |
| direction | enum (`push`, `pull`) | |
| event_count | int | |
| status | enum (`pending`, `completed`, `failed`) | |
| error | text nullable | |
| started_at | timestamp | |
| completed_at | timestamp nullable | |

---

## 6. Key Relationships Summary

**The lot is the spine.** Everything hangs off `lots`:
- `lots.source_id → sources`
- `lot_events → events` (via `aggregate_id`)
- `lot_photos, lot_signatures, lot_weighs, lot_lineage`
- `depot_receptions.lot_id`, `depot_dispatch_lots.lot_id`
- `laverie_receptions.lot_id`, `washing_runs.lot_id`, `qualifications.lot_id`
- `production_run_lots.lot_id`
- `reconciliations.lot_id`

**Traversal paths:**
- From a sold `product` → `certification` → `products.production_run` → `production_run_lots` → `lots` → `sources` → original shepherd.
- From a `source` → `lots` (where source_id = ...) → forward through chain.

**Split/merge:**
- A lot can have multiple parents (merge) or multiple children (split) via `lot_lineage`. Traversal is recursive.

---

## 7. Initial Seed Data (bootstrap)

On first migration, seed:

1. **Regions:** All 58 Algerian wilayas + major communes.
2. **Roles:** `admin`, `collector`, `depot_manager`, `laverie_operator`, `transformer_operator`, `sales_agent`, `central_admin`, `buyer`, `institutional`.
3. **Default admin user:** email from env var, password hashed, role `admin`.
4. **Default rules config:**
   - `a1.depot_weight_threshold_percent`: 85
   - `a1.depot_urgent_count_threshold`: 5
   - `s2s3.d3_min_grade`: "B"
   - `s2s3.d3_min_fiber_length_mm`: 50
   - `pricing.urgency_discount_percent`: 15
   - `pricing.c2_safety_premium_percent`: -10
   - `reconciliation.tolerance_percent`: 2
   - `cert.required_gates`: `["e1_passed", "s1_passed", "r1_within_range", "s2_dispatched", "ex_sx_cleared", "no_open_anomalies"]`
   - `sla.c2_pickup_hours`: 4
   - `sla.c1_pickup_hours`: 72
5. **At least one `depot`, one `laverie`, one `transformer D3`, one `transformer D4`** for dev/testing.

---

## 8. Docker Compose (dev environment)

Create `infra/docker/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ba33-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ba33
      POSTGRES_PASSWORD: ba33_dev_password
      POSTGRES_DB: ba33_platform
    ports:
      - "5432:5432"
    volumes:
      - ba33-postgres-data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ba33 -d ba33_platform"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ba33-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ba33-redis-data:/data

volumes:
  ba33-postgres-data:
  ba33-redis-data:
```

Run: `docker compose -f infra/docker/docker-compose.yml up -d`.

---

## 9. Drizzle Setup

**Location:** `apps/api/src/common/database/` and schema files in `apps/api/src/common/database/schema/`.

**Structure:**
```
apps/api/src/common/database/
├── schema/
│   ├── index.ts            # re-exports everything
│   ├── enums.ts            # all pgEnum definitions
│   ├── regions.ts
│   ├── users.ts
│   ├── sources.ts
│   ├── collection.ts
│   ├── lots.ts
│   ├── transport.ts
│   ├── depot.ts
│   ├── laverie.ts
│   ├── transformation.ts
│   ├── certification.ts
│   ├── sales.ts
│   ├── institutional.ts
│   ├── events.ts
│   ├── audit.ts
│   ├── rules.ts
│   ├── files.ts
│   ├── notifications.ts
│   └── sync.ts
├── drizzle.config.ts       # points to schema folder
├── migrations/             # generated, gitignored? No, committed.
├── client.ts               # Drizzle client, exported as Nest provider
└── database.module.ts      # Nest module
```

**Drizzle config:**
```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/common/database/schema/index.ts',
  out: '../../infra/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Migrations command flow:**
- `pnpm drizzle-kit generate` → generates SQL migration file
- `pnpm drizzle-kit migrate` → applies to DB
- Migrations committed to `infra/db/migrations/` (shared infrastructure)

---

## 10. Backend Constraints Summary

1. **Module boundaries are strict.** A module only reads/writes its own tables. Cross-module reads go through the other module's service, never direct DB.
2. **Every state change emits an event.** No silent updates. Events are written in the same transaction as the state change.
3. **Repositories handle data access.** Services never touch Drizzle directly. This keeps tests simple.
4. **DTOs are generated from Zod schemas** in `@ba33/validation`. No hand-written DTOs.
5. **No business logic in controllers.** Controllers parse → call service → return. That's it.
6. **No business logic in repositories.** Repositories are thin CRUD + query builders.
7. **Pure domain logic lives in `@ba33/domain`** (framework-free package), imported by services.
8. **Transactions wrap multi-table writes.** Drizzle's `db.transaction()` is used whenever more than one table is written.
9. **Every FK is enforced.** No "soft" references via text. If the relation matters, it's an FK.
10. **No migrations edited after applied.** New migration files only.
11. **Enums live in `schema/enums.ts`.** Never string literals scattered in schemas.
12. **Timestamps are always UTC.** `timestamp with time zone` in Postgres.
13. **Soft delete only where justified.** `users`, `sources` (accounts can be suspended). Lots, events, products are never deleted — status change only.
14. **OpenAPI spec is published at `/api/openapi.json`** in dev; committed to repo for codegen on mobile side.
15. **Tests required:** every service method has at least one unit test. Every controller has at least one e2e test.

---

## 11. What to Build First (backend order)

1. Docker Compose up, Postgres + Redis running
2. `common/database/` — Drizzle client + first migration
3. `regions` module (seed data)
4. `users` module + `auth` module (email/password, JWT)
5. `files` module (local disk storage for v1)
6. `events` module (core of everything)
7. `sources` module (C1/C2/C3)
8. `lots` module (the spine)
9. `collection` module (routes, pre-lots, booklets)
10. `transport` module
11. `depot` module
12. `laverie` module
13. `transformation` module
14. `certification` module
15. `sales` module
16. `institutional` module
17. `audit` module + `reconciliation` jobs
18. `rules` module + runtime loading
19. `sync` module (for mobile)
20. `notifications` module (stubbed delivery)

After step 8 you have a working lot spine. After step 14 you have end-to-end traceability. After step 16 the full loop is alive.