# Web Operations

Internal NFN operations console for workflow execution, validation, control, traceability, RBAC, and rule management.

`apps/web-operations` is the internal back office of the NFN wool filiere platform. It is the web app used by operators, supervisors, and admins to move lots through the chain and to validate the key control gates from D1 through certification and sales.

This README is focused on three things:

- the workflow implemented in `web-operations`
- what each role can actually do
- how validation works exactly in the current codebase

## Scope

This app covers the internal web workflow only. It is not:

- the buyer portal
- the institutional portal
- the collector / shepherd / transporter mobile apps

Current internal routes:

- `/` Command Center
- `/fulfillment`
- `/analytics` Control & validation
- `/traceability`
- `/depot`
- `/laverie`
- `/transformation`
- `/transport`
- `/sales`
- `/certification`
- `/users`
- `/settings`
- `/regions`

## Workflow Overview

The current `web-operations` workflow is implemented as a chain of operator actions over the shared API in `apps/api`.

### 1. Command Center and Fulfillment

Purpose:

- see the live state of the chain
- understand queues before acting
- identify bottlenecks, alerts, and current handoffs

This layer is mostly supervisory. It does not mutate core workflow records directly, except that the control screen can manage A1 alert status.

### 2. Depot D1

Page: `/depot`

Main operator:

- `depot_manager`

Inputs:

- lots coming from field collection or transport
- lots already stored and ready for sortie

Actions:

- `E1` reception / validation
- zone assignment
- `S1` sortie dispatch to laverie

Outputs:

- lot status `received_depot`
- lot status `dispatched_to_laverie`
- updated depot stock and zone stock
- weigh record `depot_entry`
- append-only workflow events

### 3. Transport

Page: `/transport`

Main operators:

- `regional_manager`
- any user with `transport.manage`

Inputs:

- transport jobs already created in the backend

Actions:

- accept job
- start job
- deliver job

Outputs:

- transport job status `accepted`, `in_progress`, or `delivered`
- lot current location moved to destination on delivery
- append-only transport events

Important:

- transport validates the leg execution
- destination modules still validate the business handoff itself
- example: delivering to laverie does not replace the laverie reception action

### 4. Laverie D2

Page: `/laverie`

Main operator:

- `laverie_operator`

Inputs:

- lots dispatched from depot
- lots received in laverie and waiting wash
- washing runs waiting qualification

Actions:

- laverie reception
- washing run start
- qualification
- pricing calculation
- `S2/S3` dispatch toward D3 / D4 / quarantine / reject

Outputs:

- lot status `received_laverie`
- lot status `washing`
- lot status `dispatched_to_d3`
- lot status `dispatched_to_d4`
- lot status `quarantined`
- lot status `rejected`
- weigh records `laverie_entry` and `washing_in` / `washing_out`
- qualification record
- pricing proposal
- laverie dispatch record
- append-only workflow events

### 5. Transformation D3 / D4

Page: `/transformation`

Main operator:

- `transformer_operator`

Inputs:

- lots dispatched from laverie toward D3 or D4
- active BOMs

Actions:

- start production run
- complete production run

Outputs:

- lot status `in_transformation`
- lot status `transformed`
- production run output and waste
- new product record
- auto-created pending certification record
- append-only workflow events

### 6. Certification

Page: `/certification`

Main operators:

- `central_admin`
- `certification_authority`
- any role with `certification.manage`

Inputs:

- pending certifications created from transformation output

Actions:

- issue certification
- revoke certification

Outputs:

- certification status `issued` or `revoked`
- product status `certified` or `rejected`
- linked lots moved to `certified` on issuance
- append-only certification events

### 7. Sales

Page: `/sales`

Main operator:

- `sales_agent`

Inputs:

- orders and shipments already present in the backend

Actions:

- confirm order
- mark order paid
- ship order
- deliver order

Outputs:

- order status `confirmed`, `paid`, `shipped`, `delivered`
- shipment status `in_transit` or `delivered`
- append-only order / shipment events

### 8. Control and Traceability

Pages:

- `/analytics`
- `/traceability`

Purpose:

- cross-phase validation
- alert handling
- dispute investigation
- lineage reconstruction

Actions currently implemented:

- acknowledge A1 alert
- resolve A1 alert
- lookup lot or product lineage

## Validation: How It Works Exactly

This section describes the current validation logic implemented in code, not the future target state.

### Access Validation

Validation starts before business workflow:

