# Workflows

> Every phase of the chain, with state machines, business rules, and the
> exact endpoints + DTOs involved. Cross-reference with
> [API_REFERENCE.md](API_REFERENCE.md) and [DATA_MODEL.md](DATA_MODEL.md).

---

## 1. Collection (the two-actor model)

### State machine — `pre_lots`

```
                (declare-wool)
                       │
                       ▼
                 ┌──────────┐
                 │ announced│
                 └─────┬────┘
                       │ (auto-issue collection job)
                       ▼
                       │   (job.assign)
                       ▼
                 ┌──────────┐
                 │ assigned │
                 └─────┬────┘
                       │ (job.complete)
                       ▼
                 ┌──────────┐
                 │ collected│  ← lot_id linked
                 └──────────┘

                 (or any time)
                       │
                       ▼
              cancelled / expired (72h cron)
```

### State machine — `collection_jobs`

```
              (auto-issue)
                  │
                  ▼
              ┌─────────┐
              │ pending │
              └────┬────┘
                   │ depot manager assigns
                   ▼
              ┌──────────┐
              │ assigned │
              └────┬─────┘
                   │ collector accepts
                   ▼
              ┌──────────┐
              │ accepted │
              └────┬─────┘
                   │ collector starts trip (begins GPS)
                   ▼
              ┌─────────────┐
              │ in_progress │
              └────┬────────┘
                   │ GPS detects ≤150m or manual mark
                   ▼
              ┌──────────┐
              │ arrived  │
              └────┬─────┘
                   │ submit arrival form (POST /complete)
                   ▼
              ┌──────────┐
              │ completed│  ← lot created, lot_id set
              └──────────┘

              (or any open state)
                   │
                   ▼
              cancelled
```

### Auto-issuance logic

When a source declares wool:

1. `CollectionService.declareWool` ensures a `sources` row exists for the user
   (creates one with `profession` if missing).
2. `createPreLot` writes the pre-lot row + emits `collection.prelot.announced`.
3. `autoIssueCollectionJob`:
   - Calls `findClosestDepot(regionId, lat, lng)` — region-matched, falls back
     to any active depot.
   - Creates a `collection_jobs` row with `status='pending'` and the depot as
     `destination_depot_id`.
   - Emits `collection.job.issued`.
4. The depot manager sees it in **Missions de collecte** on `web-operations`.

### GPS arrival detection (mobile-collector)

`ActiveJobViewModel` (in `lib/features/jobs/view_model/active_job_view_model.dart`):

- On `start()`, the API is called (`PATCH /start`) then GPS streaming begins
  via `Geolocator.getPositionStream(distanceFilter: 10, accuracy: best)`.
- Each GPS sample updates `state.lastFix` and computes
  `Geolocator.distanceBetween(currentLat, currentLng, jobOriginLat, jobOriginLng)`.
- Points are batched in `_unpushed`. A timer pushes the batch every 30s via
  `POST /collection/jobs/:id/gps`. On failure, the batch is re-queued.
- When `distanceToOriginMeters ≤ 150`, `state.hasArrived = true`. The UI
  enables the "Confirmer l'arrivée" button.
- Manual fallback: "Je suis arrivé manuellement" with confirm dialog.
- On `markArrived()`, pushes any pending GPS, then `PATCH /arrive`.
- On `complete()`, pushes any pending GPS, then `POST /complete` with the
  arrival form. Stops streaming. Invalidates `jobsViewModelProvider` so the
  list refreshes.

---

## 2. Transport (depot-onwards legs)

The collector→depot leg is handled by the collection model; transport jobs
between facilities (depot→laverie, laverie→transformer, etc.) use the
`transport` module.

### State machine — `transport_jobs`

