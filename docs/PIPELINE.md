# The Pipeline

> The end-to-end data flow from a shepherd in a field to a B2B buyer
> verifying a certified product. Every step is traced through the event log.
> 55/55 of these steps are covered by `scripts/test-pipeline.sh`.

---

## High-level flow

```
SOURCE  ─►  COLLECTION JOB  ─►  COLLECTOR  ─►  LOT  ─►  TRANSPORT
                                                          │
                                                          ▼
DEPOT (E1 reception)  ◄──────────────────  TRANSPORT
        │
        ▼
DEPOT (S1 dispatch)  ─►  TRANSPORT  ─►  LAVERIE
                                          │
              ┌───────────────────────────┘
              ▼
LAVERIE (reception → wash → qualify → S2/S3 dispatch)
              │
              ▼ (track = d3_textile or d4_bio)
TRANSFORMATION (production run → complete → product)
              │
              ▼
CERTIFICATION (auto-pending → issued NFN seal)
              │
              ▼
SALES (catalog → order → ship → deliver)
              │
              ▼
PUBLIC VERIFY (buyer scans QR → confirms authenticity)
```

Every transition writes one row to `events`. The lot is the spine.

---

## Phase 1 — Source declaration (mobile-shepherd)

```
┌─ SHEPHERD ─────────────────────────────────────────────────┐
│  1. Open app → splash → first-time onboarding (3 slides)   │
│  2. Login (phone + password OTP-stubbed)                   │
│  3. First time: pick profession                            │
│       (shepherd | slaughterhouse | butcher | aggregator)   │
│  4. Home: tap "عندي صوف جاهز" big button                  │
│  5. Fill the 12-field form:                                │
│       weight (kg) · bag count + type (PP/jute) ·           │
│       shearing date · breed · last parasite treatment ·    │
│       surnom + mazraa · GPS auto + manual ·                │
│       photo · notes                                        │
│  6. Submit                                                 │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
              POST /api/v1/collection/pre-lots/declare
                         │
                         ▼
   ┌─────────────────────────────────────────────────────┐
   │  CollectionService.declareWool                      │
   │  ─ ensureSourceForUser  (creates source if missing) │
   │     - profession + name + region + gps              │
   │  ─ createPreLot                                     │
   │     - persists Stage 1 fields                       │
   │     - emits event 'collection.prelot.announced'     │
   │  ─ autoIssueCollectionJob                           │
   │     - findClosestDepot (region-matched)             │
   │     - status: pending                               │
   │     - emits event 'collection.job.issued'           │
   └─────────────────────────────────────────────────────┘
                         │
                         ▼
                Pre-lot exists, Job is pending
```

---

## Phase 2 — Job assignment (web-operations)

```
┌─ DEPOT MANAGER ─────────────────────────────────────────────┐
│  1. Login at web-operations (phone 0555000003)              │
│  2. Land at /depot                                          │
│  3. "Missions de collecte" panel shows the new pending job  │
│       - source name + profession badge                      │
│       - destination depot                                   │
│       - declared weight                                     │
│       - URGENT badge if applicable                          │
│  4. Pick a collector from dropdown                          │
│  5. Click "Assigner"                                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
            PATCH /api/v1/collection/jobs/:id/assign
                  body: { collectorId }
                             │
                             ▼
         emits 'collection.job.assigned' + notifies collector
```

The panel auto-refreshes every 15s, so the collector seeing it immediately
on mobile and the depot manager seeing the assignment confirmed both work
without manual reloads.

---

## Phase 3 — Collector execution (mobile-collector)

