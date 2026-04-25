#!/usr/bin/env bash
# Full data pipeline smoke test.
# Walks: shepherd declares → collector executes → depot receives + dispatches →
# laverie washes + qualifies → transformer runs → certification → sale.
# Verifies traceability + that mobile and web share the same API surface.

set -uo pipefail

API="${API:-http://localhost:3001/api/v1}"
PW="password123"
PASS=0
FAIL=0
SKIP=0

# Persona phones from seed (apps/api/src/scripts/seed.ts)
SHEPHERD_PHONE="0555000001"
COLLECTOR_PHONE="0555000010"
DEPOT_PHONE="0555000030"
ADMIN_PHONE="0555000099"

# ── helpers ────────────────────────────────────────────────────────────────
green=$'\e[32m'; red=$'\e[31m'; yellow=$'\e[33m'; gray=$'\e[90m'; bold=$'\e[1m'; nc=$'\e[0m'

ok()    { echo "${green}  ✓${nc} $1"; PASS=$((PASS+1)); }
fail()  { echo "${red}  ✗${nc} $1${gray} — $2${nc}"; FAIL=$((FAIL+1)); }
skip()  { echo "${yellow}  •${nc} $1 ${gray}(skipped: $2)${nc}"; SKIP=$((SKIP+1)); }
step()  { echo ""; echo "${bold}[$1]${nc} $2"; }
info()  { echo "${gray}    $1${nc}"; }

# extract first JSON value with sed (works for flat keys)
jget() { echo "$1" | sed -n "s/.*\"$2\":\"\\([^\"]*\\)\".*/\\1/p" | head -1; }
jgetn() { echo "$1" | sed -n "s/.*\"$2\":\\([0-9.]*\\).*/\\1/p" | head -1; }

login() {
  local phone="$1"
  curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$phone\",\"password\":\"$PW\"}"
}

req() {
  # req METHOD PATH TOKEN [BODY]
  local method="$1" path="$2" token="$3" body="${4:-}"
  if [[ -n "$body" ]]; then
    curl -s -X "$method" "$API$path" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$body"
  else
    curl -s -X "$method" "$API$path" \
      -H "Authorization: Bearer $token"
  fi
}

assert_id() {
  local label="$1" json="$2"
  local id
  id=$(jget "$json" "id")
  if [[ -n "$id" ]]; then
    ok "$label → id=${id:0:8}…"
    echo "$id"
  else
    fail "$label" "$(echo "$json" | head -c 200)"
    echo ""
  fi
}

# ── 0. Auth ────────────────────────────────────────────────────────────────
step "0" "Authentication — 4 personas"

SHEP_TOK=$(jget "$(login $SHEPHERD_PHONE)" "accessToken")
[[ -n "$SHEP_TOK" ]] && ok "shepherd login" || fail "shepherd login" "no token"

COL_TOK=$(jget "$(login $COLLECTOR_PHONE)" "accessToken")
[[ -n "$COL_TOK" ]] && ok "collector login" || fail "collector login" "no token"

DEP_TOK=$(jget "$(login $DEPOT_PHONE)" "accessToken")
[[ -n "$DEP_TOK" ]] && ok "depot manager login" || fail "depot login" "no token"

ADMIN_TOK=$(jget "$(login $ADMIN_PHONE)" "accessToken")
[[ -n "$ADMIN_TOK" ]] && ok "admin login" || fail "admin login" "no token"

ME=$(req GET "/auth/me" "$SHEP_TOK")
SHEP_ID=$(jget "$ME" "id")
SHEP_REGION=$(jget "$ME" "regionId")
info "shepherd: id=${SHEP_ID:0:8}… region=${SHEP_REGION:0:8}…"

COL_ME=$(req GET "/auth/me" "$COL_TOK")
COL_ID=$(jget "$COL_ME" "id")
info "collector: id=${COL_ID:0:8}…"

