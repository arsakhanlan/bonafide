#!/usr/bin/env bash
# End-to-end checks against a running Bonafide service (BUILD_SPEC §17).
# Usage: scripts/e2e.sh BASE_URL FIREBASE_WEB_API_KEY
set -u

BASE_URL=${1:?usage: e2e.sh BASE_URL FIREBASE_WEB_API_KEY}
KEY=${2:?usage: e2e.sh BASE_URL FIREBASE_WEB_API_KEY}
P=bonafide-cup-2026
PASS=0
FAIL=0

check() { # check NAME CONDITION
  if [ "$2" = "0" ]; then PASS=$((PASS+1)); echo "PASS $1"; else FAIL=$((FAIL+1)); echo "FAIL $1"; fi
}

echo "== 1. Anonymous signup =="
TOKEN=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$KEY" \
  -H 'Content-Type: application/json' -d '{"returnSecureToken":true}' | jq -r '.idToken')
check "signup returns an id token" "$([ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; echo $?)"

echo "== 2. No token -> 401 =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/cases" -H 'Content-Type: application/json' -d '{"language":"en"}')
check "no token gets 401" "$([ "$CODE" = "401" ]; echo $?)"

echo "== 3. RAVI demo case -> LETTER_READY =="
CASE_ID=$(curl -s -X POST "$BASE_URL/api/demo/cases" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"persona":"RAVI"}' | jq -r '.caseId')
check "demo case created" "$([ -n "$CASE_ID" ] && [ "$CASE_ID" != "null" ]; echo $?)"

STAGE=""
for i in $(seq 1 90); do
  STAGE=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.fields.stage.stringValue // empty')
  [ "$STAGE" = "LETTER_READY" ] && break
  [ "$STAGE" = "FAILED" ] || [ "$STAGE" = "REFERRED" ] || [ "$STAGE" = "NEEDS_LAWYER" ] || [ "$STAGE" = "NEEDS_ANSWERS" ] && break
  sleep 4
done
check "RAVI reaches LETTER_READY (got $STAGE)" "$([ "$STAGE" = "LETTER_READY" ]; echo $?)"

echo "== 4. Money =="
MONEY=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -c '.fields.money.mapValue.fields')
check "money 180000/2000/178000" \
  "$(echo "$MONEY" | jq -e '.frozen.doubleValue == 180000 and .disputed.doubleValue == 2000 and .release.doubleValue == 178000' >/dev/null; echo $?)"

echo "== 5. Letter =="
LETTER=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID/letters" \
  -H "Authorization: Bearer $TOKEN" | jq -c '.documents[0] // {}')
LETTER_ID=$(echo "$LETTER" | jq -r '.name | split("/") | last // empty')
check "an L1 letter exists" "$([ -n "$LETTER_ID" ]; echo $?)"
check "letter passed its checks" \
  "$(echo "$LETTER" | jq -e '.fields.checks.mapValue.fields.passed.booleanValue == true' >/dev/null; echo $?)"
check "letter has >= 1 citation" \
  "$(echo "$LETTER" | jq -e '(.fields.citations.arrayValue.values | length) >= 1' >/dev/null; echo $?)"

echo "== 6. Approve (placeholders filled) =="
BODY=$(echo "$LETTER" | jq -r '.fields.body.stringValue' | sed -E 's/\{\{[^}]*\}\}/Ravi Sharma/g')
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/cases/$CASE_ID/letters/$LETTER_ID/approve" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$(jq -n --arg b "$BODY" '{body: $b}')")
check "approve returns 200" "$([ "$CODE" = "200" ]; echo $?)"

echo "== 7. Sent -> deadline =="
SENT_ON=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.fields.demo.mapValue.fields.today.stringValue // empty')
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/cases/$CASE_ID/letters/$LETTER_ID/sent" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "$(jq -n --arg d "$SENT_ON" '{sentOn: $d, how: "BRANCH"}')")
check "sent returns 200" "$([ "$CODE" = "200" ]; echo $?)"
EXPECTED_DUE=$(date -j -v+7d -f '%Y-%m-%d' "$SENT_ON" '+%Y-%m-%d' 2>/dev/null || date -d "$SENT_ON + 7 days" '+%Y-%m-%d')
DEADLINE=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID/deadlines/BANK_FILE_GRIEVANCE" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.fields.dueOn.stringValue // empty')
check "BANK_FILE_GRIEVANCE due sentOn+7 = $EXPECTED_DUE (got $DEADLINE)" "$([ "$DEADLINE" = "$EXPECTED_DUE" ]; echo $?)"

