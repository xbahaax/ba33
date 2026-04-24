# Web Operations

Internal NFN operations console for command, control, validation, traceability, RBAC, and rule management.

This app is the internal web back office of the NFN platform. It is not the buyer portal, not the institutional portal, and not the mobile field apps. It is the operator-facing console used to supervise the wool chain from intake through depot, laverie, transformation, certification, and sales follow-up.

## Scope

`apps/web-operations` currently covers these internal modules:

- `Command Center` at `/`
- `Fulfillment` at `/fulfillment`
- `Controle` at `/analytics`
- `Tracabilite` at `/traceability`
- `Depot D1` at `/depot`
- `Laverie D2` at `/laverie`
- `Transformation D3/D4` at `/transformation`
- `Ventes` at `/sales`
- `Transport` at `/transport`
- `Certification NFN` at `/certification`
- `Regions` at `/regions`
- `Acces & RBAC` at `/users`
- `Regles` at `/settings`

The app consumes the shared API in `apps/api` and relies on JWT-backed RBAC permissions exposed by the auth and operations endpoints.

## What Each Screen Does

### Command Center

Global live view of the chain:

- announced pre-lots
- lots in transit
- depot load
- active wash runs
- active production runs
- open alerts
- recent events
- terrain nodes

Primary audience:

- central admin
- regional managers
- operations supervisors

### Fulfillment

Execution queues across the chain:

- collection queue
- transport queue
- depot queue
- washing queue
- qualification queue
- downstream production and sales queue

Primary audience:

- operations coordination
- depot managers
- laverie operators
- transformation operators

### Controle

Cross-phase validation and control surface:

- A1 alert queue
- weight discrepancy alerts
- safety findings
- certification queue
- urgent lots at risk

If the connected persona has `alerts.manage`, the page can acknowledge or resolve A1 alerts directly from the UI.

Primary audience:

- central control
- control supervisors
- depot and laverie quality oversight

### Tracabilite

Lookup and lineage reconstruction for:

- lot ID
- lot QR
- P1 product code
- P2 product code
- certification-linked references

The page reconstructs:

- source summary
- chain of custody
- weighs
- quality checks
- downstream links
- append-only timeline

Primary audience:

- audit
- control
- certification
- sales support
- dispute investigation

### Depot D1

Depot operations overview:

- depot occupancy
- recent receptions
- open depot alerts

Primary audience:

- depot managers
- regional supervisors

### Laverie D2

Wash and qualification supervision:

- laverie sites
- active wash runs
- recent qualifications

Primary audience:

- laverie operators
- quality control

### Transformation D3/D4

Transformation supervision:

- transformers
- active runs
- recent products

Primary audience:

- transformer operators
- downstream operations

### Ventes

Sales overview:

- order pipeline
- payment state
- channel visibility

Primary audience:

- sales agents
- commercial supervision

### Transport

Transport overview:

- jobs by status
- urgent vs normal jobs
- assigned transporter visibility

Primary audience:

- dispatch
- regional operations

### Certification

Certification overview:

- pending
- issued
- revoked

Primary audience:

- certification authority
- central admin

### Regions

Reference geography used for routing, reporting, and assignment.

Primary audience:

- admin
- regional operations

### Acces & RBAC

Internal access administration:

- user list
- role overlays
- baseline permissions
- effective permissions
- status changes

If the connected persona has `rbac.manage`, the page can update user status and assigned role overlays.

Primary audience:

- central admin
- RBAC admin

### Regles

Operational rule management:

- rule catalog
- rule versioning
- JSON rule value editing
- description updates

If the connected persona has `rules.manage`, the page can publish a new rule version.

Primary audience:

- central admin
- rules admin

## Authentication Model

`web-operations` currently uses a development persona flow, not a password login form.

Implemented flow:

1. The app calls `GET /auth/personas`.
2. If there is no valid local token, it calls `POST /auth/dev-login`.
3. The selected persona receives a JWT.
4. The token is stored in browser local storage under `ba33.web-operations.access-token`.
5. The user can switch persona from the left sidebar.

Important:

- there is no password entry flow in this UI today
- the app auto-falls back to the first active `central_admin` persona when possible
- suspended users cannot log in through `dev-login`
- buyers and institutional users are not part of the internal persona picker

## Dev Access Credentials

There are seeded development personas in `apps/api/src/scripts/seed.ts`.

These are the internal personas available to `web-operations`:

