#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://localhost:3000}"
REQUIRED_ENV=("APP_URL" "DATABASE_URL" "DIRECT_URL" "DOCUMENT_PAGE_TOKEN_SECRET" "CLIADM_ADMIN_TOKEN")

pass() { printf "PASS %s\n" "$1"; }
fail() { printf "FAIL %s\n" "$1" >&2; exit 1; }

status_code() {
  curl -sS -o /tmp/cyberlabin-smoke-body -w "%{http_code}" "$@"
}

echo "Cyber Lab IN smoke test: ${APP_URL}"

for key in "${REQUIRED_ENV[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "WARN missing env: ${key}"
  else
    pass "env ${key} present"
  fi
done

code="$(status_code "${APP_URL}/api/health")"
[[ "$code" == "200" ]] || fail "health endpoint returned ${code}"
pass "health endpoint"

code="$(status_code "${APP_URL}/")"
[[ "$code" == "200" ]] || fail "homepage returned ${code}"
grep -qi "Cyber Lab IN" /tmp/cyberlabin-smoke-body || fail "homepage missing Cyber Lab IN text"
pass "public homepage"

code="$(status_code "${APP_URL}/api/courses")"
[[ "$code" == "200" ]] || fail "course API returned ${code}"
pass "course API"

code="$(status_code -X POST "${APP_URL}/api/leads" -H "content-type: application/json" -d '{"email":"bad"}')"
[[ "$code" == "400" ]] || fail "lead validation expected 400, got ${code}"
pass "lead API validation"

code="$(status_code -X POST "${APP_URL}/api/ai/sessions" -H "content-type: application/json" -d '{"courseId":"00000000-0000-0000-0000-000000000001"}')"
[[ "$code" == "401" ]] || fail "protected AI route expected 401 without auth, got ${code}"
pass "protected route denies missing auth"

rm -f /tmp/cyberlabin-smoke-body
echo "Smoke test complete."

