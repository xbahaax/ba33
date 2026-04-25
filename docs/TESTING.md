# Testing

> The proof the system works end-to-end is `scripts/test-pipeline.sh` —
> 55 assertions across 12 phases, exit code 0 = all green.

---

## 1. The pipeline smoke test

```bash
bash scripts/test-pipeline.sh
```

What it does — walks the full chain with **real HTTP calls**:

| Phase | What it asserts |
|---|---|
| 0 — Auth | 4 personas log in (shepherd, collector, depot, admin) |
| 1 — Source declaration | `POST /collection/pre-lots/declare` with all 12 fields persists |
| 2 — Auto-issue | Collection job appears in `GET /collection/jobs?status=pending`, enriched with source profession + depot + preLot |
| 3 — Collector lifecycle | accept → start → gps push → arrive → complete (creates lot), pre-lot transitions to `collected` |
| 4 — Lot lookup | `GET /lots/:id` and `GET /lots/qr/:code` both return the new lot |
| 5 — Transport jobs | Auto-created transport job exists in `GET /transport/jobs` |
| 6 — Depot reception | `POST /depot/receptions` with E1 fields succeeds |
| 6b — Depot dispatch | `POST /depot/dispatches` to laverie succeeds |
| 6c — Laverie chain | reception → washing run → qualification (with targetTransformerId) all succeed |
| 6d — Transformation | Production run starts → completes → product created |
| 6e — Certification | NFN seal issued (or already auto-issued — test accepts both) |
| 6f — Public verify | `GET /certification/verify/:code` returns valid/revoked/not_found |
| 7 — Web ops endpoints | command-center, fulfillment, traceability respond |
| 8 — Institutional | dashboard responds |
| 9 — Cross-app shared | `/sources`, `/sources/shepherds`, `/lots` all return the new entities |
| 10 — Mobile-side | `/collection/jobs/me`, `/sync/devices` work |
| 10b — Web-ops new | `/collection/collectors`, `/collection/jobs/:id/assign` mounted |
| 10c — Public verify | NFN-P1-00042-X7 → valid, NFN-P2-00148-M2 → revoked, BOGUS → not_found |
| 11 — Web overview endpoints | All 9 `/{module}/overview` respond |
| 12 — Event log | Pre-lot, job, lot all have the expected lifecycle events recorded in DB |

Output:

```
Results: 55 pass · 0 fail · 0 skip (of 55)
```

**Re-run anytime.** The script is idempotent — it creates a new pre-lot
on each run, so the chain is fresh data every time. (Old data accumulates
in the DB; run `make reset` for a clean slate.)

---

## 2. Quick health check

```bash
# API is up?
curl -s http://localhost:3001/api/v1/auth/personas | head -c 200

# DB is up?
docker exec ba33-postgres pg_isready -U ba33 -d ba33_platform

# Redis is up?
docker exec ba33-redis redis-cli ping  # → PONG

# Web-operations is up?
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
```

---

## 3. Personas for testing

All passwords `password123` (web-buyer hackathon buyer is `Buyer@2026!`):

| Phone | Role | Use for |
|---|---|---|
| `0555000001` | central_admin | full access, run anything |
| `0555000002` | collector | mobile-collector test |
| `0555000003` | depot_manager | web-ops `/depot` (collection jobs panel) |
| `0555000004` | laverie_operator | web-ops `/laverie` |
| `0555000005` | transformer_operator | web-ops `/transformation` |
| `0555000006` | sales_agent | web-ops `/sales` |
| `0555000010` | shepherd | mobile-shepherd test |

Plus `buyer@ba33.dz` / `Buyer@2026!` for web-buyer + public verify.

---

## 4. Manual test recipes

### Test the full collection chain (curl)