- the frontend checks permissions and hides routes/actions the current session cannot use
- the backend enforces permissions again with `JwtAuthGuard` and `PermissionsGuard`
- if the user lacks the required permission, the API rejects the action even if the frontend is bypassed

RBAC source:

- `apps/api/src/common/auth/rbac.ts`

### E1 Entry Validation at Depot

Endpoint:

- `POST /depot/receptions`

Allowed only if the lot status is:

- `collected`
- `in_transit`

What the operator provides:

- `depotId`
- `lotId`
- optional `zoneId`
- `actualWeightKg`
- optional notes

What the backend validates:

- the lot exists
- the lot is in a receivable state
- the depot exists
- if a zone is provided, it belongs to that depot

How discrepancy is calculated:

- `declaredWeightKg = lot.actualWeightKg ?? lot.declaredWeightKg ?? input.actualWeightKg`
- `discrepancyKg = actualWeightKg - declaredWeightKg`

How tolerance is flagged:

- `toleranceExceeded = abs(discrepancyKg) > max(declaredWeightKg * 0.05, 5)`

What is written:

- a `depot_receptions` row
- a `lot_weighs` row with phase `depot_entry`
- lot status becomes `received_depot`
- lot location becomes the selected depot
- depot stock increases
- zone stock increases if a zone was selected
- event `depot_received` is appended

### S1 Exit Validation at Depot

Endpoint:

- `POST /depot/dispatches`

Allowed only if the lot status is:

- `received_depot`
- `in_pretri`
- `stored`

What the operator provides:

- `depotId`
- `lotId`
- `destinationLaverieId`
- optional `manifestWeightKg`

What the backend validates:

- the lot exists
- the lot is in a dispatchable depot state
- the depot exists
- the destination laverie exists

What is written:

- a `depot_dispatches` row
- a `depot_dispatch_lots` row
- lot status becomes `dispatched_to_laverie`
- lot location becomes the destination laverie
- depot stock decreases
- latest zone stock decreases if the lot had a latest recorded zone
- event `depot_dispatched` is appended

### Laverie Reception Validation

Endpoint:

- `POST /laverie/receptions`

Allowed only if the lot status is:

- `dispatched_to_laverie`

What is written:

- a `laverie_receptions` row
- a `lot_weighs` row with phase `laverie_entry`
- lot status becomes `received_laverie`
- lot location becomes the selected laverie
- event `laverie_received`

### Washing Start Validation

Endpoint:

- `POST /laverie/washing-runs`

Allowed only if:

- the lot status is `received_laverie`
- there is no active uncompleted wash run for the same lot

What is written:

- a `washing_runs` row
- a `lot_weighs` row with phase `washing_in`
- lot status becomes `washing`
- event `washing_started`

### Qualification Validation

Endpoint:

- `POST /laverie/qualifications`

Allowed only if:

- the washing run exists
- the run has not already been qualified
- if dispatch is `d3_textile` or `d4_bio`, a target transformer is provided

What the operator provides:

- clean weight
- grade
- safety status
- fiber metrics
- cleanliness / moisture / color
- contamination notes
- dispatch track
- optional target transformer

Yield calculation:

- `yieldPercent = (cleanWeightKg / dirtyWeightKg) * 100`

Pricing calculation:

- base price comes from rule `pricing.base.matrix`
- urgency discount is `8%` if lot urgency is `urgent`, else `0`
- source adjustment is:
- `+5%` for `c1_shepherd`
- `-5%` for `c3_aggregator`
- `0%` otherwise
- final price:
  `basePricePerKg * (1 - urgencyDiscountPercent / 100) * (1 + sourceTypeAdjustmentPercent / 100)`

Dispatch output:

- if `d3_textile` -> lot status `dispatched_to_d3`
- if `d4_bio` -> lot status `dispatched_to_d4`
- if `quarantine` -> lot status `quarantined`
- if `reject` -> lot status `rejected`

What is written:

- wash run gets `cleanWeightKg`, `yieldPercent`, `completedAt`
- `qualifications` row
- `pricing_proposals` row
- `laverie_dispatches` row for D3/D4 dispatches
- `lot_weighs` row with phase `washing_out`
- append event `qualification_recorded`

### Transport Validation

Endpoint:

- `POST /transport/jobs/:jobId/actions`

Allowed transitions:

- `accept` only from `pending` or `assigned`
- `start` only from `pending`, `assigned`, or `accepted`
- `deliver` only from `accepted` or `in_progress`