```
┌─ COLLECTOR ────────────────────────────────────────────────┐
│  Splash → onboarding → login                               │
│  Home tab "Collectes" lists open jobs                      │
│      - URGENT section first                                │
│      - then À FAIRE                                        │
│                                                            │
│  Tap a job → Detail screen                                 │
│      - source name + address + phone                       │
│      - depot destination                                   │
│      - declared weight + notes                             │
│      - "Ouvrir Google Maps" → opens turn-by-turn nav       │
│      - Action button: ACCEPTER (PATCH /accept)             │
│                                                            │
│  After accept: button becomes DÉMARRER                     │
│      → PATCH /start                                        │
│      → starts GPS streaming (best accuracy, 10m filter)    │
│      → batches GPS points every 30s, POST /gps             │
│      → ActiveJobScreen shows distance to source            │
│                                                            │
│  When GPS shows ≤150m of source.lat/lng:                   │
│      → "Vous êtes au point de départ" banner turns green   │
│      → Button enables: CONFIRMER L'ARRIVÉE                 │
│      → PATCH /arrive                                       │
│                                                            │
│  Or: tap "Je suis arrivé manuellement" with confirmation   │
│                                                            │
│  ArrivalFormScreen:                                        │
│      - Real weight (kg)  REQUIRED                          │
│      - State chips (clean/dirty/very_dirty/contaminated/   │
│        with_meat)                                          │
│      - Cold-chain temp (only for slaughterhouse/butcher)   │
│      - Notes                                               │
│      - [Soumettre la collecte]                             │
│                                                            │
│  → POST /complete                                          │
│  → Backend creates LOT (status='collected')                │
│  → Pre-lot transitions: announced → assigned → collected   │
│  → Job transitions: arrived → completed (lotId set)        │
│  → Returns { job, lot } to client                          │
│  → Auto-creates a transport job (collector → depot)        │
└────────────────────────────────────────────────────────────┘
```

Events emitted in this phase: `collection.job.accepted`,
`collection.job.started`, `collection.job.arrived`,
`collection.job.completed`, `lot.collected`, `transport.job.created`.

---

## Phase 4 — Transport to depot

The transport job auto-created on `lot.collected` waits for a transporter to
accept it. (In v1 with no transporter mobile app, this can be skipped — the
depot can receive directly. The transport job is informational.)

```
   transport_jobs.status: pending → assigned (auto, finds region transporter)
                                  → accepted → in_progress → delivered
   transport_gps_points: lat/lng/temp logged per polling interval
   transport_job_lots: loaded_weight_kg + delivered_weight_kg
                       → reconciliation if delta > 2%
```

Endpoints used: `PATCH /transport/jobs/:id/accept`,
`POST /transport/jobs/:id/lots/:lotId/load`,
`POST /transport/jobs/:id/lots/:lotId/deliver`.

---

## Phase 5 — Depot reception (E1) and dispatch (S1)

```
┌─ DEPOT MANAGER (web-operations /depot) ────────────────────┐
│                                                            │
│  E1 RECEPTION                                              │
│      For each lot in intakeQueue:                          │
│        - actualWeightKg                  REQUIRED          │
│        - lotClassification: class_a (clean) / class_b      │
│        - stackTemperatureC               (auto-comb risk)  │
│        - humidityEntryPercent            H% critical       │
│        - vegetalMatterPercent            VM% (>5% → bio)   │
│        - plannedExitDate                                   │
│        - zoneId                                            │
│      → POST /depot/receptions                              │
│      → emits 'depot_received'                              │
│      → reconciliation against declared weight              │
│      → A1 alert may fire if depot_weight > 78% capacity    │
│                                                            │
│  S1 DISPATCH                                               │
│      For each lot in dispatchQueue:                        │
│        - destinationDirect: laverie | transformer_direct   │
│        - destinationLaverieId or destinationTransformerId  │
│        - manifestWeightKg                                  │
│        - fluxAWeightKg / fluxBWeightKg                     │
│        - impurityRatePercent / humidityExitPercent         │
│      → POST /depot/dispatches                              │
│      → emits 'depot_dispatched'                            │
│      → creates transport job depot → laverie               │
└────────────────────────────────────────────────────────────┘
```

