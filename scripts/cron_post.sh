#!/usr/bin/env bash
# Wrapper pentru postarea automata ClarStiri pe Instagram (rulat din cron)
# Flux: genereaza continut proaspat -> posteaza via Playwright
set -uo pipefail

PROJECT_DIR="/home/brewuser/projects/ClarStiri"
LOCK_FILE="/tmp/clarstiri_post.lock"
LOG_DIR="$PROJECT_DIR/social_export/logs"

mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/post_$(date +%F_%H%M).log"

(
flock -n 200 || { echo "[cron] Alta instanta ruleaza deja, skip."; exit 0; }

cd "$PROJECT_DIR"

if [ -f .env ]; then
  set -a; source .env; set +a
else
  echo "[cron] ATENTIE: .env lipsesc — nu am credentiale Instagram."
fi

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

echo "=== Postare $(date '+%F %T') ==="
if npm run generate:social && node scripts/auto_post_playwright.mjs; then
  echo "=== SUCCESS $(date '+%F %T') ==="
else
  echo "=== FAILED $(date '+%F %T') ==="
fi

# pastram doar ultimele 100 de loguri
ls -1t "$LOG_DIR"/post_*.log 2>/dev/null | tail -n +101 | xargs -r rm -f

) 200>"$LOCK_FILE" >>"$LOG" 2>&1
