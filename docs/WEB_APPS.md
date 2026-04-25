# Web Apps

Three Next.js 15 (App Router) applications. All consume the same
`/api/v1/*` backend. All share `@ba33/ui-web` (shadcn/ui) and
`@ba33/design-tokens`.

| App | Audience | Auth model | Port (dev) |
|---|---|---|---|
| **web-operations** | Internal staff (depot, laverie, transformation, sales, certification, admin) | localStorage + cookie | 3000 |
| **web-buyer** | B2B buyers + public certificate verifier | cookie (`ba33_buyer_token`) | 3001 |
| **web-institutional** | Ministries (Agriculture, Commerce, Customs) | localStorage | 3002 |

---

## 1. web-operations — internal command center

**Path.** `apps/web-operations/`

### 1.1 Routes (grouped by role)

```
src/app/
├── login/page.tsx
├── (admin)/admin/...                        central_admin / regional_manager
│   ├── page.tsx                             dashboard / command center
│   ├── analytics/
│   ├── certification/
│   ├── fulfillment/
│   ├── regions/
│   ├── settings/
│   ├── traceability/
│   ├── transport/
│   └── users/
├── (depot)/depot/page.tsx                   depot_manager
├── (laverie)/laverie/page.tsx               laverie_operator
├── (sales)/sales/page.tsx                   sales_agent
└── (transformation)/transformation/page.tsx transformer_operator
```

The login page calls `loginWithDevPersona()` or `auth/login`, then routes via
`role-routing.ts`:

| userType | landing route |
|---|---|
| central_admin | `/admin` |
| regional_manager | `/admin` |
| certification_authority | `/admin` |
| depot_manager | `/depot` |
| laverie_operator | `/laverie` |
| transformer_operator | `/transformation` |
| sales_agent | `/sales` |

Other userTypes (collector, shepherd, transporter, buyer) get sent back to
`/login` because they have no web-ops scope.

### 1.2 Key pages

#### `/depot` — DepotWorkflowPage

The depot manager's command center. Top-down:

1. **Missions de collecte** (new for two-actor model)
   - Live list of `collection_jobs` (auto-refresh every 15s).
   - Each pending job has a collector dropdown + **Assigner** + **Annuler**.
   - In-flight jobs show collector + timestamps.
   - URGENT badge for urgent_lane.
2. **Actions dépôt** card — capability summary + zone list.
3. **E1 Réception & validation** form — fills lot reception (auto-binds first
   lot from intakeQueue, picks first depot/zone). Includes Stage 3 fields:
   classification, stack temp, humidity, VM%, planned exit date.
4. **S1 Audit de sortie** form — dispatch lot to laverie (or direct
   transformer). Stage 4 fields: Flux A/B split, impurity %, humidity exit %.
5. **Tables** — recent receptions, dispatch queue, A1 alerts, intake queue,
   zones, laveries.

Backed by `GET /depot/overview` + the new `GET /collection/jobs` and
`GET /collection/collectors`.

#### `/laverie` — LaverieWorkflowPage

Laverie operator's screen. Forms for:
- Reception (S2 entry) with conditioning state + required wash temp/detergent.
- Washing run (water L, cycle min, water temp, detergent, suint).
- Qualification (R1 yield + grade + safety + S2/S3 dispatch + Stage 7 purity
  cert fields: residual humidity, residual suint, whiteness, pH, energy
  kWh/water L per kg).

Tables: active runs, recent qualifications, reception queue, wash queue,
qualification queue, transformers.

#### `/transformation` — TransformationWorkflowPage

Transformation operator's screen. Forms:
- Start production run with BOM + Stage 6 (engrais direct) or Stage 8
  (isolants/géotextiles) inputs.
- Complete run (output, waste, quantity, optional product code).

Tables: active runs, recent products, dispatch queue, BOMs.

#### `/sales` — SalesWorkflowPage

Sales agent screen. Order list + per-order actions (`confirm`, `mark_paid`,
`ship`, `deliver`). Documents browser.

#### `/admin/*` — central admin

- `/admin` — command center with KPIs, alerts, recent events,
  transport watch, terrain nodes (live map data).
- `/admin/users` — RBAC overview, role management, user status.
- `/admin/regions` — wilaya / commune browser.
- `/admin/settings` — rules engine editor (a1 thresholds, S2/S3 routing,
  pricing matrix).