```
       ┌──────────┐
       │ pending  │ ← created (auto on lot.collected, or manual)
       └────┬─────┘
            │ findTransporterForRegion → assignTransporter
            ▼
       ┌──────────┐
       │ assigned │
       └────┬─────┘
            │ accept
            ▼
       ┌──────────┐
       │ accepted │
       └────┬─────┘
            │ start
            ▼
       ┌─────────────┐
       │ in_progress │ ← weigh-in via /lots/:lotId/load
       └────┬────────┘   GPS via /gps
            │ deliver (per lot) + /complete
            ▼
       ┌────────────┐
       │ delivered  │ ← weigh-out + reconciliation check
       └────────────┘
```

### Weight reconciliation (>2% rule)

On `POST /transport/jobs/:id/lots/:lotId/deliver`:

1. Compares `delivered_weight_kg` to `loaded_weight_kg`.
2. If `|delta| > 2%` of loaded weight (rule `reconciliation.tolerance_percent`):
   - Creates a `reconciliations` row with `flagged=true`.
   - Creates an `audits` row of type `reconciliation`, `passed=false`.
   - Fires a notification of type `weight_mismatch` to the transporter +
     destination operator.

### SLA deadlines

Computed at job creation from rules:

| lane | rule key | default |
|---|---|---|
| `normal` | `sla.c1_pickup_hours` | 72 h |
| `urgent_cold_chain` | `sla.c2_pickup_hours` | 4 h |
| `urgent_standard` | `sla.c2_pickup_hours` | 4 h |

If `slaDeadline` is reached without `delivered_at`, the dashboard shows the
job in `urgentLotsAtRisk` and the validation overview surfaces it.

---

## 3. Depot — E1 reception + S1 dispatch

### E1 reception

```
   POST /depot/receptions
   body: {
     depotId, lotId, zoneId?, actualWeightKg,
     lotClassification: 'class_a' | 'class_b',  -- propre vs très souillée
     stackTemperatureC: number?,                -- auto-combustion risk
     humidityEntryPercent: number?,             -- H% critique
     vegetalMatterPercent: number?,             -- VM% (>5% → bio track)
     plannedExitDate: ISO date?,
     notes?
   }
```

What happens:

1. Looks up the lot's declared weight from the most recent weigh.
2. Computes `discrepancy_kg = actual - declared` and `tolerance_exceeded`.
3. Inserts the reception row.
4. Updates `lots.status = 'received_depot'` + `current_location_*`.
5. Inserts a `lot_weighs` row for `phase='depot_in'`.
6. Triggers reconciliation (against the prior weigh).
7. Updates the depot's `current_weight_kg`. If `>= occupancy_critical` (78%),
   fires an `a1_alerts` row and notifies depot dispatcher.
8. Emits `depot_received`.

### S1 dispatch (to laverie or directly to transformer)

```
   POST /depot/dispatches
   body: {
     depotId, lotId,
     destinationDirect: 'laverie' | 'transformer_direct',
     destinationLaverieId?,        -- one of the two
     destinationTransformerId?,    -- (D4 direct path)
     manifestWeightKg?,
     fluxAWeightKg?,               -- volume going to D3 (insulation)
     fluxBWeightKg?,               -- volume going to D4 (engrais)
     impurityRatePercent?,
     humidityExitPercent?
   }
```

What happens:

1. Inserts dispatch row + `depot_dispatch_lots`.
2. Updates lot status to `dispatched_to_laverie` or directly to D4 path.
3. Adds a `lot_weighs` row for `phase='depot_out'`.
4. Reconciliation (depot_in vs depot_out).
5. Auto-creates a `transport_jobs` row depot → destination.
6. Emits `depot_dispatched`.

### A1 alerts

Fired by the rules engine when:
- depot occupancy ≥ 78% (`a1.alert.thresholds.occupancy_critical`)
- urgent lot count ≥ 3 (`a1.alert.thresholds.urgent_lots_critical`)

Lifecycle: `open → acknowledged → resolved`. Surfaced in
`/operations/validation` and `web-operations /admin` alerts panel.

---

## 4. Laverie — wash + qualify + dispatch

### Step 1 — reception

