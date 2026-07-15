#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3001}"
WEB_URL="${WEB_URL:-http://localhost:5173}"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

check_status() {
  local label="$1"
  local url="$2"
  local expected="${3:-200}"
  local status
  status="$(curl --silent --show-error --output "$TEMP_DIR/body" --write-out '%{http_code}' "$url")"
  if [[ "$status" != "$expected" ]]; then
    printf '%s failed: expected HTTP %s, received %s\n' "$label" "$expected" "$status" >&2
    cat "$TEMP_DIR/body" >&2
    exit 1
  fi
  printf 'PASS  %s\n' "$label"
}

check_status "API health" "$API_URL/api/health"
check_status "Homepage" "$WEB_URL/"
check_status "Public courses" "$API_URL/api/courses/public"
check_status "Published blogs" "$API_URL/api/blogs"
check_status "Auth configuration" "$API_URL/api/auth/config"

validation_status="$(curl --silent --show-error --output "$TEMP_DIR/lead" --write-out '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$API_URL/api/leads")"
if [[ "$validation_status" != "400" ]]; then
  printf 'Lead validation failed: expected HTTP 400, received %s\n' "$validation_status" >&2
  cat "$TEMP_DIR/lead" >&2
  exit 1
fi
printf 'PASS  Lead validation\n'

protected_status="$(curl --silent --show-error --output "$TEMP_DIR/protected" --write-out '%{http_code}' "$API_URL/api/dashboards/student")"
if [[ "$protected_status" != "401" ]]; then
  printf 'Protected-route check failed: expected HTTP 401, received %s\n' "$protected_status" >&2
  cat "$TEMP_DIR/protected" >&2
  exit 1
fi
printf 'PASS  Protected dashboard\n'

if [[ -n "${SMOKE_EMAIL:-}" && -n "${SMOKE_PASSWORD:-}" ]]; then
  csrf_json="$(curl --silent --show-error --cookie-jar "$TEMP_DIR/cookies" "$API_URL/api/auth/csrf")"
  csrf_token="$(printf '%s' "$csrf_json" | sed -n 's/.*"csrfToken":"\([^"]*\)".*/\1/p')"
  login_status="$(curl --silent --show-error --cookie "$TEMP_DIR/cookies" --cookie-jar "$TEMP_DIR/cookies" --output "$TEMP_DIR/login" --write-out '%{http_code}' -X POST -H 'Content-Type: application/json' -H "X-CSRF-Token: $csrf_token" -d "{\"email\":\"$SMOKE_EMAIL\",\"password\":\"$SMOKE_PASSWORD\"}" "$API_URL/api/auth/login")"
  if [[ "$login_status" != "200" ]]; then
    printf 'Authenticated smoke login failed with HTTP %s\n' "$login_status" >&2
    exit 1
  fi
  me_status="$(curl --silent --show-error --cookie "$TEMP_DIR/cookies" --output "$TEMP_DIR/me" --write-out '%{http_code}' "$API_URL/api/auth/me")"
  if [[ "$me_status" != "200" ]]; then
    printf 'Authenticated session endpoint failed with HTTP %s\n' "$me_status" >&2
    exit 1
  fi
  printf 'PASS  Authenticated session endpoint\n'
fi

printf '\nCyber Lab IN smoke checks passed.\n'