- `/admin/certification` — issuance + revocation flow.
- `/admin/traceability` — lot/product lookup by QR or code → full chain.
- `/admin/transport` — global transport job board.
- `/admin/fulfillment` — per-phase queue overview.
- `/admin/analytics` — production stats.

### 1.3 Auth

- **Storage.** Token in both `localStorage` (`ba33.web-operations.access-token`)
  and cookie `ba33-token` (for SSR-side reads).
- **Session.** `useSession()` hook in `src/components/session-provider.tsx`.
- **Permissions.** `hasPermission(perm)` derives from the session's
  `permissions[]`. Pages gate rendering with `RequiredPermissions`.

### 1.4 Key files

- `src/lib/api.ts` — backend client (140+ helpers, one per endpoint).
- `src/lib/role-routing.ts` — userType → landing route.
- `src/lib/format.ts` — formatWeight, formatDateTime, formatPercent, toNumber, formatEnumLabel.
- `src/components/operations-page-shell.tsx` — common page wrapper (header,
  metrics, refresh, error state).
- `src/components/data-table-card.tsx` + `info-list-card.tsx` + `metric-card.tsx`
  + `status-badge.tsx` — primitives reused everywhere.
- `src/components/collection-jobs-panel.tsx` — **new for two-actor model**.
- `src/components/{depot,laverie,sales,transformation,certification}-workflow-page.tsx` — per-phase pages.

### 1.5 Run

```bash
make                    # boots api + web-operations in docker
# or:
cd apps/web-operations && pnpm dev
```

---

## 2. web-buyer — B2B portal + public verify

**Path.** `apps/web-buyer/`

### 2.1 Routes

```
src/app/
├── (auth)/                                  no auth required
│   ├── login/page.tsx
│   └── signup/page.tsx                      multi-step (account → company → verify)
├── verify/page.tsx                          PUBLIC — certificate verification
└── (buyer)/                                 auth required (cookie ba33_buyer_token)
    ├── catalog/page.tsx                     P1/P2 product browse with filters
    ├── catalog/[productId]/page.tsx         product detail with traceability chain
    ├── cart/page.tsx                        Zustand-backed cart
    ├── checkout/page.tsx                    3-step (address → payment → summary)
    ├── orders/page.tsx                      order list + status
    ├── orders/[orderId]/page.tsx            order detail + document download
    ├── complaints/page.tsx                  list with stats
    ├── complaints/new/page.tsx              create complaint
    ├── documents/page.tsx                   filterable doc browser
    └── account/
        ├── page.tsx                         profile
        ├── addresses/page.tsx               shipping addresses
        └── settings/page.tsx                password + notifications
```

### 2.2 The public verify page

`/verify` (moved out of buyer layout, removed from middleware
PROTECTED_ROUTES). Anyone — no signup, no login — can paste a code or scan
a QR and see one of:

- ✅ **Certificat Valide** — green card with traceability summary
  (collection date, washing yield %, audits passed: E1/S2/S3/NFN), download
  text certificate.
- ❌ **Certificat Révoqué** — red card.
- ❓ **Aucun certificat trouvé** — gray.

Backed by `GET /api/v1/certification/verify/:code` (no auth on the API side
either).

### 2.3 Auth

- **Storage.** Cookie `ba33_buyer_token` (HTTP-safe, encrypted).
- **Server-side.** `requireServerAuthToken()` in protected pages (SSR).
- **Middleware.** `src/middleware.ts` redirects unauthenticated users on
  protected routes (catalog, cart, checkout, orders, documents, complaints,
  account) to `/login`. **`/verify` is intentionally excluded.**

### 2.4 Backend endpoints consumed

`src/lib/api/buyer-api.ts` calls:

- Auth: `POST /auth/login`, `POST /auth/register`, `GET /auth/me`,
  `PATCH /auth/profile`, `PATCH /auth/password`.
- Catalog: `GET /products`, `GET /products/:id`,
  `GET /products/:id/traceability-summary`.
- Orders: `GET /orders`, `POST /orders`, `GET /orders/:id`,
  `POST /orders/:id/confirm`, `PATCH /orders/:id/items`,
  `DELETE /orders/:id/items/:itemId`.
- Documents: `GET /documents`, `GET /orders/:id/documents/:docId/download`.
- Complaints: `GET /complaints`, `POST /complaints`, `GET /complaints/:id`.
- Addresses: `GET /buyer/addresses`, `POST/PATCH/DELETE` variants.
- Verify: `GET /certification/verify/:code` (public),
  `GET /certification/verify/qr/:qrHash` (public).
