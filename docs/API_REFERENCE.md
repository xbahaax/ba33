# API Reference

> 137 endpoints under `/api/v1/*`. JWT bearer auth except where noted.
> Swagger UI at `http://localhost:3001/api/docs`.

All requests/responses are JSON. Standard error shape:
```json
{ "statusCode": 400, "timestamp": "2026-04-25T...", "path": "/...", "message": "..." }
```

---

## 1. Auth & users

| Method | Path | Roles | Body / Notes |
|---|---|---|---|
| POST | `/auth/login` | public | `{ email?, phone?, password }` → `{ accessToken, tokenType, expiresInSeconds, user }` |
| POST | `/auth/register` | public | `{ email, password, fullName, companyName?, registrationNumber? }` |
| POST | `/auth/refresh` | public | `{ refreshToken }` → new pair |
| POST | `/auth/dev-login` | public | `{ email? | userId? }` — dev-only quick switch |
| POST | `/auth/logout` | bearer | revokes refresh token |
| GET | `/auth/me` | bearer | `{ user, permissions, assignedRoles, hasWebOperationsAccess }` |
| GET | `/auth/personas` | public | dev-only persona list |
| PATCH | `/auth/password` | bearer | `{ currentPassword, nextPassword }` |
| PATCH | `/auth/profile` | bearer | profile fields |
| GET | `/users/overview` | `users.view` | aggregated user stats |
| GET | `/users/access-overview` | `users.view` | RBAC overview (roles + effective perms per user) |
| PATCH | `/users/:userId/access` | `rbac.manage` | `{ status?, roleIds? }` |

JWT payload: `{ sub, email, type, fullName, regionId, permissions[], iat, exp }`.
Access token TTL: 24 h. See **[AUTH_AND_RBAC.md](AUTH_AND_RBAC.md)**.

---

## 2. Regions & files

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/regions/overview` | bearer | wilayas + communes + types |
| POST | `/files/upload` | bearer | multipart/form-data (`file`, `kind`, `uploadedBy?`) → `{ id, mimeType, sizeBytes, ... }` |
| GET | `/files/:id` | bearer | binary download |
| GET | `/files/:id/info` | bearer | metadata only |

---

## 3. Sources

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/sources` | bearer | create source explicitly (most are auto-created via declare-wool) |
| GET | `/sources` | bearer | filter `?type=&regionId=&status=` |
| GET | `/sources/shepherds` | bearer | shepherd subset |
| GET | `/sources/slaughterhouses` | bearer | slaughterhouse subset |
| GET | `/sources/:id` | bearer | source + type-specific extension |
| PATCH | `/sources/:id` | bearer | update |

---

## 4. Collection — the new two-actor model

### 4.1 Pre-lots (declarations)

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/collection/pre-lots/declare` | bearer | **Mobile-shepherd entry point.** Auto-creates source if missing, auto-issues a collection job. See payload below. |
| POST | `/collection/pre-lots/declare-on-behalf` | bearer | (legacy) collector/transporter declares for an offline shepherd |
| POST | `/collection/pre-lots` | bearer | manual create |
| GET | `/collection/pre-lots` | `shepherd`, `collector`, `central_admin`, `regional_manager` | filter `?status=&assignedCollectorId=&regionId=` (shepherd is auto-scoped to own sources) |
| GET | `/collection/pre-lots/:id` | bearer | detail |
| PATCH | `/collection/pre-lots/:id/assign` | `collector`, `central_admin` | `{ collectorId, scheduledAt }` |
| PATCH | `/collection/pre-lots/:id/complete` | `collector`, `central_admin` | `{ lotId }` (auto-called by job complete) |
| PATCH | `/collection/pre-lots/:id/cancel` | `collector`, `central_admin` | `{ reason? }` |

**`POST /collection/pre-lots/declare` body:**
```jsonc
{
  "userId": "uuid",                          // optional, defaults to caller
  "estimatedWeightKg": "40.0",               // required
  "latitude": "36.75", "longitude": "3.06",  // optional GPS
  "surnom": "Omar",                          // nickname
  "mazraa": "Mazraa Test",                   // farm/shop/abattoir name
  "profession": "shepherd",                  // shepherd|slaughterhouse|butcher|aggregator|other
  "regionId": "uuid",
  "photoId": "uuid",                         // file id from /files/upload
  "notes": "...",
  // Stage 1 fields (collection)
  "shearingDate": "2026-04-20",              // ISO date
  "sheepBreed": "Ouled Djellal",
  "bagCount": 3,
  "bagType": "jute",                         // PP|jute
  "lastParasiteTreatmentDate": "2026-03-15"
}
```

### 4.2 Collection jobs (the collector queue)

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/collection/jobs` | `collector`, `central_admin`, `regional_manager`, `depot_manager` | filter `?status=&collectorId=&depotId=`. Each job is enriched with `source`, `preLot`, `depot`. |
| GET | `/collection/jobs/me` | `collector` | jobs assigned to (or open for) current collector |
| GET | `/collection/jobs/:id` | bearer | detail |
| PATCH | `/collection/jobs/:id/assign` | `central_admin`, `regional_manager`, `depot_manager` | `{ collectorId }` |
| PATCH | `/collection/jobs/:id/accept` | `collector` | (no body) |
| PATCH | `/collection/jobs/:id/start` | `collector` | (no body) — starts GPS trip |
| POST | `/collection/jobs/:id/gps` | `collector` | `{ points: [{ lat, lng, speedMps?, accuracy?, recordedAt }] }` |
| PATCH | `/collection/jobs/:id/arrive` | `collector` | `{ lat?, lng? }` |
| POST | `/collection/jobs/:id/complete` | `collector` | **Submits the arrival form. Creates the lot.** Body: `{ actualWeightKg, stateQuick?, coldChainTempC?, gpsLat?, gpsLng?, notes?, qrCode?, isUrgent? }`. Returns `{ job, lot }`. |
| PATCH | `/collection/jobs/:id/cancel` | `collector`, `central_admin`, `depot_manager` | `{ reason? }` |

