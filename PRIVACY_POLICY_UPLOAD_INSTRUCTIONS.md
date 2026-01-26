# Privacy Policy Upload Instructions

Follow these steps to add the Energy Today privacy policy to your kea.today website.

---

## Step 1: Upload the HTML File

You have two options:

### Option A: Upload as Standalone Page

1. Take the file `privacy-policy.html` from this project
2. Upload it to your kea.today hosting
3. Make it accessible at: `https://kea.today/energy-today-privacy`

**Example paths depending on your hosting:**
- If using a static site: `/energy-today-privacy.html` or `/energy-today-privacy/index.html`
- If using WordPress: Create new page, paste HTML content, set permalink to `/energy-today-privacy`
- If using custom hosting: Place in public directory as `energy-today-privacy.html`

### Option B: Add to Existing Page

If you prefer to add it as a section on kea.today:

1. Copy the content from `privacy-policy.html` (the `<div class="container">` section)
2. Paste it into your existing kea.today page
3. Ensure the URL is: `https://kea.today/energy-today-privacy` or `https://kea.today#energy-today-privacy`

---

## Step 2: Customize Contact Information

Before uploading, update these placeholders in `privacy-policy.html`:

**Line ~160 (in the Contact Us section):**

```html
<p><strong>Email:</strong> [Your email address]</p>
<p><strong>Website:</strong> <a href="https://kea.today">https://kea.today</a></p>
<p><strong>Developer:</strong> [Your name or company name]</p>
```

**Replace with your actual information:**

```html
<p><strong>Email:</strong> support@kea.today</p>
<p><strong>Website:</strong> <a href="https://kea.today">https://kea.today</a></p>
<p><strong>Developer:</strong> Your Name / Your Company</p>
```

---

## Step 3: Verify the URL Works

After uploading:

1. Open your browser
2. Go to: `https://kea.today/energy-today-privacy`
3. Verify the page loads correctly
4. Check that all sections are visible
5. Test on mobile to ensure responsive design works

---

## Step 4: Update Google Play Console

Once the privacy policy is live:

1. Login to Google Play Console
2. Go to your app → **Store Presence** → **Main Store Listing**
3. Scroll to **Privacy Policy**
4. Enter: `https://kea.today/energy-today-privacy`
5. Click **Save**

**Note:** Google will verify this URL is accessible before approving your app.

---

## Alternative: Use the Markdown Version

If you prefer to integrate with a Markdown-based site (like Jekyll, Hugo, or GitHub Pages):

1. Use `PRIVACY_POLICY.md` instead
2. Add frontmatter if needed:
   ```yaml
   ---
   title: Privacy Policy - Energy Today
   permalink: /energy-today-privacy
   ---
   ```
3. Build and deploy your site
4. Verify the URL works

---

## Troubleshooting

### URL Returns 404

- Check file path and naming
- Ensure file is in public/accessible directory
- Clear browser cache and try again
- Check hosting provider's documentation for correct path structure

### Styling Looks Broken

- Ensure you uploaded the complete HTML file including `<style>` section
- If integrating into existing site, you may need to adjust CSS to match your site's theme

### Google Play Rejects Privacy Policy

Common reasons:
- URL not accessible (returns 404 or requires login)
- Content doesn't match app's data practices
- Missing required sections (what data is collected, how it's used, etc.)

**Solution:** Ensure the URL is publicly accessible and all sections are complete.

---

## Privacy Policy Requirements Checklist

Your privacy policy must include:

- [x] What data is collected
- [x] How data is stored
- [x] Whether data is shared with third parties
- [x] How users can delete their data
- [x] Contact information for privacy questions
- [x] Last updated date

All requirements are met in the provided `privacy-policy.html` file.

---

## Next Steps After Upload

Once your privacy policy is live at `https://kea.today/energy-today-privacy`:

1. ✅ Privacy policy URL is ready
2. 📸 Capture app screenshots (see `SCREENSHOT_GUIDE.md`)
3. 🏗️ Build production AAB: `./build-for-play-store.sh`
4. 📤 Upload to Google Play Console
5. ✅ Submit for review

---

## Need Help?

If you're having trouble uploading to kea.today:

1. Check your hosting provider's documentation
2. Look for "upload files" or "add page" options
3. Contact your hosting support if needed

The privacy policy file is ready to use - you just need to make it accessible at the specified URL.

---

**Quick Reference:**

- **File to upload:** `privacy-policy.html`
- **Target URL:** `https://kea.today/energy-today-privacy`
- **What to customize:** Email, developer name (in Contact Us section)
- **When to verify:** Before building production AAB
