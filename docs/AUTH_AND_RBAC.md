# Authentication & RBAC

> JWT-based, baseline-permissions-by-userType, additive custom roles. 11
> seeded personas. 39 permissions. One auth backend serving 5 client apps.

---

## 1. Authentication

### 1.1 Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/auth/login` | `{ email? \| phone?, password }` | `{ accessToken, tokenType, expiresInSeconds, user }` |
| `POST` | `/auth/register` | `{ email, password, fullName, companyName?, registrationNumber? }` | session created |
| `POST` | `/auth/refresh` | `{ refreshToken }` | new pair |
| `POST` | `/auth/logout` | bearer | `{ loggedOut: true }` |
| `GET` | `/auth/me` | bearer | `{ user, permissions[], assignedRoles[], hasWebOperationsAccess }` |
| `POST` | `/auth/dev-login` | `{ email? \| userId? }` | dev-only quick switch |
| `GET` | `/auth/personas` | none | dev-only persona list |
| `PATCH` | `/auth/password` | bearer + `{ currentPassword, nextPassword }` | OK |
| `PATCH` | `/auth/profile` | bearer + profile fields | updated user |

Login accepts **either** email or phone. Both forms are tried by `auth.service.ts`.

### 1.2 JWT structure

```json
{
  "sub": "uuid",
  "email": "user@ba33.local",
  "type": "central_admin",
  "fullName": "Yacine Admin",
  "regionId": "uuid",
  "permissions": ["dashboard.view", "depot.view", "..."],
  "iat": 1714000000,
  "exp": 1714086400
}
```

- **TTL.** 24 hours.
- **Algorithm.** HS256 with `JWT_SECRET` from env.
- **Refresh.** Refresh tokens are tracked in `sessions` table with bcrypt-hashed
  `refresh_token_hash`. Rotation: each refresh issues new pair, revokes old.

---

## 2. The 11 seeded personas

All passwords: **`password123`** (web-buyer hackathon buyer is **`Buyer@2026!`**).

| Phone | Email | Full Name | userType | Notes |
|---|---|---|---|---|
| `0555000001` | admin@ba33.local | Yacine Admin | `central_admin` | All 39 permissions |
| `0555000002` | collector@ba33.local | Amina Collecte | `collector` | Mobile collector login |
| `0555000003` | depot@ba33.local | Karim Depot | `depot_manager` | Web ops `/depot` |
| `0555000004` | laverie@ba33.local | Sofia Laverie | `laverie_operator` | Web ops `/laverie` |
| `0555000005` | transformer@ba33.local | Nadir Transformation | `transformer_operator` | Web ops `/transformation` |
| `0555000006` | sales@ba33.local | Meriem Sales | `sales_agent` | Web ops `/sales` |
| `0555000007` | transport@ba33.local | Samir Transport | `transporter` | (mobile-transporter app deleted; persona stays for transport jobs) |
| `0555000008` | buyer@ba33.local | SARL EcoTex | `buyer` | Demo buyer |
| `0555000009` | regional@ba33.local | Rania Région | `regional_manager` | All 39 perms; status `suspended` for testing |
| `0555000010` | shepherd@ba33.local | Omar Berger | `shepherd` | Mobile shepherd login |
| — | buyer@ba33.dz | Noura Benkhelifa (Noura Fibres) | `buyer` | Production-style buyer (password `Buyer@2026!`) |

---

## 3. The 39 permissions

Defined in `apps/api/src/modules/auth/baseline-permissions.ts`. Grouped:

### Operations
- `dashboard.view` — see the command center
- `fulfillment.view` — see the fulfillment overview
- `validation.view` — see the validation overview (alerts, mismatches)
- `traceability.view` — look up lots/products by QR
- `regions.view` — region browser
- `analytics.view` — production stats

### Depot
- `depot.view` — read depot data
- `depot.receive` — POST receptions (E1)
- `depot.dispatch` — POST dispatches (S1)
- `alerts.manage` — acknowledge/resolve A1 alerts

### Laverie & Transformation
- `laverie.view`, `laverie.operate`
- `transformation.view`, `transformation.operate`

### Transport & Sales
- `transport.view`, `transport.manage`
- `sales.view`, `sales.manage`

### Certification & Admin
- `certification.view`, `certification.manage`
- `users.view` — read user roster
- `rules.view`, `rules.manage`
- `rbac.manage` — assign roles, change user status

### Portals & Mobile
- `institutional.view` — ministry portal
- `collection.operate` — mobile collector / shepherd actions
- `transport.operate` — mobile transporter (legacy)

---

## 4. Baseline permissions per userType

The default mapping (in `baseline-permissions.ts`):