```
   POST /laverie/receptions
   body: {
     laverieId, lotId, receivedWeightKg,
     conditioningState: 'correct' | 'torn' | 'humid',
     requiredWashTempC?,
     requiredDetergentType?      -- "biodegradable" if water reuse loop
   }
```

→ updates lot to `received_laverie`, inserts `lot_weighs phase=laverie_in`,
emits `laverie_received`.

### Step 2 — washing run

```
   POST /laverie/washing-runs
   body: {
     laverieId, lotId, dirtyWeightKg,
     waterLiters?, cycleDurationMinutes?, waterTempC?,
     detergentType?,
     suintRecoveredLiters?       -- lanolin recovery, valorization
   }
```

→ creates `washing_runs` row (`completed_at` initially null), updates lot to
`washing`, emits `washing_started`.

### Step 3 — qualification + S2/S3 dispatch

```
   POST /laverie/qualifications
   body: {
     washingRunId, cleanWeightKg,
     grade: 'A'|'B'|'C'|'reject',
     safetyStatus: 'clear'|'flagged'|'rejected',
     fiberLengthMm?, fiberDiameterMicron?,
     moisturePercent?, cleanlinessScore?, color?,
     dispatchTrack: 'd3_textile'|'d4_bio'|'quarantine'|'reject',
     targetTransformerId?,        -- REQUIRED for d3_textile / d4_bio
     // Stage 7 — purity certificate
     residualHumidityPercent?, residualSuintPercent?,
     whitenessIndex?, phLevel?,
     energyKwhUsed?, waterLitersPerKg?
   }
```

What happens:

1. Updates `washing_runs.completed_at`, `clean_weight_kg`, `yield_percent =
   clean/dirty × 100`.
2. Inserts `qualifications` row with all metrics.
3. Inserts `laverie_dispatches` (S2/S3) with the chosen track.
4. Computes pricing in `pricing_proposals`:
   - `base_price_per_kg` = grade lookup from `pricing.base.matrix`
     (default: A=1200, B=850, C=500, reject=0 DZD/kg).
   - `urgency_discount_percent` = 8% if lot is urgent.
   - `source_type_adjustment_percent` = +5% shepherd, -5% aggregator.
   - `final_price_per_kg = base × (1 - urgency_discount/100) × (1 + source_adj/100)`.
   - `total_value = final × clean_weight_kg`.
5. Updates `lots.status = 'qualified'`.
6. Emits `qualification_recorded`.

### S2/S3 dispatch decision

Default rule (`dispatch.s2s3.routing`):
- `grade ∈ {A, B}` AND `fiberLengthMm ≥ 50` → `d3_textile`
- else → `d4_bio`
- `safetyStatus = 'rejected'` → `reject`
- `safetyStatus = 'flagged'` → `quarantine`

Configurable via `PATCH /rules/:ruleId`.

---

## 5. Transformation — D3 (textile) and D4 (bio)

### Production run start

```
   POST /transformation/runs
   body: {
     transformerId, lotId, bomId, inputWeightKg,
     // D4 — engrais direct
     drynessIndex?, foreignBodyPresent?, foreignBodyNotes?,
     unloadingMode?: 'vrac' | 'balles',
     // D3 — isolants/géotextiles
     productDestinationType?:
       'flux_a1_panels' | 'flux_a2_rolls' |
       'flux_a3_geotextile' | 'flux_b_engrais',
     targetThicknessMm?, targetDensityKgM3?,
     antimitesTreatmentType?: 'natural' | 'synthetic',
     bindingFiberPercent?,
     fireRetardantProduct?
   }
```

Pre-condition: `lot.status = 'qualified'`. Otherwise 400 "Le lot n'est pas
prêt pour une transformation."

→ creates `production_runs` row, `production_run_lots`, updates lot to
`in_transformation`, emits `production_started`.

### Production run complete

