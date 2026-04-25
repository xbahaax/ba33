# Data Model

> Postgres schema, Drizzle ORM, append-only event log. The lot is the spine —
> every entity hangs off it.

---

## 1. Principles

1. **UUID v4 everywhere.** Every primary key. Allows offline ID generation.
2. **`timestamp with time zone` for every date.** UTC always.
3. **Postgres enums for closed sets.** No string literals scattered.
4. **JSONB for flexible payloads** (event payloads, file metadata, vehicle info).
5. **No true deletes for domain entities.** Lots, events, products, certs are
   never `DELETE`d — only status changes (`rejected`, `revoked`, `cancelled`).
6. **`ON DELETE RESTRICT`** for all FKs except `collection_job_gps_points`
   which cascades on parent delete.
7. **Strict FKs.** No "soft" text references.
8. **Indexes follow queries** — no speculative indexes.

---

## 2. The 3 migrations

| File | Adds |
|---|---|
| `0000_dark_korvac.sql` | All baseline tables (53 tables) and ~70 enums |
| `0001_curly_hammerhead.sql` | Stage-specific fields (shearing date, bag count/type, breed, conditioning state, etc.) and Flux A/B enums |
| `0002_add_collection_jobs.sql` | `collection_jobs`, `collection_job_gps_points`, `source_profession` enum, `sources.profession` column |

---

## 3. Key enums

```sql
-- Source taxonomy
source_type           : c1_shepherd | c2_slaughterhouse | c3_aggregator
source_profession     : shepherd | slaughterhouse | butcher | aggregator | other
source_status         : pending | active | suspended

-- Lot lifecycle (22 states)
lot_status            : announced | collected | in_transit | received_depot |
                        in_pretri | stored | dispatched_to_laverie |
                        received_laverie | washing | washed | qualified |
                        dispatched_to_d3 | dispatched_to_d4 | in_transformation |
                        transformed | certified | sold | delivered |
                        rejected | lost | quarantined
lot_state_quick       : clean | dirty | very_dirty | contaminated | with_meat
urgency_level         : normal | urgent

-- Collection
pre_lot_status        : announced | assigned | collected | cancelled | expired
collection_job_status : pending | assigned | accepted | in_progress |
                        arrived | completed | cancelled

-- Transport
transport_lane        : normal | urgent_cold_chain | urgent_standard
job_status            : pending | assigned | accepted | in_progress |
                        delivered | cancelled

-- Depot (Stage 3)
depot_zone_purpose    : c1_normal | c2_urgent | c3_aggregator |
                        quarantine | dispatch_ready
lot_classification    : class_a | class_b
depot_destination_direct : laverie | transformer_direct
a1_severity           : info | warning | critical
a1_status             : open | acknowledged | resolved

-- Laverie (Stages 5–7)
grade                 : A | B | C | reject
safety_status         : clear | flagged | rejected
dispatch_track        : d3_textile | d4_bio | quarantine | reject
conditioning_state    : correct | torn | humid

-- Transformation (Stages 6 + 8)
transformer_track          : d3_textile | d4_bio
product_status             : in_production | produced | certified | sold |
                             shipped | delivered | rejected
product_destination_type   : flux_a1_panels | flux_a2_rolls |
                             flux_a3_geotextile | flux_b_engrais
antimites_treatment_type   : natural | synthetic
unloading_mode             : vrac | balles
waste_category             : reusable | recoverable | disposal

-- Wool typology (collection stage)
wool_type             : full_fleece | fleece_pieces | tail_wool
extraction_method     : pelade | echauffe   -- pelade=chemical, echauffe=natural
bag_type              : PP | jute

-- Certification + sales
cert_status           : pending | issued | revoked
channel               : national | export | institutional
order_status          : draft | quote | confirmed | paid | preparing |
                        shipped | delivered | returned | cancelled
payment_status        : pending | partial | paid | refunded

-- Audit + events
audit_type            : entry_e1 | exit_s1 | internal_ex |
                        internal_sx | reconciliation
```

---

## 4. The lot spine

