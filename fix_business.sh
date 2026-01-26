#!/bin/bash

# Screens accessed from Business tab → navigate to /(tabs)/business
BUSINESS_TAB_SCREENS=(
  "app/business.tsx"
  "app/business_old.tsx"
  "app/coaching.tsx"
  "app/coaching_old.tsx"
  "app/goals.tsx"
  "app/habits.tsx"
  "app/team-sync.tsx"
  "app/trends.tsx"
  "app/weekly-plan.tsx"
)

for file in "${BUSINESS_TAB_SCREENS[@]}"; do
  if [ -f "$file" ]; then
    sed -i "s/router\.back()/router.push('\/(tabs)\/business')/g" "$file"
    echo "Fixed: $file"
  fi
done

echo "Phase 2 complete: Business tab screens fixed"
