# AutoApply E2E Testing Plan

## Status
- ✅ Build: `npm run build`
- ✅ Unit tests: `npm test` (76 passing)
- ✅ Scripted browser run (headless Chromium, unpacked extension, local test form): popup profile editing with multiple entries, fill, date formats, no-overwrite, hidden/unknown fields. 21/21 checks.
- ⏳ Remaining: manual pass on real application sites (below). This needs a person with a real browser session.

## Load the extension
1. `npm run build`
2. `chrome://extensions` -> Developer mode -> **Load unpacked** -> select `dist/`.

No `host_permissions` are needed: the popup is opened from the toolbar icon, which grants `activeTab` for the injection.

## Manual checklist (real sites)
Try at least a Google Form and one real job or student application.

### Setup
- [ ] Create a profile with all personal/contact fields, **two** education entries and **two** jobs (give each a start and end date).
- [ ] Use the ↑ / ↓ buttons so the entry you want used is last. Save, reopen, confirm order and contents survived.

### Fill
- [ ] "Fill this page" reports a sensible filled/skipped count.
- [ ] Name, email, phone, address fields are filled correctly.
- [ ] Education / employer fields come from the **last** entry in each list.
- [ ] A text date field with a `DD/MM/YYYY` or `MM/DD/YYYY` placeholder gets that format; a native date picker gets a valid date.
- [ ] Fields you typed in beforehand are not overwritten. Clicking Fill twice changes nothing the second time.
- [ ] Unrecognized questions (free text, essays, checkboxes, radios) are left empty.
- [ ] Dropdowns: filled only when the option clearly matches (e.g. country, state); otherwise left alone.
- [ ] Site validation reacts normally after fill (errors clear, Submit enables). Check React/Vue-based forms in particular.
- [ ] Multi-step form: fill step 1, go to step 2, fill again.

### Other
- [ ] "Highlight fields" outlines the fillable fields and Fill clears the outlines.
- [ ] On `chrome://` or the Web Store, the popup shows the "restricted page" message instead of failing silently.
- [ ] Deleting a profile removes it from both the list and the fill dropdown.

## Known limitations
- Only fields with an accessible label, placeholder, name, id or aria-label can be matched.
- No AI-based matching; synonym dictionary and fuzzy token matching only.
- Fields inside iframes and shadow DOM are not reached.
- Unlisted synonyms (e.g. "Birthday") are not matched; add them to `src/lib/matching/dictionary.ts`.
- Profile data is stored locally and unencrypted; there is no sync.

## Troubleshooting
- Extension icon not appearing? Check that `dist/manifest.json` exists and is valid.
- No fields filled? Open the page console (F12) and check for errors; use "Highlight fields" to see what the extension detects.
- Form still shows validation errors after fill? The site may need real keystrokes; report the site so the event handling can be extended.