### 4.3 Collectors

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/collection/collectors` | `central_admin` | `{ userId, assignedRegions[], certifications? }` |
| GET | `/collection/collectors/me` | `collector` | own profile |
| GET | `/collection/collectors` | `central_admin`, `regional_manager`, `depot_manager` | for assignment dropdown — `[{ userId, fullName, phone, regionId, active, ... }]` |

### 4.4 Routes & booklets *(legacy, mostly unused in new model)*

| Method | Path | Roles |
|---|---|---|
| POST | `/collection/routes` | `collector`, `central_admin` |
| GET | `/collection/routes` | `collector`, `central_admin` |
| GET | `/collection/routes/:id` | `collector`, `central_admin` |
| PATCH | `/collection/routes/:routeId/stops/:stopId` | `collector`, `central_admin` |
| POST | `/collection/booklets` | `collector`, `central_admin` |

---

## 5. Lots

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/lots` | bearer | manual lot creation (typically auto-created on job.complete) |
| GET | `/lots` | bearer | filter `?collectorId=&sourceType=&status=&isUrgent=` |
| GET | `/lots/summary` | bearer | counts + breakdown |
| GET | `/lots/:id` | bearer | lot + photos + signatures + weighs |
| GET | `/lots/qr/:code` | bearer | resolve QR → lot |
| PATCH | `/lots/:id` | bearer | update mutable fields |
| PATCH | `/lots/:id/status` | bearer | `{ newStatus, ... }` — emits event, may notify on critical statuses |
| POST | `/lots/:id/photos` | bearer | `{ fileId, angle?, gpsLat?, gpsLng? }` |
| POST | `/lots/:id/signatures` | bearer | `{ type, fileId, signedByName? }` |

---

## 6. Transport

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/transport/transporters` | `central_admin` | onboard a transporter |
| POST | `/transport/jobs` | bearer | usually auto-created on lot.collected |
| GET | `/transport/jobs` | bearer | filter `?transporterId=&status=&lane=` |
| GET | `/transport/jobs/:id` | bearer | + lots |
| PATCH | `/transport/jobs/:id/accept` | bearer | `{ transporterId }` |
| PATCH | `/transport/jobs/:id/start` | bearer | begin trip |
| PATCH | `/transport/jobs/:id/complete` | bearer | finalize |
| POST | `/transport/jobs/:id/confirm-pickup` | bearer | converts pre-lot → lot at pickup |
| POST | `/transport/jobs/:id/lots/:lotId/load` | bearer | `{ loadedWeightKg }` weigh-in |
| POST | `/transport/jobs/:id/lots/:lotId/deliver` | bearer | `{ deliveredWeightKg }` weigh-out, auto-checks mismatch >2% |
| POST | `/transport/jobs/:id/gps` | bearer | `{ lat, lng, temperatureC? }` |
| GET | `/transport/jobs/:id/gps` | bearer | full GPS trail |
| POST | `/transport/jobs/:jobId/actions` | bearer | unified action endpoint `{ action: 'accept'|'start'|'deliver' }` |
| GET | `/transport/overview` | bearer | dashboard aggregation |

---

## 7. Depot

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/depot/receptions` | `depot.receive` | E1 entry audit. Body includes lot_classification, stack temp, humidity, VM%, plannedExitDate. |
| POST | `/depot/dispatches` | `depot.dispatch` | S1 dispatch. Routes to laverie or direct transformer with Flux A/B split. |
| GET | `/depot/overview` | `depot.view` | depots, zones, alerts, intake/dispatch queues, recent receptions, laveries |
| PATCH | `/operations/a1-alerts/:alertId/status` | `alerts.manage` | `{ status: 'open'|'acknowledged'|'resolved' }` |