A1 alert thresholds live in `rules_config.a1.alert.thresholds`
(`occupancy_critical: 0.78`, `urgent_lots_critical: 3`).
A1 alert lifecycle: `open → acknowledged → resolved`.

---

## Phase 6 — Laverie (wash + qualify + S2/S3 dispatch)

```
┌─ LAVERIE OPERATOR (web-operations /laverie) ───────────────┐
│                                                            │
│  RECEPTION (S2 entry)                                      │
│      - receivedWeightKg                                    │
│      - conditioningState: correct | torn | humid           │
│      - requiredWashTempC                                   │
│      - requiredDetergentType (biodegradable if water reuse)│
│      → POST /laverie/receptions  emits 'laverie_received'  │
│                                                            │
│  WASHING RUN                                               │
│      - dirtyWeightKg                                       │
│      - waterLiters · cycleDurationMinutes                  │
│      - waterTempC · detergentType                          │
│      - suintRecoveredLiters (lanoline)                     │
│      → POST /laverie/washing-runs  emits 'washing_started' │
│                                                            │
│  QUALIFICATION (R1 yield + S2/S3 dispatch)                 │
│      - cleanWeightKg                                       │
│      - grade: A | B | C | reject                           │
│      - safetyStatus: clear | flagged | rejected            │
│      - fiberLengthMm · fiberDiameterMicron                 │
│      - moisturePercent · cleanlinessScore (1-5) · color    │
│      - dispatchTrack: d3_textile | d4_bio | quarantine     │
│      - targetTransformerId (REQUIRED for d3/d4)            │
│      Stage 7 — purity certificate inputs:                  │
│        residualHumidityPercent · residualSuintPercent      │
│        whitenessIndex · phLevel                            │
│        energyKwhUsed · waterLitersPerKg                    │
│      → POST /laverie/qualifications                        │
│      → emits 'qualification_recorded'                      │
│      → laverie_dispatches row created                      │
│      → pricing_proposals row computed:                     │
│           base * (1 - urgency_discount) * (1+source_adj)   │
│      → lot.status = 'qualified'                            │
└────────────────────────────────────────────────────────────┘
```

R1 yield = `cleanWeight / dirtyWeight`. Tracked per source for fraud detection
(consistent low yield → adulteration suspicion).

S2/S3 dispatch decision is rule-driven (`dispatch.s2s3.routing`):
default → grade A/B + fiber ≥ 50mm → `d3_textile`, else `d4_bio`,
reject/flagged → `quarantine`.

---

## Phase 7 — Transformation (D3 textile or D4 bio)

```
┌─ TRANSFORMATION OPERATOR (web-operations /transformation) ─┐
│                                                            │
│  PRODUCTION RUN START                                      │
│      - transformerId · lotId · bomId                       │
│      - inputWeightKg                                       │
│      Stage 6 (D4 — engrais direct, no wash):               │
│        drynessIndex · foreignBodyPresent · unloadingMode   │
│      Stage 8 (D3 — isolants/géotextiles):                  │
│        productDestinationType:                             │
│          flux_a1_panels | flux_a2_rolls |                  │
│          flux_a3_geotextile | flux_b_engrais               │
│        targetThicknessMm · targetDensityKgM3               │
│        antimitesTreatmentType: natural | synthetic         │
│        bindingFiberPercent · fireRetardantProduct          │
│      → POST /transformation/runs                           │
│      → emits 'production_started'                          │
│                                                            │
│  COMPLETE                                                  │
│      - outputWeightKg · wasteWeightKg · quantity           │
│      - productCode (auto P1-AUTO-XXXX or P2-AUTO-XXXX,     │
│                    or manual override)                     │
│      → PATCH /transformation/runs/:id/complete             │
│      → emits 'production_completed'                        │
│      → creates a `products` row (status='produced')        │
│      → creates a `certifications` row (status='pending')   │
│      → returns { id, certificationId, productCode, ... }   │
└────────────────────────────────────────────────────────────┘
```

