# Quick Add Widget Implementation Guide

The Energy Today app includes a data layer for a home screen widget that allows one-tap mood logging. The widget infrastructure is ready, but requires native code implementation for iOS and Android.

## Current Status

✅ **Completed:**
- Widget data layer (`lib/quick-add-widget.ts`)
- Sync mechanism between widget and app
- Storage for pending widget entries
- Automatic journal entry creation

⏳ **Requires Native Implementation:**
- iOS Widget Extension (WidgetKit)
- Android App Widget (AppWidgetProvider)

---

## iOS Implementation (WidgetKit)

### 1. Create Widget Extension in Xcode

1. Open the iOS project in Xcode
2. File → New → Target → Widget Extension
3. Name it "EnergyTodayWidget"
4. Enable "Include Configuration Intent" if you want customization

### 2. Enable App Groups

Both the main app and widget need to share data:

1. Select main app target → Signing & Capabilities
2. Add "App Groups" capability
3. Create group: `group.space.manus.energy.today`
4. Repeat for widget target

### 3. Widget Code (Swift)

```swift
import WidgetKit
import SwiftUI

struct QuickMoodEntry: TimelineEntry {
    let date: Date
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuickMoodEntry {
        QuickMoodEntry(date: Date())
    }
    
    func getSnapshot(in context: Context, completion: @escaping (QuickMoodEntry) -> ()) {
        completion(QuickMoodEntry(date: Date()))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<QuickMoodEntry>) -> ()) {
        let entry = QuickMoodEntry(date: Date())
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
}

struct QuickMoodWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(spacing: 8) {
            Text("Quick Mood Log")
                .font(.headline)
            
            HStack(spacing: 8) {
                MoodButton(mood: "great", emoji: "🌟")
                MoodButton(mood: "good", emoji: "😊")
                MoodButton(mood: "okay", emoji: "😐")
                MoodButton(mood: "poor", emoji: "😔")
            }
        }
        .padding()
    }
}

struct MoodButton: View {
    let mood: String
    let emoji: String
    
    var body: some View {
        Link(destination: URL(string: "energytoday://quick-add?mood=\\(mood)")!) {
            VStack {
                Text(emoji)
                    .font(.title)
                Text(mood.capitalized)
                    .font(.caption2)
            }
            .frame(maxWidth: .infinity)
            .padding(8)
            .background(Color.blue.opacity(0.1))
            .cornerRadius(8)
        }
    }
}

@main
struct QuickMoodWidget: Widget {
    let kind: String = "QuickMoodWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuickMoodWidgetView(entry: entry)
        }
        .configurationDisplayName("Quick Mood Log")
        .description("Log your mood with one tap")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### 4. Handle Deep Links in App

Add to `app.config.ts`:
```typescript
scheme: "energytoday"
```

Add deep link handler in `app/_layout.tsx`:
```typescript
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { addQuickEntry, syncWidgetEntries } from "@/lib/quick-add-widget";

// In root layout component
useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    const { path, queryParams } = Linking.parse(event.url);
    
    if (path === "quick-add" && queryParams?.mood) {
      const mood = queryParams.mood as "great" | "good" | "okay" | "poor";
      await addQuickEntry(mood);
      await syncWidgetEntries();
    }
  };
  
  Linking.addEventListener("url", handleDeepLink);
  
  return () => {
    Linking.removeAllListeners("url");
  };
}, []);
```

---

## Android Implementation (App Widget)

### 1. Create Widget Provider Class

Create `android/app/src/main/java/space/manus/energytoday/QuickMoodWidget.java`:

```java
package space.manus.energytoday;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class QuickMoodWidget extends AppWidgetProvider {
    
    private static final String ACTION_MOOD_CLICK = "space.manus.energytoday.MOOD_CLICK";
    private static final String EXTRA_MOOD = "mood";
    
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.quick_mood_widget);
            
            // Set up click handlers for each mood button
            views.setOnClickPendingIntent(R.id.mood_great, getMoodPendingIntent(context, "great"));
            views.setOnClickPendingIntent(R.id.mood_good, getMoodPendingIntent(context, "good"));
            views.setOnClickPendingIntent(R.id.mood_okay, getMoodPendingIntent(context, "okay"));
            views.setOnClickPendingIntent(R.id.mood_poor, getMoodPendingIntent(context, "poor"));
            
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
    
    private PendingIntent getMoodPendingIntent(Context context, String mood) {
        Intent intent = new Intent(context, QuickMoodWidget.class);
        intent.setAction(ACTION_MOOD_CLICK);
        intent.putExtra(EXTRA_MOOD, mood);
        return PendingIntent.getBroadcast(context, mood.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    
    @Override
    public void onReceive(Context context, Intent intent) {
        if (ACTION_MOOD_CLICK.equals(intent.getAction())) {
            String mood = intent.getStringExtra(EXTRA_MOOD);
            
            // Save to SharedPreferences
            context.getSharedPreferences("EnergyTodayWidget", Context.MODE_PRIVATE)
                .edit()
                .putString("pending_mood", mood)
                .putLong("pending_timestamp", System.currentTimeMillis())
                .apply();
            
            // Launch app
            Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(launchIntent);
            }
        }
        super.onReceive(context, intent);
    }
}
```

### 2. Create Widget Layout

Create `android/app/src/main/res/layout/quick_mood_widget.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_background">
    
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Quick Mood Log"
        android:textSize="14sp"
        android:textStyle="bold"
        android:layout_marginBottom="8dp"/>
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal">
        
        <Button
            android:id="@+id/mood_great"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="🌟\nGreat"
            android:textSize="12sp"/>
        
        <Button
            android:id="@+id/mood_good"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="😊\nGood"
            android:textSize="12sp"/>
        
        <Button
            android:id="@+id/mood_okay"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="😐\nOkay"
            android:textSize="12sp"/>
        
        <Button
            android:id="@+id/mood_poor"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="😔\nPoor"
            android:textSize="12sp"/>
    </LinearLayout>
</LinearLayout>
```

### 3. Register Widget in AndroidManifest.xml

Add inside `<application>` tag:

```xml
<receiver android:name=".QuickMoodWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
        <action android:name="space.manus.energytoday.MOOD_CLICK" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/quick_mood_widget_info" />
</receiver>
```

### 4. Create Widget Info

Create `android/app/src/main/res/xml/quick_mood_widget_info.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="0"
    android:initialLayout="@layout/quick_mood_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/widget_description"/>
```

---

## App Integration

The app already includes sync logic. Just call it on app launch:

```typescript
// In app/_layout.tsx or app/(tabs)/index.tsx
import { syncWidgetEntries } from "@/lib/quick-add-widget";

useEffect(() => {
  syncWidgetEntries();
}, []);
```

---

## Testing

1. **iOS**: Run widget in simulator, add to home screen
2. **Android**: Run app, long-press home screen → Widgets → Energy Today
3. Tap mood buttons, verify entries appear in journal

---

## Notes

- Widget data is stored separately and synced on app launch
- Entries are automatically converted to journal format
- Widget updates are handled by the OS (no manual refresh needed)
- Deep links work on both platforms for instant feedback