| userType | baseline permissions |
|---|---|
| `central_admin` | **all 39** |
| `regional_manager` | **all 39** (region-scoped via UI/data filters, not perms) |
| `certification_authority` | dashboard.view, traceability.view, certification.view, certification.manage |
| `depot_manager` | dashboard.view, fulfillment.view, validation.view, traceability.view, depot.view, depot.receive, depot.dispatch, alerts.manage |
| `laverie_operator` | dashboard.view, fulfillment.view, validation.view, traceability.view, laverie.view, laverie.operate, certification.view |
| `transformer_operator` | dashboard.view, fulfillment.view, traceability.view, transformation.view, transformation.operate, certification.view |
| `sales_agent` | dashboard.view, traceability.view, sales.view, sales.manage, certification.view, analytics.view |
| `transporter` | dashboard.view, traceability.view, transport.view, transport.operate, collection.operate |
| `collector` | dashboard.view, fulfillment.view, traceability.view, collection.operate |
| `shepherd` | collection.operate, traceability.view |
| `buyer` | traceability.view, sales.view, certification.view |
| `institutional` | institutional.view, traceability.view |
| `system` | (none — internal use) |

---

## 5. Roles + custom assignments

There's a separate `roles` table with `permissions: string[]`. Users can be
assigned multiple roles via `user_roles` (composite PK). The effective
permission set on login is:

```
effective_permissions = baseline_for(userType) ∪ (∪ assigned_roles.permissions)
```

`hasWebOperationsAccess` = `effective_permissions.length > 0` AND userType
has a web-ops route (admin, depot_manager, laverie_operator, etc.).

To assign roles to a user: `PATCH /users/:userId/access` with `{ roleIds: [...] }`.
Requires `rbac.manage`.

---

## 6. Guards & decorators

### Server-side guards

```ts
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('depot.view')
@Get('overview')
async getOverview() { ... }
```

- `JwtAuthGuard` — verifies the bearer token, attaches `req.user`.
- `PermissionsGuard` — checks `@RequirePermissions(...)` against
  `req.user.permissions`. Throws `ForbiddenException("Missing required permissions: depot.view")`.
- `RolesGuard` (legacy) — checks `@Roles('central_admin', ...)` against
  `req.user.userType`. Used by collection module for finer control.

### Decorators

| Decorator | Purpose |
|---|---|
| `@CurrentUser()` | inject `req.user` |
| `@CurrentUser('id')` | inject specific field |
| `@RequirePermissions('a', 'b')` | require all listed perms |
| `@Roles('central_admin', 'depot_manager')` | require any listed userType |

---

## 7. Frontend permission checks

### web-operations

```tsx
const { hasPermission, session } = useSession();

const canReceive = hasPermission('depot.receive');
const canDispatch = hasPermission('depot.dispatch');

<Button disabled={!canReceive}>Submit reception</Button>
```

`useSession()` reads from React context populated by
`SessionProvider` on mount via `GET /auth/me`.

### Role routing

`src/lib/role-routing.ts` maps userType → landing route. Login redirects you
to the right page based on userType, and redirects unsupported userTypes
back to `/login` with an error.

### web-buyer

Uses `requireServerAuthToken()` in protected pages (SSR). Middleware
redirects unauthenticated visitors to `/login` for the protected route list:

```ts
const PROTECTED_ROUTES = [
  "/catalog", "/cart", "/checkout", "/orders",
  "/documents", "/complaints", "/account",
];
```

**Notably:** `/verify` is **not** in this list — public certificate
verification is a public good.

### web-institutional

No SSR guard. Client-side: 401/403 from any API call → redirect to `/login`.

### Mobile

Both Flutter apps watch `isAuthenticatedProvider`. The router redirect
function decides splash → onboarding → login → home flows. See
`apps/mobile-shepherd/lib/navigation/router.dart` and the equivalent in
`mobile-collector`.

---

## 8. Quick recipes

### Login as admin from curl

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0555000001","password":"password123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

curl -s "http://localhost:3001/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Switch personas in dev

`web-operations`'s login page has a **persona picker** (calls
`POST /auth/dev-login` with the chosen email). Useful for demoing role-based
views without remembering passwords.

### Create a new operator with custom role

1. As admin: `POST /users` (or use seed).
2. `POST /roles` with the permission set you want.
3. `PATCH /users/:userId/access { roleIds: ["..."] }`.
4. The user logs in and sees the merged permissions.

---

## 9. Threat model notes

What's covered in v1:

- ✅ Bcrypt password hashing
- ✅ JWT signing with secret
- ✅ Refresh token rotation
- ✅ Rate-limiting on login *(planned, not enforced in v1)*
- ✅ Audit log of all admin actions (via `events` + audit interceptor)
- ✅ Soft suspend (`status='suspended'`) blocks login

What's stubbed:

- ⛔ 2FA — TOTP setup not implemented
- ⛔ mTLS for institutional — JWT used instead
- ⛔ SSO (SAML/OIDC) — JWT used instead
- ⛔ IP allowlisting — not enforced
- ⛔ Session device limit — not enforced
