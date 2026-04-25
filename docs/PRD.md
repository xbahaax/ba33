# Product Requirements Document — ba33

> **Goal:** Make Algerian wool a traced, certified, exportable commodity by
> connecting every actor in the value chain — from the shepherd in the field
> to the ministry auditor — through a single, mobile-first, offline-tolerant
> platform.

---

## 1. The problem

Algeria produces ~25,000 tonnes of wool per year. Most of it is:
- Burned, buried, or thrown out as waste because there's no market access.
- Mixed and aggregated without origin tracking — a textile mill cannot prove
  provenance to an export buyer.
- Sold informally below cost — the shepherd has no leverage, the buyer has
  no quality signal.

Existing efforts fail because they:
- Demand smartphone literacy that rural shepherds don't have.
- Require always-on connectivity that doesn't exist in rural Algeria.
- Run as separate apps for separate roles — no end-to-end visibility.
- Capture data in spreadsheets that no auditor trusts.

---

## 2. The vision

**One platform, one event log, one NFN seal.** Every kilogram of wool that
enters the system is traced from the source to the certified product. Buyers
scan a QR and see the full chain. Ministries see aggregate stats without
breaching shepherd PII. Shepherds get a fair price because their wool is
traceable and certified.

The Algerian "filière laine" becomes a credible export commodity, on par with
Moroccan argan oil or Tunisian olive oil — but for fiber.

---

## 3. Users

### 3.1 Primary actors (mobile-first)

| Actor | App | Frequency | Why |
|---|---|---|---|
| **Wool source** (shepherd, slaughterhouse, butcher, aggregator) | `mobile-shepherd` | Monthly | Declare wool availability in <10s |
| **Field collector** | `mobile-collector` | Daily | Execute pickups assigned by depot |

### 3.2 Operational actors (web)

| Actor | App | Why |
|---|---|---|
| **Depot manager** | web-operations · `/depot` | Receive lots, classify (E1), dispatch (S1) |
| **Laverie operator** | web-operations · `/laverie` | Weigh-in, wash, qualify, dispatch to D3/D4 |
| **Transformation operator** | web-operations · `/transformation` | Production runs, BOM, product codes |
| **Sales agent** | web-operations · `/sales` | Orders, channels, fulfillment |
| **Certification authority** | web-operations · `/admin/certification` | Issue / revoke NFN seals |
| **Central admin** | web-operations · `/admin` | Everything |
| **Regional manager** | web-operations · `/admin` (region-scoped) | Regional dashboards, alerts |

### 3.3 External actors

| Actor | App | Why |
|---|---|---|
| **B2B buyer** (textile mill, ag company, export agent) | `web-buyer` | Browse catalog, place orders, verify certs |
| **Ministry** (Agriculture, Commerce, Customs) | `web-institutional` | Read-only oversight, regulatory filings |
| **Public** | `web-buyer/verify` (no auth) | Verify any NFN seal by code or QR |

---

## 4. Core principles

1. **The lot is the spine.** Every entity hangs off `lots`. No data exists
   outside the lot's lineage.
2. **Events are append-only.** Corrections are new events, never edits.
   Auditability is non-negotiable.
3. **Mobile-first, offline-tolerant.** The collector and the source can
   operate offline; sync happens when connectivity returns.
4. **One backend.** Mobile and web share `/api/v1/*`. No fork.
5. **Two-actor collection model.** A wool source declares; a collector
   executes an instruction issued by the depot. No autonomous routing.
6. **Every handoff is a weigh-in/weigh-out.** Reconciliation flags
   discrepancies above tolerance automatically.

---

## 5. Scope (MVP delivered)

### ✅ In scope and shipped

| Domain | What works |
|---|---|
| **Auth** | JWT + refresh, 11 personas, RBAC with 39 permissions, dev-login picker |
| **Source declaration** | mobile-shepherd unified app, profession picker, 12-field form (weight, breed, bag count/type, dates, location, photo) |
| **Collection job lifecycle** | Auto-issue from declaration, assign → accept → start → GPS → arrive → complete (creates lot) |
| **Depot E1 / S1** | Reception with classification (class A/B), dispatch to laverie with Flux A/B split |
| **Laverie** | Reception → washing run → qualification → S2/S3 dispatch → pricing |
| **Transformation** | Production runs (D3 textile / D4 bio) → product code (P1/P2) |
| **Certification** | Auto-creates pending cert on production complete, manual issue/revoke, public verify |
| **Sales** | Orders, 3 channels, documents, complaints |
| **Operations dashboards** | Command center, fulfillment, validation, traceability |
| **Public verification** | `/verify?code=NFN-...` returns valid/revoked/not_found with traceability summary |
| **Event log** | Every lifecycle transition recorded, queryable by aggregate |
| **Reconciliation** | Auto weight delta check on each weigh-out |

### ⛔ Stubbed for v1

| Feature | Stubbed how |
|---|---|
| SMS/USSD gateway | Not implemented |
| WhatsApp bot | Not implemented |
| Push notifications | Records created in DB, no FCM/APNs send |
| Payment processing | Orders mark `payment_status: pending`, no gateway calls |
| Bluetooth scale | Manual weight entry only |
| Bluetooth printer | QR generated, no thermal printing |
| Cold-chain IoT sensors | `cold_chain_temp_c` column exists, manual entry |
| Voice transcription | Voice notes stored, not transcribed |
| mTLS for institutional | JWT used instead |
| Multi-language UI | Strings hardcoded; Darija + French + Arabic mixed per app |
| Export document templating | Endpoint returns stub PDF |

---

## 6. Out of scope (future)

- General ledger / tax accounting integration
- Mobile payment disbursement to shepherds
- Machine learning (yield prediction, fraud scoring)
- Multi-country expansion
- Loyalty / premium program economics

---

## 7. Success criteria for the demo

1. A shepherd declares wool → backend auto-issues a collection job to the
   closest depot, with all 12 form fields persisted.
2. The depot manager sees the job in the **Missions de collecte** panel,
   assigns a collector with one click.
3. The collector accepts → starts → arrives (GPS-detected within 150m) →
   submits the arrival form. A lot is created, the pre-lot closes, the job
   completes.
4. The lot can be received at the depot (E1), dispatched to laverie (S1),
   washed + qualified + dispatched to D3 (S2/S3), transformed into a product,
   and certified — all via API endpoints (most via web UI; some via API
   directly because UI for downstream phases is overview-only in v1).
5. A public visitor enters a valid NFN code at `/verify` and sees the green
   "Certificat Valide" card with traceability summary.
6. `bash scripts/test-pipeline.sh` returns **55/55 pass**.

All six are met today. See **[DEMO_GUIDE.md](DEMO_GUIDE.md)** for the script.

---

## 8. Design north stars

- **No raw colors anywhere.** Use design tokens. See `.claude/desiegn_system.md`.
- **The lot is sovereign.** No business logic is allowed to "forget" which lot
  it's about.
- **No silent state changes.** Every status update emits an event with actor
  attribution.
- **Tolerance is configurable, not hardcoded.** A1 thresholds, S2/S3 dispatch
  criteria, pricing rules — all in `rules_config` table.
- **The shepherd's UX comes first.** If we have to compromise UX somewhere, it
  is never on `mobile-shepherd`. That actor is the most fragile.

---

## 9. The "ba33" name

Lowercase, no space, no uppercase. In code: `ba33`. In packages:
`@ba33/...` (TS) and `ba33_...` (Dart). In domains: `ba33.dz`.

The name is a wordplay — "ba33" sounds like *bah* + a serial code. It's
short, types fast on a 5-inch keypad, and survives Latin/Arabic input
modes.