echo "== 8. Skip 8 days -> reminder letter =="
SKIP=$(curl -s -X POST "$BASE_URL/api/demo/cases/$CASE_ID/skip" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"days":8}')
check "skip answers 202" "$(echo "$SKIP" | jq -e '.today' >/dev/null; echo $?)"
for i in $(seq 1 60); do
  BUSY=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.fields.busy.booleanValue')
  [ "$BUSY" = "false" ] && break
  sleep 4
done
REMINDERS=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID/letters" \
  -H "Authorization: Bearer $TOKEN" | jq -r '[.documents[]? | .fields.reminder.booleanValue] | any')
check "a reminder letter appeared" "$([ "$REMINDERS" = "true" ]; echo $?)"

echo "== 9. Reply -> L2 =="
for i in $(seq 1 60); do
  BUSY=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.fields.busy.booleanValue')
  [ "$BUSY" = "false" ] && break
  sleep 4
done
EVENT=$(curl -s -X POST "$BASE_URL/api/cases/$CASE_ID/events" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"type":"REPLY","text":"Bank filed my grievance on 2026-10-21"}')
check "reply accepted 202" "$(echo "$EVENT" | jq -e '.eventId' >/dev/null; echo $?)"
for i in $(seq 1 90); do
  BUSY=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.fields.busy.booleanValue')
  [ "$BUSY" = "false" ] && break
  sleep 4
done
KINDS=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID/letters" \
  -H "Authorization: Bearer $TOKEN" | jq -r '[.documents[].fields.kind.stringValue] | join(",")')
check "an L2_OFFICER letter appears (kinds: $KINDS)" "$(echo "$KINDS" | grep -q L2_OFFICER; echo $?)"

echo "== 10. SUNIL -> REFERRED, 0 letters =="
SUNIL=$(curl -s -X POST "$BASE_URL/api/demo/cases" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"persona":"SUNIL"}' | jq -r '.caseId')
SUNIL_STAGE=""
for i in $(seq 1 40); do
  SUNIL_STAGE=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$SUNIL" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.fields.stage.stringValue // empty')
  [ -n "$SUNIL_STAGE" ] && [ "$SUNIL_STAGE" != "NEW" ] && break
  sleep 3
done
check "SUNIL reaches REFERRED (got $SUNIL_STAGE)" "$([ "$SUNIL_STAGE" = "REFERRED" ]; echo $?)"
SUNIL_LETTERS=$(curl -s "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$SUNIL/letters" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.documents | length // 0')
check "SUNIL has 0 letters (got $SUNIL_LETTERS)" "$([ "$SUNIL_LETTERS" = "0" ]; echo $?)"

echo "== 11. A second user cannot touch RAVI =="
TOKEN2=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$KEY" \
  -H 'Content-Type: application/json' -d '{"returnSecureToken":true}' | jq -r '.idToken')
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/cases/$CASE_ID/letters/$LETTER_ID/approve" \
  -X POST -H "Authorization: Bearer $TOKEN2" -H 'Content-Type: application/json' -d '{}')
if [ -z "$LETTER_ID" ]; then CODE=404; fi
check "other user gets 404 from the API" "$([ "$CODE" = "404" ]; echo $?)"
FIRE_CODE=$(curl -s -o /dev/null -w '%{http_code}' \
  "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
  -H "Authorization: Bearer $TOKEN2")
check "other user gets 403 from Firestore" "$([ "$FIRE_CODE" = "403" ]; echo $?)"

echo "== 12. Delete -> 204, then 404 =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/cases/$CASE_ID" -H "Authorization: Bearer $TOKEN")
check "delete answers 204" "$([ "$CODE" = "204" ]; echo $?)"
CODE=200
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "https://firestore.googleapis.com/v1/projects/$P/databases/(default)/documents/cases/$CASE_ID" \
    -H "Authorization: Bearer $TOKEN")
  [ "$CODE" = "404" ] || [ "$CODE" = "403" ] && break
  sleep 2
done
# Firestore rules return 403 for documents that do not exist (resource is null in the rule).
check "case is gone from Firestore" "$([ "$CODE" = "404" ] || [ "$CODE" = "403" ]; echo $?)"

echo
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = "0" ]