What is written:

- transport job status update
- delivery timestamps on `transport_job_lots` when delivered
- lot location updated to the job destination on delivery
- append event:
  - `transport_accepted`
  - `transport_started`
  - `transport_delivered`

Important:

- transport delivery updates location
- business status advancement is still validated by the destination module

### Transformation Validation

Start endpoint:

- `POST /transformation/runs`

Completion endpoint:

- `PATCH /transformation/runs/:runId/complete`

Run start is allowed only if:

- the lot status is `dispatched_to_d3` or `dispatched_to_d4`
- the selected BOM belongs to the selected transformer
- there is no other active run already using that lot

What start writes:

- `production_runs` row
- `production_run_lots` row
- lot status becomes `in_transformation`
- event `production_started`

Run completion is allowed only if:

- the run exists
- the run is not already completed
- track and product type are available

Completion writes:

- completed production metrics
- product row with status `produced`
- pending certification row with initial gates
- optional waste record if waste > 0
- linked lots become `transformed`
- event `production_completed`

### Certification Validation

Issue endpoint:

- `POST /certification/:certificationId/issue`

Revoke endpoint:

- `POST /certification/:certificationId/revoke`

Issue is allowed only if:

- certification status is `pending`
- all `gatesPassed` values are true
- or `force: true` is explicitly provided

Issue writes:

- certification status `issued`
- signature generated as `NFN-<productCode>-<timestamp>`
- product status becomes `certified`
- linked lots become `certified`
- event `certification_issued`

Revoke is allowed only if:

- certification status is `issued`

Revoke writes:

- certification status `revoked`
- revoke reason and revoke timestamp
- product status becomes `rejected`
- event `certification_revoked`

### Sales Validation

Endpoint:

- `POST /sales/orders/:orderId/actions`

Allowed transitions:

- `confirm` from `draft` or `quote`
- `mark_paid` from `confirmed`, `paid`, `preparing`, or `shipped`
- `ship` from `confirmed`, `paid`, or `preparing`
- `deliver` from `shipped` or `preparing`

What is written:

- order status updates
- payment status update
- shipment row creation or update
- tracking reference on ship / deliver when provided
- event:
  - `order_confirmed`
  - `order_paid`
  - `shipment_started`
  - `shipment_delivered`

### Control Validation

Endpoint:

- `PATCH /operations/a1-alerts/:alertId/status`

Allowed statuses:

- `open`
- `acknowledged`
- `resolved`

Who can do it:

- any role with `alerts.manage`

### Event Log Validation Spine

Every workflow mutation appends an event instead of silently mutating state.

Current implementation:

- aggregate type and aggregate id are stored
- actor id and actor type are stored
- payload is stored
- version is incremented as `max(existingVersion) + 1` per aggregate
- checksum is generated from the serialized event body

This gives the app:

- traceability
- auditability
- compensating-history behavior instead of hidden state changes

## Role Matrix

The table below describes what each role is meant to do in `web-operations` today.

| Role | Main pages | Workflow actions | Notes |
| --- | --- | --- | --- |
| `central_admin` | all pages | all actions | Full internal access. |
| `regional_manager` | dashboard, fulfillment, validation, traceability, depot, laverie, transport, certification, regions, users, rules | depot receive/dispatch, laverie operate, transport manage | Supervisory operator with some operational power. No sales page by default. No certification issue/revoke by default. |
| `depot_manager` | dashboard, fulfillment, validation, traceability, depot | depot receive, depot dispatch | Owns D1. |
| `laverie_operator` | dashboard, fulfillment, validation, traceability, laverie, certification | laverie receive, wash, qualify, route | Owns D2. Certification is view-only by default. |
| `transformer_operator` | dashboard, fulfillment, traceability, transformation, certification | transformation start/complete | Owns D3 / D4 production. Certification is view-only by default. |
| `sales_agent` | dashboard, traceability, sales, certification, analytics | sales order actions | Owns commercial progression. |
| `collector` | dashboard, fulfillment, traceability | none | Read-only follow-up persona. |

Overlay roles:

| Overlay role | Adds | Practical effect |
| --- | --- | --- |
| `control_supervisor` | `validation.view`, `alerts.manage` | Can work the control screen and resolve A1 alerts. |
| `rules_admin` | `rules.view`, `rules.manage` | Can version operational rules. |
| `rbac_admin` | `users.view`, `rbac.manage` | Can manage internal access and role overlays. |
| `certification_authority` | `certification.view`, `certification.manage` | Can issue and revoke NFN seals. |