```bash
# 1. Login as shepherd
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0555000010","password":"password123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

# 2. Get user info
ME=$(curl -s "http://localhost:3001/api/v1/auth/me" -H "Authorization: Bearer $TOKEN")
USER_ID=$(echo "$ME" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
REGION_ID=$(echo "$ME" | sed -n 's/.*"regionId":"\([^"]*\)".*/\1/p')

# 3. Declare wool
PRELOT=$(curl -s -X POST http://localhost:3001/api/v1/collection/pre-lots/declare \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\":\"$USER_ID\",
    \"estimatedWeightKg\":\"42.5\",
    \"latitude\":\"36.75\", \"longitude\":\"3.06\",
    \"surnom\":\"Demo\", \"mazraa\":\"Mazraa Demo\",
    \"profession\":\"shepherd\",
    \"regionId\":\"$REGION_ID\",
    \"shearingDate\":\"2026-04-25\",
    \"sheepBreed\":\"Ouled Djellal\",
    \"bagCount\":4, \"bagType\":\"jute\",
    \"lastParasiteTreatmentDate\":\"2026-03-15\"
  }")
echo "Pre-lot: $PRELOT"

# 4. As admin, list pending jobs
ADMIN_TOK=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0555000001","password":"password123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

curl -s "http://localhost:3001/api/v1/collection/jobs?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOK" | head -c 800
```

### Verify a certificate (no auth)

```bash
# Valid
curl -s http://localhost:3001/api/v1/certification/verify/NFN-P1-00042-X7

# Revoked
curl -s http://localhost:3001/api/v1/certification/verify/NFN-P2-00148-M2

# Not found
curl -s http://localhost:3001/api/v1/certification/verify/BOGUS-CODE
```

### Inspect events for a lot

```bash
LOT_ID="<lot-uuid>"
docker exec ba33-postgres psql -U ba33 -d ba33_platform -c \
  "SELECT event_type, actor_type, recorded_at
   FROM events
   WHERE aggregate_id = '$LOT_ID'
   ORDER BY recorded_at;"
```

---

## 5. Backend unit / e2e tests

The backend uses Vitest + Supertest:

```bash
pnpm --filter @ba33/api test
# or per-module:
pnpm --filter @ba33/api test -- collection
```

Test files live in `apps/api/src/modules/{name}/__tests__/`. Coverage is
limited in v1 — the pipeline smoke test is the primary validator.

---

## 6. Mobile tests

Each Flutter app has the standard `flutter_test`. To run:

```bash
cd apps/mobile-shepherd && flutter test
cd apps/mobile-collector && flutter test
```

Currently minimal — focus is on widget tests for the form + view models.

---

## 7. Linting + typecheck

```bash
make lint            # all packages
make typecheck       # all packages

# or focused:
pnpm --filter @ba33/api typecheck
pnpm --filter @ba33/web-operations typecheck
docker exec ba33-api sh -lc "pnpm --filter @ba33/api exec tsc --noEmit -p tsconfig.json"
```

---

## 8. Known test gaps

| Area | Coverage | Note |
|---|---|---|
| Auth flows | smoke only | Refresh + suspended-user paths not covered |
| RBAC | partial | Smoke confirms `depot_manager` can hit `/collection/jobs` + `/collection/collectors`. Edge cases (suspended users, revoked roles) untested. |
| Reconciliation | none | Logic exists, no test asserts the flagging path |
| Certification gates | none | Cert is auto-issued in smoke. Force-fail gates path untested. |
| Sales | none | Order lifecycle untested in smoke |
| Mobile UI | none | `flutter test` files are stubs |
| Web UI | none | No Cypress / Playwright |

For a hackathon MVP this is acceptable. Production would need at least:
- Full auth flow tests (refresh, expired tokens, RBAC denials)
- Reconciliation flagging tests
- A E2E sales order test
- Mobile widget tests for the declaration form + arrival form
- One Playwright test for web-buyer verify page

---

## 9. CI

There's no CI configured in v1. The intent (per `.claude/rules.md`):

```bash
pnpm turbo lint typecheck test
```

…before every PR. Add a GitHub Action that:
1. Boots Postgres + Redis
2. Runs migrations
3. `pnpm turbo lint typecheck test`
4. Runs `bash scripts/test-pipeline.sh`
5. Reports pass/fail to PR.
