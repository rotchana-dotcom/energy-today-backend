#!/bin/bash

# Screens accessed from More tab → navigate to /(tabs)/more
MORE_TAB_SCREENS=(
  "app/adaptive-reminders.tsx"
  "app/ai-insights.tsx"
  "app/appearance-settings.tsx"
  "app/badges.tsx"
  "app/biometric-sync.tsx"
  "app/calendar-integration.tsx"
  "app/calendar-sync.tsx"
  "app/customize-layout.tsx"
  "app/data-export.tsx"
  "app/energy-circles.tsx"
  "app/energy-forecast.tsx"
  "app/energy-timeline.tsx"
  "app/focus-mode.tsx"
  "app/habit-builder.tsx"
  "app/history.tsx"
  "app/interactions-calendar.tsx"
  "app/location-insights.tsx"
  "app/manage-subscription.tsx"
  "app/meditation-timer.tsx"
  "app/notification-settings.tsx"
  "app/nutrition-insights.tsx"
  "app/nutrition-tracker.tsx"
  "app/recurring.tsx"
  "app/referral.tsx"
  "app/report-history.tsx"
  "app/settings.tsx"
  "app/share-success.tsx"
  "app/sleep-insights.tsx"
  "app/sleep-tracker.tsx"
  "app/smart-notifications-settings.tsx"
  "app/social-comparison.tsx"
  "app/social-energy.tsx"
  "app/streak-recovery.tsx"
  "app/task-scheduler.tsx"
  "app/team-members.tsx"
  "app/upgrade.tsx"
  "app/voice-journal-enhanced.tsx"
  "app/weather-insights.tsx"
)

for file in "${MORE_TAB_SCREENS[@]}"; do
  if [ -f "$file" ]; then
    sed -i "s/router\.back()/router.push('\/(tabs)\/more')/g" "$file"
    echo "Fixed: $file"
  fi
done

echo "Phase 1 complete: More tab screens fixed"