```
                     ┌───────────────────┐
                     │     sources       │
                     │ (profession+type) │
                     └─────────┬─────────┘
                               │
                               │ source_id
                               ▼
   ┌─────────────────────────────────────────────────┐
   │                   pre_lots                      │
   │  (declaration: weight, breed, bags, dates)      │
   └─────────────────┬───────────────────────────────┘
                     │ pre_lot_id
                     ▼
   ┌─────────────────────────────────────────────────┐
   │              collection_jobs                    │
   │  pending → assigned → accepted → in_progress    │
   │         → arrived → completed → (lot created)   │
   └─────────────────┬───────────────────────────────┘
                     │ creates
                     ▼
   ┌──────────────────────────────────────────────────────────┐
   │                          LOTS                            │
   │   id, qrCode, sourceId, collectorId, weights, status     │
   │                                                          │
   │   ─► lot_photos       ─► lot_signatures                  │
   │   ─► lot_weighs       ─► lot_lineage (split/merge)       │
   │   ─► transport_job_lots                                  │
   │   ─► depot_receptions     ─► depot_dispatch_lots         │
   │   ─► laverie_receptions   ─► washing_runs                │
   │      ─► qualifications        ─► laverie_dispatches      │
   │   ─► production_run_lots                                 │
   │      ─► (output) products                                │
   │         ─► certifications                                │
   │            ─► (sold via) order_items                     │
   │               ─► orders ─► shipments ─► sales_documents  │
   └──────────────────────────────────────────────────────────┘
```

---

## 5. Tables grouped by module

### `regions`
- **regions** — wilaya / commune / village hierarchy. 58 wilayas seeded.

### `users` (auth + RBAC)
- **users** — email, phone, password_hash, full_name, user_type, status, region_id
- **roles** — name, permissions (jsonb string[])
- **user_roles** — composite PK (user_id, role_id)
- **sessions** — refresh_token_hash, device_info, expires_at, revoked_at

### `sources`
- **sources** — id, source_type, **profession**, name, contact_phone, contact_email,
  region_id, latitude, longitude, address, status, registered_by, notes
- **shepherds** — source_id (PK FK), has_smartphone, preferred_language, flock_size_estimate
- **slaughterhouses** — source_id (PK FK), license_number, daily_capacity_heads, has_cold_storage
- **aggregators** — source_id (PK FK), business_registration, registered_upstream_count, premium_certified

### `collection`
- **collectors** — user_id (PK FK), assigned_regions (jsonb), certifications (jsonb), active
- **collector_booklets** — pre-printed QR sticker tracking
- **pre_lots** — id, source_id, estimated_weight_kg, location, region_id, notes,
  status, assigned_collector_id, scheduled_at, lot_id (set on completion).
  **Stage 1 fields:** shearing_date, sheep_breed, bag_count, bag_type, last_parasite_treatment_date.
- **routes** — id, collector_id, date, status, planned/actual kg
- **route_stops** — order, status, arrival_time
- **collection_jobs** *(new for two-actor model)* — id, pre_lot_id, source_id,
  destination_depot_id, collector_id, urgency, status, origin_lat/lng,
  destination_lat/lng, sla_deadline, notes, issued_by, lot_id, plus all
  lifecycle timestamps (issued_at, assigned_at, accepted_at, started_at,
  arrived_at, completed_at, cancelled_at).
- **collection_job_gps_points** — job_id, lat, lng, speed_mps, accuracy, recorded_at.
  Indexed `(job_id, recorded_at)`.

### `lots` — the spine
- **lots** — id, source_id, source_type, collector_id, qr_code (unique),
  declared_weight_kg, actual_weight_kg, state_quick, urgency, cold_chain_temp_c,
  gps_lat/lng, status, is_urgent, collected_at, pre_lot_id, route_stop_id,
  current_location_id, current_location_type, notes, voice_note_id.
  **Stage 1 (added):** wool_type, extraction_method.
- **lot_photos** — angle (overview/closeup/surroundings/other), captured_at, GPS
- **lot_signatures** — type (digital/thumbprint/paper_photo), file_id, signed_by_name
- **lot_lineage** — child_lot_id, parent_lot_id, weight_contribution_kg, operation (split/merge)
- **lot_weighs** — phase (collection/transport_in/transport_out/depot_in/...), weight_kg, source (scale/manual/estimated), event_id

### `transport`
- **transporters** — user_id (PK FK), vehicle_info (jsonb), certifications (jsonb), active
- **transport_jobs** — origin_type+id, destination_type+id (polymorphic), lane, status, sla_deadline
- **transport_job_lots** — composite PK, loaded_weight_kg, delivered_weight_kg
- **transport_gps_points** — job_id, lat, lng, temperature_c, recorded_at

