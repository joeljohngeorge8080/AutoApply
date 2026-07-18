# AutoApply — Design Spec

## Problem

People filling out job and student applications repeatedly re-enter the same
personal, contact, education, and work-history information across many
different websites. Browser-provided autofill and third-party autofill
extensions are unreliable because forms are inconsistent: the same piece of
information may be labeled differently across sites (e.g. "DOB" vs "Age" vs
"Birth Date", "Surname" vs "Last Name" vs "Family Name"), and some fields
require deriving a value rather than copying one directly (e.g. computing age
from a stored date of birth).

## Goal

A Chrome browser extension where a user stores their information once, in one
or more named profiles, and can trigger an intelligent autofill on any
application form. The extension matches the form's actual field labels to the
user's stored data — including synonym variants and simple derived values —
and fills only the fields it's confident about, leaving the rest untouched.

## Scope (v1)

- **Browser**: Chrome only, Manifest V3.
- **Profiles**: Multiple named profiles per user (e.g. "Job Search", "Grad
  School"), each with its own full set of data.
- **Storage**: `chrome.storage.local`, unencrypted at rest. Local-only — no
  sync, no server, no account.
- **Trigger**: User-initiated only, via the extension popup. No automatic
  fill on page load.
- **Matching**: Built-in synonym dictionary + heuristic text matching against
  form field labels/placeholders/names/ids/aria-labels. No AI/LLM calls, no
  per-site learning — both explicitly deferred.
- **Transforms**: Common derived-value cases are supported explicitly:
  age-from-date-of-birth, full-name-from-first/last, and date reformatting
  between common formats (e.g. MM/DD/YYYY vs DD/MM/YYYY).
- **Profile schema categories**: Personal, Contact, Education, Work History.
  Free-text essay/short-answer banks are out of scope for v1.
- **Tech stack**: TypeScript + Vite, no UI framework (plain TypeScript/DOM for
  the popup).

## Out of scope for v1

Firefox/cross-browser support, encrypted storage, cross-device sync,
automatic/on-page-load fill, AI/LLM-based field matching, a reusable
essay/short-answer bank, and per-site learned/remembered mappings. These are
candidates for a future version but are explicitly excluded here to keep v1
shippable.

## Architecture

Three cooperating pieces, connected via Chrome's extension messaging:

1. **Storage layer** (`src/lib/storage/`) — a typed wrapper around
   `chrome.storage.local` providing CRUD over an array of `Profile` records.
2. **Popup UI** (`src/popup/`) — the only user-facing surface. Lists profiles,
   supports create/edit/delete, and triggers a fill on the active tab for the
   selected profile.
3. **Matching engine + content script** (`src/lib/matching/`, `src/content/`)
   — injected into the active tab on demand (via
   `chrome.scripting.executeScript`, not a persistent content script) when the
   user clicks "Fill this page". Scans the DOM, matches fields, applies
   values, and reports a filled/skipped summary back to the popup.

The matching engine itself is pure TypeScript with no DOM/browser API
dependency, so it can be unit-tested against fixture data independent of a
real browser page.

## Data model

```ts
interface Profile {
  id: string;
  name: string; // e.g. "Job Search", "Grad School"
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date
    gender?: string;
  };
  contact: {
    email: string;
    phone: string;
    address: { street: string; city: string; state: string; zip: string; country: string };
  };
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    gpa?: string;
    startDate: string;
    endDate: string;
  }>;
  workHistory: Array<{
    employer: string;
    title: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
}
```

## Field matching

1. **Signal extraction**: for each `input`/`select`/`textarea`, collect
   associated `<label>` text, `placeholder`, `name`, `id`, and `aria-label`.
2. **Normalization**: lowercase, strip punctuation and extra whitespace.
3. **Dictionary lookup**: a canonical-field → known-variants map (e.g.
   `dateOfBirth: ["dob", "date of birth", "birth date", "birthdate"]`,
   `lastName: ["last name", "surname", "family name"]`), shipped as a plain
   data file so it can be extended without touching matching logic.
4. **Scoring**: exact normalized match first; fuzzy/substring fallback with a
   confidence threshold. Below-threshold candidates are not filled — a missed
   fill is preferable to a wrong one.
5. **Transforms**: a small registry of named transforms (`ageFromDob`,
   `fullNameFromParts`, `dateReformat`) that a canonical field can be routed
   through instead of a direct copy. A transform that can't produce a value
   (e.g. DOB missing when age is requested) results in that field being
   skipped, not blanked or guessed.
6. **Result**: a list of field matches (element reference, canonical name,
   confidence, resolved value) used both to perform the fill and to report an
   accurate "N filled / M skipped" summary in the popup.

## Fill flow

- User selects a profile in the popup and clicks "Fill this page".
- The popup triggers on-demand script injection into the active tab, passing
  the selected profile's data.
- The injected script extracts signals from the current DOM only, runs
  matching, and fills matched fields by setting the value and dispatching
  `input`/`change` events (so site validation/JS reacts normally).
- The script returns a filled/skipped count, shown in the popup.
- Multi-step form wizards are handled naturally: each click re-scans whatever
  is currently in the DOM, so a later step is matched fresh rather than
  relying on stale state from an earlier step.

## Error handling

- Field matched but the profile value is empty → skip, don't fill blank text.
- Transform can't produce a value → skip.
- No recognizable fields found on the page → popup shows "No fillable fields
  found".
- Any per-field failure is isolated — one bad match never blocks the rest of
  the fill from completing.

## Testing

- **Unit tests (Vitest)** for the matching engine: a fixture set of realistic
  label/placeholder/name combinations, including the DOB/age and
  surname/last-name cases that motivated this project, asserting correct
  canonical matches, confidence behavior, and transform outputs.
- **Manual verification**: build and load the unpacked extension in Chrome,
  then test against 2–3 real application forms (e.g. a Google Form and a real
  job/student application) to confirm end-to-end fill accuracy and correct
  skip behavior on unmatched fields.