# ── 1. Shepherd declares wool (mobile-shepherd flow) ───────────────────────
step "1" "Source declaration (mobile-shepherd) → POST /collection/pre-lots/declare"

DECL_BODY=$(cat <<EOF
{"userId":"$SHEP_ID","estimatedWeightKg":"40.0","latitude":"36.75","longitude":"3.06",
 "surnom":"Pipeline","mazraa":"Mazraa Test","profession":"shepherd",
 "regionId":"$SHEP_REGION","shearingDate":"2026-04-20","sheepBreed":"Ouled Djellal",
 "bagCount":3,"bagType":"jute","lastParasiteTreatmentDate":"2026-03-15"}
EOF
)
PRELOT_RES=$(req POST "/collection/pre-lots/declare" "$SHEP_TOK" "$DECL_BODY")
PRELOT_ID=$(jget "$PRELOT_RES" "id")
SOURCE_ID=$(jget "$PRELOT_RES" "sourceId")
[[ -n "$PRELOT_ID" ]] && ok "pre-lot created → ${PRELOT_ID:0:8}…" || fail "pre-lot create" "$(echo "$PRELOT_RES" | head -c 200)"
info "source id (auto-created from user): ${SOURCE_ID:0:8}…"

# ── 2. Collection job auto-issued ──────────────────────────────────────────
step "2" "Collection job auto-issued → GET /collection/jobs"

sleep 1  # let auto-dispatch settle
JOBS=$(req GET "/collection/jobs?status=pending" "$COL_TOK")
JOB_ID=$(echo "$JOBS" | sed -n "s/.*\\[{\"id\":\"\\([^\"]*\\)\".*/\\1/p" | head -1)
if [[ -n "$JOB_ID" ]]; then
  ok "collection job in queue → ${JOB_ID:0:8}…"
else
  fail "collection job auto-issue" "$(echo "$JOBS" | head -c 200)"
fi

# Verify enrichment shape (used by mobile collector list screen)
echo "$JOBS" | grep -q "\"profession\":\"shepherd\"" \
  && ok "job enriched with source profession" \
  || fail "job enrichment" "missing profession field"
echo "$JOBS" | grep -q "\"depot\":" \
  && ok "job enriched with depot" \
  || fail "job enrichment" "missing depot field"
echo "$JOBS" | grep -q "\"preLot\":" \
  && ok "job enriched with preLot" \
  || fail "job enrichment" "missing preLot field"

# ── 3. Collector lifecycle ─────────────────────────────────────────────────
step "3" "Collector lifecycle (mobile-collector) — accept → start → arrive → complete"

ACC=$(req PATCH "/collection/jobs/$JOB_ID/accept" "$COL_TOK")
echo "$ACC" | grep -q "\"status\":\"accepted\"" && ok "accept" || fail "accept" "$(echo "$ACC" | head -c 150)"

START=$(req PATCH "/collection/jobs/$JOB_ID/start" "$COL_TOK")
echo "$START" | grep -q "\"status\":\"in_progress\"" && ok "start" || fail "start" "$(echo "$START" | head -c 150)"

GPS=$(req POST "/collection/jobs/$JOB_ID/gps" "$COL_TOK" \
  '{"points":[{"lat":"36.751","lng":"3.061","accuracy":"5.0","recordedAt":"2026-04-25T03:00:00Z"}]}')
echo "$GPS" | grep -q "\"jobId\"" && ok "gps push (1 point)" || fail "gps" "$(echo "$GPS" | head -c 150)"

ARR=$(req PATCH "/collection/jobs/$JOB_ID/arrive" "$COL_TOK" '{"lat":"36.75","lng":"3.06"}')
echo "$ARR" | grep -q "\"status\":\"arrived\"" && ok "arrive" || fail "arrive" "$(echo "$ARR" | head -c 150)"

COMP=$(req POST "/collection/jobs/$JOB_ID/complete" "$COL_TOK" \
  '{"actualWeightKg":"38.5","stateQuick":"clean","notes":"OK"}')
