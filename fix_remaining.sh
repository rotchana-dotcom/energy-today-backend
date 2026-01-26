#!/bin/bash

# AI Insights Dashboard → navigate to /(tabs)/insights
sed -i "s/router\.back()/router.push('\/(tabs)\/insights')/g" app/ai-insights-dashboard.tsx
echo "Fixed: app/ai-insights-dashboard.tsx → /(tabs)/insights"

# Analytics Dashboard → navigate to /(tabs)/more
sed -i "s/router\.back()/router.push('\/(tabs)\/more')/g" app/analytics-dashboard.tsx
echo "Fixed: app/analytics-dashboard.tsx → /(tabs)/more"

# Numerology, Guide, Forecast (old) → navigate to /(tabs)/ (home)
for file in app/numerology.tsx app/guide.tsx app/forecast_old.tsx app/select-template.tsx app/insights_old.tsx; do
  if [ -f "$file" ]; then
    sed -i "s/router\.back()/router.push('\/(tabs)\/')/g" "$file"
    echo "Fixed: $file → /(tabs)/"
  fi
done

# Template Journal → save and go back to /(tabs)/
sed -i "s/router\.back()/router.push('\/(tabs)\/')/g" app/template-journal.tsx
echo "Fixed: app/template-journal.tsx → /(tabs)/"

echo "Phase 3 complete: Remaining screens fixed"