| Email | Full name | User type | Status | Notes |
| --- | --- | --- | --- | --- |
| `admin@ba33.local` | Yacine Admin | `central_admin` | active | Default fallback persona. Full access. |
| `collector@ba33.local` | Amina Collecte | `collector` | active | Read-only field follow-up persona. |
| `depot@ba33.local` | Karim Depot | `depot_manager` | active | Depot-focused persona. |
| `laverie@ba33.local` | Sofia Laverie | `laverie_operator` | active | Wash and qualification persona. |
| `transformer@ba33.local` | Nadir Transformation | `transformer_operator` | active | D3/D4 transformation persona. |
| `sales@ba33.local` | Meriem Sales | `sales_agent` | active | Commercial persona. |
| `transport@ba33.local` | Samir Transport | `regional_manager` | active | Seeded as `regional_manager`, not a dedicated transporter user type. |
| `regional@ba33.local` | Rania Region | `regional_manager` | suspended | Present in seed data but cannot log in while suspended. |

Not shown in the internal persona picker:

| Email | Full name | User type | Status | Reason |
| --- | --- | --- | --- | --- |
| `buyer@ba33.local` | SARL EcoTex | `buyer` | active | Buyer users belong to external buyer flows, not this internal app. |

### Important note on passwords

The seed file stores `passwordHash: 'dev_hash'` for seeded users, but `web-operations` does not currently authenticate with passwords.

For this app, the real development access method is:

- open the app
- let it auto-login as `admin@ba33.local`, or
- switch persona from the sidebar

If you need to log in manually against the API, use:

```http
POST /auth/dev-login
Content-Type: application/json

{
  "email": "admin@ba33.local"
}
```

or:

```http
POST /auth/dev-login
Content-Type: application/json

{
  "userId": "<persona-uuid>"
}
```

## RBAC Model

The permission catalog lives in `apps/api/src/common/auth/rbac.ts`.

Core view permissions:

- `dashboard.view`
- `fulfillment.view`
- `validation.view`
- `traceability.view`
- `depot.view`
- `laverie.view`
- `transformation.view`
- `transport.view`
- `sales.view`
- `certification.view`
- `regions.view`
- `users.view`
- `rules.view`

Action permissions:

- `alerts.manage`
- `rules.manage`
- `rbac.manage`

Also present in the catalog:

- `analytics.view`
- `institutional.view`

Implementation note:

- `analytics.view` exists in the catalog but the current `/analytics` page is the control screen and is gated by `validation.view`
- `institutional.view` is not used by this app today

## Baseline Roles And What They Can Do

### `central_admin`

Can access all pages and all management actions:

- full page visibility
- manage A1 alerts
- manage rules
- manage RBAC

### `regional_manager`

Can supervise most operations views:

- command center
- fulfillment
- controle
- tracabilite
- depot
- laverie
- transport
- certification
- regions
- users overview
- rules overview

Cannot, by default:

- manage A1 alerts
- manage RBAC
- version rules
- access sales page
- access transformation page

### `depot_manager`

Can operate around D1 and control:

- command center
- fulfillment
- controle
- tracabilite
- depot

### `laverie_operator`

Can operate around D2:

- command center
- fulfillment
- controle
- tracabilite
- laverie
- certification

### `transformer_operator`

Can operate around D3/D4:

- command center
- fulfillment
- tracabilite
- transformation
- certification

### `sales_agent`

Can operate commercial visibility:

- command center
- tracabilite
- ventes
- certification

Current limitation:

- this role includes `analytics.view` in the backend catalog, but that permission is not currently bound to a page in `web-operations`

### `collector`

Read-only follow-up access:

- command center
- fulfillment
- tracabilite

## Overlay Roles

These can be assigned on top of a baseline user type from the `Acces & RBAC` screen.

### `control_supervisor`

Adds:

- `dashboard.view`
- `fulfillment.view`
- `validation.view`
- `traceability.view`
- `alerts.manage`

Effect:

- can operate the control screen
- can acknowledge and resolve A1 alerts

### `rules_admin`

Adds:

- `dashboard.view`
- `rules.view`
- `rules.manage`

Effect:

- can open the rules screen
- can publish new rule versions

### `rbac_admin`

Adds:

- `dashboard.view`
- `users.view`
- `rbac.manage`

Effect:

- can open the RBAC screen
- can update user status and assigned role overlays

## API Endpoints Used By This App

Auth:

- `GET /auth/personas`
- `POST /auth/dev-login`
- `GET /auth/me`

Operations:

- `GET /operations/command-center`
- `GET /operations/fulfillment`
- `GET /operations/validation`
- `GET /operations/traceability/:lookupKey`
- `PATCH /operations/a1-alerts/:alertId/status`

Other internal modules:

- `GET /depot/overview`
- `GET /laverie/overview`
- `GET /transformation/overview`
- `GET /sales/overview`
- `GET /transport/overview`
- `GET /certification/overview`
- `GET /regions/overview`
- `GET /users/overview`
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

