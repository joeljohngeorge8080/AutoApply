# AutoApply

A Chrome extension (Manifest V3) that fills job and student application forms from profiles you store once. Everything stays on your machine: no account, no server, no sync.

## How it works

1. Create one or more named profiles in the popup (personal, contact, education, work history).
2. Open an application form and click the AutoApply icon.
3. Pick a profile and click **Fill this page**. The popup reports how many fields were filled and skipped.

Filling only happens when you click. Nothing runs on page load.

### What gets filled

- Field labels, placeholders, names, ids and aria-labels are matched against a built-in synonym dictionary (`Surname` / `Last Name` / `Family Name`, `DOB` / `Birth Date`, ...). Anything below the confidence threshold or ambiguous is left alone: a missed fill beats a wrong one.
- Some values are derived: age from date of birth, full name from first + last, initials, years of experience, full address.
- Dates follow the field: a text field with a `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD` or `MM/YYYY` hint gets that format; native date inputs and fields with no hint get `YYYY-MM-DD`.
- Fields that already contain text are never overwritten. Hidden, disabled and invisible fields are skipped. Selects are filled only when exactly one option matches.
- A profile can hold several education and job entries. Forms are filled from the **last** entry in each list; use the ↑ / ↓ buttons in the editor to choose which one that is.

## Develop

```bash
npm install
npm run build      # typecheck + build popup and content script into dist/
npm test           # vitest unit tests
```

Load it in Chrome: `chrome://extensions` -> enable Developer mode -> **Load unpacked** -> select `dist/`.

`npm run dev` rebuilds the popup on change (the content script is built separately by `npm run build`).

## Layout

| Path | What it holds |
|---|---|
| `src/lib/matching/` | Pure matching engine: dictionary, scoring, transforms. No DOM access. |
| `src/lib/form/` | DOM helpers: applying values, form detection, highlighting. |
| `src/lib/storage/` | Typed wrapper over `chrome.storage.local`, the `Profile` type, list helpers. |
| `src/content/fill.ts` | Content script injected on demand by the popup. |
| `src/popup/` | The popup UI (plain TypeScript, no framework). |

## Known limits

- Chrome only. No AI matching, no per-site learning, no essay bank.
- Profiles are stored unencrypted in `chrome.storage.local` (see `PRIVACY.md`).
- Only fields with a recognizable label, placeholder, name, id or aria-label can be matched.
- Fields inside iframes or shadow DOM are not reached.

See `plan.md` for the manual test checklist.
