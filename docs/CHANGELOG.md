# Changelog (MVP scope)

> Significant changes since the original cahier de charges, organized by
> theme. The cahier sources in `.claude/` describe the *original* design;
> this file tracks where the implementation diverges.

---

## 2026-04-25 — Two-actor collection model

**The biggest design change.** Replaces the C1/C2/C3 source taxonomy +
separate Shepherd Lite + Collector App design with a unified two-actor model.

### Motivation

The cahier originally described:
- Three source types (C1/C2/C3) with different forms and routing logic.
- A Shepherd Lite App (one-button declaration) and a Collector App (full
  field workflow with autonomous routing) as separate apps.

In practice, this would have:
- Forced source-type-specific UI branches that confused users (a butcher is
  not a shepherd, but the cahier shoehorned them into C2).
- Required collectors to plan their own routes, when in reality the depot
  knows where lots are.

### Resolution

- **One `mobile-shepherd` app** for any wool source. Profession picker at
  first login (shepherd / slaughterhouse / butcher / aggregator / other).
  Same form regardless of profession (with profession-aware sections).
- **One `mobile-collector` app**, instruction-driven. The depot issues
  collection jobs; the collector executes them.
- **New `collection_jobs` table** + endpoints for the lifecycle
  (pending → assigned → accepted → in_progress → arrived → completed).
- **Lot creation moves to arrival.** The collector's arrival-form submission
  creates the lot; the pre-lot closes; the job completes.

### Migrations

- `0002_add_collection_jobs.sql` — adds `collection_jobs`,
  `collection_job_gps_points`, `source_profession` enum,
  `collection_job_status` enum, `sources.profession` column.

### What stayed

- C1/C2/C3 enum (`source_type`) is still in the schema for reporting
  back-compat. The `profession` enum is a parallel attribute.
- `pre_lots` table still exists. The new flow:
  declaration → pre-lot announced → auto-issue collection job → … → lot.

### Removed

- `apps/mobile-transporter/` — deleted. The transporter persona stays for
  inter-facility transport jobs (depot → laverie → transformer), but that
  flow is driven from web-operations in v1.
- The `WeightCategory` cards UI in mobile-shepherd (one_sheep / one_bag /
  small_pile / large_pile) — replaced by a real numeric kg input.

---

## 2026-04-25 — Splash + onboarding screens

Both mobile apps now boot through:

```
splash (1.1s) → onboarding (3-slide intro) → login → home
```

- `shared_preferences`-backed `OnboardingSeen` flag (key `onboarding_seen_v1`).
- Skip button on every slide marks seen.
- Animated page indicators.
- Profession-aware second-step (shepherd app only): if profession not set,
  redirects to the profession picker before the home screen.

---

## 2026-04-25 — Web-ops "Missions de collecte" panel

New top section on `/depot` page:
- Lists pending + in-flight collection jobs.
- Auto-refreshes every 15s.
- Pending jobs have a collector dropdown + **Assigner** + **Annuler** actions.
- Backed by new endpoints:
  - `GET /collection/jobs` (with role-based filter)
  - `GET /collection/collectors` (for the dropdown)
  - `PATCH /collection/jobs/:id/assign`
  - `PATCH /collection/jobs/:id/cancel`

---

## 2026-04-25 — Public certificate verification

The `/verify` page in web-buyer is now public:
- Removed from the middleware `PROTECTED_ROUTES`.
- Moved out of the `(buyer)` layout (no auth required).
- Renders three states: ✅ valid, ❌ revoked, ❓ not_found.
- Inline traceability summary (collection date, washing yield %, audits passed).
- Downloadable text certificate.

---

## 2026-04-25 — Stage-specific schema fields

`0001_curly_hammerhead.sql` (added by team) introduces fine-grained
stage-specific fields per the cahier:

### Pre-lots (Stage 1 — collection)
`shearingDate`, `sheepBreed`, `bagCount`, `bagType` (PP/jute),
`lastParasiteTreatmentDate`.

### Depot receptions (Stage 3 — pré-tri)
`lotClassification` (class_a/class_b), `stackTemperatureC`,
`humidityEntryPercent`, `vegetalMatterPercent`, `plannedExitDate`.

### Depot dispatches (Stage 4)
`destinationDirect`, `fluxAWeightKg`, `fluxBWeightKg`,
`impurityRatePercent`, `humidityExitPercent`.

### Laverie receptions (Stage 5)
`conditioningState` (correct/torn/humid), `requiredWashTempC`,
`requiredDetergentType`.

### Washing runs (Stage 5/7)
`detergentType`, `suintRecoveredLiters`.

### Qualifications (Stage 7 — purity certificate)
`residualHumidityPercent`, `residualSuintPercent`, `whitenessIndex`,
`phLevel`, `energyKwhUsed`, `waterLitersPerKg`.

### Production runs (Stage 6 — direct fertilizer)
`drynessIndex`, `foreignBodyPresent`, `foreignBodyNotes`,
`unloadingMode` (vrac/balles).

### Production runs (Stage 8 — insulation/geotextile)
`productDestinationType` (4 flux types), `targetThicknessMm`,
`targetDensityKgM3`, `antimitesTreatmentType` (natural/synthetic),
`bindingFiberPercent`, `fireRetardantProduct`.

---

## Pragmatic v1 simplifications (vs cahier)

What the cahier specified but v1 stubbed for time:

| Cahier feature | v1 status |
|---|---|
| SMS / USSD gateway | not built |
| WhatsApp bot | not built |
| Bluetooth thermal printer | manual print only |
| Bluetooth scale | manual entry only |
| Voice transcription | files stored, not transcribed |
| Push notifications (FCM/APNs) | DB rows created, no actual send |
| Payment gateway integration | orders mark `payment_status: pending`, no real charge |
| Customs API integration | stubbed PDF |
| mTLS for institutional | replaced with JWT |
| SSO for ministries | replaced with email + password |
| Cold-chain IoT sensors | manual `cold_chain_temp_c` input |
| External carrier tracking | manual status updates |
| Multi-language UI everywhere | each app uses its primary language |
| Offline-first sync (mobile) | sync endpoints exist, mobile clients online-only in v1 |

---

## Roadmap (post-MVP)

In rough priority:

1. **OpenAPI codegen** — wire `tools/codegen` to regenerate
   `@ba33/api-client` and `ba33_api_client` from the live spec.
2. **Mobile offline sync** — Drift local DB + sync queue in `ba33_offline_sync`.
3. **2FA + SSO + mTLS** — production-grade auth for institutional users.
4. **Real notifications** — FCM for Android, APNs for iOS.
5. **Payment integrations** — BaridiMob (DZ), SWIFT (export), L/C.
6. **Bluetooth scale + printer** — real device protocols.
7. **Voice transcription** — server-side Whisper for Darija/Arabic.
8. **Drift-backed mobile DB** — complete the offline-first vision.
9. **Real-time live map** — WebSockets for the central dashboard.
10. **i18n everywhere** — full Arabic + French + Darija + Tamazight in all apps.
