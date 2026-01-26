# Energy Today - Mobile App Design Document

## Design Philosophy

**"The Energetic Executive"** - A sophisticated, data-driven tool that feels at home in a professional's toolkit. The app presents as a high-end productivity and wellness application, with spiritual depth hidden beneath a clean, business-appropriate interface.

### Core Principles

1. **Professional First**: Clean, modern design suitable for business environments
2. **Practical Language**: Use everyday English - "energy," "flow," "timing," "synergy" instead of mystical jargon
3. **Data-Driven Presentation**: Present insights as actionable intelligence, not fortune-telling
4. **Privacy-Focused**: Personal data stored locally on device
5. **Natural Upgrade Path**: Free tier provides value; paid tier offers depth without being pushy

---

## Screen Architecture

### 1. Onboarding Flow (First Launch Only)

**Purpose**: Collect minimal data needed for energy calculations

**Screens**:
- **Welcome Screen**: Brief introduction to the app's value proposition
  - Headline: "Understand Your Energy, Optimize Your Timing"
  - Subtext: "Make better decisions by understanding the energy of each day"
  - CTA: "Get Started"

- **Data Collection Screen**: Single form with three fields
  - Full Name (text input)
  - Date of Birth (date picker)
  - Place of Birth (location search/input)
  - Privacy note: "Your data stays on your device"
  - CTA: "Calculate My Energy"

- **Processing Screen**: Brief loading state while initial calculations run
  - Simple animation or progress indicator
  - Text: "Analyzing your unique energy profile..."

### 2. Today Page (Main Screen - Default View)

**Purpose**: Answer "What's the energy of today, and how does it affect me?"

**Layout** (Portrait 9:16):

```
┌─────────────────────────────┐
│  [Logo]    Energy Today  [⚙]│  ← Header
├─────────────────────────────┤
│                             │
│   TODAY'S DATE              │  ← Date display
│   December 27, 2025         │
│   Waxing Crescent Moon 🌒   │  ← Lunar phase
│                             │
├─────────────────────────────┤
│                             │
│  YOUR ENERGY                │  ← Section 1
│  ┌─────────────────────┐   │
│  │  Creative Flow      │   │  ← Energy type/name
│  │  [Visual gauge]     │   │  ← Simple visual
│  └─────────────────────┘   │
│                             │
├─────────────────────────────┤
│                             │
│  TODAY'S ENERGY             │  ← Section 2
│  ┌─────────────────────┐   │
│  │  High Momentum      │   │
│  │  [Visual gauge]     │   │
│  └─────────────────────┘   │
│                             │
├─────────────────────────────┤
│                             │
│  THE CONNECTION             │  ← Section 3
│  ┌─────────────────────┐   │
│  │ ⚡ Strong Alignment  │   │  ← Synergy indicator
│  │                     │   │
│  │ A day of High       │   │  ← Practical summary
│  │ Momentum aligns     │   │
│  │ with your Creative  │   │
│  │ Flow. Excellent     │   │
│  │ time to brainstorm  │   │
│  │ and initiate new    │   │
│  │ projects.           │   │
│  │                     │   │
│  │ [View Details] 🔒   │   │  ← Upgrade prompt (subtle)
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
│  [Today] [Calendar] [Log]  │  ← Bottom Tab Bar
└─────────────────────────────┘
```

**Key Elements**:
- **Date Display**: Current date with lunar phase indicator
- **Your Energy**: Personal energy state (calculated from birth data + current transits)
- **Today's Energy**: Environmental energy (calculated from date, lunar cycle, etc.)
- **The Connection**: Synthesis of the two with practical advice
- **Subtle Upgrade Hint**: "View Details" button with lock icon (not pushy)

### 3. Calendar/Timing Page

**Purpose**: Strategic planning tool - "When is the best time for X?"

**Layout**:

```
┌─────────────────────────────┐
│  Calendar                [?]│  ← Header with help icon
├─────────────────────────────┤
│                             │
│  What are you planning?     │  ← Query input
│  ┌─────────────────────┐   │
│  │ [Search/Select]     │   │  ← Predefined activities
│  └─────────────────────┘   │
│                             │
│  Common Activities:         │
│  • Launch new product       │
│  • Important meeting        │
│  • Sign contract            │
│  • Team event               │
│  • Personal shopping        │
│  • Start new project        │
│                             │
├─────────────────────────────┤
│                             │
│  DECEMBER 2025              │  ← Month view
│  ┌───────────────────────┐ │
│  │ Su Mo Tu We Th Fr Sa  │ │
│  │     1  2  3  4  5  6  │ │
│  │  7  8  9 10 11 12 13  │ │
│  │ 14 15 16 17 18 19 20  │ │
│  │ 21 22 23 24 25 26 🟢27│ │  ← Color-coded dots
│  │ 28 29 30 31           │ │     🟢 Green = Optimal
│  └───────────────────────┘ │     🟡 Yellow = Viable
│                             │     🔴 Red = Challenging
│  Lunar Phase: 🌒 → 🌓 → 🌔  │  ← Lunar cycle overlay
│                             │
└─────────────────────────────┘
│  [Today] [Calendar] [Log]  │
└─────────────────────────────┘
```

**Features**:
- Activity-based queries (contextual advice)
- Color-coded calendar (green/yellow/red dots)
- Lunar cycle overlay on modern calendar
- Tap date for detailed energy breakdown

### 4. Journal/Log Page

**Purpose**: Private note-taking for pattern recognition

**Layout**:

```
┌─────────────────────────────┐
│  Personal Log            [+]│  ← Header with add button
├─────────────────────────────┤
│                             │
│  TODAY - December 27        │
│  ┌─────────────────────┐   │
│  │ How was your focus? │   │  ← Smart prompts
│  │ ┌─────────────────┐ │   │
│  │ │ [Text input]    │ │   │
│  │ └─────────────────┘ │   │
│  │                     │   │
│  │ Any significant     │   │
│  │ interactions?       │   │
│  │ ┌─────────────────┐ │   │
│  │ │ [Text input]    │ │   │
│  │ └─────────────────┘ │   │
│  │                     │   │
│  │ Mood: 😊 😐 😔      │   │  ← Quick mood selector
│  │                     │   │
│  │ [Save Note]         │   │
│  └─────────────────────┘   │
│                             │
│  RECENT ENTRIES             │
│  ┌─────────────────────┐   │
│  │ Dec 26 - Felt...    │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ Dec 25 - Great...   │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
│  [Today] [Calendar] [Log]  │
└─────────────────────────────┘
```

**Features**:
- Daily note entry with smart prompts
- Mood tracking (optional)
- Menstrual cycle tracking (for women, optional)
- Calendar view of past entries
- Local storage only (privacy)

### 5. Settings/Profile Page

**Purpose**: Manage profile, preferences, and upgrade

**Accessed via**: Gear icon in Today page header

**Layout**:

```
┌─────────────────────────────┐
│  Settings                [×]│
├─────────────────────────────┤
│                             │
│  PROFILE                    │
│  ┌─────────────────────┐   │
│  │ Name: John Doe      │   │
│  │ Born: Jan 1, 1990   │   │
│  │ Place: New York, NY │   │
│  │ [Edit Profile]      │   │
│  └─────────────────────┘   │
│                             │
│  PREFERENCES                │
│  • Notifications            │
│  • Theme (Light/Dark)       │
│  • Language                 │
│                             │
│  SUBSCRIPTION               │
│  ┌─────────────────────┐   │
│  │ Current: Free       │   │
│  │                     │   │
│  │ Upgrade to Pro      │   │
│  │ • Deep insights     │   │
│  │ • Pattern analysis  │   │
│  │ • Advanced guidance │   │
│  │                     │   │
│  │ [Learn More]        │   │
│  └─────────────────────┘   │
│                             │
│  ABOUT                      │
│  • Privacy Policy           │
│  • Terms of Service         │
│  • Version 1.0              │
│                             │
└─────────────────────────────┘
```