Composite traceability: a production run can consume multiple lots
(`production_run_lots` with `weight_used_kg` per parent). The product's
trace fans out to every contributing lot.

---

## Phase 8 — Certification (NFN seal)

```
   - On production complete, a 'pending' certification is created.
   - Issuance gates (rule cert.required_gates):
       e1_passed · s1_passed · r1_within_range
       s2_dispatched · ex_sx_cleared · no_open_anomalies
   - POST /certification/:id/issue
       → checks gates (or accepts force=true override)
       → status: pending → issued
       → assigns NFN seal code (NFN-P1-... or NFN-P2-...)
       → cryptographically signs (SHA-256 of payload)
       → emits 'certification_issued'
   - POST /certification/:id/revoke
       → status: issued → revoked
       → reason recorded
       → emits 'certification_revoked'
   - GET /certification/verify/:code   (public, no auth)
       → returns { code, status, productType, grade, originRegion,
                   certifiedAt, traceabilitySummary }
```

The product's QR code resolves to the public verify endpoint, which the
buyer can scan via the **`/verify` page** (web-buyer, also no auth).

---

## Phase 9 — Sales (3 channels)

```
   Buyer browses /catalog?type=P1&grade=A&certified=true
       → public products list with NFN seal status

   Buyer adds to cart, navigates /checkout
       - select shipping address
       - select channel (national | export | institutional)
       - confirm
       → POST /orders → status='draft'

   Buyer confirms
       → POST /orders/:id/confirm → status='quote' → 'confirmed'

   Sales agent advances
       → POST /sales/orders/:id/actions { action: 'mark_paid' }
            → payment_status='paid'
       → POST /sales/orders/:id/actions { action: 'ship', trackingReference }
            → creates shipment row
       → POST /sales/orders/:id/actions { action: 'deliver' }

   Documents auto-generated per order:
       - invoice (always)
       - traceability_certificate (per certified product)
       - origin_certificate (export channel)
       - export_declaration (export channel)
```

---

## Phase 10 — Public verification

```
   Anyone (no auth) opens web-buyer/verify
       → enter NFN code (or scan QR)
       → GET /api/v1/certification/verify/:code
       → page renders one of:
           ✅ Certificat Valide — green card with traceability summary
           ❌ Certificat Révoqué — red card
           ❓ Aucun certificat trouvé — gray
       → can download a text certificate file
```

Test codes from the seed:
- `NFN-P1-00042-X7` → valid
- `NFN-P2-00148-M2` → revoked
- anything else → not_found

---

## The event log proves it all

```sql
SELECT event_type, actor_type, recorded_at
FROM events
WHERE aggregate_id = '<lot-uuid>'
ORDER BY recorded_at;
```

Returns the full audit trail of any lot:

```
collection.prelot.announced  | source           | 2026-04-25 02:35:00
collection.job.issued        | system           | 2026-04-25 02:35:01
collection.job.accepted      | collector        | 2026-04-25 02:36:14
collection.job.started       | collector        | 2026-04-25 02:36:18
collection.job.arrived       | collector        | 2026-04-25 02:42:31
collection.job.completed     | collector        | 2026-04-25 02:43:00
lot.collected                | collector        | 2026-04-25 02:43:00
transport.job.created        | system           | 2026-04-25 02:43:01
depot_received               | depot_manager    | 2026-04-25 09:14:22
depot_dispatched             | depot_manager    | 2026-04-25 11:00:05
laverie_received             | laverie_operator | 2026-04-25 13:30:11
washing_started              | laverie_operator | 2026-04-25 14:05:00
qualification_recorded       | laverie_operator | 2026-04-25 18:42:00
production_started           | transformer_op   | 2026-04-26 08:15:00
production_completed         | transformer_op   | 2026-04-26 16:00:00
certification_issued         | central_admin    | 2026-04-26 17:00:00
```

This is the value proposition: every kilo of wool from any field in Algeria
can be traced through every hand that touched it.