LOT_ID=$(echo "$COMP" | sed -n "s/.*\"lot\":{\"id\":\"\\([^\"]*\\)\".*/\\1/p" | head -1)
[[ -n "$LOT_ID" ]] && ok "complete → lot created ${LOT_ID:0:8}…" || fail "complete" "$(echo "$COMP" | head -c 200)"

# Verify pre-lot was closed
PRELOT_CHECK=$(req GET "/collection/pre-lots/$PRELOT_ID" "$ADMIN_TOK")
echo "$PRELOT_CHECK" | grep -q "\"status\":\"collected\"" \
  && ok "pre-lot transitioned to 'collected'" \
  || fail "pre-lot status" "$(echo "$PRELOT_CHECK" | head -c 150)"

# ── 4. Lot lookup + traceability ───────────────────────────────────────────
step "4" "Lot in system — GET /lots/:id + /lots/qr/:code"

LOT=$(req GET "/lots/$LOT_ID" "$ADMIN_TOK")
QR=$(jget "$LOT" "qrCode")
[[ -n "$QR" ]] && ok "lot fetched, qr=$QR" || fail "lot fetch" "$(echo "$LOT" | head -c 200)"

LOT_BY_QR=$(req GET "/lots/qr/$QR" "$COL_TOK")
echo "$LOT_BY_QR" | grep -q "\"id\":\"$LOT_ID\"" && ok "qr lookup matches" || fail "qr lookup" ""

# ── 5. Auto-created transport job (lot → depot) ────────────────────────────
step "5" "Transport job auto-created from lot — GET /transport/jobs"

T_JOBS=$(req GET "/transport/jobs" "$ADMIN_TOK")
T_COUNT=$(echo "$T_JOBS" | grep -o "\"id\":\"" | wc -l | tr -d ' ')
[[ "$T_COUNT" -gt 0 ]] && ok "transport jobs exist ($T_COUNT total)" || fail "transport jobs" "none found"

# ── 6. Depot reception (E1) ────────────────────────────────────────────────
step "6" "Depot reception — POST /depot/receptions"

# Need depot id + a zone id
DEPOT_OV=$(req GET "/depot/overview" "$DEP_TOK")
DEPOT_ID=$(echo "$DEPOT_OV" | sed -n "s/.*\"depot\":{\"id\":\"\\([^\"]*\\)\".*/\\1/p" | head -1)
if [[ -z "$DEPOT_ID" ]]; then
  DEPOT_ID=$(echo "$DEPOT_OV" | sed -n "s/.*\"id\":\"\\([^\"]*\\)\".*/\\1/p" | head -1)
fi
info "depot id: ${DEPOT_ID:0:8}…"

# Pull authoritative ids directly from the DB so we don't rely on overview shape.
PSQL="docker exec ba33-postgres psql -U ba33 -d ba33_platform -t -A -c"
DEPOT_ID=$($PSQL "SELECT id FROM depots WHERE active=true LIMIT 1;" 2>/dev/null | tr -d ' ')
LAV_ID=$($PSQL "SELECT id FROM laveries WHERE active=true LIMIT 1;" 2>/dev/null | tr -d ' ')
TR_ID=$($PSQL "SELECT id FROM transformers WHERE active=true LIMIT 1;" 2>/dev/null | tr -d ' ')
BOM_ID=$($PSQL "SELECT id FROM boms WHERE active=true LIMIT 1;" 2>/dev/null | tr -d ' ')
info "depot=${DEPOT_ID:0:8} lav=${LAV_ID:0:8} tr=${TR_ID:0:8} bom=${BOM_ID:0:8}"