### `depot`
- **depots** — name, region_id, address, capacity_kg, current_weight_kg, manager_id, active
- **depot_zones** — depot_id, code, purpose, capacity, current_weight
- **depot_receptions** *(E1)* — depot_id, lot_id, declared_weight, actual_weight,
  discrepancy, tolerance_exceeded, zone_id, received_by, received_at, notes.
  **Stage 3:** lot_classification, stack_temperature_c, humidity_entry_percent,
  vegetal_matter_percent, planned_exit_date.
- **depot_dispatches** *(S1)* — depot_id, destination_laverie_id (or destination_transformer_id),
  manifest_weight_kg, dispatched_by, dispatched_at, transport_job_id.
  **Stage 4:** destination_direct, flux_a_weight_kg, flux_b_weight_kg, impurity_rate_percent, humidity_exit_percent.
- **depot_dispatch_lots** — composite PK
- **a1_alerts** — depot_id, trigger_condition (jsonb), severity, status, fired_at, resolved_at

### `laverie`
- **laveries** — name, region_id, address, daily_capacity_kg, manager_id, active
- **laverie_receptions** — laverie_id, lot_id, depot_dispatch_id, received_weight, received_by, received_at.
  **Stage 5:** conditioning_state, required_wash_temp_c, required_detergent_type.
- **pre_wash_checks** *(C2 only)* — vet_cert_reference, visual_inspection_passed, contamination_detected, action
- **washing_runs** — laverie_id, lot_id, dirty_weight_kg, clean_weight_kg, yield_percent,
  water_liters, chemicals (jsonb), cycle_duration_minutes, water_temp_c, started_at, completed_at, operated_by.
  **Stage 5/7:** detergent_type, suint_recovered_liters.
- **qualifications** — washing_run_id, lot_id, fiber_length_mm, fiber_diameter_micron,
  moisture_percent, cleanliness_score, color, grade, safety_status, contamination_notes, performed_by, performed_at.
  **Stage 7:** residual_humidity_percent, residual_suint_percent, whiteness_index, ph_level, energy_kwh_used, water_liters_per_kg.
- **pricing_proposals** — qualification_id, base_price_per_kg, urgency_discount_percent,
  source_type_adjustment_percent, final_price_per_kg, total_value
- **laverie_dispatches** *(S2/S3)* — qualification_id, track (d3_textile/d4_bio/quarantine/reject), target_transformer_id

### `transformation`
- **transformers** — name, track (d3_textile/d4_bio), region_id, address, daily_capacity_kg, manager_id, active
- **boms** — transformer_id, product_type_code, product_name, input_wool_kg_per_unit, additives (jsonb), expected_yield_percent, version, active
- **production_runs** — transformer_id, bom_id, bom_version, input_weight_kg, output_weight_kg, waste_weight_kg, yield_percent, started_at, completed_at, operated_by.
  **Stage 6 + 8:** dryness_index, foreign_body_present, foreign_body_notes, unloading_mode, product_destination_type, target_thickness_mm, target_density_kg_m3, antimites_treatment_type, binding_fiber_percent, fire_retardant_product.
- **production_run_lots** — composite PK, weight_used_kg
- **products** — production_run_id, product_code (P1-/P2- unique), product_type_code, track, quantity, unit, weight_kg, status, certification_id
- **waste_records** — production_run_id (or washing_run_id), amount_kg, category (reusable/recoverable/disposal), destination, recorded_by

### `certification`
- **certifications** — product_id, product_code, status, gates_passed (jsonb),
  signature, issued_by, issued_at, revoked_at, revoked_reason, qr_code_url

### `sales`
- **buyers** — user_id (PK FK), company_name, registration_number, preferred_channel, credit_limit, billing_address, shipping_addresses (jsonb)
- **orders** — buyer_id, order_code, channel, status, payment_status, subtotal, tax, total, currency, quoted_at, confirmed_at, delivered_at, shipping_address (jsonb)
- **order_items** — order_id, product_id, product_code, quantity, unit_price, subtotal
- **shipments** — order_id, status, tracking_reference, shipped_at, delivered_at
- **sales_documents** — order_id, type (invoice/cert/origin/export/other), file_id, generated_at
- **buyer_catalog_products** — denormalized buyer-facing view with `nfn_seal_code`, `nfn_seal_status`, traceability summary (used by public verify endpoint)
- **complaints** — order_id, buyer_id, status, reason

### `institutional`
- **institutional_users** — user_id (PK FK), institution_name, mandate (jsonb), active
- **institutional_queries** — user_id, query_type, query_params (jsonb), result_count, justification, performed_at

