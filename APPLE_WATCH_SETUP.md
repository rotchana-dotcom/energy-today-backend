# Apple Watch Companion App Setup

The Energy Today app includes Apple Watch support for quick glances at your daily energy score, alignment status, and activity recommendations.

## Features

- **Watch Face Complications**: Display energy score and alignment directly on your watch face
- **Glance View**: Quick view of today's energy, alignment, and best activities
- **Auto-Sync**: Data automatically syncs from iPhone to Watch throughout the day

## Current Implementation Status

✅ **Data Layer Complete**
- Watch data sync utility (`lib/watch-sync.ts`)
- Simplified energy data format for Watch display
- Activity recommendations based on energy and alignment
- Auto-update scheduling logic

⏳ **Watch App UI (Requires Native Development)**
- Watch app target needs to be added to Xcode project
- SwiftUI views for Watch complications and app interface
- Watch Connectivity framework integration

## How It Works

### Data Flow
1. iPhone app calculates daily energy using `calculateDailyEnergy()`
2. `updateWatchData()` simplifies data for Watch display
3. Data is stored in AsyncStorage with key `@energy_today:watch_data`
4. Watch Connectivity framework sends data to paired Apple Watch
5. Watch app displays data in complications and app interface

### Watch Data Format
```typescript
{
  date: "2025-12-28",
  energyScore: 75,              // 0-100
  energyType: "Creative Flow",
  alignment: "strong",           // strong | moderate | challenging
  alignmentColor: "green",       // green | yellow | red
  bestActivity: "Creative work, presentations, negotiations",
  lastUpdated: "2025-12-28T15:30:00Z"
}
```

### Energy Score Display
- ⚡⚡⚡ = 80-100 (Peak energy)
- ⚡⚡ = 60-79 (Good energy)
- ⚡ = 40-59 (Moderate energy)
- 💤 = 0-39 (Low energy / rest)

### Alignment Indicators
- 🟢 Strong alignment (optimal timing)
- 🟡 Moderate alignment (acceptable timing)
- 🔴 Challenging alignment (avoid major decisions)

## Setup Instructions (For Native Development)

### 1. Add Watch App Target in Xcode

```bash
# After running expo prebuild
cd ios
open EnergyToday.xcworkspace

# In Xcode:
# File → New → Target → watchOS → Watch App
# Name: "Energy Today Watch"
# Bundle ID: space.manus.energy.today.watchkitapp
```

### 2. Install Watch Connectivity Package

```bash
npx expo install expo-watch-connectivity
# or
npm install react-native-watch-connectivity
```

### 3. Implement Watch Connectivity

Update `lib/watch-sync.ts` to use actual Watch Connectivity:

```typescript
import WatchConnectivity from 'expo-watch-connectivity';

async function sendToWatch(data: WatchData) {
  if (await WatchConnectivity.isReachable()) {
    await WatchConnectivity.sendMessage(data);
  }
}
```

### 4. Create Watch App UI (SwiftUI)

Create `WatchApp/ContentView.swift`:

```swift
import SwiftUI
import WatchConnectivity

struct ContentView: View {
    @State private var energyScore: Int = 0
    @State private var alignment: String = "moderate"
    @State private var bestActivity: String = "Loading..."
    
    var body: some View {
        VStack(spacing: 12) {
            // Energy Score
            Text(energyScoreEmoji)
                .font(.system(size: 50))
            
            Text("\(energyScore)")
                .font(.title)
                .fontWeight(.bold)
            
            // Alignment
            HStack {
                Circle()
                    .fill(alignmentColor)
                    .frame(width: 12, height: 12)
                Text(alignment.capitalized)
                    .font(.caption)
            }
            
            // Best Activity
            Text(bestActivity)
                .font(.caption2)
                .multilineTextAlignment(.center)
                .padding(.top, 8)
        }
        .padding()
        .onAppear {
            setupWatchConnectivity()
        }
    }
    
    var energyScoreEmoji: String {
        if energyScore >= 80 { return "⚡⚡⚡" }
        if energyScore >= 60 { return "⚡⚡" }
        if energyScore >= 40 { return "⚡" }
        return "💤"
    }
    
    var alignmentColor: Color {
        switch alignment {
        case "strong": return .green
        case "challenging": return .red
        default: return .yellow
        }
    }
    
    func setupWatchConnectivity() {
        // Receive data from iPhone
        WCSession.default.delegate = self
        WCSession.default.activate()
    }
}
```

### 5. Add Complications

Create `WatchApp/Complications.swift` for watch face complications.

## Testing

1. **Simulator Testing**: Use Xcode's Watch simulator paired with iPhone simulator
2. **Device Testing**: Pair physical Apple Watch with iPhone running the app
3. **Data Sync**: Verify data updates when opening the iPhone app
4. **Complications**: Add Energy Today complication to watch face

## Limitations

- Requires iOS 14+ and watchOS 7+
- Watch must be paired and within Bluetooth range for real-time sync
- Background updates limited by watchOS power management
- Complications update frequency controlled by watchOS (not instant)

## Future Enhancements

- [ ] Haptic feedback on Watch when energy peaks
- [ ] Quick action to log mood from Watch
- [ ] Weekly energy summary on Watch
- [ ] Siri Shortcuts integration
- [ ] StandAlone Watch app (no iPhone required)

## Support

For Watch app development questions, see:
- [Apple Watch Programming Guide](https://developer.apple.com/documentation/watchkit)
- [Expo Watch Connectivity](https://docs.expo.dev/) (if available)
- [React Native Watch Connectivity](https://github.com/mtford90/react-native-watch-connectivity)