```
   PATCH /transformation/runs/:runId/complete
   body: {
     outputWeightKg, wasteWeightKg, quantity,
     productCode?,                -- auto-generated if omitted
     unit?                        -- "panel" | "kg" | "m²" | ...
   }
```

What happens:

1. Updates `production_runs` with output + waste + `yield_percent`.
2. Inserts `products` row:
   - `product_code` defaults to `P1-AUTO-XXXX` (D3) or `P2-AUTO-XXXX` (D4)
     based on `transformer.track`.
   - `status = 'produced'`.
3. Inserts `waste_records` row(s) with category `disposal` (or `reusable` /
   `recoverable` if specified in BOM additives).
4. Inserts a `certifications` row, `status = 'pending'`, with `gates_passed`
   pre-evaluated.
5. Updates lot to `transformed`.
6. Emits `production_completed`.
7. Returns `{ id (product), certificationId, productCode, status, createdAt }`.

### BOMs

A BOM (Bill of Materials) defines:
- `product_type_code` (e.g., `D3-PANEL-100` for 100mm insulation panel)
- `input_wool_kg_per_unit` (how much clean wool per output unit)
- `additives` (jsonb array, e.g., `[{ name: "boron salt", amount: 50, unit: "g" }]`)
- `expected_yield_percent`
- `version` (immutable; new versions = new rows)

---

## 6. Certification

### Auto-create on production complete

A `certifications` row is created with:
- `product_id`, `product_code` (denormalized)
- `status = 'pending'`
- `gates_passed` (jsonb): `{ e1_passed: true, s1_passed: true, ... }`

### Issue

```
   POST /certification/:id/issue
   body: { force?: boolean }
```

1. Refuses if status ≠ `pending` (400).
2. Verifies all gates if `force=false`. If any fails, returns `{ ok: false, gatesFailed: [...] }`.
3. Generates NFN seal code: `NFN-<product_code>-<timestamp>`.
4. Computes cryptographic signature (SHA-256 of payload).
5. Inserts QR code URL: `https://verify.ba33.dz/<seal-code>`.
6. Updates `certifications` to `issued`, sets `issued_at`, `issued_by`.
7. Updates `products.status = 'certified'`, `certification_id` set.
8. Emits `certification_issued`.

### Revoke

```
   POST /certification/:id/revoke
   body: { reason: string }
```

Status flips to `revoked`. The public verify endpoint returns
`status: 'revoked'`. Already-shipped products are not auto-recalled — the
revocation just makes future verifications fail.

### Public verify (no auth)

```
   GET /api/v1/certification/verify/:code
```

Looks up the product by `nfn_seal_code`. Returns:
- `valid` if `nfn_seal_status = 'certified'`
- `revoked` if status is `revoked`
- `not_found` otherwise

Plus traceability summary: `sourceCount`, `collectionDate`, `washingYieldPercent`,
`auditsPassed`.

---

## 7. Sales (3 channels)

### Channel matrix

| Channel | Pricing | Currency | Documents |
|---|---|---|---|
| `national` | matrix base | DZD | invoice |
| `export` | base × FX | EUR/USD | invoice + origin_certificate + export_declaration |
| `institutional` | contract price | DZD | invoice + framework reference |

### Order lifecycle

```
   draft  → quote → confirmed → paid → preparing → shipped → delivered
                                     ↘
                                       returned / cancelled
```

Transitions:

| from → to | trigger | endpoint |
|---|---|---|
| (none) → `draft` | buyer creates order | `POST /orders` |
| `draft` → `quote` → `confirmed` | buyer confirms | `POST /orders/:id/confirm` |
| `confirmed` → `paid` (payment_status) | sales agent | `POST /sales/orders/:id/actions { action: 'mark_paid' }` |
| `paid` → `shipped` | sales agent (creates shipment) | `POST .../actions { action: 'ship', trackingReference }` |
| `shipped` → `delivered` | sales agent | `POST .../actions { action: 'deliver' }` |

### Documents auto-generated