---

## Visual Design System

### Color Palette

**Primary Colors** (Professional, calming):
- **Primary**: Deep teal/blue (#0A7EA4) - Trust, depth, wisdom
- **Background**: White (#FFFFFF) / Dark gray (#151718)
- **Surface**: Light gray (#F5F5F5) / Darker gray (#1E2022)
- **Foreground**: Dark gray (#11181C) / Light gray (#ECEDEE)

**Energy Indicators**:
- **Green** (#22C55E): Optimal energy, strong alignment
- **Yellow** (#F59E0B): Viable energy, moderate alignment
- **Red** (#EF4444): Challenging energy, careful consideration needed

**Accent Colors** (Subtle, not overwhelming):
- **Success**: Green (#22C55E)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography

- **Headings**: Bold, clear, professional (SF Pro / Roboto)
- **Body**: Regular weight, high readability
- **Data/Numbers**: Slightly larger, medium weight for emphasis

### Visual Elements

- **Energy Gauges**: Simple, clean progress bars or circular indicators
- **Lunar Phase Icons**: Subtle emoji or simple icons (🌑🌒🌓🌔🌕🌖🌗🌘)
- **Calendar Dots**: Small, unobtrusive color indicators
- **Synergy Indicator**: Simple icon (⚡ for strong, ≈ for moderate, ⚠ for challenging)

---

## User Flows

### First-Time User Flow

1. **Launch App** → Welcome Screen
2. **Tap "Get Started"** → Data Collection Screen
3. **Enter Name, DOB, Place of Birth** → Tap "Calculate My Energy"
4. **Processing Screen** (2-3 seconds) → Today Page
5. **User sees their first energy reading**

### Returning User Flow

1. **Launch App** → Directly to Today Page
2. **View today's energy, personal energy, and connection**
3. **Navigate to Calendar or Log as needed**

### Calendar Planning Flow

1. **From Today Page** → Tap "Calendar" tab
2. **Select activity type** (e.g., "Launch new product")
3. **View color-coded calendar** with optimal dates highlighted
4. **Tap specific date** for detailed energy breakdown
5. **Make informed decision** about timing

### Journal Entry Flow

1. **From Today Page** → Tap "Log" tab
2. **View today's entry form** with smart prompts
3. **Add notes, select mood** (optional)
4. **Tap "Save Note"** → Entry stored locally
5. **View past entries** in scrollable list

---

## Free vs. Paid Tier Strategy

### Free Tier (Core Value)

**What's Included**:
- Daily energy readings (Your Energy, Today's Energy, The Connection)
- Basic practical summary ("Good day for X")
- Calendar view with color-coded indicators
- Personal journal with unlimited entries
- Lunar cycle overlay

**What's Limited**:
- Surface-level explanations only
- No deep dive into "why" the energy is the way it is
- No pattern recognition from journal entries
- No advanced psychological insights

### Paid Tier ("Energy Today Pro")

**Upgrade Triggers** (Natural, not pushy):
- After 7 days of use: "Noticed any patterns? Pro unlocks deeper insights."
- When user taps "View Details" on Connection section
- In Settings, under "Subscription" with clear benefits listed

**What's Unlocked**:
- **Deep Dive Analysis**: Detailed breakdown of energy calculations
  - "Your Creative Flow today is driven by Mercury alignment..."
  - "The environment's High Momentum comes from the lunar phase..."
- **Pattern Recognition**: AI analyzes journal entries against energy patterns
  - "We've noticed you log 'high stress' on days with Challenging synergy..."
  - "Your Water element often conflicts with Fire element days. Here's how to balance..."
- **Advanced Guidance**: More introspective, psychological framing
  - Not just what to *do*, but how to *be*
  - Strategies for working with challenging energies
  - Personalized recommendations based on your unique profile

**Pricing** (Suggested):
- Monthly: $9.99
- Annual: $79.99 (save 33%)

---

## Content & Language Examples

### Energy Types (User Energy)

- **Creative Flow**: High imagination, idea generation, artistic expression
- **Focused Execution**: Deep concentration, task completion, analytical work
- **Reflective Pause**: Introspection, planning, rest, consolidation
- **Communicative Energy**: Networking, presentations, negotiations, social interaction
- **Grounded Stability**: Practical tasks, organization, routine, maintenance

### Energy Types (Today's Energy)

- **High Momentum**: Fast-paced, action-oriented, initiating energy
- **Structured Growth**: Methodical progress, building, step-by-step advancement
- **Communicative**: Information exchange, collaboration, connection
- **Transformative**: Change, release, endings and new beginnings
- **Harmonious**: Balance, relationships, beauty, cooperation

### Connection Descriptions (Examples)

**Strong Alignment (Green)**:
> "A day of **High Momentum** aligns beautifully with your **Creative Flow**. This is an excellent time to brainstorm new ideas and initiate projects. Your natural creativity is amplified by today's action-oriented energy. Present your ideas with confidence."

**Moderate Alignment (Yellow)**:
> "Today's **Structured Growth** energy offers a steady backdrop for your **Communicative Energy**. While not the most dynamic combination, it's a solid day for methodical outreach and building relationships step by step. Focus on consistency over flash."

**Challenging Alignment (Red)**:
> "Your **Focused Execution** energy meets today's **Transformative** energy, creating some friction. You may feel pulled between completing tasks and addressing unexpected changes. Prioritize flexibility today. Complete essential work early, then allow space for adaptation."

---

## Technical Considerations

### Data Storage

- **User Profile**: AsyncStorage (local only)
- **Journal Entries**: AsyncStorage with date-based keys
- **Energy Calculations**: Computed on-demand, cached for current day
- **Subscription Status**: AsyncStorage (local flag)

### Energy Calculation Engine

**Backend Systems** (Hidden from user):
1. **Numerology**: Life Path, Destiny Number, Personal Year
2. **Astrology**: Natal chart (Sun, Moon, Rising), current transits
3. **Lunar Cycles**: Current phase, waxing/waning
4. **I-Ching**: Daily hexagram
5. **Wuxing**: Birth element, year element, daily element
6. **Ayurveda**: Dominant dosha, daily balance
7. **Thai Auspicious**: Day of week energy, color associations

**Calculation Flow**:
1. User inputs birth data → Generate natal profile (one-time)
2. Each day at midnight → Calculate daily environmental energy
3. On Today page load → Combine user + environmental energy → Generate "Connection"
4. On Calendar query → Calculate energy for date range + activity type

### Performance

- Calculations should complete in <500ms
- Cache today's energy until midnight
- Lazy load calendar calculations (only when requested)
- Optimize lunar phase calculations (use library)

---

## Success Metrics

### User Engagement
- Daily active users (DAU)
- Return rate after 7 days
- Average session duration

### Feature Adoption
- % users who access Calendar feature
- % users who create journal entries
- % users who explore different activity types in Calendar

### Monetization
- Free-to-paid conversion rate
- Time to first upgrade (days from install)
- Upgrade trigger source (Settings vs. "View Details" vs. notification)

---

## Future Enhancements (Post-Launch)

1. **Notifications**: Daily energy summary at user-selected time
2. **Widgets**: Home screen widget showing today's energy at a glance
3. **Team/Partner Mode**: Compare energy with colleagues or partners (requires backend)
4. **Export**: PDF reports of monthly energy patterns
5. **Integrations**: Calendar app integration (suggest optimal meeting times)
6. **One-on-One Consultations**: (Currently turned off, future feature)

---

## Conclusion

Energy Today is positioned as a sophisticated, practical tool for professionals who want to optimize their timing and decision-making. The app's strength lies in its ability to present deep, multi-system spiritual insights through a clean, business-appropriate interface. The free tier provides genuine value, while the paid tier offers a natural upgrade path for users seeking deeper self-understanding.

The design prioritizes clarity, usability, and subtlety—never overwhelming the user with mystical language or pushy upsells. Instead, it earns trust through consistent, actionable insights that prove their value over time.
