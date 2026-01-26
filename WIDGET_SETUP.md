# Widget Setup Guide

Energy Today supports home screen widgets that display your daily energy summary at a glance.

## Overview

The widget shows:
- Your personal energy type and intensity
- Today's environmental energy
- Connection alignment (color-coded)
- Lunar phase
- Quick summary

## Implementation Status

✅ **Widget Data Layer** - Complete
- Widget data generation (`lib/widget-config.ts`)
- Auto-refresh mechanism
- Concise summary generation

⚠️ **Native Widget Extensions** - Requires Additional Setup

Home screen widgets require native code for iOS and Android. The data layer is ready, but full widget support needs:

### For iOS:
1. Create a Widget Extension in Xcode
2. Use WidgetKit framework
3. Fetch data from `getWidgetData()` function
4. Design widget UI using SwiftUI

### For Android:
1. Create an App Widget Provider
2. Define widget layout XML
3. Fetch data from `getWidgetData()` function
4. Configure update intervals

## Alternative: Quick Actions

As an immediate alternative, users can:
1. **Add to Home Screen** (iOS/Android) - Creates an app shortcut
2. **Use Notifications** - Daily morning summary already implemented
3. **Quick Launch** - App opens directly to Today page

## Future Enhancement

To fully implement native widgets, consider:
- Using Expo's custom development client
- Creating native widget extensions
- Or using a third-party widget library like `react-native-widget-extension`

## Current Functionality

The widget data layer is fully functional and can be accessed via:

\`\`\`typescript
import { getWidgetData } from "@/lib/widget-config";

const widgetData = await getWidgetData();
// Returns today's energy summary optimized for widget display
\`\`\`

This data can be used for:
- Push notifications (✅ implemented)
- In-app quick view
- Future widget implementations