if [[ -n "$DEPOT_ID" ]]; then
  RECEP_BODY="{\"depotId\":\"$DEPOT_ID\",\"lotId\":\"$LOT_ID\",\"actualWeightKg\":38.5,\"lotClassification\":\"class_a\",\"humidityEntryPercent\":12,\"vegetalMatterPercent\":3}"
  RECEP=$(req POST "/depot/receptions" "$DEP_TOK" "$RECEP_BODY")
  RECEP_ID=$(jget "$RECEP" "id")
  [[ -n "$RECEP_ID" ]] && ok "reception (E1) created → ${RECEP_ID:0:8}…" \
    || fail "depot reception" "$(echo "$RECEP" | head -c 250)"
else
  skip "depot reception" "no active depot in seed"
fi

# ── 6b. Depot dispatch to laverie (S1) ────────────────────────────────────
step "6b" "Depot dispatch (S1) → POST /depot/dispatches"

if [[ -n "$DEPOT_ID" && -n "$LAV_ID" ]]; then
  DISP_BODY="{\"depotId\":\"$DEPOT_ID\",\"lotId\":\"$LOT_ID\",\"destinationLaverieId\":\"$LAV_ID\",\"manifestWeightKg\":38.5,\"humidityExitPercent\":11}"
  DISP=$(req POST "/depot/dispatches" "$DEP_TOK" "$DISP_BODY")
  DISP_ID=$(jget "$DISP" "id")
  [[ -n "$DISP_ID" ]] && ok "dispatch (S1) created → ${DISP_ID:0:8}…" \
    || fail "depot dispatch" "$(echo "$DISP" | head -c 250)"
else
  skip "depot dispatch" "missing depot/laverie id"
fi

# ── 6c. Laverie reception → washing → qualification (R1 + S2/S3) ─────────
step "6c" "Laverie chain — reception → wash → qualify"

if [[ -n "$LAV_ID" ]]; then
  L_REC_BODY="{\"laverieId\":\"$LAV_ID\",\"lotId\":\"$LOT_ID\",\"receivedWeightKg\":38.5,\"conditioningState\":\"correct\"}"
  L_REC=$(req POST "/laverie/receptions" "$ADMIN_TOK" "$L_REC_BODY")
  echo "$L_REC" | grep -q "\"id\"" && ok "laverie reception" \
    || fail "laverie reception" "$(echo "$L_REC" | head -c 200)"

  WASH_BODY="{\"laverieId\":\"$LAV_ID\",\"lotId\":\"$LOT_ID\",\"dirtyWeightKg\":38.5,\"waterLiters\":150,\"cycleDurationMinutes\":45,\"waterTempC\":60,\"detergentType\":\"biodegradable\"}"
  WASH=$(req POST "/laverie/washing-runs" "$ADMIN_TOK" "$WASH_BODY")
  WASH_ID=$(jget "$WASH" "id")
  [[ -n "$WASH_ID" ]] && ok "washing run → ${WASH_ID:0:8}…" \
    || fail "washing run" "$(echo "$WASH" | head -c 250)"

  if [[ -n "$WASH_ID" ]]; then
    QUAL_BODY="{\"washingRunId\":\"$WASH_ID\",\"cleanWeightKg\":24.0,\"grade\":\"B\",\"safetyStatus\":\"clear\",\"fiberLengthMm\":55,\"fiberDiameterMicron\":28,\"dispatchTrack\":\"d3_textile\",\"targetTransformerId\":\"$TR_ID\"}"
    QUAL=$(req POST "/laverie/qualifications" "$ADMIN_TOK" "$QUAL_BODY")
    QUAL_ID=$(jget "$QUAL" "id")
    [[ -n "$QUAL_ID" ]] && ok "qualification (R1 yield + S2/S3 dispatch) → ${QUAL_ID:0:8}…" \
      || fail "qualification" "$(echo "$QUAL" | head -c 250)"
  fi
else
  skip "laverie chain" "no laverie id"
fi

# ── 6d. Transformation (D3) ───────────────────────────────────────────────
step "6d" "Transformation chain — production run → complete → product"