On status changes, `sales_documents` rows are inserted:
- On `confirmed`: `invoice` PDF (template + product trace inserted).
- On certified products in items: `traceability_certificate` PDF per product.
- For `export` channel orders: `origin_certificate` + `export_declaration`.

In v1 these are stub PDFs (placeholder bytes). Endpoint
`GET /orders/:id/documents/:docId/download` returns them.

### Complaints

```
   POST /complaints
   body: { orderId, reason: string }
```

Status: `review → resolved | rejected`. Linked to the order; affected lots
can be back-traced from order_items → product → certification → lot lineage.

---

## 8. Rules engine

`RulesService.getRuleValue<T>(key)` reads from `rules_config` (versioned,
time-bounded). Rules currently used:

| key | shape | consumed by |
|---|---|---|
| `a1.alert.thresholds` | `{ occupancy_critical: 0.78, urgent_lots_critical: 3 }` | depot E1 reception (alert firing) |
| `dispatch.s2s3.routing` | (rules to choose D3/D4) | laverie qualification |
| `pricing.base.matrix` | `{ A: 1200, B: 850, C: 500, reject: 0 }` | laverie pricing |
| `pricing.urgency_discount_percent` | 8 | laverie pricing |
| `pricing.c2_safety_premium_percent` | -10 | laverie pricing |
| `reconciliation.tolerance_percent` | 2 | reconciliation jobs |
| `cert.required_gates` | `["e1_passed","s1_passed","r1_within_range","s2_dispatched","ex_sx_cleared","no_open_anomalies"]` | certification issue |
| `sla.c1_pickup_hours` | 72 | transport SLA |
| `sla.c2_pickup_hours` | 4 | transport SLA |

Update rules via `PATCH /rules/:ruleId` (creates new version row, marks the
old one as expired). All operators see the new value within the next
`RulesService` cache invalidation.

---

## 9. Reconciliation

Triggered after every weigh-out to make sure no wool is "lost":

```ts
delta = weight_in - weight_out
tolerance = weight_out × tolerance_percent / 100
within_tolerance = |delta| ≤ tolerance
flagged = NOT within_tolerance
```

If `flagged`:
- An `audit` row of type `reconciliation` is inserted with `passed=false`.
- A notification of type `weight_mismatch` fires to the relevant operators.
- The lot is **not** auto-quarantined — the central operator decides whether
  to investigate or mark `quarantined`.

---

## 10. Background workers

### Cron: pre-lot expiration

`@Cron(EVERY_HOUR)` in `apps/api/src/common/tasks/scheduled-tasks.service.ts`.

Calls `CollectionService.expireStalePreLots(72)` — any pre-lot with
`status ∈ ('announced', 'assigned')` and `created_at < NOW() - 72h` is
marked `expired` and emits `collection.prelot.expired`.

Tunable via the `maxAgeHours` parameter.

### BullMQ queues

Configured in `apps/api/src/common/queues/queue-names.ts`:
- `RECONCILIATION` — async weight delta jobs
- `CERTIFICATION_CHECK` — re-evaluate gates after a state change
- `A1_ALERT_CHECK` — depot occupancy monitor
- `NOTIFICATION` — push delivery (stubbed in v1)
- `SYNC_PROCESS` — mobile sync batches

Workers are wired but most run inline in v1 for simplicity.

### Notifications

In v1, notifications are persisted to `notifications` but `sent_at` stays
null (no FCM/APNs send). Types fired:

| type | trigger |
|---|---|
| `a1_alert` | depot occupancy threshold breached |
| `sla_warning` | transport job nearing SLA deadline |
| `lot_status_change` | critical statuses (quarantined, rejected, lost) |
| `prelot_assigned` | shepherd notified when collector scheduled |
| `transport_job_assigned` | transporter notified |
| `collection_job_assigned` | collector notified (new for two-actor model) |
| `weight_mismatch` | reconciliation flagged |
| `tolerance_exceeded` | depot/laverie reception over tolerance |