## Dev Access

`web-operations` currently uses development persona login, not a password form.

Implemented auth flow:

1. `GET /auth/personas`
2. `POST /auth/dev-login`
3. JWT stored in browser local storage
4. `GET /auth/me` for session bootstrap

Important:

- `passwordHash: 'dev_hash'` in seed data is not a usable UI password here
- this app auto-falls back to the first active admin persona when possible
- buyers and institutional users are not in the internal persona picker

Seeded personas relevant to `web-operations`:

| Email | Full name | User type | Status | Workflow role |
| --- | --- | --- | --- | --- |
| `admin@ba33.local` | Yacine Admin | `central_admin` | active | Full operator / admin |
| `collector@ba33.local` | Amina Collecte | `collector` | active | Read-only field follow-up |
| `depot@ba33.local` | Karim Depot | `depot_manager` | active | D1 operator |
| `laverie@ba33.local` | Sofia Laverie | `laverie_operator` | active | D2 operator |
| `transformer@ba33.local` | Nadir Transformation | `transformer_operator` | active | D3/D4 operator |
| `sales@ba33.local` | Meriem Sales | `sales_agent` | active | Sales operator |
| `transport@ba33.local` | Samir Transport | `regional_manager` | active | Transport-capable supervisory persona |
| `regional@ba33.local` | Rania Region | `regional_manager` | suspended | Cannot log in while suspended |

Not included in the internal picker:

| Email | Full name | User type | Reason |
| --- | --- | --- | --- |
| `buyer@ba33.local` | SARL EcoTex | `buyer` | External buyer flow, not internal ops |

## Main Endpoints Used by Web Operations

Auth:

- `GET /auth/personas`
- `POST /auth/dev-login`
- `GET /auth/me`

Control and lookup:

- `GET /operations/command-center`
- `GET /operations/fulfillment`
- `GET /operations/validation`
- `GET /operations/traceability/:lookupKey`
- `PATCH /operations/a1-alerts/:alertId/status`

Workflow endpoints:

- `POST /depot/receptions`
- `POST /depot/dispatches`
- `POST /laverie/receptions`
- `POST /laverie/washing-runs`
- `POST /laverie/qualifications`
- `POST /transport/jobs/:jobId/actions`
- `POST /transformation/runs`
- `PATCH /transformation/runs/:runId/complete`
- `POST /sales/orders/:orderId/actions`
- `POST /certification/:certificationId/issue`
- `POST /certification/:certificationId/revoke`

Admin endpoints:

- `GET /users/access-overview`
- `PATCH /users/:userId/access`
- `GET /rules/overview`
- `PATCH /rules/:ruleId`

## Local Run

From the workspace root:

```bash
npm run dev:api
```

In another terminal:

```bash
npm run dev:web-operations
```

Default ports:

- web: `http://localhost:3000`
- api: `http://localhost:3001`

## Current Implementation Boundary

What is implemented in `web-operations` now:

- internal workflow actions for depot, laverie, transport, transformation, sales, certification
- control and A1 handling
- traceability lookup
- RBAC and persona switching
- rule and access administration

What is not fully implemented here yet:

- the mobile apps from the CDC
- buyer portal and institutional portal
- the full automated rule engine behavior envisioned in the CDC
- every downstream regulatory / export document workflow
- all future analytics and ML layers

Useful commands:

```bash
npm run db:seed
npm run typecheck --workspace=@ba33/web-operations
npm run build --workspace=@ba33/web-operations
```

## Environment Variables

The app resolves the API base URL like this:

- server side: `BA33_API_URL`, then `NEXT_PUBLIC_BA33_API_URL`, then `http://localhost:3001`
- client side: `NEXT_PUBLIC_BA33_API_URL`, then `http://localhost:3001`

Typical local setup:

```bash
NEXT_PUBLIC_BA33_API_URL=http://localhost:3001
BA33_API_URL=http://localhost:3001
```

## Current Implementation Notes

- this app is internally focused and does not implement buyer or institutional authentication flows
- password login is not wired in this frontend yet
- the persona switcher is the intended development access mechanism
- the transport seed user is broader than a dedicated dispatcher persona because it is currently seeded as `regional_manager`
- `analytics.view` exists in the RBAC catalog but is not bound to a separate page right now