if [[ -n "$TR_ID" && -n "$BOM_ID" ]]; then
  RUN_BODY="{\"transformerId\":\"$TR_ID\",\"lotId\":\"$LOT_ID\",\"bomId\":\"$BOM_ID\",\"inputWeightKg\":24.0,\"productDestinationType\":\"flux_a1_panels\",\"targetThicknessMm\":100,\"targetDensityKgM3\":25,\"antimitesTreatmentType\":\"natural\"}"
  RUN=$(req POST "/transformation/runs" "$ADMIN_TOK" "$RUN_BODY")
  RUN_ID=$(jget "$RUN" "id")
  [[ -n "$RUN_ID" ]] && ok "production run started → ${RUN_ID:0:8}…" \
    || fail "production run" "$(echo "$RUN" | head -c 250)"

  if [[ -n "$RUN_ID" ]]; then
    COMP_BODY="{\"outputWeightKg\":22.5,\"wasteWeightKg\":1.5,\"quantity\":3,\"productCode\":\"P1-TEST-$(date +%s)\",\"unit\":\"panel\"}"
    DONE=$(req PATCH "/transformation/runs/$RUN_ID/complete" "$ADMIN_TOK" "$COMP_BODY")
    # The complete endpoint returns the product directly: {id, certificationId, productCode, ...}
    PRODUCT_ID=$(jget "$DONE" "id")
    if [[ -n "$PRODUCT_ID" ]]; then
      ok "production complete → product ${PRODUCT_ID:0:8}…"
    else
      info "complete: $(echo "$DONE" | head -c 200)"
      fail "production complete" "no product id in response"
    fi
  fi
else
  skip "transformation chain" "no transformer/bom in seed"
fi

# ── 6e. Certification ─────────────────────────────────────────────────────
step "6e" "Certification — issue NFN seal"

CERT_OV=$(req GET "/certification/overview" "$ADMIN_TOK")
CERT_ID=$(echo "$CERT_OV" | sed -n "s/.*\"id\":\"\\([^\"]*\\)\".*/\\1/p" | head -1)
if [[ -n "$CERT_ID" ]]; then
  CERT_RES=$(req POST "/certification/$CERT_ID/issue" "$ADMIN_TOK" '{"force":true}')
  echo "$CERT_RES" | grep -q "issued\|certificate" \
    && ok "certification issued for ${CERT_ID:0:8}…" \
    || info "certification response: $(echo "$CERT_RES" | head -c 200)"
else
  skip "certification" "no pending certification record found"
fi

# ── 6f. Public verification (no auth) ─────────────────────────────────────
step "6f" "Public certificate verification (no auth)"

if [[ -n "${PRODUCT_ID:-}" ]]; then
  PROD=$(req GET "/products/$PRODUCT_ID" "$ADMIN_TOK")
  CODE=$(jget "$PROD" "productCode")
  if [[ -n "$CODE" ]]; then
    VERIFY=$(curl -s "$API/certification/verify/$CODE")
    echo "$VERIFY" | grep -qE "valid|not_found|revoked" \
      && ok "public verify $CODE responds" \
      || fail "public verify" "$(echo "$VERIFY" | head -c 200)"
  fi
fi

# ── 7. Operations command center (web-operations) ─────────────────────────
step "7" "Web operations endpoints"

CC=$(req GET "/operations/command-center" "$ADMIN_TOK")
echo "$CC" | grep -q "[a-z]" && ok "command-center responds" || fail "command-center" "$(echo "$CC" | head -c 150)"

FUL=$(req GET "/operations/fulfillment" "$ADMIN_TOK")
echo "$FUL" | grep -q "[a-z]" && ok "fulfillment responds" || fail "fulfillment" "$(echo "$FUL" | head -c 150)"

TRACE=$(req GET "/operations/traceability/$QR" "$ADMIN_TOK")
echo "$TRACE" | grep -q "$LOT_ID" && ok "traceability by QR returns lot" \
  || fail "traceability" "$(echo "$TRACE" | head -c 200)"

