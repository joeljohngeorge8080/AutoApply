# AutoApply E2E Testing Plan

## Status
- ✅ Build complete: npm run build
- ✅ Unit tests: 22/22 passing
- ⏳ Next: Manual end-to-end testing in Chrome

## Steps to Test AutoApply Extension

### 1. Load Extension into Chrome
- Open `chrome://extensions` in your browser
- Toggle **Developer mode** (top right corner)
- Click **Load unpacked**
- Select the `/dist/` folder from this repo
- The AutoApply icon should appear in your extension toolbar

### 2. Create a Test Profile
- Click the AutoApply icon
- Click "Create Profile"
- Fill in sample data:
  - Name: John Doe
  - Email: john@example.com
  - Phone: 555-123-4567
  - Date of Birth: 1990-01-15 (or any valid date)
- Save the profile

### 3. Test on a Real Application Form
- Navigate to a job application form (e.g., LinkedIn jobs, Indeed, any web form with standard fields)
- Click the AutoApply extension icon
- Select your test profile from the dropdown
- Click **Fill this page**
- The extension will:
  - Scan the form for matching fields
  - Fill detected fields with profile data
  - Display a summary of filled vs. skipped fields

### 4. Verify Behavior
- ✅ Check that relevant fields were filled (name, email, phone, etc.)
- ✅ Check that irrelevant fields were skipped
- ✅ Verify the filled/skipped summary is accurate
- ✅ Confirm form validation still works (if page has JS validation)

### 5. Edge Cases to Test
- Multi-step forms: Does the extension fill step 1 correctly?
- Dropdown/select fields: Are select options being populated?
- Hidden fields: Are they being skipped correctly?
- Duplicate field labels: Are matches correct or ambiguous?
- Pre-filled fields: Does the extension overwrite them?

## Known Limitations
- Extension only works on pages where fields have accessible name/id/placeholder attributes
- No AI-based matching; only synonym dictionary and fuzzy token matching
- Profile data is stored locally in browser storage; no cloud sync

## Troubleshooting
- Extension icon not appearing? Check that `dist/manifest.json` exists and is valid
- No fields being filled? Check the browser console (F12) for errors
- Form not working after fill? Check that event dispatch is triggering validation correctly
