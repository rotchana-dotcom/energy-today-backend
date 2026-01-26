# Screenshot Capture Guide for Google Play Store

Google Play requires 2-8 screenshots showing your app's key features.

---

## Screenshot Requirements

**Dimensions:** 1080 x 1920 pixels (9:16 portrait ratio)
**Format:** PNG or JPEG
**Max file size:** 8MB each
**Minimum:** 2 screenshots
**Maximum:** 8 screenshots

---

## Recommended Screenshots (in order)

1. **Onboarding/Welcome** - First impression
2. **Today Screen** - Main feature with energy score
3. **Calendar View** - Monthly energy forecast
4. **Journal Screen** - Mood tracking and notes
5. **Personal Profile** - Energy patterns analysis
6. **Settings** - Features overview

---

## Method 1: Capture from Web Preview (Easiest)

### Step 1: Open Web Preview
```bash
cd /home/ubuntu/energy_today
npm run dev
```

Open in browser: https://8081-iebyuj7gg1or92u2q5mbz-886d685b.sg1.manus.computer

### Step 2: Set Mobile Viewport
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Click "Toggle Device Toolbar" (phone icon)
3. Select device: **Pixel 5** or **iPhone 12 Pro**
4. Set dimensions: **1080 x 1920**

### Step 3: Navigate and Capture
1. Navigate to each screen
2. Take screenshot (browser's screenshot tool or OS screenshot)
3. Crop to exact 1080x1920 if needed

---

## Method 2: Capture from Android Device

### Step 1: Install on Device
```bash
# Build development APK
eas build --platform android --profile preview

# Or use Expo Go
# Scan QR code from: npm run dev
```

### Step 2: Capture Screenshots
1. Navigate to each screen
2. Take screenshot (Power + Volume Down)
3. Screenshots saved to device gallery

### Step 3: Transfer to Computer
- Use USB cable and file transfer
- Or upload to Google Photos and download

---

## Method 3: Use Android Emulator

### Step 1: Start Emulator
```bash
# In Android Studio
# Tools → Device Manager → Create Virtual Device
# Select: Pixel 5 (1080 x 2340)
```

### Step 2: Run App
```bash
npm run android
```

### Step 3: Capture
- Click camera icon in emulator toolbar
- Screenshots saved to: `~/Desktop/` or emulator's screenshots folder

---

## Screenshot Checklist

For each screenshot, ensure:

- [ ] Dimensions are exactly 1080 x 1920 pixels
- [ ] No personal data visible (use demo account)
- [ ] UI is fully loaded (no loading spinners)
- [ ] Status bar shows good signal/battery (optional: hide status bar)
- [ ] Text is readable
- [ ] Colors look good
- [ ] No debug overlays or development warnings

---

## Editing Screenshots (Optional)

### Add Device Frame
Use **Figma** or **Canva** to add phone frame around screenshots for better presentation.

### Add Captions
Add text overlays to highlight features:
- "Track Daily Energy"
- "Plan Ahead with Forecasts"
- "Journal Your Experiences"

### Tools
- **Figma** (free): https://figma.com
- **Canva** (free): https://canva.com
- **Photopea** (free, browser-based): https://photopea.com

---

## Quick Screenshot Script

Save this as `capture-screenshots.sh`:

```bash
#!/bin/bash

# Open web preview in Chrome with mobile viewport
open -a "Google Chrome" "https://8081-iebyuj7gg1or92u2q5mbz-886d685b.sg1.manus.computer"

echo "📱 Screenshot Capture Guide"
echo ""
echo "1. Open DevTools (Cmd+Option+I)"
echo "2. Toggle Device Toolbar (Cmd+Shift+M)"
echo "3. Select 'Pixel 5' or set custom: 1080 x 1920"
echo "4. Navigate to these screens and capture:"
echo ""
echo "   ✓ Onboarding (Get Started screen)"
echo "   ✓ Today (Main energy score)"
echo "   ✓ Calendar (Monthly view)"
echo "   ✓ Journal (Log screen)"
echo "   ✓ Profile (Settings → Personal Energy Profile)"
echo "   ✓ Settings (Main settings screen)"
echo ""
echo "5. Use browser's screenshot tool or Cmd+Shift+4"
echo "6. Save to: ./play-store-assets/screenshots/"
echo ""
```

---

## Organizing Screenshots

Create folder structure:
```bash
mkdir -p play-store-assets/screenshots
```

Name files clearly:
```
01-onboarding.png
02-today-screen.png
03-calendar-view.png
04-journal-screen.png
05-personal-profile.png
06-settings.png
```

---

## Upload to Play Console

1. Go to: Google Play Console → Your App → Store Presence → Main Store Listing
2. Scroll to "Phone screenshots"
3. Click "Add screenshots"
4. Upload 2-8 images
5. Drag to reorder (first screenshot is most important)
6. Click "Save"

---

## Pro Tips

✓ **First screenshot is crucial** - Show the most compelling feature
✓ **Show real data** - Use realistic energy scores and journal entries (not lorem ipsum)
✓ **Variety** - Show different screens, not multiple views of the same screen
✓ **Clean UI** - No error messages, loading states, or empty states
✓ **Consistent** - All screenshots should have same device frame/style
✓ **Localized** - If supporting multiple languages, provide screenshots for each

---

## Example Screenshot Order

**Best practice order for Energy Today:**

1. **Today Screen** (Energy score 75, "Creative Flow", green alignment)
   - Shows main value proposition immediately
   
2. **Calendar View** (Monthly view with color-coded days)
   - Demonstrates planning capability
   
3. **Personal Profile** (Day born analysis, life patterns)
   - Shows depth of personalization
   
4. **Journal Screen** (Entry with mood and voice note)
   - Demonstrates tracking and reflection
   
5. **Forecast Screen** (7-day energy forecast)
   - Shows future planning feature
   
6. **Settings** (Feature list and Pro upgrade)
   - Overview of all capabilities

---

Need help? Check the web preview and use browser DevTools to capture screenshots easily!