- Notifications: `GET /notifications`, `PATCH /notifications/read-all`,
  `DELETE /notifications/:id`.

### 2.5 Sidebar (buyer layout)

- **Achats:** Catalogue · Mon Panier (badge w/ count) · Mes Commandes
- **Documents:** Documents · Vérifier un certificat · Réclamations
- **Compte:** Mon Profil · Adresses · Paramètres

### 2.6 Components

`src/components/buyer/` is feature-grouped: `layout/`, `catalog/`, `product/`,
`cart/`, `checkout/`, `orders/`, `complaints/`, `documents/`, `account/`,
`verify/`, `shared/`.

Cart uses Zustand for client state.

### 2.7 Run

```bash
cd apps/web-buyer && pnpm dev   # default port 3001 (collides with API in default
                                 # config — start API on 3001 in docker, web-buyer
                                 # on 3010 with PORT=3010)
```

---

## 3. web-institutional — ministry portal

**Path.** `apps/web-institutional/`

### 3.1 Routes

```
src/app/
├── login/page.tsx                           phone + password
└── dashboard/
    ├── page.tsx                             KPI dashboard
    ├── lots/page.tsx                        full lot inventory + QR + status
    ├── sources/page.tsx                     source registry (scaffolded)
    ├── conformite/page.tsx                  compliance, QR lookup, KPIs
    └── rapports/page.tsx                    reports hub
```

### 3.2 Key features

- **Dashboard** — KPI cards (total lots, weight, active sources, pre-lots
  pending), recent activity table.
- **Lots** — fetch all lots, table with status / source / weight / urgency /
  notes, manual refresh.
- **Sources** — scaffolded, lists shepherds/slaughterhouses/aggregators.
- **Conformité** — search lot by QR, verify traceability, compliance rate KPIs,
  quarantined / rejected counts.
- **Rapports** — production report, CSV/XML exports, regulatory filings,
  recent activity.

Backed by `GET /institutional/dashboard`, `GET /institutional/activity`,
`GET /lots`, `GET /lots/qr/:code`, `GET /sources`.

### 3.3 Auth

- **Storage.** `localStorage` keys `ba33_token` + `ba33_refresh`.
- **Session.** Client-side; no SSR token validation.
- **401/403 handling.** Auto-redirect to `/login`.

In production, this would use SSO (SAML/OIDC with the institutional identity
provider) and mTLS for any API calls — both stubbed in v1 for the demo.

### 3.4 Sidebar

- Tableau de bord (📊)
- Lots (📦)
- Sources (🏛️)
- Rapports (📄)
- Conformité (🛡️)
- Logout (bottom)

### 3.5 Run

```bash
cd apps/web-institutional && pnpm dev   # PORT=3002 by default
```

---

## 4. Shared design system (ui-web)

`packages/ui-web/` is shadcn/ui based. Exports include:

- **Layout primitives:** `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`.
- **Forms:** `Button` (variants primary/secondary/destructive/ghost/outline),
  `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Label`.
- **Feedback:** `Badge` (default/secondary/destructive/outline/success/warning/info),
  `Dialog`, `AlertDialog`, `Toast`.
- **Tables:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
- **Sidebar:** `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, etc.
- **Misc:** `Avatar`, `Separator`, `Tabs`, `Accordion`, `cn` (className helper).

All built on Radix primitives. All use Tailwind CSS variables defined in
`@ba33/design-tokens` (OKLCH color space).

**Rule.** No raw color values in apps. Always use Tailwind utility classes
that map to design tokens (`bg-primary`, `text-muted-foreground`, etc.).

---

## 5. design-tokens

`packages/design-tokens/` exports `tokens.json` (OKLCH color values) and
generates Tailwind preset + Flutter `Ba33Theme` from it.

Token categories:

| category | examples |
|---|---|
| color | `primary`, `secondary`, `surface`, `success`, `warning`, `danger`, `info`, `neutral` |
| spacing | `xs` … `3xl` |
| typography | `display`, `heading`, `body`, `caption`, `mono` + sizes |
| radii | `sm`, `md`, `lg` (default 12px), `xl`, `full` |
| shadows | `sm`, `md`, `lg`, `xl` |
| motion | durations + easings |

Names are identical on web and mobile. Designer says "primary.500" → both
platforms render the same color.