---

## 8. Laverie

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/laverie/receptions` | `laverie.operate` | conditioning_state, required wash temp, detergent type |
| POST | `/laverie/washing-runs` | `laverie.operate` | dirty_weight, water L, cycle min, water temp °C, detergent type, suint recovered L |
| POST | `/laverie/qualifications` | `laverie.operate` | clean_weight (R1 yield), grade A/B/C/reject, safety, fiber metrics, dispatch_track. **Requires `targetTransformerId` if track is d3/d4.** Stage 7 fields: residual humidity %, residual suint %, whiteness, pH, energy kWh, water L/kg. |
| GET | `/laverie/overview` | `laverie.view` | laveries, active runs, recent qualifications, queues, transformers |

---

## 9. Transformation

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/transformation/runs` | `transformation.operate` | `{ transformerId, lotId, bomId, inputWeightKg, ... }`. Lot must be `qualified`. Stage 6 + 8 fields. |
| PATCH | `/transformation/runs/:runId/complete` | `transformation.operate` | `{ outputWeightKg, wasteWeightKg, quantity, productCode?, unit? }` → returns the **product** with `certificationId` (auto-created pending cert). |
| GET | `/transformation/overview` | `transformation.view` | transformers, active runs, recent products, dispatch queue, BOMs |

---

## 10. Certification

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/certification/overview` | `certification.view` | summary + cert list with gates |
| POST | `/certification/:id/issue` | `certification.manage` | `{ force? }`. Refuses if not `pending`. |
| POST | `/certification/:id/revoke` | `certification.manage` | `{ reason }` |
| GET | `/certification/verify/:code` | **public** | `{ code, status: 'valid'|'revoked'|'not_found', productType, grade, originRegion, certifiedAt, traceabilitySummary }` |
| GET | `/certification/verify/qr/:qrHash` | **public** | same shape, by QR hash |

---

## 11. Sales

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/products` | bearer | catalog query `?type=&grade=&regionId=&certified=&inStock=&channel=&sortBy=&page=&limit=` |
| GET | `/products/:id` | bearer | full product + traceability |
| GET | `/products/:id/traceability-summary` | bearer | abridged trace for buyers |
| GET | `/orders` | bearer (buyer) | buyer's own orders, filter `?status=&page=&limit=` |
| POST | `/orders` | bearer (buyer) | `{ channel?, items?, shippingAddressId? }` → creates draft |
| GET | `/orders/:id` | bearer | order detail |
| PATCH | `/orders/:id/items` | bearer | add/replace items |
| DELETE | `/orders/:id/items/:itemId` | bearer | remove item |
| POST | `/orders/:id/confirm` | bearer | draft → quote → confirmed |
| PATCH | `/orders/:id/status` | bearer (sales agent) | manual status push |
| GET | `/orders/:id/shipment` | bearer | shipment record |
| GET | `/orders/:id/documents` | bearer | doc list (invoice, cert, export, …) |
| GET | `/orders/:id/documents/:docId/download` | bearer | binary |
| POST | `/sales/orders/:orderId/actions` | `sales.manage` | `{ action: 'confirm'|'mark_paid'|'ship'|'deliver', trackingReference? }` |
| GET | `/sales/overview` | `sales.view` | orders summary by status |
| GET | `/documents` | bearer | global document list |
| GET | `/complaints` | bearer | own complaints |
| POST | `/complaints` | bearer | `{ orderId, reason, ... }` |
| GET | `/complaints/:id` | bearer | detail |
| GET | `/buyer/profile` | bearer | buyer profile |
| PATCH | `/buyer/profile` | bearer | update |
| GET | `/buyer/addresses` | bearer | shipping addresses |
| POST | `/buyer/addresses` | bearer | add |
| PATCH | `/buyer/addresses/:id` | bearer | update |
| DELETE | `/buyer/addresses/:id` | bearer | remove |

