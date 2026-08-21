import { matchFields, type FieldSignal } from "../lib/matching/match";
import { FILL_REQUEST_KEY } from "../lib/messaging";
import type { Profile } from "../lib/storage/types";
import { detectForms, getFormStats } from "../lib/form/detect";
import { highlightFields, clearHighlights } from "../lib/form/highlight";

export type Fillable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface FillResult {
  filled: number;
  skipped: number;
}

const NON_FILLABLE_INPUT_TYPES = new Set([
  "button",
  "submit",
  "reset",
  "hidden",
  "file",
  "image",
  "checkbox",
  "radio",
]);

function isFillable(el: Element): el is Fillable {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLInputElement) return !NON_FILLABLE_INPUT_TYPES.has(el.type);
  return false;
}

function labelTextFor(el: HTMLElement): string | undefined {
  if (el.id) {
    const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (labelEl?.textContent?.trim()) return labelEl.textContent;
  }
  const closestLabel = el.closest("label");
  if (closestLabel?.textContent?.trim()) return closestLabel.textContent;
  const ariaLabelledBy = el.getAttribute("aria-labelledby");
  if (ariaLabelledBy) {
    const referenced = document.getElementById(ariaLabelledBy);
    if (referenced?.textContent?.trim()) return referenced.textContent;
  }
  return undefined;
}

function extractSignals(): { elements: Fillable[]; signals: FieldSignal[] } {
  const allElements = Array.from(document.querySelectorAll("input, select, textarea")).filter(isFillable);
  const elements: Fillable[] = [];
  const signals: FieldSignal[] = [];
  const normalizedSignalCache = new Map<string, FieldSignal>();

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];

    // Skip disabled or hidden elements
    if ((el as HTMLInputElement).disabled || (el as HTMLInputElement).hidden) continue;

    // Skip invisible elements (0 width/height)
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const label = labelTextFor(el);
    const placeholder = "placeholder" in el ? el.placeholder || undefined : undefined;
    const name = el.name || undefined;
    const id = el.id || undefined;
    const ariaLabel = el.getAttribute("aria-label") || undefined;

    // Deduplicate: cache signals by visible properties
    const cacheKey = [label, placeholder, name].filter(Boolean).join("|");
    let signal: FieldSignal;
    if (cacheKey && normalizedSignalCache.has(cacheKey)) {
      signal = normalizedSignalCache.get(cacheKey)!;
    } else {
      signal = { index: signals.length, label, placeholder, name, id, ariaLabel };
      if (cacheKey) normalizedSignalCache.set(cacheKey, signal);
    }

    elements.push(el);
    signals.push(signal);
  }

  return { elements, signals };
}

function applyValue(el: Fillable, value: string): void {
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

async function run(): Promise<FillResult> {
  const stored = await chrome.storage.local.get(FILL_REQUEST_KEY);
  const profile = stored[FILL_REQUEST_KEY] as Profile | undefined;
  const highlightRequest = stored["HIGHLIGHT_FIELDS_KEY"] as boolean | undefined;
  await chrome.storage.local.remove(FILL_REQUEST_KEY);
  await chrome.storage.local.remove("HIGHLIGHT_FIELDS_KEY");

  if (highlightRequest) {
    const forms = detectForms();
    const allFields = forms.flatMap((f) => f.elements);
    highlightFields(allFields);
    return { filled: 0, skipped: 0 };
  }

  if (!profile) return { filled: 0, skipped: 0 };

  // Clear highlights before filling
  clearHighlights();

  const { elements, signals } = extractSignals();
  const matches = matchFields(signals, profile);

  let filled = 0;
  for (const match of matches) {
    // Isolate per-field failures — one bad match must never block the rest.
    try {
      const el = elements[match.index];
      if (el) {
        applyValue(el, match.value);
        filled += 1;
      }
    } catch {
      // Leave this field unfilled; the rest of the batch still proceeds.
    }
  }

  return { filled, skipped: signals.length - filled };
}

// On page load: detect forms and store stats
chrome.storage.local.set({ FORM_DETECTION_STATS: getFormStats() }).catch(() => {
  // Storage error; silently continue
});

run();
