#!/usr/bin/env bash
# Quick API smoke test for ba33 backend
# Usage: ./scripts/test-api.sh [base_url]

BASE_URL="${1:-http://localhost:3100}"
PASS=0
FAIL=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; }
bold()  { printf "\033[1m%s\033[0m\n" "$1"; }

check() {
  local label="$1" url="$2" expected_status="${3:-200}"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$status" = "$expected_status" ]; then
    green "$label (HTTP $status)"
    PASS=$((PASS + 1))
  else
    red "$label — expected $expected_status, got $status"
    FAIL=$((FAIL + 1))
  fi
}

# ─── Infrastructure ───────────────────────────────────────
bold "Infrastructure"

# Postgres
if docker exec ba33-postgres pg_isready -U ba33 -d ba33_platform &>/dev/null; then
  green "PostgreSQL is ready"
  PASS=$((PASS + 1))
else
  red "PostgreSQL is not ready"
  FAIL=$((FAIL + 1))
fi

# Redis
if docker exec ba33-redis redis-cli ping 2>/dev/null | grep -q PONG; then
  green "Redis is ready"
  PASS=$((PASS + 1))
else
  red "Redis is not ready"
  FAIL=$((FAIL + 1))
fi

# ─── API Server ───────────────────────────────────────────
bold ""
bold "API Server ($BASE_URL)"

# Server reachable
if curl -s --max-time 3 "$BASE_URL" &>/dev/null; then
  green "Server is reachable"
  PASS=$((PASS + 1))
else
  red "Server is not reachable — is it running?"
  FAIL=$((FAIL + 1))
fi

# Swagger
check "Swagger JSON" "$BASE_URL/api-json"
check "Swagger UI"   "$BASE_URL/api"

# ─── Route Controllers ────────────────────────────────────
bold ""
bold "Route Controllers (expecting 200 or 401)"

ROUTES=(auth users regions files events audit rules sources collection lots transport depot laverie transformation certification sales institutional sync notifications)

for route in "${ROUTES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$route" 2>/dev/null)
  case "$status" in
    200|201|401|403)
      green "/$route (HTTP $status)"
      PASS=$((PASS + 1))
      ;;
    404)
      red "/$route — 404 (no routes registered yet)"
      FAIL=$((FAIL + 1))
      ;;
    *)
      red "/$route — unexpected HTTP $status"
      FAIL=$((FAIL + 1))
      ;;
  esac
done

# ─── Summary ──────────────────────────────────────────────
bold ""
bold "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