---

## 12. Operations dashboards

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/operations/command-center` | bearer | live aggregation: announced/in-transit/depot/wash/production/cert counts + flow + alerts + recent events + transport watch + terrain nodes |
| GET | `/operations/fulfillment` | bearer | per-phase queues |
| GET | `/operations/validation` | bearer | A1 alerts, weight alerts, safety findings, certification queue, urgent lots at risk |
| GET | `/operations/traceability/:lookupKey` | bearer | look up by lot id, QR, or product code → full trace |

---

## 13. Standalone services *(not wired into `AppModule` yet)*

These endpoints are documented because the modules are scaffolded, but they
are intentionally not active in the main backend until validation is complete.

### 13.1 Sheep AI

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/sheep-ai/detect-breed` | bearer or internal validation flow | multipart upload with `file` and optional `provider`. Returns normalized breed prediction + traits + confidence handling. |

### 13.2 SMS gateway

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/sms-gateway/inbound` | provider webhook / internal test flow | body: `{ from, message, providerMessageId?, latitude?, longitude?, geolocationPrecisionMeters? }`. Resolves sender against `sources.contactPhone`, persists inbound SMS, emits event. |
| POST | `/sms-gateway/providers/twilio/webhook` | Twilio webhook | `application/x-www-form-urlencoded` payload from Twilio. Signature-validated, normalized through the provider contract, then persisted through the same gateway service flow. |
| GET | `/sms-gateway/recent` | internal validation flow | lists recently received SMS records |

---

## 14. Institutional

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/institutional/dashboard` | `institutional.view` | KPIs |
| GET | `/institutional/sources-by-region` | `institutional.view` | aggregate by region |
| GET | `/institutional/lots-by-region` | `institutional.view` | aggregate by region |
| GET | `/institutional/activity` | `institutional.view` | recent events, paginated |

---

## 14. Events

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/events` | bearer | bulk push (mobile sync) |
| GET | `/events` | bearer | `?aggregateType=&aggregateId=` — full history of an entity |
| GET | `/events/recent` | bearer | last N events with actor names |
| GET | `/events/since` | bearer | `?recordedAt=ISO` — sync delta |

---

## 15. Audit

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/audit` | bearer | filtered audit log |
| GET | `/audit/:subjectType/:subjectId` | bearer | per-subject audit history |

---

## 16. Rules

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/rules/overview` | `rules.view` | active rules with versions |
| PATCH | `/rules/:ruleId` | `rules.manage` | `{ description?, value? }` — creates a new version row |

---

## 17. Sync (mobile)

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/sync/devices/register` | bearer | `{ deviceInfo }` → registers with namespace |
| GET | `/sync/devices` | bearer | own devices |
| GET | `/sync/devices/:deviceId` | bearer | detail |
| POST | `/sync/push/:deviceId` | bearer | bulk push events |
| GET | `/sync/pull/:deviceId` | bearer | pull events since last_sync_at |
| GET | `/sync/history/:deviceId` | bearer | sync batch history |

---

## 18. Notifications

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/notifications` | bearer | own notifications |
| PATCH | `/notifications/read-all` | bearer | mark all read |
| DELETE | `/notifications/:id` | bearer | dismiss |

---

## 19. Seed

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | `/seed` | public (dev) | runs the full seed script (truncates + inserts demo data) |

---

## RBAC quick reference

The **39 permissions** live in `apps/api/src/modules/auth/baseline-permissions.ts`. Each `userType` has a baseline set; users can also be assigned additional `roles` whose permissions merge in.

| permission | granted to (baseline) |
|---|---|
| `dashboard.view` | most ops user types |
| `traceability.view` | everyone except buyer |
| `collection.operate` | shepherd, collector, transporter |
| `transport.operate` | transporter, collector |
| `depot.{view,receive,dispatch}` | depot_manager (+ central_admin) |
| `laverie.{view,operate}` | laverie_operator (+ central_admin) |
| `transformation.{view,operate}` | transformer_operator (+ central_admin) |
| `sales.{view,manage}` | sales_agent (+ central_admin) |
| `certification.{view,manage}` | certification_authority, sales_agent (view), central_admin |
| `users.view`, `rbac.manage`, `rules.{view,manage}`, `alerts.manage` | central_admin |
| `institutional.view` | institutional |

Use `GET /auth/me` to inspect the caller's effective permissions.