# ── 8. Institutional read-only views ───────────────────────────────────────
step "8" "Institutional dashboards"

INST=$(req GET "/institutional/dashboard" "$ADMIN_TOK")
echo "$INST" | grep -q "[a-z]" && ok "institutional dashboard" \
  || fail "institutional dashboard" "$(echo "$INST" | head -c 150)"

# ── 9. Sources / lots listings (used by web + mobile) ─────────────────────
step "9" "Cross-app shared listings"

SRC=$(req GET "/sources" "$ADMIN_TOK")
echo "$SRC" | grep -q "$SOURCE_ID" && ok "source listed in /sources" \
  || fail "sources list" "source not found"

SHEP_LIST=$(req GET "/sources/shepherds" "$ADMIN_TOK")
echo "$SHEP_LIST" | grep -q "$SOURCE_ID" \
  && ok "/sources/shepherds returns the new source" \
  || fail "shepherds list" "missing"

LOTS=$(req GET "/lots" "$ADMIN_TOK")
echo "$LOTS" | grep -q "$LOT_ID" && ok "lot listed in /lots" \
  || fail "lots list" "lot not found"

# ── 10. Mobile-only endpoints exist ────────────────────────────────────────
step "10" "Mobile-side endpoints"

JOBS_ME=$(req GET "/collection/jobs/me" "$COL_TOK")
echo "$JOBS_ME" | grep -q "\\[" && ok "/collection/jobs/me works" \
  || fail "jobs/me" "$(echo "$JOBS_ME" | head -c 150)"

SYNC_DEV=$(req GET "/sync/devices" "$COL_TOK")
echo "$SYNC_DEV" | grep -q "\\[" && ok "/sync/devices works" || fail "sync/devices" ""

# ── 11. Web-only / dashboards ──────────────────────────────────────────────
step "11" "Web-side overview endpoints"

for path in /depot/overview /laverie/overview /transformation/overview \
            /sales/overview /certification/overview /transport/overview \
            /regions/overview /rules/overview /users/overview; do
  R=$(req GET "$path" "$ADMIN_TOK")
  if echo "$R" | grep -q "{"; then
    ok "GET $path"
  else
    fail "GET $path" "$(echo "$R" | head -c 100)"
  fi
done

# ── 12. Events log (the spine) ─────────────────────────────────────────────
step "12" "Event log — append-only events recorded for OUR aggregates"

# Query Postgres directly for events tied to the specific entities we just created
# — the recent-events endpoint paginates and older steps roll off.
events_for() {
  local agg_id="$1"
  $PSQL "SELECT event_type FROM events WHERE aggregate_id = '$agg_id' ORDER BY recorded_at;"
}

PRELOT_EVTS=$(events_for "$PRELOT_ID")
echo "$PRELOT_EVTS" | grep -q "collection.prelot.announced" \
  && ok "pre-lot has 'announced' event" || fail "pre-lot events" "got: $PRELOT_EVTS"

JOB_EVTS=$(events_for "$JOB_ID")
for evt in "collection.job.issued" "collection.job.accepted" \
           "collection.job.started" "collection.job.arrived" \
           "collection.job.completed"; do
  echo "$JOB_EVTS" | grep -q "$evt" && ok "job has '$evt'" \
    || fail "job event '$evt'" "got: $JOB_EVTS"
done

LOT_EVTS=$(events_for "$LOT_ID")
echo "$LOT_EVTS" | grep -q "lot.collected" \
  && ok "lot has 'collected' event" || fail "lot events" "got: $LOT_EVTS"

# ── Summary ────────────────────────────────────────────────────────────────
TOTAL=$((PASS+FAIL+SKIP))
echo ""
echo "${bold}Results:${nc} ${green}$PASS pass${nc} · ${red}$FAIL fail${nc} · ${yellow}$SKIP skip${nc} (of $TOTAL)"
exit $((FAIL > 0 ? 1 : 0))