### `events` *(the spine)*
- **events** — id, event_type, aggregate_type, aggregate_id, actor_id (nullable),
  actor_type (`user`|`system`|`rule_engine`|`source`|`collector`), payload (jsonb),
  occurred_at, recorded_at, sync_source, device_id, version (per-aggregate sequence), checksum (SHA-256).
  **Indexes:** `(aggregate_type, aggregate_id, version)`, `(event_type, occurred_at)`, `(recorded_at)`.
- **event_subscriptions** — event_type_pattern, handler_name, active

### `audit`
- **audits** — audit_type, subject_type, subject_id, findings (jsonb), passed, auditor_id, performed_at
- **reconciliations** — lot_id, phase_from, phase_to, weight_out_kg, weight_in_kg, delta_kg, tolerance_kg, within_tolerance, flagged, computed_at

### `rules`
- **rules_config** — rule_key, value (jsonb), description, version, effective_from, effective_to, created_by, created_at

### `files`
- **files** — kind (photo/voice_note/signature/document/certificate_pdf), mime_type, storage_path, size_bytes, uploaded_by, metadata (jsonb)

### `notifications`
- **notifications** — user_id, type, title, body, payload (jsonb), read_at, sent_at (nullable in v1)

### `sync`
- **sync_devices** — user_id, device_id (unique), device_info (jsonb), last_sync_at, namespace_prefix
- **sync_batches** — device_id, direction (push/pull), event_count, status (pending/completed/failed), error, started_at, completed_at

---

## 6. Event log examples

Every state transition writes to `events`. Examples:

| event_type | aggregate_type | actor_type | trigger |
|---|---|---|---|
| `collection.prelot.announced` | `prelot` | `source` | shepherd POST /collection/pre-lots/declare |
| `collection.job.issued` | `collection_job` | `system` | auto on pre-lot create |
| `collection.job.assigned` | `collection_job` | `user` | depot manager PATCH /assign |
| `collection.job.accepted` | `collection_job` | `collector` | collector PATCH /accept |
| `collection.job.started` | `collection_job` | `collector` | PATCH /start |
| `collection.job.arrived` | `collection_job` | `collector` | PATCH /arrive |
| `collection.job.completed` | `collection_job` | `collector` | POST /complete |
| `lot.collected` | `lot` | `collector` | POST /lots (or job.complete) |
| `transport.job.created` | `transport_job` | `system` | auto on lot.collected |
| `depot_received` | `lot` | `depot_manager` | POST /depot/receptions |
| `depot_dispatched` | `lot` | `depot_manager` | POST /depot/dispatches |
| `laverie_received` | `lot` | `laverie_operator` | POST /laverie/receptions |
| `washing_started` | `washing_run` | `laverie_operator` | POST /laverie/washing-runs |
| `qualification_recorded` | `lot` | `laverie_operator` | POST /laverie/qualifications |
| `production_started` | `production_run` | `transformer_operator` | POST /transformation/runs |
| `production_completed` | `production_run` | `transformer_operator` | PATCH .../complete |
| `certification_issued` | `certification` | `central_admin` | POST /certification/:id/issue |
| `certification_revoked` | `certification` | `central_admin` | POST /certification/:id/revoke |

To trace a lot: query `SELECT * FROM events WHERE aggregate_id = '<lot-uuid>' ORDER BY recorded_at`.

---

## 7. Reconciliation

Whenever a `lot_weighs` row is added with a new `phase`, a job (or the
service inline) computes the delta vs. the previous phase's weigh and
writes a `reconciliations` row:

```
delta_kg            = weight_in_kg - weight_out_kg
tolerance_kg        = weight_out_kg × tolerance_percent (rule: reconciliation.tolerance_percent, default 2%)
within_tolerance    = |delta_kg| ≤ tolerance_kg
flagged             = NOT within_tolerance
```

If `flagged = true`, an `audit` row of type `reconciliation` is created with `passed: false`,
and a notification of type `weight_mismatch` fires to the relevant operator.

---

## 8. The QR code

A lot's QR encodes its UUID (currently as `LOT-<first8>-<base36-time>`). The
`/lots/qr/:code` endpoint resolves it.

A product's QR encodes `NFN-P{1|2}-...` and resolves at the public
`/certification/verify/:code` endpoint.

Both formats are designed to be human-readable + machine-scannable.
